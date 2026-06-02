import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext.jsx";
import { PageShell } from "../components/layout/PageShell.jsx";
import { Search, Send, User, MessageSquare, MoreVertical, Phone, Video, X, UserCheck } from "lucide-react";
import { supabase } from "../services/integrations.js";

function formatTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  return date.toLocaleDateString();
}

export default function MessagesPage() {
  const { session, showToast } = useApp();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    
    // Subscribe to new conversations
    const convSubscription = supabase
      .channel("conversations")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => {
      convSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
      
      // Subscribe to new messages for THIS conversation
      const msgSubscription = supabase
        .channel(`messages:${activeConversation.id}`)
        .on("postgres_changes", { 
          event: "INSERT", 
          schema: "public", 
          table: "messages",
          filter: `conversation_id=eq.${activeConversation.id}`
        }, (payload) => {
          setMessages((current) => [...current, payload.new]);
          scrollToBottom();
        })
        .subscribe();

      return () => {
        msgSubscription.unsubscribe();
      };
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select(`
        *,
        parent:profiles!parent_id(id, full_name, email, avatar_url)
      `)
      .eq("teacher_id", session.userId)
      .order("updated_at", { ascending: false });

    if (error) console.error("Error fetching conversations:", error);
    else setConversations(data || []);
    setLoading(false);
  };

  const fetchMessages = async (conversationId) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) console.error("Error fetching messages:", error);
    else setMessages(data || []);
  };

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .eq("role", "parent")
      .or(`full_name.ilike.%${term}%,email.ilike.%${term}%`)
      .limit(5);

    if (!error) setSearchResults(data || []);
  };

  const startOrSelectConversation = async (parent) => {
    if (!session?.userId) {
      showToast("Session error: User ID missing");
      return;
    }

    setSearchTerm("");
    setSearchResults([]);

    console.log("[Chat] Starting conversation with parent:", parent.id, "from teacher:", session.userId);

    // Check if conversation exists
    const existing = conversations.find(c => c.parent_id === parent.id);
    if (existing) {
      setActiveConversation(existing);
      return;
    }

    try {
      // Create new conversation
      const { data, error } = await supabase
        .from("conversations")
        .upsert({ 
          teacher_id: session.userId, 
          parent_id: parent.id,
          updated_at: new Date().toISOString()
        }, { onConflict: "teacher_id,parent_id" })
        .select(`
          *,
          parent:profiles!parent_id(id, full_name, email, avatar_url)
        `)
        .single();

      if (error) {
        console.error("[Chat] Upsert error:", error);
        throw error;
      }
      
      setConversations(current => [data, ...current]);
      setActiveConversation(data);
    } catch (error) {
      showToast(`Error starting conversation: ${error.message || "Permission denied"}`);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || sending) return;

    const content = newMessage.trim();
    setNewMessage("");
    setSending(true);

    try {
      const { data: sentMsg, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: activeConversation.id,
          sender_id: session.userId,
          content: content
        })
        .select()
        .single();

      if (error) throw error;

      // Update local message state immediately for better UX
      setMessages((current) => {
        if (current.some(m => m.id === sentMsg.id)) return current;
        return [...current, sentMsg];
      });

      // Update conversation list local state (last message/time)
      setConversations(current => 
        current.map(c => 
          c.id === activeConversation.id 
            ? { ...c, last_message: content, updated_at: new Date().toISOString() }
            : c
        ).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      );

      // Sync to DB
      await supabase
        .from("conversations")
        .update({ 
          last_message: content, 
          updated_at: new Date().toISOString() 
        })
        .eq("id", activeConversation.id);

    } catch (error) {
      showToast("Failed to send message");
      console.error(error);
    } finally {
      setSending(false);
      scrollToBottom();
    }
  };

  return (
    <PageShell title="Messages" subtitle="Chat with parents and coordinate learning.">
      <div className="messenger-container">
        {/* Sidebar */}
        <div className="messenger-sidebar">
          <div className="messenger-search">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search parents..." 
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            
            {searchResults.length > 0 && (
              <div className="messenger-search-results">
                {searchResults.map(parent => (
                  <div 
                    key={parent.id} 
                    className="search-result-item"
                    onClick={() => startOrSelectConversation(parent)}
                  >
                    <div className="avatar">{parent.full_name[0].toUpperCase()}</div>
                    <div className="info">
                      <p className="name">{parent.full_name}</p>
                      <p className="email">{parent.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="conversations-list">
            {conversations.length === 0 && !loading && (
              <div className="empty-state-messenger">
                <MessageSquare size={48} className="muted" />
                <p>No conversations yet</p>
                <span>Search for a parent to start chatting</span>
              </div>
            )}
            
            {conversations.map(conv => (
              <div 
                key={conv.id} 
                className={`conversation-item ${activeConversation?.id === conv.id ? 'active' : ''}`}
                onClick={() => setActiveConversation(conv)}
              >
                <div className="avatar">
                  {conv.parent.full_name[0].toUpperCase()}
                </div>
                <div className="conv-info">
                  <div className="conv-header">
                    <p className="name">{conv.parent.full_name}</p>
                    <span className="time">
                      {conv.updated_at && formatTime(conv.updated_at)}
                    </span>
                  </div>
                  <p className="last-msg">{conv.last_message || "Start a conversation"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="messenger-main">
          {activeConversation ? (
            <>
              <div className="chat-header">
                <div className="user-info">
                  <div className="avatar">{activeConversation.parent.full_name[0].toUpperCase()}</div>
                  <div>
                    <p className="name">{activeConversation.parent.full_name}</p>
                    <span className="status">Active now</span>
                  </div>
                </div>
                <div className="header-actions">
                  <button className="icon-button"><Phone size={20} /></button>
                  <button className="icon-button"><Video size={20} /></button>
                  <button className="icon-button"><MoreVertical size={20} /></button>
                </div>
              </div>

              <div className="chat-messages">
                {messages.map((msg, idx) => {
                  const isOwn = msg.sender_id === session.userId;
                  return (
                    <div key={msg.id || idx} className={`message-row ${isOwn ? 'own' : 'other'}`}>
                      {!isOwn && (
                        <div className="msg-avatar">
                          {activeConversation.parent.full_name[0].toUpperCase()}
                        </div>
                      )}
                      <div className="message-bubble">
                        <p>{msg.content}</p>
                        <span className="msg-time">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form className="chat-input" onSubmit={sendMessage}>
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" disabled={!newMessage.trim() || sending}>
                  <Send size={20} />
                </button>
              </form>
            </>
          ) : (
            <div className="messenger-placeholder">
              <div className="placeholder-content">
                <MessageSquare size={64} className="accent-icon" />
                <h2>Your Messages</h2>
                <p>Select a conversation from the list or search for a parent to start chatting.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .messenger-container {
          display: flex;
          height: calc(100vh - 200px);
          background: var(--bg);
          border: 1px solid var(--border-soft);
          border-radius: var(--radius-lg);
          overflow: hidden;
          margin-top: 1rem;
        }

        .messenger-sidebar {
          width: 360px;
          border-right: 1px solid var(--border-soft);
          display: flex;
          flex-direction: column;
          background: var(--bg);
        }

        .messenger-search {
          padding: 1rem;
          position: relative;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-input-wrapper input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border-radius: 20px;
          border: 1px solid var(--border);
          background: var(--bg-secondary);
          font-size: 0.9rem;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          color: var(--text-secondary);
        }

        .messenger-search-results {
          position: absolute;
          top: 100%;
          left: 1rem;
          right: 1rem;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          z-index: 10;
          margin-top: 4px;
        }

        .search-result-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .search-result-item:hover {
          background: var(--bg-secondary);
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--accent);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          flex-shrink: 0;
        }

        .search-result-item .name {
          font-weight: 600;
          margin: 0;
          font-size: 0.9rem;
        }

        .search-result-item .email {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .conversations-list {
          flex: 1;
          overflow-y: auto;
        }

        .conversation-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .conversation-item:hover {
          background: var(--bg-secondary);
        }

        .conversation-item.active {
          background: var(--accent-soft);
        }

        .conv-info {
          flex: 1;
          min-width: 0;
        }

        .conv-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 2px;
        }

        .conv-header .name {
          font-weight: 600;
          margin: 0;
          font-size: 0.95rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .conv-header .time {
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        .last-msg {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .messenger-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: var(--bg);
        }

        .chat-header {
          padding: 0.75rem 1.5rem;
          border-bottom: 1px solid var(--border-soft);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chat-header .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .chat-header .name {
          font-weight: 700;
          margin: 0;
        }

        .chat-header .status {
          font-size: 0.75rem;
          color: var(--text-success);
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .message-row {
          display: flex;
          gap: 0.75rem;
          max-width: 70%;
        }

        .message-row.own {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .message-row.other {
          align-self: flex-start;
        }

        .msg-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: bold;
          align-self: flex-end;
        }

        .message-bubble {
          padding: 0.75rem 1rem;
          border-radius: 18px;
          position: relative;
        }

        .own .message-bubble {
          background: var(--accent);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .other .message-bubble {
          background: var(--bg-secondary);
          color: var(--text);
          border-bottom-left-radius: 4px;
        }

        .message-bubble p {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.4;
        }

        .msg-time {
          font-size: 0.65rem;
          opacity: 0.7;
          display: block;
          margin-top: 4px;
          text-align: right;
        }

        .chat-input {
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--border-soft);
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .chat-input input {
          flex: 1;
          padding: 0.75rem 1.25rem;
          border-radius: 24px;
          border: 1px solid var(--border);
          background: var(--bg-secondary);
          outline: none;
        }

        .chat-input button {
          background: none;
          border: none;
          color: var(--accent);
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }

        .chat-input button:hover:not(:disabled) {
          transform: scale(1.1);
        }

        .chat-input button:disabled {
          color: var(--text-muted);
          cursor: not-allowed;
        }

        .messenger-placeholder {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .accent-icon {
          color: var(--accent);
          margin-bottom: 1.5rem;
          opacity: 0.5;
        }

        .empty-state-messenger {
          padding: 3rem 1rem;
          text-align: center;
        }

        .empty-state-messenger p {
          margin: 1rem 0 0.25rem;
          font-weight: 600;
        }

        .empty-state-messenger span {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
      `}</style>
    </PageShell>
  );
}

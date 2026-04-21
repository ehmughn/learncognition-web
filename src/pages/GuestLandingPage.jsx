import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Clock3,
  Layers3,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { AppLink } from "../components/ui/AppLink.jsx";
import { Card } from "../components/ui/Card.jsx";
import { MetricStrip } from "../components/ui/MetricStrip.jsx";
import {
  chartBars,
  guestHighlights,
  landingMetrics,
} from "../constants/notifications.js";

const featureCards = [
  {
    icon: ShieldCheck,
    title: "Verification-first access",
    copy: guestHighlights[1],
  },
  {
    icon: BarChart3,
    title: "Clear progress views",
    copy: guestHighlights[0],
  },
  {
    icon: Users,
    title: "Responsive on every screen",
    copy: guestHighlights[2],
  },
  {
    icon: Layers3,
    title: "A cleaner module workspace",
    copy: "Launch, share, and review without the clutter that usually slows a classroom demo down.",
  },
];

const workflowSteps = [
  {
    number: "01",
    title: "Sign in once",
    copy: "Teachers and admins enter through the same verification-aware flow.",
  },
  {
    number: "02",
    title: "Build a module",
    copy: "Start an Identify or Search activity and keep the setup path short and obvious.",
  },
  {
    number: "03",
    title: "Share with code",
    copy: "Use a 10-digit code so students can join without extra manual setup.",
  },
  {
    number: "04",
    title: "Review live progress",
    copy: "Track completion and performance updates as students move through the module.",
  },
];

const sampleQuotes = [
  {
    role: "Teacher preview",
    quote:
      "The layout makes the product easy to explain in a district walkthrough.",
  },
  {
    role: "Admin preview",
    quote:
      "Verification-first access gives the experience a more credible, enterprise feel.",
  },
  {
    role: "Family preview",
    quote:
      "The interface stays readable on mobile while still feeling polished on desktop.",
  },
];

const footerColumns = [
  {
    title: "Explore",
    items: [
      { label: "Features", href: "#features", kind: "anchor" },
      { label: "How it works", href: "#workflow", kind: "anchor" },
      { label: "Testimonials", href: "#testimonials", kind: "anchor" },
    ],
  },
  {
    title: "Access",
    items: [
      { label: "Log in", href: "/login", kind: "route" },
      { label: "Register", href: "/register", kind: "route" },
      { label: "Forgot password", href: "/forgot-password", kind: "route" },
    ],
  },
  {
    title: "Workspace",
    items: [
      { label: "Dashboard", href: "/dashboard", kind: "route" },
      { label: "Create module", href: "/create", kind: "route" },
      { label: "Notifications", href: "/notifications", kind: "route" },
    ],
  },
  {
    title: "Trust",
    items: [
      { label: "School-ready workflow", kind: "text" },
      { label: "Verification flows built in", kind: "text" },
      { label: "Mobile-first presentation", kind: "text" },
    ],
  },
];

export default function GuestLandingPage() {
  return (
    <div className="landing-shell">
      <div className="landing-orb landing-orb-a" />
      <div className="landing-orb landing-orb-b" />

      <div className="landing-frame">
        <header className="landing-topbar">
          <AppLink to="/" className="landing-brand">
            <span className="landing-brand-mark">LC</span>
            <span>
              <strong>LearnCognition</strong>
              <small>School-ready demo platform</small>
            </span>
          </AppLink>

          <nav className="landing-nav" aria-label="Primary">
            <a className="landing-nav-link" href="#features">
              Features
            </a>
            <a className="landing-nav-link" href="#workflow">
              How it works
            </a>
            <a className="landing-nav-link" href="#testimonials">
              Testimonials
            </a>
            <AppLink to="/login" className="landing-nav-link">
              Log in
            </AppLink>
            <AppLink
              to="/register"
              className="button button-primary landing-nav-cta"
            >
              Get started
              <ArrowRight size={16} aria-hidden="true" />
            </AppLink>
          </nav>
        </header>

        <main className="landing-main">
          <section className="landing-hero" aria-labelledby="landing-title">
            <div className="landing-hero-copy">
              <p className="eyebrow landing-eyebrow">
                <Sparkles size={14} aria-hidden="true" />
                Built for classrooms and polished demos
              </p>
              <h1 id="landing-title">
                Learning modules that look ready for a district presentation.
              </h1>
              <p className="landing-hero-subtitle">
                Build Identify and Search activities, share them with a code,
                and keep student progress visible in a cleaner workflow that is
                easier to explain to teachers, families, and administrators.
              </p>

              <div className="hero-actions landing-hero-actions">
                <AppLink to="/register" className="button button-primary">
                  Get started free
                  <ArrowRight size={16} aria-hidden="true" />
                </AppLink>
                <AppLink to="/login" className="button button-secondary">
                  Watch demo
                </AppLink>
              </div>

              <div className="landing-proof-row">
                <div className="landing-proof-item">
                  <BadgeCheck size={16} aria-hidden="true" />
                  <span>Trusted by school teams</span>
                </div>
                <div className="landing-proof-item">
                  <ShieldCheck size={16} aria-hidden="true" />
                  <span>Verification-first access</span>
                </div>
                <div className="landing-proof-item">
                  <Clock3 size={16} aria-hidden="true" />
                  <span>Fast classroom setup</span>
                </div>
              </div>
            </div>

            <div className="landing-hero-visual">
              <Card className="landing-device-card">
                <div className="landing-mockup-shell">
                  <div className="landing-mockup-top" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className="landing-mockup-stage">
                    <div className="landing-phone-panel">
                      <div className="landing-phone-screen">
                        <span className="landing-phone-brand">
                          LearnCognition
                        </span>
                        <strong>Student check-in</strong>
                        <p>
                          Share, review, and verify progress in one clear flow.
                        </p>
                      </div>
                    </div>

                    <div className="landing-dashboard">
                      <div className="landing-dashboard-top">
                        <div>
                          <p className="eyebrow">Teacher dashboard</p>
                          <h3>Live overview</h3>
                        </div>
                        <span className="status-pill accent">Running</span>
                      </div>

                      <div className="landing-bars" aria-hidden="true">
                        {chartBars.map((bar, index) => (
                          <span key={index} style={{ height: `${bar}%` }} />
                        ))}
                      </div>

                      <div className="landing-mini-grid">
                        <div className="landing-mini-card">
                          <strong>10-digit</strong>
                          <span>share code</span>
                        </div>
                        <div className="landing-mini-card">
                          <strong>Live</strong>
                          <span>progress sync</span>
                        </div>
                        <div className="landing-mini-card">
                          <strong>AR + Search</strong>
                          <span>activity modes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="landing-proof-row landing-proof-row--visual">
                  <div className="landing-proof-item">
                    <CheckCircle2 size={16} aria-hidden="true" />
                    <span>District-demo ready</span>
                  </div>
                  <div className="landing-proof-item">
                    <Users size={16} aria-hidden="true" />
                    <span>Teacher and admin roles</span>
                  </div>
                  <div className="landing-proof-item">
                    <BarChart3 size={16} aria-hidden="true" />
                    <span>Live progress views</span>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          <section className="landing-metrics" aria-label="Landing metrics">
            <MetricStrip items={landingMetrics} />
          </section>

          <section className="landing-section" id="features">
            <div className="landing-section-heading">
              <p className="eyebrow">Why schools choose it</p>
              <h2>Designed for faster teacher workflows.</h2>
              <p>
                The interface keeps the structure simple without looking basic,
                so it can stand up in a classroom demo, a parent walkthrough, or
                a district review.
              </p>
            </div>

            <div className="landing-feature-grid">
              {featureCards.map((item) => {
                const Icon = item.icon;
                return (
                  <Card className="landing-feature-card" key={item.title}>
                    <div className="landing-feature-icon" aria-hidden="true">
                      <Icon size={20} />
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.copy}</p>
                  </Card>
                );
              })}
            </div>
          </section>

          <section className="landing-section" id="workflow">
            <div className="landing-section-heading">
              <p className="eyebrow">How it works</p>
              <h2>Four clear steps from login to live progress.</h2>
              <p>
                The full-screen layout keeps the journey obvious, so the demo
                feels immediate instead of overloaded with extra screens.
              </p>
            </div>

            <div className="landing-step-grid">
              {workflowSteps.map((step) => (
                <Card className="landing-step-card" key={step.number}>
                  <span className="landing-step-number">{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </Card>
              ))}
            </div>
          </section>

          <section className="landing-section" id="testimonials">
            <div className="landing-section-heading">
              <p className="eyebrow">Trusted by families</p>
              <h2>Professional enough to present without extra explanation.</h2>
              <p>
                These sample notes reflect the kind of feedback a school team
                wants to hear when the product is being evaluated for rollout.
              </p>
            </div>

            <div className="landing-testimonial-grid">
              {sampleQuotes.map((item) => (
                <Card className="landing-quote-card" key={item.role}>
                  <div className="landing-stars" aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <p className="landing-quote">“{item.quote}”</p>
                  <div className="landing-quote-footer">
                    <div className="landing-quote-author">
                      <strong>{item.role}</strong>
                      <span>Sample feedback</span>
                    </div>
                    <BadgeCheck size={18} aria-hidden="true" />
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section className="landing-cta-band" aria-label="Call to action">
            <div className="landing-section-heading landing-section-heading--center">
              <p className="eyebrow">Ready to protect your family?</p>
              <h2>Join with a demo that feels ready for launch.</h2>
              <p>
                Start with the teacher workflow, explore the public landing
                surface, and keep the whole experience consistent across desktop
                and mobile.
              </p>
            </div>

            <div className="hero-actions landing-cta-actions">
              <AppLink to="/register" className="button button-primary">
                Get started free
                <ArrowRight size={16} aria-hidden="true" />
              </AppLink>
              <AppLink to="/login" className="button button-secondary">
                Log in
              </AppLink>
            </div>
          </section>
        </main>

        <footer className="landing-footer">
          <div className="landing-footer-brand">
            <AppLink to="/" className="landing-brand landing-brand-footer">
              <span className="landing-brand-mark">LC</span>
              <span>
                <strong>LearnCognition</strong>
                <small>Unified classroom demos</small>
              </span>
            </AppLink>
            <p>
              Learning modules for teachers, families, and administrators who
              need a presentation that feels polished from the first click.
            </p>
          </div>

          {footerColumns.map((column) => (
            <div className="landing-footer-links" key={column.title}>
              <h3>{column.title}</h3>
              {column.items.map((item) =>
                item.kind === "route" ? (
                  <AppLink key={item.label} to={item.href}>
                    {item.label}
                  </AppLink>
                ) : item.kind === "anchor" ? (
                  <a key={item.label} href={item.href}>
                    {item.label}
                  </a>
                ) : (
                  <span key={item.label}>{item.label}</span>
                ),
              )}
            </div>
          ))}

          <div className="landing-footer-bottom">
            <span>© 2026 LearnCognition. All rights reserved.</span>
            <span>
              Built for teacher demos, family walkthroughs, and district review.
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

# LearnCognition — Refactored Architecture Guide

## Project Structure

```
src/
├── context/              # React Context & state management
│   └── AppContext.jsx    # App context, hooks, and state utilities
├── pages/                # Page components
│   ├── RouteRenderer.jsx # Route-based page dispatcher
│   ├── GuestLandingPage.jsx
│   ├── StartGuidePage.jsx
│   ├── TeacherHomePage.jsx
│   ├── DashboardPage.jsx
│   ├── CreateModulesPage.jsx
│   ├── ModulesListPage.jsx
│   ├── ProfilePage.jsx
│   ├── SettingsPage.jsx
│   ├── auth/             # Authentication pages
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── VerifyPage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   └── ResetPasswordPage.jsx
│   ├── modules/          # Module-related pages
│   │   ├── ModuleDetailPage.jsx
│   │   ├── ModuleSharePage.jsx
│   │   ├── ModuleEditPage.jsx
│   │   └── ModuleStudentsPage.jsx
│   ├── students/         # Student-related pages
│   │   ├── StudentProfilePage.jsx
│   │   └── StudentRecordsPage.jsx
│   └── NotFoundPage.jsx
├── components/           # Reusable UI components
│   ├── layout/           # Layout components
│   │   ├── PageShell.jsx      # Teacher authenticated layout
│   │   └── GuestShell.jsx     # Guest unauthenticated layout
│   ├── ui/               # Basic UI components
│   │   ├── Button.jsx         # PrimaryButton, SecondaryButton
│   │   ├── Card.jsx           # Card, StatusPill, Field
│   │   ├── FormInputs.jsx     # Input, Select, TextArea
│   │   ├── Modal.jsx          # Modal dialog
│   │   ├── AppLink.jsx        # Navigation link
│   │   └── MetricStrip.jsx    # Metric display
│   └── nav/              # Navigation components (optional)
├── auth/                 # Authentication utilities
│   └── (auth helpers if needed)
├── api/                  # API/data service layer
│   └── (API calls if needed)
├── utils/                # Utility functions
│   ├── storage.js        # localStorage helpers
│   ├── formatting.js     # Date/text formatting
│   ├── routing.js        # URL routing logic
│   └── dataHelpers.js    # Data finder functions
├── constants/            # Static data
│   ├── modules.js        # modulesSeed data
│   ├── students.js       # studentsSeed data
│   └── notifications.js  # notificationsSeed, navigation, landing copy
├── styles/               # Organized CSS
│   ├── index.css         # Master import file
│   ├── base.css          # Tokens, reset, typography
│   ├── layout.css        # Shell, sidebar, topbar layouts
│   ├── components.css    # Buttons, forms, cards, modals
│   ├── charts.css        # Chart visualizations
│   └── responsive.css    # Media queries & breakpoints
├── main.jsx              # React entry point
└── App.jsx               # Main App component
```

## Key Improvements

### 1. **Separation of Concerns**

- ✅ Constants extracted from component code
- ✅ Utility functions in dedicated files
- ✅ Context & hooks isolated
- ✅ Components organized by purpose (layout, ui, nav)

### 2. **CSS Organization**

- ✅ Modular CSS files (base, layout, components, charts, responsive)
- ✅ CSS custom properties (tokens) in one place
- ✅ Easy to maintain and scale
- ✅ Clear media query strategy (900px, 720px, 480px)

### 3. **Routing & Navigation**

- ✅ Centralized route resolution (`resolveRoute`)
- ✅ All routes defined in one utility
- ✅ RouteRenderer dispatches to correct page
- ✅ Easy to add/modify routes

### 4. **State Management**

- ✅ AppContext for global state
- ✅ Custom `usePersistentState` hook for localStorage
- ✅ Clear session, notifications, drafts, tour state
- ✅ `useApp()` hook for consuming context

### 5. **Component Reusability**

- ✅ UI components (`Button`, `Card`, `Modal`, etc.)
- ✅ Layout components (`PageShell`, `GuestShell`)
- ✅ `AppLink` for client-side navigation
- ✅ All components accept className and custom props

## Usage Examples

### Using AppContext in Components

```jsx
import { useApp } from "../context/AppContext.jsx";

export function MyComponent() {
  const { navigate, session, showToast } = useApp();

  return (
    <button onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
  );
}
```

### Using UI Components

```jsx
import { PrimaryButton, Card, Field, Input } from "../components/ui";

export function MyForm() {
  return (
    <Card>
      <Form>
        <Field label="Email">
          <Input type="email" />
        </Field>
        <PrimaryButton>Submit</PrimaryButton>
      </Form>
    </Card>
  );
}
```

### Using Page Shell

```jsx
import { PageShell } from "../components/layout/PageShell.jsx";
import { PrimaryButton } from "../components/ui/Button.jsx";

export function MyPage() {
  const { navigate } = useApp();

  return (
    <PageShell
      eyebrow="Section"
      title="Page Title"
      subtitle="Description"
      actions={
        <PrimaryButton onClick={() => navigate("/next")}>Next</PrimaryButton>
      }
    >
      {/* Page content */}
    </PageShell>
  );
}
```

## CSS Tokens

Key design tokens available in `:root`:

- **Colors**: `--accent`, `--accent-2`, `--text`, `--muted`, `--faint`, `--bg`, `--surface`
- **Spacing**: `--space-xs` through `--space-3xl`
- **Radius**: `--radius`, `--radius-lg`, `--radius-xl`
- **Shadows**: `--shadow-soft`, `--shadow-md`, `--shadow-lg`
- **Transitions**: `--transition-fast`, `--transition-base`, `--transition-slow`

## Adding New Pages

1. Create file in `src/pages/YourPage.jsx`
2. Import `PageShell` or `GuestShell`
3. Use `useApp()` hook for context
4. Add route to `resolveRoute()` in `src/utils/routing.js`
5. Add case to `RouteRenderer` in `src/pages/RouteRenderer.jsx`

## Adding New Components

1. Create file in appropriate subfolder (`ui`, `layout`, `nav`)
2. Export named component
3. Import and use in pages
4. Add CSS classes in appropriate CSS file

## Build & Deploy

```bash
# Build for production
npm run build

# The build output is optimized and ready for deployment
```

All CSS is bundled into a single file with no duplication, and JavaScript is tree-shaken for minimal bundle size.

# Page Migration Helper

## Quick Migration from LearnCognitionApp.jsx

Since there are many pages to migrate, we've provided a bootstrap solution:

## Files Already Migrated

- ✅ GuestLandingPage.jsx
- ✅ StartGuidePage.jsx
- ✅ RouteRenderer.jsx

## Remaining Pages to Create

Copy the following pattern for each page:

```jsx
// Example: LoginPage.jsx
import { useApp } from "../context/AppContext.jsx";
import { GuestShell } from "../components/layout/GuestShell.jsx";
import { PrimaryButton, SecondaryButton } from "../components/ui/Button.jsx";
import { Field } from "../components/ui/Card.jsx";
import { Input, Select } from "../components/ui/FormInputs.jsx";
import { AppLink } from "../components/ui/AppLink.jsx";
import { Card } from "../components/ui/Card.jsx";
import { makeCode } from "../utils/formatting.js";

export default function LoginPage() {
  const { navigate, setSession, setPendingFlow, showToast } = useApp();
  // Copy the component logic from LearnCognitionApp.jsx
  // ... rest of component code
}
```

## Pages To Migrate

### Auth Pages

1. **LoginPage.jsx** - Copy from LearnCognitionApp (search: "function LoginPage")
2. **RegisterPage.jsx** - Copy from LearnCognitionApp
3. **VerifyPage.jsx** - Copy from LearnCognitionApp
4. **ForgotPasswordPage.jsx** - Copy from LearnCognitionApp
5. **ResetPasswordPage.jsx** - Copy from LearnCognitionApp

### Main Pages

6. **TeacherHomePage.jsx** - Copy from LearnCognitionApp
7. **DashboardPage.jsx** - Copy from LearnCognitionApp (includes charts)
8. **CreateModulesPage.jsx** - Copy from LearnCognitionApp
9. **ModulesListPage.jsx** - Copy from LearnCognitionApp
10. **ProfilePage.jsx** - Copy from LearnCognitionApp
11. **SettingsPage.jsx** - Copy from LearnCognitionApp

### Module Pages (in src/pages/modules/)

12. **ModuleDetailPage.jsx** - Copy from LearnCognitionApp
13. **ModuleSharePage.jsx** - Copy from LearnCognitionApp
14. **ModuleEditPage.jsx** - Copy from LearnCognitionApp
15. **ModuleStudentsPage.jsx** - Copy from LearnCognitionApp

### Student Pages (in src/pages/students/)

16. **StudentProfilePage.jsx** - Copy from LearnCognitionApp
17. **StudentRecordsPage.jsx** - Copy from LearnCognitionApp

### Error Page

18. **NotFoundPage.jsx** - Create simple 404 page

## Bootstrap Imports For Testing

For immediate functionality, you can temporarily use this bootstrap approach:

```jsx
// In RouteRenderer.jsx - TEMPORARY
import * as OriginalPages from '../LearnCognitionApp.jsx';

// Then in the switch cases:
case 'login':
  return <OriginalPages.LoginPage />;
```

This allows you to test the new structure while migrating pages incrementally.

## Next Steps

1. Create auth pages first (most isolated)
2. Migrate main pages
3. Then module and student pages
4. Finally delete the old LearnCognitionApp.jsx

Each page should:

- Import from new utils/context/components
- Use `useApp()` hook for global state
- Return either `PageShell` or `GuestShell` wrapped component

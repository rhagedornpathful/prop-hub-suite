# Application Routing Documentation

## Overview
This document explains the routing structure and authentication flow for the application, ensuring users are automatically directed to their role-specific dashboards.

## Authentication Flow

### 1. Initial Access
When users first visit the application:
- Unauthenticated users are redirected to `/auth`
- Authenticated users are redirected to their role-specific dashboard via the `RoleBasedRedirect` component

### 2. Role-Based Dashboard Routing
The application uses the `RoleBasedRedirect` component on the home route (`/`) to automatically route users to their appropriate dashboard based on their role:

| Role | Dashboard Route | Component |
|------|----------------|-----------|
| `admin` | `/admin/overview` | `AdminOverviewPage` |
| `property_manager` | `/property-manager-dashboard` | `PropertyManagerHub` |
| `owner_investor` | `/owner-dashboard` | `PropertyOwnerHub` |
| `tenant` | `/tenant-dashboard` | `TenantHub` |
| `house_watcher` | `/house-watcher-dashboard` | `HouseWatcherHub` |
| `contractor` | `/vendor-portal` | `VendorPortalPage` |
| `leasing_agent` | `/leasing` | `LeasingPage` |
| `client` | `/client-portal` | `ClientDashboard` |

## Key Components

### RoleBasedRedirect (`src/components/RoleBasedRedirect.tsx`)
- **Purpose**: Automatically redirects users from `/` to their role-specific dashboard
- **How it works**:
  1. Waits for auth loading to complete
  2. Checks the user's role from `AuthContext`
  3. Maps the role to the appropriate dashboard route
  4. Performs a replace navigation (doesn't add to browser history)
  5. Shows loading spinner while determining redirect

### ProtectedRoute (`src/components/ProtectedRoute.tsx`)
- **Purpose**: Ensures only authenticated users with proper roles can access protected routes
- **Behavior**:
  - Redirects unauthenticated users to `/auth`
  - Redirects users without roles (new users) to `/setup` if needed
  - Shows loading spinner while checking authentication status
  - Allows the setup page to be accessed without roles

### RoleBasedAccess (`src/components/RoleBasedAccess.tsx`)
- **Purpose**: Wraps individual routes to restrict access based on user roles
- **Behavior**:
  - Checks if user's role is in the `allowedRoles` array
  - Redirects to fallback path or role-specific default if access denied
  - Shows loading state during authentication check

## Route Structure

### Public Routes
- `/auth` - Login/Signup page (accessible to everyone)
- `/setup` - First-time admin setup (accessible during initial setup)

### Protected Routes
All routes below require authentication and are wrapped in `ProtectedRoute`:

#### Home Route
- `/` - Automatically redirects to role-specific dashboard using `RoleBasedRedirect`

#### Dashboard Routes
- `/admin/overview` - Admin dashboard (admin only)
- `/property-manager-dashboard` - Property Manager dashboard (property_manager only)
- `/owner-dashboard` - Property Owner dashboard (owner_investor only)
- `/tenant-dashboard` - Tenant dashboard (tenant only)
- `/house-watcher-dashboard` - House Watcher dashboard (house_watcher only)

#### Feature Routes
All feature routes use `RoleBasedAccess` with appropriate role combinations:
- `/properties` - Property management (admin, property_manager)
- `/tenants` - Tenant management (admin, property_manager)
- `/maintenance` - Maintenance requests (various roles)
- `/finances` - Financial management (admin, property_manager, owner_investor)
- `/messages` - Messaging system (all authenticated users)
- `/vendor-portal` - Vendor interface (contractor)
- `/client-portal/*` - Client portal routes (client)
- etc.

## Login Flow

### User Journey
1. **User visits the app** → `/`
2. **Not authenticated** → Redirected to `/auth`
3. **User logs in successfully** → Redirected to `/`
4. **RoleBasedRedirect activates** → Checks user role
5. **User redirected to role-specific dashboard** → e.g., `/admin/overview` for admin

### Example Flow for Admin
```
User visits → / 
           ↓
    Not authenticated
           ↓
    Redirect to /auth
           ↓
    User enters credentials
           ↓
    Authentication successful
           ↓
    Redirect to /
           ↓
    RoleBasedRedirect detects role: "admin"
           ↓
    Navigate to /admin/overview
           ↓
    Admin Dashboard displayed
```

## Role Hierarchy

The application uses a role hierarchy defined in `AuthContext` to handle users with multiple roles:

1. `house_watcher` (most specific)
2. `tenant`
3. `owner_investor`
4. `contractor`
5. `client`
6. `leasing_agent`
7. `property_manager`
8. `admin` (least specific, most access)

When a user has multiple roles, the system:
1. First checks for a preferred role in localStorage
2. If no preference, uses the role hierarchy to select the most specific role
3. Falls back to the first role if no hierarchy match

## Security Considerations

### Role Storage
- **CRITICAL**: Roles are NEVER stored in localStorage or sessionStorage
- Roles are stored in the `user_roles` table in the database
- The `has_role()` function uses SECURITY DEFINER to bypass RLS recursion
- Client-side role checks are for UX only; server enforces all permissions

### Protected Route Validation
- All protected routes are wrapped in `ProtectedRoute`
- Individual routes use `RoleBasedAccess` for role-specific access control
- Authentication state is managed by Supabase Auth
- Session tokens are validated on every request

## Troubleshooting

### User Not Redirecting After Login
1. Check browser console for AuthContext logs
2. Verify user has a role in the `user_roles` table
3. Ensure the role name matches one in the `RoleBasedRedirect` mapping
4. Clear browser cache and localStorage

### Redirect Loop
1. Verify the target dashboard route exists in `App.tsx`
2. Check that the dashboard component is properly imported
3. Ensure the role-based access wrapper has correct allowed roles
4. Check for emergency bypass flags in development mode

### Access Denied to Dashboard
1. Verify user has the correct role in database
2. Check `RoleBasedAccess` allowedRoles array on the route
3. Confirm RLS policies allow the user to access required data
4. Check browser console for permission errors

## Best Practices

1. **Always use role-based routing**: Never hardcode dashboard URLs in links
2. **Test with all roles**: Ensure each role properly redirects to their dashboard
3. **Handle no-role users**: New users should be directed to setup or profile creation
4. **Maintain consistency**: Keep the role mapping in `RoleBasedRedirect` synchronized with actual routes
5. **Log navigation**: Use console.log in development to track redirect flow
6. **Server-side validation**: Never rely solely on client-side role checks for security

## Future Enhancements

- [ ] Role preference selection in user settings
- [ ] Multi-role switching UI for users with multiple roles
- [ ] Dashboard customization per user
- [ ] Role-based notification preferences
- [ ] Analytics tracking for dashboard usage by role

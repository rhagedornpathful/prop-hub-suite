# Admin Role Switcher

## Overview
The Admin Role Switcher allows administrators to experience the app from the perspective of different user roles without logging in as different users. This is essential for testing, debugging, and understanding the user experience across all roles.

## Features

### 1. **Role Switching Component** (`src/components/RoleSwitcher.tsx`)
- Appears in the sidebar (bottom section)
- Only visible to users with the `admin` role
- Dropdown selector to choose any role:
  - Admin (actual)
  - Property Manager
  - Property Owner
  - Tenant
  - House Watcher
  - Contractor
  - Client
  - Leasing Agent
- Shows current active role with badge
- Quick "X" button to exit role switch mode

### 2. **Visual Indicator** (`src/components/RoleSwitcherBanner.tsx`)
- Banner at the top of pages when in role-switch mode
- Shows: "Admin Mode: You are viewing the app as a [Role]"
- "Exit Role Switch" button for quick return to admin view
- Uses primary color scheme to be clearly visible

### 3. **Auth Context Updates** (`src/contexts/AuthContext.tsx`)
New properties added:
- `actualRole` - The user's real role (always `admin`)
- `activeRole` - The currently active role (switched role or actual role)
- `isRoleSwitched` - Boolean indicating if viewing as another role
- `switchRole(role)` - Function to switch to a different role

### 4. **Persistence**
- Switched role is saved in `localStorage` as `admin_switched_role`
- Role persists across page refreshes
- Automatically cleared on logout

## How to Use

### As an Admin:

1. **Switch to a Role:**
   - Look for "Admin Role Switcher" at the bottom of the sidebar
   - Click the dropdown and select a role
   - The app immediately updates to show that role's view

2. **Notice the Indicators:**
   - Banner at the top shows "Admin Mode: You are viewing as..."
   - Badge in the role switcher shows current role

3. **Exit Role Switch:**
   - Click "Exit Role Switch" in the banner, OR
   - Click the "X" on the badge in the sidebar, OR
   - Select "Admin (Actual)" from the dropdown

### What Changes:
- **Sidebar menu items** - Shows only what that role can access
- **Page access** - Redirects follow role-based rules
- **UI elements** - Role-specific features show/hide appropriately
- **Data filtering** - Uses role-appropriate data queries (via RLS)

## Technical Implementation

### How It Works:

1. **Context Layer:**
   ```typescript
   const { actualRole, activeRole, isRoleSwitched, switchRole } = useAuth();
   ```

2. **All Role Checks Updated:**
   - `AppSidebar` uses `activeRole` instead of `userRole`
   - `RoleBasedAccess` components use `activeRole`
   - Navigation logic uses `activeRole`

3. **Database Security:**
   - RLS policies still check the actual user's ID
   - Only the UI changes - backend security remains intact
   - Admin can see data they have access to, just presented differently

### Security Notes:

- ✅ **Safe**: Only changes UI presentation
- ✅ **Secure**: Cannot bypass RLS policies
- ✅ **Admin-only**: Non-admins cannot access this feature
- ✅ **Persistent**: State saved in localStorage
- ✅ **Reversible**: Easy to exit and return to admin view

## Use Cases

1. **Testing New Features:**
   - Build a feature for property managers
   - Switch to property manager role
   - Test the feature immediately

2. **Debugging User Issues:**
   - User reports issue as tenant
   - Switch to tenant role
   - Experience exactly what they see

3. **Training & Documentation:**
   - Create screenshots for each role
   - Write role-specific guides
   - Understand user workflows

4. **UX Review:**
   - Review navigation for each role
   - Ensure appropriate access levels
   - Verify data visibility rules

## Keyboard Shortcuts

- Currently none - can be added in future if needed

## Future Enhancements

Possible additions:
- [ ] Remember last 3 switched roles for quick access
- [ ] Role comparison mode (split screen)
- [ ] Session recording while in switched role
- [ ] Quick notes/annotations while testing
- [ ] Role-specific checklist for testing

## Troubleshooting

**Issue:** Role switcher doesn't appear
- **Solution:** Make sure you're logged in as an admin

**Issue:** Switched role not persisting
- **Solution:** Check browser localStorage isn't disabled

**Issue:** Can't access certain pages in switched role
- **Solution:** That's correct! Each role has specific access. This is working as intended.

## Code Locations

- **Context**: `src/contexts/AuthContext.tsx`
- **Switcher Component**: `src/components/RoleSwitcher.tsx`
- **Banner Component**: `src/components/RoleSwitcherBanner.tsx`
- **Sidebar Integration**: `src/components/AppSidebar.tsx`
- **App Integration**: `src/App.tsx`

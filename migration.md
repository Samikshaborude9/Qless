# Frontend Migration Guide: Project_final/qless ➔ FinalyrProject/client

This document outlines the detailed plan to migrate the user interface (UI) and design assets from `Project_final/qless` to `FinalyrProject/client`, using the target project's modern dependencies without breaking any backend, socket, or API functionality.

---

## 1. Migration Goals & Constraints

### 🎯 Core Objectives
1. **Identical Visual UI**: Replicate the exact warm green styling, custom layout structures, font selections (e.g., *DM Sans* and *DM Serif Display*), page headers, stats grids, menus, cards, and custom CSS module animations from the `qless` source project.
2. **Preserve Target Dependencies**: Do NOT degrade the dependency versions in `FinalyrProject/client/package.json`. The application must run on **React 19.x**, **React Router v7.x**, **Tailwind CSS v4.x**, and utilize Framer Motion, Redux Toolkit, and Lucide React.
3. **Keep Existing Logic & Functionality**: Maintain all client state management, hooks (such as `useSocket` for live occupancy/order statuses), Axios API client structures, Auth guards (`ProtectedRoute`/`PublicRoute`), and real-time updates without modification.

---

## 2. Directory & Structure Mapping

| Source (`Project_final/qless`) | Target (`FinalyrProject/client`) | Action / Resolution |
| :--- | :--- | :--- |
| `src/components/student/StudentNav.jsx` | `src/components/student/StudentNav.jsx` | **Copy and adapt**. Use custom svg `Icon` and `.module.css`. |
| `src/components/admin/AdminSidebar.jsx` | `src/components/admin/AdminSidebar.jsx` | **Copy and adapt**. Replace existing sidebar. |
| `src/pages/LandingPage.jsx` | `src/pages/Home.jsx` | **Merge UI**. Make `Home.jsx` look identical to `LandingPage.jsx`. |
| `src/pages/LoginPage.jsx` | `src/pages/Login.jsx` | **Adapt UI**. Retain target auth logic but styled exactly like source. |
| `src/pages/SignupPage.jsx` | `src/pages/Register.jsx` | **Adapt UI**. Retain target auth logic but styled exactly like source. |
| `src/pages/student/StudentHome.jsx` | `src/pages/student/Dashboard.jsx` | **Merge**. Incorporate source stats grid, styling, and charts with target occupancy API and Socket listeners. |
| `src/pages/student/StudentMenu.jsx` | `src/pages/student/MenuPage.jsx` | **Merge**. Integrate client cart management/menu API with the source grid UI. |
| `src/pages/student/StudentOrders.jsx` | `src/pages/student/MyOrders.jsx` | **Merge**. Maintain real-time socket-based status updates with the source timeline styling. |
| `src/pages/admin/AdminDashboard.jsx` | `src/pages/admin/AdminDashboard.jsx` | **Copy**. Apply admin dashboards and insights charts. |
| `src/pages/server/ServerDashboard.jsx` | `src/pages/server/ServerDashboard.jsx` | **Merge**. Ensure real-time queue/kitchen displays run correctly. |

---

## 3. Detailed Step-by-Step Migration Plan

### Step 3.1: CSS & Styling Integration

The source project (`qless`) uses **CSS Modules** (`*.module.css`) for layout-specific styles, while the target (`client`) is built on **Tailwind CSS v4.x**. Vite natively supports both side-by-side.

1. **Global Styles & CSS Variables**: 
   Open `FinalyrProject/client/src/index.css` and append the CSS variables and base/utility setups from `Project_final/qless/src/index.css`. Specifically, map the color palette:
   ```css
   :root {
     --green:        #1a6b3a;
     --green-dark:   #145530;
     --green-mid:    #2d9d5c;
     --green-light:  #e6f4ec;
     --green-border: #b8dfc8;
     --bg:           #f7f9f5;
     --bg-warm:      #faf8f4;
     --card:         #ffffff;
     --border:       #e8ede8;
     --text:         #1a2e1a;
     --text-muted:   #6b7280;
     --text-faint:   #9ca3af;
     --red:          #ef4444;
     --amber:        #f59e0b;
     --blue:         #3b82f6;
     --radius-sm:    8px;
     --radius-md:    12px;
     --radius-lg:    16px;
     --radius-xl:    24px;
   }
   ```
2. **Typography**: Ensure google font linkages for `'DM Sans'` and `'DM Serif Display'` are present in the target `index.html` file:
   ```html
   <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet">
   ```
3. **Copy CSS Module Files**: Copy all `*.module.css` files from the source directories into the corresponding target folders next to their JSX component files.

---

### Step 3.2: Copying UI Components
Copy the following layout components from `Project_final/qless` to `FinalyrProject/client`:
- **`src/components/common/Icon.jsx`**: Copy directly as it handles custom navigation and UI SVGs.
- **`src/components/student/StudentNav.jsx`** & **`StudentNav.module.css`**: Copy and import into target student page layouts.
- **`src/components/admin/AdminSidebar.jsx`** & **`AdminSidebar.module.css`**: Copy and import into target admin page layouts.

---

### Step 3.3: Merging & Refactoring Pages

> [!IMPORTANT]
> When refactoring pages, we must preserve React 19 compatibility and keep the API/Socket functionalities intact.

#### 1. Authentication (Login / Register)
* Keep target auth methods, but structure the page markup inside the forms to use the CSS modules (`AuthPage.module.css`) to match the look-and-feel of the source.
* Swap standard input tags with custom styled elements matching the green border aesthetic.

#### 2. Student Dashboard (`pages/student/Dashboard.jsx` ➔ Merged with `StudentHome.jsx`)
* Replicate the grid structure for `TOTAL SPENDING`, `TOTAL ORDERS`, and `FAVOURITE ITEM` from the source page.
* Keep the **real-time socket integration** (`useSocket`) and dynamic data fetching logic (`getLiveOccupancyAPI()`, `getMyOrdersAPI()`) from the target dashboard.
* Replace static source data (`MENU_ITEMS` mockups) with dynamic listings from the `featuredItems` state arrays.

#### 3. Student Menu (`pages/student/MenuPage.jsx` ➔ Merged with `StudentMenu.jsx`)
* Adopt the clean search bar, category chips (`ALL`, `VEGAN`, `LOW CALORIE`), and product cards from the source.
* Wire up the "Add" button to update the target's React Context/Redux cart handlers instead of static local variables.

#### 4. Student Orders (`pages/student/MyOrders.jsx` ➔ Merged with `StudentOrders.jsx`)
* Adopt the visual timeline status tracking (`Order Placed` ➔ `Preparing` ➔ `Ready for Pickup` ➔ `Collected`) from `qless`.
* Retain the WebSocket channel listeners (`order:statusUpdate`) to ensure order states transition live without requiring manual refreshes.

---

### Step 3.4: Router Setup (`src/App.jsx`)

The source uses **React Router v6**, while the target uses **React Router v7** (via `react-router-dom`).
* Do NOT change the router layout wrapper (`QueryClientProvider`, `AuthProvider`, `BrowserRouter`, `Toaster`) in target `src/App.jsx`.
* Ensure that layouts (`StudentLayout`, `AdminLayout`, `ServerLayout`) integrate the sidebars/navs from the source while wrapping their child components in `<ProtectedRoute>` wrappers.

Example target route pattern structure:
```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import StudentNav from "./components/student/StudentNav";
import AdminSidebar from "./components/admin/AdminSidebar";

// Layout Wrappers
function StudentLayout({ children }) {
  return (
    <>
      <StudentNav />
      <main>{children}</main>
    </>
  );
}

function AdminLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <main style={{ flex: 1, overflowY: 'auto' }}>{children}</main>
    </div>
  );
}
```

---

## 4. Verification and Building

Once all directories are copied and merged, execute the verification flow to ensure nothing is broken.

1. **Install Dependencies**:
   ```bash
   cd FinalyrProject/client
   npm install
   ```
2. **Run Dev Server**:
   ```bash
   npm run dev
   ```
   * Open the browser and test navigation flows for Student, Admin, and Server logins.
   * Verify responsiveness across desktop and mobile screens.
   * Confirm that real-time socket connections for orders are working correctly.
3. **Run Production Build**:
   ```bash
   npm run build
   ```
   * Ensure Vite builds the project successfully without any TypeScript, CSS bundling, or import errors.
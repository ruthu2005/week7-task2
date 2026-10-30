# Full-Stack Web Development Internship: Week 7 &bull; Task 2
## Connect Frontend to Backend Authentication (JWT)

[![React](https://img.shields.io/badge/React-18.3.1-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1.0-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Axios](https://img.shields.io/badge/Axios-1.7.9-5a29e4?logo=axios&logoColor=white)](https://axios-http.com/)
[![React Router](https://img.shields.io/badge/React_Router-6.28.2-ca4245?logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![Express](https://img.shields.io/badge/Express-4.21.2-black?logo=express&logoColor=white)](https://expressjs.com/)
[![JWT](https://img.shields.io/badge/JSON_Web_Token-Auth-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

---

## 📋 Table of Contents
1. [Overview & Objectives](#-overview--objectives)
2. [Architecture & Auth Sequence](#-architecture--auth-sequence)
3. [Repository Structure](#-repository-structure)
4. [Getting Started & Installation](#-getting-started--installation)
5. [Implementation Highlights](#-implementation-highlights)
   - [1. Axios API Service & Interceptors](#1-axios-api-service--interceptors-srcservicesaxiosclientjs)
   - [2. React Context State Store](#2-react-context-state-store-srccontextauthcontextjsx)
   - [3. Route Guard & Protected Access](#3-route-guard--protected-access-srccomponentsprotectedroutejsx)
   - [4. Auth Forms with Real-Time Validation](#4-auth-forms-with-real-time-validation)
   - [5. Active JWT Token Inspector & Testing Lab](#5-active-jwt-token-inspector--testing-lab)
6. [Security Considerations & Trade-Offs](#-security-considerations--trade-offs)
7. [Visual Walkthrough & Verification Evidence](#-visual-walkthrough--verification-evidence)
8. [Automated E2E Verification Suite](#-automated-e2e-verification-suite)

---

## 🎯 Overview & Objectives

In this task, the **React frontend single-page application** is integrated with a **JWT-based backend authentication API**. The project achieves:
- Dynamic transmission of user credentials to backend endpoints (`/api/auth/login` and `/api/auth/register`).
- Receipt, secure storage, and client-side lifecycle management of signed JSON Web Tokens (JWT).
- Automatic header injection of `Authorization: Bearer <token>` on all outbound Axios requests using an interceptor.
- Centralized session state management across the entire application using the **React Context API** (`AuthContext`).
- Client-side route protection guards (`<ProtectedRoute />`) restricting unauthorized access to private pages (`/dashboard` and `/profile`) while preserving navigation intent.
- Automatic session persistence on page refreshes and graceful `401 Unauthorized` token expiration handling.

---

## 🔄 Architecture & Auth Sequence

### Sequence Diagram: Authentication Handshake & Protected Routing

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Browser
    participant Form as React Login Component
    participant Context as AuthContext Provider
    participant Interceptor as Axios Interceptor Layer
    participant API as Backend Auth Server (Express + JWT)
    participant Storage as Browser Storage (localStorage)

    User->>Form: Submits credentials (email, password)
    Form->>Context: login(email, password)
    Context->>API: POST /api/auth/login { email, password }
    API->>API: Verify user & compare bcrypt hash
    API-->>Context: 200 OK { token: "eyJhbG...", user: {...} }
    Context->>Storage: Persist token (TOKEN_KEY) & user info
    Context->>Context: Update state: isAuthenticated = true, user = {...}
    Context-->>Form: Login successful
    Form->>User: Redirects to /dashboard via ProtectedRoute

    Note over User, API: Accessing Private Dashboard API
    User->>Context: Dashboard triggers fetchDashboardData()
    Context->>Interceptor: axiosClient.get("/dashboard/metrics")
    Interceptor->>Storage: Read token from storage
    Interceptor->>API: Outbound HTTP GET + Header [Authorization: Bearer eyJhbG...]
    API->>API: authenticateToken() verifies JWT signature & expiry
    API-->>Interceptor: 200 OK { metrics: {...} }
    Interceptor-->>User: Render protected dashboard data

    Note over User, API: Token Expiration Scenario (401 Response)
    User->>Interceptor: Outbound request with expired token
    Interceptor->>API: GET /api/dashboard/metrics
    API-->>Interceptor: 401 Unauthorized { code: "TOKEN_EXPIRED" }
    Interceptor->>Storage: clearAuth() (purges token)
    Interceptor->>Context: Dispatches 'auth:session_expired' event
    Context->>Context: logout("Session expired. Please log in again.")
    Context->>User: Redirects to /login with session expiration notice
```

---

## 📂 Repository Structure

The project strictly follows the suggested structure:

```
frontend-jwt-auth/
├── README.md                      # Comprehensive project guide and verification evidence
├── package.json                   # Root workspace scripts and dependencies
├── vite.config.js                 # Vite bundler configuration
├── index.html                     # Root HTML template with web fonts
├── .env.example                   # Environment template
├── .env                           # Local environment configuration
├── .gitignore                     # Git ignore rules
│
├── src/
│   ├── main.jsx                   # React 18 DOM mount point
│   ├── App.jsx                    # Root router with PublicRoute & ProtectedRoute layout
│   ├── index.css                  # Modern styling system with custom properties & glassmorphism
│   │
│   ├── context/
│   │   └── AuthContext.jsx        # [Core Task 1] Global Auth Context Provider & useAuth hook
│   │
│   ├── services/
│   │   ├── axiosClient.js         # [Core Task 2] Axios instance with Request/Response interceptors
│   │   └── authService.js         # High-level API endpoints (login, register, me, metrics)
│   │
│   ├── components/
│   │   ├── Navbar.jsx             # Adaptive navigation bar reflecting auth state
│   │   ├── ProtectedRoute.jsx     # Route guard restricting unauthenticated access
│   │   └── PublicRoute.jsx        # Redirects authenticated users away from login/register
│   │
│   └── pages/
│       ├── Home.jsx               # Landing page with architectural breakdown
│       ├── Login.jsx              # Sign-in form with inline validation & reviewer auto-fill
│       ├── Register.jsx           # Registration form with live password strength meter
│       ├── Dashboard.jsx          # Protected dashboard with live JWT token inspector
│       ├── Profile.jsx            # Additional protected view testing multi-route access
│       └── NotFound.jsx           # 404 handler
│
├── server/
│   ├── package.json               # Backend dependencies (express, jsonwebtoken, bcryptjs, cors)
│   ├── server.js                  # Complete JWT backend server with pre-seeded test account
│   ├── .env                       # Backend port & JWT secret configuration
│   └── .env.example               # Backend environment template
│
└── test-auth-flow.js              # Automated 7-point E2E verification test script
```

---

## 🚀 Getting Started & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Step 1: Clone Repository
```bash
git clone https://github.com/<your-username>/frontend-jwt-auth.git
cd frontend-jwt-auth
```

### Step 2: Install Dependencies
Install frontend and backend packages:
```bash
# Install frontend packages (React, React Router, Axios, Lucide Icons, Vite)
npm install

# Install backend packages (Express, CORS, JWT, Bcrypt)
cd server
npm install
cd ..
```

### Step 3: Environment Configuration
Environment files are pre-configured, but you can customize them if needed:
- Frontend `.env`:
  ```ini
  VITE_API_BASE_URL=http://localhost:5000/api
  ```
- Backend `server/.env`:
  ```ini
  PORT=5000
  JWT_SECRET=super_secret_jwt_key_week7_task2_internship_demo_123456
  JWT_EXPIRES_IN=2h
  CLIENT_URL=http://localhost:5173
  ```

### Step 4: Run the Application
Open two terminal windows:

**Terminal 1 (Backend Server):**
```bash
npm run server
# Starts backend at http://localhost:5000
# Pre-seeded test user: demo@example.com / Password123!
```

**Terminal 2 (Frontend Client):**
```bash
npm run client
# Starts Vite dev server at http://localhost:5173
```

Visit **http://localhost:5173** in your web browser.

---

## 💡 Implementation Highlights

### 1. Axios API Service & Interceptors (`src/services/axiosClient.js`)
Configured to handle dynamic token injection on outbound requests and centralized error interception on responses:

```javascript
// Outgoing Request Interceptor: Injects Authorization: Bearer <token>
axiosClient.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Incoming Response Interceptor: Catches 401 Unauthorized & Token Expiration
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      storage.clearAuth();
      window.dispatchEvent(
        new CustomEvent('auth:session_expired', {
          detail: {
            message: error.response?.data?.message || 'Session expired. Please log in again.'
          }
        })
      );
    }
    return Promise.reject(error);
  }
);
```

### 2. React Context State Store (`src/context/AuthContext.jsx`)
Maintains global session state across all components:
- `user`: Authenticated user entity `{ id, name, email, role }`.
- `token`: Current raw JWT string.
- `isAuthenticated`: Boolean state (`Boolean(token && user)`).
- `isLoading`: Prevents layout shift/flash while validating existing sessions on application boot.
- `login()`, `register()`, `logout()`: Global dispatch methods.
- Listens to window `'auth:session_expired'` events dispatched by the Axios interceptor to immediately synchronize React state without requiring page reloads.

### 3. Route Guard & Protected Access (`src/components/ProtectedRoute.jsx`)
Guards private routes and handles deep linking:

```javascript
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner text="Verifying session..." />;
  }

  if (!isAuthenticated) {
    // Preserve requested route for seamless redirect post-login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}
```

### 4. Auth Forms with Real-Time Validation
- **`Login.jsx`**: Validates email format, password presence, displays real-time server error alerts, and includes a **"Reviewer Test Account Auto Fill"** button (`demo@example.com` / `Password123!`).
- **`Register.jsx`**: Includes interactive name validation, email regex verification, matching password confirmation, and a dynamic 3-tier password strength bar (Weak / Medium / Strong).

### 5. Active JWT Token Inspector & Testing Lab
The protected `Dashboard.jsx` includes a built-in **JWT Token Inspector** and **Verification Lab**:
- Displays raw token with colored syntax highlighting (Header `.`, Payload `.`, Signature).
- Pretty-prints decoded JSON claims (`sub`, `name`, `email`, `role`, `iat`, `exp`).
- Shows live expiration countdown (e.g. `1h 59m remaining`).
- Features a **"Simulate Expired Token (Test 401)"** button that swaps in an expired token to demonstrate the Axios response interceptor automatically triggering a clean logout and warning banner.

---

## 🛡️ Security Considerations & Trade-Offs

When storing and handling JWTs in frontend SPAs, developers must navigate security trade-offs:

| Storage Strategy | Security Pros | Security Cons | Mitigation Implemented |
| :--- | :--- | :--- | :--- |
| **`localStorage` (Current Implementation)** | Survives browser refresh & tab switches; simple to implement; stateless across subdomains. | Vulnerable if application has Cross-Site Scripting (XSS) vulnerabilities. | Strict sanitization, React's built-in JSX escaping, short token lifespan (2 hours), and client-side expiration checks. |
| **`HttpOnly` Cookie** | Inaccessible to JavaScript; immune to XSS token theft. | Subject to Cross-Site Request Forgery (CSRF); requires same-site backend domain or cookie proxy. | Recommended for multi-tenant enterprise production apps paired with `SameSite=Strict` and CSRF tokens. |
| **In-Memory + Refresh Token** | Token never written to disk; lost upon browser close. | Erased on page reload unless silent refresh endpoint (`/api/auth/refresh`) is implemented via HttpOnly cookies. | Suitable for high-security banking/financial single-page applications. |

---

## 📸 Visual Walkthrough & Verification Evidence

### 1. Pre-seeded Demo Credentials
- **Email:** `demo@example.com`
- **Password:** `Password123!`
- *(Or click the "Auto Fill" button on the Login page)*

### 2. Walkthrough Steps

#### Step 1: Unauthenticated Guard Check
1. Open an incognito browser window and attempt navigating directly to `http://localhost:5173/dashboard`.
2. Notice the `<ProtectedRoute />` intercepts the request and instantly redirects to `http://localhost:5173/login`.
3. Notice `location.state.from` records `/dashboard`.

#### Step 2: Sign In & Token Storage
1. On the login form, click **Auto Fill** or enter `demo@example.com` and `Password123!`.
2. Click **Sign In to Dashboard**.
3. The app navigates to `/dashboard`.
4. Open Chrome DevTools (`F12`) &rarr; **Application** tab &rarr; **Local Storage** &rarr; `http://localhost:5173`:
   - `jwt_auth_token`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - `jwt_auth_user`: `{"id":"user_demo_01","name":"Alex Morgan","email":"demo@example.com","role":"Full-Stack Developer"}`

#### Step 3: Authorization Header Injection
1. Open DevTools &rarr; **Network** tab &rarr; Click **Refresh Data** on the Dashboard.
2. Inspect the request to `http://localhost:5000/api/dashboard/metrics`:
   ```http
   GET /api/dashboard/metrics HTTP/1.1
   Host: localhost:5000
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Content-Type: application/json
   ```
3. The backend responds with `200 OK` and returns protected data.

#### Step 4: Session Persistence on Reload
1. Press `F5` or `Ctrl+R` while on the `/dashboard` or `/profile` page.
2. The `AuthContext` reads the stored token, calls `/api/auth/me` to hydrate session data, and preserves authentication seamlessly without abrupt logouts or page flicker.

#### Step 5: Expired Token Simulation & 401 Interception
1. In the Dashboard's **Authentication Verification Lab**, click **Test 401**.
2. The app obtains an expired token and sends a request.
3. The Axios response interceptor catches the `401 Unauthorized (TOKEN_EXPIRED)` response, cleans `localStorage`, and routes the user back to `/login` displaying the alert:
   > **Session Alert:** Your session token has expired. Please log in again.

#### Step 6: User Registration Flow
1. Click **Register** in the top navigation.
2. Fill out the form with a new user (e.g. `Alice Smith`, `alice@example.com`, `Secret123!`).
3. Notice the live password strength bar updates to **Strong**.
4. Submit the form &rarr; Backend hashes password with bcrypt, signs a new JWT, and logs the user straight into the dashboard.

---

## 🧪 Automated E2E Verification Suite

An automated integration script is included to test all endpoints and token authorization logic without manual clicking:

```bash
npm run test:auth
```

### Test Suite Execution Output
```
--- STARTING JWT AUTH E2E VERIFICATION SUITE ---
Test 1: GET /api/health
Result: PASS (200 OK)

Test 2: GET /api/dashboard/metrics without Authorization header
Result: PASS (401 Unauthorized as expected)
Message: Access denied: No Authorization header provided.

Test 3: POST /api/auth/login with valid demo credentials
Result: PASS (200 OK)
Received JWT Token: eyJhbGciOiJIUzI1NiIsInR5c...

Test 4: GET /api/auth/me with Authorization: Bearer <token>
Result: PASS (200 OK)
Authenticated User: Alex Morgan (demo@example.com)

Test 5: GET /api/dashboard/metrics with Bearer token
Result: PASS (200 OK)
Metrics Payload: {
  activeSessions: 3,
  apiRequestsToday: 142,
  securityScore: 98,
  tokenType: 'JWT (RS256/HS256 compatible)',
  tokenExpiresIn: '2h',
  authMethod: 'HTTP Bearer Header',
  accountStatus: 'Active & Verified'
}

Test 6: POST /api/auth/register with new account
Result: PASS (201 Created)
Registered User: Sarah Connor Token: Generated

Test 7: POST /api/auth/simulate-expired-token and attempt protected request
Result: PASS (401 TOKEN_EXPIRED caught successfully)

--- ALL 7 TESTS COMPLETED SUCCESSFULLY ---
```

---

## 📑 Submission Checklist Alignment

| Task Requirement | Implementation File | Status |
| :--- | :--- | :--- |
| **Axios Service Layer with Dynamic Header Injection** | `src/services/axiosClient.js` | ✅ Complete |
| **Response Interceptor for 401 Session Expiration** | `src/services/axiosClient.js` | ✅ Complete |
| **Registration & Login Forms with Error Feedback** | `src/pages/Login.jsx`, `src/pages/Register.jsx` | ✅ Complete |
| **Secure Token Storage & Decoders** | `src/services/axiosClient.js`, `src/context/AuthContext.jsx` | ✅ Complete |
| **React Context API Global State Provider** | `src/context/AuthContext.jsx` | ✅ Complete |
| **Route Protection Guards for Private Views** | `src/components/ProtectedRoute.jsx` | ✅ Complete |
| **Session Persistence on Browser Reload** | `src/context/AuthContext.jsx` | ✅ Complete |
| **Comprehensive README & Visual Evidence** | `README.md` | ✅ Complete |


import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import DataView from './pages/DataView.jsx'
import Settings from './pages/Settings.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import styles from './App.module.css'
import './App.css'

function App() {
  const navigate = useNavigate()
  const token = localStorage.getItem('auth_token')
  const username = localStorage.getItem('auth_username') || ''

  function logout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_username')
    navigate('/login')
  }

  return (
    <div className="appShell">
      {token ? (
        <div className="topbar">
          <div className="container topbarInner">
            <div className="brand">
              <div className="brandMark" aria-hidden="true" />
              <div style={{ display: 'grid', lineHeight: 1.15 }}>
                <div style={{ fontWeight: 800, color: 'var(--text-h)', fontSize: 16, letterSpacing: '-0.3px' }}>
                  Aquaduct
                </div>
                <div className="muted" style={{ fontSize: 11, fontWeight: 500 }}>
                  {username}
                </div>
              </div>
            </div>

            <nav className="nav" aria-label="Primary">
              <NavLink
                to="/dashboard"
                className={({ isActive }) => (isActive ? 'active' : undefined)}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/data"
                className={({ isActive }) => (isActive ? 'active' : undefined)}
              >
                Data View
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) => (isActive ? 'active' : undefined)}
              >
                Settings
              </NavLink>
            </nav>

            <button className="btn" type="button" onClick={logout} style={{ padding: '8px 16px', fontSize: 14 }}>
              Logout
            </button>
          </div>
        </div>
      ) : null}

      <main className="main">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/data"
            element={
              <ProtectedRoute>
                <DataView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

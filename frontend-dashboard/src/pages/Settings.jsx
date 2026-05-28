import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { changePassword, deleteUser } from '../api/usersApi'

export default function Settings() {
  const navigate = useNavigate()
  const username = localStorage.getItem('auth_username') || ''
  
  // State for Password Change
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [isChangingPw, setIsChangingPw] = useState(false)

  // State for Account Deletion
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  async function handlePasswordChange(e) {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')

    if (newPassword.length < 4) {
      setPwError('Password must be at least 4 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match')
      return
    }

    setIsChangingPw(true)
    try {
      await changePassword(username, newPassword)
      setPwSuccess('Password updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setIsChangingPw(false)
    }
  }

  async function handleDeleteAccount(e) {
    e.preventDefault()
    if (!confirmDelete) return

    setDeleteError('')
    setIsDeleting(true)

    try {
      await deleteUser(username)
      // Clear auth data and redirect to login
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_username')
      navigate('/login', { state: { infoMessage: 'Your account was deleted successfully.' } })
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account')
      setIsDeleting(false)
    }
  }

  return (
    <div className="container">
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">Account Settings</h1>
          <div className="muted" style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }}>
            Manage password updates and account preferences for <b style={{ color: 'var(--primary)' }}>{username}</b>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '28px', marginTop: '10px' }} className="settings-layout">
        {/* Left Side: Change Password Card */}
        <div className="card">
          <div className="cardBody" style={{ display: 'grid', gap: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Update Password
              </h3>
              <p className="muted" style={{ fontSize: '13px', margin: '4px 0 0' }}>
                Change your security credentials. We recommend a strong, unique password.
              </p>
            </div>

            {pwError && (
              <div className="glassPanel" style={{ borderColor: 'rgba(244, 63, 94, 0.2)', background: 'var(--danger-soft)', padding: '12px 16px', borderRadius: '10px' }}>
                <span className="dangerText" style={{ fontSize: '14px', fontWeight: 500 }}>{pwError}</span>
              </div>
            )}

            {pwSuccess && (
              <div className="glassPanel" style={{ borderColor: 'rgba(16, 185, 129, 0.2)', background: 'var(--success-soft)', padding: '12px 16px', borderRadius: '10px' }}>
                <span className="successText" style={{ fontSize: '14px', fontWeight: 500 }}>{pwSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} style={{ display: 'grid', gap: '16px' }}>
              <div className="field">
                <span className="fieldLabel">Active Account Username</span>
                <input className="input" type="text" value={username} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>

              <div className="field">
                <span className="fieldLabel">New Password</span>
                <input
                  className="input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 4 characters"
                  required
                />
              </div>

              <div className="field">
                <span className="fieldLabel">Confirm New Password</span>
                <input
                  className="input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Retype your new password"
                  required
                />
              </div>

              <button className="btn btnPrimary" type="submit" disabled={isChangingPw} style={{ justifySelf: 'start', marginTop: '6px' }}>
                {isChangingPw ? 'Updating...' : 'Save Password'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Destructive Account Deletion Card */}
        <div className="card" style={{ borderColor: 'rgba(244, 63, 94, 0.2)' }}>
          <div className="cardBody" style={{ display: 'grid', gap: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                Danger Zone
              </h3>
              <p className="muted" style={{ fontSize: '13px', margin: '4px 0 0' }}>
                Irreversible actions for your profile database entries.
              </p>
            </div>

            <div className="glassPanel" style={{ background: 'rgba(244, 63, 94, 0.05)', borderColor: 'rgba(244, 63, 94, 0.15)' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: '14px', marginBottom: '6px' }}>Permanently Delete Account</div>
              <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: '1.4' }}>
                Deleting your account is permanent. All credentials, access privileges, and security markers will be wiped from the in-memory database.
              </div>
            </div>

            {deleteError && (
              <div className="glassPanel" style={{ borderColor: 'rgba(244, 63, 94, 0.2)', background: 'var(--danger-soft)', padding: '10px 14px' }}>
                <span className="dangerText" style={{ fontSize: '13px', fontWeight: 500 }}>{deleteError}</span>
              </div>
            )}

            <form onSubmit={handleDeleteAccount} style={{ display: 'grid', gap: '16px' }}>
              <label className="checkboxLabel">
                <input
                  type="checkbox"
                  className="checkboxInput"
                  checked={confirmDelete}
                  onChange={(e) => setConfirmDelete(e.target.checked)}
                />
                <span style={{ fontSize: '13px', color: 'var(--text-h)', fontWeight: 500, lineHeight: 1.2 }}>
                  I confirm that I wish to permanently delete my account.
                </span>
              </label>

              <button
                className="btn btnDanger"
                type="submit"
                disabled={!confirmDelete || isDeleting}
                style={{ width: '100%' }}
              >
                {isDeleting ? 'Deleting Profile...' : 'Delete My Account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

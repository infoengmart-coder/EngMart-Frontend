'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { User, Shield, Bell, CheckCircle2, Lock, Save } from 'lucide-react'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.company || ''
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // Notifications state
  const [notifPreferences, setNotifPreferences] = useState({
    orderUpdatesEmail: true,
    orderUpdatesSMS: true,
    orderUpdatesWhatsApp: true,
    promotionalEmails: false,
    quoteAlerts: true
  })
  const [savingNotifs, setSavingNotifs] = useState(false)
  const [notifSuccess, setNotifSuccess] = useState(false)

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileSuccess(false)
    
    setTimeout(() => {
      updateUser(profileForm)
      setSavingProfile(false)
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    }, 1000)
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }

    setSavingPassword(true)
    setTimeout(() => {
      setSavingPassword(false)
      setPasswordSuccess(true)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setPasswordSuccess(false), 3000)
    }, 1200)
  }

  const handleNotifSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSavingNotifs(true)
    setNotifSuccess(false)

    setTimeout(() => {
      setSavingNotifs(false)
      setNotifSuccess(true)
      setTimeout(() => setNotifSuccess(false), 3000)
    }, 800)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 leading-tight">Profile & Security</h2>
        <p className="text-xs text-slate-500 font-medium">Update your account information, password credentials, and order notifications channel.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* ══ PROFILE SECTION ══ */}
        <div className="bg-white border border-slate-200/85 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 mb-5 flex items-center gap-1.5">
            <User className="w-4 h-4 text-slate-400" /> Account Details
          </h3>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {profileSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold p-3.5 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Profile details saved successfully.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Full Name</label>
                <input
                  type="text" required
                  className="input-base text-xs font-semibold py-2.5"
                  value={profileForm.name}
                  onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Email Address</label>
                <input
                  type="email" required
                  className="input-base text-xs font-semibold py-2.5"
                  value={profileForm.email}
                  onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Mobile Number</label>
                <input
                  type="text" required
                  className="input-base text-xs font-semibold py-2.5"
                  value={profileForm.phone}
                  onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Company (Optional)</label>
                <input
                  type="text"
                  className="input-base text-xs font-semibold py-2.5"
                  value={profileForm.company}
                  onChange={e => setProfileForm(f => ({ ...f, company: e.target.value }))}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="btn-primary text-xs px-5 py-2.5 flex items-center gap-1.5 border-0 shadow-none disabled:opacity-75"
              >
                <Save className="w-4 h-4" /> {savingProfile ? 'Saving Details...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* ══ CHANGE PASSWORD SECTION ══ */}
        <div className="bg-white border border-slate-200/85 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 mb-5 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-slate-400" /> Security & Password
          </h3>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {passwordSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold p-3.5 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Password credentials updated successfully.
              </div>
            )}

            {passwordError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold p-3.5 rounded-xl">
                ⚠️ {passwordError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Current Password</label>
                <input
                  type="password" required
                  className="input-base text-xs font-semibold py-2.5 font-mono"
                  placeholder="••••••••"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">New Password</label>
                <input
                  type="password" required
                  className="input-base text-xs font-semibold py-2.5 font-mono"
                  placeholder="••••••••"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Confirm Password</label>
                <input
                  type="password" required
                  className="input-base text-xs font-semibold py-2.5 font-mono"
                  placeholder="••••••••"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingPassword}
                className="btn-primary text-xs px-5 py-2.5 flex items-center gap-1.5 border-0 shadow-none disabled:opacity-75"
              >
                <Lock className="w-4 h-4" /> {savingPassword ? 'Changing Password...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        {/* ══ NOTIFICATIONS SECTION ══ */}
        <div className="bg-white border border-slate-200/85 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 mb-5 flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-slate-400" /> Notification Channels
          </h3>

          <form onSubmit={handleNotifSubmit} className="space-y-4">
            {notifSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold p-3.5 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Notification channels saved.
              </div>
            )}

            <div className="space-y-3">
              {[
                { key: 'orderUpdatesEmail', title: 'Order Updates via Email', desc: 'Get order confirm letters, receipts, and shipment dispatch details.' },
                { key: 'orderUpdatesSMS', title: 'Order Updates via SMS', desc: 'Recieve instant alerts on delivery arrival at Karachi port.' },
                { key: 'orderUpdatesWhatsApp', title: 'Order Updates via WhatsApp', desc: 'Chat and receive delivery updates, courier tracking link directly.' },
                { key: 'quoteAlerts', title: 'RFQ / Quote Notifications', desc: 'Recieve notification when an administrator pricing offer is active.' },
                { key: 'promotionalEmails', title: 'Marketing Promos & Discount Codes', desc: 'Receive new switchgear arrivals, and custom discount code alerts.' }
              ].map((item, idx) => (
                <label key={idx} className="flex items-start gap-3.5 p-3 hover:bg-slate-50/50 rounded-xl cursor-pointer transition-colors border border-slate-50">
                  <input
                    type="checkbox"
                    className="w-4.5 h-4.5 rounded accent-primary cursor-pointer mt-0.5"
                    checked={notifPreferences[item.key as keyof typeof notifPreferences]}
                    onChange={e => setNotifPreferences(p => ({ ...p, [item.key]: e.target.checked }))}
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{item.title}</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-snug">{item.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingNotifs}
                className="btn-primary text-xs px-5 py-2.5 flex items-center gap-1.5 border-0 shadow-none disabled:opacity-75"
              >
                <Save className="w-4 h-4" /> {savingNotifs ? 'Saving Settings...' : 'Save Notification Preferences'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

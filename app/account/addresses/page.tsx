'use client'

import { useState } from 'react'
import { useAccount, Address } from '@/lib/account-context'
import { MapPin, Plus, Trash2, Edit2, CheckCircle2, Home, Building, Globe } from 'lucide-react'

export default function AddressesPage() {
  const { addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAccount()
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Form State
  const [form, setForm] = useState({
    name: '',
    company: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: 'Karachi',
    province: 'Sindh',
    postalCode: '',
    country: 'Pakistan',
    isDefault: false
  })

  const resetForm = () => {
    setForm({
      name: '',
      company: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: 'Karachi',
      province: 'Sindh',
      postalCode: '',
      country: 'Pakistan',
      isDefault: false
    })
    setEditingId(null)
  }

  const handleEditClick = (address: Address) => {
    setForm({
      name: address.name,
      company: address.company || '',
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      province: address.province,
      postalCode: address.postalCode || '',
      country: address.country,
      isDefault: address.isDefault
    })
    setEditingId(address.id)
    setIsOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name || !form.phone || !form.addressLine1 || !form.city || !form.province) {
      alert('Please fill out all required fields marked with *')
      return
    }

    if (editingId) {
      updateAddress(editingId, form)
    } else {
      addAddress(form)
    }

    setIsOpen(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      deleteAddress(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 leading-tight">Addresses</h2>
          <p className="text-xs text-slate-500 font-medium">Manage your delivery and billing locations for faster checkout.</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setIsOpen(true)
          }}
          className="btn-primary text-xs px-4 py-2.5 flex items-center gap-1.5 self-start sm:self-auto border-0 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Address
        </button>
      </div>

      {/* Grid of Addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map(address => (
          <div
            key={address.id}
            className={`bg-white border rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-all relative ${
              address.isDefault
                ? 'border-primary shadow-sm bg-blue-50/5'
                : 'border-slate-200'
            }`}
          >
            {/* Address Details */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-extrabold text-sm text-slate-950 flex items-center gap-1.5">
                  {address.company ? <Building className="w-4 h-4 text-slate-400" /> : <Home className="w-4 h-4 text-slate-400" />}
                  {address.name}
                </span>
                {address.isDefault && (
                  <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Default Shipping
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 font-semibold space-y-1 leading-relaxed">
                {address.company && <p className="font-bold text-slate-700">{address.company}</p>}
                <p>{address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                <p>{address.city}, {address.province}</p>
                {address.postalCode && <p>Postal Code: {address.postalCode}</p>}
                <p className="flex items-center gap-1"><Globe className="w-3 h-3 text-slate-400" /> {address.country}</p>
                <p className="pt-2 text-slate-700 font-bold">Phone: {address.phone}</p>
              </div>
            </div>

            {/* Address Card Actions */}
            <div className="flex items-center gap-3 border-t border-slate-100 pt-4 mt-5">
              {!address.isDefault && (
                <button
                  onClick={() => setDefaultAddress(address.id)}
                  className="text-xs text-primary font-bold hover:underline cursor-pointer"
                >
                  Set as Default
                </button>
              )}
              <button
                onClick={() => handleEditClick(address)}
                className="text-xs text-slate-600 hover:text-primary font-bold flex items-center gap-1 cursor-pointer ml-auto"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
              <button
                onClick={() => handleDelete(address.id)}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Address Form Overlay Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-[fadeIn_0.2s_ease-out] overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingId ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button
                onClick={() => {
                  setIsOpen(false)
                  resetForm()
                }}
                className="text-xs text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Full Name *</label>
                  <input
                    type="text" required
                    className="input-base text-xs font-semibold py-2.5"
                    placeholder="Receiver's name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Phone Number *</label>
                  <input
                    type="text" required
                    className="input-base text-xs font-semibold py-2.5"
                    placeholder="+92-300-1234567"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Company / Building (Optional)</label>
                <input
                  type="text"
                  className="input-base text-xs font-semibold py-2.5"
                  placeholder="e.g. KA Electrical Works or Shop 12"
                  value={form.company}
                  onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Street Address *</label>
                <input
                  type="text" required
                  className="input-base text-xs font-semibold py-2.5 mb-2"
                  placeholder="House/Shop no, building name, street address"
                  value={form.addressLine1}
                  onChange={e => setForm(f => ({ ...f, addressLine1: e.target.value }))}
                />
                <input
                  type="text"
                  className="input-base text-xs font-semibold py-2.5"
                  placeholder="Area, block, near landmark (Optional)"
                  value={form.addressLine2}
                  onChange={e => setForm(f => ({ ...f, addressLine2: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">City *</label>
                  <input
                    type="text" required
                    className="input-base text-xs font-semibold py-2.5"
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Province *</label>
                  <input
                    type="text" required
                    className="input-base text-xs font-semibold py-2.5"
                    value={form.province}
                    onChange={e => setForm(f => ({ ...f, province: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Postal Code</label>
                  <input
                    type="text"
                    className="input-base text-xs font-semibold py-2.5"
                    placeholder="75500"
                    value={form.postalCode}
                    onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Country</label>
                  <input
                    type="text" disabled
                    className="input-base text-xs font-semibold py-2.5 bg-slate-50 text-slate-500 cursor-not-allowed"
                    value={form.country}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer pt-2 group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded accent-primary cursor-pointer"
                  checked={form.isDefault}
                  onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))}
                />
                <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">
                  Set as default shipping address
                </span>
              </label>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    resetForm()
                  }}
                  className="flex-1 btn-secondary text-xs py-3 justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary text-xs py-3 justify-center border-0 shadow-none"
                >
                  {editingId ? 'Save Changes' : 'Add Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

"use client";

import { useState } from "react";
import { 
  Save, Store, Truck, CreditCard, Users, Plus, Trash2, 
  ToggleLeft, ToggleRight, CheckCircle2 
} from "lucide-react";
import { SITE } from "@/lib/data";

interface ShippingZone {
  id: string;
  name: string;
  cities: string;
  rate: number;
}

const INITIAL_SHIPPING: ShippingZone[] = [
  { id: "ZONE-1", name: "Karachi Local", cities: "All Karachi districts, SITE, Clifton, Korangi, Gulshan", rate: 250 },
  { id: "ZONE-2", name: "Sindh Province", cities: "Hyderabad, Sukkur, Larkana, Mirpurkhas", rate: 500 },
  { id: "ZONE-3", name: "Nationwide (Other provinces)", cities: "Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta", rate: 800 },
];

export default function SettingsPage() {
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>(INITIAL_SHIPPING);
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneCities, setNewZoneCities] = useState("");
  const [newZoneRate, setNewZoneRate] = useState(0);
  const [showAddZone, setShowAddZone] = useState(false);

  // Store information state
  const [storeName, setStoreName] = useState(SITE.name);
  const [storeTagline, setStoreTagline] = useState(SITE.tagline);
  const [storePhone, setStorePhone] = useState(SITE.phone);
  const [storeEmail, setStoreEmail] = useState(SITE.email);
  const [storeAddress, setStoreAddress] = useState(SITE.address);
  const [storeHours, setStoreHours] = useState(SITE.hours);
  const [storeWhatsapp, setStoreWhatsapp] = useState(SITE.whatsapp);

  // Payment method toggles
  const [codActive, setCodActive] = useState(true);
  const [bankActive, setBankActive] = useState(true);
  const [mobileActive, setMobileActive] = useState(false);

  // Staff members mock
  const staffMembers = [
    { name: "Super Administrator", role: "Super Admin", email: "admin@eng-mart.com" },
    { name: "M. Farhan", role: "Inventory Manager", email: "farhan@eng-mart.com" },
  ];

  const handleAddZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim() || !newZoneCities.trim()) return;

    const newZone: ShippingZone = {
      id: `ZONE-${shippingZones.length + 1}`,
      name: newZoneName,
      cities: newZoneCities,
      rate: Number(newZoneRate),
    };

    setShippingZones([...shippingZones, newZone]);
    setNewZoneName("");
    setNewZoneCities("");
    setNewZoneRate(0);
    setShowAddZone(false);
  };

  const handleDeleteZone = (id: string) => {
    if (confirm("Are you sure you want to delete this shipping zone?")) {
      setShippingZones(shippingZones.filter(z => z.id !== id));
    }
  };

  const handleSaveChanges = () => {
    alert("Store settings saved successfully!");
  };

  return (
    <div className="p-5 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configure store credentials, shipping tariffs, and active payment modes.</p>
        </div>
        <button onClick={handleSaveChanges} className="btn-primary text-xs flex items-center gap-1.5 shrink-0">
          <Save className="w-3.5 h-3.5" /> Save Changes
        </button>
      </div>

      {/* Grid: Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column (2/3) — Store Details & Shipping */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Store Info */}
          <div className="store-card p-6 space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Store className="w-4 h-4 text-primary" /> Store Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Store Name</label>
                <input 
                  type="text" 
                  value={storeName} 
                  onChange={e => setStoreName(e.target.value)} 
                  className="input-base text-xs" 
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Tagline</label>
                <input 
                  type="text" 
                  value={storeTagline} 
                  onChange={e => setStoreTagline(e.target.value)} 
                  className="input-base text-xs" 
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Support Email</label>
                <input 
                  type="email" 
                  value={storeEmail} 
                  onChange={e => setStoreEmail(e.target.value)} 
                  className="input-base text-xs" 
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Phone (Landline)</label>
                <input 
                  type="text" 
                  value={storePhone} 
                  onChange={e => setStorePhone(e.target.value)} 
                  className="input-base text-xs" 
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">WhatsApp Business</label>
                <input 
                  type="text" 
                  value={storeWhatsapp} 
                  onChange={e => setStoreWhatsapp(e.target.value)} 
                  className="input-base text-xs" 
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Operating Hours</label>
                <input 
                  type="text" 
                  value={storeHours} 
                  onChange={e => setStoreHours(e.target.value)} 
                  className="input-base text-xs" 
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Warehouse Address (Outlet)</label>
              <textarea 
                value={storeAddress} 
                onChange={e => setStoreAddress(e.target.value)} 
                className="input-base text-xs min-h-[60px]" 
              />
            </div>
          </div>

          {/* Shipping Zone Management */}
          <div className="store-card">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" /> Shipping Zones & Flat Rates
              </h2>
              <button 
                onClick={() => setShowAddZone(!showAddZone)} 
                className="btn-secondary text-[11px] py-1 px-2.5"
              >
                + Add Zone
              </button>
            </div>

            {/* Add Zone Inline form */}
            {showAddZone && (
              <form onSubmit={handleAddZone} className="p-4 border-b border-border bg-secondary/15 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Zone Name</label>
                    <input 
                      type="text" 
                      required 
                      value={newZoneName} 
                      onChange={e => setNewZoneName(e.target.value)} 
                      placeholder="e.g. Punjab Central" 
                      className="input-base text-xs" 
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Cities Coverage</label>
                    <input 
                      type="text" 
                      required 
                      value={newZoneCities} 
                      onChange={e => setNewZoneCities(e.target.value)} 
                      placeholder="e.g. Faisalabad, Multan, Gujranwala" 
                      className="input-base text-xs" 
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-semibold text-muted-foreground whitespace-nowrap">Flat Rate (PKR)</label>
                    <input 
                      type="number" 
                      required 
                      value={newZoneRate} 
                      onChange={e => setNewZoneRate(Number(e.target.value))} 
                      className="input-base text-xs w-[100px] py-1" 
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="btn-primary text-xs py-1 px-4">Add Zone</button>
                    <button type="button" onClick={() => setShowAddZone(false)} className="btn-secondary text-xs py-1 px-4">Cancel</button>
                  </div>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-[11px] text-muted-foreground uppercase bg-secondary/30">
                    <th className="px-4 py-3 text-left font-semibold">Zone</th>
                    <th className="px-4 py-3 text-left font-semibold">City Coverage</th>
                    <th className="px-4 py-3 text-left font-semibold">Flat Rate</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {shippingZones.map(z => (
                    <tr key={z.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 text-xs font-semibold text-foreground">{z.name}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-sm truncate">{z.cities}</td>
                      <td className="px-4 py-3 text-xs font-bold text-primary">PKR {z.rate}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDeleteZone(z.id)} className="text-destructive hover:underline text-xs" title="Delete Zone">
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column (1/3) — Payments & Staff */}
        <div className="space-y-6">
          
          {/* Payment toggles */}
          <div className="store-card p-6 space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <CreditCard className="w-4 h-4 text-primary" /> Active Payments
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground">Cash on Delivery (COD)</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Allow retail buyers to pay upon physical delivery.</p>
                </div>
                <button type="button" onClick={() => setCodActive(!codActive)} className="text-primary hover:text-primary/80">
                  {codActive ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-muted-foreground" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground">Bank Wire Transfer</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Require B2B/wholesale accounts to wire funds before dispatch.</p>
                </div>
                <button type="button" onClick={() => setBankActive(!bankActive)} className="text-primary hover:text-primary/80">
                  {bankActive ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-muted-foreground" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground">JazzCash / EasyPaisa</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Mobile wallets integration placeholder.</p>
                </div>
                <button type="button" onClick={() => setMobileActive(!mobileActive)} className="text-primary hover:text-primary/80">
                  {mobileActive ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-muted-foreground" />}
                </button>
              </div>
            </div>
          </div>

          {/* Admin User Management */}
          <div className="store-card p-6 space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Users className="w-4 h-4 text-primary" /> Staff Management
            </h2>
            <div className="space-y-3">
              {staffMembers.map(s => (
                <div key={s.email} className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-foreground block">{s.name}</span>
                    <span className="text-muted-foreground text-[10px]">{s.email}</span>
                  </div>
                  <span className="bg-secondary px-2 py-0.5 rounded text-[10px] font-bold text-muted-foreground border border-border">
                    {s.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

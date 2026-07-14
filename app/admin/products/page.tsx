"use client";

import { useState } from "react";
import { 
  Plus, Search, Filter, ArrowUpDown, Edit, Trash2, 
  Upload, Download, Layers, Tag, Eye, Info, Check, AlertCircle 
} from "lucide-react";
import { FEATURED_PRODUCTS, CATEGORIES, BRANDS } from "@/lib/data";

interface Product {
  name: string;
  slug: string;
  brand: string;
  category: string;
  catNo: string;
  description: string;
  specs: string[];
  image?: string;
  badge?: string;
  badgeColor?: string;
  price: number;
  stock: number;
  threshold: number;
  status: "Active" | "Draft";
}

// Map prices from the existing PKR_PRICES in product-card
const PKR_PRICES: Record<string, number> = {
  'chint-nxb63-mcb': 420,
  'abb-sh201-mcb': 850,
  'himel-hdm3-mccb': 8500,
  'fico-elc-ct': 650,
  'tense-dja96-ammeter': 2800,
  'abb-ax-contactor': 3200,
  'pce-industrial-socket': 1800,
  'kondas-znpp-capacitor': 4500,
  'tense-protection-relay': 1650,
  'opas-cam-switch': 1250,
  'chint-vfd': 22500,
  'abb-emax-acb': 145000,
  'fico-hrc-fuse': 350,
  'himel-wall-socket': 380,
  'tense-star-delta-timer': 2100,
};

// Compile full catalog with prices and stock levels
const INITIAL_PRODUCTS: Product[] = FEATURED_PRODUCTS.map((p, idx) => ({
  ...p,
  price: PKR_PRICES[p.slug] || 1500,
  stock: idx === 3 ? 2 : idx === 4 ? 1 : idx === 10 ? 0 : [25, 45, 12, 18, 55, 6, 30][idx % 7],
  threshold: [10, 10, 5, 8, 5, 15, 10][idx % 7] || 5,
  status: idx === 12 ? "Draft" : "Active" as const,
}));

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [activeTab, setActiveTab] = useState<"catalog" | "inventory" | "taxonomies">("catalog");
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states for new/edit product
  const [formName, setFormName] = useState("");
  const [formCatNo, setFormCatNo] = useState("");
  const [formBrand, setFormBrand] = useState("ABB");
  const [formCategory, setFormCategory] = useState("Miniature Circuit Breakers");
  const [formPrice, setFormPrice] = useState(0);
  const [formStock, setFormStock] = useState(0);
  const [formThreshold, setFormThreshold] = useState(5);
  const [formStatus, setFormStatus] = useState<"Active" | "Draft">("Active");
  const [formSpecs, setFormSpecs] = useState<string[]>(["", ""]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormName("");
    setFormCatNo("");
    setFormBrand("ABB");
    setFormCategory("Miniature Circuit Breakers");
    setFormPrice(0);
    setFormStock(0);
    setFormThreshold(5);
    setFormStatus("Active");
    setFormSpecs(["", ""]);
    setShowAddForm(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCatNo(p.catNo);
    setFormBrand(p.brand);
    setFormCategory(p.category);
    setFormPrice(p.price);
    setFormStock(p.stock);
    setFormThreshold(p.threshold);
    setFormStatus(p.status);
    setFormSpecs(p.specs.length > 0 ? [...p.specs] : ["", ""]);
    setShowAddForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = formName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const updatedProduct: Product = {
      name: formName,
      slug: editingProduct ? editingProduct.slug : slug,
      brand: formBrand,
      category: formCategory,
      catNo: formCatNo,
      description: editingProduct ? editingProduct.description : `${formName} description`,
      specs: formSpecs.filter(s => s.trim() !== ""),
      price: Number(formPrice),
      stock: Number(formStock),
      threshold: Number(formThreshold),
      status: formStatus,
    };

    if (editingProduct) {
      setProducts(products.map(p => p.slug === editingProduct.slug ? updatedProduct : p));
    } else {
      setProducts([updatedProduct, ...products]);
    }
    setShowAddForm(false);
  };

  const handleDelete = (slug: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter(p => p.slug !== slug));
    }
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.catNo.toLowerCase().includes(search.toLowerCase());
    const matchesBrand = brandFilter === "All" || p.brand === brandFilter;
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    return matchesSearch && matchesBrand && matchesCategory;
  });

  return (
    <div className="p-5 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Catalog & Inventory</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage products, custom specs, categories, and switchgear brands.</p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button className="btn-secondary text-xs flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" /> Import CSV
          </button>
          <button className="btn-secondary text-xs flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export Catalog
          </button>
          <button onClick={handleOpenAdd} className="btn-primary text-xs flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Product
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button 
          onClick={() => setActiveTab("catalog")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "catalog" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Catalog View
        </button>
        <button 
          onClick={() => setActiveTab("inventory")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "inventory" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Stock & Inventory Alert
        </button>
        <button 
          onClick={() => setActiveTab("taxonomies")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "taxonomies" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Categories & Brands
        </button>
      </div>

      {/* Form Drawer/Section */}
      {showAddForm && (
        <form onSubmit={handleSave} className="store-card p-6 bg-secondary/10 border-primary/20 space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <h2 className="text-base font-bold">{editingProduct ? "Edit Product" : "Add New Switchgear Product"}</h2>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-xs text-muted-foreground hover:underline">Cancel</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Product Name</label>
              <input 
                type="text" 
                required 
                value={formName} 
                onChange={e => setFormName(e.target.value)} 
                className="input-base text-xs" 
                placeholder="e.g. CHINT NXB-63 MCB 1P 16A" 
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Catalog No (SKU)</label>
              <input 
                type="text" 
                required 
                value={formCatNo} 
                onChange={e => setFormCatNo(e.target.value)} 
                className="input-base text-xs" 
                placeholder="e.g. NXB-63-1P-16A" 
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Brand</label>
              <select 
                value={formBrand} 
                onChange={e => setFormBrand(e.target.value)} 
                className="input-base text-xs"
              >
                {BRANDS.map(b => (
                  <option key={b.name} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Category</label>
              <select 
                value={formCategory} 
                onChange={e => setFormCategory(e.target.value)} 
                className="input-base text-xs"
              >
                {CATEGORIES.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Price (PKR)</label>
              <input 
                type="number" 
                required 
                value={formPrice} 
                onChange={e => setFormPrice(Number(e.target.value))} 
                className="input-base text-xs" 
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Stock Qty</label>
              <input 
                type="number" 
                required 
                value={formStock} 
                onChange={e => setFormStock(Number(e.target.value))} 
                className="input-base text-xs" 
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Low-Stock Alert Threshold</label>
              <input 
                type="number" 
                required 
                value={formThreshold} 
                onChange={e => setFormThreshold(Number(e.target.value))} 
                className="input-base text-xs" 
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Status</label>
              <select 
                value={formStatus} 
                onChange={e => setFormStatus(e.target.value as "Active" | "Draft")} 
                className="input-base text-xs"
              >
                <option value="Active">Active (Visible)</option>
                <option value="Draft">Draft (Hidden)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-muted-foreground block">Industrial Specifications (Poles, Voltage, Amps, Breaking Capacity)</label>
            <div className="flex flex-wrap gap-2">
              {formSpecs.map((spec, i) => (
                <input 
                  key={i} 
                  type="text" 
                  value={spec} 
                  onChange={e => {
                    const newSpecs = [...formSpecs];
                    newSpecs[i] = e.target.value;
                    setFormSpecs(newSpecs);
                  }}
                  className="input-base text-xs w-[180px]" 
                  placeholder={`Spec ${i+1} (e.g. 1P, 6kA)`}
                />
              ))}
              <button 
                type="button" 
                onClick={() => setFormSpecs([...formSpecs, ""])}
                className="btn-secondary text-[11px] py-1 px-3"
              >
                + Add Spec
              </button>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-border">
            <button type="submit" className="btn-primary text-xs py-1.5 px-5">Save Product</button>
            <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary text-xs py-1.5 px-5">Cancel</button>
          </div>
        </form>
      )}

      {/* Catalog & Inventory Tables */}
      {activeTab === "catalog" && (
        <div className="store-card">
          {/* Table Filters */}
          <div className="p-3 border-b border-border flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search catalog by name or SKU..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={brandFilter}
                onChange={e => setBrandFilter(e.target.value)}
                className="bg-background border border-border text-foreground text-xs rounded-md focus:ring-primary p-2 outline-none cursor-pointer"
              >
                <option value="All">All Brands</option>
                {BRANDS.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
              </select>
              <select 
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="bg-background border border-border text-foreground text-xs rounded-md focus:ring-primary p-2 outline-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="text-[11px] text-muted-foreground uppercase bg-secondary/30">
                  <th className="px-4 py-3 text-left font-semibold">SKU / Model</th>
                  <th className="px-4 py-3 text-left font-semibold">Product Title</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Brand</th>
                  <th className="px-4 py-3 text-left font-semibold">Base Price</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map(p => (
                  <tr key={p.slug} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-muted-foreground">{p.catNo}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground text-xs">{p.name}</div>
                      <div className="flex gap-1 mt-1">
                        {p.specs.slice(0, 3).map((s, idx) => (
                          <span key={idx} className="text-[9px] font-semibold bg-secondary px-1.5 py-0.5 rounded text-muted-foreground border border-border">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.category}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-foreground">{p.brand}</td>
                    <td className="px-4 py-3 font-semibold text-foreground">PKR {p.price.toLocaleString("en-PK")}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        p.status === "Active" ? "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)] border-[color-mix(in_srgb,var(--color-success)_25%,transparent)]" : "bg-secondary text-muted-foreground border-border"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => handleOpenEdit(p)} className="text-primary hover:text-primary/80 p-1" title="Edit Product">
                        <Edit className="w-4 h-4 inline" />
                      </button>
                      <button onClick={() => handleDelete(p.slug)} className="text-destructive hover:text-destructive/80 p-1" title="Delete Product">
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "inventory" && (
        <div className="store-card">
          <div className="p-4 border-b border-border">
            <h2 className="text-sm font-bold text-foreground">Stock & Critical Low Alerts</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Quickly identify products below safe reorder thresholds.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="text-[11px] text-muted-foreground uppercase bg-secondary/30">
                  <th className="px-4 py-3 text-left font-semibold">SKU</th>
                  <th className="px-4 py-3 text-left font-semibold">Product</th>
                  <th className="px-4 py-3 text-left font-semibold">Current Stock</th>
                  <th className="px-4 py-3 text-left font-semibold">Threshold</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map(p => {
                  const isOutOfStock = p.stock === 0;
                  const isLowStock = p.stock > 0 && p.stock <= p.threshold;
                  return (
                    <tr 
                      key={`${p.slug}-inv`} 
                      className={`hover:bg-secondary/20 transition-colors ${
                        isOutOfStock ? "bg-destructive/5" : isLowStock ? "bg-[color-mix(in_srgb,var(--color-warning)_5%,transparent)]" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.catNo}</td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-semibold text-foreground">{p.name}</div>
                        <div className="text-[10px] text-muted-foreground">{p.brand}</div>
                      </td>
                      <td className="px-4 py-3 font-bold">
                        <span className={isOutOfStock ? "text-destructive" : isLowStock ? "text-[var(--color-warning)]" : "text-[var(--color-success)]"}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{p.threshold} units</td>
                      <td className="px-4 py-3">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-destructive">
                            <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--color-warning)]">
                            <AlertCircle className="w-3.5 h-3.5" /> Reorder Alert
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--color-success)]">
                            <Check className="w-3.5 h-3.5" /> Safe Level
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleOpenEdit(p)} className="text-xs font-semibold text-primary hover:underline">Restock / Adjust</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "taxonomies" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Categories Manager */}
          <div className="store-card">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" /> Manage Categories
              </h2>
              <button className="btn-secondary text-[11px] py-1 px-2.5">+ Category</button>
            </div>
            <div className="divide-y divide-border">
              {CATEGORIES.map(c => (
                <div key={c.slug} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                  <div>
                    <span className="mr-2">{c.icon}</span>
                    <span className="text-xs font-semibold text-foreground">{c.name}</span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">{c.count}+ active SKUs</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-[10px] font-semibold text-primary hover:underline">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Brands Manager */}
          <div className="store-card">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" /> Manage Brands
              </h2>
              <button className="btn-secondary text-[11px] py-1 px-2.5">+ Brand</button>
            </div>
            <div className="divide-y divide-border">
              {BRANDS.map(b => (
                <div key={b.slug} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                  <div>
                    <span className="w-2.5 h-2.5 rounded-full inline-block mr-2 align-middle" style={{ backgroundColor: b.color }} />
                    <span className="text-xs font-semibold text-foreground align-middle">{b.name}</span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">{b.country} · {b.supplier}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-[10px] font-semibold text-primary hover:underline">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

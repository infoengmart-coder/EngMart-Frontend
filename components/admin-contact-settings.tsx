"use client";

import { useEffect, useState } from "react";
import { Save, Phone, MessageCircle, Mail, Clock, RotateCcw } from "lucide-react";
import { getSiteSettings, updateSiteSettings, type SiteSettingsData } from "@/lib/api";
import { useSiteSettings } from "@/lib/site-settings";

/**
 * Contact details editor for the admin dashboard.
 *
 * Writes to the same `SiteSettings` singleton the storefront reads from, so
 * whatever is saved here is exactly what the Contact page, footer, navbar
 * utility bar and every `tel:` / `wa.me` link render — there is no second copy
 * of the number to fall out of sync.
 *
 * On save it also refreshes the app-wide settings context, so the change is
 * visible immediately without a hard reload.
 */

/** The subset of SiteSettings this tab owns. */
type ContactFields = Pick<
  SiteSettingsData,
  "phone" | "mobile" | "whatsapp" | "email" | "hours" | "hours_note"
>;

const EMPTY: ContactFields = {
  phone: "",
  mobile: "",
  whatsapp: "",
  email: "",
  hours: "",
  hours_note: "",
};

interface FieldSpec {
  key: keyof ContactFields;
  label: string;
  placeholder: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  type?: string;
}

const FIELDS: FieldSpec[] = [
  {
    key: "phone",
    label: "Primary Phone",
    placeholder: "+92 322 2357073",
    hint: "Shown in the header bar, contact page and footer. Used for the Call button.",
    icon: Phone,
    type: "tel",
  },
  {
    key: "mobile",
    label: "Secondary Phone",
    placeholder: "+92 300 0000000",
    hint: "Optional. Listed underneath the primary number on the contact page.",
    icon: Phone,
    type: "tel",
  },
  {
    key: "whatsapp",
    label: "WhatsApp Number",
    placeholder: "+92 311 2763951",
    hint: "Drives every WhatsApp button. Include the country code.",
    icon: MessageCircle,
    type: "tel",
  },
  {
    key: "email",
    label: "Contact Email",
    placeholder: "info@eng-mart.com",
    hint: "Shown on the contact page and used for the Email Us link.",
    icon: Mail,
    type: "email",
  },
  {
    key: "hours",
    label: "Working Hours",
    placeholder: "Mon – Sat, 10:00 AM – 7:00 PM",
    hint: "Displayed on the Working Hours card and in the top utility bar.",
    icon: Clock,
  },
  {
    key: "hours_note",
    label: "Hours Note",
    placeholder: "Closed on Sundays & public holidays",
    hint: "Optional second line under the working hours.",
    icon: Clock,
  },
];

export function AdminContactSettings({
  onNotify,
}: {
  onNotify: (message: string) => void;
}) {
  const { refresh } = useSiteSettings();
  const [form, setForm] = useState<ContactFields>(EMPTY);
  const [saved, setSaved] = useState<ContactFields>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getSiteSettings();
      const next: ContactFields = {
        phone: data.phone || "",
        mobile: data.mobile || "",
        whatsapp: data.whatsapp || "",
        email: data.email || "",
        hours: data.hours || "",
        hours_note: data.hours_note || "",
      };
      setForm(next);
      setSaved(next);
    } catch (err: any) {
      setError(err?.message || "Could not load the current contact details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const dirty = (Object.keys(form) as (keyof ContactFields)[]).some(
    (k) => form[k] !== saved[k],
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      // PATCH only these keys — sending the whole settings object back would
      // let a stale field from this tab overwrite something edited elsewhere.
      await updateSiteSettings(form);
      setSaved(form);
      // Repopulate the storefront context so the new number is live at once.
      await refresh();
      onNotify("Contact details saved — live on the storefront now");
    } catch (err: any) {
      setError(err?.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const waDigits = form.whatsapp.replace(/[^0-9]/g, "");

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" />
            Contact Details
          </h2>
          <p className="text-muted-foreground text-xs mt-1">
            These values feed the contact page, footer, header bar and every
            call / WhatsApp button on the site.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={load}
            disabled={loading || saving}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reload
          </button>
          <button
            type="submit"
            disabled={saving || loading || !dirty}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? "Saving..." : dirty ? "Save Changes" : "Saved"}
          </button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="text-xs font-bold text-destructive bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3"
        >
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {FIELDS.map((f) => (
            <div key={f.key} className="skeleton h-[86px] rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {FIELDS.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.key} className="store-card p-4">
                  <label
                    htmlFor={`contact-${f.key}`}
                    className="flex items-center gap-2 text-[11px] font-extrabold text-foreground uppercase tracking-wide mb-2"
                  >
                    <Icon className="w-3.5 h-3.5 text-primary" />
                    {f.label}
                  </label>
                  <input
                    id={`contact-${f.key}`}
                    type={f.type || "text"}
                    value={form[f.key]}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [f.key]: e.target.value }))
                    }
                    placeholder={f.placeholder}
                    className="input-base border-2 border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                    {f.hint}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Live preview: exactly what a customer will see and tap. Catches a
              mistyped number before it reaches the storefront. */}
          <div className="store-card p-5">
            <p className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest mb-3">
              Storefront preview
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">{form.phone || "— not set —"}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">
                  {waDigits ? `wa.me/${waDigits}` : "— not set —"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Mail className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                <span className="truncate">{form.email || "— not set —"}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Clock className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                <span className="truncate">{form.hours || "— not set —"}</span>
              </div>
            </div>
            {form.whatsapp && waDigits.length < 10 && (
              <p className="text-[11px] font-bold text-amber-600 mt-3">
                That WhatsApp number looks short — include the country code
                (e.g. +92) so wa.me links resolve.
              </p>
            )}
          </div>
        </>
      )}
    </form>
  );
}

import { useState, useEffect } from "react";
import { Plus, Trash2, Phone, Mail, Building2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Contact {
  id: string;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  source: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

interface AccessStats {
  email: string;
  phone: string | null;
  access_count: number;
  last_accessed_at: string | null;
  approval_status: string;
}

const PreApprovedContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [accessStats, setAccessStats] = useState<Map<string, AccessStats>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<"all" | "accessed" | "not_accessed">("all");
  const [newContact, setNewContact] = useState({ email: "", phone: "", company_name: "", notes: "" });
  const { toast } = useToast();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setIsLoading(true);

    // Fetch contacts and registration stats in parallel
    const [contactsRes, registrationsRes] = await Promise.all([
      (supabase as any)
        .from("pre_approved_contacts")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
      supabase
        .from("investor_registrations")
        .select("email, phone_number, approval_status, access_token_id")
        .order("created_at", { ascending: false }),
    ]);

    const contactsList: Contact[] = contactsRes.data || [];
    setContacts(contactsList);

    // Build access stats map keyed by email or phone
    const regs = (registrationsRes.data || []) as any[];
    const tokenIds = regs.filter((r) => r.access_token_id).map((r) => r.access_token_id);

    let tokenMap: Record<string, { access_count: number; last_accessed_at: string | null }> = {};
    if (tokenIds.length > 0) {
      const { data: tokens } = await (supabase as any)
        .from("access_tokens")
        .select("id, access_count, last_accessed_at")
        .in("id", tokenIds);
      if (tokens) {
        tokens.forEach((t: any) => {
          tokenMap[t.id] = { access_count: t.access_count, last_accessed_at: t.last_accessed_at };
        });
      }
    }

    const statsMap = new Map<string, AccessStats>();
    regs.forEach((reg) => {
      const token = reg.access_token_id ? tokenMap[reg.access_token_id] : null;
      const stat: AccessStats = {
        email: reg.email,
        phone: reg.phone_number,
        access_count: token?.access_count || 0,
        last_accessed_at: token?.last_accessed_at || null,
        approval_status: reg.approval_status,
      };
      // Key by both email and phone for matching
      if (reg.email) statsMap.set(reg.email.toLowerCase(), stat);
      if (reg.phone_number) statsMap.set(reg.phone_number, stat);
    });

    setAccessStats(statsMap);
    setIsLoading(false);
  };

  const getContactStats = (contact: Contact) => {
    if (contact.email) {
      const stat = accessStats.get(contact.email.toLowerCase());
      if (stat) return stat;
    }
    if (contact.phone) {
      const stat = accessStats.get(contact.phone);
      if (stat) return stat;
    }
    return null;
  };

  const handleAdd = async () => {
    if (!newContact.email && !newContact.phone) {
      toast({ title: "Email or phone required", variant: "destructive" });
      return;
    }

    const { error } = await (supabase as any)
      .from("pre_approved_contacts")
      .insert({
        email: newContact.email.trim().toLowerCase() || null,
        phone: newContact.phone.trim() || null,
        company_name: newContact.company_name.trim() || null,
        notes: newContact.notes.trim() || null,
        source: "manual",
      });

    if (error) {
      toast({ title: "Failed to add contact", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Contact added to whitelist" });
      setNewContact({ email: "", phone: "", company_name: "", notes: "" });
      setShowAdd(false);
      fetchContacts();
    }
  };

  const handleRemove = async (id: string) => {
    const { error } = await (supabase as any)
      .from("pre_approved_contacts")
      .update({ is_active: false })
      .eq("id", id);

    if (!error) {
      toast({ title: "Contact removed" });
      fetchContacts();
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    if (filter === "all") return true;
    const stats = getContactStats(contact);
    if (filter === "accessed") return stats && stats.access_count > 0;
    return !stats || stats.access_count === 0;
  });

  const accessedCount = contacts.filter((c) => {
    const s = getContactStats(c);
    return s && s.access_count > 0;
  }).length;
  const notAccessedCount = contacts.length - accessedCount;

  return (
    <div className="bg-background border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Pre-Approved Contacts</h3>
          <p className="text-xs text-muted-foreground">
            {contacts.length} active • {accessedCount} accessed • {notAccessedCount} not accessed
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 px-3 py-1.5 bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-4">
        {([
          { key: "all" as const, label: `All (${contacts.length})` },
          { key: "accessed" as const, label: `Accessed (${accessedCount})`, icon: Eye },
          { key: "not_accessed" as const, label: `Not Accessed (${notAccessedCount})`, icon: EyeOff },
        ]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === key
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            {Icon && <Icon className="w-3 h-3" />}
            {label}
          </button>
        ))}
      </div>

      {showAdd && (
        <div className="bg-muted p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Email</label>
              <input
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="investor@company.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Phone / WhatsApp</label>
              <input
                type="tel"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="+971 50 123 4567"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Company</label>
              <input
                type="text"
                value={newContact.company_name}
                onChange={(e) => setNewContact({ ...newContact, company_name: e.target.value })}
                className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Company Name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Notes</label>
              <input
                type="text"
                value={newContact.notes}
                onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Optional notes"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-2 bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors">
              Add to Whitelist
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-border text-sm hover:bg-muted transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-6 text-center text-muted-foreground text-sm">Loading...</div>
      ) : filteredContacts.length === 0 ? (
        <div className="py-6 text-center text-muted-foreground text-sm">
          {filter === "all" ? "No pre-approved contacts. Add contacts or sync from Google Sheets." : filter === "accessed" ? "No contacts have accessed the teaser yet." : "All contacts have accessed the teaser."}
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {filteredContacts.map((contact) => {
            const stats = getContactStats(contact);
            return (
              <div key={contact.id} className="flex items-center justify-between bg-muted px-3 py-2.5 text-sm">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex items-center gap-3 min-w-0">
                    {contact.email && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{contact.email}</span>
                      </span>
                    )}
                    {contact.phone && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>{contact.phone}</span>
                      </span>
                    )}
                    {contact.company_name && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{contact.company_name}</span>
                      </span>
                    )}
                    {contact.source === "google_sheets" && (
                      <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium">Sheets</span>
                    )}
                  </div>
                  {/* Access stats */}
                  <div className="ml-auto flex items-center gap-2 shrink-0">
                    {stats ? (
                      <>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${stats.access_count > 0 ? "text-green-600" : "text-amber-500"}`}>
                          {stats.access_count > 0 ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {stats.access_count > 0 ? `${stats.access_count} views` : "No views"}
                        </span>
                        {stats.last_accessed_at && (
                          <span className="text-[10px] text-muted-foreground">
                            Last: {new Date(stats.last_accessed_at).toLocaleDateString()}
                          </span>
                        )}
                        <span className={`px-1.5 py-0.5 text-[10px] font-medium ${
                          stats.approval_status === "approved" ? "bg-green-100 text-green-700"
                          : stats.approval_status === "rejected" ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                        }`}>
                          {stats.approval_status}
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">Not registered</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(contact.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0 ml-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PreApprovedContacts;

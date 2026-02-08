import { useState, useEffect } from "react";
import { Plus, Trash2, Phone, Mail, Building2 } from "lucide-react";
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

const PreApprovedContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newContact, setNewContact] = useState({ email: "", phone: "", company_name: "", notes: "" });
  const { toast } = useToast();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setIsLoading(true);
    const { data, error } = await (supabase as any)
      .from("pre_approved_contacts")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (!error) setContacts(data || []);
    setIsLoading(false);
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

  return (
    <div className="bg-background border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Pre-Approved Contacts</h3>
          <p className="text-xs text-muted-foreground">
            {contacts.length} active contacts • Auto-approved on registration
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
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              Add to Whitelist
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 border border-border text-sm hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-6 text-center text-muted-foreground text-sm">Loading...</div>
      ) : contacts.length === 0 ? (
        <div className="py-6 text-center text-muted-foreground text-sm">
          No pre-approved contacts. Add contacts or sync from Google Sheets.
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {contacts.map((contact) => (
            <div key={contact.id} className="flex items-center justify-between bg-muted px-3 py-2 text-sm">
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
              <button
                onClick={() => handleRemove(contact.id)}
                className="text-muted-foreground hover:text-destructive transition-colors shrink-0 ml-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PreApprovedContacts;

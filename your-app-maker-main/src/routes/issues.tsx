import { createFileRoute } from "@tanstack/react-router";
import { PhoneShell } from "@/components/PhoneShell";
import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Plus, Clock, CheckCircle2, TriangleAlert, MapPin, Camera, X, Image as ImageIcon, Send } from "lucide-react";
import { useRef, useState } from "react";
import { useStore, createTicket, updateTicketStatus, type Ticket } from "@/lib/store";
import { useRole } from "@/hooks/use-role";

export const Route = createFileRoute("/issues")({ component: Issues });

const tabs = ["All", "Open", "In Progress", "Resolved"] as const;

function Issues() {
  const { role, user } = useRole();
  const tickets = useStore((s) => s.tickets);
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [photos, setPhotos] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<Ticket["category"]>("IT");
  const fileRef = useRef<HTMLInputElement>(null);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((f) => {
      const r = new FileReader();
      r.onload = () => setPhotos((p) => [...p, r.result as string]);
      r.readAsDataURL(f);
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = () => {
    if (!title.trim() || !location.trim()) return;
    createTicket({
      title: title.trim(),
      description: description.trim() || undefined,
      location: location.trim(),
      category,
      by: user,
      photos,
    });
    setTitle("");
    setDescription("");
    setLocation("");
    setPhotos([]);
  };

  const fmtAgo = (t: number) => {
    const m = Math.round((Date.now() - t) / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.round(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.round(h / 24)}d ago`;
  };

  const filtered = tab === "All" ? tickets : tickets.filter((t) => t.status === tab);
  const open = tickets.filter((t) => t.status === "Open").length;
  const resolved = tickets.filter((t) => t.status === "Resolved").length;
  const hotspot = (() => {
    const map = new Map<string, number>();
    tickets.forEach((t) => map.set(t.location, (map.get(t.location) ?? 0) + 1));
    const top = Array.from(map.entries()).sort((a, b) => b[1] - a[1])[0];
    return top?.[0] ?? "—";
  })();

  return (
    <PhoneShell>
      <StatusBar />
      <ScreenHeader
        title="Issues"
        subtitle="Resolution Protocol"
        right={
          <button onClick={() => fileRef.current?.click()} className="w-9 h-9 rounded-full gradient-primary text-white shadow-glow flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        {/* Report new */}
        <div className="rounded-3xl bg-card shadow-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Camera className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm">Report new issue</h3>
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (e.g. projector flicker)"
            className="w-full bg-secondary/40 rounded-2xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary mb-2"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional) — what happened, when, severity…"
            rows={2}
            className="w-full bg-secondary/40 rounded-2xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary mb-2 resize-none"
          />
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (e.g. B-201)"
              className="bg-secondary/40 rounded-2xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Ticket["category"])}
              className="bg-secondary/40 rounded-2xl px-3 py-2 text-sm font-semibold outline-none"
            >
              <option>IT</option>
              <option>Maintenance</option>
              <option>Facilities</option>
            </select>
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" multiple hidden onChange={onPick} />
          <div className="flex gap-2 overflow-x-auto">
            <button onClick={() => fileRef.current?.click()} className="shrink-0 w-16 h-16 rounded-2xl border-2 border-dashed border-primary/40 flex flex-col items-center justify-center text-primary">
              <Camera className="w-4 h-4" />
              <span className="text-[9px] font-bold mt-0.5">PHOTO</span>
            </button>
            {photos.map((p, i) => (
              <div key={i} className="relative shrink-0 w-16 h-16 rounded-2xl overflow-hidden shadow-soft">
                <img src={p} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setPhotos((ps) => ps.filter((_, j) => j !== i))} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-destructive text-white flex items-center justify-center">
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1"><ImageIcon className="w-3 h-3" />{photos.length} hi-res attached</p>
            <button onClick={submit} className="rounded-full gradient-primary text-white text-xs font-bold px-4 py-2 shadow-glow active:scale-95 inline-flex items-center gap-1">
              <Send className="w-3 h-3" /> Submit
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-card shadow-soft p-3">
            <Clock className="w-4 h-4 text-aether-pink" />
            <p className="text-xl font-extrabold mt-1">{open}</p>
            <p className="text-[10px] tracking-widest font-bold text-muted-foreground">OPEN</p>
          </div>
          <div className="rounded-2xl bg-card shadow-soft p-3">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <p className="text-xl font-extrabold mt-1">{resolved}</p>
            <p className="text-[10px] tracking-widest font-bold text-muted-foreground">RESOLVED</p>
          </div>
          <div className="rounded-2xl bg-card shadow-soft p-3">
            <TriangleAlert className="w-4 h-4 text-aether-blue" />
            <p className="text-xl font-extrabold mt-1">{hotspot}</p>
            <p className="text-[10px] tracking-widest font-bold text-muted-foreground">HOTSPOT</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                tab === t ? "gradient-primary text-white shadow-glow" : "bg-card text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((it) => (
            <div key={it.id} className="rounded-2xl bg-card shadow-soft p-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  it.priority === "High" ? "bg-destructive/15 text-destructive" :
                  it.priority === "Medium" ? "bg-aether-blue/15 text-aether-blue" :
                  "bg-primary/15 text-primary"
                }`}>
                  <TriangleAlert className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{it.title}</p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3" />{it.location} · {it.category} · {it.priority}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${
                  it.status === "Open" ? "text-aether-pink bg-aether-pink/10" :
                  it.status === "In Progress" ? "text-aether-blue bg-aether-blue/10" :
                  "text-primary bg-primary/10"
                }`}>{it.status}</span>
              </div>
              {it.description && (
                <p className="mt-2 text-[11px] text-muted-foreground bg-secondary/30 rounded-xl px-3 py-2">
                  {it.description}
                </p>
              )}
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Reported {fmtAgo(it.createdAt)} · by {it.by}</span>
                {it.resolvedAt && <span className="text-primary font-bold">Resolved {fmtAgo(it.resolvedAt)}</span>}
              </div>
              {it.photos.length > 0 && (
                <div className="mt-2 flex gap-2 overflow-x-auto">
                  {it.photos.map((p, i) => (
                    <img key={i} src={p} alt="" className="w-14 h-14 rounded-xl object-cover shadow-soft shrink-0" />
                  ))}
                </div>
              )}
              {role === "Admin" && it.status !== "Resolved" && (
                <div className="mt-2 flex gap-2">
                  {it.status === "Open" && (
                    <button onClick={() => updateTicketStatus(it.id, "In Progress")} className="flex-1 rounded-full bg-aether-blue/15 text-aether-blue text-xs font-bold py-2">Start</button>
                  )}
                  <button onClick={() => updateTicketStatus(it.id, "Resolved")} className="flex-1 rounded-full gradient-primary text-white text-xs font-bold py-2 shadow-glow">Resolve</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </PhoneShell>
  );
}

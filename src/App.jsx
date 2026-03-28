import { useState, useRef, useEffect, useCallback } from “react”;
import { supabase } from “./supabase”;

const SEGMENTS = [
{ id: “furniture”, label: “Furniture”, sub: “Seating, storage & more” },
{ id: “decor”, label: “Decor”, sub: “Walls, accents & art” },
{ id: “plants”, label: “Plants”, sub: “Greenery & pots” },
{ id: “projects”, label: “Projects”, sub: “DIY & renovations” },
{ id: “ideas”, label: “Ideas”, sub: “Inspiration & concepts” },
{ id: “shopping”, label: “Shopping”, sub: “To buy list” },
];

const serif = “‘Georgia’, ‘Times New Roman’, serif”;
const sans = “‘Helvetica Neue’, Arial, sans-serif”;

const LIGHT = {
bg: “#EDE8D0”, surface: “#E4DEC4”, card: “#DDD8BC”,
border: “#CFC9B0”, text: “#1a1a1a”, muted: “#7a7460”,
faint: “#a09a82”, input: “#E4DEC4”, inputBorder: “#CFC9B0”,
headerBg: “#EDE8D0”,
};
const DARK = {
bg: “#1e1c1a”, surface: “#272422”, card: “#2e2b28”,
border: “#3a3632”, text: “#f0ebe3”, muted: “#9a9590”,
faint: “#6a6560”, input: “#2e2b28”, inputBorder: “#3a3632”,
headerBg: “#1e1c1a”,
};

function useDesktop() {
const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 900);
useEffect(() => {
const h = () => setIsDesktop(window.innerWidth >= 900);
window.addEventListener(“resize”, h);
return () => window.removeEventListener(“resize”, h);
}, []);
return isDesktop;
}

// ── Onboarding ──
const ONBOARDING_STEPS = [
{ key: “name”, title: “Name your space”, desc: “What do you call this place?”, placeholder: “e.g. The New Apartment” },
{ key: “sections”, title: “Choose your sections”, desc: “Pick which categories you want to track.” },
{ key: “done”, title: “You’re all set!”, desc: “” },
];

function Onboarding({ onComplete, t }) {
const [step, setStep] = useState(0);
const [spaceName, setSpaceName] = useState(””);
const [selected, setSelected] = useState(SEGMENTS.map(s => s.id));
const toggle = id => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : […p, id]);
const next = () => step < ONBOARDING_STEPS.length - 1 ? setStep(s => s + 1) : onComplete({ spaceName: spaceName || “My Apartment”, selectedSections: selected });
const cur = ONBOARDING_STEPS[step];
return (
<div style={{ minHeight: “100vh”, background: t.bg, display: “flex”, flexDirection: “column”, alignItems: “center”, justifyContent: “center”, fontFamily: sans, padding: 24, color: t.text }}>
<div style={{ fontFamily: serif, fontSize: 24, marginBottom: 48, color: t.muted }}>Getting started</div>
<div style={{ width: “100%”, maxWidth: 480 }}>
<div style={{ display: “flex”, gap: 8, marginBottom: 40, justifyContent: “center” }}>
{ONBOARDING_STEPS.map((_, i) => <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, background: i === step ? t.text : t.border, transition: “all .3s” }} />)}
</div>
<div style={{ fontSize: 11, color: t.faint, letterSpacing: “0.15em”, textTransform: “uppercase”, marginBottom: 12 }}>Step {step + 1} of {ONBOARDING_STEPS.length}</div>
<h2 style={{ fontFamily: serif, fontSize: 36, fontWeight: 400, margin: “0 0 12px” }}>{cur.title}</h2>
{cur.desc && <p style={{ color: t.muted, fontSize: 14, marginBottom: 32 }}>{cur.desc}</p>}
{step === 0 && <input value={spaceName} onChange={e => setSpaceName(e.target.value)} placeholder={cur.placeholder} style={{ width: “100%”, background: t.input, border: “none”, borderBottom: “1px solid “ + t.inputBorder, padding: “12px”, fontSize: 18, color: t.text, outline: “none”, boxSizing: “border-box”, fontFamily: serif, marginBottom: 32 }} />}
{step === 1 && (
<div style={{ display: “grid”, gridTemplateColumns: “1fr 1fr”, gap: 10, marginBottom: 32 }}>
{SEGMENTS.map(s => { const on = selected.includes(s.id); return <button key={s.id} onClick={() => toggle(s.id)} style={{ background: on ? t.text : t.surface, color: on ? t.bg : t.muted, border: “1px solid “ + (on ? t.text : t.border), padding: “14px 16px”, cursor: “pointer”, fontFamily: sans, fontSize: 12, letterSpacing: “0.08em”, textTransform: “uppercase”, textAlign: “left”, transition: “all .2s” }}>{s.label}<div style={{ fontSize: 10, opacity: 0.6, marginTop: 4 }}>{s.sub}</div></button>; })}
</div>
)}
{step === 2 && <div style={{ marginBottom: 32, padding: 24, background: t.surface, border: “1px solid “ + t.border }}><div style={{ fontFamily: serif, fontSize: 20, marginBottom: 8 }}>{spaceName || “My Apartment”}</div><div style={{ fontSize: 12, color: t.muted }}>{selected.length} sections selected</div></div>}
<button onClick={next} style={{ background: t.text, color: t.bg, border: “none”, padding: “13px 32px”, fontSize: 11, letterSpacing: “0.12em”, textTransform: “uppercase”, cursor: “pointer” }}>
{step === ONBOARDING_STEPS.length - 1 ? “Open my planner” : “Continue →”}
</button>
</div>
</div>
);
}

// ── Auth ──
function AuthScreen({ onLogin, t }) {
const [mode, setMode] = useState(“login”);
const [email, setEmail] = useState(””); const [password, setPassword] = useState(””); const [name, setName] = useState(””);
const [error, setError] = useState(””); const [loading, setLoading] = useState(false);
const iS = { width: “100%”, background: t.input, border: “none”, borderBottom: “1px solid “ + t.inputBorder, padding: “10px 12px”, fontSize: 14, color: t.text, outline: “none”, boxSizing: “border-box”, fontFamily: sans };
const lS = { display: “block”, fontSize: 11, letterSpacing: “0.1em”, textTransform: “uppercase”, color: t.faint, marginBottom: 6 };

const submit = async () => {
setError(””); setLoading(true);
if (!email || !password) { setError(“Please fill in all fields.”); setLoading(false); return; }
if (mode === “signup”) {
const { error: err } = await supabase.auth.signUp({ email, password, options: { data: { name: name || email.split(”@”)[0] } } });
if (err) { setError(err.message); setLoading(false); return; }
} else {
const { error: err } = await supabase.auth.signInWithPassword({ email, password });
if (err) { setError(err.message); setLoading(false); return; }
}
setLoading(false);
};

return (
<div style={{ minHeight: “100vh”, background: t.bg, display: “flex”, flexDirection: “column”, alignItems: “center”, justifyContent: “center”, fontFamily: sans, padding: 24, color: t.text }}>
<div style={{ fontFamily: serif, fontSize: 28, marginBottom: 6 }}>My Apartment</div>
<div style={{ fontSize: 11, color: t.faint, letterSpacing: “0.12em”, textTransform: “uppercase”, marginBottom: 48 }}>Your personal planning space</div>
<div style={{ width: “100%”, maxWidth: 360, background: t.surface, border: “1px solid “ + t.border, padding: 32 }}>
<div style={{ fontSize: 13, fontWeight: 600, letterSpacing: “0.1em”, textTransform: “uppercase”, marginBottom: 24 }}>{mode === “login” ? “Sign In” : “Create Account”}</div>
{mode === “signup” && <div style={{ marginBottom: 16 }}><label style={lS}>Name</label><input value={name} onChange={e => setName(e.target.value)} placeholder=“Your name” style={iS} /></div>}
<div style={{ marginBottom: 16 }}><label style={lS}>Email</label><input value={email} onChange={e => setEmail(e.target.value)} placeholder=“you@example.com” type=“email” style={iS} /></div>
<div style={{ marginBottom: 24 }}><label style={lS}>Password</label><input value={password} onChange={e => setPassword(e.target.value)} placeholder=”••••••••” type=“password” style={iS} onKeyDown={e => e.key === “Enter” && submit()} /></div>
{error && <div style={{ fontSize: 12, color: “#c0392b”, marginBottom: 16 }}>{error}</div>}
<button onClick={submit} disabled={loading} style={{ width: “100%”, background: t.text, color: t.bg, border: “none”, padding: “12px”, fontSize: 11, letterSpacing: “0.1em”, textTransform: “uppercase”, cursor: “pointer”, marginBottom: 16, opacity: loading ? 0.6 : 1 }}>
{loading ? “Please wait…” : mode === “login” ? “Sign In” : “Create Account”}
</button>
<div style={{ fontSize: 12, color: t.faint, textAlign: “center” }}>
{mode === “login” ? “No account? “ : “Already have one? “}
<span onClick={() => { setMode(mode === “login” ? “signup” : “login”); setError(””); }} style={{ color: t.text, cursor: “pointer”, textDecoration: “underline” }}>{mode === “login” ? “Sign up” : “Sign in”}</span>
</div>
</div>
</div>
);
}

function ScrollBar({ t }) {
const [thumb, setThumb] = useState({ top: 0, height: 20 }); const [visible, setVisible] = useState(false); const timerRef = useRef(null);
useEffect(() => {
const update = () => {
const st = window.scrollY, dh = document.documentElement.scrollHeight, wh = window.innerHeight;
if (dh <= wh) { setVisible(false); return; }
const th = Math.max((wh / dh) * wh, 40);
setThumb({ top: (st / (dh - wh)) * (wh - th), height: th }); setVisible(true);
clearTimeout(timerRef.current); timerRef.current = setTimeout(() => setVisible(false), 750);
};
window.addEventListener(“scroll”, update, { passive: true }); window.addEventListener(“resize”, update); update();
return () => { window.removeEventListener(“scroll”, update); window.removeEventListener(“resize”, update); };
}, []);
return (
<div style={{ position: “fixed”, right: 6, top: 0, bottom: 0, width: 4, zIndex: 999, pointerEvents: “none” }}>
<div style={{ position: “absolute”, top: 8, bottom: 8, left: 0, right: 0, background: t.border, borderRadius: 4, opacity: visible ? 0.5 : 0, transition: “opacity .4s” }} />
<div style={{ position: “absolute”, left: 0, right: 0, top: thumb.top + 8, height: thumb.height, background: t.text, borderRadius: 4, opacity: visible ? 1 : 0, transition: “opacity .4s” }} />
</div>
);
}

function PresentationView({ items, t }) {
const segCost = items.reduce((a, i) => a + (parseFloat(i.cost) || 0), 0);
return (
<div style={{ height: “calc(100vh - 60px)”, display: “flex”, flexDirection: “column”, overflow: “hidden” }}>
<div style={{ flex: 1, display: “flex”, overflowX: “scroll”, overflowY: “hidden”, scrollSnapType: “x mandatory”, WebkitOverflowScrolling: “touch”, scrollbarWidth: “none”, msOverflowStyle: “none” }}>
{items.length === 0
? <div style={{ minWidth: “100%”, display: “flex”, alignItems: “center”, justifyContent: “center”, color: t.faint, flexDirection: “column”, gap: 10 }}><div style={{ fontFamily: serif, fontSize: 28 }}>Empty</div></div>
: items.map((item, idx) => (
<div key={item.id} style={{ minWidth: “100%”, maxWidth: “100%”, height: “100%”, scrollSnapAlign: “start”, flexShrink: 0, display: “flex”, alignItems: “center”, justifyContent: “center”, padding: “24px 48px”, boxSizing: “border-box”, borderRight: “1px solid “ + t.border, overflow: “hidden” }}>
<div style={{ width: “100%”, maxWidth: 600, textAlign: “center”, display: “flex”, flexDirection: “column”, alignItems: “center”, gap: 12 }}>
<div style={{ fontSize: 10, color: t.faint, letterSpacing: “0.15em”, textTransform: “uppercase” }}>{String(idx + 1).padStart(2, “0”)} — {String(items.length).padStart(2, “0”)}</div>
<h2 style={{ fontFamily: serif, fontSize: 40, fontWeight: 400, margin: 0, letterSpacing: “-0.02em”, color: t.text }}>{item.title}</h2>
<div style={{ width: “50%”, aspectRatio: “3/4”, background: t.surface, display: “flex”, alignItems: “center”, justifyContent: “center”, overflow: “hidden” }}>
{item.image ? <img src={item.image} alt={item.title} style={{ width: “100%”, height: “100%”, objectFit: “cover” }} /> : <div style={{ color: t.faint, textAlign: “center” }}><div style={{ fontSize: 28, marginBottom: 4 }}>📷</div><div style={{ fontSize: 10, letterSpacing: “0.1em”, textTransform: “uppercase” }}>No image</div></div>}
</div>
{item.cost && <div style={{ fontSize: 13, color: t.muted, letterSpacing: “0.08em” }}>${parseFloat(item.cost).toLocaleString(“en-US”, { minimumFractionDigits: 2 })}</div>}
{item.link && <a href={item.link.startsWith(“http”) ? item.link : “https://” + item.link} target=”_blank” rel=“noreferrer” style={{ fontSize: 11, letterSpacing: “0.1em”, textTransform: “uppercase”, color: t.text, textDecoration: “underline” }}>View Link</a>}
</div>
</div>
))}
</div>
<div style={{ height: 44, flexShrink: 0, background: t.headerBg, borderTop: “1px solid “ + t.border, padding: “0 20px”, display: “flex”, justifyContent: “space-between”, alignItems: “center” }}>
<div style={{ fontSize: 10, color: t.faint, letterSpacing: “0.1em”, textTransform: “uppercase” }}>← swipe →</div>
{segCost > 0 && <div style={{ fontFamily: serif, fontSize: 16, color: t.text }}>${segCost.toLocaleString(“en-US”, { minimumFractionDigits: 2 })}</div>}
</div>
</div>
);
}

function StandardView({ items, seg, onEdit, onDelete, onComplete, onUncomplete, isCompleted, dragIdx, overIdx, itemRefs, onHandlePointerDown, onHandlePointerMove, onHandlePointerUp, t, isDesktop }) {
const gBtn = { background: “none”, border: “1px solid “ + t.border, color: t.muted, padding: “6px 14px”, fontSize: 11, letterSpacing: “0.1em”, textTransform: “uppercase”, cursor: “pointer” };
return (
<div>
{items.length === 0 && (
<div style={{ padding: “72px 0”, textAlign: “center”, color: t.faint }}>
<div style={{ fontFamily: serif, fontSize: 28, marginBottom: 10, fontWeight: 400 }}>{isCompleted ? “Nothing completed yet” : “Empty”}</div>
<div style={{ fontSize: 12 }}>{isCompleted ? “Mark items complete from any section” : “Add your first “ + seg.label.toLowerCase() + “ item”}</div>
</div>
)}
{items.map((item, idx) => {
const isBeingDragged = dragIdx === idx;
const isDropTarget = overIdx === idx && dragIdx !== null && dragIdx !== idx;
return (
<div key={item.id} ref={el => itemRefs.current[idx] = el}
style={{ borderBottom: “1px solid “ + t.border, borderTop: isDropTarget ? “2px solid “ + t.text : “2px solid transparent”, padding: isDesktop ? “36px 0” : “28px 0”, opacity: isBeingDragged ? 0.25 : 1, background: isBeingDragged ? t.surface : “transparent”, transition: “opacity .15s, border-top .1s”, touchAction: “pan-y” }}>
<div style={{ display: “flex”, alignItems: “center”, gap: 10, marginBottom: 10 }}>
{!isCompleted && <span onPointerDown={e => onHandlePointerDown(e, idx)} onPointerMove={e => onHandlePointerMove(e, idx)} onPointerUp={e => onHandlePointerUp(e, idx)} onPointerCancel={e => onHandlePointerUp(e, idx)} style={{ fontSize: 20, color: t.faint, cursor: “grab”, lineHeight: 1, padding: “8px 8px 8px 0”, touchAction: “none”, userSelect: “none”, WebkitUserSelect: “none” }}>☰</span>}
<span style={{ fontSize: 11, color: t.faint, letterSpacing: “0.12em”, textTransform: “uppercase” }}>{String(idx + 1).padStart(2, “0”)} — {isCompleted ? (item.source_section || “General”) : seg.label}</span>
</div>
<h2 style={{ fontFamily: serif, fontSize: isDesktop ? 32 : 26, fontWeight: 400, margin: “0 0 6px”, letterSpacing: “-0.01em”, color: t.text }}>{item.title}</h2>
{item.cost && <div style={{ fontSize: 13, color: t.muted, letterSpacing: “0.06em”, marginBottom: 14 }}>${parseFloat(item.cost).toLocaleString(“en-US”, { minimumFractionDigits: 2 })}</div>}
{item.image && <img src={item.image} alt={item.title} style={{ width: isDesktop ? “60%” : “100%”, maxHeight: 480, objectFit: “cover”, display: “block”, marginBottom: 18 }} />}
{item.note && <p style={{ color: t.muted, fontSize: isDesktop ? 15 : 14, lineHeight: 1.8, margin: “0 0 14px”, maxWidth: 560 }}>{item.note}</p>}
{item.link && <a href={item.link.startsWith(“http”) ? item.link : “https://” + item.link} target=”_blank” rel=“noreferrer” style={{ fontSize: 11, letterSpacing: “0.1em”, textTransform: “uppercase”, color: t.text, textDecoration: “underline” }}>View Link →</a>}
<div style={{ display: “flex”, gap: 14, marginTop: 18, flexWrap: “wrap” }}>
{!isCompleted && <button onClick={() => onEdit(item)} style={gBtn}>Edit</button>}
{!isCompleted && <button onClick={() => onComplete(item)} style={{ …gBtn, color: “#4a9e5c”, borderColor: “#4a9e5c” }}>✓ Complete</button>}
{isCompleted && <button onClick={() => onUncomplete(item)} style={{ …gBtn, color: t.muted, borderColor: t.border }}>↩ Restore</button>}
<button onClick={() => onDelete(item.id)} style={{ …gBtn, color: “#c0392b”, borderColor: “#c0392b” }}>Remove</button>
</div>
</div>
);
})}
</div>
);
}

// ── Main App ──
export default function App() {
const [dark, setDark] = useState(false);
const t = dark ? DARK : LIGHT;
const isDesktop = useDesktop();

const [session, setSession] = useState(null);
const [profile, setProfile] = useState(null);
const [loading, setLoading] = useState(true);
const [showOnboarding, setShowOnboarding] = useState(false);

const [activeTab, setActiveTab] = useState(“home”);
const [view, setView] = useState(“standard”);
const [sections, setSections] = useState([]);
const [items, setItems] = useState([]);
const [sectionNotes, setSectionNotes] = useState({});
const [notesOpen, setNotesOpen] = useState(false);

const [showForm, setShowForm] = useState(false);
const [form, setForm] = useState({ title: “”, note: “”, link: “”, image: null, cost: “” });
const [editId, setEditId] = useState(null);
const [showSectionEditor, setShowSectionEditor] = useState(false);
const [sectionForm, setSectionForm] = useState({ label: “”, sub: “” });
const [editSectionId, setEditSectionId] = useState(null);
const fileRef = useRef();

const [dragIdx, setDragIdx] = useState(null);
const [overIdx, setOverIdx] = useState(null);
const [ghostPos, setGhostPos] = useState({ x: 0, y: 0 });
const [ghostTitle, setGhostTitle] = useState(””);
const itemRefs = useRef([]);
const dragIdxRef = useRef(null);
const overIdxRef = useRef(null);
const scrollRafRef = useRef(null);
const lastClientY = useRef(0);

// ── Auth listener ──
useEffect(() => {
supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); if (!session) setLoading(false); });
const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session));
return () => subscription.unsubscribe();
}, []);

// ── Load profile + data when session changes ──
useEffect(() => {
if (!session) { setProfile(null); setLoading(false); return; }
loadAll();
}, [session]);

const loadAll = async () => {
setLoading(true);
const uid = session.user.id;

```
const { data: prof } = await supabase.from("profiles").select("*").eq("id", uid).single();
setProfile(prof);
if (!prof?.onboarded) { setShowOnboarding(true); setLoading(false); return; }
if (prof?.dark_mode) setDark(true);

const { data: secs } = await supabase.from("sections").select("*").eq("user_id", uid).order("position");
setSections(secs || []);

const notes = {};
(secs || []).forEach(s => { if (s.notes) notes[s.id] = s.notes; });
setSectionNotes(notes);

const { data: itms } = await supabase.from("items").select("*").eq("user_id", uid).order("position");
setItems(itms || []);

setLoading(false);
```

};

// ── Derived ──
const allTabs = [{ id: “home”, label: “Home”, sub: “Welcome” }, …sections, { id: “completed”, label: “Completed”, sub: “All done” }];
const seg = allTabs.find(s => s.id === activeTab) || allTabs[0];
const isHome = activeTab === “home”;
const isCompleted = activeTab === “completed”;
const tabItems = isCompleted ? items.filter(i => i.completed) : items.filter(i => i.section_id === activeTab && !i.completed);
const totalCost = items.filter(i => !i.completed).reduce((a, i) => a + (parseFloat(i.cost) || 0), 0);
const completedCost = items.filter(i => i.completed).reduce((a, i) => a + (parseFloat(i.cost) || 0), 0);
const totalAll = items.filter(i => !i.completed).length;
const completedImages = items.filter(i => i.completed && i.image).slice(0, 6);
const spaceName = profile?.space_name || “My Apartment”;

const inputStyle = { width: “100%”, background: t.input, border: “none”, borderBottom: “1px solid “ + t.inputBorder, padding: “10px 12px”, fontSize: 14, color: t.text, outline: “none”, boxSizing: “border-box”, fontFamily: sans };
const labelStyle = { display: “block”, fontSize: 11, letterSpacing: “0.1em”, textTransform: “uppercase”, color: t.faint, marginBottom: 6 };
const ghostBtn = { background: “none”, border: “1px solid “ + t.border, color: t.muted, padding: “6px 14px”, fontSize: 11, letterSpacing: “0.1em”, textTransform: “uppercase”, cursor: “pointer” };

// ── Handlers ──
const resetForm = () => { setForm({ title: “”, note: “”, link: “”, image: null, cost: “” }); setEditId(null); setShowForm(false); };

const saveItem = async () => {
if (!form.title.trim()) return;
const uid = session.user.id;
if (editId) {
await supabase.from(“items”).update({ title: form.title, note: form.note, link: form.link, image: form.image, cost: form.cost }).eq(“id”, editId).eq(“user_id”, uid);
setItems(prev => prev.map(i => i.id === editId ? { …i, …form } : i));
} else {
const newItem = { id: Date.now(), user_id: uid, section_id: activeTab, title: form.title, note: form.note, link: form.link, image: form.image, cost: form.cost, completed: false, position: tabItems.length };
await supabase.from(“items”).insert(newItem);
setItems(prev => […prev, newItem]);
}
resetForm();
};

const deleteItem = async (id) => {
await supabase.from(“items”).delete().eq(“id”, id).eq(“user_id”, session.user.id);
setItems(prev => prev.filter(i => i.id !== id));
};

const completeItem = async (item) => {
await supabase.from(“items”).update({ completed: true, source_section: seg.label }).eq(“id”, item.id).eq(“user_id”, session.user.id);
setItems(prev => prev.map(i => i.id === item.id ? { …i, completed: true, source_section: seg.label } : i));
};

const uncompleteItem = async (item) => {
const targetSection = sections.find(s => s.label === item.source_section)?.id || sections[0]?.id;
if (!targetSection) return;
await supabase.from(“items”).update({ completed: false, source_section: null, section_id: targetSection }).eq(“id”, item.id).eq(“user_id”, session.user.id);
setItems(prev => prev.map(i => i.id === item.id ? { …i, completed: false, source_section: null, section_id: targetSection } : i));
};

const startEdit = item => {
setForm({ title: item.title, note: item.note || “”, link: item.link || “”, image: item.image || null, cost: item.cost || “” });
setEditId(item.id); setShowForm(true);
if (!isDesktop) window.scrollTo({ top: 0, behavior: “smooth” });
};

const handleImage = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => setForm(ff => ({ …ff, image: ev.target.result })); r.readAsDataURL(f); };

const toggleDark = async () => {
const newDark = !dark; setDark(newDark);
await supabase.from(“profiles”).update({ dark_mode: newDark }).eq(“id”, session.user.id);
};

const saveSection = async () => {
if (!sectionForm.label.trim()) return;
const uid = session.user.id;
if (editSectionId) {
await supabase.from(“sections”).update({ label: sectionForm.label, sub: sectionForm.sub }).eq(“id”, editSectionId).eq(“user_id”, uid);
setSections(prev => prev.map(s => s.id === editSectionId ? { …s, label: sectionForm.label, sub: sectionForm.sub } : s));
} else {
const id = sectionForm.label.toLowerCase().replace(/\s+/g, “-”) + “-” + Date.now();
const newSec = { id, user_id: uid, label: sectionForm.label, sub: sectionForm.sub, position: sections.length };
await supabase.from(“sections”).insert(newSec);
setSections(prev => […prev, newSec]);
}
setSectionForm({ label: “”, sub: “” }); setEditSectionId(null);
};

const deleteSection = async (id) => {
await supabase.from(“sections”).delete().eq(“id”, id).eq(“user_id”, session.user.id);
await supabase.from(“items”).delete().eq(“section_id”, id).eq(“user_id”, session.user.id);
setSections(prev => prev.filter(s => s.id !== id));
setItems(prev => prev.filter(i => i.section_id !== id));
if (activeTab === id) setActiveTab(“home”);
};

const startEditSection = s => { setSectionForm({ label: s.label, sub: s.sub || “” }); setEditSectionId(s.id); };

const saveNotes = async (tabId, value) => {
setSectionNotes(prev => ({ …prev, [tabId]: value }));
await supabase.from(“sections”).update({ notes: value }).eq(“id”, tabId).eq(“user_id”, session.user.id);
};

const completeOnboarding = async ({ spaceName: sn, selectedSections }) => {
const uid = session.user.id;
await supabase.from(“profiles”).update({ space_name: sn, onboarded: true }).eq(“id”, uid);
const secsToInsert = SEGMENTS.filter(s => selectedSections.includes(s.id)).map((s, i) => ({ …s, user_id: uid, position: i }));
await supabase.from(“sections”).insert(secsToInsert);
setSections(secsToInsert);
setProfile(p => ({ …p, space_name: sn, onboarded: true }));
setShowOnboarding(false);
};

// ── Drag ──
const getOverIdx = useCallback(y => { let best = 0, bd = Infinity; itemRefs.current.forEach((el, i) => { if (!el) return; const r = el.getBoundingClientRect(); const d = Math.abs(y - (r.top + r.height / 2)); if (d < bd) { bd = d; best = i; } }); return best; }, []);
const startAutoScroll = useCallback(() => {
const E = 80, M = 12;
const loop = () => {
const y = lastClientY.current, wh = window.innerHeight; let sp = 0;
if (y < E) sp = -M * (1 - y / E); else if (y > wh - E) sp = M * ((y - (wh - E)) / E);
if (sp !== 0) { window.scrollBy(0, sp); const no = getOverIdx(y); if (no !== overIdxRef.current) { overIdxRef.current = no; setOverIdx(no); } }
scrollRafRef.current = requestAnimationFrame(loop);
};
scrollRafRef.current = requestAnimationFrame(loop);
}, [getOverIdx]);
const stopAutoScroll = useCallback(() => { if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current); }, []);
const onHandlePointerDown = useCallback((e, idx) => {
e.currentTarget.setPointerCapture(e.pointerId); dragIdxRef.current = idx; overIdxRef.current = idx; lastClientY.current = e.clientY;
setGhostTitle(tabItems[idx]?.title || “”); setGhostPos({ x: e.clientX, y: e.clientY }); setDragIdx(idx); setOverIdx(idx); startAutoScroll();
}, [startAutoScroll, tabItems]);
const onHandlePointerMove = useCallback(e => {
if (dragIdxRef.current === null) return; lastClientY.current = e.clientY; setGhostPos({ x: e.clientX, y: e.clientY });
const no = getOverIdx(e.clientY); if (no !== overIdxRef.current) { overIdxRef.current = no; setOverIdx(no); }
}, [getOverIdx]);
const onHandlePointerUp = useCallback(async () => {
stopAutoScroll(); const from = dragIdxRef.current, to = overIdxRef.current;
if (from !== null && to !== null && from !== to) {
const reordered = […tabItems]; const [mv] = reordered.splice(from, 1); reordered.splice(to, 0, mv);
const updates = reordered.map((item, i) => supabase.from(“items”).update({ position: i }).eq(“id”, item.id).eq(“user_id”, session.user.id));
await Promise.all(updates);
setItems(prev => {
const others = prev.filter(i => !reordered.find(r => r.id === i.id));
return […others, …reordered.map((item, i) => ({ …item, position: i }))];
});
}
dragIdxRef.current = null; overIdxRef.current = null; setDragIdx(null); setOverIdx(null);
}, [stopAutoScroll, tabItems, session]);
useEffect(() => { stopAutoScroll(); setDragIdx(null); setOverIdx(null); dragIdxRef.current = null; overIdxRef.current = null; itemRefs.current = []; }, [activeTab, stopAutoScroll]);

// ── Loading / Auth gates ──
if (loading) return <div style={{ minHeight: “100vh”, background: LIGHT.bg, display: “flex”, alignItems: “center”, justifyContent: “center”, fontFamily: serif, fontSize: 18, color: LIGHT.muted }}>Loading…</div>;
if (!session) return <AuthScreen onLogin={() => {}} t={t} />;
if (showOnboarding) return <Onboarding t={t} onComplete={completeOnboarding} />;

// ── Sidebar ──
const Sidebar = () => (
<div style={{ width: 240, flexShrink: 0, background: t.surface, borderRight: “1px solid “ + t.border, display: “flex”, flexDirection: “column”, position: “sticky”, top: 0, height: “100vh”, overflowY: “auto” }}>
<div style={{ padding: “28px 24px 20px”, borderBottom: “1px solid “ + t.border }}>
<div style={{ fontFamily: serif, fontSize: 18, color: t.text, marginBottom: 4 }}>{spaceName}</div>
<div style={{ fontSize: 11, color: t.faint }}>
{totalAll} items · <span style={{ color: t.muted }}>${totalCost.toLocaleString(“en-US”, { minimumFractionDigits: 2 })}</span>
{completedCost > 0 && <span> / <span style={{ color: “#4a9e5c” }}>${completedCost.toLocaleString(“en-US”, { minimumFractionDigits: 2 })}</span></span>}
</div>
</div>
<nav style={{ flex: 1, padding: “16px 0” }}>
{allTabs.map((s, i) => {
const active = activeTab === s.id;
const count = s.id === “completed” ? items.filter(i => i.completed).length : items.filter(i => i.section_id === s.id && !i.completed).length;
return (
<button key={s.id} onClick={() => { setActiveTab(s.id); resetForm(); setNotesOpen(false); }}
style={{ width: “100%”, background: active ? t.bg : “none”, border: “none”, borderLeft: active ? “2px solid “ + t.text : “2px solid transparent”, padding: “12px 24px”, cursor: “pointer”, fontFamily: sans, fontSize: 12, letterSpacing: “0.08em”, textTransform: “uppercase”, color: active ? t.text : t.faint, fontWeight: active ? 600 : 400, textAlign: “left”, display: “flex”, justifyContent: “space-between”, alignItems: “center” }}>
<span>{s.id === “home” ? “Home” : s.id === “completed” ? “✓ Completed” : <span><span style={{ color: t.faint, marginRight: 8, fontSize: 10 }}>0{i}</span>{s.label}</span>}</span>
{s.id !== “home” && count > 0 && <span style={{ fontSize: 11, color: s.id === “completed” ? “#4a9e5c” : t.faint, background: s.id === “completed” ? “#4a9e5c22” : “none”, borderRadius: 10, padding: s.id === “completed” ? “1px 7px” : 0 }}>{count}</span>}
</button>
);
})}
</nav>
<div style={{ padding: “16px 24px”, borderTop: “1px solid “ + t.border, display: “flex”, gap: 8 }}>
<button onClick={toggleDark} style={{ background: t.card, border: “1px solid “ + t.border, color: t.text, padding: “6px 10px”, fontSize: 13, cursor: “pointer”, borderRadius: 20 }}>{dark ? “☀️” : “🌙”}</button>
<button onClick={() => supabase.auth.signOut()} style={{ …ghostBtn, fontSize: 10, padding: “6px 12px”, flex: 1 }}>Sign out</button>
</div>
</div>
);

const MobileHeader = () => (
<header style={{ borderBottom: “1px solid “ + t.border, background: t.headerBg, position: “sticky”, top: 0, zIndex: 100 }}>
<div style={{ padding: “0 20px”, display: “flex”, alignItems: “center”, justifyContent: “space-between”, height: 52 }}>
<div style={{ fontFamily: serif, fontSize: 17 }}>{spaceName}</div>
<div style={{ display: “flex”, gap: 8, alignItems: “center” }}>
<span style={{ fontSize: 10, color: t.muted }}>${totalCost.toLocaleString(“en-US”, { minimumFractionDigits: 2 })}{completedCost > 0 && <span> / <span style={{ color: “#4a9e5c” }}>${completedCost.toLocaleString(“en-US”, { minimumFractionDigits: 2 })}</span></span>}</span>
<button onClick={toggleDark} style={{ background: t.surface, border: “1px solid “ + t.border, color: t.text, padding: “4px 8px”, fontSize: 12, cursor: “pointer”, borderRadius: 20 }}>{dark ? “☀️” : “🌙”}</button>
<button onClick={() => supabase.auth.signOut()} style={{ …ghostBtn, fontSize: 10, padding: “4px 8px” }}>Out</button>
</div>
</div>
<div style={{ display: “flex”, overflowX: “auto”, WebkitOverflowScrolling: “touch”, padding: “0 20px” }}>
{allTabs.map((s, i) => (
<button key={s.id} onClick={() => { setActiveTab(s.id); resetForm(); }}
style={{ background: “none”, border: “none”, borderBottom: activeTab === s.id ? “2px solid “ + t.text : “2px solid transparent”, padding: “10px 14px 9px”, cursor: “pointer”, fontFamily: sans, fontSize: 11, letterSpacing: “0.1em”, textTransform: “uppercase”, color: activeTab === s.id ? t.text : t.faint, fontWeight: activeTab === s.id ? 600 : 400, whiteSpace: “nowrap” }}>
{s.id === “completed” ? <span style={{ color: activeTab === s.id ? “#4a9e5c” : t.faint }}>✓ {s.label}{items.filter(i => i.completed).length > 0 ? “ (” + items.filter(i => i.completed).length + “)” : “”}</span>
: s.id === “home” ? “Home”
: <span><span style={{ color: t.faint, marginRight: 5, fontSize: 10 }}>0{i}</span>{s.label}</span>}
</button>
))}
</div>
</header>
);

const HomeContent = () => (
<div style={{ padding: isDesktop ? “56px 56px 80px” : “48px 20px 80px”, display: “flex”, flexDirection: “column”, alignItems: isDesktop ? “flex-start” : “center” }}>
<div style={{ fontSize: 11, color: t.faint, letterSpacing: “0.18em”, textTransform: “uppercase”, marginBottom: 12 }}>Welcome back, {profile?.name || “there”}</div>
<h1 style={{ fontFamily: serif, fontSize: isDesktop ? 64 : 48, fontWeight: 400, margin: “0 0 12px”, letterSpacing: “-0.02em” }}>{spaceName}</h1>
<p style={{ color: t.faint, fontSize: 15, marginBottom: 40 }}>A running list of everything that makes it home.</p>
<button onClick={() => setShowSectionEditor(!showSectionEditor)} style={{ …ghostBtn, marginBottom: 32 }}>{showSectionEditor ? “Done Editing” : “✏️ Edit Sections”}</button>
{showSectionEditor && (
<div style={{ width: “100%”, maxWidth: 680, background: t.surface, border: “1px solid “ + t.border, padding: 24, marginBottom: 32 }}>
<div style={{ fontSize: 11, letterSpacing: “0.12em”, textTransform: “uppercase”, color: t.faint, marginBottom: 20 }}>Manage Sections</div>
{sections.map(s => (
<div key={s.id} style={{ display: “flex”, alignItems: “center”, justifyContent: “space-between”, padding: “10px 0”, borderBottom: “1px solid “ + t.border }}>
<div><div style={{ fontSize: 14, fontWeight: 500, color: t.text }}>{s.label}</div><div style={{ fontSize: 11, color: t.faint }}>{s.sub}</div></div>
<div style={{ display: “flex”, gap: 8 }}>
<button onClick={() => startEditSection(s)} style={{ …ghostBtn, padding: “4px 12px”, fontSize: 10 }}>Edit</button>
<button onClick={() => deleteSection(s.id)} style={{ …ghostBtn, padding: “4px 12px”, fontSize: 10, color: “#c0392b”, borderColor: “#c0392b” }}>Delete</button>
</div>
</div>
))}
<div style={{ marginTop: 20 }}>
<div style={{ fontSize: 11, letterSpacing: “0.1em”, textTransform: “uppercase”, color: t.faint, marginBottom: 12 }}>{editSectionId ? “Edit Section” : “Add New Section”}</div>
<div style={{ display: “flex”, gap: 10, flexWrap: “wrap” }}>
<input value={sectionForm.label} onChange={e => setSectionForm(f => ({ …f, label: e.target.value }))} placeholder=“Section name *” style={{ …inputStyle, maxWidth: 200 }} />
<input value={sectionForm.sub} onChange={e => setSectionForm(f => ({ …f, sub: e.target.value }))} placeholder=“Subtitle (optional)” style={{ …inputStyle, maxWidth: 240 }} />
<button onClick={saveSection} style={{ background: t.text, color: t.bg, border: “none”, padding: “10px 20px”, fontSize: 11, letterSpacing: “0.1em”, textTransform: “uppercase”, cursor: “pointer” }}>{editSectionId ? “Save” : “Add”}</button>
{editSectionId && <button onClick={() => { setSectionForm({ label: “”, sub: “” }); setEditSectionId(null); }} style={ghostBtn}>Cancel</button>}
</div>
</div>
</div>
)}
{completedImages.length > 0 ? (
<div style={{ width: “100%”, maxWidth: 680, marginBottom: 48 }}>
<div style={{ fontSize: 11, color: t.faint, letterSpacing: “0.12em”, textTransform: “uppercase”, marginBottom: 14 }}>Completed</div>
<div style={{ display: “grid”, gridTemplateColumns: isDesktop ? “repeat(6, 1fr)” : “repeat(3, 1fr)”, gap: 4 }}>
{completedImages.map(item => <div key={item.id} style={{ aspectRatio: “1”, overflow: “hidden” }}><img src={item.image} alt={item.title} style={{ width: “100%”, height: “100%”, objectFit: “cover” }} /></div>)}
</div>
</div>
) : (
<div style={{ width: “100%”, maxWidth: 680, aspectRatio: isDesktop ? “21/9” : “16/9”, background: t.surface, display: “flex”, alignItems: “center”, justifyContent: “center”, marginBottom: 48 }}>
<div style={{ fontSize: 11, color: t.faint, letterSpacing: “0.1em”, textTransform: “uppercase” }}>Completed items with photos will appear here</div>
</div>
)}
<div style={{ display: “flex”, gap: isDesktop ? 48 : 32, borderTop: “1px solid “ + t.border, paddingTop: 36, width: “100%”, maxWidth: 680, flexWrap: “wrap” }}>
{sections.map(s => (
<div key={s.id} onClick={() => setActiveTab(s.id)} style={{ textAlign: “center”, cursor: “pointer” }}>
<div style={{ fontFamily: serif, fontSize: isDesktop ? 36 : 28, fontWeight: 400, color: t.text }}>{items.filter(i => i.section_id === s.id && !i.completed).length}</div>
<div style={{ fontSize: 11, color: t.faint, letterSpacing: “0.1em”, textTransform: “uppercase”, marginTop: 4 }}>{s.label}</div>
</div>
))}
<div onClick={() => setActiveTab(“completed”)} style={{ textAlign: “center”, cursor: “pointer” }}>
<div style={{ fontFamily: serif, fontSize: isDesktop ? 36 : 28, fontWeight: 400, color: “#4a9e5c” }}>{items.filter(i => i.completed).length}</div>
<div style={{ fontSize: 11, color: t.faint, letterSpacing: “0.1em”, textTransform: “uppercase”, marginTop: 4 }}>Done</div>
</div>
</div>
<div style={{ marginTop: 24, display: “flex”, gap: 24, flexWrap: “wrap” }}>
<div style={{ fontSize: 14, color: t.faint, fontFamily: serif }}>Est. remaining: <span style={{ color: t.text }}>${totalCost.toLocaleString(“en-US”, { minimumFractionDigits: 2 })}</span></div>
{completedCost > 0 && <div style={{ fontSize: 14, color: t.faint, fontFamily: serif }}>Total spent: <span style={{ color: “#4a9e5c” }}>${completedCost.toLocaleString(“en-US”, { minimumFractionDigits: 2 })}</span></div>}
</div>
</div>
);

const SectionContent = () => (
<div style={{ display: “flex”, minHeight: “100%” }}>
<div style={{ flex: 1, minWidth: 0 }}>
<div style={{ padding: isDesktop ? “0 56px” : “0 20px” }}>
<div style={{ borderBottom: “1px solid “ + t.border, padding: isDesktop ? “48px 0 32px” : “32px 0 24px”, display: “flex”, alignItems: “flex-end”, justifyContent: “space-between”, flexWrap: “wrap”, gap: 12 }}>
<div>
<div style={{ fontSize: 11, letterSpacing: “0.15em”, textTransform: “uppercase”, color: t.faint, marginBottom: 10 }}>
{String(allTabs.findIndex(s => s.id === activeTab)).padStart(2, “0”)} — {String(allTabs.length - 1).padStart(2, “0”)}
</div>
<h1 style={{ fontFamily: serif, fontSize: isDesktop ? 56 : 44, fontWeight: 400, margin: 0, letterSpacing: “-0.01em”, lineHeight: 1, color: isCompleted ? “#4a9e5c” : t.text }}>{seg.label}</h1>
<p style={{ margin: “10px 0 0”, color: t.faint, fontSize: 13 }}>{seg.sub}</p>
</div>
<div style={{ display: “flex”, flexDirection: “column”, alignItems: “flex-end”, gap: 10 }}>
<div style={{ display: “flex”, gap: 8 }}>
{isDesktop && !isCompleted && (
<button onClick={() => setNotesOpen(o => !o)} style={{ …ghostBtn, background: notesOpen ? t.text : “none”, color: notesOpen ? t.bg : t.muted, borderColor: notesOpen ? t.text : t.border }}>📝 Notes</button>
)}
<div style={{ display: “flex”, border: “1px solid “ + t.border, overflow: “hidden” }}>
{[“standard”, “presentation”].map(v => (
<button key={v} onClick={() => setView(v)} style={{ background: view === v ? t.text : “none”, color: view === v ? t.bg : t.faint, border: “none”, padding: “7px 16px”, fontSize: 10, letterSpacing: “0.1em”, textTransform: “uppercase”, cursor: “pointer”, fontFamily: sans, borderRight: v === “standard” ? “1px solid “ + t.border : “none”, whiteSpace: “nowrap” }}>
{v === “standard” ? “Standard” : “Presentation”}
</button>
))}
</div>
</div>
{view === “standard” && !isCompleted && (
<div style={{ display: “flex”, alignItems: “center”, gap: 12 }}>
{tabItems.length > 1 && <span style={{ fontSize: 11, color: t.faint, letterSpacing: “0.06em”, textTransform: “uppercase” }}>hold ☰ to reorder</span>}
<button onClick={() => { resetForm(); setShowForm(true); }} style={{ background: t.text, color: t.bg, border: “none”, padding: “11px 24px”, fontSize: 11, letterSpacing: “0.1em”, textTransform: “uppercase”, cursor: “pointer” }}>+ Add</button>
</div>
)}
</div>
</div>
{view === “standard” && showForm && !isCompleted && (
<div style={{ borderBottom: “1px solid “ + t.border, padding: “28px 0” }}>
<div style={{ fontSize: 11, letterSpacing: “0.12em”, textTransform: “uppercase”, color: t.faint, marginBottom: 20 }}>{editId ? “Edit Item” : “New Item”}</div>
<div style={{ display: “grid”, gridTemplateColumns: “1fr 1fr”, gap: 14, maxWidth: 680 }}>
<div style={{ gridColumn: “1 / -1” }}><label style={labelStyle}>Title *</label><input value={form.title} onChange={e => setForm(f => ({ …f, title: e.target.value }))} placeholder=“e.g. Linen sofa” style={inputStyle} /></div>
<div style={{ gridColumn: “1 / -1” }}><label style={labelStyle}>Notes</label><textarea value={form.note} onChange={e => setForm(f => ({ …f, note: e.target.value }))} rows={3} style={{ …inputStyle, resize: “vertical” }} /></div>
<div><label style={labelStyle}>Cost ($)</label><input value={form.cost} onChange={e => setForm(f => ({ …f, cost: e.target.value }))} placeholder=“0.00” type=“number” min=“0” step=“0.01” style={inputStyle} /></div>
<div><label style={labelStyle}>Link</label><input value={form.link} onChange={e => setForm(f => ({ …f, link: e.target.value }))} placeholder=“https://…” style={inputStyle} /></div>
<div style={{ gridColumn: “1 / -1” }}>
<label style={labelStyle}>Image</label>
<button onClick={() => fileRef.current.click()} style={{ …inputStyle, cursor: “pointer”, color: t.faint, textAlign: “left” }}>{form.image ? “✓ Image attached” : “Upload inspiration”}</button>
<input ref={fileRef} type=“file” accept=“image/*” onChange={handleImage} style={{ display: “none” }} />
</div>
</div>
{form.image && <img src={form.image} alt=“preview” style={{ marginTop: 14, height: 160, objectFit: “cover”, display: “block” }} />}
<div style={{ display: “flex”, gap: 10, marginTop: 20 }}>
<button onClick={saveItem} style={{ background: t.text, color: t.bg, border: “none”, padding: “10px 24px”, fontSize: 11, letterSpacing: “0.1em”, textTransform: “uppercase”, cursor: “pointer” }}>{editId ? “Save” : “Add”}</button>
<button onClick={resetForm} style={ghostBtn}>Cancel</button>
</div>
</div>
)}
</div>
<div style={{ padding: isDesktop ? “0 56px” : “0 20px” }}>
{view === “standard”
? <StandardView items={tabItems} seg={seg} onEdit={startEdit} onDelete={deleteItem} onComplete={completeItem} onUncomplete={uncompleteItem} isCompleted={isCompleted} dragIdx={dragIdx} overIdx={overIdx} itemRefs={itemRefs} onHandlePointerDown={onHandlePointerDown} onHandlePointerMove={onHandlePointerMove} onHandlePointerUp={onHandlePointerUp} t={t} isDesktop={isDesktop} />
: <PresentationView items={tabItems} t={t} />}
</div>
{view === “standard” && <footer style={{ borderTop: “1px solid “ + t.border, padding: “18px “ + (isDesktop ? “56px” : “20px”), display: “flex”, justifyContent: “space-between”, color: t.faint, fontSize: 11, marginTop: 40 }}><span>{spaceName}</span><span>{new Date().getFullYear()}©</span></footer>}
</div>
{isDesktop && (
<div style={{ width: notesOpen ? 300 : 0, flexShrink: 0, overflow: “hidden”, transition: “width .3s ease”, borderLeft: notesOpen ? “1px solid “ + t.border : “none”, background: t.surface, position: “sticky”, top: 0, height: “100vh”, display: “flex”, flexDirection: “column” }}>
<div style={{ padding: “28px 24px 16px”, borderBottom: “1px solid “ + t.border, display: “flex”, justifyContent: “space-between”, alignItems: “center”, whiteSpace: “nowrap” }}>
<div style={{ fontFamily: serif, fontSize: 16, color: t.text }}>Section Notes</div>
<button onClick={() => setNotesOpen(false)} style={{ background: “none”, border: “none”, color: t.faint, cursor: “pointer”, fontSize: 20, lineHeight: 1, padding: 0 }}>×</button>
</div>
<div style={{ padding: “12px 24px 0”, fontSize: 11, color: t.faint, letterSpacing: “0.08em”, textTransform: “uppercase”, whiteSpace: “nowrap” }}>{seg.label}</div>
<textarea value={sectionNotes[activeTab] || “”} onChange={e => saveNotes(activeTab, e.target.value)} placeholder={“Thoughts, links, measurements for “ + seg.label.toLowerCase() + “…”} style={{ flex: 1, background: “none”, border: “none”, outline: “none”, resize: “none”, padding: “12px 24px 24px”, fontSize: 13, color: t.text, lineHeight: 1.8, fontFamily: sans }} />
</div>
)}
</div>
);

return (
<div style={{ minHeight: “100vh”, background: t.bg, fontFamily: sans, color: t.text, transition: “background .3s, color .3s” }}>
<ScrollBar t={t} />
{dragIdx !== null && (
<div style={{ position: “fixed”, left: ghostPos.x - 12, top: ghostPos.y - 18, background: t.text, color: t.bg, padding: “8px 16px”, fontFamily: serif, fontSize: 15, pointerEvents: “none”, zIndex: 9999, whiteSpace: “nowrap”, boxShadow: “0 4px 20px rgba(0,0,0,0.3)” }}>{ghostTitle}</div>
)}
{isDesktop ? (
<div style={{ display: “flex”, minHeight: “100vh” }}>
<Sidebar />
<div style={{ flex: 1, overflowY: “auto”, minWidth: 0 }}>
{isHome ? <HomeContent /> : <SectionContent />}
</div>
</div>
) : (
<div>
<MobileHeader />
{isHome ? <HomeContent /> : <SectionContent />}
</div>
)}
</div>
);
}

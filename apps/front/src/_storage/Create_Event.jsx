import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────
   AURORA BACKGROUND
───────────────────────────────────────────── */
function Aurora({ colorStops = ["#3b0764","#7c3aed","#1e1b4b"], speed = 0.5, blend = "screen" }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const timeRef   = useRef(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H;
    const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const blobs = Array.from({ length: 5 }, (_, i) => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0006 * speed,
      vy: (Math.random() - 0.5) * 0.0004 * speed,
      r: 0.35 + Math.random() * 0.25,
      color: colorStops[i % colorStops.length],
      phase: Math.random() * Math.PI * 2,
    }));
    const draw = () => {
      timeRef.current += 0.008 * speed;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = blend;
      blobs.forEach((b) => {
        b.x += b.vx + Math.sin(timeRef.current + b.phase) * 0.0004;
        b.y += b.vy + Math.cos(timeRef.current * 0.7 + b.phase) * 0.0003;
        if (b.x < 0 || b.x > 1) b.vx *= -1;
        if (b.y < 0 || b.y > 1) b.vy *= -1;
        const gx = b.x * W, gy = b.y * H;
        const radius = b.r * Math.max(W, H);
        const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, radius);
        g.addColorStop(0, b.color + "bb");
        g.addColorStop(0.5, b.color + "44");
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }} />;
}

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const C = {
  bg: "#080b14", bg2: "#0d1120",
  surface: "#111827", surface2: "#161f30",
  border: "rgba(139,92,246,0.18)", borderSoft: "rgba(139,92,246,0.08)",
  violet: "#7c3aed", violetMid: "#8b5cf6", violetLight: "#a78bfa",
  text: "#e8e4ff", muted: "#8b85aa", faint: "#3d3860", white: "#ffffff",
  green: "#34d399", greenBg: "rgba(52,211,153,0.08)", greenBorder: "rgba(52,211,153,0.2)",
  red: "#f87171", redBg: "rgba(248,113,113,0.08)", redBorder: "rgba(248,113,113,0.2)",
};

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Nunito', sans-serif;
    background: #080b14; color: #e8e4ff;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #0d1017; }
  ::-webkit-scrollbar-thumb { background: #3b1f72; border-radius: 3px; }
  input, textarea, select { font-family: 'Nunito', sans-serif; color: #e8e4ff; }
  input::placeholder, textarea::placeholder { color: #3d3860 !important; }
  input[type="date"]::-webkit-calendar-picker-indicator,
  input[type="time"]::-webkit-calendar-picker-indicator {
    filter: invert(0.55) sepia(1) saturate(3) hue-rotate(220deg); cursor: pointer;
  }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes successPop {
    0%   { transform: scale(0.75); opacity:0; }
    65%  { transform: scale(1.07); }
    100% { transform: scale(1); opacity:1; }
  }
  @keyframes pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(139,92,246,0.4); }
    50%      { box-shadow: 0 0 0 8px rgba(139,92,246,0); }
  }
  .fade-up { animation: fadeUp 0.55s ease both; }
  .d1 { animation-delay: 0.05s; } .d2 { animation-delay: 0.12s; }
  .d3 { animation-delay: 0.20s; } .d4 { animation-delay: 0.28s; }
  .d5 { animation-delay: 0.36s; } .d6 { animation-delay: 0.44s; }
  .field { animation: fadeUp 0.38s ease both; }
`;

/* ─────────────────────────────────────────────
   NAV
───────────────────────────────────────────── */
function Nav({ onBack }) {
  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:300,
      height:60, display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"0 36px",
      background:"rgba(8,11,20,0.82)", backdropFilter:"blur(20px)",
      borderBottom:`1px solid ${C.borderSoft}`,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={onBack}>
        <div style={{
          width:32, height:32, borderRadius:9,
          background:`linear-gradient(135deg, ${C.violet}, #a78bfa)`,
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 0 18px rgba(124,58,237,0.45)",
        }}>
          <svg width="17" height="17" fill="none" viewBox="0 0 17 17">
            <rect x="2" y="4.5" width="13" height="9.5" rx="2" stroke="white" strokeWidth="1.5"/>
            <path d="M5.5 8h6M5.5 11h4" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M6.5 4.5V3.5a2 2 0 013 0v1" stroke="white" strokeWidth="1.3"/>
          </svg>
        </div>
        <span style={{ fontFamily:"Nunito", fontWeight:800, fontSize:19, color:C.text, letterSpacing:-0.3 }}>
          e-<span style={{ color:C.violetLight }}>cert</span>
        </span>
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div style={{
          fontSize:12.5, fontWeight:700, padding:"4px 14px", borderRadius:100,
          background:"rgba(124,58,237,0.12)", border:`1px solid rgba(124,58,237,0.25)`,
          color:C.violetLight,
        }}>✦ Novo evento</div>
      </div>

      <button onClick={onBack} style={{
        fontFamily:"Nunito", fontSize:13.5, fontWeight:700, color:C.muted,
        background:C.surface2, border:`1px solid ${C.border}`,
        padding:"7px 18px", borderRadius:9, cursor:"pointer",
        display:"flex", alignItems:"center", gap:6, transition:"all 0.2s",
      }}
        onMouseEnter={e => { e.currentTarget.style.color = C.text; }}
        onMouseLeave={e => { e.currentTarget.style.color = C.muted; }}
      >
        <svg width="13" height="13" fill="none" viewBox="0 0 13 13">
          <path d="M8 2L3 6.5 8 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Voltar
      </button>
    </nav>
  );
}

/* ─────────────────────────────────────────────
   STEP INDICATOR
───────────────────────────────────────────── */
const STEPS = ["Informações", "Data & Local", "Certificado", "Revisão"];

function StepIndicator({ current }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", marginBottom:48 }}>
      {STEPS.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={label} style={{ display:"flex", alignItems:"center" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
              <div style={{
                width:36, height:36, borderRadius:"50%",
                background: done
                  ? `linear-gradient(135deg, ${C.violet}, #9333ea)`
                  : active ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.04)",
                border: active ? `2px solid ${C.violetMid}` : done ? "none" : `1px solid rgba(255,255,255,0.08)`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:13, fontWeight:800,
                color: done ? C.white : active ? C.violetLight : C.faint,
                boxShadow: active ? "0 0 16px rgba(124,58,237,0.3)" : "none",
                animation: active ? "pulse 2.5s infinite" : "none",
                transition:"all 0.3s",
              }}>
                {done ? (
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                    <path d="M2.5 7l3.5 3.5 6-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : i + 1}
              </div>
              <span style={{
                fontSize:11.5, fontWeight:700,
                color: active ? C.violetLight : done ? C.muted : C.faint,
                letterSpacing:"0.02em", whiteSpace:"nowrap",
                transition:"color 0.3s",
              }}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                width:72, height:1, marginBottom:20,
                background: done ? `linear-gradient(90deg, ${C.violet}, ${C.faint})` : "rgba(255,255,255,0.06)",
                transition:"background 0.3s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   FIELD COMPONENTS
───────────────────────────────────────────── */
function Label({ children, required }) {
  return (
    <label style={{ display:"block", fontSize:13.5, fontWeight:700, color:C.text, marginBottom:8 }}>
      {children}
      {required && <span style={{ color:C.violetLight, marginLeft:3 }}>*</span>}
    </label>
  );
}

const getInputStyle = (focused, error) => ({
  width:"100%", fontFamily:"Nunito", fontSize:14.5, fontWeight:500,
  color:C.text, background:C.surface2,
  border:`1.5px solid ${error ? C.redBorder : focused ? C.violetMid : C.border}`,
  borderRadius:11, padding:"13px 16px", outline:"none",
  transition:"border-color 0.2s, box-shadow 0.2s",
  boxShadow: focused && !error ? "0 0 0 3px rgba(139,92,246,0.12)" : "none",
});

function TextField({ label, name, value, onChange, placeholder, required, type="text", error, hint }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom:22 }} className="field">
      <Label required={required}>{label}</Label>
      <input
        type={type} name={name} value={value}
        onChange={e => onChange(name, e.target.value)}
        placeholder={placeholder}
        style={getInputStyle(focused, error)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {(hint || error) && (
        <div style={{ fontSize:12, marginTop:6, color: error ? C.red : C.faint, fontWeight:500 }}>
          {error || hint}
        </div>
      )}
    </div>
  );
}

function TextArea({ label, name, value, onChange, placeholder, required, rows=4, hint, error }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom:22 }} className="field">
      <Label required={required}>{label}</Label>
      <textarea
        name={name} value={value} rows={rows}
        onChange={e => onChange(name, e.target.value)}
        placeholder={placeholder}
        style={{ ...getInputStyle(focused, error), resize:"vertical", lineHeight:1.65 }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {(hint || error) && (
        <div style={{ fontSize:12, marginTop:6, color: error ? C.red : C.faint, fontWeight:500 }}>
          {error || hint}
        </div>
      )}
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom:22 }} className="field">
      <Label required={required}>{label}</Label>
      <select
        name={name} value={value}
        onChange={e => onChange(name, e.target.value)}
        style={{
          ...getInputStyle(focused, false),
          appearance:"none",
          backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%238b85aa' strokeWidth='1.5' fill='none' strokeLinecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat:"no-repeat", backgroundPosition:"calc(100% - 14px) center", paddingRight:40,
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {options.map(o => (
          <option key={o.value} value={o.value} style={{ background:C.surface }}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function TagInput({ label, name, value, onChange, placeholder, hint }) {
  const [input, setInput]   = useState("");
  const [focused, setFocused] = useState(false);
  const addTag = (raw) => {
    const tag = raw.trim();
    if (tag && !value.includes(tag)) onChange(name, [...value, tag]);
    setInput("");
  };
  const removeTag = (tag) => onChange(name, value.filter(t => t !== tag));
  const handleKey = (e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(input); }
    if (e.key === "Backspace" && !input && value.length) removeTag(value[value.length - 1]);
  };
  return (
    <div style={{ marginBottom:22 }} className="field">
      <Label>{label}</Label>
      <div style={{
        minHeight:50, background:C.surface2,
        border:`1.5px solid ${focused ? C.violetMid : C.border}`,
        borderRadius:11, padding:"8px 12px",
        display:"flex", flexWrap:"wrap", gap:6, alignItems:"center",
        transition:"border-color 0.2s, box-shadow 0.2s",
        boxShadow: focused ? "0 0 0 3px rgba(139,92,246,0.12)" : "none",
        cursor:"text",
      }} onClick={() => document.getElementById(`tag-${name}`)?.focus()}>
        {value.map(tag => (
          <div key={tag} style={{
            display:"flex", alignItems:"center", gap:5,
            padding:"3px 10px", borderRadius:100,
            background:"rgba(124,58,237,0.15)", border:`1px solid rgba(124,58,237,0.25)`,
            fontSize:12.5, fontWeight:700, color:C.violetLight,
          }}>
            {tag}
            <span onClick={() => removeTag(tag)} style={{ cursor:"pointer", opacity:0.6, fontSize:13, lineHeight:1 }}>×</span>
          </div>
        ))}
        <input
          id={`tag-${name}`} value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          onBlur={() => { setTimeout(() => { addTag(input); setFocused(false); }, 150); }}
          onFocus={() => setFocused(true)}
          placeholder={value.length === 0 ? placeholder : ""}
          style={{ border:"none", outline:"none", background:"transparent", fontSize:14, color:C.text, fontFamily:"Nunito", minWidth:120, flex:1 }}
        />
      </div>
      {hint && <div style={{ fontSize:12, marginTop:6, color:C.faint, fontWeight:500 }}>{hint}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   CERT PREVIEW
───────────────────────────────────────────── */
function CertPreview({ form }) {
  const certType = { participante:"Participante", palestrante:"Palestrante", organizador:"Organizador" }[form.certType] || "Participante";
  return (
    <div style={{
      background:"linear-gradient(160deg, #160d2e 0%, #0d0a1e 50%, #080b14 100%)",
      border:`1px solid rgba(139,92,246,0.22)`,
      borderRadius:16, padding:"28px 32px", textAlign:"center",
      position:"relative", overflow:"hidden",
      boxShadow:"0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(124,58,237,0.08)",
    }}>
      <div style={{ position:"absolute", top:0, left:"10%", right:"10%", height:1, background:"linear-gradient(90deg,transparent,rgba(167,139,250,0.6),transparent)" }} />
      <div style={{ position:"absolute", inset:10, border:"1px solid rgba(167,139,250,0.05)", borderRadius:10, pointerEvents:"none" }} />
      <div style={{ fontSize:9.5, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(167,139,250,0.45)", marginBottom:12, fontWeight:600 }}>
        {form.name || "Nome do Evento"}
      </div>
      <div style={{ fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.18)", marginBottom:5, fontWeight:500 }}>Certificamos que</div>
      <div style={{ fontFamily:"Nunito", fontStyle:"italic", fontSize:24, fontWeight:800, color:"#fff", letterSpacing:-0.5, lineHeight:1.2, marginBottom:4 }}>
        Nome do Participante
      </div>
      <div style={{ width:120, height:1, background:"linear-gradient(90deg,transparent,rgba(167,139,250,0.3),transparent)", margin:"0 auto 14px" }} />
      <div style={{ fontSize:11.5, color:"rgba(255,255,255,0.28)", lineHeight:1.65, maxWidth:340, margin:"0 auto 18px" }}>
        participou do evento <strong style={{ color:"rgba(255,255,255,0.5)" }}>{form.name || "—"}</strong> com carga horária de <strong style={{ color:"rgba(255,255,255,0.5)" }}>{form.workload || "—"}h</strong>.
      </div>
      <div style={{ display:"flex", justifyContent:"center", gap:20, marginBottom:16, flexWrap:"wrap" }}>
        {[["Tipo", certType], ["Carga", `${form.workload || "—"}h`], ["Validação","✓ Blockchain"]].map(([l,v], i, arr) => (
          <div key={l} style={{ display:"flex", alignItems:"center", gap:20 }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.18)", marginBottom:3, fontWeight:600 }}>{l}</div>
              <div style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.55)" }}>{v}</div>
            </div>
            {i < arr.length-1 && <div style={{ width:1, height:20, background:"rgba(167,139,250,0.1)" }} />}
          </div>
        ))}
      </div>
      <div style={{ width:36, height:36, borderRadius:"50%", margin:"0 auto 10px", border:"1.5px solid rgba(167,139,250,0.2)", display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(124,58,237,0.08)", fontSize:16, animation:"pulse 2.5s infinite" }}>🎓</div>
      <div style={{ fontSize:8.5, color:"rgba(255,255,255,0.12)", letterSpacing:"0.08em", fontFamily:"monospace" }}>
        ecert.com.br/verify · ID gerado automaticamente
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   REVIEW ROW
───────────────────────────────────────────── */
function ReviewRow({ label, value, icon }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div style={{
      display:"flex", alignItems:"flex-start", gap:14,
      padding:"13px 16px", borderRadius:11,
      background:"rgba(255,255,255,0.02)", border:`1px solid ${C.borderSoft}`,
      marginBottom:9,
    }}>
      <span style={{ fontSize:15, flexShrink:0, marginTop:2 }}>{icon}</span>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:C.faint, marginBottom:3 }}>{label}</div>
        <div style={{ fontSize:14, fontWeight:600, color:C.text, lineHeight:1.5 }}>
          {Array.isArray(value) ? value.join(", ") : value}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function SectionTitle({ icon, title, sub }) {
  return (
    <div style={{ marginBottom:28 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:"rgba(124,58,237,0.1)", border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>{icon}</div>
        <h3 style={{ fontFamily:"Nunito", fontSize:20, fontWeight:900, color:C.text, letterSpacing:-0.4 }}>{title}</h3>
      </div>
      <p style={{ fontSize:14, color:C.muted, fontWeight:400, marginLeft:46 }}>{sub}</p>
    </div>
  );
}

function SectionSubtitle({ children }) {
  return (
    <div style={{ fontSize:10.5, fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase", color:C.faint, marginBottom:10, marginTop:20 }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */

// ▶ Substitua pela URL real da sua API
const API_URL = "http://localhost:5001/events";

const INITIAL_FORM = {
  name: "", description: "", category: "tecnologia", tags: [],
  date: "", time: "", endDate: "", endTime: "", location: "", locationUrl: "", capacity: "",
  workload: "", certType: "participante", certMessage: "", issuer: "",
};

export default function CreateEvent({ onBack }) {
  const [step,     setStep]    = useState(0);
  const [form,     setForm]    = useState(INITIAL_FORM);
  const [errors,   setErrors]  = useState({});
  const [status,   setStatus]  = useState("idle"); // idle | loading | success | error
  const [apiError, setApiError]= useState("");

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = globalCSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  const set = useCallback((name, value) => {
    setForm(f => ({ ...f, [name]: value }));
    setErrors(e => ({ ...e, [name]: "" }));
  }, []);

  const validate = (s) => {
    const e = {};
    if (s === 0) {
      if (!form.name.trim())        e.name        = "Nome do evento é obrigatório.";
      if (!form.description.trim()) e.description = "Descrição é obrigatória.";
    }
    if (s === 1) {
      if (!form.date)              e.date     = "Data de início é obrigatória.";
      if (!form.time)              e.time     = "Horário de início é obrigatório.";
      if (!form.location.trim())   e.location = "Local é obrigatório.";
    }
    if (s === 2) {
      if (!form.workload)          e.workload = "Carga horária é obrigatória.";
      if (!form.issuer.trim())     e.issuer   = "Emissor do certificado é obrigatório.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(step)) setStep(s => s + 1); };
  const prev = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setStatus("loading");
    setApiError("");

    const startISO = form.date && form.time ? `${form.date}T${form.time}:00` : null;
    const endISO   = form.endDate && form.endTime ? `${form.endDate}T${form.endTime}:00` : null;

    const payload = {
      title:                 form.name,
      description:            form.description,
      categoria:            form.category,
      tags:                 form.tags,
      date:          startISO,
      data_fim:             endISO,
      location:                form.location,
      url_local:            form.locationUrl || null,
      capacidade:           form.capacity ? Number(form.capacity) : null,
      carga_horaria:        Number(form.workload),
      tipo_certificado:     form.certType,
      mensagem_certificado: form.certMessage || null,
      emissor:              form.issuer,
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include", // Envia cookies para autenticação, se necessário
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || `Erro ${res.status}: ${res.statusText}`);
      }
      setStatus("success");

      window.location.href = "/userDashboard"; // Redireciona para o dashboard após criação
    } catch (err) {
      setStatus("error");
      setApiError(err.message || "Falha ao criar evento. Tente novamente.");
    }
  };

  /* ── Success screen ── */
  if (status === "success") {
    return (
      <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:24, position:"relative", overflow:"hidden" }}>
        <Aurora colorStops={["#3b0764","#7c3aed","#1e1b4b"]} speed={0.3} blend="screen" />
        <div style={{ position:"relative", zIndex:1, textAlign:"center", maxWidth:480, animation:"successPop 0.5s ease both" }}>
          <div style={{
            width:80, height:80, borderRadius:"50%", margin:"0 auto 28px",
            background:"linear-gradient(135deg, #059669, #34d399)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:36, boxShadow:"0 0 40px rgba(52,211,153,0.4)",
          }}>✓</div>
          <h2 style={{ fontFamily:"Nunito", fontSize:34, fontWeight:900, color:C.white, letterSpacing:-1, marginBottom:12 }}>
            Evento criado!
          </h2>
          <p style={{ fontSize:16, color:C.muted, lineHeight:1.7, marginBottom:36 }}>
            <strong style={{ color:C.text }}>{form.name}</strong> foi registrado com sucesso.<br/>
            Os certificados serão gerados automaticamente após o evento.
          </p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={() => { setForm(INITIAL_FORM); setStep(0); setStatus("idle"); }} style={{
              fontFamily:"Nunito", fontSize:14.5, fontWeight:700, color:C.white,
              background:`linear-gradient(135deg, ${C.violet}, #9333ea)`,
              border:"none", padding:"12px 24px", borderRadius:10, cursor:"pointer",
              boxShadow:"0 4px 20px rgba(124,58,237,0.4)",
            }}>+ Criar outro evento</button>
            {onBack && (
              <button onClick={onBack} style={{
                fontFamily:"Nunito", fontSize:14.5, fontWeight:700, color:C.muted,
                background:C.surface, border:`1px solid ${C.border}`,
                padding:"12px 24px", borderRadius:10, cursor:"pointer",
              }}>← Voltar ao início</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── Steps ── */
  const renderStep = () => {
    switch (step) {

      case 0: return (
        <div key="s0" className="fade-up">
          <SectionTitle icon="📋" title="Informações do Evento" sub="Dados principais do seu evento." />
          <TextField label="Nome do evento" name="name" value={form.name} onChange={set}
            placeholder="ex: Tech Summit Brasil 2025" required error={errors.name} />
          <TextArea label="Descrição" name="description" value={form.description} onChange={set}
            placeholder="Descreva o evento, programação e público-alvo..." required rows={4} error={errors.description} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <SelectField label="Categoria" name="category" value={form.category} onChange={set} options={[
              { value:"tecnologia", label:"💻 Tecnologia" },
              { value:"negocios",   label:"💼 Negócios" },
              { value:"design",     label:"🎨 Design" },
              { value:"educacao",   label:"📚 Educação" },
              { value:"saude",      label:"🏥 Saúde" },
              { value:"cultura",    label:"🎭 Cultura" },
              { value:"outro",      label:"📌 Outro" },
            ]} />
            <div className="field" style={{ marginBottom:22 }}>
              <Label>Capacidade</Label>
              <input type="number" min="1" value={form.capacity}
                onChange={e => set("capacity", e.target.value)}
                placeholder="ex: 200"
                style={getInputStyle(false, false)}
              />
            </div>
          </div>
          <TagInput label="Tags" name="tags" value={form.tags} onChange={set}
            placeholder="Adicione tags e pressione Enter..."
            hint="Pressione Enter ou vírgula para adicionar uma tag." />
        </div>
      );

      case 1: return (
        <div key="s1" className="fade-up">
          <SectionTitle icon="📅" title="Data & Local" sub="Quando e onde acontecerá o evento." />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <TextField label="Data de início" name="date" value={form.date} onChange={set} type="date" required error={errors.date} />
            <TextField label="Horário de início" name="time" value={form.time} onChange={set} type="time" required error={errors.time} />
            <TextField label="Data de término" name="endDate" value={form.endDate} onChange={set} type="date" />
            <TextField label="Horário de término" name="endTime" value={form.endTime} onChange={set} type="time" />
          </div>
          <TextField label="Local" name="location" value={form.location} onChange={set}
            placeholder="ex: Centro de Convenções Frei Caneca, São Paulo" required error={errors.location} />
          <TextField label="Link do local / evento online" name="locationUrl" value={form.locationUrl} onChange={set}
            placeholder="https://maps.google.com/... ou link do Meet/Zoom"
            hint="Opcional — para eventos online ou mapa do local." />
        </div>
      );

      case 2: return (
        <div key="s2" className="fade-up">
          <SectionTitle icon="🎓" title="Configurar Certificado" sub="Como os certificados serão gerados para este evento." />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <TextField label="Carga horária (h)" name="workload" value={form.workload} onChange={set}
              type="number" min="1" placeholder="ex: 16" required error={errors.workload} />
            <SelectField label="Tipo de certificado" name="certType" value={form.certType} onChange={set} options={[
              { value:"participante", label:"🎟 Participante" },
              { value:"palestrante",  label:"🎤 Palestrante" },
              { value:"organizador",  label:"🗂 Organizador" },
            ]} />
          </div>
          <TextField label="Emissor / Organização" name="issuer" value={form.issuer} onChange={set}
            placeholder="ex: Instituto de Tecnologia Brasil" required error={errors.issuer} />
          <TextArea label="Mensagem personalizada" name="certMessage" value={form.certMessage} onChange={set}
            placeholder="ex: Este certificado reconhece a dedicação do(a) profissional..."
            rows={3} hint="Opcional — aparecerá no corpo do certificado." />
          <div style={{ marginTop:8 }}>
            <div style={{ fontSize:11.5, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:C.faint, marginBottom:14 }}>Pré-visualização</div>
            <CertPreview form={form} />
          </div>
        </div>
      );

      case 3: return (
        <div key="s3" className="fade-up">
          <SectionTitle icon="🔍" title="Revisar e Criar" sub="Confira as informações antes de publicar." />

          <SectionSubtitle>Informações</SectionSubtitle>
          <ReviewRow icon="📋" label="Nome" value={form.name} />
          <ReviewRow icon="📝" label="Descrição" value={form.description} />
          <ReviewRow icon="🏷" label="Categoria" value={form.category} />
          <ReviewRow icon="🔖" label="Tags" value={form.tags} />
          <ReviewRow icon="👥" label="Capacidade" value={form.capacity ? `${form.capacity} pessoas` : null} />

          <SectionSubtitle>Data & Local</SectionSubtitle>
          <ReviewRow icon="📅" label="Início" value={form.date && form.time ? `${form.date} às ${form.time}` : null} />
          <ReviewRow icon="🏁" label="Término" value={form.endDate && form.endTime ? `${form.endDate} às ${form.endTime}` : null} />
          <ReviewRow icon="📍" label="Local" value={form.location} />
          <ReviewRow icon="🔗" label="Link" value={form.locationUrl} />

          <SectionSubtitle>Certificado</SectionSubtitle>
          <ReviewRow icon="⏱" label="Carga horária" value={form.workload ? `${form.workload}h` : null} />
          <ReviewRow icon="🎓" label="Tipo" value={form.certType} />
          <ReviewRow icon="🏛" label="Emissor" value={form.issuer} />
          <ReviewRow icon="💬" label="Mensagem" value={form.certMessage} />

          {status === "error" && (
            <div style={{
              marginTop:20, padding:"14px 18px", borderRadius:11,
              background:C.redBg, border:`1px solid ${C.redBorder}`,
              display:"flex", alignItems:"flex-start", gap:10,
            }}>
              <span style={{ fontSize:16, flexShrink:0 }}>⚠️</span>
              <div>
                <div style={{ fontSize:13.5, fontWeight:700, color:C.red, marginBottom:2 }}>Falha ao criar evento</div>
                <div style={{ fontSize:13, color:"rgba(248,113,113,0.8)" }}>{apiError}</div>
              </div>
            </div>
          )}
        </div>
      );

      default: return null;
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg }}>
      <Nav onBack={onBack} />

      <div style={{ paddingTop:60, minHeight:"100vh", position:"relative" }}>
        {/* Background */}
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
          <Aurora colorStops={["#3b0764","#1e1b4b","#080b14"]} speed={0.25} blend="screen" />
          <div style={{ position:"absolute", inset:0, backgroundImage:`linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.03) 1px,transparent 1px)`, backgroundSize:"48px 48px" }} />
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 80% at 50% 0%, transparent 40%, #080b14 80%)" }} />
        </div>

        <div style={{ position:"relative", zIndex:1, maxWidth:780, margin:"0 auto", padding:"52px 24px 80px" }}>

          {/* Header */}
          <div className="fade-up d1" style={{ marginBottom:40, textAlign:"center" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"5px 16px 5px 6px", borderRadius:100, background:"rgba(124,58,237,0.1)", border:`1px solid rgba(124,58,237,0.22)`, marginBottom:20 }}>
              <div style={{ width:20, height:20, borderRadius:100, background:`linear-gradient(135deg, ${C.violet}, ${C.violetLight})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10 }}>✦</div>
              <span style={{ fontSize:12, fontWeight:700, color:C.violetLight }}>Criação de evento</span>
            </div>
            <h1 className="fade-up d2" style={{ fontFamily:"Nunito", fontSize:"clamp(28px,4vw,42px)", fontWeight:900, letterSpacing:-1.2, color:C.text, lineHeight:1.1, marginBottom:10 }}>
              Seu evento,{" "}
              <span style={{ background:`linear-gradient(135deg, ${C.violetLight}, ${C.violet}, #c084fc)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                em minutos.
              </span>
            </h1>
            <p className="fade-up d3" style={{ fontSize:15.5, color:C.muted, lineHeight:1.7 }}>
              Preencha as informações abaixo para criar e publicar seu evento com certificados automáticos.
            </p>
          </div>

          {/* Steps */}
          <div className="fade-up d4">
            <StepIndicator current={step} />
          </div>

          {/* Form card */}
          <div className="fade-up d5" style={{
            background:C.surface, border:`1px solid ${C.border}`,
            borderRadius:20, padding:"40px 44px",
            boxShadow:"0 24px 80px rgba(0,0,0,0.45), 0 0 40px rgba(124,58,237,0.05)",
            position:"relative", overflow:"hidden",
          }}>
            <div style={{ position:"absolute", top:0, left:"10%", right:"10%", height:1, background:"linear-gradient(90deg,transparent,rgba(167,139,250,0.5),transparent)" }} />

            {renderStep()}

            {/* Navigation */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:36, paddingTop:28, borderTop:`1px solid ${C.borderSoft}` }}>
              <button onClick={step === 0 ? onBack : prev} style={{
                fontFamily:"Nunito", fontSize:14, fontWeight:700, color:C.muted,
                background:"transparent", border:`1px solid ${C.border}`,
                padding:"11px 22px", borderRadius:10, cursor:"pointer",
                display:"flex", alignItems:"center", gap:7, transition:"all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}
              >
                <svg width="13" height="13" fill="none" viewBox="0 0 13 13"><path d="M8 2L3 6.5 8 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {step === 0 ? "Cancelar" : "Anterior"}
              </button>

              {/* Dots */}
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                {STEPS.map((_, i) => (
                  <div key={i} style={{
                    width: i === step ? 20 : 6, height:6, borderRadius:100,
                    background: i === step ? C.violetMid : i < step ? C.violet : C.faint,
                    transition:"all 0.3s",
                  }} />
                ))}
              </div>

              {step < STEPS.length - 1 ? (
                <button onClick={next} style={{
                  fontFamily:"Nunito", fontSize:14.5, fontWeight:700, color:C.white,
                  background:`linear-gradient(135deg, ${C.violet}, #9333ea)`,
                  border:"none", padding:"11px 26px", borderRadius:10, cursor:"pointer",
                  display:"flex", alignItems:"center", gap:8,
                  boxShadow:"0 4px 18px rgba(124,58,237,0.38)", transition:"transform 0.2s, box-shadow 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 8px 26px rgba(124,58,237,0.5)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 4px 18px rgba(124,58,237,0.38)"; }}
                >
                  Próximo
                  <svg width="13" height="13" fill="none" viewBox="0 0 13 13"><path d="M4 2l5 4.5L4 11" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={status === "loading"} style={{
                  fontFamily:"Nunito", fontSize:14.5, fontWeight:700, color:C.white,
                  background: status === "loading" ? "rgba(124,58,237,0.45)" : `linear-gradient(135deg, ${C.violet}, #9333ea)`,
                  border:"none", padding:"11px 28px", borderRadius:10,
                  cursor: status === "loading" ? "not-allowed" : "pointer",
                  display:"flex", alignItems:"center", gap:10,
                  boxShadow:"0 4px 18px rgba(124,58,237,0.38)", transition:"transform 0.2s, box-shadow 0.2s",
                }}
                  onMouseEnter={e => { if (status !== "loading") { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 8px 26px rgba(124,58,237,0.5)"; }}}
                  onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 4px 18px rgba(124,58,237,0.38)"; }}
                >
                  {status === "loading" ? (
                    <>
                      <div style={{ width:16, height:16, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"white", animation:"spin 0.7s linear infinite" }} />
                      Criando evento...
                    </>
                  ) : "✦ Criar evento"}
                </button>
              )}
            </div>
          </div>

          {/* Footer note */}
          <div className="fade-up d6" style={{ textAlign:"center", marginTop:24 }}>
            <p style={{ fontSize:12.5, color:C.faint, fontWeight:500 }}>
              Certificados gerados automaticamente após o evento.{" "}
              <span style={{ color:C.violetLight, cursor:"pointer" }}>Saiba mais →</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
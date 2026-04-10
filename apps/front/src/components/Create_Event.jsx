import { useState, useCallback } from "react";
import { Calendar, Clock, MapPin, User, Globe, Lock, ArrowLeft, ArrowRight, Check, AlertCircle } from "lucide-react";
import DotGrid from "./DotGrid";
import Particles from "./Particles";

const STEP_LABELS = ["Informações", "Data & Local", "Certificado", "Revisão"];

export default function CreateEvent({ onBack }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "tecnologia",
    date: "",
    time: "",
    location: "",
    locationUrl: "",
    workload: "",
    certType: "participante",
    issuer: "",
    certMessage: "",
    capacity: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [errMsg, setErrMsg] = useState("");

  const handleBack = () => {
    if (step === 0) {
      setForm({
        name: "", description: "", category: "tecnologia",
        date: "", time: "", location: "", locationUrl: "",
        workload: "", certType: "participante", issuer: "",
        certMessage: "", capacity: "",
      });
      setErrors({});
      setStatus("idle");
      setErrMsg("");

      window.location.href = "/userDashboard"; 
    } else {
      prev();
    }
  };


  const set = useCallback((name, value) => {
    setForm(f => ({ ...f, [name]: value }));
    setErrors(e => ({ ...e, [name]: "" }));
  }, []);

  const validate = (s) => {
    const e = {};
    if (s === 0) {
      if (!form.name.trim()) e.name = "Campo obrigatório";
      if (!form.description.trim()) e.description = "Campo obrigatório";
    }
    if (s === 1) {
      if (!form.date) e.date = "Campo obrigatório";
      if (!form.time) e.time = "Campo obrigatório";
      if (!form.location.trim()) e.location = "Campo obrigatório";
    }
    if (s === 2) {
      if (!form.workload) e.workload = "Campo obrigatório";
      if (!form.issuer.trim()) e.issuer = "Campo obrigatório";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(step)) setStep(s => s + 1); };
  const prev = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setStatus("loading");
    setErrMsg("");
    try {
      const res = await fetch("http://localhost:5001/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: form.name,
          description: form.description,
          date: form.date && form.time ? `${form.date}T${form.time}:00` : null,
          location: form.location,
          isPublic: true,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || `Erro ${res.status}`);
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrMsg(err.message || "Falha ao criar evento.");
    }
  };

  // ── Tela de sucesso ──
  if (status === "success") {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-400 mx-auto mb-6 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Check size={36} className="text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-accent-foreground mb-3">
            Evento criado!
          </h2>
          <p className="text-accent-foreground/60 mb-8">
            <strong className="text-primary">{form.name}</strong> foi publicado com sucesso.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setForm({
                  name: "", description: "", category: "tecnologia",
                  date: "", time: "", location: "", locationUrl: "",
                  workload: "", certType: "participante", issuer: "",
                  certMessage: "", capacity: "",
                });
                window.location.href = "/userDashboard";
              }}
              className="px-5 flex cursor-pointer hover:scale-[1.05] justify-center items-center py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-[#8b5cf6] to-[#9333ea] shadow-md hover:shadow-lg transition-all"
            >
              <Check size={16} className="mr-2" />
              Concluir
            </button>
            {onBack && (
              <button
                onClick={onBack}
                className="px-5 py-2.5 rounded-lg text-sm font-bold text-accent-foreground bg-sidebar border border-border hover:bg-sidebar-accent transition-all"
              >
                ← Voltar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background ">

    <div className="absolute inset-0 w-full h-full z-0 " >
        <div className="absolute inset-0 w-full h-full">
            <Particles
                
                particleCount={150}
                particleSpread={8}
                speed={0.05}
                particleColors={["#8b5cf6", "#a78bfa", "#6d28d9"]}
                particleBaseSize={80}
                alphaParticles={true}
                disableRotation={false}
                className="w-full h-full"
            />
        </div>

          
    </div>

      <div className="max-w-2xl mx-auto px-6 py-12 relative z-10">

        {/* Header */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-400">
          <h1 className="text-3xl md:text-4xl font-extrabold text-accent-foreground mb-3">
            Seu evento,{" "}
            <span className="bg-gradient-to-r from-[#a78bfa] to-[#8b5cf6] bg-clip-text text-transparent">
              em minutos.
            </span>
          </h1>
          <p className="text-accent-foreground/60">
            Preencha as informações abaixo e publique seu evento com certificados automáticos.
          </p>
        </div>

        {/* Step Dots */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {STEP_LABELS.map((label, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                      ${done
                        ? "bg-gradient-to-br from-[#8b5cf6] to-[#9333ea] text-white"
                        : active
                          ? "bg-primary/10 border-2 border-primary text-primary"
                          : "bg-sidebar border border-border text-accent-foreground/40"
                      }
                    `}
                  >
                    {done ? <Check size={14} /> : i + 1}
                  </div>
                  <span className={`
                    text-[11px] font-bold whitespace-nowrap transition-colors
                    ${active ? "text-primary" : done ? "text-accent-foreground/60" : "text-accent-foreground/30"}
                  `}>
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`w-12 h-px mx-1 mb-6 transition-colors ${done ? "bg-primary/40" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <div className="bg-sidebar border border-border rounded-xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-6 duration-400">
          
          {/* Step 0 - Informações */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                  Nome do evento <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set("name", e.target.value)}
                  placeholder="ex: Tech Summit Brasil 2025"
                  className={`
                    w-full px-4 py-2.5 rounded-lg text-sm bg-background border 
                    ${errors.name ? "border-red-400/50" : "border-border"} 
                    focus:border-primary outline-none transition-colors
                  `}
                />
                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                  Descrição <span className="text-primary">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={e => set("description", e.target.value)}
                  placeholder="Descreva o evento, programação e público-alvo..."
                  rows={4}
                  className={`
                    w-full px-4 py-2.5 rounded-lg text-sm bg-background border resize-y
                    ${errors.description ? "border-red-400/50" : "border-border"} 
                    focus:border-primary outline-none transition-colors
                  `}
                />
                {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-accent-foreground mb-1.5">Categoria</label>
                  <select
                    value={form.category}
                    onChange={e => set("category", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg text-sm bg-background border border-border focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="tecnologia">💻 Tecnologia</option>
                    <option value="negocios">💼 Negócios</option>
                    <option value="design">🎨 Design</option>
                    <option value="educacao">📚 Educação</option>
                    <option value="saude">🏥 Saúde</option>
                    <option value="cultura">🎭 Cultura</option>
                    <option value="outro">📌 Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-accent-foreground mb-1.5">Capacidade</label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={e => set("capacity", e.target.value)}
                    placeholder="ex: 200"
                    className="w-full px-4 py-2.5 rounded-lg text-sm bg-background border border-border focus:border-primary outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1 - Data & Local */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                    Data <span className="text-primary">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => set("date", e.target.value)}
                    className={`
                      w-full px-4 py-2.5 rounded-lg text-sm bg-background border
                      ${errors.date ? "border-red-400/50" : "border-border"}
                      focus:border-primary outline-none
                    `}
                  />
                  {errors.date && <p className="text-xs text-red-400 mt-1">{errors.date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                    Horário <span className="text-primary">*</span>
                  </label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={e => set("time", e.target.value)}
                    className={`
                      w-full px-4 py-2.5 rounded-lg text-sm bg-background border
                      ${errors.time ? "border-red-400/50" : "border-border"}
                      focus:border-primary outline-none
                    `}
                  />
                  {errors.time && <p className="text-xs text-red-400 mt-1">{errors.time}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                  Local <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => set("location", e.target.value)}
                  placeholder="ex: Centro de Convenções Frei Caneca, SP"
                  className={`
                    w-full px-4 py-2.5 rounded-lg text-sm bg-background border
                    ${errors.location ? "border-red-400/50" : "border-border"}
                    focus:border-primary outline-none
                  `}
                />
                {errors.location && <p className="text-xs text-red-400 mt-1">{errors.location}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-accent-foreground mb-1.5">Link do local / online</label>
                <input
                  type="url"
                  value={form.locationUrl}
                  onChange={e => set("locationUrl", e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-lg text-sm bg-background border border-border focus:border-primary outline-none"
                />
                <p className="text-xs text-accent-foreground/40 mt-1">Opcional — Google Maps ou link do Meet/Zoom</p>
              </div>
            </div>
          )}

          {/* Step 2 - Certificado */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                    Carga horária (h) <span className="text-primary">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.workload}
                    onChange={e => set("workload", e.target.value)}
                    placeholder="ex: 16"
                    className={`
                      w-full px-4 py-2.5 rounded-lg text-sm bg-background border
                      ${errors.workload ? "border-red-400/50" : "border-border"}
                      focus:border-primary outline-none
                    `}
                  />
                  {errors.workload && <p className="text-xs text-red-400 mt-1">{errors.workload}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-accent-foreground mb-1.5">Tipo de certificado</label>
                  <select
                    value={form.certType}
                    onChange={e => set("certType", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg text-sm bg-background border border-border focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="participante">🎟 Participante</option>
                    <option value="palestrante">🎤 Palestrante</option>
                    <option value="organizador">🗂 Organizador</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                  Emissor / Organização <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={form.issuer}
                  onChange={e => set("issuer", e.target.value)}
                  placeholder="ex: Instituto de Tecnologia Brasil"
                  className={`
                    w-full px-4 py-2.5 rounded-lg text-sm bg-background border
                    ${errors.issuer ? "border-red-400/50" : "border-border"}
                    focus:border-primary outline-none
                  `}
                />
                {errors.issuer && <p className="text-xs text-red-400 mt-1">{errors.issuer}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-accent-foreground mb-1.5">Mensagem personalizada</label>
                <textarea
                  value={form.certMessage}
                  onChange={e => set("certMessage", e.target.value)}
                  placeholder="Mensagem que aparecerá no certificado..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg text-sm bg-background border border-border focus:border-primary outline-none resize-y"
                />
                <p className="text-xs text-accent-foreground/40 mt-1">Opcional</p>
              </div>
            </div>
          )}

          {/* Step 3 - Revisão */}
          {step === 3 && (
            <div className="space-y-6">
              <p className="text-sm text-accent-foreground/60">
                Confira as informações antes de publicar o evento.
              </p>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-accent-foreground/40 mb-3">Informações</div>
                <div className="space-y-2">
                  {form.name && (
                    <div className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border">
                      <span className="text-lg">📋</span>
                      <div>
                        <div className="text-[10px] font-bold uppercase text-accent-foreground/40">Nome</div>
                        <div className="text-sm font-medium">{form.name}</div>
                      </div>
                    </div>
                  )}
                  {form.description && (
                    <div className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border">
                      <span className="text-lg">📝</span>
                      <div>
                        <div className="text-[10px] font-bold uppercase text-accent-foreground/40">Descrição</div>
                        <div className="text-sm font-medium">{form.description}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-accent-foreground/40 mb-3">Data & Local</div>
                <div className="space-y-2">
                  {form.date && form.time && (
                    <div className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border">
                      <span className="text-lg">📅</span>
                      <div>
                        <div className="text-[10px] font-bold uppercase text-accent-foreground/40">Início</div>
                        <div className="text-sm font-medium">{form.date} às {form.time}</div>
                      </div>
                    </div>
                  )}
                  {form.location && (
                    <div className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border">
                      <span className="text-lg">📍</span>
                      <div>
                        <div className="text-[10px] font-bold uppercase text-accent-foreground/40">Local</div>
                        <div className="text-sm font-medium">{form.location}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-accent-foreground/40 mb-3">Certificado</div>
                <div className="space-y-2">
                  {form.workload && (
                    <div className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border">
                      <span className="text-lg">⏱</span>
                      <div>
                        <div className="text-[10px] font-bold uppercase text-accent-foreground/40">Carga horária</div>
                        <div className="text-sm font-medium">{form.workload}h</div>
                      </div>
                    </div>
                  )}
                  {form.certType && (
                    <div className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border">
                      <span className="text-lg">🎓</span>
                      <div>
                        <div className="text-[10px] font-bold uppercase text-accent-foreground/40">Tipo</div>
                        <div className="text-sm font-medium">{form.certType}</div>
                      </div>
                    </div>
                  )}
                  {form.issuer && (
                    <div className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border">
                      <span className="text-lg">🏛</span>
                      <div>
                        <div className="text-[10px] font-bold uppercase text-accent-foreground/40">Emissor</div>
                        <div className="text-sm font-medium">{form.issuer}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {status === "error" && (
                <div className="flex gap-3 p-3 rounded-lg bg-red-400/5 border border-red-400/20">
                  <AlertCircle size={18} className="text-red-400 shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-red-400">Falha ao criar evento</div>
                    <div className="text-xs text-red-400/70">{errMsg}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <button
              
              onClick={handleBack}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-accent-foreground/60 border border-border hover:text-accent-foreground hover:border-primary/30 transition-all"
            >
              <ArrowLeft size={14} />
              {step === 0 ? "Cancelar" : "Anterior"}
            </button>

            <div className="flex gap-1.5">
              {STEP_LABELS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${i === step ? "w-5 bg-primary" : i < step ? "w-1.5 bg-primary/40" : "w-1.5 bg-border"}`}
                />
              ))}
            </div>

            {step < STEP_LABELS.length - 1 ? (
              <button
                onClick={next}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-[#8b5cf6] to-[#9333ea] shadow-md hover:shadow-lg transition-all"
              >
                Próximo
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={status === "loading"}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-[#8b5cf6] to-[#9333ea] shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {status === "loading" ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Criando...
                  </>
                ) : (
                  "✦ Criar evento"
                )}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-accent-foreground/30 mt-6">
          Certificados gerados automaticamente após o evento.
        </p>
      </div>
    </div>
  );
}
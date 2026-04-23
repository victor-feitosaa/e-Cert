import { useState, useCallback } from "react";
import {
  Calendar, Clock, MapPin, ArrowLeft, ArrowRight, Check,
  AlertCircle, ClipboardList, FileText, CalendarDays,
  Timer, GraduationCap, Building2, Tag, Hash, UserPlus, Trash2, User
} from "lucide-react";
import Particles from "./Particles";

const STEP_LABELS = ["Informações", "Data & Local", "Equipe", "Revisão"];

export default function CreateEvent({ onBack }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "tecnologia",
    date_start: "",
    date_end: "",
    time_start: "",
    time_end: "",
    location: "",
    locationUrl: "",
    workload: "",
    certType: "participante",
    issuer: "",
    certMessage: "",
    capacity: "",
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberJob, setNewMemberJob] = useState("");
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [errMsg, setErrMsg] = useState("");

  const handleBack = () => {
    if (step === 0) {
      setForm({
        name: "", description: "", category: "tecnologia",
        date_start: "", date_end: "", time_start: "", time_end: "", location: "", locationUrl: "",
        workload: "", certType: "participante", issuer: "",
        certMessage: "", capacity: "",
      });
      setTeamMembers([]);
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

  const addTeamMember = () => {
    if (!newMemberName.trim()) {
      setErrors(prev => ({ ...prev, teamMemberName: "Nome do membro é obrigatório" }));
      return;
    }
    if (!newMemberJob.trim()) {
      setErrors(prev => ({ ...prev, teamMemberJob: "Função é obrigatória" }));
      return;
    }
    
    setTeamMembers(prev => [...prev, { 
      id: Date.now(), 
      name: newMemberName.trim(), 
      job: newMemberJob.trim() 
    }]);
    setNewMemberName("");
    setNewMemberJob("");
    setErrors(prev => ({ ...prev, teamMemberName: "", teamMemberJob: "" }));
  };

  const removeTeamMember = (id) => {
    setTeamMembers(prev => prev.filter(member => member.id !== id));
  };

  const validate = (s) => {
    const e = {};
    if (s === 0) {
      if (!form.name.trim()) e.name = "Campo obrigatório";
      if (!form.description.trim()) e.description = "Campo obrigatório";
    }
    if (s === 1) {
      if (!form.date_start) e.date_start = "Campo obrigatório";
      if (!form.date_end) e.date_end = "Campo obrigatório";
      if (!form.time_start) e.time_start = "Campo obrigatório";
      if (!form.time_end) e.time_end = "Campo obrigatório";
      if (!form.location.trim()) e.location = "Campo obrigatório";
    }
    if (s === 2) {
      // Sem validação obrigatória para equipe
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
    const eventRes = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        title: form.name,
        description: form.description,
        date_start: form.date_start && form.time_start ? `${form.date_start}T${form.time_start}:00` : null,
        date_end: form.date_end && form.time_end ? `${form.date_end}T${form.time_end}:00` : null,
        location: form.location,
        isPublic: true,
        workload: form.workload ? parseInt(form.workload) : undefined,
        capacity: form.capacity ? parseInt(form.capacity) : undefined,
        category: form.category,
        certType: form.certType,
        issuer: form.issuer,
        certMessage: form.certMessage,
        locationUrl: form.locationUrl,
        teamMembers: teamMembers,
      }),
    });

    if (!eventRes.ok) {
      const data = await eventRes.json().catch(() => ({}));
      throw new Error(data?.message || data?.error || `Erro ${eventRes.status}`);
    }

    const eventData = await eventRes.json();
    const createdEventId = eventData?.data?.event?.id || eventData?.event?.id || eventData?.id;
    
    // Redireciona diretamente para a página do evento
    if (createdEventId) {
      window.location.href = `/eventPageAdm?id=${createdEventId}`;
    } else {
      window.location.href = "/userDashboard";
    }
    
  } catch (err) {
    console.error("Erro ao criar evento:", err);
    setStatus("error");
    setErrMsg(err.message || "Falha ao criar evento.");
  }
};

  // Tela de sucesso
//   if (status === "success") {
//   // Recupera o eventId do estado ou do localStorage
//   const eventId = window.__createdEventId || localStorage.getItem('lastCreatedEventId');
  
//   return (
//     <div className="dark min-h-screen bg-background flex items-center justify-center p-6">
//       <div className="text-center max-w-md animate-in fade-in zoom-in duration-300">
//         <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-400 mx-auto mb-6 flex items-center justify-center shadow-lg shadow-emerald-500/30">
//           <Check size={36} className="text-white" />
//         </div>
//         <h2 className="text-3xl font-extrabold text-accent-foreground mb-3">
//           Evento criado!
//         </h2>
//         <p className="text-accent-foreground/60 mb-8">
//           <strong className="text-primary">{form.name}</strong> foi publicado com sucesso.
//         </p>
//         <div className="flex gap-3 justify-center">
//           <button
//             onClick={() => {
//               // Redireciona para a página do evento
//               if (eventId) {
//                 window.location.href = `/eventPageAdm?id=${eventId}`;
//               } else {
//                 // Fallback: vai para o dashboard
//                 window.location.href = "/userDashboard";
//               }
//             }}
//             className="px-5 flex cursor-pointer hover:scale-[1.05] justify-center items-center py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-[#8b5cf6] to-[#9333ea] shadow-md hover:shadow-lg transition-all"
//           >
//             <Check size={16} className="mr-2" />
//             Ir para o evento
//           </button>
//           <button
//             onClick={() => {
//               window.location.href = "/userDashboard";
//             }}
//             className="px-5 py-2.5 rounded-lg text-sm font-bold text-accent-foreground bg-sidebar border border-border hover:bg-sidebar-accent transition-all"
//           >
//             ← Voltar ao Dashboard
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

  // Função para validar ano com máximo 4 dígitos
  const handleDateChange = (field, value) => {
    if (value) {
      const year = value.split('-')[0];
      if (year && year.length > 4) {
        return; // Não permite ano com mais de 4 dígitos
      }
    }
    set(field, value);
  };

  return (
    <div className="dark min-h-screen bg-background">
      <div className="absolute inset-0 w-full h-full z-0">
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
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                    ${done
                      ? "bg-gradient-to-br from-[#8b5cf6] to-[#9333ea] text-white"
                      : active
                        ? "bg-primary/10 border-2 border-primary text-primary"
                        : "bg-sidebar border border-border text-accent-foreground/40"
                    }
                  `}>
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
                    <option value="tecnologia">Tecnologia</option>
                    <option value="negocios">Negócios</option>
                    <option value="design">Design</option>
                    <option value="educacao">Educação</option>
                    <option value="saude">Saúde</option>
                    <option value="cultura">Cultura</option>
                    <option value="outro">Outro</option>
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
                    Data de início <span className="text-primary">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.date_start}
                    onChange={e => handleDateChange("date_start", e.target.value)}
                    className={`
                      w-full px-4 py-2.5 rounded-lg text-sm bg-background border
                      ${errors.date_start ? "border-red-400/50" : "border-border"}
                      focus:border-primary outline-none
                    `}
                  />
                  {errors.date_start && <p className="text-xs text-red-400 mt-1">{errors.date_start}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                    Horário início <span className="text-primary">*</span>
                  </label>
                  <input
                    type="time"
                    value={form.time_start}
                    onChange={e => set("time_start", e.target.value)}
                    className={`
                      w-full px-4 py-2.5 rounded-lg text-sm bg-background border
                      ${errors.time_start ? "border-red-400/50" : "border-border"}
                      focus:border-primary outline-none
                    `}
                  />
                  {errors.time_start && <p className="text-xs text-red-400 mt-1">{errors.time_start}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                    Data de término <span className="text-primary">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.date_end}
                    onChange={e => handleDateChange("date_end", e.target.value)}
                    className={`
                      w-full px-4 py-2.5 rounded-lg text-sm bg-background border
                      ${errors.date_end ? "border-red-400/50" : "border-border"}
                      focus:border-primary outline-none
                    `}
                  />
                  {errors.date_end && <p className="text-xs text-red-400 mt-1">{errors.date_end}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                    Horário término <span className="text-primary">*</span>
                  </label>
                  <input
                    type="time"
                    value={form.time_end}
                    onChange={e => set("time_end", e.target.value)}
                    className={`
                      w-full px-4 py-2.5 rounded-lg text-sm bg-background border
                      ${errors.time_end ? "border-red-400/50" : "border-border"}
                      focus:border-primary outline-none
                    `}
                  />
                  {errors.time_end && <p className="text-xs text-red-400 mt-1">{errors.time_end}</p>}
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

          {/* Step 2 - Equipe */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                  Membros da Equipe
                </label>
                <p className="text-xs text-accent-foreground/40 mb-3">
                  Adicione os membros da equipe organizadora e suas respectivas funções.
                </p>
                
                {/* Lista de membros */}
                {teamMembers.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border">
                        <div className="flex items-center gap-3">
                          <User size={16} className="text-purple-400" />
                          <div>
                            <p className="text-sm font-medium text-accent-foreground">{member.name}</p>
                            <p className="text-xs text-accent-foreground/60">{member.job}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeTeamMember(member.id)}
                          className="p-1.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Adicionar novo membro */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <input
                      type="text"
                      value={newMemberName}
                      onChange={e => setNewMemberName(e.target.value)}
                      placeholder="Nome do membro"
                      className={`
                        w-full px-4 py-2.5 rounded-lg text-sm bg-background border
                        ${errors.teamMemberName ? "border-red-400/50" : "border-border"}
                        focus:border-primary outline-none transition-colors
                      `}
                    />
                    {errors.teamMemberName && <p className="text-xs text-red-400 mt-1">{errors.teamMemberName}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      value={newMemberJob}
                      onChange={e => setNewMemberJob(e.target.value)}
                      placeholder="Função (ex: Organizador, Palestrante)"
                      className={`
                        w-full px-4 py-2.5 rounded-lg text-sm bg-background border
                        ${errors.teamMemberJob ? "border-red-400/50" : "border-border"}
                        focus:border-primary outline-none transition-colors
                      `}
                    />
                    {errors.teamMemberJob && <p className="text-xs text-red-400 mt-1">{errors.teamMemberJob}</p>}
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={addTeamMember}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold text-purple-400 bg-purple-400/10 border border-purple-400/20 hover:bg-purple-400/20 transition-colors"
                >
                  <UserPlus size={16} />
                  Adicionar membro
                </button>
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
                      <ClipboardList size={18} className="text-accent-foreground/40 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] font-bold uppercase text-accent-foreground/40">Nome</div>
                        <div className="text-sm font-medium">{form.name}</div>
                      </div>
                    </div>
                  )}
                  {form.description && (
                    <div className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border">
                      <FileText size={18} className="text-accent-foreground/40 shrink-0 mt-0.5" />
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
                  {form.date_start && form.time_start && (
                    <div className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border">
                      <CalendarDays size={18} className="text-accent-foreground/40 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] font-bold uppercase text-accent-foreground/40">Início</div>
                        <div className="text-sm font-medium">{form.date_start} às {form.time_start}</div>
                      </div>
                    </div>
                  )}
                  {form.date_end && form.time_end && (
                    <div className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border">
                      <CalendarDays size={18} className="text-accent-foreground/40 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] font-bold uppercase text-accent-foreground/40">Término</div>
                        <div className="text-sm font-medium">{form.date_end} às {form.time_end}</div>
                      </div>
                    </div>
                  )}
                  {form.location && (
                    <div className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border">
                      <MapPin size={18} className="text-accent-foreground/40 shrink-0 mt-0.5" />
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
                      <Timer size={18} className="text-accent-foreground/40 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] font-bold uppercase text-accent-foreground/40">Carga horária</div>
                        <div className="text-sm font-medium">{form.workload}h</div>
                      </div>
                    </div>
                  )}
                  {form.certType && (
                    <div className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border">
                      <GraduationCap size={18} className="text-accent-foreground/40 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] font-bold uppercase text-accent-foreground/40">Tipo</div>
                        <div className="text-sm font-medium">{form.certType}</div>
                      </div>
                    </div>
                  )}
                  {form.issuer && (
                    <div className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border">
                      <Building2 size={18} className="text-accent-foreground/40 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] font-bold uppercase text-accent-foreground/40">Emissor</div>
                        <div className="text-sm font-medium">{form.issuer}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {teamMembers.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-accent-foreground/40 mb-3">Equipe</div>
                  <div className="space-y-2">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border">
                        <User size={18} className="text-accent-foreground/40 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-[10px] font-bold uppercase text-accent-foreground/40">Membro</div>
                          <div className="text-sm font-medium">{member.name} - {member.job}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
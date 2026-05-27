import { useState, useCallback, useEffect } from "react";
import {
  Calendar, MapPin, ArrowLeft, ArrowRight, Check,
  AlertCircle, ClipboardList, FileText, CalendarDays,
  UserPlus, Trash2, Plus, Sparkles, Users, Mail, Send, Target, Edit2
} from "lucide-react";
import Particles from "./Particles";

const STEP_LABELS = ["Informações", "Seções", "Equipe", "Revisão"];

// Configuração de funções (badges) – igual ao CreateEvent
const TEAM_ROLES = [
  { value: "SPEAKER",    label: "Palestrante", color: "text-blue-400",  bg: "bg-blue-500/10",  border: "border-blue-500/20"  },
  { value: "STAFF",      label: "Staff",       color: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20"   },
  { value: "VOLUNTEER",  label: "Voluntário",  color: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20" },
  { value: "INSTRUCTOR", label: "Instrutor",   color: "text-amber-400",   bg: "bg-amber-500/10",  border: "border-amber-500/20"  },
  { value: "OTHER",      label: "Outro",       color: "text-gray-400",    bg: "bg-gray-500/10",   border: "border-gray-500/20"   },
];

const getRoleFromJob = (job) => {
  const jobLower = job.toLowerCase();
  if (jobLower.includes("palestrante")) return "SPEAKER";
  if (jobLower.includes("staff")) return "STAFF";
  if (jobLower.includes("volunt")) return "VOLUNTEER";
  if (jobLower.includes("instrutor")) return "INSTRUCTOR";
  return "OTHER";
};

export default function CreateSubEvent({ eventId, onBack }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    locationUrl: "",
    capacity: "",
  });
  const [sections, setSections] = useState([]);
  const [newSection, setNewSection] = useState({
    title: "",
    date_start: "",
    time_start: "",
    date_end: "",
    time_end: "",
    location: "",
  });

  // Equipe do subevento (agora com email e job)
  const [teamMembers, setTeamMembers] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberJob, setNewMemberJob] = useState("");

  // Membros já existentes no evento principal (para seleção)
  const [eventTeamMembers, setEventTeamMembers] = useState([]);

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [errMsg, setErrMsg] = useState("");
  const [loadingEventTeam, setLoadingEventTeam] = useState(false);

  // Buscar membros do evento principal para poder selecionar
  useEffect(() => {
    const fetchEventTeam = async () => {
      if (!eventId) return;
      setLoadingEventTeam(true);
      try {
        const res = await fetch(`/api/events/${eventId}/team`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          const team = data?.data?.team || data?.team || [];
          setEventTeamMembers(team);
        }
      } catch (err) {
        console.error("Erro ao buscar equipe do evento:", err);
      } finally {
        setLoadingEventTeam(false);
      }
    };
    fetchEventTeam();
  }, [eventId]);

  const goBack = () => {
    const base = typeof onBack === "string"
      ? onBack
      : `/eventPageAdm?eventId=${eventId}`;
    window.location.href = base;
  };

  const handleBack = () => {
    if (step === 0) goBack();
    else prev();
  };

  const set = useCallback((name, value) => {
    setForm(f => ({ ...f, [name]: value }));
    setErrors(e => ({ ...e, [name]: "" }));
  }, []);

  // Validação de ano com máximo 4 dígitos (igual ao CreateEvent)
  const validateYear = (value) => {
    if (!value) return true;
    const year = value.split('-')[0];
    return !(year && year.length > 4);
  };

  const handleDateChange = (field, value, isSection = false) => {
    if (!validateYear(value)) return;
    if (isSection) {
      setNewSection(prev => ({ ...prev, [field]: value }));
    } else {
      set(field, value);
    }
  };

  // ========== SEÇÕES ==========
  const addSection = () => {
    const newErrors = {};
    if (!newSection.date_start) newErrors.sectionDate = "Data de início é obrigatória";
    if (!newSection.time_start) newErrors.sectionTime = "Horário de início é obrigatório";
    if (!newSection.date_end) newErrors.sectionDateEnd = "Data de término é obrigatória";
    if (!newSection.time_end) newErrors.sectionTimeEnd = "Horário de término é obrigatório";

    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      return;
    }

    setSections(prev => [...prev, {
      id: Date.now(),
      title: newSection.title || null,
      date_start: newSection.date_start,
      time_start: newSection.time_start,
      date_end: newSection.date_end,
      time_end: newSection.time_end,
      location: newSection.location || null,
    }]);
    
    setNewSection({
      title: "",
      date_start: "",
      time_start: "",
      date_end: "",
      time_end: "",
      location: "",
    });
    setErrors(prev => ({ ...prev, sectionDate: "", sectionTime: "", sectionDateEnd: "", sectionTimeEnd: "" }));
  };

  const removeSection = (id) => {
    setSections(prev => prev.filter(section => section.id !== id));
  };

  // ========== EQUIPE DO SUBEVENTO ==========
  const addTeamMember = () => {
    if (!newMemberEmail.trim()) {
      setErrors(prev => ({ ...prev, teamMemberEmail: "E-mail é obrigatório" }));
      return;
    }
    if (!newMemberEmail.includes("@")) {
      setErrors(prev => ({ ...prev, teamMemberEmail: "E-mail inválido" }));
      return;
    }
    if (!newMemberJob.trim()) {
      setErrors(prev => ({ ...prev, teamMemberJob: "Função é obrigatória" }));
      return;
    }
    if (teamMembers.some(m => m.email === newMemberEmail.trim().toLowerCase())) {
      setErrors(prev => ({ ...prev, teamMemberEmail: "Membro já adicionado" }));
      return;
    }
    
    setTeamMembers(prev => [...prev, { 
      id: Date.now(), 
      email: newMemberEmail.trim().toLowerCase(),
      job: newMemberJob.trim(),
    }]);
    setNewMemberEmail("");
    setNewMemberJob("");
    setErrors(prev => ({ ...prev, teamMemberEmail: "", teamMemberJob: "" }));
  };

  const removeTeamMember = (id) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
  };

  // Selecionar membro já existente no evento principal
  const selectExistingMember = (email) => {
    const member = eventTeamMembers.find(m => m.user?.email === email || m.email === email);
    if (member) {
      const memberEmail = member.user?.email || member.email;
      const memberJob = member.job || (member.roleDescription || "Membro");
      setNewMemberEmail(memberEmail);
      setNewMemberJob(memberJob);
      setErrors(prev => ({ ...prev, teamMemberEmail: "", teamMemberJob: "" }));
    }
  };

  // ========== VALIDAÇÃO ==========
  const validate = (s) => {
    const e = {};
    if (s === 0) {
      if (!form.name.trim()) e.name = "Campo obrigatório";
      if (!form.description.trim()) e.description = "Campo obrigatório";
      if (!form.location.trim()) e.location = "Local é obrigatório";
      if (!form.capacity) e.capacity = "Capacidade é obrigatória";
      else if (parseInt(form.capacity) <= 0) e.capacity = "Capacidade deve ser maior que zero";
    }
    if (s === 1) {
      if (sections.length === 0) e.sections = "Adicione pelo menos uma seção";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(step)) setStep(s => s + 1); };
  const prev = () => setStep(s => s - 1);

  // ========== SUBMISSÃO ==========
  const handleSubmit = async () => {
    setStatus("loading");
    setErrMsg("");

    if (!form.location.trim()) {
      setStatus("error");
      setErrMsg("O local do subevento é obrigatório");
      return;
    }
    if (!form.capacity) {
      setStatus("error");
      setErrMsg("A capacidade do subevento é obrigatória");
      return;
    }
    if (parseInt(form.capacity) <= 0) {
      setStatus("error");
      setErrMsg("A capacidade deve ser maior que zero");
      return;
    }
    if (sections.length === 0) {
      setStatus("error");
      setErrMsg("Adicione pelo menos uma seção ao subevento");
      return;
    }

    try {
      // 1. Criar subevento
      const subeventRes = await fetch(`/api/events/${eventId}/subevents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: form.name,
          description: form.description,
          location: form.location,
          locationUrl: form.locationUrl,
          capacity: parseInt(form.capacity),
        }),
      });

      if (!subeventRes.ok) {
        const errorText = await subeventRes.text();
        throw new Error(`Erro ${subeventRes.status}: ${errorText}`);
      }

      const subeventData = await subeventRes.json();
      const createdSubeventId = subeventData?.data?.subEvent?.id || subeventData?.id;
      if (!createdSubeventId) throw new Error("Não foi possível obter o ID do subevento");

      // 2. Adicionar seções
      for (const section of sections) {
        await fetch(`/api/events/${eventId}/subevents/${createdSubeventId}/sections`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: section.title,
            date_start: `${section.date_start}T${section.time_start}:00.000Z`,
            date_end: `${section.date_end}T${section.time_end}:00.000Z`,
            location: section.location,
          }),
        });
      }

      // 3. Convidar membros da equipe do subevento
      for (const member of teamMembers) {
        await fetch(`/api/events/${eventId}/subevents/${createdSubeventId}/team/invite`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email: member.email, job: member.job }),
        }).catch(err => console.error(`Erro ao convidar ${member.email}:`, err));
      }

      window.location.href = `/eventPageAdm?id=${eventId}&tab=subeventos`;
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrMsg(err.message || "Falha ao criar subevento.");
    }
  };

  // Estilo de badge (igual ao CreateEvent)
  const getMemberBadgeStyle = (job) => {
    const role = getRoleFromJob(job);
    const roleConfig = TEAM_ROLES.find(r => r.value === role) || TEAM_ROLES[4];
    return {
      bg: roleConfig.bg,
      border: roleConfig.border,
      color: roleConfig.color,
      label: roleConfig.label
    };
  };

  // Tela de erro
  if (status === "error") {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-400 mx-auto mb-6 flex items-center justify-center shadow-lg shadow-red-500/30">
            <AlertCircle size={36} className="text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-accent-foreground mb-3">Erro ao criar subevento</h2>
          <p className="text-accent-foreground/60 mb-8">{errMsg}</p>
          <button onClick={() => window.location.reload()} className="px-5 cursor-pointer py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-[#8b5cf6] to-[#9333ea] shadow-md hover:shadow-lg">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background">
      <div className="absolute inset-0 w-full h-full z-0">
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

      <div className="max-w-2xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-400">
          <h1 className="text-3xl md:text-4xl font-extrabold text-accent-foreground mb-3">
            Novo SubEvento,{" "}
            <span className="bg-gradient-to-r from-[#a78bfa] to-[#8b5cf6] bg-clip-text text-transparent">
              complemente sua grade.
            </span>
          </h1>
          <p className="text-accent-foreground/60">
            Adicione atividades ao seu evento principal.
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
        <div className="bg-[#11101B] border border-border rounded-xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-6 duration-400">

          {/* STEP 0 - INFORMAÇÕES DO SUBEVENTO */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                  Nome do subevento <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set("name", e.target.value)}
                  placeholder="ex: Workshop de React, Palestra Principal"
                  className={`w-full px-4 py-2.5 text-accent-foreground  rounded-lg text-sm bg-[#11101B] border ${errors.name ? "border-red-400/50" : "border-border"} focus:border-primary outline-none placeholder:text-accent-foreground/40`}
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
                  rows={4}
                  placeholder="Descreva o conteúdo, objetivos e público-alvo desta atividade..."
                  className={`w-full px-4 py-2.5 text-accent-foreground   rounded-lg text-sm bg-[#11101B] border resize-y ${errors.description ? "border-red-400/50" : "border-border"} focus:border-primary outline-none placeholder:text-accent-foreground/40`}
                />
                {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                    Local <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => set("location", e.target.value)}
                    placeholder="ex: Auditório Principal"
                    className={`w-full px-4 py-2.5  text-accent-foreground  rounded-lg text-sm bg-[#11101B] border ${errors.location ? "border-red-400/50" : "border-border"} focus:border-primary outline-none placeholder:text-accent-foreground/40`}
                  />
                  {errors.location && <p className="text-xs text-red-400 mt-1">{errors.location}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                    Capacidade <span className="text-primary">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={e => set("capacity", e.target.value)}
                    placeholder="ex: 50"
                    className={`w-full px-4 py-2.5 rounded-lg text-sm  text-accent-foreground  bg-[#11101B] border ${errors.capacity ? "border-red-400/50" : "border-border"} focus:border-primary outline-none placeholder:text-accent-foreground/40`}
                  />
                  {errors.capacity && <p className="text-xs text-red-400 mt-1">{errors.capacity}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-accent-foreground mb-1.5">Link do local / online</label>
                <input
                  type="url"
                  value={form.locationUrl}
                  onChange={e => set("locationUrl", e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-lg text-sm  text-accent-foreground  bg-[#11101B] border border-border focus:border-primary outline-none placeholder:text-accent-foreground/40"
                />
              </div>
            </div>
          )}

          {/* STEP 1 - SEÇÕES */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                  Seções / Horários <span className="text-primary">*</span>
                </label>
                <p className="text-xs text-accent-foreground/40 mb-3">
                  Adicione diferentes horários para este subevento (ex: manhã, tarde, múltiplos dias).
                </p>

                {sections.length > 0 && (
                  <div className="space-y-3 mb-4">
                    <p className="text-sm font-semibold text-accent-foreground">Seções adicionadas:</p>
                    {sections.map((section) => (
                      <div key={section.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border">
                        <div>
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-purple-400" />
                            <span className="text-sm font-medium text-accent-foreground">
                              {section.title && `${section.title} - `}
                              {section.date_start} {section.time_start} → {section.date_end} {section.time_end}
                            </span>
                          </div>
                          {section.location && (
                            <div className="flex items-center gap-2 mt-1">
                              <MapPin size={12} className="text-accent-foreground/40" />
                              <span className="text-xs text-accent-foreground/60">{section.location}</span>
                            </div>
                          )}
                        </div>
                        <button onClick={() => removeSection(section.id)} className="p-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {errors.sections && <p className="text-xs text-red-400 mb-3">{errors.sections}</p>}

                <div className="border-t border-border pt-4 mt-2">
                  <p className="text-sm font-semibold text-accent-foreground mb-3">Nova seção:</p>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newSection.title}
                      onChange={e => setNewSection(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Título da seção (opcional - ex: Manhã, Tarde, Dia 1)"
                      className="w-full px-4 py-2.5 rounded-lg  text-accent-foreground  text-sm bg-[#11101B] border border-border focus:border-primary outline-none placeholder:text-accent-foreground/40"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-accent-foreground mb-1">Data início *</label>
                        <input
                          type="date"
                          value={newSection.date_start}
                          onChange={e => handleDateChange("date_start", e.target.value, true)}
                          className="w-full px-3 py-2 rounded-lg  text-accent-foreground  text-sm bg-[#11101B] border border-border focus:border-primary outline-none"
                        />
                        {errors.sectionDate && <p className="text-xs text-red-400 mt-1">{errors.sectionDate}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-accent-foreground mb-1">Horário início *</label>
                        <input
                          type="time"
                          value={newSection.time_start}
                          onChange={e => setNewSection(prev => ({ ...prev, time_start: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg  text-accent-foreground  text-sm bg-[#11101B] border border-border focus:border-primary outline-none"
                        />
                        {errors.sectionTime && <p className="text-xs text-red-400 mt-1">{errors.sectionTime}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-accent-foreground mb-1">Data término *</label>
                        <input
                          type="date"
                          value={newSection.date_end}
                          onChange={e => handleDateChange("date_end", e.target.value, true)}
                          className="w-full px-3 py-2 rounded-lg  text-accent-foreground  text-sm bg-[#11101B] border border-border focus:border-primary outline-none"
                        />
                        {errors.sectionDateEnd && <p className="text-xs text-red-400 mt-1">{errors.sectionDateEnd}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-accent-foreground mb-1">Horário término *</label>
                        <input
                          type="time"
                          value={newSection.time_end}
                          onChange={e => setNewSection(prev => ({ ...prev, time_end: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg text-sm  text-accent-foreground  bg-[#11101B] border border-border focus:border-primary outline-none"
                        />
                        {errors.sectionTimeEnd && <p className="text-xs text-red-400 mt-1">{errors.sectionTimeEnd}</p>}
                      </div>
                    </div>

                    <input
                      type="text"
                      value={newSection.location}
                      onChange={e => setNewSection(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Local específico (opcional)"
                      className="w-full px-4 py-2.5 rounded-lg text-sm  text-accent-foreground  bg-[#11101B] border border-border focus:border-primary outline-none placeholder:text-accent-foreground/40"
                    />

                    <button
                      onClick={addSection}
                      className="w-full flex items-center cursor-pointer justify-center gap-2 py-2.5 rounded-lg text-sm font-bold text-purple-400 bg-purple-400/10 border border-purple-400/20 hover:bg-purple-400/20 transition-colors"
                    >
                      <Plus size={16} /> Adicionar seção
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 - EQUIPE DO SUBEVENTO */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                  Membros da Equipe do Subevento
                </label>
                <p className="text-xs text-accent-foreground/40 mb-3">
                  Adicione os membros da equipe deste subevento. Eles receberão um convite por e-mail.
                </p>

                {teamMembers.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {teamMembers.map(member => {
                      const badge = getMemberBadgeStyle(member.job);
                      return (
                        <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border">
                          <div className="flex items-center gap-3">
                            <Mail size={14} className="text-purple-400" />
                            <div>
                              <p className="text-sm font-medium text-accent-foreground">{member.email}</p>
                              <span className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded ${badge.color} ${badge.bg} ${badge.border}`}>
                                {member.job}
                              </span>
                            </div>
                          </div>
                          <button onClick={() => removeTeamMember(member.id)} className="p-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Selecionar membro já existente no evento principal */}
                {eventTeamMembers.length > 0 && (
                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-accent-foreground mb-1">Selecionar da equipe do evento principal</label>
                    <select
                      onChange={e => selectExistingMember(e.target.value)}
                      value=""
                      className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-border focus:border-primary outline-none"
                    >
                      <option value="">-- Escolha um membro --</option>
                      {eventTeamMembers.map(member => {
                        const email = member.user?.email || member.email;
                        const job = member.job || (member.roleDescription || "Membro");
                        return <option key={member.id} value={email}>{email} ({job})</option>;
                      })}
                    </select>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6888]" />
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={e => { setNewMemberEmail(e.target.value); setErrors(prev => ({ ...prev, teamMemberEmail: "" })); }}
                      placeholder="E-mail do membro"
                      className={`w-full pl-10 pr-4 py-2.5  text-accent-foreground  rounded-lg text-sm bg-[#11101B] border ${errors.teamMemberEmail ? "border-red-400/50" : "border-border"} focus:border-primary outline-none placeholder:text-accent-foreground/40`}
                    />
                  </div>
                  {errors.teamMemberEmail && <p className="text-xs text-red-400 mt-1">{errors.teamMemberEmail}</p>}
                  <div>
                    <input
                      type="text"
                      value={newMemberJob}
                      onChange={e => { setNewMemberJob(e.target.value); setErrors(prev => ({ ...prev, teamMemberJob: "" })); }}
                      placeholder="Função (ex: Palestrante, Monitor)"
                      className={`w-full px-4 py-2.5  text-accent-foreground  rounded-lg text-sm bg-[#11101B] border ${errors.teamMemberJob ? "border-red-400/50" : "border-border"} focus:border-primary outline-none placeholder:text-accent-foreground/40`}
                    />
                    {errors.teamMemberJob && <p className="text-xs text-red-400 mt-1">{errors.teamMemberJob}</p>}
                  </div>
                </div>

                <button onClick={addTeamMember} className="w-full mt-3 cursor-pointer flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold text-purple-400 bg-purple-400/10 border border-purple-400/20 hover:bg-purple-400/20 transition-colors">
                  <Send size={14} /> Adicionar membro
                </button>

                <div className="mt-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <p className="text-xs text-amber-400/80 flex items-start gap-2">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    Os membros receberão um convite por e-mail. Se não tiverem conta, ela será criada automaticamente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 - REVISÃO */}
          {step === 3 && (
            <div className="space-y-6">
              <p className="text-sm text-accent-foreground/60">
                Confira as informações antes de adicionar este subevento.
              </p>

              <div>
                <div className="text-[11px] font-bold uppercase text-accent-foreground/40 mb-3">Informações</div>
                <div className="space-y-2 text-accent-foreground  ">
                  <div className="flex gap-3 p-3 rounded-lg bg-[#11101B] border border-border">
                    <ClipboardList size={18} className="text-accent-foreground/40" />
                    <div><div className="text-[10px] uppercase">Nome</div><div className="text-sm">{form.name}</div></div>
                  </div>
                  <div className="flex gap-3 p-3 rounded-lg bg-[#11101B] border border-border">
                    <FileText size={18} className="text-accent-foreground/40" />
                    <div><div className="text-[10px] uppercase">Descrição</div><div className="text-sm">{form.description}</div></div>
                  </div>
                  <div className="flex gap-3 p-3 rounded-lg bg-[#11101B] border border-border">
                    <MapPin size={18} className="text-accent-foreground/40" />
                    <div><div className="text-[10px] uppercase">Local</div><div className="text-sm">{form.location}</div></div>
                  </div>
                  <div className="flex gap-3 p-3 rounded-lg bg-[#11101B] border border-border">
                    <Users size={18} className="text-accent-foreground/40" />
                    <div><div className="text-[10px] uppercase">Capacidade</div><div className="text-sm">{form.capacity}</div></div>
                  </div>
                </div>
              </div>

              {sections.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase text-accent-foreground/40 mb-3">Seções</div>
                  <div className="space-y-2 text-accent-foreground  ">
                    {sections.map((section, idx) => (
                      <div key={section.id} className="flex gap-3 p-3 rounded-lg bg-[#11101B] border border-border">
                        <CalendarDays size={18} className="text-accent-foreground/40" />
                        <div>
                          <div className="text-[10px] uppercase">Seção {idx+1}</div>
                          <div className="text-sm">
                            {section.title && `${section.title} - `}
                            {section.date_start} {section.time_start} → {section.date_end} {section.time_end}
                            {section.location && ` - ${section.location}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {teamMembers.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase text-accent-foreground/40 mb-3">Equipe</div>
                  <div className="space-y-2 text-accent-foreground  ">
                    {teamMembers.map(member => (
                      <div key={member.id} className="flex gap-3 p-3 rounded-lg bg-[#11101B] border border-border">
                        <Mail size={18} className="text-accent-foreground/40" />
                        <div><div className="text-[10px] uppercase">Membro</div><div className="text-sm">{member.email} - {member.job}</div></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="flex gap-3 p-3 rounded-lg bg-red-400/5 border border-red-400/20">
                  <AlertCircle size={18} className="text-red-400" />
                  <div><div className="text-sm font-bold text-red-400">Falha ao criar subevento</div><div className="text-xs text-red-400/70">{errMsg}</div></div>
                </div>
              )}
            </div>
          )}

          {/* Navegação */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <button onClick={handleBack} className="flex items-center cursor-pointer gap-2 px-5 py-2 rounded-lg text-sm font-medium text-accent-foreground/60 border border-border hover:text-accent-foreground hover:border-primary/30 transition-all">
              <ArrowLeft size={14} /> {step === 0 ? "Cancelar" : "Anterior"}
            </button>
            <div className="flex gap-1.5">
              {STEP_LABELS.map((_, i) => <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-5 bg-primary" : i < step ? "w-1.5 bg-primary/40" : "w-1.5 bg-border"}`} />)}
            </div>
            {step < STEP_LABELS.length - 1 ? (
              <button onClick={next} className="flex items-center cursor-pointer gap-2 px-5 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-[#8b5cf6] to-[#9333ea] shadow-md hover:shadow-lg transition-all">
                Próximo <ArrowRight size={14} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={status === "loading"} className="flex cursor-pointer items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-[#8b5cf6] to-[#9333ea] shadow-md hover:shadow-lg disabled:opacity-50 transition-all">
                {status === "loading" ? (
                  <><div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Criando...</>
                ) : (
                  <><Sparkles size={14} /> Criar SubEvento</>
                )}
              </button>
            )}
          </div>
        </div>
        <p className="text-center text-xs text-accent-foreground/30 mt-6">
          Subeventos permitem detalhar a programação do seu evento principal.
        </p>
      </div>
    </div>
  );
}
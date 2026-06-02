import { useState, useEffect } from "react";
import { 
  Plus, Calendar, MapPin, Clock, Users, Edit2, Trash2, X, AlertTriangle, 
  User, UserPlus, CalendarDays, Mail, Send, Target
} from "lucide-react";

// Badges de função
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

// Helpers de data
const toLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formatShortDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", { day:"2-digit", month:"short", year:"numeric" });
};

const formatShortTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" });
};

/* ─── MODAL EDIÇÃO ─── */
function SubeventoModal({ subevento, eventId, onClose, onSave, loading, apiError }) {
  const [form, setForm] = useState({
    title:        subevento?.title        || "",
    description:  subevento?.description  || "",
    location:     subevento?.location     || "",
    // capacity removida do subevento – não será enviada
  });
  
  // Dados do evento principal (datas e capacidade total)
  const [eventDateStart, setEventDateStart] = useState(null);
  const [eventDateEnd, setEventDateEnd] = useState(null);
  const [eventCapacity, setEventCapacity] = useState(null);
  const [eventTeamMembers, setEventTeamMembers] = useState([]);

  // Seções existentes (agora com capacity)
  const [existingSections, setExistingSections] = useState(
    (subevento?.sections || []).map(s => ({ ...s, capacity: s.capacity || "" }))
  );
  const [newSections, setNewSections] = useState([]);
  const [newSection, setNewSection] = useState({
    title: "",
    date_start: "",
    time_start: "",
    date_end: "",
    time_end: "",
    location: "",
    capacity: "",
  });
  
  const [existingTeam, setExistingTeam] = useState(subevento?.team || []);
  const [newTeam, setNewTeam] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberJob, setNewMemberJob] = useState("");
  
  const [errors, setErrors] = useState({});

  // Buscar dados do evento principal
  useEffect(() => {
    if (!eventId) return;
    const fetchEventData = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const event = data?.data?.event || data?.event;
          if (event) {
            setEventDateStart(event.date_start ? new Date(event.date_start) : null);
            setEventDateEnd(event.date_end ? new Date(event.date_end) : null);
            setEventCapacity(event.capacity ? parseInt(event.capacity) : null);
          }
        }
        const teamRes = await fetch(`/api/events/${eventId}/team`, { credentials: "include" });
        if (teamRes.ok) {
          const teamData = await teamRes.json();
          const team = teamData?.data?.team || teamData?.team || [];
          setEventTeamMembers(team);
        }
      } catch (err) {
        console.error("Erro ao buscar dados do evento:", err);
      }
    };
    fetchEventData();
  }, [eventId]);

  const setFormField = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())    e.title    = "Título é obrigatório.";
    if (!form.location.trim()) e.location = "Local é obrigatório.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Validação de período da seção
  const validateSectionDates = (section) => {
    if (!eventDateStart || !eventDateEnd) return true;
    const start = new Date(`${section.date_start}T${section.time_start}`);
    const end   = new Date(`${section.date_end}T${section.time_end}`);
    if (start < eventDateStart) return false;
    if (end > eventDateEnd) return false;
    if (start > end) return false;
    return true;
  };

  // Adicionar nova seção (com capacidade)
  const addSection = () => {
    const newErrors = {};
    if (!newSection.date_start) newErrors.sectionDate = "Data de início é obrigatória";
    if (!newSection.time_start) newErrors.sectionTime = "Horário de início é obrigatório";
    if (!newSection.date_end) newErrors.sectionDateEnd = "Data de término é obrigatória";
    if (!newSection.time_end) newErrors.sectionTimeEnd = "Horário de término é obrigatório";
    if (!newSection.capacity) {
      newErrors.sectionCapacity = "Capacidade é obrigatória";
    } else if (parseInt(newSection.capacity) <= 0) {
      newErrors.sectionCapacity = "Capacidade deve ser maior que zero";
    } else if (eventCapacity && parseInt(newSection.capacity) > eventCapacity) {
      newErrors.sectionCapacity = `Capacidade não pode ultrapassar ${eventCapacity} (total do evento)`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      return;
    }

    if (!validateSectionDates(newSection)) {
      setErrors(prev => ({ ...prev, sectionError: `As datas/horários devem estar entre ${formatShortDate(eventDateStart)} e ${formatShortDate(eventDateEnd)}` }));
      return;
    }

    setNewSections(prev => [...prev, {
      id: Date.now(),
      title: newSection.title || null,
      date_start: newSection.date_start,
      time_start: newSection.time_start,
      date_end: newSection.date_end,
      time_end: newSection.time_end,
      location: newSection.location || null,
      capacity: parseInt(newSection.capacity),
    }]);
    
    setNewSection({
      title: "",
      date_start: "",
      time_start: "",
      date_end: "",
      time_end: "",
      location: "",
      capacity: "",
    });
    setErrors(prev => ({ ...prev, sectionDate: "", sectionTime: "", sectionDateEnd: "", sectionTimeEnd: "", sectionCapacity: "", sectionError: "" }));
  };

  const removeExistingSection = (idx) => {
    setExistingSections(prev => prev.filter((_, i) => i !== idx));
  };

  const removeNewSection = (idx) => {
    setNewSections(prev => prev.filter((_, i) => i !== idx));
  };

  // Atualizar capacidade de uma seção existente
  const updateExistingSectionCapacity = (idx, newCapacity) => {
    setExistingSections(prev => prev.map((s, i) => 
      i === idx ? { ...s, capacity: newCapacity } : s
    ));
  };

  // Equipe do subevento (e-mail)
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
    if (newTeam.some(m => m.email === newMemberEmail.trim().toLowerCase()) ||
        existingTeam.some(m => m.email === newMemberEmail.trim().toLowerCase())) {
      setErrors(prev => ({ ...prev, teamMemberEmail: "Membro já adicionado" }));
      return;
    }
    
    setNewTeam(prev => [...prev, { 
      id: Date.now(), 
      email: newMemberEmail.trim().toLowerCase(),
      job: newMemberJob.trim(),
    }]);
    setNewMemberEmail("");
    setNewMemberJob("");
    setErrors(prev => ({ ...prev, teamMemberEmail: "", teamMemberJob: "" }));
  };

  const removeExistingTeamMember = (idx) => {
    setExistingTeam(prev => prev.filter((_, i) => i !== idx));
  };

  const removeNewTeamMember = (idx) => {
    setNewTeam(prev => prev.filter((_, i) => i !== idx));
  };

  const selectExistingEventMember = (email) => {
    const member = eventTeamMembers.find(m => m.user?.email === email || m.email === email);
    if (member) {
      const memberEmail = member.user?.email || member.email;
      const memberJob = member.job || (member.roleDescription || "Membro");
      setNewMemberEmail(memberEmail);
      setNewMemberJob(memberJob);
      setErrors(prev => ({ ...prev, teamMemberEmail: "", teamMemberJob: "" }));
    }
  };

  const handleSave = () => {
    if (validate()) {
      onSave({ 
        ...form, 
        existingSections,
        newSections,
        existingTeam,
        newTeam,
        id: subevento?.id 
      });
    }
  };

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

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-6 overflow-y-auto">
      <div className="bg-[#11101B] border border-border rounded-2xl p-8 w-full max-w-3xl shadow-2xl mt-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-accent-foreground">Editar sub-evento</h2>
          <button onClick={onClose} className="text-[#6b6888] cursor-pointer hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Informações básicas (sem capacity) */}
          <div>
            <label className="block text-sm font-bold text-accent-foreground mb-1.5">
              Título <span className="text-primary">*</span>
            </label>
            <input
              value={form.title}
              onChange={e => setFormField("title", e.target.value)}
              placeholder="ex: Palestra de Abertura"
              className={`w-full px-4 py-2.5 text-accent-foreground rounded-lg text-sm bg-[#11101B] border ${errors.title ? "border-red-400/50" : "border-border"} focus:border-primary outline-none placeholder:text-accent-foreground/40`}
            />
            {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-accent-foreground mb-1.5">Descrição</label>
            <textarea
              value={form.description}
              onChange={e => setFormField("description", e.target.value)}
              rows={3}
              placeholder="Descreva o sub-evento..."
              className="w-full px-4 py-2.5 text-accent-foreground rounded-lg text-sm bg-[#11101B] border border-border focus:border-primary outline-none resize-none placeholder:text-accent-foreground/40"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-accent-foreground mb-1.5">
              Local <span className="text-primary">*</span>
            </label>
            <input
              value={form.location}
              onChange={e => setFormField("location", e.target.value)}
              placeholder="ex: Auditório A, Sala 201..."
              className={`w-full px-4 py-2.5 text-accent-foreground rounded-lg text-sm bg-[#11101B] border ${errors.location ? "border-red-400/50" : "border-border"} focus:border-primary outline-none placeholder:text-accent-foreground/40`}
            />
            {errors.location && <p className="text-xs text-red-400 mt-1">{errors.location}</p>}
          </div>

          {/* Seções Existentes (somente leitura) */}
          {existingSections.length > 0 && (
            <div className="border-t border-border pt-4">
              <label className="block text-sm font-bold text-accent-foreground mb-1.5">Seções Existentes</label>
              <div className="space-y-3">
                {existingSections.map((section, idx) => (
                  <div key={section.id || idx} className="p-3 rounded-lg bg-background/50 border border-border">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm text-accent-foreground">
                          <Calendar size={14} className="text-purple-400" />
                          <span>
                            {section.title && `${section.title} - `}
                            {formatShortDate(section.date_start)} {formatShortTime(section.date_start)} → {formatShortDate(section.date_end)} {formatShortTime(section.date_end)}
                          </span>
                        </div>
                        {section.location && (
                          <div className="flex items-center gap-2 mt-1 text-xs text-accent-foreground/60">
                            <MapPin size={12} />
                            <span>{section.location}</span>
                          </div>
                        )}
                        <div className="mt-2">
                          <span className="text-xs font-semibold text-accent-foreground">Capacidade:</span>
                          <span className="ml-2 text-sm text-accent-foreground">
                            {section.capacity ? section.capacity : "Sem limite"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeExistingSection(idx)}
                        className="p-1.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Novas Seções */}
          {newSections.length > 0 && (
            <div className="border-t border-border pt-4">
              <label className="block text-sm font-bold text-accent-foreground mb-1.5">Novas Seções (serão adicionadas)</label>
              <div className="space-y-2">
                {newSections.map((section, idx) => (
                  <div key={section.id} className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-accent-foreground">
                        <Calendar size={14} className="text-emerald-400" />
                        <span>
                          {section.title && `${section.title} - `}
                          {section.date_start} {section.time_start} → {section.date_end} {section.time_end}
                        </span>
                        <span className="text-xs text-emerald-400 ml-2">Cap: {section.capacity}</span>
                      </div>
                      {section.location && (
                        <div className="flex items-center gap-2 mt-1 text-xs text-accent-foreground/60">
                          <MapPin size={12} />
                          <span>{section.location}</span>
                        </div>
                      )}
                    </div>
                    <button onClick={() => removeNewSection(idx)} className="p-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulário para adicionar nova seção (com capacidade) */}
          <div className="border-t border-border pt-4">
            <label className="block text-sm font-bold text-accent-foreground mb-1.5">Adicionar Nova Seção</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input
                type="date"
                value={newSection.date_start}
                onChange={e => setNewSection(prev => ({ ...prev, date_start: e.target.value }))}
                min={eventDateStart ? eventDateStart.toISOString().split('T')[0] : ""}
                max={eventDateEnd ? eventDateEnd.toISOString().split('T')[0] : ""}
                className="px-3 py-1.5 text-accent-foreground rounded-lg text-xs bg-[#11101B] border border-border focus:border-primary outline-none"
              />
              <input
                type="time"
                value={newSection.time_start}
                onChange={e => setNewSection(prev => ({ ...prev, time_start: e.target.value }))}
                className="px-3 py-1.5 text-accent-foreground rounded-lg text-xs bg-[#11101B] border border-border focus:border-primary outline-none"
              />
              <input
                type="date"
                value={newSection.date_end}
                onChange={e => setNewSection(prev => ({ ...prev, date_end: e.target.value }))}
                min={eventDateStart ? eventDateStart.toISOString().split('T')[0] : ""}
                max={eventDateEnd ? eventDateEnd.toISOString().split('T')[0] : ""}
                className="px-3 py-1.5 text-accent-foreground rounded-lg text-xs bg-[#11101B] border border-border focus:border-primary outline-none"
              />
              <input
                type="time"
                value={newSection.time_end}
                onChange={e => setNewSection(prev => ({ ...prev, time_end: e.target.value }))}
                className="px-3 py-1.5 text-accent-foreground rounded-lg text-xs bg-[#11101B] border border-border focus:border-primary outline-none"
              />
            </div>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSection.title}
                onChange={e => setNewSection(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título (opcional)"
                className="flex-1 px-3 py-1.5 text-accent-foreground rounded-lg text-xs bg-[#11101B] border border-border focus:border-primary outline-none placeholder:text-accent-foreground/40"
              />
              <input
                type="text"
                value={newSection.location}
                onChange={e => setNewSection(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Local específico"
                className="flex-1 px-3 py-1.5 text-accent-foreground rounded-lg text-xs bg-[#11101B] border border-border focus:border-primary outline-none placeholder:text-accent-foreground/40"
              />
            </div>
            <div className="mb-3">
              <label className="block text-xs font-semibold text-accent-foreground mb-1">
                Capacidade <span className="text-primary">*</span>
                {eventCapacity && <span className="text-xs ml-1">(máx. {eventCapacity})</span>}
              </label>
              <input
                type="number"
                value={newSection.capacity}
                onChange={e => setNewSection(prev => ({ ...prev, capacity: e.target.value }))}
                placeholder="ex: 30"
                className={`w-full px-3 py-1.5 text-accent-foreground rounded-lg text-sm bg-[#11101B] border ${errors.sectionCapacity ? "border-red-400/50" : "border-border"} focus:border-primary outline-none`}
              />
              {errors.sectionCapacity && <p className="text-xs text-red-400 mt-1">{errors.sectionCapacity}</p>}
            </div>
            <button
              onClick={addSection}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold text-purple-400 bg-purple-400/10 border border-purple-400/20 hover:bg-purple-400/20 transition-colors cursor-pointer"
            >
              <Plus size={16} /> Adicionar seção
            </button>
            {errors.sectionError && <p className="text-xs text-red-400 mt-1">{errors.sectionError}</p>}
          </div>

          {/* Equipe do subevento (sem alterações) */}
          <div className="border-t border-border pt-4">
            <label className="block text-sm font-bold text-accent-foreground mb-1.5">Equipe do Subevento</label>
            <p className="text-xs text-accent-foreground/40 mb-3">
              Adicione os membros da equipe deste subevento. Eles receberão um convite por e-mail.
            </p>

            {existingTeam.length > 0 && (
              <div className="space-y-2 mb-4">
                {existingTeam.map((member, idx) => {
                  const badge = getMemberBadgeStyle(member.job);
                  return (
                    <div key={member.id || idx} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border">
                      <div className="flex items-center gap-3">
                        <Mail size={14} className="text-purple-400" />
                        <div>
                          <p className="text-sm font-medium text-accent-foreground">{member.email || member.user?.email}</p>
                          <span className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded ${badge.color} ${badge.bg} ${badge.border}`}>
                            {member.job}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => removeExistingTeamMember(idx)} className="p-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {newTeam.length > 0 && (
              <div className="space-y-2 mb-4">
                {newTeam.map((member, idx) => {
                  const badge = getMemberBadgeStyle(member.job);
                  return (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex items-center gap-3">
                        <Mail size={14} className="text-emerald-400" />
                        <div>
                          <p className="text-sm font-medium text-accent-foreground">{member.email}</p>
                          <span className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded ${badge.color} ${badge.bg} ${badge.border}`}>
                            {member.job}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => removeNewTeamMember(idx)} className="p-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {eventTeamMembers.length > 0 && (
              <div className="mb-3">
                <label className="block text-xs font-semibold text-accent-foreground mb-1">Selecionar da equipe do evento principal</label>
                <select
                  onChange={e => selectExistingEventMember(e.target.value)}
                  value=""
                  className="w-full px-3 py-2 rounded-lg text-sm text-accent-foreground bg-[#11101B] border border-border focus:border-primary outline-none"
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
                  className={`w-full pl-10 pr-4 py-2.5 text-accent-foreground rounded-lg text-sm bg-[#11101B] border ${errors.teamMemberEmail ? "border-red-400/50" : "border-border"} focus:border-primary outline-none placeholder:text-accent-foreground/40`}
                />
              </div>
              {errors.teamMemberEmail && <p className="text-xs text-red-400 mt-1">{errors.teamMemberEmail}</p>}
              <div>
                <input
                  type="text"
                  value={newMemberJob}
                  onChange={e => { setNewMemberJob(e.target.value); setErrors(prev => ({ ...prev, teamMemberJob: "" })); }}
                  placeholder="Função (ex: Palestrante, Monitor)"
                  className={`w-full px-4 py-2.5 text-accent-foreground rounded-lg text-sm bg-[#11101B] border ${errors.teamMemberJob ? "border-red-400/50" : "border-border"} focus:border-primary outline-none placeholder:text-accent-foreground/40`}
                />
                {errors.teamMemberJob && <p className="text-xs text-red-400 mt-1">{errors.teamMemberJob}</p>}
              </div>
            </div>
            <button onClick={addTeamMember} className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold text-purple-400 bg-purple-400/10 border border-purple-400/20 hover:bg-purple-400/20 transition-colors cursor-pointer">
              <Send size={14} /> Adicionar membro
            </button>
          </div>
        </div>

        {apiError && (
          <div className="mt-4 flex items-start gap-2.5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-400">{apiError}</p>
          </div>
        )}

        <div className="flex justify-end gap-2.5 mt-6 pt-5 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-accent-foreground/60 border border-border rounded-lg hover:text-accent-foreground hover:border-primary/30 transition-all cursor-pointer">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-gradient-to-br from-[#8b5cf6] to-[#9333ea] rounded-lg shadow-[0_4px_14px_rgba(124,58,237,0.4)] hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? "Salvando..." : <><Edit2 size={13} /> Salvar</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── DELETE MODAL (sem alterações) ─── */
function DeleteModal({ subevento, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-[#11101B] border border-red-500/20 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle size={16} className="text-red-400" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">Excluir sub-evento</p>
            <p className="text-xs text-accent-foreground/60">Essa ação não pode ser desfeita</p>
          </div>
        </div>
        <p className="text-sm text-accent-foreground/60 leading-relaxed mb-6 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
          Você está prestes a excluir <strong className="text-white">{subevento?.title}</strong>. Todos os dados serão removidos permanentemente.
        </p>
        <div className="flex justify-end gap-2.5">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-bold text-accent-foreground/60 border border-border rounded-lg hover:text-accent-foreground hover:border-primary/30 transition-all cursor-pointer">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-br from-red-600 to-red-500 rounded-lg shadow-[0_4px_14px_rgba(248,113,113,0.3)] hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Trash2 size={13} /> {loading ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── CARD (exibe capacidade por seção) ─── */
function SubeventoCard({ subevento, onEdit, onDelete }) {
  const [showDetails, setShowDetails] = useState(false);
  
  const fmtDate = (s) => s ? new Date(s).toLocaleDateString("pt-BR", { day:"2-digit", month:"short", year:"numeric" }) : "";
  const fmtTime = (s) => s ? new Date(s).toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" }) : "";

  return (
    <div className="group bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl overflow-hidden hover:border-purple-500/40 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300">
      <div className="h-1 w-full bg-gradient-to-r from-purple-500/60 via-purple-400/30 to-transparent" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-bold text-white text-base leading-snug line-clamp-2">{subevento.title}</h3>
          <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(subevento)} className="p-1.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-colors cursor-pointer">
              <Edit2 size={13} />
            </button>
            <button onClick={() => onDelete(subevento)} className="p-1.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer">
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {subevento.description && (
          <p className="text-sm text-[#6b6888] leading-relaxed line-clamp-2 mb-4">{subevento.description}</p>
        )}

        {subevento.sections && subevento.sections.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-1 text-xs text-[#6b6888] mb-2">
              <CalendarDays size={12} />
              <span>{subevento.sections.length} seção(ões)</span>
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="text-purple-400 hover:text-purple-300 text-xs ml-2 cursor-pointer"
              >
                {showDetails ? "▼" : "▶"} ver
              </button>
            </div>
            {showDetails && (
              <div className="space-y-1 pl-2 border-l border-purple-500/20">
                {subevento.sections.map((section, idx) => (
                  <div key={idx} className="text-xs text-[#6b6888]">
                    {section.title && <span className="font-semibold">{section.title}: </span>}
                    {fmtDate(section.date_start)} {fmtTime(section.date_start)} → {fmtDate(section.date_end)} {fmtTime(section.date_end)}
                    {section.capacity && (
                      <span className="ml-2 text-emerald-400">(Cap: {section.capacity})</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          {subevento.location?.trim() && (
            <div className="flex items-center gap-2 text-xs text-[#6b6888]">
              <MapPin size={12} className="shrink-0 text-violet-400" />
              <span className="truncate">{subevento.location}</span>
            </div>
          )}
          {/* Não exibe capacity do subevento, pois foi removido */}
        </div>

        {subevento.team && subevento.team.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {subevento.team.map((member, idx) => {
              const badge = getRoleFromJob(member.job);
              const roleConfig = TEAM_ROLES.find(r => r.value === badge) || TEAM_ROLES[4];
              return (
                <span key={idx} className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleConfig.color} ${roleConfig.bg} ${roleConfig.border}`}>
                  <Mail size={8} />
                  {member.name || member.user?.name} - {member.job}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── MAIN ─── */
export default function SubeventosView({ subeventData: initialData = [], eventId, onSubeventsUpdate }) {
  const [subeventos, setSubeventos] = useState([]);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [deleting, setDeleting]     = useState(null);
  const [saving, setSaving]         = useState(false);
  const [delLoading, setDelLoading] = useState(false);
  const [apiError, setApiError]     = useState("");
  const [fetchLoading, setFetchLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const fetchSubevents = async () => {
    setFetchLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/subevents`, { credentials: "include" });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();
      console.log(data)
      let list = [];
      if (Array.isArray(data)) list = data;
      else if (data?.data?.subevents && Array.isArray(data.data.subevents)) list = data.data.subevents;
      else if (data?.subevents && Array.isArray(data.subevents)) list = data.subevents;
      else if (data?.data && Array.isArray(data.data)) list = data.data;
      list = list.map(sub => ({ ...sub, location: sub.location ?? "", sections: sub.sections || [], team: sub.team || [] }));
      setSubeventos(list);
      onSubeventsUpdate?.(list);
    } catch (err) {
      console.error(err);
      const fallback = Array.isArray(initialData) ? initialData : [];
      setSubeventos(fallback);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    if (eventId && !initialLoadDone) {
      fetchSubevents();
      setInitialLoadDone(true);
    }
  }, [eventId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("created") === "1") {
      const url = new URL(window.location.href);
      url.searchParams.delete("created");
      window.history.replaceState({}, "", url.toString());
      fetchSubevents();
    }
  }, [eventId]);

  const openCreate = () => {
    window.location.href = `/createSubevent?eventId=${eventId}`;
  };

  const openEdit = (sub) => { setEditing(sub); setApiError(""); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); setApiError(""); };

  const handleSave = async (formData) => {
    setSaving(true);
    setApiError("");
    try {
      // 1. Atualizar subevento (sem capacity)
      const res = await fetch(`/api/events/${eventId}/subevents/${editing.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          location: formData.location.trim() || null,
          capacity: null, // enviar null explicitamente
        }),
      });
      if (!res.ok) throw new Error(`Erro ${res.status}`);

      // 2. Remover seções deletadas
      const removedSections = editing.sections?.filter(
        old => !formData.existingSections.some(newSec => newSec.id === old.id)
      ) || [];
      for (const sec of removedSections) {
        await fetch(`/api/events/${eventId}/subevents/${editing.id}/sections/${sec.id}`, { method: "DELETE", credentials: "include" });
      }

      // 3. Atualizar capacidade das seções existentes (PUT em cada seção)
      for (const section of formData.existingSections) {
        // Se a capacidade mudou, atualiza
        const originalSection = editing.sections?.find(s => s.id === section.id);
        if (originalSection && originalSection.capacity !== section.capacity) {
          await fetch(`/api/events/${eventId}/subevents/${editing.id}/sections/${section.id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ capacity: parseInt(section.capacity) }),
          });
        }
      }

      // 4. Adicionar novas seções (com capacidade)
      for (const sec of formData.newSections) {
        await fetch(`/api/events/${eventId}/subevents/${editing.id}/sections`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: sec.title,
            date_start: `${sec.date_start}T${sec.time_start}:00.000Z`,
            date_end: `${sec.date_end}T${sec.time_end}:00.000Z`,
            location: sec.location,
            capacity: sec.capacity,
          }),
        });
      }

      // 5. Remover membros deletados
      const removedMembers = editing.team?.filter(
        old => !formData.existingTeam.some(newM => newM.id === old.id)
      ) || [];
      for (const member of removedMembers) {
        await fetch(`/api/events/${eventId}/subevents/${editing.id}/members/${member.id}`, { method: "DELETE", credentials: "include" });
      }

      // 6. Adicionar novos membros (com e-mail)
      for (const member of formData.newTeam) {
        await fetch(`/api/events/${eventId}/subevents/${editing.id}/team/invite`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: member.email, job: member.job }),
        });
      }

      await fetchSubevents();
      closeModal();
    } catch (err) {
      console.error(err);
      setApiError(err.message || "Falha ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDelLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/subevents/${deleting.id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      await fetchSubevents();
      setDeleting(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDelLoading(false);
    }
  };

  if (fetchLoading && subeventos.length === 0) {
    return (
      <section className="min-h-screen p-4 bg-background">
        <h1 className="text-2xl font-bold text-accent-foreground mb-6">Sub-eventos</h1>
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen p-4 ">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-accent-foreground mb-1">Sub-eventos</h1>
          <p className="text-sm text-accent-foreground/60">
            {subeventos.length === 0
              ? "Nenhum sub-evento cadastrado"
              : `${subeventos.length} sub-evento${subeventos.length !== 1 ? "s" : ""} cadastrado${subeventos.length !== 1 ? "s" : ""}`
            }
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 cursor-pointer px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-br from-[#8b5cf6] to-[#9333ea] rounded-lg shadow-[0_4px_14px_rgba(124,58,237,0.4)] hover:shadow-[0_8px_24px_rgba(124,58,237,0.55)] transition-all"
        >
          <Plus size={15} /> Novo sub-evento
        </button>
      </div>

      {subeventos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-xl text-center bg-[#11101B]">
          <Calendar size={32} className="text-[#3d3860] mb-4" />
          <p className="font-bold text-accent-foreground mb-1">Nenhum sub-evento criado</p>
          <p className="text-sm text-accent-foreground/60 mb-5">Adicione sessões, workshops ou palestras ao seu evento.</p>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-br from-[#8b5cf6] to-[#9333ea] rounded-lg shadow-[0_4px_14px_rgba(124,58,237,0.35)] hover:opacity-90 transition-all cursor-pointer"
          >
            <Plus size={14} /> Criar primeiro sub-evento
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subeventos.map(sub => (
            <SubeventoCard
              key={sub.id}
              subevento={sub}
              onEdit={openEdit}
              onDelete={setDeleting}
            />
          ))}
          <button
            onClick={openCreate}
            className="flex flex-col items-center justify-center gap-2 cursor-pointer p-8 border border-dashed border-border rounded-xl text-sm font-semibold text-accent-foreground/60 hover:text-purple-400 hover:border-purple-500/40 hover:bg-purple-500/[0.03] transition-all min-h-[140px] bg-[#11101B]"
          >
            <Plus size={20} strokeWidth={1.5} />
            Adicionar sub-evento
          </button>
        </div>
      )}

      {modalOpen && (
        <SubeventoModal
          key={editing?.id}
          subevento={editing}
          eventId={eventId}
          onClose={closeModal}
          onSave={handleSave}
          loading={saving}
          apiError={apiError}
        />
      )}
      {deleting && (
        <DeleteModal
          subevento={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
          loading={delLoading}
        />
      )}
    </section>
  );
}
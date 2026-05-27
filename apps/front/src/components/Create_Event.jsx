import { useState, useCallback } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  ClipboardList,
  FileText,
  CalendarDays,
  Timer,
  GraduationCap,
  Building2,
  UserPlus,
  Trash2,
  User,
  Mail,
  Send,
  Plus,
  Sparkles,
  Users,
  Edit2,
  Target,
  MailCheck,
} from "lucide-react";
import Particles from "./Particles";

const STEP_LABELS = ["Informações", "Equipe", "Subeventos", "Revisão"];

// Funções auxiliares para badges de função
const TEAM_ROLES = [
  {
    value: "SPEAKER",
    label: "Palestrante",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    value: "STAFF",
    label: "Staff",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  {
    value: "VOLUNTEER",
    label: "Voluntário",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    value: "INSTRUCTOR",
    label: "Instrutor",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    value: "OTHER",
    label: "Outro",
    color: "text-gray-400",
    bg: "bg-gray-500/10",
    border: "border-gray-500/20",
  },
];

const getRoleFromJob = (job) => {
  const jobLower = job.toLowerCase();
  if (jobLower.includes("palestrante")) return "SPEAKER";
  if (jobLower.includes("staff")) return "STAFF";
  if (jobLower.includes("volunt")) return "VOLUNTEER";
  if (jobLower.includes("instrutor")) return "INSTRUCTOR";
  return "OTHER";
};

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

  // Estado para equipe do evento principal
  const [teamMembers, setTeamMembers] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberJob, setNewMemberJob] = useState("");

  // Estado para subeventos
  const [subevents, setSubevents] = useState([]);
  const [activeSubeventIndex, setActiveSubeventIndex] = useState(null);
  const [newSubevent, setNewSubevent] = useState({
    name: "",
    description: "",
    location: "",
    capacity: "",
    sections: [],
    teamMembers: [], // armazena objetos com email e job
  });

  // Estado para seção atual
  const [newSection, setNewSection] = useState({
    title: "",
    date_start: "",
    time_start: "",
    date_end: "",
    time_end: "",
    location: "",
  });

  // Estado para novo membro do subevento
  const [newSubeventMember, setNewSubeventMember] = useState({
    email: "",
    job: "",
    fromExisting: false,
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [errMsg, setErrMsg] = useState("");
  const [creatingEvent, setCreatingEvent] = useState(false);

  // Validação de ano com máximo 4 dígitos
  const validateYear = (value) => {
    if (!value) return true;
    const year = value.split("-")[0];
    return !(year && year.length > 4);
  };

  const handleDateChange = (field, value, isSection = false) => {
    if (!validateYear(value)) return;
    if (isSection) {
      setNewSection((prev) => ({ ...prev, [field]: value }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const set = useCallback((name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" }));
  }, []);

  // ========== FUNÇÕES DA EQUIPE PRINCIPAL ==========
  const addTeamMember = () => {
    if (!newMemberEmail.trim()) {
      setErrors((prev) => ({
        ...prev,
        teamMemberEmail: "E-mail é obrigatório",
      }));
      return;
    }
    if (!newMemberEmail.includes("@")) {
      setErrors((prev) => ({ ...prev, teamMemberEmail: "E-mail inválido" }));
      return;
    }
    if (!newMemberJob.trim()) {
      setErrors((prev) => ({ ...prev, teamMemberJob: "Função é obrigatória" }));
      return;
    }
    if (
      teamMembers.some((m) => m.email === newMemberEmail.trim().toLowerCase())
    ) {
      setErrors((prev) => ({
        ...prev,
        teamMemberEmail: "E-mail já adicionado",
      }));
      return;
    }

    setTeamMembers((prev) => [
      ...prev,
      {
        id: Date.now(),
        email: newMemberEmail.trim().toLowerCase(),
        job: newMemberJob.trim(),
        role: getRoleFromJob(newMemberJob.trim()),
      },
    ]);
    setNewMemberEmail("");
    setNewMemberJob("");
    setErrors((prev) => ({ ...prev, teamMemberEmail: "", teamMemberJob: "" }));
  };

  const removeTeamMember = (id) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
  };

  // ========== FUNÇÕES DOS SUBEVENTOS ==========
  const startNewSubevent = () => {
    setActiveSubeventIndex(null);
    setNewSubevent({
      name: "",
      description: "",
      location: "",
      capacity: "",
      sections: [],
      teamMembers: [],
    });
    setNewSection({
      title: "",
      date_start: "",
      time_start: "",
      date_end: "",
      time_end: "",
      location: "",
    });
    setNewSubeventMember({ email: "", job: "", fromExisting: false });
  };

  const editSubevent = (index) => {
    setActiveSubeventIndex(index);
    setNewSubevent({ ...subevents[index] });
    setNewSection({
      title: "",
      date_start: "",
      time_start: "",
      date_end: "",
      time_end: "",
      location: "",
    });
    setNewSubeventMember({ email: "", job: "", fromExisting: false });
  };

  const addSectionToSubevent = () => {
    if (
      !newSection.date_start ||
      !newSection.time_start ||
      !newSection.date_end ||
      !newSection.time_end
    ) {
      setErrors((prev) => ({
        ...prev,
        sectionError: "Preencha data e horário de início e término",
      }));
      return;
    }
    if (
      !validateYear(newSection.date_start) ||
      !validateYear(newSection.date_end)
    )
      return;

    setNewSubevent((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: Date.now(),
          title: newSection.title || null,
          date_start: newSection.date_start,
          time_start: newSection.time_start,
          date_end: newSection.date_end,
          time_end: newSection.time_end,
          location: newSection.location || null,
        },
      ],
    }));

    setNewSection({
      title: "",
      date_start: "",
      time_start: "",
      date_end: "",
      time_end: "",
      location: "",
    });
    setErrors((prev) => ({ ...prev, sectionError: "" }));
  };

  const removeSectionFromSubevent = (sectionId) => {
    setNewSubevent((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== sectionId),
    }));
  };

  // Adicionar membro ao subevento (pode ser da equipe principal ou novo)
  const addMemberToSubevent = () => {
    let email = newSubeventMember.email.trim();
    let job = newSubeventMember.job.trim();

    if (!email) {
      setErrors((prev) => ({
        ...prev,
        subeventMemberEmail: "E-mail é obrigatório",
      }));
      return;
    }
    if (!email.includes("@")) {
      setErrors((prev) => ({
        ...prev,
        subeventMemberEmail: "E-mail inválido",
      }));
      return;
    }
    if (!job) {
      setErrors((prev) => ({
        ...prev,
        subeventMemberJob: "Função é obrigatória",
      }));
      return;
    }
    if (newSubevent.teamMembers.some((m) => m.email === email)) {
      setErrors((prev) => ({
        ...prev,
        subeventMemberEmail: "Membro já adicionado a este subevento",
      }));
      return;
    }

    setNewSubevent((prev) => ({
      ...prev,
      teamMembers: [
        ...prev.teamMembers,
        {
          id: Date.now(),
          email: email.toLowerCase(),
          job,
        },
      ],
    }));

    setNewSubeventMember({ email: "", job: "", fromExisting: false });
    setErrors((prev) => ({
      ...prev,
      subeventMemberEmail: "",
      subeventMemberJob: "",
    }));
  };

  // Selecionar membro da equipe principal
  const selectExistingMember = (email) => {
    const member = teamMembers.find((m) => m.email === email);
    if (member) {
      setNewSubeventMember({
        email: member.email,
        job: member.job,
        fromExisting: true,
      });
      setErrors((prev) => ({
        ...prev,
        subeventMemberEmail: "",
        subeventMemberJob: "",
      }));
    }
  };

  const removeMemberFromSubevent = (memberId) => {
    setNewSubevent((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((m) => m.id !== memberId),
    }));
  };

  const saveSubevent = () => {
    const e = {};
    if (!newSubevent.name.trim())
      e.subeventName = "Nome do subevento é obrigatório";
    if (!newSubevent.location.trim())
      e.subeventLocation = "Local é obrigatório";
    if (!newSubevent.capacity || parseInt(newSubevent.capacity) <= 0)
      e.subeventCapacity = "Capacidade válida é obrigatória";
    if (newSubevent.sections.length === 0)
      e.subeventSections = "Adicione pelo menos uma seção";

    if (Object.keys(e).length > 0) {
      setErrors((prev) => ({ ...prev, ...e }));
      return;
    }

    if (activeSubeventIndex !== null) {
      const updated = [...subevents];
      updated[activeSubeventIndex] = newSubevent;
      setSubevents(updated);
    } else {
      setSubevents((prev) => [...prev, newSubevent]);
    }

    startNewSubevent();
  };

  const removeSubevent = (index) => {
    setSubevents((prev) => prev.filter((_, i) => i !== index));
  };

  // ========== VALIDAÇÃO E NAVEGAÇÃO ==========
  const validate = (s) => {
    const e = {};
    if (s === 0) {
      if (!form.name.trim()) e.name = "Campo obrigatório";
      if (!form.description.trim()) e.description = "Campo obrigatório";
      if (!form.date_start) e.date_start = "Campo obrigatório";
      if (!form.date_end) e.date_end = "Campo obrigatório";
      if (!form.time_start) e.time_start = "Campo obrigatório";
      if (!form.time_end) e.time_end = "Campo obrigatório";
      if (!form.location.trim()) e.location = "Campo obrigatório";
    }
    if (s === 2) {
      // step 2 = subeventos
      if (subevents.length === 0) {
        e.subevents = "Adicione pelo menos um subevento";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validate(step)) setStep((s) => s + 1);
  };
  const prev = () => setStep((s) => s - 1);

  const handleBack = () => {
    if (step === 0) {
      window.location.href = "/userDashboard";
    } else {
      prev();
    }
  };

  // ========== SUBMISSÃO FINAL ==========
  const handleSubmit = async () => {
    setCreatingEvent(true);
    setErrMsg("");

    try {
      // 1. Criar evento principal
      const eventRes = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: form.name,
          description: form.description,
          date_start:
            form.date_start && form.time_start
              ? `${form.date_start}T${form.time_start}:00`
              : null,
          date_end:
            form.date_end && form.time_end
              ? `${form.date_end}T${form.time_end}:00`
              : null,
          location: form.location,
          isPublic: true,
          workload: form.workload ? parseInt(form.workload) : undefined,
          capacity: form.capacity ? parseInt(form.capacity) : undefined,
          category: form.category,
          certType: form.certType,
          issuer: form.issuer,
          certMessage: form.certMessage,
          locationUrl: form.locationUrl,
        }),
      });

      if (!eventRes.ok) {
        const data = await eventRes.json().catch(() => ({}));
        throw new Error(
          data?.message ||
            data?.error ||
            `Erro ao criar evento: ${eventRes.status}`,
        );
      }

      const eventData = await eventRes.json();
      const createdEventId =
        eventData?.data?.event?.id || eventData?.event?.id || eventData?.id;

      if (!createdEventId)
        throw new Error("Não foi possível obter o ID do evento");

      // 2. Convidar equipe do evento principal
      for (const member of teamMembers) {
        await fetch(`/api/events/${createdEventId}/team/invite`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email: member.email, job: member.job }),
        }).catch((err) =>
          console.error(`Erro ao convidar ${member.email}:`, err),
        );
      }

      // 3. Criar subeventos e seus membros/seções
      for (const subevent of subevents) {
        const subRes = await fetch(`/api/events/${createdEventId}/subevents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: subevent.name,
            description: subevent.description,
            location: subevent.location,
            capacity: parseInt(subevent.capacity),
          }),
        });
        if (!subRes.ok) continue;
        const subData = await subRes.json();
        const subeventId = subData?.data?.subEvent?.id || subData?.id;
        if (!subeventId) continue;

        // Seções
        for (const section of subevent.sections) {
          await fetch(
            `/api/events/${createdEventId}/subevents/${subeventId}/sections`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                title: section.title,
                date_start: `${section.date_start}T${section.time_start}:00.000Z`,
                date_end: `${section.date_end}T${section.time_end}:00.000Z`,
                location: section.location,
              }),
            },
          ).catch((err) => console.error("Erro na seção:", err));
        }

        // Membros do subevento
        for (const member of subevent.teamMembers) {
          await fetch(
            `/api/events/${createdEventId}/subevents/${subeventId}/team/invite`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ email: member.email, job: member.job }),
            },
          ).catch((err) =>
            console.error(
              `Erro ao convidar ${member.email} para subevento:`,
              err,
            ),
          );
        }
      }

      window.location.href = `/eventPageAdm?id=${createdEventId}`;
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrMsg(err.message || "Falha ao criar evento.");
    } finally {
      setCreatingEvent(false);
    }
  };

  // Estilo de badge
  const getMemberBadgeStyle = (job) => {
    const role = getRoleFromJob(job);
    const roleConfig =
      TEAM_ROLES.find((r) => r.value === role) || TEAM_ROLES[4];
    return {
      bg: roleConfig.bg,
      border: roleConfig.border,
      color: roleConfig.color,
      label: roleConfig.label,
    };
  };

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
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-accent-foreground mb-3">
            Seu evento,{" "}
            <span className="bg-gradient-to-r from-[#a78bfa] to-[#8b5cf6] bg-clip-text text-transparent">
              em minutos.
            </span>
          </h1>
          <p className="text-accent-foreground/60">
            Preencha as informações abaixo e publique seu evento com
            certificados automáticos.
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
                    ${
                      done
                        ? "bg-gradient-to-br from-[#8b5cf6] to-[#9333ea] text-white"
                        : active
                          ? "bg-primary/10 border-2 border-primary text-primary"
                          : "bg-sidebar border border-border text-accent-foreground/40"
                    }
                  `}
                  >
                    {done ? <Check size={14} /> : i + 1}
                  </div>
                  <span
                    className={`
                    text-[11px] font-bold whitespace-nowrap transition-colors
                    ${active ? "text-primary" : done ? "text-accent-foreground/60" : "text-accent-foreground/30"}
                  `}
                  >
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div
                    className={`w-12 h-px mx-1 mb-6 transition-colors ${done ? "bg-primary/40" : "bg-border"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Card principal - agora com bg-[#11101B] igual ao CreateSubEvent */}
        <div className="bg-[#11101B] border border-border rounded-xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-6 duration-400">
          {/* STEP 0 - INFORMAÇÕES DO EVENTO */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                  Nome do evento <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="ex: Tech Summit Brasil 2025"
                  className={`w-full px-4 py-2.5 text-accent-foreground rounded-lg text-sm bg-[#11101B] border ${
                    errors.name ? "border-red-400/50" : "border-border"
                  } focus:border-primary outline-none placeholder:text-accent-foreground/40`}
                />
                {errors.name && (
                  <p className="text-xs text-red-400 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                  Descrição <span className="text-primary">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={4}
                  placeholder="Descreva o evento, programação e público-alvo..."
                  className={`w-full px-4 py-2.5 text-accent-foreground rounded-lg text-sm bg-[#11101B] border resize-y ${
                    errors.description ? "border-red-400/50" : "border-border"
                  } focus:border-primary outline-none placeholder:text-accent-foreground/40`}
                />
                {errors.description && (
                  <p className="text-xs text-red-400 mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                    Data início *
                  </label>
                  <input
                    type="date"
                    value={form.date_start}
                    onChange={(e) =>
                      handleDateChange("date_start", e.target.value)
                    }
                    className={`w-full px-4 py-2.5 text-accent-foreground rounded-lg text-sm bg-[#11101B] border ${
                      errors.date_start ? "border-red-400/50" : "border-border"
                    } focus:border-primary outline-none`}
                  />
                  {errors.date_start && (
                    <p className="text-xs text-red-400 mt-1">
                      {errors.date_start}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                    Horário início *
                  </label>
                  <input
                    type="time"
                    value={form.time_start}
                    onChange={(e) => set("time_start", e.target.value)}
                    className={`w-full px-4 py-2.5 text-accent-foreground rounded-lg text-sm bg-[#11101B] border ${
                      errors.time_start ? "border-red-400/50" : "border-border"
                    } focus:border-primary outline-none`}
                  />
                  {errors.time_start && (
                    <p className="text-xs text-red-400 mt-1">
                      {errors.time_start}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                    Data término *
                  </label>
                  <input
                    type="date"
                    value={form.date_end}
                    onChange={(e) =>
                      handleDateChange("date_end", e.target.value)
                    }
                    className={`w-full px-4 py-2.5 text-accent-foreground rounded-lg text-sm bg-[#11101B] border ${
                      errors.date_end ? "border-red-400/50" : "border-border"
                    } focus:border-primary outline-none`}
                  />
                  {errors.date_end && (
                    <p className="text-xs text-red-400 mt-1">
                      {errors.date_end}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                    Horário término *
                  </label>
                  <input
                    type="time"
                    value={form.time_end}
                    onChange={(e) => set("time_end", e.target.value)}
                    className={`w-full px-4 py-2.5 text-accent-foreground rounded-lg text-sm bg-[#11101B] border ${
                      errors.time_end ? "border-red-400/50" : "border-border"
                    } focus:border-primary outline-none`}
                  />
                  {errors.time_end && (
                    <p className="text-xs text-red-400 mt-1">
                      {errors.time_end}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                  Local *
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder="ex: Centro de Convenções Frei Caneca, SP"
                  className={`w-full px-4 py-2.5 text-accent-foreground rounded-lg text-sm bg-[#11101B] border ${
                    errors.location ? "border-red-400/50" : "border-border"
                  } focus:border-primary outline-none placeholder:text-accent-foreground/40`}
                />
                {errors.location && (
                  <p className="text-xs text-red-400 mt-1">{errors.location}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                    Categoria
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                    className="w-full px-4 py-2.5 text-accent-foreground rounded-lg text-sm bg-[#11101B] border border-border focus:border-primary outline-none"
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
                  <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                    Capacidade
                  </label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => set("capacity", e.target.value)}
                    placeholder="ex: 200"
                    className="w-full px-4 py-2.5 text-accent-foreground rounded-lg text-sm bg-[#11101B] border border-border focus:border-primary outline-none placeholder:text-accent-foreground/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                  Link do local / online
                </label>
                <input
                  type="url"
                  value={form.locationUrl}
                  onChange={(e) => set("locationUrl", e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 text-accent-foreground rounded-lg text-sm bg-[#11101B] border border-border focus:border-primary outline-none placeholder:text-accent-foreground/40"
                />
              </div>
            </div>
          )}

          {/* STEP 1 - EQUIPE DO EVENTO PRINCIPAL */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                  Membros da Equipe
                </label>
                <p className="text-xs text-accent-foreground/40 mb-3">
                  Adicione os membros da equipe organizadora. Eles receberão um
                  convite por e-mail.
                </p>

                {teamMembers.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {teamMembers.map((member) => {
                      const badge = getMemberBadgeStyle(member.job);
                      return (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-[#11101B] border border-border"
                        >
                          <div className="flex items-center gap-3">
                            <Mail size={14} className="text-purple-400" />
                            <div>
                              <p className="text-sm font-medium text-accent-foreground">
                                {member.email}
                              </p>
                              <span
                                className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded ${badge.color} ${badge.bg} ${badge.border}`}
                              >
                                {member.job}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeTeamMember(member.id)}
                            className="p-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="space-y-3">
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6888]"
                    />
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => {
                        setNewMemberEmail(e.target.value);
                        setErrors((prev) => ({ ...prev, teamMemberEmail: "" }));
                      }}
                      placeholder="E-mail do membro"
                      className={`w-full pl-10 pr-4 py-2.5 text-accent-foreground rounded-lg text-sm bg-[#11101B] border ${
                        errors.teamMemberEmail
                          ? "border-red-400/50"
                          : "border-border"
                      } focus:border-primary outline-none placeholder:text-accent-foreground/40`}
                    />
                  </div>
                  {errors.teamMemberEmail && (
                    <p className="text-xs text-red-400 mt-1">
                      {errors.teamMemberEmail}
                    </p>
                  )}

                  <div>
                    <input
                      type="text"
                      value={newMemberJob}
                      onChange={(e) => {
                        setNewMemberJob(e.target.value);
                        setErrors((prev) => ({ ...prev, teamMemberJob: "" }));
                      }}
                      placeholder="Função (ex: Organizador, Coordenador)"
                      className={`w-full px-4 py-2.5 text-accent-foreground rounded-lg text-sm bg-[#11101B] border ${
                        errors.teamMemberJob
                          ? "border-red-400/50"
                          : "border-border"
                      } focus:border-primary outline-none placeholder:text-accent-foreground/40`}
                    />
                    {errors.teamMemberJob && (
                      <p className="text-xs text-red-400 mt-1">
                        {errors.teamMemberJob}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={addTeamMember}
                  className="w-full mt-3 flex cursor-pointer items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold text-purple-400 bg-purple-400/10 border border-purple-400/20 hover:bg-purple-400/20 transition-colors"
                >
                  <Send size={14} /> Adicionar membro
                </button>

                <div className="mt-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <p className="text-xs text-amber-400/80 flex items-start gap-2">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    Os membros receberão um convite por e-mail. Se não tiverem
                    conta, ela será criada automaticamente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 - SUBEVENTOS */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                  Subeventos / Atividades{" "}
                  <span className="text-primary">*</span>
                </label>
                <p className="text-xs text-accent-foreground/40 mb-3">
                  Adicione as atividades que compõem seu evento. Cada subevento
                  pode ter múltiplas seções (horários).
                </p>

                {errors.subevents && (
                  <p className="text-xs text-red-400 mb-3">
                    {errors.subevents}
                  </p>
                )}

                {/* Lista de subeventos existentes */}
                {subevents.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {subevents.map((sub, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-[#11101B] border border-border"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-accent-foreground">
                              {sub.name}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-accent-foreground/60 mt-1">
                              <span className="flex items-center gap-1">
                                <MapPin size={12} /> {sub.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Target size={12} /> Cap: {sub.capacity}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-accent-foreground/60 mt-1">
                              <span className="flex items-center gap-1">
                                <CalendarDays size={12} /> {sub.sections.length}{" "}
                                seção(ões)
                              </span>
                              <span className="flex items-center gap-1">
                                <Users size={12} /> {sub.teamMembers.length}{" "}
                                membro(s)
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => editSubevent(idx)}
                              className="p-1.5 rounded-md bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 cursor-pointer"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => removeSubevent(idx)}
                              className="p-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Formulário de novo/edição subevento */}
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-semibold text-accent-foreground mb-3">
                    {activeSubeventIndex !== null
                      ? "Editando subevento"
                      : "Novo subevento"}
                  </p>

                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newSubevent.name}
                      onChange={(e) =>
                        setNewSubevent((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Nome do subevento *"
                      className={`w-full px-4 py-2.5 text-accent-foreground rounded-lg text-sm bg-[#11101B] border ${
                        errors.subeventName
                          ? "border-red-400/50"
                          : "border-border"
                      } focus:border-primary outline-none placeholder:text-accent-foreground/40`}
                    />
                    {errors.subeventName && (
                      <p className="text-xs text-red-400">
                        {errors.subeventName}
                      </p>
                    )}

                    <textarea
                      value={newSubevent.description}
                      onChange={(e) =>
                        setNewSubevent((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Descrição (opcional)"
                      rows={2}
                      className="w-full px-4 py-2.5 text-accent-foreground rounded-lg text-sm bg-[#11101B] border border-border focus:border-primary outline-none resize-y placeholder:text-accent-foreground/40"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={newSubevent.location}
                        onChange={(e) =>
                          setNewSubevent((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        placeholder="Local *"
                        className={`px-4 py-2.5 text-accent-foreground rounded-lg text-sm bg-[#11101B] border ${
                          errors.subeventLocation
                            ? "border-red-400/50"
                            : "border-border"
                        } focus:border-primary outline-none placeholder:text-accent-foreground/40`}
                      />
                      <input
                        type="number"
                        value={newSubevent.capacity}
                        onChange={(e) =>
                          setNewSubevent((prev) => ({
                            ...prev,
                            capacity: e.target.value,
                          }))
                        }
                        placeholder="Capacidade *"
                        className={`px-4 py-2.5 text-accent-foreground rounded-lg text-sm bg-[#11101B] border ${
                          errors.subeventCapacity
                            ? "border-red-400/50"
                            : "border-border"
                        } focus:border-primary outline-none placeholder:text-accent-foreground/40`}
                      />
                    </div>
                    {(errors.subeventLocation || errors.subeventCapacity) && (
                      <p className="text-xs text-red-400">
                        {errors.subeventLocation || errors.subeventCapacity}
                      </p>
                    )}

                    {/* Seções do subevento */}
                    <div className="border-t border-border/50 pt-3">
                      <p className="text-xs font-semibold text-accent-foreground/60 mb-2">
                        Seções (horários) *
                      </p>
                      {newSubevent.sections.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {newSubevent.sections.map((section) => (
                            <div
                              key={section.id}
                              className="flex justify-between items-center p-2 rounded-lg bg-[#11101B] border border-border/50"
                            >
                              <span className="text-xs text-accent-foreground/60">
                                {section.title && `${section.title} - `}
                                {section.date_start} {section.time_start} →{" "}
                                {section.date_end} {section.time_end}
                              </span>
                              <button
                                onClick={() =>
                                  removeSectionFromSubevent(section.id)
                                }
                                className="text-red-400 cursor-pointer"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input
                          type="text"
                          value={newSection.title}
                          onChange={(e) =>
                            setNewSection((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          placeholder="Título (opcional)"
                          className="col-span-2 px-3 py-1.5 text-accent-foreground rounded-lg text-xs bg-[#11101B] border border-border focus:border-primary outline-none placeholder:text-accent-foreground/40"
                        />
                        <input
                          type="date"
                          value={newSection.date_start}
                          onChange={(e) =>
                            handleDateChange("date_start", e.target.value, true)
                          }
                          className="px-3 py-1.5 text-accent-foreground rounded-lg text-xs bg-[#11101B] border border-border focus:border-primary outline-none"
                        />
                        <input
                          type="time"
                          value={newSection.time_start}
                          onChange={(e) =>
                            setNewSection((prev) => ({
                              ...prev,
                              time_start: e.target.value,
                            }))
                          }
                          className="px-3 py-1.5 text-accent-foreground rounded-lg text-xs bg-[#11101B] border border-border focus:border-primary outline-none"
                        />
                        <input
                          type="date"
                          value={newSection.date_end}
                          onChange={(e) =>
                            handleDateChange("date_end", e.target.value, true)
                          }
                          className="px-3 py-1.5 text-accent-foreground rounded-lg text-xs bg-[#11101B] border border-border focus:border-primary outline-none"
                        />
                        <input
                          type="time"
                          value={newSection.time_end}
                          onChange={(e) =>
                            setNewSection((prev) => ({
                              ...prev,
                              time_end: e.target.value,
                            }))
                          }
                          className="px-3 py-1.5 text-accent-foreground rounded-lg text-xs bg-[#11101B] border border-border focus:border-primary outline-none"
                        />
                        <input
                          type="text"
                          value={newSection.location}
                          onChange={(e) =>
                            setNewSection((prev) => ({
                              ...prev,
                              location: e.target.value,
                            }))
                          }
                          placeholder="Local específico (opcional)"
                          className="col-span-2 px-3 py-1.5 text-accent-foreground rounded-lg text-xs bg-[#11101B] border border-border focus:border-primary outline-none placeholder:text-accent-foreground/40"
                        />
                      </div>
                      <button
                        onClick={addSectionToSubevent}
                        className="w-full flex cursor-pointer items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium text-purple-400 bg-purple-400/10 border border-purple-400/20 hover:bg-purple-400/20 transition-colors"
                      >
                        <Plus size={12} /> Adicionar seção
                      </button>
                      {errors.sectionError && (
                        <p className="text-xs text-red-400 mt-1">
                          {errors.sectionError}
                        </p>
                      )}
                      {errors.subeventSections && (
                        <p className="text-xs text-red-400 mt-1">
                          {errors.subeventSections}
                        </p>
                      )}
                    </div>

                    {/* Membros do subevento - com opção de escolher da equipe principal */}
                    <div className="border-t border-border/50 pt-3">
                      <p className="text-xs font-semibold text-accent-foreground/60 mb-2">
                        Equipe do subevento
                      </p>

                      {newSubevent.teamMembers.length > 0 && (
                        <div className="space-y-1 mb-2">
                          {newSubevent.teamMembers.map((member) => (
                            <div
                              key={member.id}
                              className="flex justify-between items-center p-1.5 rounded-lg bg-[#11101B] border border-border/50"
                            >
                              <span className="text-xs text-accent-foreground/60">
                                {member.email} - {member.job}
                              </span>
                              <button
                                onClick={() =>
                                  removeMemberFromSubevent(member.id)
                                }
                                className="text-red-400 cursor-pointer"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Se houver membros na equipe principal, mostra select */}
                      {teamMembers.length > 0 && (
                        <div className="mb-2">
                          <select
                            onChange={(e) =>
                              selectExistingMember(e.target.value)
                            }
                            value=""
                            className="w-full px-3 py-1.5 text-accent-foreground rounded-lg text-xs bg-[#11101B] border border-border focus:border-primary outline-none"
                          >
                            <option value="">
                              -- Selecionar da equipe principal --
                            </option>
                            {teamMembers.map((m) => (
                              <option key={m.id} value={m.email}>
                                {m.email} ({m.job})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={newSubeventMember.email}
                          onChange={(e) =>
                            setNewSubeventMember((prev) => ({
                              ...prev,
                              email: e.target.value,
                              fromExisting: false,
                            }))
                          }
                          placeholder="E-mail"
                          className="flex-1 px-3 py-1.5 text-accent-foreground rounded-lg text-xs bg-[#11101B] border border-border focus:border-primary outline-none placeholder:text-accent-foreground/40"
                        />
                        <input
                          type="text"
                          value={newSubeventMember.job}
                          onChange={(e) =>
                            setNewSubeventMember((prev) => ({
                              ...prev,
                              job: e.target.value,
                              fromExisting: false,
                            }))
                          }
                          placeholder="Função"
                          className="flex-1 px-3 py-1.5 text-accent-foreground rounded-lg text-xs bg-[#11101B] border border-border focus:border-primary outline-none placeholder:text-accent-foreground/40"
                        />
                        <button
                          onClick={addMemberToSubevent}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-purple-400 bg-purple-400/10 border border-purple-400/20 hover:bg-purple-400/20 cursor-pointer"
                        >
                          <UserPlus size={12} />
                        </button>
                      </div>
                      {(errors.subeventMemberEmail ||
                        errors.subeventMemberJob) && (
                        <p className="text-xs text-red-400 mt-1">
                          {errors.subeventMemberEmail ||
                            errors.subeventMemberJob}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={saveSubevent}
                      className="w-full flex cursor-pointer items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-purple-600 to-purple-700 hover:opacity-90 transition-all"
                    >
                      {activeSubeventIndex !== null
                        ? "Atualizar subevento"
                        : "Adicionar subevento"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 - REVISÃO */}
          {step === 3 && (
            <div className="space-y-6">
              <p className="text-sm text-accent-foreground/60">
                Confira as informações antes de publicar.
              </p>

              <div>
                <div className="text-[11px] font-bold uppercase text-accent-foreground/40 mb-3">
                  Evento Principal
                </div>
                <div className="space-y-2">
                  <div className="flex gap-3 p-3 rounded-lg bg-[#11101B] border border-border">
                    <ClipboardList
                      size={18}
                      className="text-accent-foreground/40"
                    />
                    <div>
                      <div className="text-[10px] uppercase text-accent-foreground/40">Nome</div>
                      <div className="text-sm text-accent-foreground">{form.name}</div>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 rounded-lg bg-[#11101B] border border-border">
                    <CalendarDays
                      size={18}
                      className="text-accent-foreground/40"
                    />
                    <div>
                      <div className="text-[10px] uppercase text-accent-foreground/40">Data</div>
                      <div className="text-sm text-accent-foreground">
                        {form.date_start} {form.time_start} → {form.date_end}{" "}
                        {form.time_end}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 rounded-lg bg-[#11101B] border border-border">
                    <MapPin size={18} className="text-accent-foreground/40" />
                    <div>
                      <div className="text-[10px] uppercase text-accent-foreground/40">Local</div>
                      <div className="text-sm text-accent-foreground">{form.location}</div>
                    </div>
                  </div>
                </div>
              </div>

              {teamMembers.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase text-accent-foreground/40 mb-3">
                    Equipe do Evento ({teamMembers.length})
                  </div>
                  <div className="space-y-1">
                    {teamMembers.map((m) => (
                      <div
                        key={m.id}
                        className="text-xs text-accent-foreground/60"
                      >
                        {m.email} - {m.job}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {subevents.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase text-accent-foreground/40 mb-3">
                    Subeventos ({subevents.length})
                  </div>
                  <div className="space-y-2">
                    {subevents.map((sub, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-[#11101B] border border-border"
                      >
                        <div className="font-bold text-accent-foreground">
                          {sub.name}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-accent-foreground/60 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} /> {sub.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Target size={12} /> {sub.capacity}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-accent-foreground/60 mt-1">
                          <span className="flex items-center gap-1">
                            <CalendarDays size={12} /> {sub.sections.length}{" "}
                            seção(ões)
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={12} /> {sub.teamMembers.length}{" "}
                            membro(s)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="flex gap-3 p-3 rounded-lg bg-red-400/5 border border-red-400/20">
                  <AlertCircle size={18} className="text-red-400" />
                  <div>
                    <div className="text-sm font-bold text-red-400">
                      Falha ao criar evento
                    </div>
                    <div className="text-xs text-red-400/70">{errMsg}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botões de navegação */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <button
              onClick={handleBack}
              className="flex cursor-pointer items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-accent-foreground/60 border border-border hover:text-accent-foreground hover:border-primary/30 transition-all"
            >
              <ArrowLeft size={14} /> {step === 0 ? "Cancelar" : "Anterior"}
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
                className="flex cursor-pointer items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-[#8b5cf6] to-[#9333ea] shadow-md hover:shadow-lg transition-all"
              >
                Próximo <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={creatingEvent}
                className="flex cursor-pointer items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-[#8b5cf6] to-[#9333ea] shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {creatingEvent ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />{" "}
                    Criando...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} /> Criar Evento
                  </>
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
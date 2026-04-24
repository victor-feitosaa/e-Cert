import { useState, useCallback } from "react";
import {
  Calendar, Clock, MapPin, ArrowLeft, ArrowRight, Check,
  AlertCircle, ClipboardList, FileText, CalendarDays,
  UserPlus, Trash2, User, Plus, Sparkles,
  Users
} from "lucide-react";
import Particles from "./Particles";

const STEP_LABELS = ["Informações", "Seções", "Equipe", "Revisão"];

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
  const [teamMembers, setTeamMembers] = useState([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberJob, setNewMemberJob] = useState("");
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [errMsg, setErrMsg] = useState("");

  // Volta para a página do evento - agora sem parâmetro created
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

  // Função para validar ano com máximo 4 dígitos
  const validateYear = (value) => {
    if (!value) return true;
    const year = value.split('-')[0];
    return !(year && year.length > 4);
  };

  const handleDateChange = (field, value, isSection = false) => {
    if (!validateYear(value)) {
      return; // Impede a mudança se o ano tiver mais de 4 dígitos
    }
    if (isSection) {
      setNewSection(prev => ({ ...prev, [field]: value }));
    } else {
      set(field, value);
    }
  };

  // Funções para gerenciar seções
  const addSection = () => {
    if (!newSection.date_start) {
      setErrors(prev => ({ ...prev, sectionDate: "Data de início é obrigatória" }));
      return;
    }
    if (!newSection.time_start) {
      setErrors(prev => ({ ...prev, sectionTime: "Horário de início é obrigatório" }));
      return;
    }
    if (!newSection.date_end) {
      setErrors(prev => ({ ...prev, sectionDateEnd: "Data de término é obrigatória" }));
      return;
    }
    if (!newSection.time_end) {
      setErrors(prev => ({ ...prev, sectionTimeEnd: "Horário de término é obrigatório" }));
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

  // Funções para gerenciar membros da equipe
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
      if (sections.length === 0) {
        e.sections = "Adicione pelo menos uma seção";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(step)) setStep(s => s + 1); };
  const prev = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setStatus("loading");
    setErrMsg("");

    console.log("=== INICIANDO CRIAÇÃO DO SUBEVENTO ===");
    console.log("Event ID:", eventId);

    try {
      // 1. Criar subevento
      console.log("1️⃣ Enviando requisição para criar subevento...");
      const subeventRes = await fetch(`/api/events/${eventId}/subevents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: form.name,
          description: form.description,
          location: form.location,
          locationUrl: form.locationUrl,
          capacity: form.capacity ? parseInt(form.capacity) : undefined,
        }),
      });

      console.log("Status da resposta:", subeventRes.status);
      
      if (!subeventRes.ok) {
        const errorText = await subeventRes.text();
        console.error("Erro na resposta:", errorText);
        throw new Error(`Erro ${subeventRes.status}: ${errorText}`);
      }

      const subeventData = await subeventRes.json();
      console.log("Resposta completa do backend:", JSON.stringify(subeventData, null, 2));
      
      const createdSubeventId = 
        subeventData?.data?.subEvent?.id ||
        subeventData?.data?.subevent?.id ||
        subeventData?.subevent?.id || 
        subeventData?.id;
      
      console.log("ID extraído:", createdSubeventId);
      
      if (!createdSubeventId) {
        console.error("Não foi possível extrair o ID. Estrutura recebida:", subeventData);
        throw new Error("Backend não retornou o ID do subevento criado");
      }
      
      console.log(`✅ Subevento criado com ID: ${createdSubeventId}`);

      // 2. Adicionar seções (se houver)
      if (sections.length > 0) {
        console.log(`2️⃣ Adicionando ${sections.length} seção(ões)...`);
        
        for (let i = 0; i < sections.length; i++) {
          const section = sections[i];
          const sectionData = {
            title: section.title,
            date_start: `${section.date_start}T${section.time_start}:00.000Z`,
            date_end: `${section.date_end}T${section.time_end}:00.000Z`,
            location: section.location,
          };
          
          console.log(`  Seção ${i + 1}:`, sectionData);
          
          const sectionRes = await fetch(`/api/events/${eventId}/subevents/${createdSubeventId}/sections`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(sectionData),
          });

          console.log(`  Resposta seção ${i + 1} - Status:`, sectionRes.status);

          if (!sectionRes.ok) {
            const errorText = await sectionRes.text();
            console.error(`  Erro na seção ${i + 1}:`, errorText);
            throw new Error(`Falha ao adicionar seção ${i + 1}`);
          }

          const sectionResult = await sectionRes.json();
          console.log(`  ✅ Seção ${i + 1} criada:`, sectionResult);
        }
        console.log("✅ Todas as seções adicionadas com sucesso!");
      } else {
        console.log("2️⃣ Nenhuma seção para adicionar");
      }

      // 3. Adicionar membros da equipe (se houver)
      if (teamMembers.length > 0) {
        console.log(`3️⃣ Adicionando ${teamMembers.length} membro(s) da equipe...`);
        
        for (let i = 0; i < teamMembers.length; i++) {
          const member = teamMembers[i];
          const memberData = {
            name: member.name,
            job: member.job,
            role: "USER",
          };
          
          console.log(`  Membro ${i + 1}:`, memberData);
          
          const memberRes = await fetch(`/api/events/${eventId}/subevents/${createdSubeventId}/members`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(memberData),
          });

          console.log(`  Resposta membro ${i + 1} - Status:`, memberRes.status);

          if (!memberRes.ok) {
            const errorText = await memberRes.text();
            console.error(`  Erro no membro ${i + 1}:`, errorText);
            throw new Error(`Falha ao adicionar membro: ${member.name}`);
          }

          const memberResult = await memberRes.json();
          console.log(`  ✅ Membro ${i + 1} criado:`, memberResult);
        }
        console.log("✅ Todos os membros adicionados com sucesso!");
      } else {
        console.log("3️⃣ Nenhum membro para adicionar");
      }

      console.log("🎉 Subevento criado com sucesso!");
      
      // ✅ Redirecionar diretamente para a página do evento com a aba de subeventos ativa
      if (createdSubeventId) {
        window.location.href = `/eventPageAdm?id=${eventId}`;
      } else {
        window.location.href = "/userDashboard";
      }

    } catch (err) {
      console.error("❌ Erro detalhado:", err);
      setStatus("error");
      setErrMsg(err.message || "Falha ao criar subevento.");
    }
  };

  // Se houver erro, mostra mensagem
  if (status === "error") {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-400 mx-auto mb-6 flex items-center justify-center shadow-lg shadow-red-500/30">
            <AlertCircle size={36} className="text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-accent-foreground mb-3">
            Erro ao criar subevento
          </h2>
          <p className="text-accent-foreground/60 mb-8">{errMsg}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-[#8b5cf6] to-[#9333ea] shadow-md hover:shadow-lg transition-all"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

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
        <div className="bg-sidebar border border-border rounded-xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-6 duration-400">

          {/* Step 0 - Informações */}
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
                  className={`
                    w-full text-accent-foreground px-4 py-2.5 rounded-lg text-sm bg-background border
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
                  placeholder="Descreva o conteúdo, objetivos e público-alvo desta atividade..."
                  rows={4}
                  className={`
                    w-full resize-none px-4 py-2.5 text-accent-foreground rounded-lg text-sm bg-background border 
                    ${errors.description ? "border-red-400/50" : "border-border"}
                    focus:border-primary outline-none transition-colors
                  `}
                />
                {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-accent-foreground mb-1.5">Local</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => set("location", e.target.value)}
                    placeholder="ex: Auditório Principal"
                    className="w-full text-accent-foreground px-4 py-2.5 rounded-lg text-sm bg-background border border-border focus:border-primary outline-none"
                  />
                  <p className="text-xs text-accent-foreground/40 mt-1">Local padrão (pode ser sobrescrito nas seções)</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-accent-foreground mb-1.5">Capacidade</label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={e => set("capacity", e.target.value)}
                    placeholder="ex: 50"
                    className="w-full text-accent-foreground px-4 py-2.5 rounded-lg text-sm bg-background border border-border focus:border-primary outline-none"
                  />
                  <p className="text-xs text-accent-foreground/40 mt-1">Capacidade padrão</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-accent-foreground mb-1.5">Link do local / online</label>
                <input
                  type="url"
                  value={form.locationUrl}
                  onChange={e => set("locationUrl", e.target.value)}
                  placeholder="https://..."
                  className="w-full text-accent-foreground px-4 py-2.5 rounded-lg text-sm bg-background border border-border focus:border-primary outline-none"
                />
                <p className="text-xs text-accent-foreground/40 mt-1">Opcional — Google Maps, link do Meet/Zoom</p>
              </div>
            </div>
          )}

          {/* Step 1 - Seções */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                  Seções / Horários <span className="text-primary">*</span>
                </label>
                <p className="text-xs text-accent-foreground/40 mb-3">
                  Adicione diferentes horários para este subevento (ex: manhã, tarde, múltiplos dias).
                </p>
                
                {/* Lista de seções */}
                {sections.length > 0 && (
                  <div className="space-y-3 mb-4">
                    <p className="text-sm font-semibold text-accent-foreground">Seções adicionadas:</p>
                    {sections.map((section) => (
                      <div key={section.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border">
                        <div className="flex-1">
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
                        <button
                          onClick={() => removeSection(section.id)}
                          className="p-1.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {errors.sections && (
                  <p className="text-xs text-red-400 mb-3">{errors.sections}</p>
                )}

                {/* Adicionar nova seção */}
                <div className="border-t border-border pt-4 mt-2">
                  <p className="text-sm font-semibold text-accent-foreground mb-3">Nova seção:</p>
                  
                  <div className="space-y-3">
                    <div>
                      <input
                        type="text"
                        value={newSection.title}
                        onChange={e => setNewSection(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Título da seção (opcional - ex: Manhã, Tarde, Dia 1)"
                        className="w-full px-4 py-2.5 text-accent-foreground rounded-lg text-sm bg-background border border-border focus:border-primary outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-accent-foreground mb-1">Data início *</label>
                        <input
                          type="date"
                          value={newSection.date_start}
                          onChange={e => handleDateChange("date_start", e.target.value, true)}
                          className="w-full px-3 py-2 text-accent-foreground rounded-lg text-sm bg-background border border-border focus:border-primary outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-accent-foreground mb-1">Horário início *</label>
                        <input
                          type="time"
                          value={newSection.time_start}
                          onChange={e => setNewSection(prev => ({ ...prev, time_start: e.target.value }))}
                          className="w-full px-3 py-2 text-accent-foreground rounded-lg text-sm bg-background border border-border focus:border-primary outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-accent-foreground mb-1">Data término *</label>
                        <input
                          type="date"
                          value={newSection.date_end}
                          onChange={e => handleDateChange("date_end", e.target.value, true)}
                          className="w-full px-3 py-2 text-accent-foreground rounded-lg text-sm bg-background border border-border focus:border-primary outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-accent-foreground mb-1">Horário término *</label>
                        <input
                          type="time"
                          value={newSection.time_end}
                          onChange={e => setNewSection(prev => ({ ...prev, time_end: e.target.value }))}
                          className="w-full px-3 py-2 text-accent-foreground rounded-lg text-sm bg-background border border-border focus:border-primary outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={newSection.location}
                        onChange={e => setNewSection(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Local específico (opcional)"
                        className="w-full text-accent-foreground px-4 py-2.5 rounded-lg text-sm bg-background border border-border focus:border-primary outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={addSection}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold text-purple-400 bg-purple-400/10 border border-purple-400/20 hover:bg-purple-400/20 transition-colors"
                    >
                      <Plus size={16} />
                      Adicionar seção
                    </button>
                  </div>
                </div>
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
                  Adicione os membros da equipe deste subevento e suas respectivas funções.
                </p>
                
                {teamMembers.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-semibold text-accent-foreground">Equipe:</p>
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

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <input
                      type="text"
                      value={newMemberName}
                      onChange={e => setNewMemberName(e.target.value)}
                      placeholder="Nome do membro"
                      className={`
                        w-full px-4 py-2.5 rounded-lg text-accent-foreground text-sm bg-background border
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
                      placeholder="Função (ex: Palestrante, Monitor)"
                      className={`
                        w-full px-4 py-2.5 text-accent-foreground rounded-lg text-sm bg-background border
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
                Confira as informações antes de adicionar este subevento.
              </p>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-accent-foreground/40 mb-3">Informações</div>
                <div className="space-y-2">
                  {form.name && (
                    <div className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border">
                      <ClipboardList size={18} className="text-accent-foreground/40 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] font-bold uppercase text-accent-foreground/40">Nome</div>
                        <div className="text-sm font-medium text-accent-foreground">{form.name}</div>
                      </div>
                    </div>
                  )}
                  {form.description && (
                    <div className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border">
                      <FileText size={18} className="text-accent-foreground/40 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] font-bold uppercase text-accent-foreground/40">Descrição</div>
                        <div className="text-sm font-medium text-accent-foreground">{form.description}</div>
                      </div>
                    </div>
                  )}
                  {form.location && (
                    <div className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border">
                      <MapPin size={18} className="text-accent-foreground/40 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] font-bold uppercase text-accent-foreground/40">Local</div>
                        <div className="text-sm font-medium text-accent-foreground">{form.location}</div>
                      </div>
                    </div>
                  )}
                  {form.capacity && (
                    <div className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border">
                      <Users size={18} className="text-accent-foreground/40 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] font-bold uppercase text-accent-foreground/40">Capacidade</div>
                        <div className="text-sm font-medium text-accent-foreground">{form.capacity}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {sections.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-accent-foreground/40 mb-3">Seções</div>
                  <div className="space-y-2">
                    {sections.map((section, idx) => (
                      <div key={section.id} className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border">
                        <CalendarDays size={18} className="text-accent-foreground/40 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-[10px] font-bold uppercase text-accent-foreground/40">
                            Seção {idx + 1}
                          </div>
                          <div className="text-sm font-medium text-accent-foreground">
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
                  <div className="text-[11px] font-bold uppercase tracking-wider text-accent-foreground/40 mb-3">Equipe</div>
                  <div className="space-y-2">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border">
                        <User size={18} className="text-accent-foreground/40 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-[10px] font-bold uppercase text-accent-foreground/40">Membro</div>
                          <div className="text-sm font-medium text-accent-foreground">{member.name} - {member.job}</div>
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
                    <div className="text-sm font-bold text-red-400">Falha ao criar subevento</div>
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
                  <>
                    <Sparkles size={14} />
                    Criar SubEvento
                  </>
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
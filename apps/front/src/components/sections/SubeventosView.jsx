import { useState, useEffect } from "react";
import { 
  Plus, Calendar, MapPin, Clock, Users, Edit2, Trash2, X, AlertTriangle, 
  User, UserPlus, CalendarDays
} from "lucide-react";

// datetime-local exige "YYYY-MM-DDTHH:MM" no horário LOCAL, não UTC
const toLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/* ─── MODAL EDIÇÃO ─── */
function SubeventoModal({ subevento, onClose, onSave, loading, apiError }) {
  const [form, setForm] = useState({
    title:        subevento?.title        || "",
    description:  subevento?.description  || "",
    location:     subevento?.location     || "",
    capacity:     subevento?.capacity     ? String(subevento.capacity) : "",
  });
  const [sections, setSections] = useState(subevento?.sections || []);
  const [newSection, setNewSection] = useState({
    title: "",
    date_start: "",
    time_start: "",
    date_end: "",
    time_end: "",
    location: "",
  });
  const [teamMembers, setTeamMembers] = useState(subevento?.team || []);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberJob, setNewMemberJob] = useState("");
  const [errors, setErrors] = useState({});

  const set = (field, val) => {
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

  // Funções para gerenciar seções no modal
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
  };

  const removeSection = (id) => {
    setSections(prev => prev.filter(section => section.id !== id));
  };

  // Funções para gerenciar membros da equipe no modal
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
  };

  const removeTeamMember = (id) => {
    setTeamMembers(prev => prev.filter(member => member.id !== id));
  };

  const handleSave = () => {
    if (validate()) {
      onSave({ 
        ...form, 
        sections, 
        teamMembers,
        id: subevento?.id 
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-6 overflow-y-auto">
      <div className="bg-[#111827] border border-purple-500/20 rounded-2xl p-8 w-full max-w-2xl shadow-2xl mt-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Editar sub-evento</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Informações básicas */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1.5">
              Título <span className="text-purple-400">*</span>
            </label>
            <input
              value={form.title}
              onChange={e => set("title", e.target.value)}
              placeholder="ex: Palestra de Abertura"
              className="w-full bg-[#161f30] border border-purple-500/20 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/10 transition"
            />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1.5">Descrição</label>
            <textarea
              value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="Descreva o sub-evento..."
              rows={3}
              className="w-full bg-[#161f30] border border-purple-500/20 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/10 transition resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1.5">
              Local <span className="text-purple-400">*</span>
            </label>
            <input
              value={form.location}
              onChange={e => set("location", e.target.value)}
              placeholder="ex: Auditório A, Sala 201..."
              className="w-full bg-[#161f30] border border-purple-500/20 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/10 transition"
            />
            {errors.location && <p className="text-red-400 text-xs mt-1">{errors.location}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">Capacidade</label>
              <input
                type="number"
                value={form.capacity}
                onChange={e => set("capacity", e.target.value)}
                placeholder="ex: 50"
                className="w-full bg-[#161f30] border border-purple-500/20 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/10 transition"
              />
            </div>
          </div>

          {/* Seções */}
          <div className="border-t border-border pt-4">
            <label className="block text-sm font-semibold text-gray-300 mb-1.5">Seções / Horários</label>
            
            {sections.length > 0 && (
              <div className="space-y-2 mb-4">
                {sections.map((section, idx) => (
                  <div key={section.id || idx} className="flex items-center justify-between p-2 rounded-lg bg-background/50 border border-border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <CalendarDays size={12} className="text-purple-400" />
                        <span>
                          {section.title && `${section.title} - `}
                          {section.date_start} {section.time_start} → {section.date_end} {section.time_end}
                        </span>
                      </div>
                      {section.location && (
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <MapPin size={10} />
                          <span>{section.location}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeSection(section.id)}
                      className="p-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mb-2">
              <input
                type="date"
                value={newSection.date_start}
                onChange={e => setNewSection(prev => ({ ...prev, date_start: e.target.value }))}
                placeholder="Data início"
                className="bg-[#161f30] border border-purple-500/20 rounded-lg px-2 py-1.5 text-xs text-white"
              />
              <input
                type="time"
                value={newSection.time_start}
                onChange={e => setNewSection(prev => ({ ...prev, time_start: e.target.value }))}
                placeholder="Hora início"
                className="bg-[#161f30] border border-purple-500/20 rounded-lg px-2 py-1.5 text-xs text-white"
              />
              <input
                type="date"
                value={newSection.date_end}
                onChange={e => setNewSection(prev => ({ ...prev, date_end: e.target.value }))}
                placeholder="Data término"
                className="bg-[#161f30] border border-purple-500/20 rounded-lg px-2 py-1.5 text-xs text-white"
              />
              <input
                type="time"
                value={newSection.time_end}
                onChange={e => setNewSection(prev => ({ ...prev, time_end: e.target.value }))}
                placeholder="Hora término"
                className="bg-[#161f30] border border-purple-500/20 rounded-lg px-2 py-1.5 text-xs text-white"
              />
            </div>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSection.title}
                onChange={e => setNewSection(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título (opcional)"
                className="flex-1 bg-[#161f30] border border-purple-500/20 rounded-lg px-2 py-1.5 text-xs text-white"
              />
              <input
                type="text"
                value={newSection.location}
                onChange={e => setNewSection(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Local específico"
                className="flex-1 bg-[#161f30] border border-purple-500/20 rounded-lg px-2 py-1.5 text-xs text-white"
              />
            </div>
            <button
              onClick={addSection}
              className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold text-purple-400 bg-purple-400/10 border border-purple-400/20 hover:bg-purple-400/20 transition-colors"
            >
              <Plus size={12} /> Adicionar seção
            </button>
          </div>

          {/* Membros da Equipe */}
          <div className="border-t border-border pt-4">
            <label className="block text-sm font-semibold text-gray-300 mb-1.5">Membros da Equipe</label>
            
            {teamMembers.length > 0 && (
              <div className="space-y-2 mb-4">
                {teamMembers.map((member, idx) => (
                  <div key={member.id || idx} className="flex items-center justify-between p-2 rounded-lg bg-background/50 border border-border">
                    <div className="flex items-center gap-2">
                      <User size={12} className="text-purple-400" />
                      <span className="text-sm text-white">{member.name}</span>
                      <span className="text-xs text-gray-400">- {member.job}</span>
                    </div>
                    <button
                      onClick={() => removeTeamMember(member.id)}
                      className="p-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
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
                value={newMemberName}
                onChange={e => setNewMemberName(e.target.value)}
                placeholder="Nome do membro"
                className="bg-[#161f30] border border-purple-500/20 rounded-lg px-2 py-1.5 text-xs text-white"
              />
              <input
                type="text"
                value={newMemberJob}
                onChange={e => setNewMemberJob(e.target.value)}
                placeholder="Função"
                className="bg-[#161f30] border border-purple-500/20 rounded-lg px-2 py-1.5 text-xs text-white"
              />
            </div>
            <button
              onClick={addTeamMember}
              className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold text-purple-400 bg-purple-400/10 border border-purple-400/20 hover:bg-purple-400/20 transition-colors"
            >
              <UserPlus size={12} /> Adicionar membro
            </button>
          </div>
        </div>

        {apiError && (
          <div className="mt-4 flex items-start gap-2.5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-400">{apiError}</p>
          </div>
        )}

        <div className="flex justify-end gap-2.5 mt-6 pt-5 border-t border-white/5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-gray-400 border border-white/10 rounded-lg hover:text-white hover:border-purple-500/30 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-gradient-to-br from-[#7c3aed] to-[#9333ea] rounded-lg shadow-[0_4px_14px_rgba(124,58,237,0.4)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Salvando..." : <><Edit2 size={13} /> Salvar</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── MODAL DELETE ─── */
function DeleteModal({ subevento, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-[#111827] border border-red-500/20 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle size={16} className="text-red-400" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">Excluir sub-evento</p>
            <p className="text-xs text-gray-500">Essa ação não pode ser desfeita</p>
          </div>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed mb-6 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
          Você está prestes a excluir <strong className="text-white">{subevento?.title}</strong>. Todos os dados serão removidos permanentemente.
        </p>
        <div className="flex justify-end gap-2.5">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-bold text-gray-400 border border-white/10 rounded-lg hover:text-white hover:border-purple-500/30 transition-all">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-br from-red-600 to-red-400 rounded-lg shadow-[0_4px_14px_rgba(248,113,113,0.3)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Trash2 size={13} /> {loading ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── CARD ─── */
function SubeventoCard({ subevento, onEdit, onDelete }) {
  const [showDetails, setShowDetails] = useState(false);
  
  const fmtDate = (s) => s
    ? new Date(s).toLocaleDateString("pt-BR", { day:"2-digit", month:"short", year:"numeric", timeZone:"America/Sao_Paulo" })
    : null;
  const fmtTime = (s) => s
    ? new Date(s).toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit", timeZone:"America/Sao_Paulo" })
    : null;

  return (
    <div className="bg-[#111827] border border-purple-500/10 rounded-xl overflow-hidden hover:border-purple-500/30 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] transition-all duration-200 group">
      <div className="h-0.5 bg-gradient-to-r from-purple-600/60 via-purple-400/30 to-transparent" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-bold text-white text-base leading-snug line-clamp-2">{subevento.title}</h3>
          <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(subevento)} className="p-1.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-colors">
              <Edit2 size={13} />
            </button>
            <button onClick={() => onDelete(subevento)} className="p-1.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {subevento.description && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">{subevento.description}</p>
        )}

        {/* Seções */}
        {subevento.sections && subevento.sections.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
              <CalendarDays size={12} />
              <span>{subevento.sections.length} seção(ões)</span>
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="text-purple-400 hover:text-purple-300 text-xs ml-2"
              >
                {showDetails ? "▼" : "▶"} ver
              </button>
            </div>
            {showDetails && (
              <div className="space-y-1 pl-2 border-l border-purple-500/20">
                {subevento.sections.map((section, idx) => (
                  <div key={idx} className="text-xs text-gray-500">
                    {section.title && <span className="font-semibold">{section.title}: </span>}
                    {fmtDate(section.date_start)} {fmtTime(section.date_start)} → {fmtDate(section.date_end)} {fmtTime(section.date_end)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          {subevento.location && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin size={12} className="text-gray-600 shrink-0" />
              <span className="truncate">{subevento.location}</span>
            </div>
          )}
          {subevento.capacity && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Users size={12} className="text-gray-600 shrink-0" />
              <span>Capacidade: {subevento.capacity}</span>
            </div>
          )}
        </div>

        {/* Membros da Equipe */}
        {subevento.team && subevento.team.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {subevento.team.map((member, idx) => (
              <span key={idx} className="text-xs font-medium px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {member.name} - {member.job}
              </span>
            ))}
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

  // Busca lista via proxy Astro
  const fetchSubevents = async () => {
    setFetchLoading(true);
    try {
      console.log("🔍 Buscando subeventos para evento:", eventId);
      const res = await fetch(`/api/events/${eventId}/subevents`, {
        credentials: "include",
      });
      
      console.log("📡 Status da resposta:", res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Erro na resposta:", errorText);
        throw new Error(`Erro ${res.status}`);
      }
      
      const data = await res.json();
      console.log("📦 Dados recebidos:", data);
      
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data?.data?.subevents && Array.isArray(data.data.subevents)) {
        list = data.data.subevents;
      } else if (data?.subevents && Array.isArray(data.subevents)) {
        list = data.subevents;
      } else if (data?.data && Array.isArray(data.data)) {
        list = data.data;
      }
      
      // Garantir que cada subevento tenha sections e team
      list = list.map(sub => ({
        ...sub,
        sections: sub.sections || [],
        team: sub.team || []
      }));
      
      console.log(`✅ ${list.length} subeventos encontrados com seções e equipe`);
      setSubeventos(list);
      onSubeventsUpdate?.(list);
    } catch (err) {
      console.error("Erro ao buscar subeventos:", err);
      // Fallback para os dados iniciais
      const fallbackList = Array.isArray(initialData) ? initialData : [];
      setSubeventos(fallbackList);
    } finally {
      setFetchLoading(false);
    }
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    if (eventId && !initialLoadDone) {
      fetchSubevents();
      setInitialLoadDone(true);
    }
  }, [eventId]);

  // Detectar criação de novo subevento
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

  const openEdit   = (sub) => { setEditing(sub); setApiError(""); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); setApiError(""); };

  const handleSave = async (formData) => {
    setSaving(true);
    setApiError("");

    try {
      // Atualizar subevento
      const res = await fetch(`/api/events/${eventId}/subevents/${editing.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          location: formData.location,
          capacity: formData.capacity ? Number(formData.capacity) : null,
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.message || `Erro ${res.status}`);
      }

      // Atualizar seções (apenas as novas)
      for (const section of formData.sections) {
        if (section.id && section.id.toString().includes('.')) {
          await fetch(`/api/events/${eventId}/subevents/${editing.id}/sections`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: section.title,
              date_start: `${section.date_start}T${section.time_start}:00.000Z`,
              date_end: `${section.date_end}T${section.time_end}:00.000Z`,
              location: section.location,
            }),
          });
        }
      }

      // Atualizar membros da equipe (apenas os novos)
      for (const member of formData.teamMembers) {
        if (member.id && member.id.toString().includes('.')) {
          await fetch(`/api/events/${eventId}/subevents/${editing.id}/members`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: member.name,
              job: member.job,
              role: "USER",
            }),
          });
        }
      }

      // Recarregar a lista
      await fetchSubevents();
      closeModal();

    } catch (err) {
      console.error("Erro ao salvar:", err);
      setApiError(err.message || "Falha ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDelLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/subevents/${deleting.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      await fetchSubevents();
      setDeleting(null);
    } catch (err) {
      console.error("Erro ao excluir sub-evento:", err);
    } finally {
      setDelLoading(false);
    }
  };

  if (fetchLoading && subeventos.length === 0) {
    return (
      <section className="min-h-screen p-4">
        <h1 className="text-2xl font-bold text-white mb-6">Sub-eventos</h1>
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Sub-eventos</h1>
          <p className="text-sm text-gray-500">
            {subeventos.length === 0
              ? "Nenhum sub-evento cadastrado"
              : `${subeventos.length} sub-evento${subeventos.length !== 1 ? "s" : ""} cadastrado${subeventos.length !== 1 ? "s" : ""}`
            }
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-br from-[#8b5cf6] to-[#9333ea] rounded-lg shadow-[0_4px_14px_rgba(124,58,237,0.4)] hover:shadow-[0_8px_24px_rgba(124,58,237,0.55)] hover:opacity-90 transition-all"
        >
          <Plus size={15} /> Novo sub-evento
        </button>
      </div>

      {subeventos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-gray-700 rounded-xl text-center">
          <Calendar size={32} className="text-gray-600 mb-4" />
          <p className="font-bold text-white mb-1">Nenhum sub-evento criado</p>
          <p className="text-sm text-gray-500 mb-5">Adicione sessões, workshops ou palestras ao seu evento.</p>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-br from-[#7c3aed] to-[#9333ea] rounded-lg shadow-[0_4px_14px_rgba(124,58,237,0.35)] hover:opacity-90 transition-all"
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
            className="flex flex-col items-center justify-center gap-2 p-8 border border-dashed border-gray-700 rounded-xl text-sm font-semibold text-gray-600 hover:text-purple-400 hover:border-purple-500/40 hover:bg-purple-500/[0.03] transition-all min-h-[140px]"
          >
            <Plus size={20} strokeWidth={1.5} />
            Adicionar sub-evento
          </button>
        </div>
      )}

      {modalOpen && (
        <SubeventoModal
          subevento={editing}
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
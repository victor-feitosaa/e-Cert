import { useState, useEffect } from "react";
import { Plus, Calendar, MapPin, Clock, Users, Edit2, Trash2, X, AlertTriangle } from "lucide-react";

// datetime-local exige "YYYY-MM-DDTHH:MM" no horário LOCAL, não UTC
const toLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Normaliza qualquer formato de resposta da API para array
const toArray = (data) => {
  if (Array.isArray(data))                      return data;
  if (Array.isArray(data?.data?.subevents))     return data.data.subevents;
  if (Array.isArray(data?.subevents))           return data.subevents;
  if (Array.isArray(data?.data))                return data.data;
  return [];
};

/* ─── MODAL EDIÇÃO ─── */
function SubeventoModal({ subevento, onClose, onSave, loading, apiError }) {
  const [form, setForm] = useState({
    title:        subevento?.title        || "",
    description:  subevento?.description  || "",
    date:         toLocalInput(subevento?.date),
    endDate:      toLocalInput(subevento?.endDate),
    location:     subevento?.location     || "",
    maxAttendees: subevento?.maxAttendees ? String(subevento.maxAttendees) : "",
    workload:     subevento?.workload     ? String(subevento.workload)     : "",
    speaker:      subevento?.speaker      || "",
  });
  const [errors, setErrors] = useState({});

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())    e.title    = "Título é obrigatório.";
    if (!form.date)            e.date     = "Data de início é obrigatória.";
    if (!form.location.trim()) e.location = "Local é obrigatório.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-6 overflow-y-auto">
      <div className="bg-[#111827] border border-purple-500/20 rounded-2xl p-8 w-full max-w-lg shadow-2xl mt-10">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Editar sub-evento</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                Início <span className="text-purple-400">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.date}
                onChange={e => set("date", e.target.value)}
                className="w-full bg-[#161f30] border border-purple-500/20 rounded-lg px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/10 transition"
              />
              {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">Término</label>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={e => set("endDate", e.target.value)}
                className="w-full bg-[#161f30] border border-purple-500/20 rounded-lg px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/10 transition"
              />
            </div>
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
                value={form.maxAttendees}
                onChange={e => set("maxAttendees", e.target.value)}
                placeholder="ex: 50"
                className="w-full bg-[#161f30] border border-purple-500/20 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/10 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">Carga horária (h)</label>
              <input
                type="number"
                value={form.workload}
                onChange={e => set("workload", e.target.value)}
                placeholder="ex: 2"
                className="w-full bg-[#161f30] border border-purple-500/20 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/10 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1.5">Palestrante / Responsável</label>
            <input
              value={form.speaker}
              onChange={e => set("speaker", e.target.value)}
              placeholder="ex: Dr. Ana Beatriz Ferreira"
              className="w-full bg-[#161f30] border border-purple-500/20 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/10 transition"
            />
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
            onClick={() => { if (validate()) onSave(form); }}
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

        <div className="space-y-2">
          {subevento.date && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar size={12} className="text-gray-600 shrink-0" />
              <span>{fmtDate(subevento.date)}</span>
              {fmtTime(subevento.date) && (
                <><Clock size={12} className="text-gray-600 shrink-0 ml-1" /><span>{fmtTime(subevento.date)}</span></>
              )}
            </div>
          )}
          {subevento.location && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin size={12} className="text-gray-600 shrink-0" />
              <span className="truncate">{subevento.location}</span>
            </div>
          )}
          {subevento.maxAttendees && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Users size={12} className="text-gray-600 shrink-0" />
              <span>{subevento.participants || 0} / {subevento.maxAttendees} participantes</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {subevento.workload && (
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
              ⏱ {subevento.workload}h
            </span>
          )}
          {subevento.speaker && (
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-white/[0.04] text-gray-500 border border-white/5 italic">
              {subevento.speaker}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN ─── */
export default function SubeventosView({ subeventData: initialData = [], eventId, onSubeventsUpdate }) {
  const [subeventos, setSubeventos] = useState(Array.isArray(initialData) ? initialData : []);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [deleting, setDeleting]     = useState(null);
  const [saving, setSaving]         = useState(false);
  const [delLoading, setDelLoading] = useState(false);
  const [apiError, setApiError]     = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);

  // Busca lista via proxy Astro
  const fetchSubevents = async () => {
    setFetchLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/subevents`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();
      const list = toArray(data);
      setSubeventos(list);
      onSubeventsUpdate?.(list);
    } catch (err) {
      console.error("Erro ao buscar subeventos:", err);
    } finally {
      setFetchLoading(false);
    }
  };

  // Detecta retorno da página de criação (?created=1)
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

  const handleSave = async (form) => {
    setSaving(true);
    setApiError("");

    const toISO = (localStr) => localStr ? new Date(localStr).toISOString() : null;
    const payload = {
      title:        form.title,
      description:  form.description  || null,
      date:         toISO(form.date),
      endDate:      toISO(form.endDate),
      location:     form.location,
      maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : null,
      workload:     form.workload     ? Number(form.workload)     : null,
      speaker:      form.speaker      || null,
    };

    try {
      const res = await fetch(`/api/events/${eventId}/subevents/${editing.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.message || `Erro ${res.status}`);
      }

      // Atualização otimista: aplica as mudanças localmente sem esperar refetch
      const updated = {
        ...editing,
        ...payload,
        // mantém campos calculados que o backend pode retornar
      };
      setSubeventos(prev => prev.map(s => s.id === editing.id ? updated : s));
      closeModal();

    } catch (err) {
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
      // Remove localmente sem refetch
      setSubeventos(prev => prev.filter(s => s.id !== deleting.id));
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
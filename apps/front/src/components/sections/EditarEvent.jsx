// sections/EditarEvent.jsx
import { useState, useEffect } from "react";
import { CalendarDays, ClipboardList, Cog, Globe, Lock, AlertTriangle, Save } from "lucide-react";

export default function EditarEvent({ eventId, onEventUpdated, onEventDeleted }) {
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);  // ID do usuário logado
    const [organizerId, setOrganizerId] = useState(null);      // ID do criador do evento

    const validateYear = (value) => {
        if (!value) return true;
        const year = value.split('-')[0];
        return !(year && year.length > 4);
    };

    const formatDateForInput = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = `${date.getMonth() + 1}`.padStart(2, "0");
        const year = date.getFullYear().toString();
        const validYear = year.length > 4 ? new Date().getFullYear().toString() : year;
        return `${validYear}-${month}-${day}`;
    };

    function formatTimeForInput(isoString) {
        if (!isoString) return "";
        const d = new Date(isoString);
        return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
    }

    const handleDateChange = (field, value) => {
        if (!validateYear(value)) return;
        setForm(f => ({ ...f, [field]: value }));
    };

    const fetchEventData = async () => {
        try {
            setLoading(true);
            setError("");

            // 1. Buscar dados do usuário logado
            const meRes = await fetch(`/api/auth/me`, {
                method: "GET",
                credentials: "include"
            });
            if (!meRes.ok) {
                const errorMe = await meRes.json();
                throw new Error(errorMe.error || "Erro ao carregar dados do usuário");
            }
            const userData = await meRes.json();
            
            const loggedUserId = userData?.data.user?.id 
            if (!loggedUserId) throw new Error("ID do usuário não encontrado");
            setCurrentUserId(loggedUserId);

            // 2. Buscar dados do evento
            const res = await fetch(`/api/events/${eventId}`, {
                method: "GET",
                credentials: "include",
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Erro ao carregar evento");
            }
            const response = await res.json();
            const ev = response.data?.event || response.event || response.data;
            if (!ev) throw new Error("Dados do evento não encontrados");

            // Armazenar ID do organizador
            const creatorId = ev.creator?.id || ev.createdBy;
            if (!creatorId) throw new Error("Organizador do evento não identificado");
            setOrganizerId(creatorId);

            setForm({
                title: ev.title || "",
                description: ev.description || "",
                location: ev.location || "",
                date_start: formatDateForInput(ev.date_start),
                date_end: formatDateForInput(ev.date_end),
                category: ev.category || "tecnologia",
                capacity: ev.capacity || "",
                time_start: formatTimeForInput(ev.date_start),
                time_end: formatTimeForInput(ev.date_end),
                isPublic: ev.isPublic ?? true,
            });
        } catch (err) {
            console.error("Erro fetchEventData:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (eventId) fetchEventData();
    }, [eventId]);

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
    const togglePublic = (val) => setForm(f => ({ ...f, isPublic: Boolean(val) }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess(false);

        if (form.date_start && !validateYear(form.date_start)) {
            setError("Ano da data de início não pode ter mais de 4 dígitos");
            setSaving(false);
            return;
        }
        if (form.date_end && !validateYear(form.date_end)) {
            setError("Ano da data de término não pode ter mais de 4 dígitos");
            setSaving(false);
            return;
        }

        const payload = {
            title: form.title,
            description: form.description,
            location: form.location,
            category: form.category,
            capacity: form.capacity ? Number(form.capacity) : null,
            date_start: form.date_start && form.time_start ? `${form.date_start}T${form.time_start}:00` : null,
            date_end: form.date_end && form.time_end ? `${form.date_end}T${form.time_end}:00` : null,
            isPublic: Boolean(form.isPublic),
        };

        try {
            const res = await fetch(`/api/events/${eventId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error || data?.message || `Erro ${res.status}`);
            }

            const updatedEvent = data.data?.event || data.event || data.data;

            setSuccess(true);

            if (onEventUpdated && updatedEvent) {
                onEventUpdated(updatedEvent);
            }

            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error("Erro handleSubmit:", err);
            setError(err.message || "Falha ao salvar. Tente novamente.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja cancelar este evento? Esta ação não pode ser desfeita.")) return;

        setDeleting(true);
        setError("");

        try {
            const res = await fetch(`/api/events/${eventId}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || errorData.message || "Erro ao cancelar evento");
            }

            if (onEventDeleted) {
                onEventDeleted(eventId);
            } else {
                window.location.href = "/userDashboard";
            }
        } catch (err) {
            console.error("Erro handleDelete:", err);
            setError(err.message || "Falha ao cancelar evento. Tente novamente.");
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                <span className="text-sm text-[#6b6888]">Carregando evento...</span>
            </div>
        );
    }

    if (error && !form) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
                <AlertTriangle className="mx-auto mb-3 text-red-400" size={24} />
                <p className="text-sm text-red-400 mb-4">{error}</p>
                <button onClick={fetchEventData} className="px-4 py-2 bg-purple-600 rounded-lg text-white text-sm hover:opacity-90 transition-opacity">
                    Tentar novamente
                </button>
            </div>
        );
    }

    if (!form) return null;

    // Verifica se o usuário logado é o organizador
    const isOrganizer = currentUserId && organizerId && currentUserId === organizerId;

    return (
        <section>
            <form onSubmit={handleSubmit} className="flex gap-6">
                {/* ESQUERDA */}
                <div className="w-1/2 bg-[#13111e] border border-white/[0.07] rounded-xl">
                    <div className="flex p-4 items-center gap-2 border-b border-white/[0.06]">
                        <ClipboardList size={20} className="text-purple-400" />
                        <h3 className="font-extrabold text-white">Informações principais</h3>
                    </div>

                    <fieldset className="flex flex-col gap-1 p-4">
                        <label className="text-sm font-bold text-[#6b6888]">Nome do evento</label>
                        <input type="text" className="p-3 border rounded-lg text-sm border-white/[0.06] bg-[#0f0d1a] text-white outline-none focus:border-purple-500/40 transition-colors" value={form.title} onChange={set("title")} required />
                    </fieldset>

                    <fieldset className="flex flex-col gap-1 p-4">
                        <label className="text-sm font-bold text-[#6b6888]">Descrição</label>
                        <textarea className="p-3 resize-none h-40 border rounded-lg text-sm border-white/[0.06] bg-[#0f0d1a] text-white outline-none focus:border-purple-500/40 transition-colors leading-relaxed" value={form.description} onChange={set("description")} />
                    </fieldset>

                    <fieldset className="flex flex-col gap-1 p-4">
                        <label className="text-sm font-bold text-[#6b6888]">Local</label>
                        <input type="text" className="p-3 border rounded-lg text-sm border-white/[0.06] bg-[#0f0d1a] text-white outline-none focus:border-purple-500/40 transition-colors" value={form.location} onChange={set("location")} />
                    </fieldset>

                    <fieldset className="flex flex-col gap-1 p-4">
                        <label className="text-sm font-bold text-[#6b6888]">Categoria</label>
                        <select
                            value={form.category || "tecnologia"}
                            onChange={set("category")}
                            className="w-full px-4 py-2.5 rounded-lg text-sm bg-[#0f0d1a] border border-white/[0.06] focus:border-purple-500/40 outline-none cursor-pointer text-white"
                        >
                            <option value="tecnologia">Tecnologia</option>
                            <option value="negocios">Negócios</option>
                            <option value="design">Design</option>
                            <option value="educacao">Educação</option>
                            <option value="saude">Saúde</option>
                            <option value="cultura">Cultura</option>
                            <option value="outro">Outro</option>
                        </select>
                    </fieldset>

                    <fieldset className="flex flex-col gap-1 p-4">
                        <label className="text-sm font-bold text-[#6b6888]">Capacidade</label>
                        <input 
                            type="number" 
                            className="p-3 border rounded-lg text-sm border-white/[0.06] bg-[#0f0d1a] text-white outline-none focus:border-purple-500/40 transition-colors" 
                            value={form.capacity || ""} 
                            onChange={set("capacity")} 
                            min="0"
                        />
                    </fieldset>
                </div>

                {/* DIREITA */}
                <div className="w-1/2 flex flex-col gap-4">
                    <div className="bg-[#13111e] border border-white/[0.07] rounded-xl">
                        <div className="flex p-4 items-center gap-2 border-b border-white/[0.06]">
                            <CalendarDays size={20} className="text-purple-400" />
                            <h3 className="font-extrabold text-white">Data & Horário</h3>
                        </div>
                        <div className="flex">
                            <fieldset className="flex flex-col gap-1 p-4 w-1/2">
                                <label className="text-sm font-bold text-[#6b6888]">Data de início</label>
                                <input 
                                    type="date" 
                                    className="p-3 border rounded-lg text-sm border-white/[0.06] bg-[#0f0d1a] text-white outline-none focus:border-purple-500/40 transition-colors" 
                                    value={form.date_start || ""} 
                                    onChange={(e) => handleDateChange("date_start", e.target.value)} 
                                    required 
                                />
                            </fieldset>
                            <fieldset className="flex flex-col gap-1 p-4 w-1/2">
                                <label className="text-sm font-bold text-[#6b6888]">Horário</label>
                                <input 
                                    type="time" 
                                    className="p-3 border rounded-lg text-sm border-white/[0.06] bg-[#0f0d1a] text-white outline-none focus:border-purple-500/40 transition-colors" 
                                    value={form.time_start || ""} 
                                    onChange={set("time_start")} 
                                />
                            </fieldset>
                        </div>
                        <div className="flex">
                            <fieldset className="flex flex-col gap-1 p-4 w-1/2">
                                <label className="text-sm font-bold text-[#6b6888]">Data de Término</label>
                                <input 
                                    type="date" 
                                    className="p-3 border rounded-lg text-sm border-white/[0.06] bg-[#0f0d1a] text-white outline-none focus:border-purple-500/40 transition-colors" 
                                    value={form.date_end || ""} 
                                    onChange={(e) => handleDateChange("date_end", e.target.value)} 
                                    required 
                                />
                            </fieldset>
                            <fieldset className="flex flex-col gap-1 p-4 w-1/2">
                                <label className="text-sm font-bold text-[#6b6888]">Horário</label>
                                <input 
                                    type="time" 
                                    className="p-3 border rounded-lg text-sm border-white/[0.06] bg-[#0f0d1a] text-white outline-none focus:border-purple-500/40 transition-colors" 
                                    value={form.time_end || ""} 
                                    onChange={set("time_end")} 
                                />
                            </fieldset>
                        </div>
                    </div>

                    {/* Seção de Configurações – visível apenas para organizadores */}
                    {isOrganizer && (
                        <div className="bg-[#13111e] border border-white/[0.07] rounded-xl flex-1">
                            <div className="flex p-4 items-center gap-2 border-b border-white/[0.06]">
                                <Cog size={20} className="text-purple-400" />
                                <h3 className="font-extrabold text-white">Configurações</h3>
                            </div>

                            <div className="p-4 border-b border-white/[0.06]">
                                <p className="text-xs font-bold text-[#6b6888] uppercase tracking-widest mb-3">Visibilidade</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        type="button" 
                                        onClick={() => togglePublic(true)}
                                        className={`flex flex-col items-start gap-1 px-4 py-3 rounded-lg border text-left transition-all text-sm font-bold cursor-pointer
                                            ${form.isPublic === true ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "border-white/[0.06] text-[#6b6888] hover:border-purple-500/30"}`}
                                    >
                                        <div className="flex items-center gap-1.5"><Globe size={12} /> Público</div>
                                        <span className="text-xs font-normal opacity-60">Visível para todos</span>
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => togglePublic(false)}
                                        className={`flex flex-col items-start gap-1 px-4 py-3 rounded-lg border text-left transition-all text-sm font-bold cursor-pointer
                                            ${form.isPublic === false ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "border-white/[0.06] text-[#6b6888] hover:border-purple-500/30"}`}
                                    >
                                        <div className="flex items-center gap-1.5"><Lock size={12} /> Privado</div>
                                        <span className="text-xs font-normal opacity-60">Somente convidados</span>
                                    </button>
                                </div>
                            </div>

                            <div className="p-4">
                                <p className="text-xs font-bold text-[#6b6888] uppercase tracking-widest mb-3">Zona de risco</p>
                                <button 
                                    type="button" 
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {deleting ? (
                                        <>
                                            <div className="w-4 h-4 rounded-full border-2 border-red-400/30 border-t-red-400 animate-spin" />
                                            Cancelando...
                                        </>
                                    ) : (
                                        <>
                                            <AlertTriangle size={13} />
                                            Cancelar evento
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {error && (
                        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                            <AlertTriangle size={13} className="inline mr-2" />
                            {error}
                        </p>
                    )}
                    {success && (
                        <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3">
                             Evento atualizado com sucesso!
                        </p>
                    )}

                    <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-purple-600 to-purple-700 hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer">
                        {saving ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Save size={14} />}
                        {saving ? "Salvando..." : "Salvar alterações"}
                    </button>
                </div>
            </form>
        </section>
    );
}
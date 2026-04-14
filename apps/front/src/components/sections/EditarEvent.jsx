// EditarEvent.jsx
// EditarEvent.jsx
import { useState, useEffect } from "react";
import { CalendarDays, ClipboardList, Cog, Globe, Lock, AlertTriangle, Save } from "lucide-react";

// NÃO PRECISA MAIS DE API_URL!
// const API = `${import.meta.env.VITE_API_URL ?? "http://localhost:5001"}`;

export default function EditarEvent({ eventId, onEventUpdated }) {
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    function formatDateForInput(isoString) {
        if (!isoString) return "";
        return new Date(isoString).toISOString().split("T")[0];
    }

    function formatTimeForInput(isoString) {
        if (!isoString) return "";
        const d = new Date(isoString);
        return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
    }

    const fetchEventData = async () => {
        try {
            setLoading(true);
            setError("");

            // ✅ AGORA USA O PROXY (igual ao login)
            const res = await fetch(`/api/events/${eventId}`, {
                method: "GET",
                credentials: "include",  // Importante para enviar o cookie
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Erro ao carregar evento");
            }

            const response = await res.json();
            const ev = response.data?.event || response.event || response.data;
            if (!ev) throw new Error("Dados do evento não encontrados");

            setForm({
                title: ev.title || "",
                description: ev.description || "",
                location: ev.location || "",
                date: formatDateForInput(ev.date),
                time: formatTimeForInput(ev.date),
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

        const payload = {
            title: form.title,
            description: form.description,
            location: form.location,
            date: `${form.date}T${form.time}:00`,
            isPublic: Boolean(form.isPublic),
        };

        try {
            // ✅ AGORA USA O PROXY (igual ao login)
            const res = await fetch(`/api/events/${eventId}`, {
                method: "PATCH",  // ou "PUT" dependendo do que seu backend aceita
                headers: { "Content-Type": "application/json" },
                credentials: "include",  // Importante para enviar o cookie
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

    // ... resto do JSX permanece IGUAL


    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span className="text-sm text-muted-foreground">Carregando evento...</span>
            </div>
        );
    }

    if (error && !form) {
        return (
            <div className="bg-red-400/10 border border-red-400/20 rounded-md p-6 text-center">
                <AlertTriangle className="mx-auto mb-3 text-red-400" size={24} />
                <p className="text-sm text-red-400 mb-4">{error}</p>
                <button onClick={fetchEventData} className="px-4 py-2 bg-primary rounded-md text-white text-sm hover:opacity-90 transition-opacity">
                    Tentar novamente
                </button>
            </div>
        );
    }

    if (!form) return null;

    return (
        <section>
            <form onSubmit={handleSubmit} className="flex gap-6">

                {/* ── ESQUERDA ── */}
                <div className="w-1/2 bg-sidebar border border-border rounded-md">
                    <div className="flex p-4 items-center gap-2 border-b border-border">
                        <ClipboardList size={20} className="text-primary" />
                        <h3 className="font-extrabold">Informações principais</h3>
                    </div>

                    <fieldset className="flex flex-col gap-1 p-4">
                        <label className="text-sm font-bold">Nome do evento</label>
                        <input type="text" className="p-3 border rounded-md text-sm border-border bg-transparent outline-none focus:border-primary transition-colors" value={form.title} onChange={set("title")} required />
                    </fieldset>

                    <fieldset className="flex flex-col gap-1 p-4">
                        <label className="text-sm font-bold">Descrição</label>
                        <textarea className="p-3 resize-none h-40 border rounded-md text-sm border-border bg-transparent outline-none focus:border-primary transition-colors leading-relaxed" value={form.description} onChange={set("description")} />
                    </fieldset>

                    <fieldset className="flex flex-col gap-1 p-4">
                        <label className="text-sm font-bold">Local</label>
                        <input type="text" className="p-3 border rounded-md text-sm border-border bg-transparent outline-none focus:border-primary transition-colors" value={form.location} onChange={set("location")} />
                    </fieldset>
                </div>

                {/* ── DIREITA ── */}
                <div className="w-1/2 flex flex-col gap-4">

                    <div className="bg-sidebar border border-border rounded-md">
                        <div className="flex p-4 items-center gap-2 border-b border-border">
                            <CalendarDays size={20} className="text-primary" />
                            <h3 className="font-extrabold">Data & Horário</h3>
                        </div>
                        <div className="flex">
                            <fieldset className="flex flex-col gap-1 p-4 w-1/2">
                                <label className="text-sm font-bold">Data de início</label>
                                <input type="date" className="p-3 border rounded-md text-sm border-border bg-transparent outline-none focus:border-primary transition-colors" value={form.date} onChange={set("date")} required />
                            </fieldset>
                            <fieldset className="flex flex-col gap-1 p-4 w-1/2">
                                <label className="text-sm font-bold">Horário</label>
                                <input type="time" className="p-3 border rounded-md text-sm border-border bg-transparent outline-none focus:border-primary transition-colors" value={form.time} onChange={set("time")} />
                            </fieldset>
                        </div>
                    </div>

                    <div className="bg-sidebar border border-border rounded-md flex-1">
                        <div className="flex p-4 items-center gap-2 border-b border-border">
                            <Cog size={20} className="text-primary" />
                            <h3 className="font-extrabold">Configurações</h3>
                        </div>

                        <div className="p-4 border-b border-border">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Visibilidade</p>
                            <div className="grid grid-cols-2 gap-2">
                                <button type="button" onClick={() => togglePublic(true)}
                                    className={`flex flex-col items-start gap-1 px-4 py-3 rounded-lg border text-left transition-all text-sm font-bold cursor-pointer
                                        ${form.isPublic === true ? "bg-emerald-400/10 border-emerald-400/25 text-emerald-400" : "border-border text-muted-foreground hover:border-primary/30"}`}>
                                    <div className="flex items-center gap-1.5"><Globe size={12} /> Público</div>
                                    <span className="text-xs font-normal opacity-60">Visível para todos</span>
                                </button>
                                <button type="button" onClick={() => togglePublic(false)}
                                    className={`flex flex-col items-start gap-1 px-4 py-3 rounded-lg border text-left transition-all text-sm font-bold cursor-pointer
                                        ${form.isPublic === false ? "bg-amber-400/10 border-amber-400/25 text-amber-400" : "border-border text-muted-foreground hover:border-primary/30"}`}>
                                    <div className="flex items-center gap-1.5"><Lock size={12} /> Privado</div>
                                    <span className="text-xs font-normal opacity-60">Somente convidados</span>
                                </button>
                            </div>
                        </div>

                        <div className="p-4">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Zona de risco</p>
                            <button type="button" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold text-red-400 bg-red-400/10 border border-red-400/20 hover:bg-red-400/20 transition-colors cursor-pointer">
                                <AlertTriangle size={13} /> Cancelar evento
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-md px-4 py-3">⚠ {error}</p>
                    )}
                    {success && (
                        <p className="text-sm text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-md px-4 py-3">✓ Evento atualizado com sucesso!</p>
                    )}

                    <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 py-3 rounded-md text-sm font-bold text-white bg-primary hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer">
                        {saving ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Save size={14} />}
                        {saving ? "Salvando..." : "Salvar alterações"}
                    </button>
                </div>
            </form>
        </section>
    );
}
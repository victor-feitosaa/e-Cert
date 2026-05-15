import { useState } from "react";
import {
  Calendar, Clock, MapPin, Users, Award, Ticket,
  CheckCircle, Loader2, Share2, ExternalLink,
  Building2, Mic2, UserCheck, ArrowRight, Globe,
  Lock, Tag,
} from "lucide-react";

export default function PublicEvent({ eventData, eventId }) {
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const event = eventData;
  const subEvents = event.subEvents || [];
  const hasSubEvents = subEvents.length > 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "long", year: "numeric",
    });
  };

  const formatShortDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      weekday: "short", day: "2-digit", month: "short",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const h = d.getHours().toString().padStart(2, "0");
    const m = d.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (formErrors[name]) setFormErrors((p) => ({ ...p, [name]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Nome é obrigatório";
    if (!formData.email.trim()) errors.email = "E-mail é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "E-mail inválido";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/participants/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao realizar inscrição");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startDate = event.date_start || event.date;
  const isOnline = event.location?.toLowerCase().includes("online");

  /* ── Success ── */
  if (submitted) {
    return (
      <div className="dark">
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6 font-['Nunito',sans-serif]">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={30} className="text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Inscrição confirmada!</h2>
            <p className="text-[#6b6888] text-sm leading-relaxed mb-1">
              Você está inscrito em <strong className="text-white">{event.title}</strong>.
            </p>
            <p className="text-[#3d3860] text-xs mb-8">
              Confirmação enviada para <strong className="text-[#6b6888]">{formData.email}</strong>
            </p>
            <div className="flex items-center gap-2 justify-center p-3 rounded-xl bg-[#13111e] border border-violet-500/10 text-sm text-[#6b6888]">
              <Award size={14} className="text-violet-400 shrink-0" />
              Certificado emitido automaticamente após o evento
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dark">
      <div className="min-h-screen dark bg-[#000000] font-['Nunito',sans-serif] text-white">

        {/* ── NAV ── */}
        <nav className="sticky top-0 z-50 h-12 flex items-center justify-between px-6 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center">
              <Award size={11} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-black tracking-tight">
              e-<span className="text-violet-400">cert</span>
            </span>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-[#6b6888] hover:text-white border border-white/[0.08] hover:border-white/20 px-3 py-1.5 rounded-full transition-all"
          >
            {copied
              ? <><CheckCircle size={11} className="text-emerald-400" /> Copiado</>
              : <><Share2 size={11} /> Compartilhar</>}
          </button>
        </nav>

        <div className="max-w-3xl dark mx-auto px-4 py-8 space-y-3">

          {/* ── LINHA 1: título + data/local ── */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-3">

            {/* Título principal */}
            <div className="bg-[#13111e] border border-white/[0.07] rounded-2xl p-6">
              {event.category && (
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-violet-500/10 border border-violet-500/15 text-violet-400 text-[11px] font-bold mb-4 uppercase tracking-wide">
                  <Tag size={9} /> {event.category}
                </div>
              )}
              <h1 className="text-[24px] md:text-[28px] font-black leading-tight tracking-tight text-white mb-3">
                {event.title}
              </h1>
              {event.description && (
                <p className="text-[#6b6888] text-[13.5px] leading-relaxed line-clamp-3">
                  {event.description}
                </p>
              )}
              {event.creator?.name && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.06]">
                  <div className="w-6 h-6 rounded-full bg-violet-600/20 flex items-center justify-center text-[10px] font-black text-violet-400">
                    {event.creator.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[12px] text-[#6b6888]">
                    por <strong className="text-white/60">{event.creator.name}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Data + Local empilhados */}
            <div className="flex flex-col gap-3">
              <div className="bg-[#13111e] border border-white/[0.07] rounded-2xl p-5 flex-1">
                <p className="text-[10px] font-bold text-[#3d3860] uppercase tracking-widest mb-3">Data</p>
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-600/10 border border-violet-500/15 flex items-center justify-center shrink-0">
                    <Calendar size={14} className="text-violet-400" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-white leading-snug">
                      {formatDate(startDate)}
                    </p>
                    {formatTime(startDate) && (
                      <p className="text-[12px] text-[#6b6888] mt-0.5 flex items-center gap-1">
                        <Clock size={10} /> {formatTime(startDate)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {event.location && (
                <div className="bg-[#13111e] border border-white/[0.07] rounded-2xl p-5 flex-1">
                  <p className="text-[10px] font-bold text-[#3d3860] uppercase tracking-widest mb-3">Local</p>
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-violet-600/10 border border-violet-500/15 flex items-center justify-center shrink-0">
                      {isOnline
                        ? <Globe size={14} className="text-violet-400" />
                        : <MapPin size={14} className="text-violet-400" />}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-white leading-snug">{event.location}</p>
                      {event.locationUrl && (
                        <a
                          href={event.locationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11.5px] text-violet-400 hover:text-violet-300 flex items-center gap-1 mt-1 transition-colors"
                        >
                          Ver mapa <ExternalLink size={9} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── LINHA 2: formulário + stats ── */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-3">

            {/* Formulário */}
            <div className="bg-[#13111e] border border-violet-500/20 rounded-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
                    <Ticket size={14} className="text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-[14.5px] font-black text-white tracking-tight">Inscreva-se</h2>
                    <p className="text-[11.5px] text-[#3d3860]">Gratuito · Certificado automático</p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/8 border border-red-500/15">
                    <p className="text-sm text-red-400 font-medium">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                  <FieldInput
                    label="Nome completo"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Seu nome"
                    error={formErrors.name}
                  />
                  <FieldInput
                    label="E-mail"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="seu@email.com"
                    error={formErrors.email}
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-[0.99] text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                  >
                    {submitting
                      ? <><Loader2 size={14} className="animate-spin" /> Processando...</>
                      : <><span>Confirmar inscrição</span><ArrowRight size={14} /></>}
                  </button>
                </form>
              </div>
              <div className="px-6 py-3 border-t border-white/[0.05] flex items-center gap-1.5">
                <Lock size={10} className="text-[#3d3860] shrink-0" />
                <p className="text-[11px] text-[#3d3860]">Seus dados estão seguros e não serão compartilhados</p>
              </div>
            </div>

            {/* Stats empilhados */}
            <div className="flex flex-col gap-3">
              {event.capacity && (
                <div className="bg-[#13111e] border border-white/[0.07] rounded-2xl p-5">
                  <p className="text-[10px] font-bold text-[#3d3860] uppercase tracking-widest mb-1">Vagas</p>
                  <p className="text-[34px] font-black text-white leading-none tracking-tight">
                    {event.capacity.toLocaleString("pt-BR")}
                  </p>
                  <p className="text-[11.5px] text-[#6b6888] mt-1">disponíveis</p>
                </div>
              )}

              <div className="bg-[#13111e] border border-white/[0.07] rounded-2xl p-5 flex-1">
                <p className="text-[10px] font-bold text-[#3d3860] uppercase tracking-widest mb-3">Certificado</p>
                <div className="w-8 h-8 rounded-xl bg-violet-600/10 border border-violet-500/15 flex items-center justify-center mb-3">
                  <Award size={14} className="text-violet-400" />
                </div>
                <p className="text-[12.5px] text-[#6b6888] leading-relaxed">
                  Emitido automaticamente com link verificável
                </p>
              </div>
            </div>
          </div>

          {/* ── SUBEVENTOS ── */}
          {hasSubEvents && (
            <div className="bg-[#13111e] border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-violet-600/10 border border-violet-500/15 flex items-center justify-center">
                    <Calendar size={12} className="text-violet-400" />
                  </div>
                  <h2 className="text-[14.5px] font-black text-white tracking-tight">Programação</h2>
                </div>
                <span className="text-[11px] font-bold text-[#3d3860] bg-white/[0.04] border border-white/[0.05] px-2.5 py-1 rounded-lg">
                  {subEvents.length} {subEvents.length === 1 ? "atividade" : "atividades"}
                </span>
              </div>

              <div className="divide-y divide-white/[0.04]">
                {subEvents.map((sub) => {
                  const RoleIcon =
                    sub.type === "palestra" ? Mic2
                    : sub.type === "workshop" ? UserCheck
                    : Calendar;
                  const time = formatTime(sub.date_start);
                  const date = sub.date_start ? formatShortDate(sub.date_start) : null;

                  return (
                    <div key={sub.id} className="px-6 py-4 flex items-start gap-4 hover:bg-white/[0.015] transition-colors">
                      <div className="w-8 h-8 rounded-xl bg-[#1a1629] border border-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                        <RoleIcon size={13} className="text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13.5px] font-bold text-white leading-snug">{sub.title}</p>
                        {sub.description && (
                          <p className="text-[12px] text-[#6b6888] mt-1 leading-relaxed line-clamp-2">
                            {sub.description}
                          </p>
                        )}
                        <div className="flex items-center flex-wrap gap-3 mt-2">
                          {date && (
                            <span className="flex items-center gap-1 text-[11px] text-[#6b6888]">
                              <Calendar size={9} /> {date}
                            </span>
                          )}
                          {time && (
                            <span className="flex items-center gap-1 text-[11px] text-violet-400 font-semibold">
                              <Clock size={9} /> {time}
                            </span>
                          )}
                          {sub.location && (
                            <span className="flex items-center gap-1 text-[11px] text-[#6b6888]">
                              <MapPin size={9} /> {sub.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── FOOTER ── */}
          <div className="flex items-center justify-center gap-1.5 pt-2 pb-4">
            <span className="text-[11px] text-[#2e2c42]">Powered by</span>
            <div className="flex items-center gap-1">
              <div className="w-3.5 h-3.5 rounded bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center">
                <Award size={7} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[11px] font-black text-[#3d3860]">e-cert</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function FieldInput({ label, name, type, value, onChange, placeholder, error }) {
  return (
    <div>
      <label className="block text-[12px] font-bold text-[#6b6888] mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3.5 py-2.5 rounded-xl bg-[#0f0d1a] border text-[13.5px] font-medium text-white placeholder-[#2e2c42] outline-none transition-all ${
          error
            ? "border-red-500/30 focus:border-red-500/50"
            : "border-white/[0.08] focus:border-violet-500/40 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)]"
        }`}
      />
      {error && <p className="text-[11px] text-red-400 mt-1 font-medium">{error}</p>}
    </div>
  );
}
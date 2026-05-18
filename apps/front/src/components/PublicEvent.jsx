import { useState, useEffect } from "react";
import {
  Calendar, Clock, MapPin, Users, Award, Ticket,
  CheckCircle, Loader2, Share2, ExternalLink,
  Building2, Mic2, UserCheck, ArrowRight, Globe,
  Lock, Tag, LogIn, UserPlus, Plus,
  ArrowLeft, Home,
} from "lucide-react";

export default function PublicEvent({ eventData, eventId, user = null, isEnrolled: initialEnrolled = false }) {
  const [enrolled, setEnrolled] = useState(initialEnrolled);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subEnrolled, setSubEnrolled] = useState({});
  const [subEnrolling, setSubEnrolling] = useState({});
  const [subErrors, setSubErrors] = useState({});
  const [copied, setCopied] = useState(false);

  const event = eventData;
  const subEvents = event?.subEvents || [];
  const hasSubEvents = subEvents.length > 0;

  // Buscar status de inscrição dos subeventos
  const fetchSubeventStatus = async () => {
    if (!user || !eventId || subEvents.length === 0) return;
    
    setLoading(true);
    try {
      const promises = subEvents.map(async (sub) => {
        try {
          const res = await fetch(`/api/events/${eventId}/subevents/${sub.id}/check-enrollment`, {
            credentials: "include",
          });
          if (res.ok) {
            const data = await res.json();
            return { id: sub.id, enrolled: data.enrolled };
          }
          return { id: sub.id, enrolled: false };
        } catch {
          return { id: sub.id, enrolled: false };
        }
      });
      
      const results = await Promise.all(promises);
      const enrollmentMap = {};
      results.forEach(({ id, enrolled }) => {
        enrollmentMap[id] = enrolled;
      });
      setSubEnrolled(enrollmentMap);
    } catch (err) {
      console.error("Erro ao buscar status dos subeventos:", err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar status quando usuário estiver logado e evento carregado
  useEffect(() => {
    if (user && eventId) {
      fetchSubeventStatus();
    }
  }, [user, eventId, subEvents.length]);

  /* ── formatters ── */
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

  /* ── compartilhar ── */
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── inscrição no evento principal ── */
  const handleEnroll = async () => {
    setEnrolling(true);
    setEnrollError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/participants/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Erro ao realizar inscrição");
      }
      setEnrolled(true);
      await fetchSubeventStatus();
    } catch (err) {
      setEnrollError(err.message);
    } finally {
      setEnrolling(false);
    }
  };

  /* ── inscrição em subevento ── */
  const handleSubEnroll = async (subEventId) => {
    setSubEnrolling((s) => ({ ...s, [subEventId]: true }));
    setSubErrors((s) => ({ ...s, [subEventId]: null }));
    try {
      const res = await fetch(`/api/events/${eventId}/subevents/${subEventId}/participants/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Erro ao se inscrever");
      }
      setSubEnrolled((s) => ({ ...s, [subEventId]: true }));
    } catch (err) {
      setSubErrors((s) => ({ ...s, [subEventId]: err.message }));
    } finally {
      setSubEnrolling((s) => ({ ...s, [subEventId]: false }));
    }
  };

  /* ── redirect para login/registro ── */
  const goToAuth = (mode = "register") => {
    const redirect = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/login?redirect=${redirect}&mode=${mode}`;
  };

  const startDate = event?.date_start || event?.date;
  const isOnline = event?.location?.toLowerCase().includes("online");

  /* ── painel lateral direito ── */
  const renderActionPanel = () => {
    if (!user) {
      return (
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
            <p className="text-[13px] text-[#6b6888] leading-relaxed mb-5">
              Crie sua conta para se inscrever neste evento e receber seu certificado automaticamente.
            </p>
            <button
              onClick={() => goToAuth("register")}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-[0.99] text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-all mb-3"
            >
              <UserPlus size={14} /> Criar conta e se inscrever
            </button>
            <button
              onClick={() => goToAuth("login")}
              className="w-full py-2.5 rounded-xl bg-transparent border border-white/[0.08] hover:border-white/20 text-[#6b6888] hover:text-white font-semibold text-[13px] flex items-center justify-center gap-2 transition-all"
            >
              <LogIn size={13} /> Já tenho conta
            </button>
          </div>
          <div className="px-6 py-3 border-t border-white/[0.05] flex items-center gap-1.5">
            <Lock size={10} className="text-[#3d3860] shrink-0" />
            <p className="text-[11px] text-[#3d3860]">Seus dados estão seguros</p>
          </div>
        </div>
      );
    }

    if (enrolled) {
      return (
        <div className="bg-[#13111e] border border-emerald-500/20 rounded-2xl overflow-hidden">
          <div className="p-6">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
              <CheckCircle size={18} className="text-emerald-400" />
            </div>
            <h2 className="text-[15px] font-black text-white tracking-tight mb-1">Você está inscrito!</h2>
            <p className="text-[12px] text-[#6b6888] leading-relaxed mb-4">
              Olá, <strong className="text-white/60">{user.name}</strong>. Sua inscrição está confirmada.
            </p>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#0f0d1a] border border-white/[0.05] text-[12px] text-[#6b6888]">
              <Award size={13} className="text-violet-400 shrink-0" />
              Certificado emitido automaticamente após o evento
            </div>
          </div>
        </div>
      );
    }

    return (
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

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0f0d1a] border border-white/[0.05] mb-5">
            <div className="w-6 h-6 rounded-full bg-violet-600/20 flex items-center justify-center text-[10px] font-black text-violet-400 shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-[#3d3860] truncate">{user.email}</p>
            </div>
          </div>

          {enrollError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/8 border border-red-500/15">
              <p className="text-[12px] text-red-400 font-medium">{enrollError}</p>
            </div>
          )}

          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-[0.99] text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enrolling
              ? <><Loader2 size={14} className="animate-spin" /> Processando...</>
              : <><span>Confirmar inscrição</span><ArrowRight size={14} /></>}
          </button>
        </div>
        <div className="px-6 py-3 border-t border-white/[0.05] flex items-center gap-1.5">
          <Lock size={10} className="text-[#3d3860] shrink-0" />
          <p className="text-[11px] text-[#3d3860]">Seus dados estão seguros</p>
        </div>
      </div>
    );
  };

  if (!event) {
    return (
      <div className="dark min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-violet-400 mx-auto mb-4" />
          <p className="text-white">Carregando evento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dark">
      <div className="min-h-screen dark bg-[#000000] font-['Nunito',sans-serif] text-white">
        {/* ── NAV CENTRALIZADA ── */}
        <nav className="sticky top-0 z-50 h-14 flex items-center justify-between px-6 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/[0.06]">
          {/* Esquerda - Logo */}
          <div className="flex items-center gap-2 w-32">
            <span className="text-[15px] font-black tracking-tight">
              e-<span className="text-violet-400">cert</span>
            </span>
          </div>

          {/* Centro - Compartilhar */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-[#6b6888] hover:text-white border border-white/[0.08] hover:border-white/20 px-3 py-1.5 rounded-full transition-all"
            >
              {copied
                ? <><CheckCircle size={11} className="text-emerald-400" /> Copiado</>
                : <><Share2 size={11} /> Compartilhar</>}
            </button>
          </div>

          {/* Direita - Dashboard/Login */}
          <div className="flex items-center justify-end gap-2 w-32">
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.location.href = "/userDashboard"}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-[#6b6888] hover:text-white border border-white/[0.08] hover:border-white/20 rounded-full transition-all"
                >
                  <Home size={12} />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>
                <div className="w-7 h-7 rounded-full bg-violet-600/20 flex items-center justify-center text-[11px] font-black text-violet-400">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              </div>
            ) : (
              <button
                onClick={() => goToAuth("login")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-[#6b6888] hover:text-white border border-white/[0.08] hover:border-white/20 rounded-full transition-all"
              >
                <LogIn size={11} /> Entrar
              </button>
            )}
          </div>
        </nav>

        <div className="max-w-3xl mx-auto px-4 py-8 space-y-3">
          {/* LINHA 1: título + data/local */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-3">
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
                      {isOnline ? <Globe size={14} className="text-violet-400" /> : <MapPin size={14} className="text-violet-400" />}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-white leading-snug">{event.location}</p>
                      {event.locationUrl && (
                        <a href={event.locationUrl} target="_blank" rel="noopener noreferrer" className="text-[11.5px] text-violet-400 hover:text-violet-300 flex items-center gap-1 mt-1 transition-colors">
                          Ver mapa <ExternalLink size={9} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* LINHA 2: painel de ação + stats */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-3">
            {renderActionPanel()}
            <div className="flex flex-col gap-3">
              {event.capacity && (
                <div className="bg-[#13111e] border border-white/[0.07] rounded-2xl p-5">
                  <p className="text-[10px] font-bold text-[#3d3860] uppercase tracking-widest mb-1">Vagas</p>
                  <p className="text-[34px] font-black text-white leading-none tracking-tight">{event.capacity.toLocaleString("pt-BR")}</p>
                  <p className="text-[11.5px] text-[#6b6888] mt-1">disponíveis</p>
                </div>
              )}
              <div className="bg-[#13111e] border border-white/[0.07] rounded-2xl p-5 flex-1">
                <p className="text-[10px] font-bold text-[#3d3860] uppercase tracking-widest mb-3">Certificado</p>
                <div className="w-8 h-8 rounded-xl bg-violet-600/10 border border-violet-500/15 flex items-center justify-center mb-3">
                  <Award size={14} className="text-violet-400" />
                </div>
                <p className="text-[12.5px] text-[#6b6888] leading-relaxed">Emitido automaticamente com link verificável</p>
              </div>
            </div>
          </div>

          {/* SUBEVENTOS */}
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

              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-violet-400" />
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {subEvents.map((sub) => {
                    const RoleIcon = sub.type === "palestra" ? Mic2 : sub.type === "workshop" ? UserCheck : Calendar;
                    const time = formatTime(sub.date_start);
                    const date = sub.date_start ? formatShortDate(sub.date_start) : null;
                    const isSubEnrolled = subEnrolled[sub.id];
                    const isSubEnrolling = subEnrolling[sub.id];
                    const subError = subErrors[sub.id];

                    return (
                      <div key={sub.id} className="px-6 py-4 flex items-start gap-4 hover:bg-white/[0.015] transition-colors">
                        <div className="w-8 h-8 rounded-xl bg-[#1a1629] border border-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                          <RoleIcon size={13} className="text-violet-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13.5px] font-bold text-white leading-snug">{sub.title}</p>
                          {sub.description && (
                            <p className="text-[12px] text-[#6b6888] mt-1 leading-relaxed line-clamp-2">{sub.description}</p>
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
                          {subError && <p className="text-[11px] text-red-400 font-medium mt-1">{subError}</p>}
                        </div>

                        <div className="shrink-0 mt-0.5">
                          {!enrolled && !initialEnrolled ? (
                            <span className="text-[11px] text-[#3d3860] italic">Inscreva-se no evento</span>
                          ) : isSubEnrolled ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                              <CheckCircle size={11} /> Inscrito
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSubEnroll(sub.id)}
                              disabled={isSubEnrolling}
                              className="flex items-center gap-1.5 text-[12px] font-bold text-violet-400 hover:text-violet-300 border border-violet-500/20 hover:border-violet-500/40 bg-violet-500/5 hover:bg-violet-500/10 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isSubEnrolling ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
                              {isSubEnrolling ? "..." : "Participar"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!enrolled && !initialEnrolled && user && (
                <div className="px-6 py-3 border-t border-white/[0.05] flex items-center gap-2 bg-[#0f0d1a]">
                  <Lock size={11} className="text-[#3d3860] shrink-0" />
                  <p className="text-[11.5px] text-[#3d3860]">Inscreva-se no evento principal para participar das atividades</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
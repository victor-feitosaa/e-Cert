import { useState, useEffect } from "react";
import {
  Calendar, Clock, MapPin, Users, Award, Ticket,
  CheckCircle, Loader2, Share2, ExternalLink,
  Building2, Mic2, UserCheck, ArrowRight, Globe,
  Lock, Tag, LogIn, UserPlus, Plus,
  ArrowLeft, Home, ChevronDown, ChevronUp, XCircle
} from "lucide-react";
import Particles from "./Particles";
import UserMenu from "./UserMenu";

export default function PublicEvent({ eventData, eventId, user = null, isEnrolled: initialEnrolled = false }) {
  const [enrolled, setEnrolled] = useState(initialEnrolled);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sectionsData, setSectionsData] = useState({});
  const [expandedSubEvents, setExpandedSubEvents] = useState({});
  const [sectionEnrolling, setSectionEnrolling] = useState({});
  const [sectionLeaving, setSectionLeaving] = useState({});
  const [sectionErrors, setSectionErrors] = useState({});
  const [copied, setCopied] = useState(false);

  const event = eventData;
  const subEvents = event?.subEvents || [];
  const hasSubEvents = subEvents.length > 0;

  // Buscar seções de um subevento específico
  const fetchSections = async (subEventId) => {
    // Usuário não logado pode ver as seções mas não se inscrever
    try {
      const res = await fetch(`/api/events/${eventId}/subevents/${subEventId}/sections`, {
        credentials: user ? "include" : "omit",
      });
      if (res.ok) {
        const data = await res.json();
        setSectionsData(prev => ({
          ...prev,
          [subEventId]: data.data?.sections || []
        }));
      }
    } catch (err) {
      console.error("Erro ao buscar seções:", err);
    }
  };

  // Carregar seções quando o usuário estiver logado ou não
  useEffect(() => {
    if (eventId && subEvents.length > 0) {
      subEvents.forEach(sub => {
        fetchSections(sub.id);
      });
    }
  }, [user, eventId, subEvents]);

  // Toggle expansão do subevento
  const toggleSubEvent = (subEventId) => {
    setExpandedSubEvents(prev => ({
      ...prev,
      [subEventId]: !prev[subEventId]
    }));
  };

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
    if (!user) {
      goToAuth("register");
      return;
    }
    
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
      // Recarregar seções após inscrever no evento
      subEvents.forEach(sub => {
        fetchSections(sub.id);
      });
    } catch (err) {
      setEnrollError(err.message);
    } finally {
      setEnrolling(false);
    }
  };

  /* ── inscrição em seção ── */
  const handleSectionEnroll = async (sectionId, subEventId) => {
    if (!user) {
      goToAuth("register");
      return;
    }
    
    setSectionEnrolling((s) => ({ ...s, [sectionId]: true }));
    setSectionErrors((s) => ({ ...s, [sectionId]: null }));
    try {
      const res = await fetch(`/api/events/${eventId}/subevents/${subEventId}/sections/${sectionId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Erro ao se inscrever na sessão");
      }
      await fetchSections(subEventId);
    } catch (err) {
      setSectionErrors((s) => ({ ...s, [sectionId]: err.message }));
    } finally {
      setSectionEnrolling((s) => ({ ...s, [sectionId]: false }));
    }
  };

  /* ── cancelar inscrição em seção ── */
  const handleSectionLeave = async (sectionId, subEventId) => {
    if (!user) return;
    
    setSectionLeaving((s) => ({ ...s, [sectionId]: true }));
    setSectionErrors((s) => ({ ...s, [sectionId]: null }));
    try {
      const res = await fetch(`/api/events/${eventId}/subevents/${subEventId}/sections/${sectionId}/leave`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Erro ao cancelar inscrição");
      }
      await fetchSections(subEventId);
    } catch (err) {
      setSectionErrors((s) => ({ ...s, [sectionId]: err.message }));
    } finally {
      setSectionLeaving((s) => ({ ...s, [sectionId]: false }));
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
    <div className="dark relative min-h-screen bg-[#000000] font-['Nunito',sans-serif] text-white">
      {/* Fundo com partículas */}
      <div className="fixed inset-0 w-full h-full z-0">
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

      {/* NAV CENTRALIZADA */}
      <nav className="sticky top-0 z-50 h-14 flex items-center justify-between px-6 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/[0.06]">
  <div className="flex items-center gap-2 w-32">
    <span className="text-[15px] font-black tracking-tight">
      e-<span className="text-violet-400">cert</span>
    </span>
  </div>

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

  <div className="flex items-center justify-end gap-2 w-32">
    {user ? (
      <UserMenu user={user} />
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

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 space-y-3">
        {/* LINHA 1: título + data/local */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3">
          <div className="bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-6">
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
            <div className="bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-5 flex-1">
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
              <div className="bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-5 flex-1">
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
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3">
          {renderActionPanel()}
          <div className="flex flex-col gap-3">
            {event.capacity && (
              <div className="bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-5">
                <p className="text-[10px] font-bold text-[#3d3860] uppercase tracking-widest mb-1">Vagas</p>
                <p className="text-[34px] font-black text-white leading-none tracking-tight">{event.capacity.toLocaleString("pt-BR")}</p>
                <p className="text-[11.5px] text-[#6b6888] mt-1">disponíveis</p>
              </div>
            )}
            <div className="bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-5 flex-1">
              <p className="text-[10px] font-bold text-[#3d3860] uppercase tracking-widest mb-3">Certificado</p>
              <div className="w-8 h-8 rounded-xl bg-violet-600/10 border border-violet-500/15 flex items-center justify-center mb-3">
                <Award size={14} className="text-violet-400" />
              </div>
              <p className="text-[12.5px] text-[#6b6888] leading-relaxed">Emitido automaticamente com link verificável</p>
            </div>
          </div>
        </div>

        {/* SUBEVENTOS COM SEÇÕES */}
        {hasSubEvents && (
          <div className="bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl overflow-hidden">
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
                const sections = sectionsData[sub.id] || [];
                const isExpanded = expandedSubEvents[sub.id];
                const time = formatTime(sub.date_start);
                const date = sub.date_start ? formatShortDate(sub.date_start) : null;

                return (
                  <div key={sub.id} className="transition-all">
                    {/* Cabeçalho do Subevento */}
                    <div 
                      className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.015] transition-colors"
                      onClick={() => toggleSubEvent(sub.id)}
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-8 h-8 rounded-xl bg-[#1a1629] border border-white/[0.06] flex items-center justify-center shrink-0">
                          {sub.type === "palestra" ? <Mic2 size={13} className="text-violet-400" /> : 
                           sub.type === "workshop" ? <UserCheck size={13} className="text-violet-400" /> : 
                           <Calendar size={13} className="text-violet-400" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-[14px] font-bold text-white leading-snug">{sub.title}</p>
                          {sub.description && (
                            <p className="text-[12px] text-[#6b6888] mt-1 line-clamp-1">{sub.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1.5">
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
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 ml-4">
                        {isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                      </div>
                    </div>

                    {/* Seções do Subevento (expansível) */}
                    {isExpanded && (
                      <div className="bg-[#0f0d1a] border-t border-white/[0.04]">
                        {sections.length === 0 ? (
                          <div className="px-6 py-8 text-center">
                            <p className="text-[12px] text-[#3d3860]">Nenhuma sessão disponível para este subevento</p>
                          </div>
                        ) : (
                          sections.map((section) => {
                            const sectionDate = formatShortDate(section.date_start);
                            const sectionTime = formatTime(section.date_start);
                            const isEnrolled = section.isEnrolled;
                            const isFull = section.availableSpots === 0;
                            const isLoading = sectionEnrolling[section.id];
                            const isLeaving = sectionLeaving[section.id];
                            const error = sectionErrors[section.id];
                            const enrolledCount = section.enrolledCount || 0;
                            const capacity = section.capacity;

                            return (
                              <div key={section.id} className="px-6 py-4 ml-8 border-t border-white/[0.04] first:border-t-0 hover:bg-white/[0.005] transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="text-[13px] font-semibold text-white">
                                        {section.title || "Sessão"}
                                      </p>
                                      {capacity && (
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                          isFull ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                          enrolledCount >= capacity - 5 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                          "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                        }`}>
                                          {enrolledCount}/{capacity} vagas
                                        </span>
                                      )}
                                      {isFull && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                                          Esgotado
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                      {sectionDate && (
                                        <span className="flex items-center gap-1 text-[11px] text-[#6b6888]">
                                          <Calendar size={9} /> {sectionDate}
                                        </span>
                                      )}
                                      {sectionTime && (
                                        <span className="flex items-center gap-1 text-[11px] text-violet-400">
                                          <Clock size={9} /> {sectionTime}
                                        </span>
                                      )}
                                      {section.location && (
                                        <span className="flex items-center gap-1 text-[11px] text-[#6b6888]">
                                          <MapPin size={9} /> {section.location}
                                        </span>
                                      )}
                                    </div>
                                    {error && (
                                      <p className="text-[11px] text-red-400 font-medium mt-1">{error}</p>
                                    )}
                                  </div>

                                  <div className="shrink-0">
                                    {!enrolled && !initialEnrolled ? (
                                      <span className="text-[11px] text-[#3d3860] italic cursor-pointer hover:text-white" onClick={() => goToAuth("register")}>
                                        Faça login para se inscrever
                                      </span>
                                    ) : isEnrolled ? (
                                      <button
                                        onClick={() => handleSectionLeave(section.id, sub.id)}
                                        disabled={isLeaving}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                                      >
                                        {isLeaving ? (
                                          <Loader2 size={11} className="animate-spin" />
                                        ) : (
                                          <XCircle size={11} />
                                        )}
                                        Cancelar
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleSectionEnroll(section.id, sub.id)}
                                        disabled={isFull || isLoading}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-violet-600 hover:bg-violet-500 text-white"
                                      >
                                        {isLoading ? (
                                          <Loader2 size={11} className="animate-spin" />
                                        ) : (
                                          <UserPlus size={11} />
                                        )}
                                        {isFull ? "Lotado" : "Participar"}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!enrolled && !initialEnrolled && user && (
              <div className="px-6 py-3 border-t border-white/[0.05] flex items-center gap-2 bg-[#0f0d1a]">
                <Lock size={11} className="text-[#3d3860] shrink-0" />
                <p className="text-[11.5px] text-[#3d3860]">Inscreva-se no evento principal para participar das sessões</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
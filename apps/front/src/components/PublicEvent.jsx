import { useState, useEffect } from "react";
import {
  Calendar, Clock, MapPin, Users, Award, Ticket,
  CheckCircle, Loader2, Share2, ExternalLink,
  Mic2, UserCheck, ArrowRight, Globe,
  Lock, Tag, LogIn, UserPlus, Plus,
  ChevronDown, ChevronUp, XCircle, Home, Layers
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Particles from "./Particles";
import UserMenu from "./UserMenu";

export default function PublicEvent({ eventData, eventId, user = null, isEnrolled: initialEnrolled = false }) {
  const [enrolled, setEnrolled] = useState(initialEnrolled);
  const [enrolling, setEnrolling] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [enrollError, setEnrollError] = useState(null);
  const [participantCount, setParticipantCount] = useState(eventData?.participants || 0);
  const [capacity, setCapacity] = useState(eventData?.capacity || 0);
  const [sectionsData, setSectionsData] = useState({});
  const [expandedSubEvents, setExpandedSubEvents] = useState({});
  const [sectionEnrolling, setSectionEnrolling] = useState({});
  const [sectionLeaving, setSectionLeaving] = useState({});
  const [sectionErrors, setSectionErrors] = useState({});
  const [copied, setCopied] = useState(false);

  // QR Code states
  const [showQR, setShowQR] = useState(false);
  const [qrToken, setQrToken] = useState(null);
  const [generatingQR, setGeneratingQR] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [availableSections, setAvailableSections] = useState([]);

  const event = eventData;
  const subEvents = event?.subEvents || [];
  const hasSubEvents = subEvents.length > 0;
  const isFull = capacity > 0 && participantCount >= capacity;
  const availableSpots = capacity - participantCount;

  // Buscar contagem de participantes
  const fetchParticipantCount = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/participants/count`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setParticipantCount(data.count || 0);
      }
    } catch (err) {
      console.error("Erro ao buscar contagem de participantes:", err);
    }
  };

  // Buscar seções com status de inscrição
  const fetchSectionsWithStatus = async (subEventId) => {
    try {
      const endpoint = user 
        ? `/api/events/${eventId}/subevents/${subEventId}/sections`
        : `/api/events/${eventId}/subevents/${subEventId}/sections/public`;
      
      const res = await fetch(endpoint, {
        credentials: user ? "include" : "omit",
      });
      
      if (res.ok) {
        const data = await res.json();
        let sections = data.data?.sections || [];
        if (!user) {
          sections = sections.map(s => ({ ...s, isEnrolled: false }));
        }
        setSectionsData(prev => ({
          ...prev,
          [subEventId]: sections
        }));
      }
    } catch (err) {
      console.error("Erro ao buscar seções:", err);
    }
  };

  // Buscar seções em que o usuário está inscrito (para gerar QR por seção)
  const fetchUserEnrolledSections = async () => {
    if (!user || !enrolled) return;
    const allEnrolled = [];
    for (const sub of subEvents) {
      const res = await fetch(`/api/events/${eventId}/subevents/${sub.id}/sections`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        const sections = data.data?.sections || [];
        const enrolledInSub = sections.filter(s => s.isEnrolled === true);
        enrolledInSub.forEach(s => {
          allEnrolled.push({
            ...s,
            subEventTitle: sub.title,
          });
        });
      }
    }
    setAvailableSections(allEnrolled);
  };

  // Gerar token de check-in (com ou sem sectionId)
  const fetchCheckinToken = async (sectionId = null) => {
    if (!user || !eventId) return;
    setGeneratingQR(true);
    try {
      let url = `/api/events/${eventId}/checkin-token`;
      if (sectionId) url += `?sectionId=${sectionId}`;
      const res = await fetch(url, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setQrToken(data.token);
        setShowQR(true);
        setShowQRModal(false);
      } else {
        console.error("Erro ao gerar token de check-in");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingQR(false);
    }
  };

  // Carregar contagem e seções
  useEffect(() => {
    if (eventId) fetchParticipantCount();
    if (subEvents.length > 0) {
      subEvents.forEach(sub => fetchSectionsWithStatus(sub.id));
    }
  }, [eventId, user]);

  // Quando inscrito, buscar seções para gerar QR
  useEffect(() => {
    if (enrolled && user) {
      fetchUserEnrolledSections();
    }
  }, [enrolled, user, subEvents]);

  // Toggle expansão do subevento
  const toggleSubEvent = (subEventId) => {
    setExpandedSubEvents(prev => ({ ...prev, [subEventId]: !prev[subEventId] }));
  };

  // Formatters
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
    return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
  };

  // Compartilhar
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Inscrição no evento principal
  const handleEnroll = async () => {
    if (!user) {
      goToAuth("register");
      return;
    }
    if (isFull) {
      setEnrollError("Este evento está lotado. Não há mais vagas disponíveis.");
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
      await fetchParticipantCount();
      subEvents.forEach(sub => fetchSectionsWithStatus(sub.id));
      await fetchUserEnrolledSections();
    } catch (err) {
      setEnrollError(err.message);
    } finally {
      setEnrolling(false);
    }
  };

  // Cancelar inscrição no evento principal
  const handleCancelEnrollment = async () => {
    if (!user) return;
    setCancelling(true);
    setEnrollError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/participants/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: user.id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Erro ao cancelar inscrição");
      }
      setEnrolled(false);
      await fetchParticipantCount();
      subEvents.forEach(sub => fetchSectionsWithStatus(sub.id));
      setAvailableSections([]);
    } catch (err) {
      setEnrollError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  // Inscrição em seção
  const handleSectionEnroll = async (sectionId, subEventId) => {
    if (!user) {
      goToAuth("register");
      return;
    }
    setSectionEnrolling(prev => ({ ...prev, [sectionId]: true }));
    setSectionErrors(prev => ({ ...prev, [sectionId]: null }));
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
      await fetchSectionsWithStatus(subEventId);
      await fetchUserEnrolledSections();
    } catch (err) {
      setSectionErrors(prev => ({ ...prev, [sectionId]: err.message }));
    } finally {
      setSectionEnrolling(prev => ({ ...prev, [sectionId]: false }));
    }
  };

  // Cancelar inscrição em seção
  const handleSectionLeave = async (sectionId, subEventId) => {
    if (!user) return;
    setSectionLeaving(prev => ({ ...prev, [sectionId]: true }));
    setSectionErrors(prev => ({ ...prev, [sectionId]: null }));
    try {
      const res = await fetch(`/api/events/${eventId}/subevents/${subEventId}/sections/${sectionId}/leave`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Erro ao cancelar inscrição");
      }
      await fetchSectionsWithStatus(subEventId);
      await fetchUserEnrolledSections();
    } catch (err) {
      setSectionErrors(prev => ({ ...prev, [sectionId]: err.message }));
    } finally {
      setSectionLeaving(prev => ({ ...prev, [sectionId]: false }));
    }
  };

  // Redirecionar para login/registro
  const goToAuth = (mode = "register") => {
    const redirect = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/login?redirect=${redirect}&mode=${mode}`;
  };

  const startDate = event?.date_start || event?.date;
  const isOnline = event?.location?.toLowerCase().includes("online");
  const occupiedPercentage = capacity > 0 ? (participantCount / capacity) * 100 : 0;

  // Componente para o modal de escolha do QR Code
  const QRChoiceModal = () => (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowQRModal(false)}>
      <div className="bg-[#11101B] border border-border rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">Gerar QR Code de Check-in</h3>
          <button onClick={() => setShowQRModal(false)} className="text-gray-400 hover:text-white">
            <XCircle size={20} />
          </button>
        </div>
        <p className="text-sm text-[#6b6888] mb-4">Selecione o destino para o check-in:</p>
        <div className="space-y-2 mb-6">
          <button
            onClick={() => fetchCheckinToken(null)}
            className="w-full text-left flex items-center gap-3 p-3 rounded-xl bg-[#0f0d1a] border border-white/[0.08] hover:border-purple-500/30 transition-all"
          >
            <Home size={16} className="text-purple-400" />
            <div>
              <p className="font-medium text-white">Evento Principal</p>
              <p className="text-xs text-[#6b6888]">{event.title}</p>
            </div>
          </button>
          {availableSections.map(section => (
            <button
              key={section.id}
              onClick={() => fetchCheckinToken(section.id)}
              className="w-full text-left flex items-center gap-3 p-3 rounded-xl bg-[#0f0d1a] border border-white/[0.08] hover:border-purple-500/30 transition-all"
            >
              <Layers size={16} className="text-blue-400" />
              <div>
                <p className="font-medium text-white">{section.title || "Seção"}</p>
                <p className="text-xs text-[#6b6888]">{section.subEventTitle} – {formatShortDate(section.date_start)} {formatTime(section.date_start)}</p>
              </div>
            </button>
          ))}
          {availableSections.length === 0 && enrolled && (
            <p className="text-xs text-[#3d3860] text-center p-2">Você não está inscrito em nenhuma seção específica.</p>
          )}
        </div>
        <button onClick={() => setShowQRModal(false)} className="w-full py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
          Cancelar
        </button>
      </div>
    </div>
  );

  // Painel lateral direito
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
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#0f0d1a] border border-white/[0.05] text-[12px] text-[#6b6888] mb-3">
              <Award size={13} className="text-violet-400 shrink-0" />
              Certificado emitido automaticamente após o evento
            </div>
            {/* Botão QR Code */}
            <button
              onClick={() => setShowQRModal(true)}
              disabled={generatingQR}
              className="w-full py-2 rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/20 hover:bg-violet-600/30 text-[12px] font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 mb-2"
            >
              {generatingQR ? <Loader2 size={12} className="animate-spin" /> : <Ticket size={12} />}
              Meu QR Code de Check-in
            </button>
            {/* Botão Cancelar inscrição */}
            <button
              onClick={handleCancelEnrollment}
              disabled={cancelling}
              className="w-full py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-[12px] font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {cancelling ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
              Cancelar inscrição
            </button>
          </div>
          <div className="px-6 py-3 border-t border-white/[0.05] flex items-center gap-1.5">
            <Lock size={10} className="text-[#3d3860] shrink-0" />
            <p className="text-[11px] text-[#3d3860]">Seu QR Code é único e intransferível</p>
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
            disabled={enrolling || isFull}
            className={`w-full py-3 cursor-pointer rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed
              ${isFull 
                ? "bg-red-500/20 text-red-400 cursor-not-allowed" 
                : "bg-violet-600 hover:bg-violet-500 active:scale-[0.99] text-white"
              }`}
          >
            {enrolling ? <><Loader2 size={14} className="animate-spin" /> Processando...</> : isFull ? <><XCircle size={14} /> Evento lotado</> : <><span>Confirmar inscrição</span><ArrowRight size={14} /></>}
          </button>
          
          {isFull && <p className="text-center text-[11px] text-red-400/70 mt-3">Todas as vagas foram preenchidas.</p>}
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

      <nav className="sticky top-0 z-50 h-14 flex items-center justify-between px-6 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/[0.06]">
        <div className="flex items-center gap-2 w-32">
          <a href="/" className="text-[15px] font-black tracking-tight">e-<span className="text-violet-400">cert</span></a>
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2">
          <button onClick={handleShare} className="flex cursor-pointer items-center gap-1.5 text-[12px] font-semibold text-[#6b6888] hover:text-white border border-white/[0.08] hover:border-white/20 px-3 py-1.5 rounded-full transition-all">
            {copied ? (
              <>
                <CheckCircle size={11} className="text-emerald-400" /> Copiado
              </>
            ) : (
              <>
                <Share2 size={11} /> Compartilhar
              </>
            )}
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 w-32">
          {user ? <UserMenu user={user} /> : <button onClick={() => goToAuth("login")} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-[#6b6888] hover:text-white border border-white/[0.08] hover:border-white/20 rounded-full transition-all"><LogIn size={11} /> Entrar</button>}
        </div>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 space-y-3">
        {/* Linha 1: título + data/local */}
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
            {event.description && <p className="text-[#6b6888] text-[13.5px] leading-relaxed line-clamp-3">{event.description}</p>}
            {event.creator?.name && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.06]">
                <div className="w-6 h-6 rounded-full bg-violet-600/20 flex items-center justify-center text-[10px] font-black text-violet-400">
                  {event.creator.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-[12px] text-[#6b6888]">por <strong className="text-white/60">{event.creator.name}</strong></span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-5 flex-1">
              <p className="text-[10px] font-bold text-[#3d3860] uppercase tracking-widest mb-3">Data</p>
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-600/10 border border-violet-500/15 flex items-center justify-center shrink-0"><Calendar size={14} className="text-violet-400" /></div>
                <div>
                  <p className="text-[13px] font-bold text-white leading-snug">{formatDate(startDate)}</p>
                  {formatTime(startDate) && <p className="text-[12px] text-[#6b6888] mt-0.5 flex items-center gap-1"><Clock size={10} /> {formatTime(startDate)}</p>}
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
                    {event.locationUrl && <a href={event.locationUrl} target="_blank" rel="noopener noreferrer" className="text-[11.5px] text-violet-400 hover:text-violet-300 flex items-center gap-1 mt-1 transition-colors">Ver mapa <ExternalLink size={9} /></a>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Linha 2: painel de ação + stats */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3">
          {renderActionPanel()}
          <div className="flex flex-col gap-3">
            {capacity > 0 && (
              <div className="bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-5">
                <p className="text-[10px] font-bold text-[#3d3860] uppercase tracking-widest mb-1">Vagas</p>
                <p className={`text-[28px] font-black leading-none tracking-tight ${isFull ? "text-red-400" : "text-white"}`}>{participantCount}/{capacity}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-[11px] text-[#6b6888] mb-1">
                    <span>Preenchimento</span>
                    <span className={occupiedPercentage >= 100 ? "text-red-400" : ""}>{Math.min(Math.round(occupiedPercentage), 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${isFull ? "bg-red-500" : "bg-gradient-to-r from-violet-500 to-purple-600"}`} style={{ width: `${Math.min(occupiedPercentage, 100)}%` }} />
                  </div>
                </div>
                <p className={`text-[11.5px] mt-3 ${isFull ? "text-red-400" : "text-[#6b6888]"}`}>{isFull ? "Evento lotado!" : `${availableSpots} vaga${availableSpots !== 1 ? "s" : ""} restante${availableSpots !== 1 ? "s" : ""}`}</p>
              </div>
            )}
            <div className="bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-5 flex-1">
              <p className="text-[10px] font-bold text-[#3d3860] uppercase tracking-widest mb-3">Certificado</p>
              <div className="w-8 h-8 rounded-xl bg-violet-600/10 border border-violet-500/15 flex items-center justify-center mb-3"><Award size={14} className="text-violet-400" /></div>
              <p className="text-[12.5px] text-[#6b6888] leading-relaxed">Emitido automaticamente com link verificável</p>
            </div>
          </div>
        </div>

        {/* Subeventos com seções */}
        {hasSubEvents && (
          <div className="bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-violet-600/10 border border-violet-500/15 flex items-center justify-center"><Calendar size={12} className="text-violet-400" /></div>
                <h2 className="text-[14.5px] font-black text-white tracking-tight">Programação</h2>
              </div>
              <span className="text-[11px] font-bold text-[#3d3860] bg-white/[0.04] border border-white/[0.05] px-2.5 py-1 rounded-lg">{subEvents.length} {subEvents.length === 1 ? "atividade" : "atividades"}</span>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {subEvents.map((sub) => {
                const sections = sectionsData[sub.id] || [];
                const isExpanded = expandedSubEvents[sub.id];
                const time = formatTime(sub.date_start);
                const date = sub.date_start ? formatShortDate(sub.date_start) : null;

                return (
                  <div key={sub.id} className="transition-all">
                    <div className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.015] transition-colors" onClick={() => toggleSubEvent(sub.id)}>
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-8 h-8 rounded-xl bg-[#1a1629] border border-white/[0.06] flex items-center justify-center shrink-0">
                          {sub.type === "palestra" ? <Mic2 size={13} className="text-violet-400" /> : <Calendar size={13} className="text-violet-400" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-[14px] font-bold text-white leading-snug">{sub.title}</p>
                          {sub.description && <p className="text-[12px] text-[#6b6888] mt-1 line-clamp-1">{sub.description}</p>}
                          <div className="flex items-center gap-3 mt-1.5">
                            {date && <span className="flex items-center gap-1 text-[11px] text-[#6b6888]"><Calendar size={9} /> {date}</span>}
                            {time && <span className="flex items-center gap-1 text-[11px] text-violet-400 font-semibold"><Clock size={9} /> {time}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 ml-4">{isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}</div>
                    </div>

                    {isExpanded && (
                      <div className="bg-[#0f0d1a] border-t border-white/[0.04]">
                        {sections.length === 0 ? (
                          <div className="px-6 py-8 text-center"><p className="text-[12px] text-[#3d3860]">Nenhuma sessão disponível para este subevento</p></div>
                        ) : (
                          sections.map((section) => {
                            const sectionDate = formatShortDate(section.date_start);
                            const sectionTime = formatTime(section.date_start);
                            const isEnrolled = section.isEnrolled;
                            const isFullSection = section.availableSpots === 0;
                            const isLoading = sectionEnrolling[section.id];
                            const isLeaving = sectionLeaving[section.id];
                            const error = sectionErrors[section.id];
                            const enrolledCount = section.enrolledCount || 0;
                            const cap = section.capacity;

                            return (
                              <div key={section.id} className="px-6 py-4 ml-8 border-t border-white/[0.04] first:border-t-0 hover:bg-white/[0.005] transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="text-[13px] font-semibold text-white">{section.title || "Sessão"}</p>
                                      {cap && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isFullSection ? "bg-red-500/10 text-red-400 border border-red-500/20" : enrolledCount >= cap - 5 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>{enrolledCount}/{cap} vagas</span>}
                                      {isFullSection && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Esgotado</span>}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                      {sectionDate && <span className="flex items-center gap-1 text-[11px] text-[#6b6888]"><Calendar size={9} /> {sectionDate}</span>}
                                      {sectionTime && <span className="flex items-center gap-1 text-[11px] text-violet-400"><Clock size={9} /> {sectionTime}</span>}
                                      {section.location && <span className="flex items-center gap-1 text-[11px] text-[#6b6888]"><MapPin size={9} /> {section.location}</span>}
                                    </div>
                                    {error && <p className="text-[11px] text-red-400 font-medium mt-1">{error}</p>}
                                  </div>

                                  <div className="shrink-0">
                                    {!user ? (
                                      <span className="text-[11px] text-[#3d3860] italic cursor-pointer hover:text-white" onClick={() => goToAuth("register")}>Faça login para se inscrever</span>
                                    ) : !enrolled && !initialEnrolled ? (
                                      <span className="text-[11px] text-[#3d3860] italic">Inscreva-se no evento principal</span>
                                    ) : isEnrolled ? (
                                      <button onClick={() => handleSectionLeave(section.id, sub.id)} disabled={isLeaving} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20">
                                        {isLeaving ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />} Cancelar
                                      </button>
                                    ) : (
                                      <button onClick={() => handleSectionEnroll(section.id, sub.id)} disabled={isFullSection || isLoading} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-violet-600 hover:bg-violet-500 text-white">
                                        {isLoading ? <Loader2 size={11} className="animate-spin" /> : <UserPlus size={11} />} {isFullSection ? "Lotado" : "Participar"}
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

      {/* Modal do QR Code (exibição) */}
      {showQR && qrToken && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowQR(false)}>
          <div className="bg-[#11101B] border border-border rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">QR Code de Check-in</h3>
              <button onClick={() => setShowQR(false)} className="text-gray-400 hover:text-white"><XCircle size={20} /></button>
            </div>
            <div className="flex justify-center p-4 bg-white rounded-xl">
              <QRCodeSVG value={qrToken} size={200} />
            </div>
            <p className="text-xs text-gray-400 text-center mt-4">Apresente este QR Code na entrada do evento.</p>
          </div>
        </div>
      )}

      {/* Modal de escolha do destino do QR Code */}
      {showQRModal && <QRChoiceModal />}
    </div>
  );
}
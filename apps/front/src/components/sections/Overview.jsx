// sections/Overview.jsx
import { useState, useEffect } from "react";
import { 
  Users, Award, TrendingUp, Calendar, Clock, MapPin, User, CalendarDays,
  CheckCircle, XCircle, AlertCircle, BarChart3, Sparkles, Loader2
} from "lucide-react";

function getEventStatus(event) {
  const now = new Date();
  const start = event?.date_start ? new Date(event.date_start) : null;
  const end = event?.date_end ? new Date(event.date_end) : null;

  if (!start) return { label: "Sem data", icon: AlertCircle, color: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/20" };
  if (end && now > end) return { label: "Encerrado", icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" };
  if (now >= start && (!end || now <= end)) return { label: "Em andamento", icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
  return { label: "Acontecerá", icon: Calendar, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" };
}

export default function Overview({ eventData }) {
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [subEvents, setSubEvents] = useState([]);
  const [attendances, setAttendances] = useState([]);

  const eventId = eventData?.id;

  const fetchOverviewData = async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      // Buscar participantes
      const partsRes = await fetch(`/api/events/${eventId}/participants`, { credentials: 'include' });
      if (partsRes.ok) {
        const data = await partsRes.json();
        const list = Array.isArray(data) ? data : (data.data?.participants || data.participants || data.data || []);
        setParticipants(list);
      }

      // Buscar certificados
      const certsRes = await fetch(`/api/events/${eventId}/certificates`, { credentials: 'include' });
      if (certsRes.ok) {
        const data = await certsRes.json();
        const list = Array.isArray(data) ? data : (data.data?.certificates || data.certificates || data.data || []);
        setCertificates(list);
      }

      // Buscar subeventos
      const subsRes = await fetch(`/api/events/${eventId}/subevents`, { credentials: 'include' });
      if (subsRes.ok) {
        const data = await subsRes.json();
        const list = Array.isArray(data) ? data : (data.data?.subevents || data.subevents || data.data || []);
        setSubEvents(list);
      }

      // Buscar check-ins/attendances
      const attRes = await fetch(`/api/events/${eventId}/checkin/attendances`, { credentials: 'include' });
      if (attRes.ok) {
        const data = await attRes.json();
        const list = Array.isArray(data) ? data : (data.data?.attendances || data.attendances || data.data || []);
        setAttendances(list);
      }
    } catch (err) {
      console.error('Erro ao buscar dados do overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Se já houver dados em eventData, usa-os
    if (eventData?.participants?.length) setParticipants(eventData.participants);
    if (eventData?.certificates?.length) setCertificates(eventData.certificates);
    if (eventData?.subEvents?.length) setSubEvents(eventData.subEvents);
    if (eventData?.attendances?.length) setAttendances(eventData.attendances);

    // Se algum dado faltar, busca
    if (!eventData?.participants?.length || !eventData?.certificates?.length || 
        !eventData?.subEvents?.length || !eventData?.attendances?.length) {
      fetchOverviewData();
    }
  }, [eventId, eventData]);

  const participantCount = participants.length;
  const certificateCount = certificates.length;
  const attendanceRate = eventData?.capacity && participantCount > 0 
    ? Math.round((participantCount / eventData.capacity) * 100) 
    : 0;
  const subEventCount = subEvents.length;

  const status = getEventStatus(eventData);

  const stats = [
    { 
      icon: Users, 
      value: participantCount, 
      label: "Participantes", 
      color: "text-blue-400", 
      bg: "bg-blue-500/10", 
      border: "border-blue-500/20",
      description: participantCount === 0 ? "Nenhum participante ainda" : `${participantCount} inscritos`
    },
    { 
      icon: Award, 
      value: certificateCount, 
      label: "Certificados", 
      color: "text-emerald-400", 
      bg: "bg-emerald-500/10", 
      border: "border-emerald-500/20",
      description: certificateCount === 0 ? "Nenhum certificado gerado" : `${certificateCount} emitidos`
    },
    { 
      icon: TrendingUp, 
      value: eventData?.capacity ? `${attendanceRate}%` : "—", 
      label: "Ocupação", 
      color: "text-violet-400", 
      bg: "bg-violet-500/10", 
      border: "border-violet-500/20",
      description: eventData?.capacity ? `${participantCount}/${eventData.capacity} vagas` : "Sem limite"
    },
    { 
      icon: CalendarDays, 
      value: subEventCount, 
      label: "Sub-eventos", 
      color: "text-amber-400", 
      bg: "bg-amber-500/10", 
      border: "border-amber-500/20",
      description: subEventCount === 0 ? "Nenhum sub-evento" : `${subEventCount} atividades`
    },
  ];

  if (loading && !participantCount && !certificateCount && !subEventCount) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 size={24} className="animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status + Título */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Visão Geral</h2>
          <p className="text-sm text-[#6b6888]">Resumo do evento e métricas principais</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${status.border} ${status.bg}`}>
          <status.icon size={14} className={status.color} />
          <span className={`text-sm font-semibold ${status.color}`}>{status.label}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className={`group relative overflow-hidden rounded-xl border ${stat.border} ${stat.bg} p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(124,58,237,0.15)]`}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-500/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <stat.icon size={18} className={stat.color} />
              </div>
              <span className="text-2xl font-bold text-white">{stat.value}</span>
            </div>
            <p className="text-sm font-semibold text-white/80">{stat.label}</p>
            <p className="text-xs text-[#6b6888] mt-0.5">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Event Details */}
      <div className="rounded-xl border border-white/[0.07] bg-[#0f0d1a] p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-violet-400" />
          Sobre o evento
        </h3>
        <p className="text-[#6b6888] leading-relaxed">
          {eventData?.description || "Nenhuma descrição fornecida para este evento."}
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/[0.06]">
          {eventData?.date_start && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={14} className="text-violet-400 shrink-0" />
              <span className="text-[#6b6888]">Início:</span>
              <span className="text-white font-medium">
                {new Date(eventData.date_start).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
              </span>
            </div>
          )}
          {eventData?.date_start && (
            <div className="flex items-center gap-2 text-sm">
              <Clock size={14} className="text-violet-400 shrink-0" />
              <span className="text-[#6b6888]">Horário:</span>
              <span className="text-white font-medium">
                {new Date(eventData.date_start).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          )}
          {eventData?.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={14} className="text-violet-400 shrink-0" />
              <span className="text-[#6b6888]">Local:</span>
              <span className="text-white font-medium truncate">{eventData.location}</span>
            </div>
          )}
          {eventData?.capacity && (
            <div className="flex items-center gap-2 text-sm">
              <Users size={14} className="text-violet-400 shrink-0" />
              <span className="text-[#6b6888]">Capacidade:</span>
              <span className="text-white font-medium">{eventData.capacity} pessoas</span>
            </div>
          )}
          {eventData?.creator?.name && (
            <div className="flex items-center gap-2 text-sm">
              <User size={14} className="text-violet-400 shrink-0" />
              <span className="text-[#6b6888]">Organizador:</span>
              <span className="text-white font-medium">{eventData.creator.name}</span>
            </div>
          )}
          {eventData?.isPublic !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle size={14} className="text-violet-400 shrink-0" />
              <span className="text-[#6b6888]">Visibilidade:</span>
              <span className={`font-medium ${eventData.isPublic ? 'text-emerald-400' : 'text-amber-400'}`}>
                {eventData.isPublic ? "Público" : "Privado"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-white/[0.07] bg-[#0f0d1a] p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-violet-400" />
          Atividade recente
        </h3>
        <div className="space-y-3">
          {participantCount === 0 ? (
            <p className="text-[#6b6888] text-sm flex items-center gap-2">
              <XCircle size={14} className="text-amber-400" />
              Nenhum participante inscrito ainda.
            </p>
          ) : (
            <p className="text-[#6b6888] text-sm flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-400" />
              {participantCount} participante(s) inscrito(s) neste evento.
            </p>
          )}
          {certificateCount > 0 && (
            <p className="text-[#6b6888] text-sm flex items-center gap-2">
              <Award size={14} className="text-violet-400" />
              {certificateCount} certificado(s) emitidos.
            </p>
          )}
          {subEventCount > 0 && (
            <p className="text-[#6b6888] text-sm flex items-center gap-2">
              <CalendarDays size={14} className="text-amber-400" />
              {subEventCount} sub-evento(s) criados.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
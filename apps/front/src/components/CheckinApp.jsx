// apps/front/src/components/CheckinApp.jsx
import { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, MapPin, Users, Search, CheckCircle, AlertCircle, 
  Loader2, UserCheck, X, ArrowLeft, ChevronDown, ChevronUp,
  Clock, User, Mail, CreditCard, Shield, LogIn, Award, Tag
} from 'lucide-react';
import Particles from './Particles';

export default function CheckinApp({ eventId }) {
  const [event, setEvent] = useState(null);
  const [subEvents, setSubEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [selectedSubEvent, setSelectedSubEvent] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [sections, setSections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('email');
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [notification, setNotification] = useState(null);
  const [permission, setPermission] = useState(false);
  const [checkins, setCheckins] = useState({});
  const [expandedSubEvents, setExpandedSubEvents] = useState({});

  // Verificar permissão
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/checkin/permission`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setPermission(data.allowed);
        } else {
          setPermission(false);
        }
      } catch (err) {
        console.error('Erro ao verificar permissão:', err);
        setPermission(false);
      }
    };
    if (eventId) checkPermission();
  }, [eventId]);

  // Buscar dados do evento
  const fetchEventData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Info evento
      const eventRes = await fetch(`/api/events/${eventId}`, { credentials: 'include' });
      if (!eventRes.ok) throw new Error('Erro ao carregar evento');
      const eventData = await eventRes.json();
      const ev = eventData.data?.event || eventData.event || eventData;
      setEvent(ev);

      // 2. Subeventos
      const subRes = await fetch(`/api/events/${eventId}/subevents`, { credentials: 'include' });
      let subs = [];
      if (subRes.ok) {
        const subData = await subRes.json();
        subs = subData.data?.subevents || subData.subevents || subData.data || [];
        setSubEvents(subs);
        if (subs.length > 0) {
          setSelectedSubEvent(subs[0]);
          fetchSections(subs[0].id);
        }
      }

      // 3. Participantes (inscritos no evento)
      const partsRes = await fetch(`/api/events/${eventId}/participants`, { credentials: 'include' });
      let parts = [];
      if (partsRes.ok) {
        const partsData = await partsRes.json();
        parts = partsData.data?.participants || partsData.participants || [];
        setParticipants(parts);
      }

      // 4. Attendances (check-ins já feitos)
      const attRes = await fetch(`/api/events/${eventId}/attendances`, { credentials: 'include' });
      if (attRes.ok) {
        const attData = await attRes.json();
        const attList = attData.data?.attendances || attData.attendances || [];
        const checkinMap = {};
        attList.forEach(a => {
          checkinMap[a.userId] = true;
        });
        setCheckins(checkinMap);
      }
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const fetchSections = async (subEventId) => {
    try {
      const res = await fetch(`/api/events/${eventId}/subevents/${subEventId}/sections/public`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        const secs = data.data?.sections || data.sections || [];
        setSections(secs);
        setSelectedSection(secs.length > 0 ? secs[0] : null);
      }
    } catch (err) {
      console.error('Erro ao buscar seções:', err);
    }
  };

  useEffect(() => {
    if (eventId && permission) {
      fetchEventData();
    }
  }, [eventId, permission, fetchEventData]);

  useEffect(() => {
    if (selectedSubEvent) {
      fetchSections(selectedSubEvent.id);
    }
  }, [selectedSubEvent]);

  const toggleSubEvent = (subEventId) => {
    setExpandedSubEvents(prev => ({ ...prev, [subEventId]: !prev[subEventId] }));
  };

  const handleCheckin = async (participant, sectionId = null) => {
    if (!participant || checking) return;
    setChecking(true);
    setNotification(null);
    try {
      const payload = {
        participantId: participant.id,
        userId: participant.userId,
        sectionId: sectionId // se null, faz check-in geral do evento
      };
      const res = await fetch(`/api/events/${eventId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao registrar check-in');
      
      setNotification({ type: 'success', message: `Check-in realizado para ${participant.user?.name || 'participante'}` });
      // Atualizar o mapa de checkins
      setCheckins(prev => ({ ...prev, [participant.userId]: true }));
      // Se foi check-in em uma seção específica, você pode querer armazenar separadamente, mas por enquanto marcamos como check-in do evento.
      setSearchTerm('');
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setChecking(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const filteredParticipants = participants.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const user = p.user || {};
    if (searchType === 'email') {
      return user.email?.toLowerCase().includes(term);
    } else {
      const cpf = user.cpf || '';
      return cpf.includes(term);
    }
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "long", year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  if (!permission) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center p-6 relative">
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
        <div className="relative z-10 bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center max-w-md backdrop-blur-sm">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Acesso negado</h2>
          <p className="text-[#6b6888]">Você não tem permissão para realizar check-in neste evento.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dark min-h-screen bg-background flex justify-center items-center relative">
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
        <div className="relative z-10 flex gap-3 text-white">
          <Loader2 size={32} className="animate-spin text-purple-400" />
          <span>Carregando...</span>
        </div>
      </div>
    );
  }

  if (!event) return <div className="dark min-h-screen bg-background text-white text-center p-8">Evento não encontrado</div>;

  return (
    <div className="dark relative min-h-screen bg-background font-['Nunito',sans-serif] text-white">
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

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Header do evento */}
        <div className="bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-6 mb-6">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{event.title}</h1>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-[#6b6888]">
                <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(event.date_start)}</span>
                {formatTime(event.date_start) && (
                  <span className="flex items-center gap-1"><Clock size={14} /> {formatTime(event.date_start)}</span>
                )}
                <span className="flex items-center gap-1"><MapPin size={14} /> {event.location}</span>
                <span className="flex items-center gap-1"><Users size={14} /> {participants.length} participantes</span>
              </div>
            </div>
            <a
              href={`/eventPageAdm?id=${eventId}`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1629] border border-white/[0.06] text-[#6b6888] hover:text-white hover:border-purple-500/30 transition-all text-sm"
            >
              <ArrowLeft size={14} /> Voltar ao evento
            </a>
          </div>
        </div>

        {/* Seletor de subevento/seção */}
        {subEvents.length > 0 && (
          <div className="bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#6b6888] mb-2">Subevento</label>
                <select
                  value={selectedSubEvent?.id || ''}
                  onChange={e => {
                    const sub = subEvents.find(s => s.id === e.target.value);
                    setSelectedSubEvent(sub);
                  }}
                  className="w-full px-4 py-2 rounded-xl bg-[#0f0d1a] border border-white/[0.08] text-white focus:border-purple-500/40 outline-none text-sm"
                >
                  {subEvents.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.title}</option>
                  ))}
                </select>
              </div>
              {sections.length > 0 && (
                <div>
                  <label className="block text-sm font-bold text-[#6b6888] mb-2">Seção (opcional)</label>
                  <select
                    value={selectedSection?.id || ''}
                    onChange={e => {
                      const sec = sections.find(s => s.id === e.target.value);
                      setSelectedSection(sec);
                    }}
                    className="w-full px-4 py-2 rounded-xl bg-[#0f0d1a] border border-white/[0.08] text-white focus:border-purple-500/40 outline-none text-sm"
                  >
                    <option value="">-- Check-in geral do evento --</option>
                    {sections.map(sec => (
                      <option key={sec.id} value={sec.id}>
                        {sec.title || `${new Date(sec.date_start).toLocaleTimeString()} - ${new Date(sec.date_end).toLocaleTimeString()}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Área de busca e lista de participantes */}
        <div className="bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-6">
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3d3860]" />
              <input
                type="text"
                placeholder={`Buscar por ${searchType === 'email' ? 'e-mail' : 'CPF'}...`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0f0d1a] border border-white/[0.08] text-white placeholder-[#3d3860] focus:border-purple-500/40 outline-none text-sm"
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3d3860] hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSearchType('email')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  searchType === 'email' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-[#0f0d1a] text-[#6b6888] border border-white/[0.08] hover:border-purple-500/30'
                }`}
              >
                E-mail
              </button>
              <button
                onClick={() => setSearchType('cpf')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  searchType === 'cpf' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-[#0f0d1a] text-[#6b6888] border border-white/[0.08] hover:border-purple-500/30'
                }`}
              >
                CPF
              </button>
            </div>
          </div>

          {notification && (
            <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 ${
              notification.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {notification.message}
            </div>
          )}

          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
            {filteredParticipants.length === 0 ? (
              <div className="text-center py-10 text-[#3d3860]">
                {searchTerm ? 'Nenhum participante encontrado' : 'Nenhum participante inscrito ainda'}
              </div>
            ) : (
              filteredParticipants.map(participant => {
                const isChecked = checkins[participant.userId];
                return (
                  <div key={participant.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{participant.user?.name || 'Sem nome'}</p>
                      <p className="text-sm text-[#6b6888] truncate">{participant.user?.email}</p>
                      {participant.user?.cpf && (
                        <p className="text-xs text-[#3d3860]">CPF: {participant.user.cpf}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      {isChecked ? (
                        <span className="flex items-center gap-1 text-emerald-400 text-sm whitespace-nowrap">
                          <CheckCircle size={14} /> Check-in realizado
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCheckin(participant, selectedSection?.id)}
                          disabled={checking}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-emerald-600 to-emerald-700 hover:opacity-90 transition-all disabled:opacity-50 whitespace-nowrap"
                        >
                          <UserCheck size={14} /> Marcar check-in
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Lista de Subeventos com seções (expansível) */}
        {subEvents.length > 0 && (
          <div className="bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-600/10 border border-purple-500/15 flex items-center justify-center">
                  <Calendar size={12} className="text-purple-400" />
                </div>
                <h2 className="text-[14.5px] font-black text-white tracking-tight">
                  Programação
                </h2>
              </div>
              <span className="text-[11px] font-bold text-[#3d3860] bg-white/[0.04] border border-white/[0.05] px-2.5 py-1 rounded-lg">
                {subEvents.length} atividade{subEvents.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {subEvents.map((sub) => {
                const isExpanded = expandedSubEvents[sub.id];
                const time = formatTime(sub.date_start);
                const date = sub.date_start ? formatDate(sub.date_start) : null;

                return (
                  <div key={sub.id} className="transition-all">
                    <div
                      className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.015] transition-colors"
                      onClick={() => toggleSubEvent(sub.id)}
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-8 h-8 rounded-xl bg-[#1a1629] border border-white/[0.06] flex items-center justify-center shrink-0">
                          <Calendar size={13} className="text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[14px] font-bold text-white leading-snug">
                            {sub.title}
                          </p>
                          {sub.description && (
                            <p className="text-[12px] text-[#6b6888] mt-1 line-clamp-1">
                              {sub.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-1.5">
                            {date && (
                              <span className="flex items-center gap-1 text-[11px] text-[#6b6888]">
                                <Calendar size={9} /> {date}
                              </span>
                            )}
                            {time && (
                              <span className="flex items-center gap-1 text-[11px] text-purple-400 font-semibold">
                                <Clock size={9} /> {time}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 ml-4">
                        {isExpanded ? <ChevronUp size={16} className="text-[#6b6888]" /> : <ChevronDown size={16} className="text-[#6b6888]" />}
                      </div>
                    </div>

                    {isExpanded && sections.length > 0 && (
                      <div className="bg-[#0f0d1a] border-t border-white/[0.04] px-6 py-4 ml-8">
                        <div className="space-y-3">
                          {sections.map(sec => (
                            <div key={sec.id} className="text-[12px] text-[#6b6888]">
                              {sec.title && <strong className="text-white">{sec.title}: </strong>}
                              {new Date(sec.date_start).toLocaleString()} → {new Date(sec.date_end).toLocaleTimeString()}
                              {sec.location && ` - ${sec.location}`}
                              {sec.capacity && ` (Cap: ${sec.capacity})`}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
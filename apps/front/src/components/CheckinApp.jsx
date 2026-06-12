// apps/front/src/components/CheckinApp.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Calendar, MapPin, Users, Search, CheckCircle, AlertCircle, 
  Loader2, UserCheck, X, ArrowLeft, ChevronDown, ChevronUp,
  Clock, Scan, Home, Layers
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { jwtDecode } from 'jwt-decode';

export default function CheckinApp({ eventId }) {
  const [event, setEvent] = useState(null);
  const [subEvents, setSubEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [allSections, setAllSections] = useState([]); // { id, title, subEventTitle, date, time, capacity, enrolledCount }
  const [activeCheckinTarget, setActiveCheckinTarget] = useState(null); // { type, id, title }
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('email');
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [notification, setNotification] = useState(null);
  const [permission, setPermission] = useState(false);
  const [checkins, setCheckins] = useState({}); // userId -> { event: bool, sectionId: bool }
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const html5QrCodeRef = useRef(null);

  // Verificar permissão do usuário
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/checkin/permission`, { credentials: 'include' });
        const data = await res.json();
        setPermission(data.allowed);
      } catch (err) {
        setPermission(false);
      }
    };
    if (eventId) checkPermission();
  }, [eventId]);

  // Buscar dados do evento, participantes e presenças
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [eventRes, subRes, partsRes, attRes] = await Promise.all([
        fetch(`/api/events/${eventId}`, { credentials: 'include' }),
        fetch(`/api/events/${eventId}/subevents`, { credentials: 'include' }),
        fetch(`/api/events/${eventId}/participants`, { credentials: 'include' }),
        fetch(`/api/events/${eventId}/checkin/attendances`, { credentials: 'include' })
      ]);

      const eventData = await eventRes.json();
      setEvent(eventData.data?.event || eventData.event || eventData);

      let subs = [];
      if (subRes.ok) {
        const subData = await subRes.json();
        subs = subData.data?.subevents || subData.subevents || subData.data || [];
        setSubEvents(subs);
      }

      // Buscar seções de todos os subeventos
      const sectionsPromises = subs.map(sub => 
        fetch(`/api/events/${eventId}/subevents/${sub.id}/sections/public`, { credentials: 'include' })
          .then(res => res.ok ? res.json() : { data: { sections: [] } })
          .then(data => {
            const sections = data.data?.sections || data.sections || [];
            return sections.map(sec => ({
              ...sec,
              subEventId: sub.id,
              subEventTitle: sub.title,
              subEventDate: sub.date_start
            }));
          })
      );
      const sectionsArrays = await Promise.all(sectionsPromises);
      const flatSections = sectionsArrays.flat();
      setAllSections(flatSections);

      if (partsRes.ok) {
        const partsData = await partsRes.json();
        setParticipants(partsData.data?.participants || partsData.participants || []);
      }

      if (attRes.ok) {
        const attData = await attRes.json();
        const attList = attData.data?.attendances || attData.attendances || [];
        const map = {};
        attList.forEach(a => {
          map[a.userId] = { event: a.attended, sectionId: a.sectionId };
        });
        setCheckins(map);
      }

      // Definir target padrão: evento principal
      setActiveCheckinTarget({ type: 'event', id: eventId, title: 'Evento Principal' });
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId && permission) fetchData();
  }, [eventId, permission, fetchData]);

  // Função de check-in (para evento ou seção)
  const handleCheckin = async (participant, target) => {
    if (!participant || checking) return;
    setChecking(true);
    setNotification(null);
    try {
      const payload = { participantId: participant.id };
      if (target.type === 'section') payload.sectionId = target.id;
      const res = await fetch(`/api/events/${eventId}/checkin/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao registrar check-in');
      setNotification({ type: 'success', message: `Check-in realizado para ${participant.user?.name}` });
      setCheckins(prev => ({
        ...prev,
        [participant.userId]: {
          ...prev[participant.userId],
          event: target.type === 'event' ? true : (prev[participant.userId]?.event || false),
          sectionId: target.type === 'section' ? target.id : (prev[participant.userId]?.sectionId)
        }
      }));
      setSearchTerm('');
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setChecking(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Leitor QR
  const startScanner = useCallback(async () => {
  if (!showScanner) return;
  try {
    html5QrCodeRef.current = new Html5Qrcode('qr-reader');
    await html5QrCodeRef.current.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        if (!scanning) {
          setScanning(true);
          try {
            // Tenta decodificar como JWT
            let decoded;
            try {
              decoded = jwtDecode(decodedText);
            } catch (e) {
              // Fallback para formato antigo (se ainda existir)
              if (decodedText.startsWith('{')) {
                decoded = JSON.parse(decodedText);
              } else {
                const parts = decodedText.split(':');
                if (parts.length >= 2) {
                  decoded = { eventId: parts[0], userId: parts[1] };
                } else {
                  decoded = { userId: decodedText };
                }
              }
            }

            const { userId, eventId, sectionId } = decoded;
            
            // Verifica se o evento corresponde (opcional)
            if (eventId && eventId !== eventIdFromParams) {
              setNotification({ type: 'error', message: 'QR code de outro evento' });
              return;
            }

            const participant = participants.find(p => p.userId === userId);
            if (participant) {
              // Se o token contiver sectionId, usa‑a; senão usa o target ativo
              const target = sectionId
                ? { type: 'section', id: sectionId }
                : activeCheckinTarget;
              handleCheckin(participant, target);
              setShowScanner(false);
            } else {
              setNotification({ type: 'error', message: 'Participante não encontrado' });
            }
          } catch (err) {
            setNotification({ type: 'error', message: 'QR code inválido' });
          } finally {
            setScanning(false);
          }
        }
      },
      (error) => console.warn(error)
    );
  } catch (err) {
    console.error(err);
    setNotification({ type: 'error', message: 'Não foi possível acessar a câmera' });
    setShowScanner(false);
  }
}, [showScanner, scanning, participants, activeCheckinTarget, handleCheckin]);

  useEffect(() => {
    if (showScanner) {
      startScanner();
    }
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(console.warn);
      }
    };
  }, [showScanner, startScanner]);

  // Filtrar participantes (apenas os inscritos no target atual? Opcional: mostrar todos)
  const filteredParticipants = participants.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const user = p.user || {};
    if (searchType === 'email') return user.email?.toLowerCase().includes(term);
    if (searchType === 'name') return user.name?.toLowerCase().includes(term);
    const cpf = user.cpf || '';
    return cpf.includes(term);
  });

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' }) : '—';
  const formatTime = (d) => d ? new Date(d).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' }) : null;

  if (!permission) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center p-6 relative">
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
      <div className="dark min-h-screen bg-background flex justify-center items-center">
        <Loader2 className="animate-spin text-purple-400" size={32} />
      </div>
    );
  }

  if (!event) return <div className="text-center p-8">Evento não encontrado</div>;

  // Lista de destinos de check-in: evento principal + todas as seções
  const checkinTargets = [
    { type: 'event', id: eventId, title: 'Evento Principal', icon: Home },
    ...allSections.map(sec => ({
      type: 'section',
      id: sec.id,
      title: sec.title || `Seção ${formatDate(sec.date_start)} ${formatTime(sec.date_start)}`,
      subTitle: sec.subEventTitle,
      date: sec.date_start,
      location: sec.location,
      capacity: sec.capacity
    }))
  ];

  return (
    <div className="dark relative min-h-screen bg-background font-['Nunito',sans-serif] text-white">
      <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-4 md:p-6 mb-6">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">{event.title}</h1>
              <div className="flex flex-wrap gap-3 mt-2 text-xs md:text-sm text-[#6b6888]">
                <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(event.date_start)}</span>
                {formatTime(event.date_start) && <span className="flex items-center gap-1"><Clock size={14} /> {formatTime(event.date_start)}</span>}
                <span className="flex items-center gap-1"><MapPin size={14} /> {event.location}</span>
                <span className="flex items-center gap-1"><Users size={14} /> {participants.length} participantes</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowScanner(!showScanner)} className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-purple-600/20 border border-purple-500/20 text-purple-400 hover:bg-purple-600/30 transition-all text-sm">
                <Scan size={14} /> {showScanner ? 'Fechar' : 'Escanear QR'}
              </button>
              <a href={`/eventPageAdm?id=${eventId}`} className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-[#1a1629] border border-white/[0.06] text-[#6b6888] hover:text-white hover:border-purple-500/30 transition-all text-sm">
                <ArrowLeft size={14} /> Voltar
              </a>
            </div>
          </div>
        </div>

        {/* Scanner QR */}
        {showScanner && (
          <div className="bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-4 mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-white">Leitor de QR Code</h3>
              <button onClick={() => setShowScanner(false)} className="text-[#6b6888] hover:text-white"><X size={18} /></button>
            </div>
            <div id="qr-reader" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }} />
            <p className="text-xs text-[#6b6888] text-center mt-2">Aponte a câmera para o QR code do participante</p>
          </div>
        )}

        {/* Abas de check-in (horizontal scroll) */}
        <div className="mb-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-purple-500/20">
          <div className="flex gap-2 min-w-max">
            {checkinTargets.map(target => {
              const isActive = activeCheckinTarget?.type === target.type && activeCheckinTarget?.id === target.id;
              const Icon = target.icon || Layers;
              return (
                <button
                  key={`${target.type}-${target.id}`}
                  onClick={() => setActiveCheckinTarget(target)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all text-sm ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-[#0f0d1a] border border-white/[0.08] text-[#6b6888] hover:border-purple-500/30'
                  }`}
                >
                  <Icon size={14} />
                  <span>{target.title}</span>
                  {target.subTitle && <span className="text-xs opacity-70 hidden sm:inline">({target.subTitle})</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Informações do target selecionado (opcional) */}
        {activeCheckinTarget?.type === 'section' && (
          <div className="bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-4 mb-6 text-sm">
            <div className="flex flex-wrap gap-4 text-[#6b6888]">
              <span><Calendar size={12} /> {formatDate(activeCheckinTarget.date)}</span>
              {formatTime(activeCheckinTarget.date) && <span><Clock size={12} /> {formatTime(activeCheckinTarget.date)}</span>}
              {activeCheckinTarget.location && <span><MapPin size={12} /> {activeCheckinTarget.location}</span>}
              {activeCheckinTarget.capacity && <span><Users size={12} /> Capacidade: {activeCheckinTarget.capacity}</span>}
            </div>
          </div>
        )}

        {/* Busca e lista de participantes */}
        <div className="bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3d3860]" />
              <input
                type="text"
                placeholder={`Buscar por ${searchType === 'email' ? 'e-mail' : searchType === 'name' ? 'nome' : 'CPF'}...`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0f0d1a] border border-white/[0.08] text-white placeholder-[#3d3860] focus:border-purple-500/40 outline-none text-sm"
                autoFocus
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3d3860] hover:text-white">
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex gap-2 justify-between sm:justify-start">
              {['email', 'name', 'cpf'].map(type => (
                <button
                  key={type}
                  onClick={() => setSearchType(type)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex-1 sm:flex-none text-center ${
                    searchType === type
                      ? 'bg-purple-600 text-white'
                      : 'bg-[#0f0d1a] text-[#6b6888] border border-white/[0.08] hover:border-purple-500/30'
                  }`}
                >
                  {type === 'email' ? 'E-mail' : type === 'name' ? 'Nome' : 'CPF'}
                </button>
              ))}
            </div>
          </div>

          {notification && (
            <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 ${
              notification.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {notification.message}
            </div>
          )}

          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
            {filteredParticipants.length === 0 ? (
              <div className="text-center py-10 text-[#3d3860]">
                {searchTerm ? 'Nenhum participante encontrado' : 'Nenhum participante inscrito ainda'}
              </div>
            ) : (
              filteredParticipants.map(p => {
                const isChecked = activeCheckinTarget.type === 'event'
                  ? checkins[p.userId]?.event
                  : checkins[p.userId]?.sectionId === activeCheckinTarget.id;
                return (
                  <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white truncate">{p.user?.name || 'Sem nome'}</p>
                      <p className="text-sm text-[#6b6888] truncate">{p.user?.email}</p>
                      {p.user?.cpf && <p className="text-xs text-[#3d3860]">CPF: {p.user.cpf}</p>}
                    </div>
                    <div className="flex justify-end">
                      {isChecked ? (
                        <span className="flex items-center gap-1 text-emerald-400 text-sm whitespace-nowrap"><CheckCircle size={14} /> Check-in</span>
                      ) : (
                        <button
                          onClick={() => handleCheckin(p, activeCheckinTarget)}
                          disabled={checking}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-emerald-600 to-emerald-700 hover:opacity-90 transition-all disabled:opacity-50 whitespace-nowrap"
                        >
                          <UserCheck size={14} /> Marcar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
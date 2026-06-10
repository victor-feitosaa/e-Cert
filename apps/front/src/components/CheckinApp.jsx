// apps/front/src/components/CheckinApp.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Calendar, MapPin, Users, Search, CheckCircle, AlertCircle, 
  Loader2, UserCheck, X, ArrowLeft, ChevronDown, ChevronUp,
  Clock, Scan
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';


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
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
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

  // Buscar dados do evento, subeventos, participantes e presenças
  const fetchEventData = useCallback(async () => {
    setLoading(true);
    try {
      const eventRes = await fetch(`/api/events/${eventId}`, { credentials: 'include' });
      const eventData = await eventRes.json();
      setEvent(eventData.data?.event || eventData.event || eventData);

      const subRes = await fetch(`/api/events/${eventId}/subevents`, { credentials: 'include' });
      let subs = [];
      if (subRes.ok) {
        const subData = await subRes.json();
        subs = subData.data?.subevents || subData.subevents || subData.data || [];
        setSubEvents(subs);
        if (subs.length) {
          setSelectedSubEvent(subs[0]);
          fetchSections(subs[0].id);
        }
      }

      const partsRes = await fetch(`/api/events/${eventId}/participants`, { credentials: 'include' });
      if (partsRes.ok) {
        const partsData = await partsRes.json();
        setParticipants(partsData.data?.participants || partsData.participants || []);
      }

      const attRes = await fetch(`/api/events/${eventId}/checkin/attendances`, { credentials: 'include' });
      if (attRes.ok) {
        const attData = await attRes.json();
        const attList = attData.data?.attendances || attData.attendances || [];
        const map = {};
        attList.forEach(a => { map[a.userId] = true; });
        setCheckins(map);
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const fetchSections = async (subEventId) => {
    try {
      const res = await fetch(`/api/events/${eventId}/subevents/${subEventId}/sections/public`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSections(data.data?.sections || data.sections || []);
        setSelectedSection(null);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (eventId && permission) fetchEventData();
  }, [eventId, permission, fetchEventData]);

  useEffect(() => {
    if (selectedSubEvent) fetchSections(selectedSubEvent.id);
  }, [selectedSubEvent]);

  const toggleSubEvent = (id) => setExpandedSubEvents(prev => ({ ...prev, [id]: !prev[id] }));

  // Função de check-in
  const handleCheckin = async (participant, sectionId = null) => {
    if (!participant || checking) return;
    setChecking(true);
    setNotification(null);
    try {
      const payload = { participantId: participant.id };
      if (sectionId) payload.sectionId = sectionId;
      const res = await fetch(`/api/events/${eventId}/checkin/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao registrar check-in');
      setNotification({ type: 'success', message: `Check-in realizado para ${participant.user?.name}` });
      setCheckins(prev => ({ ...prev, [participant.userId]: true }));
      setSearchTerm('');
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setChecking(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Inicializar / parar o scanner QR
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
              let parsed;
              if (decodedText.startsWith('{')) parsed = JSON.parse(decodedText);
              else {
                const parts = decodedText.split(':');
                parsed = parts.length >= 2 ? { eventId: parts[0], userId: parts[1] } : { userId: decodedText };
              }
              const participant = participants.find(p => p.userId === parsed.userId);
              if (participant) {
                handleCheckin(participant, selectedSection?.id);
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
      console.error('Erro ao iniciar scanner:', err);
      setNotification({ type: 'error', message: 'Não foi possível acessar a câmera' });
      setShowScanner(false);
    }
  }, [showScanner, scanning, participants, selectedSection, handleCheckin]);

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
        <Loader2 className="animate-spin text-purple-400" size={32} /> Carregando...
      </div>
    );
  }

  if (!event) return <div className="text-center p-8">Evento não encontrado</div>;

  return (
    <div className="dark relative min-h-screen bg-background font-['Nunito',sans-serif] text-white">
     
      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-6 mb-6">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{event.title}</h1>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-[#6b6888]">
                <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(event.date_start)}</span>
                {formatTime(event.date_start) && <span className="flex items-center gap-1"><Clock size={14} /> {formatTime(event.date_start)}</span>}
                <span className="flex items-center gap-1"><MapPin size={14} /> {event.location}</span>
                <span className="flex items-center gap-1"><Users size={14} /> {participants.length} participantes</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowScanner(!showScanner)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/20 border border-purple-500/20 text-purple-400 hover:bg-purple-600/30 transition-all text-sm">
                <Scan size={14} /> {showScanner ? 'Fechar' : 'Escanear QR'}
              </button>
              <a href={`/eventPageAdm?id=${eventId}`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1629] border border-white/[0.06] text-[#6b6888] hover:text-white hover:border-purple-500/30 transition-all text-sm">
                <ArrowLeft size={14} /> Voltar
              </a>
            </div>
          </div>
        </div>

        {/* Scanner */}
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

        {/* Seletor de subevento/seção */}
        {subEvents.length > 0 && (
          <div className="bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#6b6888] mb-2">Subevento</label>
                <select value={selectedSubEvent?.id || ''} onChange={e => setSelectedSubEvent(subEvents.find(s => s.id === e.target.value))} className="w-full px-4 py-2 rounded-xl bg-[#0f0d1a] border border-white/[0.08] text-white focus:border-purple-500/40 outline-none text-sm">
                  {subEvents.map(sub => <option key={sub.id} value={sub.id}>{sub.title}</option>)}
                </select>
              </div>
              {sections.length > 0 && (
                <div>
                  <label className="block text-sm font-bold text-[#6b6888] mb-2">Seção (opcional)</label>
                  <select value={selectedSection?.id || ''} onChange={e => setSelectedSection(sections.find(s => s.id === e.target.value))} className="w-full px-4 py-2 rounded-xl bg-[#0f0d1a] border border-white/[0.08] text-white focus:border-purple-500/40 outline-none text-sm">
                    <option value="">-- Check-in geral do evento --</option>
                    {sections.map(sec => <option key={sec.id} value={sec.id}>{sec.title || `${new Date(sec.date_start).toLocaleTimeString()} - ${new Date(sec.date_end).toLocaleTimeString()}`}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Busca e lista */}
        <div className="bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-6">
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3d3860]" />
              <input type="text" placeholder={`Buscar por ${searchType === 'email' ? 'e-mail' : searchType === 'name' ? 'nome' : 'CPF'}...`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0f0d1a] border border-white/[0.08] text-white placeholder-[#3d3860] focus:border-purple-500/40 outline-none text-sm" autoFocus />
              {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3d3860] hover:text-white"><X size={14} /></button>}
            </div>
            <div className="flex gap-2">
              {['email', 'name', 'cpf'].map(type => (
                <button key={type} onClick={() => setSearchType(type)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${searchType === type ? 'bg-purple-600 text-white' : 'bg-[#0f0d1a] text-[#6b6888] border border-white/[0.08] hover:border-purple-500/30'}`}>
                  {type === 'email' ? 'E-mail' : type === 'name' ? 'Nome' : 'CPF'}
                </button>
              ))}
            </div>
          </div>

          {notification && (
            <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 ${notification.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {notification.message}
            </div>
          )}

          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
            {filteredParticipants.length === 0 ? (
              <div className="text-center py-10 text-[#3d3860]">{searchTerm ? 'Nenhum participante encontrado' : 'Nenhum participante inscrito ainda'}</div>
            ) : (
              filteredParticipants.map(p => {
                const isChecked = checkins[p.userId];
                return (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{p.user?.name || 'Sem nome'}</p>
                      <p className="text-sm text-[#6b6888] truncate">{p.user?.email}</p>
                      {p.user?.cpf && <p className="text-xs text-[#3d3860]">CPF: {p.user.cpf}</p>}
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      {isChecked ? (
                        <span className="flex items-center gap-1 text-emerald-400 text-sm whitespace-nowrap"><CheckCircle size={14} /> Check-in</span>
                      ) : (
                        <button onClick={() => handleCheckin(p, selectedSection?.id)} disabled={checking} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-emerald-600 to-emerald-700 hover:opacity-90 transition-all disabled:opacity-50 whitespace-nowrap">
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

        {/* Programação */}
        {subEvents.length > 0 && (
          <div className="bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-white/[0.05] flex justify-between items-center">
              <div className="flex items-center gap-2.5"><Calendar size={12} className="text-purple-400" /><h2 className="font-bold text-white">Programação</h2></div>
              <span className="text-[11px] font-bold text-[#3d3860] bg-white/[0.04] px-2.5 py-1 rounded-lg">{subEvents.length} atividade(s)</span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {subEvents.map(sub => (
                <div key={sub.id}>
                  <div className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-white/[0.015]" onClick={() => toggleSubEvent(sub.id)}>
                    <div>
                      <p className="font-bold text-white">{sub.title}</p>
                      <div className="flex gap-3 mt-1 text-xs text-[#6b6888]">
                        {sub.date_start && <span><Calendar size={9} /> {formatDate(sub.date_start)}</span>}
                        {formatTime(sub.date_start) && <span><Clock size={9} /> {formatTime(sub.date_start)}</span>}
                      </div>
                    </div>
                    {expandedSubEvents[sub.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                  {expandedSubEvents[sub.id] && sections.length > 0 && (
                    <div className="bg-[#0f0d1a] border-t border-white/[0.04] px-6 py-4 ml-8">
                      <div className="space-y-3">
                        {sections.map(sec => (
                          <div key={sec.id} className="text-xs text-[#6b6888]">
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
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
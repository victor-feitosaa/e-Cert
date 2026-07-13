// sections/Exportar.jsx
import { useState } from "react";
import { Download, Users, Award, Calendar, CheckCircle, Loader2 } from "lucide-react";

export default function Exportar({ eventData }) {
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState("participants");

  const exportOptions = [
    { id: "participants", label: "Participantes", icon: Users, description: "Lista de participantes" },
    { id: "certificates", label: "Certificados", icon: Award, description: "Relatório de certificados" },
    { id: "subevents", label: "Sub-eventos", icon: Calendar, description: "Detalhes dos sub-eventos" },
    { id: "checkins", label: "Check-ins", icon: CheckCircle, description: "Registro de presenças" },
  ];

  const getFileName = (type) => {
    const eventName = eventData?.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'evento';
    return `${eventName}_${type}_${new Date().toISOString().slice(0,10)}.csv`;
  };

  const downloadCSV = (content, filename) => {
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const arrayToCSV = (data, headers) => {
    const headerRow = headers.map(h => `"${h.title}"`).join(',');
    const rows = data.map(row => 
      headers.map(h => {
        const value = row[h.id] !== undefined && row[h.id] !== null ? row[h.id] : '—';
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    );
    return [headerRow, ...rows].join('\n');
  };

  const fetchData = async (url) => {
    try {
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();
      // Tenta extrair a lista de diferentes estruturas de resposta
      const list = data?.data?.attendances || data?.data?.certificates || data?.data?.participants || data?.data?.subevents || data?.data || data || [];
      return Array.isArray(list) ? list : [];
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      return [];
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      let data = [];
      let headers = [];
      const eventId = eventData.id;

      switch (exportType) {
        case "participants": {
          const list = await fetchData(`/api/events/${eventId}/participants`);
          if (!list.length) throw new Error('Nenhum participante encontrado.');
          headers = [
            { id: 'name', title: 'Nome' },
            { id: 'email', title: 'E-mail' },
            { id: 'cpf', title: 'CPF' },
            { id: 'status', title: 'Status' },
            { id: 'checkin', title: 'Check-in' },
          ];
          data = list.map(p => ({
            name: p.user?.name || p.name || '—',
            email: p.user?.email || p.email || '—',
            cpf: p.user?.cpf || p.cpf || '—',
            status: p.status || 'Ativo',
            checkin: p.attended ? 'Sim' : 'Não',
          }));
          break;
        }
        case "certificates": {
          const list = await fetchData(`/api/events/${eventId}/certificates`);
          if (!list.length) throw new Error('Nenhum certificado encontrado.');
          headers = [
            { id: 'participant', title: 'Participante' },
            { id: 'event', title: 'Evento / Subevento' },
            { id: 'type', title: 'Tipo' },
            { id: 'status', title: 'Status' },
          ];
          data = list.map(c => ({
            participant: c.user?.name || c.name || '—',
            event: c.event?.title || c.subEvent?.title || '—',
            type: c.type || 'Participante',
            status: c.issued ? 'Enviado' : 'Pendente',
          }));
          break;
        }
        case "subevents": {
          const list = await fetchData(`/api/events/${eventId}/subevents`);
          if (!list.length) throw new Error('Nenhum sub-evento encontrado.');
          headers = [
            { id: 'title', title: 'Título' },
            { id: 'sections', title: 'Seções' },
            { id: 'participants', title: 'Participantes' },
          ];
          data = list.map(s => ({
            title: s.title || '—',
            sections: s.sections?.length || 0,
            participants: s.participants?.length || 0,
          }));
          break;
        }
        case "checkins": {
          const list = await fetchData(`/api/events/${eventId}/checkin/attendances`);
          if (!list.length) throw new Error('Nenhum check-in encontrado.');
          headers = [
            { id: 'participant', title: 'Participante' },
            { id: 'event', title: 'Check-in Evento' },
            { id: 'sections', title: 'Check-in Seções' },
          ];
          data = list.map(a => ({
            participant: a.user?.name || a.name || '—',
            event: a.attended ? 'Confirmado' : 'Pendente',
            sections: a.sectionCheckins?.join(', ') || 'Nenhum',
          }));
          break;
        }
        default:
          throw new Error('Tipo de exportação inválido');
      }

      if (data.length === 0) throw new Error('Nenhum dado disponível para exportar.');

      const csvContent = arrayToCSV(data, headers);
      downloadCSV(csvContent, getFileName(exportType));

    } catch (err) {
      console.error(err);
      alert(err.message || 'Erro ao exportar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white">Exportar dados</h2>
        <p className="text-sm text-[#6b6888]">Exporte os dados do evento em CSV</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {exportOptions.map(opt => (
          <div
            key={opt.id}
            onClick={() => setExportType(opt.id)}
            className={`cursor-pointer rounded-xl border p-4 transition-all ${
              exportType === opt.id
                ? 'bg-violet-500/10 border-violet-500/30'
                : 'bg-[#0f0d1a] border-white/[0.06] hover:border-violet-500/20'
            }`}
          >
            <opt.icon size={18} className={exportType === opt.id ? 'text-violet-400' : 'text-[#3d3860]'} />
            <p className="text-sm font-semibold text-white mt-2">{opt.label}</p>
            <p className="text-xs text-[#6b6888]">{opt.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0f0d1a] border border-white/[0.06] rounded-xl p-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="font-semibold text-white">Exportar {exportOptions.find(o => o.id === exportType)?.label}</h3>
          <p className="text-sm text-[#6b6888]">Arquivo CSV pronto para importar no Excel</p>
        </div>
        <button
          onClick={handleExport}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold transition disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          {loading ? 'Exportando...' : 'Exportar'}
        </button>
      </div>
    </div>
  );
}
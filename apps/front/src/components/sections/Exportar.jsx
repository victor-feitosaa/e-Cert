// sections/Exportar.jsx
import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Users, Award, Calendar, Loader2 } from "lucide-react";

export default function Exportar({ eventData }) {
    const [loading, setLoading] = useState(false);
    const [exportType, setExportType] = useState("participants");

    const exportOptions = [
        { id: "participants", label: "Participantes", icon: Users, description: "Lista de participantes com e-mails" },
        { id: "certificates", label: "Certificados", icon: Award, description: "Relatório de certificados emitidos" },
        { id: "subevents", label: "Sub-eventos", icon: Calendar, description: "Detalhes dos sub-eventos" },
    ];

    const handleExport = async () => {
        setLoading(true);
        try {
            console.log("Exportando:", exportType);
            // Implementar exportação
            await new Promise(resolve => setTimeout(resolve, 1500));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-lg font-bold text-white">Exportar dados</h2>
                <p className="text-sm text-[#6b6888]">Exporte os dados do evento em formatos compatíveis</p>
            </div>

            {/* Export Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {exportOptions.map((option) => (
                    <div
                        key={option.id}
                        onClick={() => setExportType(option.id)}
                        className={`cursor-pointer rounded-xl border p-5 transition-all ${
                            exportType === option.id
                                ? "bg-violet-500/10 border-violet-500/30"
                                : "bg-[#0f0d1a] border-white/[0.06] hover:border-violet-500/20"
                        }`}
                    >
                        <option.icon size={20} className={`mb-3 ${exportType === option.id ? "text-violet-400" : "text-[#3d3860]"}`} />
                        <h3 className="font-semibold text-white mb-1">{option.label}</h3>
                        <p className="text-xs text-[#6b6888]">{option.description}</p>
                    </div>
                ))}
            </div>

            {/* Export Button */}
            <div className="bg-[#0f0d1a] border border-white/[0.06] rounded-xl p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h3 className="font-semibold text-white mb-1">Exportar como CSV/Excel</h3>
                        <p className="text-sm text-[#6b6888]">
                            Os dados serão exportados no formato selecionado
                        </p>
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-violet-600 to-purple-700 hover:opacity-90 transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            <><Loader2 size={14} className="animate-spin" /> Exportando...</>
                        ) : (
                            <><Download size={14} /> Exportar {exportOptions.find(o => o.id === exportType)?.label}</>
                        )}
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="text-center text-xs text-[#3d3860]">
                <p>Os dados serão exportados de acordo com as permissões do usuário</p>
            </div>
        </div>
    );
}
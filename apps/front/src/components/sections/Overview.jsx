// sections/Overview.jsx
import { Users, Award, TrendingUp, Calendar, Clock, MapPin, User, CalendarDays } from "lucide-react";

export default function Overview({ eventData }) {
    const participantCount = eventData.participants?.length || 0;
    const certificateCount = eventData.certificates?.length || 0;
    const attendanceRate = participantCount > 0 && eventData.capacity 
        ? Math.round((participantCount / eventData.capacity) * 100) 
        : 0;

    const stats = [
        { 
            icon: Users, 
            value: participantCount, 
            label: "Participantes", 
            color: "text-blue-400", 
            bg: "bg-blue-500/10", 
            border: "border-blue-500/20" 
        },
        { 
            icon: Award, 
            value: certificateCount, 
            label: "Certificados", 
            color: "text-emerald-400", 
            bg: "bg-emerald-500/10", 
            border: "border-emerald-500/20" 
        },
        { 
            icon: TrendingUp, 
            value: `${attendanceRate}%`, 
            label: "Presença", 
            color: "text-violet-400", 
            bg: "bg-violet-500/10", 
            border: "border-violet-500/20" 
        }
    ];

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className={`rounded-xl border ${stat.border} ${stat.bg} p-5 transition-all hover:scale-[1.02] duration-200`}>
                        <div className="flex items-center justify-between mb-3">
                            <stat.icon size={20} className={stat.color} />
                            <span className="text-2xl font-bold text-white">{stat.value}</span>
                        </div>
                        <p className="text-sm text-[#6b6888]">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Event Details */}
            <div className="rounded-xl border border-white/[0.07] bg-[#0f0d1a] p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <CalendarDays size={18} className="text-violet-400" />
                    Sobre o evento
                </h3>
                <p className="text-[#6b6888] leading-relaxed">
                    {eventData.description || "Nenhuma descrição fornecida para este evento."}
                </p>
                
                {/* Info grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/[0.06]">
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar size={14} className="text-violet-400" />
                        <span className="text-[#6b6888]">Início:</span>
                        <span className="text-white font-medium">
                            {new Date(eventData.date_start).toLocaleDateString("pt-BR")}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Clock size={14} className="text-violet-400" />
                        <span className="text-[#6b6888]">Horário:</span>
                        <span className="text-white font-medium">
                            {new Date(eventData.date_start).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                    </div>
                    {eventData.location && (
                        <div className="flex items-center gap-2 text-sm">
                            <MapPin size={14} className="text-violet-400" />
                            <span className="text-[#6b6888]">Local:</span>
                            <span className="text-white font-medium">{eventData.location}</span>
                        </div>
                    )}
                    {eventData.capacity && (
                        <div className="flex items-center gap-2 text-sm">
                            <Users size={14} className="text-violet-400" />
                            <span className="text-[#6b6888]">Capacidade:</span>
                            <span className="text-white font-medium">{eventData.capacity} pessoas</span>
                        </div>
                    )}
                    {eventData.creator?.name && (
                        <div className="flex items-center gap-2 text-sm">
                            <User size={14} className="text-violet-400" />
                            <span className="text-[#6b6888]">Organizador:</span>
                            <span className="text-white font-medium">{eventData.creator.name}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-xl border border-white/[0.07] bg-[#0f0d1a] p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp size={18} className="text-violet-400" />
                    Atividade recente
                </h3>
                <p className="text-[#6b6888] text-sm">
                    {participantCount === 0 
                        ? "Nenhum participante inscrito ainda." 
                        : `${participantCount} participante(s) inscrito(s) neste evento.`
                    }
                </p>
            </div>
        </div>
    );
}
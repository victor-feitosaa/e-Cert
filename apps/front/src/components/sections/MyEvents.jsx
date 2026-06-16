// src/components/MyEvents.jsx
import { useState } from "react";
import { 
  Calendar, Filter, Search, Grid3x3, List, Award, Users, 
  MapPin, Clock, ChevronRight, Sparkles, TrendingUp,
  Laptop, Briefcase, Palette, Book, Heart, Music, MoreHorizontal,
  Crown, Shield, Mic2, Star, Briefcase as BriefcaseIcon, X,
  CheckSquare
} from "lucide-react";

const CATEGORIES = {
  tecnologia: { name: "Tecnologia", icon: Laptop, color: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
  negocios: { name: "Negócios", icon: Briefcase, color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
  design: { name: "Design", icon: Palette, color: "#f472b6", bg: "rgba(244,114,182,0.1)" },
  educacao: { name: "Educação", icon: Book, color: "#34d399", bg: "rgba(52,211,153,0.1)" },
  saude: { name: "Saúde", icon: Heart, color: "#fb923c", bg: "rgba(251,146,60,0.1)" },
  cultura: { name: "Cultura", icon: Music, color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  outro: { name: "Outro", icon: MoreHorizontal, color: "#94a3b8", bg: "rgba(148,163,184,0.1)" }
};

// Configuração de roles do usuário no evento (incluindo CHECKIN)
const USER_ROLES = {
  ORGANIZER: { 
    label: "Organizador", 
    icon: Crown, 
    color: "text-yellow-400", 
    bg: "bg-yellow-500/10", 
    border: "border-yellow-500/20",
    canAccessAdmin: true,
    redirectTo: "admin"
  },
  MODERATOR: { 
    label: "Moderador", 
    icon: Shield, 
    color: "text-purple-400", 
    bg: "bg-purple-500/10", 
    border: "border-purple-500/20",
    canAccessAdmin: true,
    redirectTo: "admin"
  },
  SPEAKER: { 
    label: "Palestrante", 
    icon: Mic2, 
    color: "text-blue-400", 
    bg: "bg-blue-500/10", 
    border: "border-blue-500/20",
    canAccessAdmin: false,
    redirectTo: "public"
  },
  STAFF: { 
    label: "Staff", 
    icon: Users, 
    color: "text-cyan-400", 
    bg: "bg-cyan-500/10", 
    border: "border-cyan-500/20",
    canAccessAdmin: false,
    redirectTo: "public"
  },
  VOLUNTEER: { 
    label: "Voluntário", 
    icon: Star, 
    color: "text-emerald-400", 
    bg: "bg-emerald-500/10", 
    border: "border-emerald-500/20",
    canAccessAdmin: false,
    redirectTo: "public"
  },
  CHECKIN: { 
    label: "Checkin", 
    icon: CheckSquare, 
    color: "text-indigo-400", 
    bg: "bg-indigo-500/10", 
    border: "border-indigo-500/20",
    canAccessAdmin: false,
    redirectTo: "checkin"
  },
  OTHER: { 
    label: "Membro", 
    icon: BriefcaseIcon, 
    color: "text-gray-400", 
    bg: "bg-gray-500/10", 
    border: "border-gray-500/20",
    canAccessAdmin: false,
    redirectTo: "public"
  }
};

function formatDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Função corrigida: retorna dias até a data informada (positivo = futuro, negativo = passado)
function getDaysUntil(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  const today = new Date();
  // Zerar horas para comparar apenas dias
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diffTime = date - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function pct(r, c) {
  return c ? Math.round((r / c) * 100) : 0;
}

// ── Event Card ──
function EventCard({ event, viewMode = "list" }) {
  const category = CATEGORIES[event.category] || CATEGORIES.outro;
  const CategoryIcon = category.icon;
  const date = formatDate(event.date || event.date_start);
  const time = formatTime(event.date || event.date_start);
  
  // Calcular status baseado em date_start e date_end
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startDate = event.date_start ? new Date(event.date_start) : null;
  const endDate = event.date_end ? new Date(event.date_end) : null;
  
  let status = "upcoming"; // upcoming, ongoing, past
  let daysLeft = null;
  let daysUntilStart = null;
  let daysUntilEnd = null;
  
  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    daysUntilStart = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
  }
  
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    daysUntilEnd = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  }
  
  if (endDate && endDate < today) {
    status = "past";
    daysLeft = daysUntilEnd;
  } else if (startDate && startDate > today) {
    status = "upcoming";
    daysLeft = daysUntilStart;
  } else {
    status = "ongoing";
    daysLeft = daysUntilEnd; // dias restantes até o fim
  }
  
  const isUpcoming = status === "upcoming";
  const isPast = status === "past";
  const isOngoing = status === "ongoing";
  
  // Determinar a role do usuário neste evento
  let finalRole = event.userRole || (event.isOwner ? "ORGANIZER" : "OTHER");
  const hasCheckinPerm = event.eventPermissions?.some(p => p.role === 'CHECKIN') || event.userPermission === 'CHECKIN';
  if (hasCheckinPerm && finalRole !== 'ORGANIZER' && finalRole !== 'MODERATOR') {
    finalRole = 'CHECKIN';
  }
  
  const roleConfig = USER_ROLES[finalRole] || USER_ROLES.OTHER;
  const RoleIcon = roleConfig.icon;
  
  // Definir destino do clique
  const handleClick = () => {
    if (roleConfig.redirectTo === 'admin') {
      window.location.href = `/eventPageAdm?id=${event.id}`;
    } else if (roleConfig.redirectTo === 'checkin') {
      window.location.href = `/checkin?eventId=${event.id}`;
    } else {
      window.location.href = `/eventPage?id=${event.id}`;
    }
  };
  
  const occupied = event.participants && event.capacity
    ? pct(event.participants, event.capacity)
    : null;
  
  const occColor = occupied >= 90 ? "#f87171" : occupied >= 70 ? "#fbbf24" : "#34d399";

  // Modo Grid
  if (viewMode === "grid") {
    return (
      <div 
        onClick={handleClick}
        className="group bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl overflow-hidden hover:border-purple-500/40 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 cursor-pointer"
      >
        <div className="h-1 w-full" style={{ background: category.color }} />
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-white text-sm sm:text-base leading-snug line-clamp-2">
                {event.title || "Sem título"}
              </h3>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold mt-2 ${roleConfig.color} ${roleConfig.bg} ${roleConfig.border}`}>
                <RoleIcon size={10} />
                {roleConfig.label}
                {event.userJob && (
                  <span className="text-[9px] opacity-70 ml-0.5">({event.userJob})</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full shrink-0" style={{ background: category.bg }}>
              <CategoryIcon size={12} style={{ color: category.color }} />
              <span className="text-[10px] font-medium hidden sm:inline" style={{ color: category.color }}>{category.name}</span>
            </div>
          </div>

          {event.description && (
            <p className="text-xs text-[#6b6888] leading-relaxed line-clamp-2 mb-4">
              {event.description}
            </p>
          )}

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-xs text-[#6b6888]">
              <Calendar size={12} className="shrink-0 text-violet-400" />
              <span>{date}</span>
              {time && <><span className="text-[#3d3860]">•</span><span>{time}</span></>}
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-xs text-[#6b6888]">
                <MapPin size={12} className="shrink-0 text-violet-400" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
            <div className="flex gap-3">
              {occupied !== null && (
                <div className="flex items-center gap-1">
                  <Users size={12} className="text-[#3d3860]" />
                  <span className="text-xs text-[#6b6888]">{event.participants || 0}/{event.capacity}</span>
                </div>
              )}
              {event.totalCerts > 0 && (
                <div className="flex items-center gap-1">
                  <Award size={12} className="text-violet-400" />
                  <span className="text-xs text-[#6b6888]">{event.totalCerts}</span>
                </div>
              )}
            </div>
            
            {isUpcoming && daysLeft !== null && daysLeft <= 7 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {daysLeft === 0 ? "Hoje" : `${daysLeft}d`}
              </span>
            )}
            {isOngoing && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Em andamento
              </span>
            )}
            {isPast && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.04] text-[#6b6888] border border-white/[0.06]">
                Encerrado
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Modo Lista
  return (
    <div 
      onClick={handleClick}
      className="group bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-xl overflow-hidden hover:border-purple-500/30 hover:bg-white/[0.02] transition-all duration-200 cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 py-3 sm:px-5 sm:py-4">
        <div className="w-1.5 h-8 sm:h-12 rounded-full flex-shrink-0" style={{ background: category.color }} />

        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: category.bg }}>
          <CategoryIcon size={16} className="sm:size-[18]" style={{ color: category.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-white truncate">{event.title ?? "Sem título"}</p>
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${roleConfig.color} ${roleConfig.bg} ${roleConfig.border}`}>
              <RoleIcon size={10} />
              {roleConfig.label}
              {event.userJob && (
                <span className="text-[9px] opacity-70 ml-0.5">({event.userJob})</span>
              )}
            </span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ color: category.color, background: category.bg }}>
              {category.name}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
            {event.location && (
              <div className="flex items-center gap-1">
                <MapPin size={10} className="text-[#3d3860]" />
                <p className="text-xs text-[#6b6888] truncate max-w-[120px] sm:max-w-[200px]">{event.location}</p>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar size={10} className="text-[#3d3860]" />
              <p className="text-xs text-[#6b6888]">{date}</p>
            </div>
            {time && (
              <div className="flex items-center gap-1">
                <Clock size={10} className="text-[#3d3860]" />
                <p className="text-xs text-[#6b6888]">{time}</p>
              </div>
            )}
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4 ml-auto">
          {occupied !== null && (
            <div className="w-24">
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-[#6b6888]">{event.participants || 0}/{event.capacity}</span>
                <span className="text-[10px] font-semibold" style={{ color: occColor }}>{occupied}%</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${occupied}%`, background: occColor }} />
              </div>
            </div>
          )}
          
          {event.totalCerts > 0 && (
            <div className="flex items-center gap-1">
              <Award size={12} className="text-violet-400" />
              <span className="text-xs text-[#6b6888]">{event.totalCerts} certificados</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-auto sm:ml-0">
          {roleConfig.redirectTo === 'admin' && (
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" title="Acesso administrativo" />
          )}
          {roleConfig.redirectTo === 'checkin' && (
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" title="Acesso ao credenciamento" />
          )}
          {isUpcoming && daysLeft !== null && daysLeft > 0 && (
            <span className="text-[11px] font-bold px-2 py-1 rounded-full" style={{
              color: daysLeft <= 7 ? "#fbbf24" : "#34d399",
              background: daysLeft <= 7 ? "rgba(251,191,36,0.1)" : "rgba(52,211,153,0.1)",
              border: `1px solid ${daysLeft <= 7 ? "rgba(251,191,36,0.2)" : "rgba(52,211,153,0.2)"}`,
            }}>
              {daysLeft === 1 ? "Amanhã!" : `${daysLeft}d`}
            </span>
          )}
          {isOngoing && (
            <span className="text-[11px] font-bold px-2 py-1 rounded-full text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              Em andamento
            </span>
          )}
          {isPast && (
            <span className="text-[11px] font-bold px-2 py-1 rounded-full text-[#6b6888] bg-white/[0.04] border border-white/[0.06]">
              Realizado
            </span>
          )}
          <ChevronRight size={14} className="text-[#3d3860] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  );
}

// ── Stat Card Bento ──
function StatCard({ value, label, Icon, trend }) {
  return (
    <div className="bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-4 sm:p-5">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mb-2 sm:mb-3">
        <Icon size={16} className="sm:size-[18] text-violet-400" />
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl sm:text-[28px] font-black text-white leading-none tracking-tight">{value}</p>
        {trend && (
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
            +{trend}
          </span>
        )}
      </div>
      <p className="text-[11px] sm:text-[12px] text-[#6b6888] mt-1">{label}</p>
    </div>
  );
}

// ── MAIN ──
export default function MyEvents({ userData, eventsData }) {
  const [viewMode, setViewMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");

  const events = eventsData?.data?.events ?? [];
  const stats = eventsData?.stats ?? { total: 0, organizer: 0, moderator: 0, member: 0 };
  const userName = userData?.data?.data?.name ?? "Usuário";

  const filterEvents = () => {
    let filtered = events;
    
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus === "upcoming") {
      filtered = filtered.filter(event => {
        if (!event.date_start) return false;
        const start = new Date(event.date_start);
        start.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return start > today;
      });
    } else if (filterStatus === "past") {
      filtered = filtered.filter(event => {
        if (!event.date_end) {
          // Se não tem date_end, usa date_start (fallback)
          const start = new Date(event.date_start || event.date);
          start.setHours(0, 0, 0, 0);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return start < today;
        }
        const end = new Date(event.date_end);
        end.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return end < today;
      });
    }
    
    if (filterRole !== "all") {
      filtered = filtered.filter(event => {
        let role = event.userRole || (event.isOwner ? "ORGANIZER" : "OTHER");
        const hasCheckinPerm = event.eventPermissions?.some(p => p.role === 'CHECKIN') || event.userPermission === 'CHECKIN';
        if (hasCheckinPerm && role !== 'ORGANIZER' && role !== 'MODERATOR') role = 'CHECKIN';
        return role === filterRole;
      });
    }
    
    return filtered;
  };

  const filteredEvents = filterEvents();
  const upcomingEvents = events.filter(e => {
    if (!e.date_start) return false;
    const start = new Date(e.date_start);
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return start > today;
  }).length;

  return (
    <div className="dark relative min-h-screen bg-[#0A0A0F] font-['Nunito',sans-serif] text-white">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4">
        {/* Header Bento */}
        <div className="bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-violet-400" />
            <p className="text-[11px] font-bold text-[#3d3860] uppercase tracking-widest">Dashboard</p>
          </div>
          <h1 className="text-xl sm:text-[24px] font-black text-white tracking-tight mb-1">
            Meus Eventos
          </h1>
          <p className="text-[13.5px] text-[#6b6888]">
            Gerencie todos os seus eventos em um só lugar
          </p>
        </div>

        {/* Stats Bento Grid - Responsivo */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard value={stats.total || events.length} label="Total de eventos" Icon={Calendar} />
          <StatCard value={upcomingEvents} label="Próximos eventos" Icon={TrendingUp} />
          <StatCard value={stats.organizer || 0} label="Como organizador" Icon={Crown} />
          <StatCard value={stats.moderator || 0} label="Como moderador" Icon={Shield} />
          <StatCard value={stats.member || 0} label="Como membro" Icon={Users} />
        </div>

        {/* Saudação Bento */}
        <div className="bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xs sm:text-sm">{userName.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-sm sm:text-[15px] font-bold text-white">
                Olá, <span className="text-violet-400">{userName}</span>!
              </h2>
              <p className="text-[11px] sm:text-[12px] text-[#6b6888]">
                Você está envolvido em <strong className="text-white">{stats.total || events.length}</strong> evento{events.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Search + Filters Bento */}
        <div className="bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-4 space-y-3">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3d3860]" />
            <input
              type="text"
              placeholder="Buscar por título ou local..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-[#0f0d1a] border border-white/[0.08] focus:border-violet-500/40 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] text-[13px] text-white placeholder-[#2e2c42] outline-none transition-all"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#3d3860] hover:text-white">
                <X size={12} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1.5">
              {[
                { v: "all", l: "Todos" },
                { v: "upcoming", l: "Próximos" },
                { v: "past", l: "Encerrados" },
              ].map(({ v, l }) => (
                <button
                  key={v}
                  onClick={() => setFilterStatus(v)}
                  className={`text-[12px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                    filterStatus === v
                      ? "bg-violet-600/10 border-violet-500/20 text-violet-400"
                      : "bg-transparent border-white/[0.06] text-[#6b6888] hover:text-white hover:border-white/[0.14]"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { v: "all", l: "Todas funções" },
                { v: "ORGANIZER", l: "Organizador" },
                { v: "MODERATOR", l: "Moderador" },
                { v: "CHECKIN", l: "Checkin" },
                { v: "OTHER", l: "Membro" },
              ].map(({ v, l }) => (
                <button
                  key={v}
                  onClick={() => setFilterRole(v)}
                  className={`text-[12px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                    filterRole === v
                      ? "bg-violet-600/10 border-violet-500/20 text-violet-400"
                      : "bg-transparent border-white/[0.06] text-[#6b6888] hover:text-white hover:border-white/[0.14]"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Filter size={11} className="text-[#3d3860]" />
              <div className="flex gap-1 border border-white/[0.08] rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 transition-all ${viewMode === "list" ? "bg-violet-600/20 text-violet-400" : "text-[#6b6888] hover:text-white"}`}
                >
                  <List size={14} />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 transition-all ${viewMode === "grid" ? "bg-violet-600/20 text-violet-400" : "text-[#6b6888] hover:text-white"}`}
                >
                  <Grid3x3 size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-1">
            <span className="text-[12px] text-[#3d3860] font-semibold">
              {filteredEvents.length} evento{filteredEvents.length !== 1 ? "s" : ""} encontrado{filteredEvents.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Lista de Eventos */}
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4" 
          : "flex flex-col gap-3"
        }>
          {filteredEvents.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 sm:py-20 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#13111e] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                <Calendar size={20} className="sm:size-[22] text-[#3d3860]" />
              </div>
              <p className="text-[14px] sm:text-[15px] font-bold text-white/40 mb-1">
                {searchTerm || filterStatus !== "all" || filterRole !== "all" ? "Nenhum resultado" : "Nenhum evento"}
              </p>
              <p className="text-[12px] sm:text-[13px] text-[#3d3860]">
                {searchTerm || filterStatus !== "all" || filterRole !== "all" 
                  ? "Tente outros termos ou remova os filtros." 
                  : "Você não está participando de nenhum evento ainda"}
              </p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} viewMode={viewMode} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
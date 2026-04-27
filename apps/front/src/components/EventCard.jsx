import { 
  MapPin, Clock, Users, ChevronRight, Calendar, Award, 
  Laptop, Briefcase, Palette, Book, Heart, Music, MoreHorizontal,
  CalendarDays, Timer, TrendingUp, Activity, Sparkles
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

function pct(r, c) {
  return c ? Math.round((r / c) * 100) : 0;
}

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

function getDaysLeft(dateString) {
  if (!dateString) return null;
  const eventDate = new Date(dateString);
  const today = new Date();
  const diffTime = eventDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export default function EventCard({ event, viewMode = "list" }) {
  const CategoryIcon = CATEGORIES[event.category]?.icon || MoreHorizontal;
  const category = CATEGORIES[event.category] || CATEGORIES.outro;
  const date = formatDate(event.date || event.date_start);
  const time = formatTime(event.date || event.date_start);
  const daysLeft = getDaysLeft(event.date || event.date_start);
  const isUpcoming = daysLeft > 0;
  const isPast = daysLeft < 0;
  
  const occupied = event.participants && event.capacity
    ? pct(event.participants, event.capacity)
    : null;
  
  const occColor = occupied >= 90 ? "#f87171" : occupied >= 70 ? "#fbbf24" : "#34d399";
  
  const handleClick = () => {
    window.location.href = `/eventPageAdm?id=${event.id}`;
  };

  // Modo Grid
  if (viewMode === "grid") {
    return (
      <div 
        onClick={handleClick}
        className="group bg-gradient-to-br from-sidebar to-sidebar/80 border border-border rounded-xl overflow-hidden hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 cursor-pointer"
      >
        {/* Barra de categoria no topo */}
        <div className="h-1 w-full" style={{ background: category.color }} />
        
        <div className="p-5">
          {/* Título e categoria */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="font-bold text-white text-base leading-snug line-clamp-2 flex-1">
              {event.title || "Sem título"}
            </h3>
            <div 
              className="flex items-center gap-1 px-2 py-1 rounded-full shrink-0"
              style={{ background: category.bg }}
            >
              <CategoryIcon size={12} style={{ color: category.color }} />
              <span className="text-xs font-medium hidden sm:inline" style={{ color: category.color }}>
                {category.name}
              </span>
            </div>
          </div>

          {/* Descrição */}
          {event.description && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">
              {event.description}
            </p>
          )}

          {/* Data e Local */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar size={12} className="shrink-0" />
              <span>{date}</span>
              {time && (
                <>
                  <Clock size={12} className="shrink-0 ml-1" />
                  <span>{time}</span>
                </>
              )}
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin size={12} className="shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>

          {/* Estatísticas */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex gap-3">
              {occupied !== null && (
                <div className="flex items-center gap-1">
                  <Users size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {event.participants || 0}/{event.capacity}
                  </span>
                </div>
              )}
              {event.totalCerts > 0 && (
                <div className="flex items-center gap-1">
                  <Award size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{event.totalCerts}</span>
                </div>
              )}
            </div>
            
            {/* Status Badge */}
            {isUpcoming && daysLeft <= 7 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                Em breve!
              </span>
            )}
            {isPast && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/20">
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
      className="group flex items-center gap-4 px-5 py-4 rounded-xl border border-white/5 bg-sidebar/30 hover:bg-white/[0.02] hover:border-purple-500/30 transition-all duration-200 cursor-pointer"
    >
      {/* Barra colorida de categoria */}
      <div
        className="w-1.5 h-12 rounded-full flex-shrink-0"
        style={{ background: category.color }}
      />

      {/* Ícone da categoria */}
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-black/20" style={{ background: category.bg }}>
        <CategoryIcon size={18} style={{ color: category.color }} />
      </div>

      {/* Informações principais */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-white truncate">{event.title ?? "Sem título"}</p>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ color: category.color, background: category.bg }}>
            {category.name}
          </span>
        </div>
        
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {event.location && (
            <div className="flex items-center gap-1">
              <MapPin size={10} className="text-muted-foreground" />
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                {event.location}
              </p>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar size={10} className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground">{date}</p>
          </div>
          {time && (
            <div className="flex items-center gap-1">
              <Clock size={10} className="text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{time}</p>
            </div>
          )}
        </div>
      </div>

      {/* Métricas */}
      <div className="hidden lg:flex items-center gap-4">
        {occupied !== null && (
          <div className="w-24">
            <div className="flex justify-between mb-1">
              <span className="text-[10px] text-muted-foreground">
                {event.participants || 0}/{event.capacity}
              </span>
              <span className="text-[10px] font-semibold" style={{ color: occColor }}>
                {occupied}%
              </span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${occupied}%`, background: occColor }}
              />
            </div>
          </div>
        )}
        
        {event.totalCerts > 0 && (
          <div className="flex items-center gap-1">
            <Award size={12} className="text-purple-400" />
            <span className="text-xs text-muted-foreground">{event.totalCerts} certificados</span>
          </div>
        )}
      </div>

      {/* Badge de status */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {isUpcoming && daysLeft > 0 && (
          <span
            className="text-[11px] font-bold px-2 py-1 rounded-full"
            style={{
              color: daysLeft <= 7 ? "#fbbf24" : "#34d399",
              background: daysLeft <= 7 ? "rgba(251,191,36,0.1)" : "rgba(52,211,153,0.1)",
              border: `1px solid ${daysLeft <= 7 ? "rgba(251,191,36,0.2)" : "rgba(52,211,153,0.2)"}`,
            }}
          >
            {daysLeft === 1 ? "Amanhã!" : `${daysLeft}d`}
          </span>
        )}
        {isPast && (
          <span className="text-[11px] font-bold px-2 py-1 rounded-full text-gray-400 bg-gray-500/10 border border-gray-500/20">
            Realizado
          </span>
        )}

        <ChevronRight
          size={14}
          className="text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
        />
      </div>
    </div>
  );
}
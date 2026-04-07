import { MapPin, Clock, Users, ChevronRight } from "lucide-react";

const CAT_COLOR = {
  tech: "#60a5fa",
  design: "#f472b6",
  business: "#fbbf24",
  edu: "#34d399",
  health: "#fb923c",
  culture: "#a78bfa",
};

function pct(r, c) {
  return Math.round((r / c) * 100);
}

export default function EventCard({ event}) {
  const date = event.date
    ? new Date(event.date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  const color = CAT_COLOR[event.category] || "#a78bfa";
  const occupied = event.participants && event.capacity
    ? pct(event.participants, event.capacity)
    : null;
  const occColor =
    occupied >= 90 ? "#f87171" : occupied >= 70 ? "#fbbf24" : "#34d399";

  const isUpcoming = event.status === "upcoming";
  const daysLeft = event.date
    ? Math.ceil(
        (new Date(event.date + "T00:00:00") - new Date()) / 86400000
      )
    : null;



  return (
    <div onClick={() => window.location.href = `/eventPageAdm?id=${event.id}`} className="group flex items-center gap-3 px-4 py-3 rounded-lg border border-white/5 hover:bg-white/[0.02] hover:border-purple-500/20 transition-all cursor-pointer">
      
      {/* Barra colorida de categoria */}
      <div
        className="w-1 h-9 rounded-full flex-shrink-0 opacity-80"
        style={{ background: color }}
      />

      {/* Título + local */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-700 text-white truncate">{event.title ?? "Sem título"}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin size={10} className="text-muted-foreground flex-shrink-0" />
          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
            {event.location ?? "Local não informado"}
          </p>
        </div>
      </div>

      {/* Data */}
      <div className="hidden sm:flex flex-col items-start w-28 flex-shrink-0">
        <p className="text-xs font-600 text-white">{date}</p>
        {event.time && (
          <div className="flex items-center gap-1 mt-0.5">
            <Clock size={10} className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground">{event.time}</p>
          </div>
        )}
      </div>

      {/* Ocupação */}
      {occupied !== null && (
        <div className="hidden md:block w-20 flex-shrink-0">
          <div className="flex justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">
              {event.participants}/{event.capacity}
            </span>
            <span className="text-[10px] font-700" style={{ color: occColor }}>
              {occupied}%
            </span>
          </div>
          <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full opacity-75 transition-all"
              style={{ width: `${occupied}%`, background: occColor }}
            />
          </div>
        </div>
      )}

      {/* Badge dias restantes ou certs */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {isUpcoming && daysLeft !== null ? (
          <span
            className="text-[11px] font-700 px-2 py-0.5 rounded"
            style={{
              color: daysLeft <= 7 ? "#fbbf24" : "#34d399",
              background: daysLeft <= 7 ? "rgba(251,191,36,0.1)" : "rgba(52,211,153,0.1)",
              border: `1px solid ${daysLeft <= 7 ? "rgba(251,191,36,0.2)" : "rgba(52,211,153,0.2)"}`,
            }}
          >
            {daysLeft}d
          </span>
        ) : event.certs ? (
          <span className="text-[11px] font-700 px-2 py-0.5 rounded text-purple-300 bg-purple-500/10 border border-purple-500/20">
            {event.certs} certs
          </span>
        ) : null}

        <ChevronRight
          size={13}
          className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0"
        />
      </div>
    </div>
  );
}
import { useState, useMemo } from "react";
import {
  Calendar, MapPin, Clock, Award, Globe,
  ChevronRight, Search, X, Tag, Users,
  CheckCircle2, CalendarClock, Ticket,
} from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function formatTime(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function isUpcoming(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) > new Date();
}

function daysLeft(dateStr) {
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / 86400000);
}

// ── empty state ───────────────────────────────────────────────────────────────

function Empty({ filtered }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#13111e] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
        {filtered ? <Search size={22} className="text-[#3d3860]" /> : <Ticket size={22} className="text-[#3d3860]" />}
      </div>
      <p className="text-[15px] font-bold text-white/40 mb-1">
        {filtered ? "Nenhum resultado" : "Nenhuma participação ainda"}
      </p>
      <p className="text-[13px] text-[#3d3860]">
        {filtered
          ? "Tente outros termos ou remova os filtros."
          : "Inscreva-se em eventos públicos para vê-los aqui."}
      </p>
    </div>
  );
}

// ── event card ────────────────────────────────────────────────────────────────

function EventCard({ event }) {
  const date = event.date_start || event.date;
  const upcoming = isUpcoming(date);
  const online = event.location?.toLowerCase().includes("online");
  const days = upcoming && date ? daysLeft(date) : null;

  return (
    <a
      href={`/event?id=${event.id}`}
      className="group bg-[#13111e] border border-white/[0.07] hover:border-violet-500/25 rounded-2xl overflow-hidden flex flex-col transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
    >
      {/* top accent */}
      <div className={`h-0.5 w-full ${upcoming ? "bg-violet-600/60" : "bg-white/[0.06]"}`} />

      <div className="p-5 flex flex-col gap-4 flex-1">

        {/* header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            {event.category && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/15 text-violet-400 text-[10.5px] font-bold uppercase tracking-wide self-start">
                <Tag size={8} /> {event.category}
              </div>
            )}
            <h3 className="text-[15px] font-black text-white leading-snug tracking-tight group-hover:text-violet-300 transition-colors line-clamp-2">
              {event.title}
            </h3>
          </div>

          {/* status pill */}
          {upcoming ? (
            days !== null && days <= 7 ? (
              <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 whitespace-nowrap">
                {days === 0 ? "Hoje" : `${days}d`}
              </span>
            ) : (
              <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 whitespace-nowrap">
                Próximo
              </span>
            )
          ) : (
            <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[#6b6888] whitespace-nowrap">
              Concluído
            </span>
          )}
        </div>

        {/* meta */}
        <div className="flex flex-col gap-2">
          <MetaRow Icon={Calendar} text={formatDate(date)} sub={formatTime(date)} />
          {event.location && (
            <MetaRow Icon={online ? Globe : MapPin} text={event.location} />
          )}
          {event.organizer?.name && (
            <MetaRow Icon={Users} text={event.organizer.name} />
          )}
        </div>

        {/* description */}
        {event.description && (
          <p className="text-[12.5px] text-[#6b6888] leading-relaxed line-clamp-2 flex-1">
            {event.description}
          </p>
        )}
      </div>

      {/* footer */}
      <div className="px-5 py-3 border-t border-white/[0.05] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {event.workload && (
            <span className="flex items-center gap-1 text-[11.5px] text-[#6b6888] font-medium">
              <Clock size={10} className="text-violet-400" /> {event.workload}h
            </span>
          )}
          {event.certIssued ? (
            <span className="flex items-center gap-1 text-[11.5px] text-emerald-400 font-bold">
              <Award size={10} /> Certificado emitido
            </span>
          ) : upcoming ? (
            <span className="flex items-center gap-1 text-[11.5px] text-[#3d3860]">
              <CalendarClock size={10} /> Cert. após o evento
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11.5px] text-[#3d3860]">
              <CalendarClock size={10} /> Aguardando emissão
            </span>
          )}
        </div>
        <ChevronRight
          size={14}
          className="text-[#3d3860] group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all"
        />
      </div>
    </a>
  );
}

function MetaRow({ Icon, text, sub }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={12} className="text-[#3d3860] shrink-0" />
      <span className="text-[12.5px] text-[#6b6888] truncate">{text}</span>
      {sub && <span className="text-[11.5px] text-[#3d3860] shrink-0">{sub}</span>}
    </div>
  );
}

// ── stat card ─────────────────────────────────────────────────────────────────

function Stat({ value, label, Icon }) {
  return (
    <div className="bg-[#13111e] border border-white/[0.07] rounded-2xl p-5">
      <div className="w-7 h-7 rounded-lg bg-violet-600/10 border border-violet-500/15 flex items-center justify-center mb-3">
        <Icon size={13} className="text-violet-400" />
      </div>
      <p className="text-[28px] font-black text-white leading-none tracking-tight">{value}</p>
      <p className="text-[12px] text-[#6b6888] mt-1">{label}</p>
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────────────

export default function MyParticipations({ participations = [] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | upcoming | done

  const upcoming = participations.filter((e) => isUpcoming(e.date_start || e.date));
  const done = participations.filter((e) => !isUpcoming(e.date_start || e.date));
  const withCert = participations.filter((e) => e.certIssued);

  const filtered = useMemo(() => {
    let list = [...participations];
    if (filter === "upcoming") list = list.filter((e) => isUpcoming(e.date_start || e.date));
    if (filter === "done") list = list.filter((e) => !isUpcoming(e.date_start || e.date));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title?.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q) ||
          e.category?.toLowerCase().includes(q) ||
          e.organizer?.name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [participations, filter, search]);

  const hasFilter = search || filter !== "all";

  return (
    <div className="dark">
      <div className="min-h-screen bg-[#0a0a0f] font-['Nunito',sans-serif] text-white">



        <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">

          {/* header */}
          <div className="bg-[#13111e] border border-white/[0.07] rounded-2xl p-6">
            <p className="text-[11px] font-bold text-[#3d3860] uppercase tracking-widest mb-2">Conta</p>
            <h1 className="text-[24px] font-black text-white tracking-tight mb-1">
              Minhas participações
            </h1>
            <p className="text-[13.5px] text-[#6b6888]">
              Eventos em que você está inscrito ou já participou
            </p>
          </div>

          {/* stats bento */}
          <div className="grid grid-cols-3 gap-3">
            <Stat value={participations.length} label="Total de inscrições" Icon={Ticket} />
            <Stat value={upcoming.length} label="Próximos eventos" Icon={CalendarClock} />
            <Stat value={withCert.length} label="Certificados emitidos" Icon={Award} />
          </div>

          {/* search + filters */}
          <div className="bg-[#13111e] border border-white/[0.07] rounded-2xl p-4 flex flex-wrap items-center gap-3">
            {/* search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3d3860] pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar evento, local, organizador..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#0f0d1a] border border-white/[0.08] focus:border-violet-500/40 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] text-[13px] text-white placeholder-[#2e2c42] outline-none transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#3d3860] hover:text-white transition-colors"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* filter tabs */}
            <div className="flex gap-1.5">
              {[
                { v: "all", l: "Todos" },
                { v: "upcoming", l: "Próximos" },
                { v: "done", l: "Concluídos" },
              ].map(({ v, l }) => (
                <button
                  key={v}
                  onClick={() => setFilter(v)}
                  className={`text-[12px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                    filter === v
                      ? "bg-violet-600/10 border-violet-500/20 text-violet-400"
                      : "bg-transparent border-white/[0.06] text-[#6b6888] hover:text-white hover:border-white/[0.14]"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* count */}
            <span className="text-[12px] text-[#3d3860] font-semibold ml-auto">
              {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.length === 0
              ? <Empty filtered={hasFilter} />
              : filtered.map((event) => <EventCard key={event.id} event={event} />)
            }
          </div>



        </div>
      </div>
    </div>
  );
}
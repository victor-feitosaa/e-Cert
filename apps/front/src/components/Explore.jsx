// src/components/sections/ExploreEvents.jsx
import { useState, useMemo, useEffect } from "react";
import {
  Calendar, MapPin, Clock, Award, Globe, Users,
  ChevronRight, Search, X, Tag, Ticket, CalendarCheck,
  TrendingUp, Sparkles, Filter, UserPlus
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

/**
 * Determina o status do evento com base em date_start e date_end.
 * Retorna 'upcoming' (não começou), 'ongoing' (em andamento) ou 'past' (já encerrado).
 */
function getEventStatus(event) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const start = event.date_start ? new Date(event.date_start) : null;
  const end = event.date_end ? new Date(event.date_end) : null;

  // Se não tiver data definida, considera como passado (fallback)
  if (!start) return 'past';

  // Normaliza para comparar apenas datas (ignorando horas)
  const startDate = new Date(start);
  startDate.setHours(0, 0, 0, 0);

  if (end) {
    const endDate = new Date(end);
    endDate.setHours(0, 0, 0, 0);

    if (endDate < now) return 'past';
    if (startDate <= now && endDate >= now) return 'ongoing';
    if (startDate > now) return 'upcoming';
  } else {
    // Se não tiver date_end, usa apenas date_start
    if (startDate < now) return 'past';
    if (startDate === now) return 'ongoing';
    return 'upcoming';
  }

  return 'past'; // fallback
}

function isUpcoming(event) {
  return getEventStatus(event) === 'upcoming';
}

function isOngoing(event) {
  return getEventStatus(event) === 'ongoing';
}

function isPast(event) {
  return getEventStatus(event) === 'past';
}

function daysLeft(event) {
  const start = event.date_start ? new Date(event.date_start) : null;
  if (!start) return null;
  const diff = start - new Date();
  return Math.ceil(diff / 86400000);
}

// ── empty state ───────────────────────────────────────────────────────────────

function Empty({ filtered, loading }) {
  if (loading) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#13111e] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
          <div className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-[15px] font-bold text-white/40 mb-1">Carregando eventos...</p>
      </div>
    );
  }

  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#13111e] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
        {filtered ? <Search size={22} className="text-[#3d3860]" /> : <Globe size={22} className="text-[#3d3860]" />}
      </div>
      <p className="text-[15px] font-bold text-white/40 mb-1">
        {filtered ? "Nenhum resultado" : "Nenhum evento público disponível"}
      </p>
      <p className="text-[13px] text-[#3d3860]">
        {filtered
          ? "Tente outros termos ou remova os filtros."
          : "Volte mais tarde para ver novos eventos."}
      </p>
    </div>
  );
}

// ── event card ────────────────────────────────────────────────────────────────

function EventCard({ event }) {
  const status = getEventStatus(event);
  const date = event.date_start || event.date;
  const online = event.location?.toLowerCase().includes("online");
  const days = status === 'upcoming' ? daysLeft(event) : null;

  const handleSubscribe = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/eventPage?id=${event.id}`;
  };

  // Badge de status
  const StatusBadge = () => {
    if (status === 'upcoming') {
      return days !== null && days <= 7 ? (
        <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 whitespace-nowrap">
          {days === 0 ? "Hoje" : `${days}d`}
        </span>
      ) : (
        <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 whitespace-nowrap">
          Disponível
        </span>
      );
    }
    if (status === 'ongoing') {
      return (
        <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 whitespace-nowrap">
          Em andamento
        </span>
      );
    }
    return (
      <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[#6b6888] whitespace-nowrap">
        Encerrado
      </span>
    );
  };

  return (
    <div className="group bg-[#13111e] border border-white/[0.07] hover:border-violet-500/25 rounded-2xl overflow-hidden flex flex-col transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      {/* top accent */}
      <div className={`h-0.5 w-full ${status === 'upcoming' ? 'bg-violet-600/60' : status === 'ongoing' ? 'bg-emerald-400/60' : 'bg-white/[0.06]'}`} />

      <div className="p-5 flex flex-col gap-4 flex-1">

        {/* header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            {event.category && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/15 text-violet-400 text-[10.5px] font-bold uppercase tracking-wide self-start">
                <Tag size={8} /> {event.category}
              </div>
            )}
            <h3 className="text-[15px] font-black text-white leading-snug tracking-tight group-hover:text-violet-300 transition-colors line-clamp-2">
              {event.title}
            </h3>
          </div>

          <StatusBadge />
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
          {event.capacity && (
            <MetaRow Icon={Users} text={`${event.capacity} vagas`} />
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
          {event.participants && event.capacity && (
            <span className="flex items-center gap-1 text-[11.5px] text-[#6b6888]">
              <Users size={10} /> {event.participants}/{event.capacity}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {status === 'upcoming' && (
            <button
              onClick={handleSubscribe}
              className="flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white bg-violet-600 rounded-lg hover:bg-violet-500 transition-all"
            >
              <UserPlus size={12} /> Inscrever-se
            </button>
          )}
          {status === 'ongoing' && (
            <button
              onClick={handleSubscribe}
              className="flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white bg-emerald-600/80 rounded-lg hover:bg-emerald-600 transition-all"
            >
              <UserPlus size={12} /> Participar
            </button>
          )}
          <ChevronRight
            size={14}
            className="text-[#3d3860] group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all"
          />
        </div>
      </div>
    </div>
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

function Stat({ value, label, Icon, trend }) {
  return (
    <div className="bg-[#13111e] border border-white/[0.07] rounded-2xl p-5">
      <div className="w-7 h-7 rounded-lg bg-violet-600/10 border border-violet-500/15 flex items-center justify-center mb-3">
        <Icon size={13} className="text-violet-400" />
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-[28px] font-black text-white leading-none tracking-tight">{value}</p>
        {trend && (
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
            +{trend}
          </span>
        )}
      </div>
      <p className="text-[12px] text-[#6b6888] mt-1">{label}</p>
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────────────

export default function PublicEvents() {
  const [events, setEvents] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | upcoming | ongoing | past
  const [filterCategory, setFilterCategory] = useState("all"); // categoria selecionada
  const [sortBy, setSortBy] = useState("date"); // date | popularity

  // Buscar eventos públicos via proxy
  useEffect(() => {
    const fetchPublicEvents = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/events/", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          const eventsList = data?.data?.events || data?.events || [];
          setEvents(eventsList);
        }

        const userRes = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          const currentUserId = userData?.data?.user?.id || userData?.user?.id || userData?.id;
          setUserId(currentUserId);
        }
      } catch (err) {
        console.error("Erro ao buscar eventos públicos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicEvents();
  }, []);

  // Extrair categorias únicas dos eventos disponíveis
  const categories = useMemo(() => {
    const cats = events
      .filter(e => e.isPublic && e.createdBy !== userId)
      .map(e => e.category)
      .filter(c => c && typeof c === 'string')
      .map(c => c.toLowerCase().trim());
    const unique = [...new Set(cats)];
    return unique.sort();
  }, [events, userId]);

  // Estatísticas
  const availableEvents = events.filter(e => e.isPublic && e.createdBy !== userId);
  const upcomingCount = availableEvents.filter(e => isUpcoming(e)).length;
  const ongoingCount = availableEvents.filter(e => isOngoing(e)).length;
  const totalCapacity = availableEvents.reduce((sum, e) => sum + (e.capacity || 0), 0);

  const filtered = useMemo(() => {
    let list = events.filter((e) => e.isPublic);

    // Excluir eventos criados pelo próprio usuário
    if (userId) {
      list = list.filter((e) => e.createdBy !== userId);
    }

    // Filtro por status
    if (filter === "upcoming") list = list.filter((e) => isUpcoming(e));
    else if (filter === "ongoing") list = list.filter((e) => isOngoing(e));
    else if (filter === "past") list = list.filter((e) => isPast(e));

    // Filtro por categoria
    if (filterCategory !== "all") {
      list = list.filter(e => e.category && e.category.toLowerCase() === filterCategory.toLowerCase());
    }

    // Busca
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q) ||
          e.category?.toLowerCase().includes(q) ||
          e.organizer?.name?.toLowerCase().includes(q)
      );
    }

    // Ordenação
    if (sortBy === "date") {
      list.sort((a, b) => {
        const aStatus = getEventStatus(a);
        const bStatus = getEventStatus(b);
        const order = { upcoming: 0, ongoing: 1, past: 2 };
        if (order[aStatus] !== order[bStatus]) {
          return order[aStatus] - order[bStatus];
        }
        const aDate = new Date(a.date_start || a.date);
        const bDate = new Date(b.date_start || b.date);
        return aDate - bDate;
      });
    } else if (sortBy === "popularity") {
      list.sort((a, b) => (b.participants || 0) - (a.participants || 0));
    }

    return list;
  }, [events, userId, filter, filterCategory, search, sortBy]);

  const hasFilter = search || filter !== "all" || filterCategory !== "all";

  return (
    <div className="dark">
      <div className="min-h-screen bg-[#0a0a0f] font-['Nunito',sans-serif] text-white">

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">

          {/* header */}
          <div className="bg-[#13111e] border border-white/[0.07] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Globe size={14} className="text-violet-400" />
              <p className="text-[11px] font-bold text-[#3d3860] uppercase tracking-widest">Descubra</p>
            </div>
            <h1 className="text-[24px] font-black text-white tracking-tight mb-1">
              Eventos públicos
            </h1>
            <p className="text-[13.5px] text-[#6b6888]">
              Encontre eventos incríveis para participar e expandir seus conhecimentos
            </p>
          </div>

          {/* stats bento */}
          <div className="grid grid-cols-3 gap-3">
            <Stat value={availableEvents.length} label="Eventos disponíveis" Icon={Ticket} />
            <Stat value={upcomingCount} label="Próximos eventos" Icon={CalendarCheck} trend="novos" />
            <Stat value={totalCapacity} label="Vagas totais" Icon={Users} />
          </div>

          {/* search + filters */}
          <div className="bg-[#13111e] border border-white/[0.07] rounded-2xl p-4 space-y-3">
            {/* search row */}
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3d3860] pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, descrição, local, categoria..."
                className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-[#0f0d1a] border border-white/[0.08] focus:border-violet-500/40 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] text-[13px] text-white placeholder-[#2e2c42] outline-none transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute cursor-pointer right-2.5 top-1/2 -translate-y-1/2 text-[#3d3860] hover:text-white transition-colors"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* filter row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { v: "all", l: "Todos" },
                  { v: "upcoming", l: "Próximos" },
                  { v: "ongoing", l: "Em andamento" },
                  { v: "past", l: "Encerrados" },
                ].map(({ v, l }) => (
                  <button
                    key={v}
                    onClick={() => setFilter(v)}
                    className={`text-[12px] font-bold cursor-pointer px-3 py-1.5 rounded-lg border transition-all ${
                      filter === v
                        ? "bg-violet-600/10 border-violet-500/20 text-violet-400"
                        : "bg-transparent border-white/[0.06] text-[#6b6888] hover:text-white hover:border-white/[0.14]"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-[#6b6888] font-medium mr-1">Categoria:</span>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-[#0f0d1a] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[12px] text-[#6b6888] outline-none focus:border-violet-500/30"
                >
                  <option value="all">Todas</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Filter size={11} className="text-[#3d3860]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#0f0d1a] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[12px] text-[#6b6888] outline-none focus:border-violet-500/30"
                >
                  <option value="date">Ordenar por data</option>
                  <option value="popularity">Ordenar por popularidade</option>
                </select>
              </div>
            </div>

            {/* results count */}
            <div className="pt-1">
              <span className="text-[12px] text-[#3d3860] font-semibold">
                {filtered.length} evento{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.length === 0
              ? <Empty filtered={hasFilter} loading={loading} />
              : filtered.map((event) => <EventCard key={event.id} event={event} />)
            }
          </div>

        </div>
      </div>
    </div>
  );
}
// AnalyticTabs.jsx
import { useState, useCallback } from "react";
import {
  Calendar, ChartLine, Download, GraduationCap, Pen, Users,
  Globe, Lock, Clock, MapPin, User, ArrowLeft, FileText,
  CalendarDays, Layers, Sparkles, ChevronRight, UserCheck
} from "lucide-react";

import Overview from "./sections/Overview.jsx";
import SubeventosView from "./sections/SubeventosView.jsx";
import Participantes from "./sections/Participantes.jsx";
import CertificadosAnalytics from "./sections/CertificadosAnalytics.jsx";
import Exportar from "./sections/Exportar.jsx";
import EditarEvent from "./sections/EditarEvent.jsx";

const NAV_ITEMS = [
    { id: "overview",      Icon: ChartLine,     label: "Visão Geral"   },
    { id: "subeventos",    Icon: Calendar,      label: "Sub-eventos"   },
    { id: "participantes", Icon: Users,         label: "Equipe"        },
    { id: "certificados",  Icon: GraduationCap, label: "Certificados"  },
    { id: "exportar",      Icon: Download,      label: "Exportar"      },
    { id: "editar",        Icon: Pen,           label: "Editar"        },
];

/* ── Site Navbar ─────────────────────────────── */
function SiteNav({ onBack }) {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 bg-[#0A0A0F]/90 backdrop-blur-xl border-b border-white/[0.06]">
            {/* Logo */}
            <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-violet-300 bg-clip-text text-transparent">
                    e-<span className="text-violet-400">cert</span>
                </span>
            </div>

            {/* Back button */}
            <button
                onClick={onBack}
                className="flex cursor-pointer items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold text-[#6b6888] border border-white/[0.08] bg-transparent hover:text-white hover:border-violet-500/40 hover:bg-violet-500/5 transition-all duration-150"
            >
                <ArrowLeft size={14} strokeWidth={2} />
                Voltar ao dashboard
            </button>
        </nav>
    );
}

/* ── Event Header ────────────────────────────── */
function EventHeader({ eventData, date, time, canCheckin }) {
    const subEventCount = eventData.subEvents?.length ?? 0;

    return (
        <div className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-[#13111e]/80 backdrop-blur-sm mb-6">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />
            {/* Subtle background glow */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_20%_0%,rgba(124,58,237,0.06),transparent)]" />

            <div className="relative p-6 pb-5">
                <div className="flex items-start justify-between gap-4">
                    {/* Left */}
                    <div className="flex flex-col gap-3 flex-1 min-w-0">
                        {eventData.isPublic ? (
                            <div className="flex items-center gap-1.5 w-fit text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-400/10 border border-emerald-400/20 text-emerald-400">
                                <Globe size={10} /> Público
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 w-fit text-xs font-bold px-2.5 py-1 rounded-md bg-amber-400/10 border border-amber-400/20 text-amber-400">
                                <Lock size={10} /> Privado
                            </div>
                        )}

                        <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight tracking-tight truncate">
                            {eventData.title}
                        </h1>

                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#6b6888]">
                            <span className="flex items-center gap-1.5">
                                <CalendarDays size={12} className="text-violet-400 shrink-0" />
                                {date}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock size={12} className="text-violet-400 shrink-0" />
                                {time}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <MapPin size={12} className="text-violet-400 shrink-0" />
                                {eventData.location || "Não informado"}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <User size={12} className="text-violet-400 shrink-0" />
                                Por <span className="text-violet-400 font-semibold ml-1">{eventData.creator?.name}</span>
                            </span>
                        </div>
                    </div>

                    {/* Right — stat chip and check-in button */}
                    <div className="flex gap-3 shrink-0 items-center">
                        <StatChip Icon={Layers} value={subEventCount} label="sub-eventos" />
                        {canCheckin && (
                            <a
                                href={`/checkin?eventId=${eventData.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/20 hover:bg-purple-600/30 transition-all text-sm font-bold"
                            >
                                <UserCheck size={14} />
                                Credenciamento
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatChip({ Icon, value, label }) {
    return (
        <div className="flex flex-col items-center justify-center gap-1 px-4 py-2.5 rounded-lg bg-violet-500/10 border border-violet-500/20 min-w-[70px]">
            <Icon size={13} className="text-violet-400" strokeWidth={1.8} />
            <span className="text-xl font-extrabold text-violet-400 leading-none">{value}</span>
            <span className="text-[10px] font-bold text-[#6b6888] uppercase tracking-wide">{label}</span>
        </div>
    );
}

/* ── Root ────────────────────────────────────── */
export default function AnalyticTabs({ eventData: initialEventData, apiURL, cookieHeader, onBack, canCheckin = false }) {
    const [activeTab, setActiveTab] = useState("overview");
    const [eventData, setEventData] = useState(initialEventData);

    const eventId = initialEventData.id;

    function parseDateTime(isoString) {
        const d = new Date(isoString);
        return {
            date: `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`,
            time: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
        };
    }

    const { date, time } = parseDateTime(eventData.date_start);

    const handleBack = typeof onBack === "string"
        ? () => { window.location.href = onBack; }
        : (onBack ?? (() => {}));

    const handleEventUpdated = useCallback((updatedEvent) => {
        setEventData(updatedEvent);
        setActiveTab("overview");
    }, []);

    const handleSubeventsUpdated = useCallback((updatedSubevents) => {
        setEventData(prev => ({ ...prev, subEvents: updatedSubevents }));
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case "overview":      return <Overview eventData={eventData} />;
            case "subeventos":
                return (
                    <SubeventosView
                        subeventData={eventData.subEvents}
                        eventId={eventId}
                        onSubeventsUpdate={handleSubeventsUpdated}
                    />
                );
            case "participantes": return <Participantes eventId={eventId} eventData={eventData} />;
            case "certificados":  return <CertificadosAnalytics eventData={eventData} />;
            case "exportar":      return <Exportar eventData={eventData} />;
            case "editar":
                return (
                    <EditarEvent
                        eventId={eventId}
                        onEventUpdated={handleEventUpdated}
                        apiURL={apiURL}
                        cookieHeader={cookieHeader}
                    />
                );
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0F]">
            <SiteNav onBack={handleBack} />

            <div className="pt-14">
                <div className="px-6 pt-6">
                    <EventHeader eventData={eventData} date={date} time={time} canCheckin={canCheckin} />
                </div>

                <div className="px-6 pb-6">
                    <div className="bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-xl overflow-hidden">
                        {/* Tabs */}
                        <div className="border-b border-white/[0.06] px-4">
                            <div className="flex gap-1 scrollbar-custom overflow-hidden">
                                {NAV_ITEMS.map(({ id, Icon, label }) => {
                                    const isActive = activeTab === id;
                                    return (
                                        <button
                                            key={id}
                                            onClick={() => setActiveTab(id)}
                                            className={`
                                                flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-medium
                                                transition-all duration-200 border-b-2 -mb-[1px] whitespace-nowrap
                                                ${isActive
                                                    ? "border-violet-500 text-violet-400"
                                                    : "border-transparent text-[#6b6888] hover:text-white hover:border-white/[0.14]"
                                                }
                                            `}
                                        >
                                            <Icon size={16} />
                                            <span>{label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
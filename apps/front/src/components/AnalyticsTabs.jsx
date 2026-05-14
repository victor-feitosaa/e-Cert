// AnalyticTabs.jsx
import { useState, useCallback } from "react";
import {
  Calendar, ChartLine, Download, GraduationCap, Pen, Users,
  Globe, Lock, Clock, MapPin, User, ArrowLeft, FileText,
  CalendarDays, Layers
} from "lucide-react";

import Overview from "./sections/Overview.jsx";
import SubeventosView from "./sections/SubeventosView.jsx";
import Participantes from "./sections/Participantes.jsx";
import CertificadosAnalytics from "./sections/CertificadosAnalytics.jsx";
import Exportar from "./sections/Exportar.jsx";
import EditarEvent from "./sections/EditarEvent.jsx";

const NAV_ITEMS = [
    { id: "overview",      Icon: ChartLine,     label: "Overview"     },
    { id: "subeventos",    Icon: Calendar,      label: "Subeventos"   },
    { id: "participantes", Icon: Users,         label: "Membros"      },
    { id: "certificados",  Icon: GraduationCap, label: "Certificados" },
    { id: "exportar",      Icon: Download,      label: "Exportar"     },
    { id: "editar",        Icon: Pen,           label: "Editar"       },
];

/* ── Site Navbar ─────────────────────────────── */
function SiteNav({ onBack }) {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 bg-background/80 backdrop-blur-xl border-b border-border-soft">
            {/* Logo */}
            <div className="flex items-center gap-2.5">

                <span className="font-extrabold text-accent-foreground tracking-tight ">
                    e-<span className="text-violet-400">cert</span>
                </span>
            </div>

            {/* Back button */}
            <button
                onClick={onBack}
                className="flex cursor-pointer items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold text-accent-foreground border border-border-soft bg-transparent hover:text-primary hover:border-violet-500/40 hover:bg-violet-500/5 transition-all duration-150"
            >
                <ArrowLeft size={14} strokeWidth={2} />
                Voltar ao dashboard
            </button>
        </nav>
    );
}

/* ── Event Header ────────────────────────────── */
function EventHeader({ eventData, date, time }) {
    const subEventCount = eventData.subEvents?.length ?? 0;

    return (
        <div className="relative overflow-hidden rounded-xl border border-border-soft bg-background mb-6">
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

                        <h1 className="text-3xl font-extrabold text-primary leading-tight tracking-tight truncate">
                            {eventData.title}
                        </h1>

                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-accent-foreground">
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
                                {eventData.location}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <User size={12} className="text-violet-400 shrink-0" />
                                Por <span className="text-primary font-semibold ml-1">{eventData.creator?.name}</span>
                            </span>
                        </div>
                    </div>

                    {/* Right — stat chip */}
                    <div className="flex gap-3 shrink-0">
                        <StatChip Icon={Layers} value={subEventCount} label="subeventos" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatChip({ Icon, value, label }) {
    return (
        <div className="flex flex-col items-center justify-center gap-1 px-4 py-3 rounded-lg bg-violet-500/5 border border-violet-500/15 min-w-[72px]">
            <Icon size={13} className="text-violet-400" strokeWidth={1.8} />
            <span className="text-lg font-extrabold text-primary leading-none">{value}</span>
            <span className="text-[10px] font-semibold text-accent-foreground uppercase tracking-wide">{label}</span>
        </div>
    );
}

/* ── Root ────────────────────────────────────── */
export default function AnalyticTabs({ eventData: initialEventData, apiURL, cookieHeader, onBack }) {
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
        <div className="flex flex-col text-accent-foreground">
            <SiteNav onBack={handleBack} />

            <div className="pt-14">
                <div className="px-6 pt-6">
                    <EventHeader eventData={eventData} date={date} time={time} />
                </div>

                <section className="mx-6 bg-background border border-border-soft py-2 px-4 rounded-xl">
                    <div className="border-b border-sidebar mb-6">
                        <div className="flex gap-2">
                            {NAV_ITEMS.map(({ id, Icon, label }) => {
                                const isActive = activeTab === id;
                                return (
                                    <button
                                        key={id}
                                        onClick={() => setActiveTab(id)}
                                        className={`
                                            flex cursor-pointer items-center gap-2 px-6 py-3 text-sm font-medium
                                            transition-all duration-200 border-b-2 -mb-[1px]
                                            ${isActive
                                                ? "border-primary text-primary"
                                                : "border-transparent text-accent-foreground hover:text-primary hover:border-accent"
                                            }
                                        `}
                                    >
                                        <Icon size={18} />
                                        <span>{label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-6">
                        {renderContent()}
                    </div>
                </section>
            </div>
        </div>
    );
}
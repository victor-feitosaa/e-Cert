import { useState, useCallback } from "react";
import { Calendar, ChartLine, Download, GraduationCap, Pen, Users, Globe, Lock, Clock, MapPin, User } from "lucide-react";

import Overview from "./sections/Overview.jsx";
import SubeventosView from "./sections/SubeventosView.jsx";
import Participantes from "./sections/Participantes.jsx";
import CertificadosAnalytics from "./sections/CertificadosAnalytics.jsx";
import Exportar from "./sections/Exportar.jsx";
import EditarEvent from "./sections/EditarEvent.jsx";

const NAV_ITEMS = [
    { id: "overview",      Icon: ChartLine,     label: "Overview"      },
    { id: "subeventos",    Icon: Calendar,      label: "Subeventos"    },
    { id: "participantes", Icon: Users,         label: "Participantes" },
    { id: "certificados",  Icon: GraduationCap, label: "Certificados"  },
    { id: "exportar",      Icon: Download,      label: "Exportar"      },
    { id: "editar",        Icon: Pen,           label: "Editar"        },
];

export default function AnalyticTabs({ eventData: initialEventData }) {
    const [activeTab, setActiveTab] = useState("overview");
    const [eventData, setEventData] = useState(initialEventData);

    const eventId = initialEventData.id;

    function parseDateTime(isoString) {
        const d = new Date(isoString);
        return {
            date: d.toLocaleDateString("pt-BR", {
                day: "2-digit", month: "2-digit", year: "numeric",
                timeZone: "America/Sao_Paulo",
            }),
            time: d.toLocaleTimeString("pt-BR", {
                hour: "2-digit", minute: "2-digit",
                timeZone: "America/Sao_Paulo",
            }),
        };
    }

    const { date, time } = parseDateTime(eventData.date);

    const handleEventUpdated = useCallback((updatedEvent) => {
        setEventData(updatedEvent);
        setActiveTab("overview");
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case "overview":      return <Overview              eventData={eventData} />;
            case "subeventos":    return <SubeventosView        eventData={eventData} />;
            case "participantes": return <Participantes         eventData={eventData} />;
            case "certificados":  return <CertificadosAnalytics eventData={eventData} />;
            case "exportar":      return <Exportar              eventData={eventData} />;
            case "editar":
                return (
                    <EditarEvent
                        eventId={eventId}
                        onEventUpdated={handleEventUpdated}
                    />
                );
            default: return null;
        }
    };

    return (
        <div className="flex flex-col text-accent-foreground">

            {/* ── HEADER ── */}
            <div className="flex mb-4">
                <div className="flex flex-col gap-5 mb-4 w-1/2">

                    {eventData.isPublic ? (
                        <div className="flex items-center gap-1.5 w-fit text-xs font-bold px-3 py-1 rounded-md bg-emerald-400/10 border border-emerald-400/20 text-emerald-400">
                            <Globe size={10} /> Público
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 w-fit text-xs font-bold px-3 py-1 rounded-md bg-amber-400/10 border border-amber-400/20 text-amber-400">
                            <Lock size={10} /> Privado
                        </div>
                    )}

                    <h1 className="text-4xl font-extrabold text-primary">
                        {eventData.title}
                    </h1>

                    <div className="flex gap-2 w-1/2 justify-between items-center text-sm text-accent-foreground">
                        <div className="flex gap-2 justify-center items-center">
                            <Calendar size={12} />
                            <span>{date}</span> |
                            <Clock size={12} />
                            <span>{time}</span>
                        </div>
                        <div className="flex gap-2 w-1/2 justify-end items-center">
                            <MapPin size={12} />
                            <span>{eventData.location}</span>
                        </div>
                    </div>

                    <div className="mt-5 flex gap-2 items-center text-sm">
                        <User size={12} />
                        <span>
                            Por <span className="text-primary">{eventData.creator?.name}</span>
                        </span>
                    </div>
                </div>

                <div className="flex w-1/2 justify-end items-center">
                    {/* Futuros buttons */}
                </div>
            </div>

            {/* ── TABS ── */}
            <section className="mt-8 bg-background border border-border-soft py-2 px-4">
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
    );
}
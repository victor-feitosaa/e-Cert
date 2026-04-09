import { useState } from "react";
import { Calendar, ChartLine, Download, GraduationCap, Pen, Users } from "lucide-react";


import Overview from "./sections/Overview.jsx";
import SubeventosView from "./sections/SubeventosView.jsx";
import Participantes from "./sections/Participantes.jsx";
import CertificadosAnalytics from "./sections/CertificadosAnalytics.jsx";
import Exportar from "./sections/Exportar.jsx";
import EditarEvent from "./sections/EditarEvent.jsx";

const NAV_ITEMS = [
    { id: "overview", Icon: ChartLine, label: "Overview" },
    { id: "subeventos", Icon: Calendar , label: "Subeventos" },
    { id: "participantes", Icon: Users, label: "Participantes" },
    { id: "certificados", Icon: GraduationCap, label: "Certificados" },
    { id: "exportar", Icon: Download, label: "Exportar" },
    { id: "editar", Icon: Pen, label: "Editar" },
];

export default function AnalyticTabs({ eventData }) {
    const [activeTab, setActiveTab] = useState("overview");
    
    const CONTENT_MAP = {
        "overview": <Overview eventData={eventData} />,
        "subeventos": <SubeventosView eventData={eventData} />,
        "participantes": <Participantes eventData={eventData} />,
        "certificados": <CertificadosAnalytics eventData={eventData} />,
        "exportar": <Exportar  eventData={eventData} />,
        "editar": <EditarEvent  eventData={eventData} />
    };
    
    return (
        <section className="mt-8 bg-background border border-border-soft py-2 px-4">
            {/* Tab Navigation */}
            <div className="border-b border-sidebar mb-6 ">
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
                                {isActive }
                            </button>
                        );
                    })}
                </div>
            </div>
            
            {/* Tab Content */}
            <div className="mt-6">
                {CONTENT_MAP[activeTab]}
            </div>
        </section>
    );
}
import { CalendarDays, Ticket, Award, Compass, Plus } from "lucide-react";

const NAV_ITEMS = [
  { id: "meus-eventos",  Icon: CalendarDays, label: "Meus eventos"    },
  { id: "participando",  Icon: Ticket,       label: "Participando"    },
  { id: "certificados",  Icon: Award,        label: "Certificados"    },
  { id: "explorar",      Icon: Compass,      label: "Explorar eventos" },
];

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <div className="dark top-0 left-0 fixed w-1/6 min-h-screen bg-sidebar flex flex-col">
      
      <div id="sidebar-header">
        <h2 className="font-extrabold text-xl text-accent-foreground py-6 px-8">
          e-<span className="text-primary">cert</span>
        </h2>
        <hr />
      </div>

      <div id="sidebar-content" className="w-full text-sidebar-accent-foreground p-2 flex flex-col flex-1 gap-2">
        {NAV_ITEMS.map(({ id, Icon, label }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`
                flex w-full px-6 py-3 gap-3 rounded-lg items-center font-medium text-sm
                border-[0.5px] transition-all duration-150 hover:cursor-pointer
                ${isActive
                  ? "bg-sidebar-accent text-primary border-accent"
                  : "border-sidebar hover:bg-sidebar-accent hover:text-primary hover:border-accent"
                }
              `}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      <div id="sidebar-footer" className="p-4">
        
        <a href="/create"
          className="w-full font-bold text-white text-sm bg-gradient-to-br from-[#8b5cf6] to-[#9333ea]
            px-6 py-3 rounded-lg inline-flex items-center justify-center gap-2
            shadow-[0_4px_8px_rgba(124,58,237,0.4)] hover:shadow-[0_8px_30px_rgba(124,58,237,0.55)]
            transition-all duration-200 cursor-pointer no-underline"
        >
          <Plus size={16} /> Criar evento
        </a>
      </div>

    </div>
  );
}
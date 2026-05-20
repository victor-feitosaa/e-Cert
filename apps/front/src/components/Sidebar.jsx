import { CalendarDays, Ticket, Award, Compass, Plus, LogOut } from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { id: "meus-eventos",  Icon: CalendarDays, label: "Meus eventos"    },
  { id: "participando",  Icon: Ticket,       label: "Participando"    },
  { id: "certificados",  Icon: Award,        label: "Certificados"    },
  { id: "explorar",      Icon: Compass,      label: "Explorar eventos" },
];

export default function Sidebar({ activeTab, onTabChange }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="dark top-0 left-0 z-60 fixed  w-1/6 min-h-screen bg-sidebar flex flex-col">
      
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

      <div id="sidebar-footer" className="p-4 space-y-3">
        {/* Botão Criar evento */}
        <a
          href="/create"
          className="w-full font-bold text-white text-sm bg-gradient-to-br from-[#8b5cf6] to-[#9333ea]
            px-6 py-3 rounded-lg inline-flex items-center justify-center gap-2
            shadow-[0_4px_8px_rgba(124,58,237,0.4)] hover:shadow-[0_8px_30px_rgba(124,58,237,0.55)]
            transition-all duration-200 cursor-pointer no-underline"
        >
          <Plus size={16} /> Criar evento
        </a>

        {/* Botão Logout */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-3 px-6 py-3 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
        >
          {isLoggingOut ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-red-400/30 border-t-red-400 animate-spin" />
              <span>Saindo...</span>
            </>
          ) : (
            <>
              <LogOut size={20} />
              <span>Sair</span>
            </>
          )}
        </button>

        {/* Versão */}
        <p className="text-[10px] text-[#3d3860] text-center pt-2">
          v1.0.0 • e-Cert
        </p>
      </div>

    </div>
  );
}
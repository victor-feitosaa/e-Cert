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
    <div className="dark top-0 left-0 z-60 fixed w-1/6 min-h-screen bg-[#13111e]/80 backdrop-blur-sm border-r border-white/[0.07] flex flex-col">
      
      <div id="sidebar-header" className="border-b border-white/[0.07]">
        <h2 className="font-extrabold text-xl text-accent-foreground py-6 px-8">
          e-<span className="bg-gradient-to-r from-[#a78bfa] to-[#8b5cf6] bg-clip-text text-transparent">cert</span>
        </h2>
      </div>

      <div id="sidebar-content" className="w-full p-4 flex flex-col flex-1 gap-2">
        {NAV_ITEMS.map(({ id, Icon, label }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`
                flex w-full px-4 py-3 gap-3 rounded-xl items-center font-medium text-sm
                transition-all duration-200 cursor-pointer
                ${isActive
                  ? "bg-violet-600/20 text-violet-400 border border-violet-500/20 shadow-[0_0_0_1px_rgba(139,92,246,0.1)]"
                  : "text-[#6b6888] hover:bg-white/[0.02] hover:text-white hover:border-white/[0.06]"
                }
              `}
            >
              <Icon size={18} className={isActive ? "text-violet-400" : ""} />
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
            px-4 py-2.5 rounded-xl inline-flex items-center justify-center gap-2
            shadow-[0_4px_14px_rgba(124,58,237,0.3)] hover:shadow-[0_8px_25px_rgba(124,58,237,0.45)]
            transition-all duration-200 cursor-pointer no-underline"
        >
          <Plus size={16} /> Criar evento
        </a>

        {/* Botão Logout */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
        >
          {isLoggingOut ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-red-400/30 border-t-red-400 animate-spin" />
              <span>Saindo...</span>
            </>
          ) : (
            <>
              <LogOut size={18} />
              <span>Sair</span>
            </>
          )}
        </button>

        {/* Versão */}
        <p className="text-[10px] text-[#3d3860] text-center pt-2 border-t border-white/[0.05] mt-2">
          v1.0.0 • e-Cert
        </p>
      </div>
    </div>
  );
}
// src/components/UserMenu.jsx
import { useState, useEffect, useRef } from "react";
import { 
  User, LogOut, Settings, Shield, Calendar, Award, 
  LayoutDashboard, ChevronDown, UserCircle, HelpCircle
} from "lucide-react";

export default function UserMenu({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Fechar o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        if (onLogout) onLogout();
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const navigateTo = (path) => {
    window.location.href = path;
    setIsOpen(false);
  };

  const userName = user?.name || "Usuário";
  const userEmail = user?.email || "";
  const userInitial = userName.charAt(0).toUpperCase();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/userDashboard" },
    // { icon: Calendar, label: "Meus Eventos", path: "/my-events" },
    // { icon: Award, label: "Meus Certificados", path: "/my-certificates" },
    // { icon: Settings, label: "Configurações", path: "/settings" },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Botão do usuário */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-all duration-200 group"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-md shadow-purple-500/20">
          <span className="text-white font-bold text-sm">{userInitial}</span>
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-white leading-tight">
            {userName.split(" ")[0]}
          </p>
          <p className="text-xs text-muted-foreground leading-tight">
            {userEmail.split("@")[0]}
          </p>
        </div>
        <ChevronDown 
          size={14} 
          className={`text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-sidebar border border-purple-500/20 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Cabeçalho do usuário */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">{userInitial}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => navigateTo(item.path)}
                className="w-full cursor-pointer flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 my-1"></div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full cursor-pointer flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      )}
    </div>
  );
}
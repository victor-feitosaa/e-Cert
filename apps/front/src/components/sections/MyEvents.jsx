import { useState } from "react";
import EventCard from "../EventCard";
import { Calendar, Filter, Search, Grid3x3, List, Award, Users, ChevronRight, Sparkles } from "lucide-react";

export default function MyEvents({ userData, eventsData }) {
  const [viewMode, setViewMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const events = eventsData?.data?.events ?? [];
  const userName = userData?.data?.data?.name ?? "Usuário";

  const filterEvents = () => {
    let filtered = events;
    
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus === "upcoming") {
      filtered = filtered.filter(event => new Date(event.date) > new Date());
    } else if (filterStatus === "past") {
      filtered = filtered.filter(event => new Date(event.date) < new Date());
    }
    
    return filtered;
  };

  const filteredEvents = filterEvents();
  const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).length;
  const totalParticipants = events.reduce((sum, e) => sum + (e.participants || 0), 0);
  const totalCertificates = events.reduce((sum, e) => sum + (e.totalCerts || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-950/10">
      {/* Header com estatísticas */}
      <div className="relative overflow-hidden bg-sidebar/50 border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent" />
        
        <div className="w-full px-6 py-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
                Meus Eventos
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie todos os seus eventos em um só lugar
              </p>
            </div>
            
            <div className="flex gap-3">
              <div className="bg-background/50 rounded-lg px-4 py-2 text-center border border-border">
                <p className="text-2xl font-bold text-primary">{upcomingEvents}</p>
                <p className="text-xs text-muted-foreground">Próximos</p>
              </div>
              <div className="bg-background/50 rounded-lg px-4 py-2 text-center border border-border">
                <p className="text-2xl font-bold text-primary">{totalParticipants}</p>
                <p className="text-xs text-muted-foreground">Participantes</p>
              </div>
              <div className="bg-background/50 rounded-lg px-4 py-2 text-center border border-border">
                <p className="text-2xl font-bold text-primary">{totalCertificates}</p>
                <p className="text-xs text-muted-foreground">Certificados</p>
              </div>
            </div>
          </div>
          
          {/* Saudação */}
          <div className="mt-6">
            <h2 className="text-2xl font-bold text-accent-foreground">
              Olá, <span className="text-primary">{userName}</span>!
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Você tem <span className="text-primary font-semibold">{events.length}</span> eventos no total
            </p>
          </div>
        </div>
      </div>

      {/* Barra de busca e filtros */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por título ou local..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition-colors text-sm"
            />
          </div>
          
          <div className="flex gap-2 items-center">
            <Filter size={14} className="text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none transition-colors"
            >
              <option value="all">Todos os eventos</option>
              <option value="upcoming">Próximos eventos</option>
              <option value="past">Eventos passados</option>
            </select>
            
            <div className="flex gap-1 ml-2 border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition-all ${viewMode === "list" ? "bg-primary text-white" : "text-muted-foreground hover:bg-white/5"}`}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 transition-all ${viewMode === "grid" ? "bg-primary text-white" : "text-muted-foreground hover:bg-white/5"}`}
              >
                <Grid3x3 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Eventos */}
      <section className="px-6 py-6">
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Calendar size={48} className="text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Nenhum evento encontrado</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              {searchTerm || filterStatus !== "all" 
                ? "Tente ajustar os filtros de busca" 
                : "Crie seu primeiro evento para começar"}
            </p>
          </div>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
            : "flex flex-col gap-3"
          }>
            {filteredEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
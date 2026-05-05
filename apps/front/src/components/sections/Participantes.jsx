import { useState, useEffect } from "react";
import { 
  Users, UserPlus, UserCheck, UserX, Crown, Shield, 
  Mail, Search, X, Trash2, Edit2, Send, User, Plus
} from "lucide-react";

/* ─── MODAL CONVIDAR ─── */
function InviteModal({ onClose, onInvite, loading }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MODERATOR");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!email.trim()) {
      setError("E-mail é obrigatório");
      return;
    }
    if (!email.includes("@")) {
      setError("E-mail inválido");
      return;
    }
    onInvite({ email, role });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-sidebar border border-purple-500/20 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Convidar pessoa</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1.5">
              E-mail <span className="text-purple-400">*</span>
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="usuario@exemplo.com"
                className="w-full bg-[#161f30] border border-purple-500/20 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60"
              />
            </div>
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1.5">
              Função
            </label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full bg-[#161f30] border border-purple-500/20 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-purple-500/60"
            >
              <option value="ORGANIZER">👑 Organizador</option>
              <option value="MODERATOR">🛡️ Moderador</option>
              <option value="ATTENDEE">👤 Participante</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-white/5">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-400 hover:text-white transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-1.5 text-sm font-bold text-white bg-primary rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
          >
            <Send size={14} />
            {loading ? "Enviando..." : "Enviar convite"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── MODAL REMOVER ─── */
function RemoveModal({ member, onClose, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-sidebar border border-red-500/20 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <UserX size={16} className="text-red-400" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">Remover pessoa</p>
            <p className="text-xs text-gray-500">Essa ação pode ser desfeita depois</p>
          </div>
        </div>

        <p className="text-sm text-gray-400 leading-relaxed mb-6 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
          Remover <strong className="text-white">{member.name || member.user?.name}</strong> do evento?
        </p>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-400 hover:text-white transition-colors">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-1.5 text-sm font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-all"
          >
            <Trash2 size={14} />
            {loading ? "Removendo..." : "Remover"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── LINHA DA TABELA ─── */
function MemberRow({ member, isCreator, canManage, onEditRole, onRemove }) {
  const getRoleBadge = () => {
    switch (member.role) {
      case "ORGANIZER":
        return { label: "Organizador", icon: Crown, color: "text-purple-400", bg: "bg-purple-400/10" };
      case "MODERATOR":
        return { label: "Moderador", icon: Shield, color: "text-blue-400", bg: "bg-blue-400/10" };
      default:
        return { label: "Participante", icon: UserCheck, color: "text-emerald-400", bg: "bg-emerald-400/10" };
    }
  };

  const badge = getRoleBadge();
  const BadgeIcon = badge.icon;

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-medium text-sm">
            {(member.name || member.user?.name || "U")[0].toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-white text-sm truncate">
              {member.name || member.user?.name}
            </p>
            {isCreator && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400">
                Criador
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {member.user?.email || member.email}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-1 px-2 py-1 rounded ${badge.bg}`}>
          <BadgeIcon size={12} className={badge.color} />
          <span className={`text-xs font-medium ${badge.color}`}>{badge.label}</span>
        </div>

        {canManage && !isCreator && (
          <div className="flex gap-1">
            <button
              onClick={() => onEditRole(member)}
              className="p-1.5 rounded hover:bg-white/5 transition-colors"
              title="Alterar função"
            >
              <Edit2 size={14} className="text-muted-foreground hover:text-white" />
            </button>
            <button
              onClick={() => onRemove(member)}
              className="p-1.5 rounded hover:bg-red-500/10 transition-colors"
              title="Remover"
            >
              <Trash2 size={14} className="text-muted-foreground hover:text-red-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── MODAL EDITAR FUNÇÃO ─── */
function EditRoleModal({ member, onClose, onUpdate, loading }) {
  const [role, setRole] = useState(member.role);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-sidebar border border-purple-500/20 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-lg font-bold text-white mb-4">Alterar função</h2>
        <p className="text-sm text-gray-400 mb-4">
          Usuário: <span className="text-purple-400">{member.name || member.user?.name}</span>
        </p>

        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="w-full bg-[#161f30] border border-purple-500/20 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-purple-500/60 mb-6"
        >
          <option value="ORGANIZER">👑 Organizador</option>
          <option value="MODERATOR">🛡️ Moderador</option>
          <option value="ATTENDEE">👤 Participante</option>
        </select>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-400 hover:text-white transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => onUpdate(member.id, role)}
            disabled={loading}
            className="px-4 py-1.5 text-sm font-bold text-white bg-primary rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── COMPONENTE PRINCIPAL ─── */
export default function Participantes({ eventId, eventData, onUpdate }) {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editRoleModalOpen, setEditRoleModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const isCreator = eventData?.creator?.id === eventData?.currentUserId;

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/team`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const list = data?.data?.team || data?.team || [];
        setTeam(list);
      }
    } catch (error) {
      console.error("Erro ao buscar equipe:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) fetchTeam();
  }, [eventId]);

  const handleInvite = async (inviteData) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/invite`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteData),
      });
      if (res.ok) {
        await fetchTeam();
        setInviteModalOpen(false);
        onUpdate?.();
      } else {
        const error = await res.json();
        alert(error.message || "Erro ao enviar convite");
      }
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditRole = async (userId, newRole) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/team/${userId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        await fetchTeam();
        setEditRoleModalOpen(false);
        setSelectedMember(null);
        onUpdate?.();
      }
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!selectedMember) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/team/${selectedMember.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        await fetchTeam();
        setRemoveModalOpen(false);
        setSelectedMember(null);
        onUpdate?.();
      }
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTeam = team.filter(member => {
    const name = (member.name || member.user?.name || "").toLowerCase();
    const email = (member.user?.email || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchesSearch = name.includes(search) || email.includes(search);
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const organizers = filteredTeam.filter(m => m.role === "ORGANIZER");
  const moderators = filteredTeam.filter(m => m.role === "MODERATOR");
  const attendees = filteredTeam.filter(m => m.role === "ATTENDEE");

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 gap-3">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-sm text-muted-foreground">Carregando equipe...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Equipe do Evento</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {team.length} pessoa(s) na equipe
          </p>
        </div>
        
        {isCreator && (
          <button
            onClick={() => setInviteModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:opacity-90 transition-all"
          >
            <UserPlus size={14} />
            Convidar
          </button>
        )}
      </div>

      {/* Busca e filtros */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#161f30] border border-purple-500/20 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60"
          />
        </div>
        
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-[#161f30] border border-purple-500/20 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-500/60"
        >
          <option value="all">Todas funções</option>
          <option value="ORGANIZER">Organizadores</option>
          <option value="MODERATOR">Moderadores</option>
          <option value="ATTENDEE">Participantes</option>
        </select>
      </div>

      {/* Lista de membros */}
      {filteredTeam.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-gray-700 rounded-lg text-center">
          <Users size={32} className="text-gray-600 mb-3" />
          <p className="text-white font-medium mb-1">Nenhum membro encontrado</p>
          <p className="text-sm text-gray-500">Adicione pessoas ao evento para começar</p>
        </div>
      ) : (
        <div className="bg-[#161f30]/30 rounded-lg border border-purple-500/10 overflow-hidden">
          {/* Organizadores */}
          {organizers.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-purple-500/5 border-b border-purple-500/10">
                <div className="flex items-center gap-2">
                  <Crown size={14} className="text-purple-400" />
                  <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Organizadores</span>
                  <span className="text-xs text-muted-foreground">({organizers.length})</span>
                </div>
              </div>
              <div className="divide-y divide-border">
                {organizers.map(member => (
                  <div key={member.id} className="px-4">
                    <MemberRow
                      member={member}
                      isCreator={member.role === "ORGANIZER" && team.indexOf(member) === 0}
                      canManage={isCreator}
                      onEditRole={(m) => { setSelectedMember(m); setEditRoleModalOpen(true); }}
                      onRemove={(m) => { setSelectedMember(m); setRemoveModalOpen(true); }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Moderadores */}
          {moderators.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-blue-500/5 border-b border-blue-500/10 border-t border-purple-500/10">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-blue-400" />
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Moderadores</span>
                  <span className="text-xs text-muted-foreground">({moderators.length})</span>
                </div>
              </div>
              <div className="divide-y divide-border">
                {moderators.map(member => (
                  <div key={member.id} className="px-4">
                    <MemberRow
                      member={member}
                      isCreator={false}
                      canManage={isCreator}
                      onEditRole={(m) => { setSelectedMember(m); setEditRoleModalOpen(true); }}
                      onRemove={(m) => { setSelectedMember(m); setRemoveModalOpen(true); }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Participantes */}
          {attendees.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-emerald-500/5 border-b border-emerald-500/10 border-t border-purple-500/10">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Participantes</span>
                  <span className="text-xs text-muted-foreground">({attendees.length})</span>
                </div>
              </div>
              <div className="divide-y divide-border">
                {attendees.map(member => (
                  <div key={member.id} className="px-4">
                    <MemberRow
                      member={member}
                      isCreator={false}
                      canManage={isCreator}
                      onEditRole={(m) => { setSelectedMember(m); setEditRoleModalOpen(true); }}
                      onRemove={(m) => { setSelectedMember(m); setRemoveModalOpen(true); }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modais */}
      {inviteModalOpen && (
        <InviteModal
          onClose={() => setInviteModalOpen(false)}
          onInvite={handleInvite}
          loading={actionLoading}
        />
      )}

      {editRoleModalOpen && selectedMember && (
        <EditRoleModal
          member={selectedMember}
          onClose={() => {
            setEditRoleModalOpen(false);
            setSelectedMember(null);
          }}
          onUpdate={handleEditRole}
          loading={actionLoading}
        />
      )}

      {removeModalOpen && selectedMember && (
        <RemoveModal
          member={selectedMember}
          onClose={() => {
            setRemoveModalOpen(false);
            setSelectedMember(null);
          }}
          onConfirm={handleRemove}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import {
  Users, UserPlus, UserX, Crown, Shield, UserCheck,
  Mail, Search, X, Send, AlertCircle, MoreVertical,
  Edit2, Trash2, Plus, Briefcase, User
} from "lucide-react";

const ROLE = {
  ORGANIZER: { label: "Organizador",  color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", Icon: Crown },
  MODERATOR: { label: "Moderador",    color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/20",   Icon: Shield },
  ATTENDEE:  { label: "Participante", color: "text-emerald-400",bg: "bg-emerald-400/10",border: "border-emerald-400/20",Icon: UserCheck },
  TEAM:      { label: "Membro",       color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20",  Icon: Briefcase }
};

/* ─── MODAL BASE ─── */
function Modal({ children, onClose, danger }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
      <div className={`relative bg-[#111827] border rounded-2xl p-8 w-full max-w-md shadow-2xl ${danger ? "border-red-500/20" : "border-purple-500/20"}`}>
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors">
          <X size={16} />
        </button>
        {children}
      </div>
    </div>
  );
}

/* ─── MODAL CONVIDAR MODERADOR (usuário existente) ─── */
function InviteModeratorModal({ onClose, onSubmit, loading }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (!email.trim() || !email.includes("@")) { 
      setError("E-mail inválido"); 
      return; 
    }
    onSubmit({ email, role: "MODERATOR" });
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-lg font-bold text-white mb-6">Convidar Moderador</h2>
      <p className="text-sm text-gray-400 mb-4">
        Convide um usuário existente para ser moderador do evento.
      </p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-1.5">
            E-mail <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(""); }}
              placeholder="usuario@exemplo.com"
              className="w-full bg-[#161f30] border border-purple-500/20 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60"
            />
          </div>
          {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
      </div>
      <div className="flex justify-end gap-2.5 mt-6 pt-5 border-t border-white/5">
        <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-400 border border-white/10 rounded-lg hover:text-white hover:border-purple-500/30">
          Cancelar
        </button>
        <button
          onClick={submit}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-gradient-to-br from-[#7c3aed] to-[#9333ea] rounded-lg shadow-[0_4px_14px_rgba(124,58,237,0.4)] hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Enviando..." : <><Send size={13} /> Convidar</>}
        </button>
      </div>
    </Modal>
  );
}

/* ─── MODAL ADICIONAR MEMBRO DA EQUIPE (usuário não precisa existir) ─── */
function AddTeamMemberModal({ onClose, onSubmit, loading }) {
  const [name, setName] = useState("");
  const [job, setJob] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (!name.trim()) { 
      setError("Nome é obrigatório"); 
      return; 
    }
    if (!job.trim()) { 
      setError("Função é obrigatória"); 
      return; 
    }
    onSubmit({ name, job, isExternal: true });
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-lg font-bold text-white mb-6">Adicionar Membro da Equipe</h2>
      <p className="text-sm text-gray-400 mb-4">
        Adicione um membro à equipe. Não precisa ser um usuário cadastrado.
      </p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-1.5">
            Nome <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(""); }}
              placeholder="Nome da pessoa"
              className="w-full bg-[#161f30] border border-purple-500/20 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-1.5">
            Função <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <Briefcase size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="ex: Palestrante, Organizador, Voluntário"
              className="w-full bg-[#161f30] border border-purple-500/20 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60"
            />
          </div>
        </div>
      </div>
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      <div className="flex justify-end gap-2.5 mt-6 pt-5 border-t border-white/5">
        <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-400 border border-white/10 rounded-lg hover:text-white hover:border-purple-500/30">
          Cancelar
        </button>
        <button
          onClick={submit}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-gradient-to-br from-[#7c3aed] to-[#9333ea] rounded-lg shadow-[0_4px_14px_rgba(124,58,237,0.4)] hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Adicionando..." : <><Plus size={13} /> Adicionar</>}
        </button>
      </div>
    </Modal>
  );
}

/* ─── MODAL EDITAR MEMBRO ─── */
function EditMemberModal({ member, onClose, onSubmit, loading }) {
  const [name, setName] = useState(member.name || member.user?.name || "");
  const [role, setRole] = useState(member.roleDescription || member.job || "");

  const submit = () => {
    onSubmit(member.id, { name, role });
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-lg font-bold text-white mb-6">Editar Membro</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-1.5">
            Nome
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-[#161f30] border border-purple-500/20 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/60"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-1.5">
            Função
          </label>
          <input
            type="text"
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder="ex: Palestrante, Organizador"
            className="w-full bg-[#161f30] border border-purple-500/20 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/60"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2.5 mt-6 pt-5 border-t border-white/5">
        <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-400 border border-white/10 rounded-lg hover:text-white hover:border-purple-500/30">
          Cancelar
        </button>
        <button
          onClick={submit}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-gradient-to-br from-[#7c3aed] to-[#9333ea] rounded-lg shadow-[0_4px_14px_rgba(124,58,237,0.4)] hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Salvando..." : <><Edit2 size={13} /> Salvar</>}
        </button>
      </div>
    </Modal>
  );
}

/* ─── MODAL REMOVER ─── */
function RemoveModal({ member, onClose, onConfirm, loading }) {
  const name = member.user?.name || member.name || "Usuário";

  return (
    <Modal onClose={onClose} danger>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertCircle size={15} className="text-red-400" />
        </div>
        <div>
          <p className="font-bold text-white text-sm">Remover da equipe</p>
          <p className="text-xs text-gray-500">Essa ação pode ser desfeita depois</p>
        </div>
      </div>
      <p className="text-sm text-gray-400 leading-relaxed mb-6 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
        Remover <strong className="text-white">{name}</strong> da equipe do evento?
      </p>
      <div className="flex justify-end gap-2.5">
        <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-400 border border-white/10 rounded-lg hover:text-white hover:border-purple-500/30">
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-br from-red-600 to-red-400 rounded-lg shadow-[0_4px_14px_rgba(248,113,113,0.3)] hover:opacity-90 disabled:opacity-50"
        >
          <UserX size={13} /> {loading ? "Removendo..." : "Remover"}
        </button>
      </div>
    </Modal>
  );
}

/* ─── MEMBER ROW ─── */
function MemberRow({ member, isCreator, canManage, onEdit, onRemove }) {
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Define qual tipo de membro (MODERATOR, TEAM ou ATTENDEE)
  let roleConfig;
  if (member.role === "MODERATOR") {
    roleConfig = ROLE.MODERATOR;
  } else if (member.role === "TEAM" || member.isExternal || member.roleDescription) {
    roleConfig = ROLE.TEAM;
  } else {
    roleConfig = ROLE.ATTENDEE;
  }
  
  const { Icon: RoleIcon } = roleConfig;
  const name = member.user?.name || member.name || "Usuário";
  const email = member.user?.email || member.email || "";
  const roleDescription = member.roleDescription || member.job || "";
  const displayRole = roleDescription || roleConfig.label;
  const initial = name[0].toUpperCase();

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-lg border-b border-white/[0.04] hover:bg-purple-500/[0.03] transition-colors">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-md">
          {initial}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold text-[#e2e0f0] truncate">{name}</span>
            {isCreator && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shrink-0">
                Criador
              </span>
            )}
          </div>
          {email && <span className="text-xs text-[#6b6888] truncate block">{email}</span>}
          {displayRole && !email && (
            <span className="text-xs text-[#6b6888] truncate block">{displayRole}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border ${roleConfig.color} ${roleConfig.bg} ${roleConfig.border}`}>
          <RoleIcon size={10} strokeWidth={2} />
          {displayRole}
        </span>

        {canManage && !isCreator && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-md text-[#2e2c42] hover:text-[#e2e0f0] hover:bg-white/5 transition-colors"
            >
              <MoreVertical size={14} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-1 w-36 rounded-lg bg-[#0c0e18] border border-purple-500/20 shadow-xl overflow-hidden z-20">
                  <button
                    onClick={() => { onEdit(member); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#6b6888] hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Edit2 size={11} /> Editar
                  </button>
                  <button
                    onClick={() => { onRemove(member); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={11} /> Remover
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── SECTION HEADER ─── */
function SectionHeader({ label, count, dot }) {
  return (
    <div className="flex items-center gap-2 mb-2 mt-4 first:mt-0">
      <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span className="text-[10.5px] font-bold text-[#6b6888] tracking-widest uppercase">
        {label} ({count})
      </span>
    </div>
  );
}

/* ─── MAIN ─── */
export default function Participantes({ eventId, eventData, onUpdate }) {
  const [organizer, setOrganizer] = useState(null);
  const [moderators, setModerators] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  
  const [inviteModeratorOpen, setInviteModeratorOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [removeTarget, setRemoveTarget] = useState(null);

  const canManage = eventData?.isOwner ?? true;

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/members`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const list = data?.data?.team || data?.team || [];
        
        // Organizador (apenas um - o criador)
        const org = list.find(m => m.role === "ORGANIZER");
        setOrganizer(org || null);
        
        // Moderadores (usuários convidados)
        setModerators(list.filter(m => m.role === "MODERATOR"));
        
        // Membros da equipe (adicionados manualmente, sem usuário)
        setTeamMembers(list.filter(m => m.role === "TEAM" || m.isExternal || m.roleDescription));
      }
    } catch (err) {
      console.error("Erro ao buscar equipe:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (eventId) fetchTeam(); }, [eventId]);

  const handleInviteModerator = async (payload) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/invite`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) { await fetchTeam(); setInviteModeratorOpen(false); onUpdate?.(); }
      else { const d = await res.json(); alert(d.message || "Erro ao convidar"); }
    } catch (err) { console.error(err); }
    finally { setActionLoading(false); }
  };

  const handleAddTeamMember = async (payload) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/members`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, role: "TEAM" }),
      });
      if (res.ok) { await fetchTeam(); setAddMemberOpen(false); onUpdate?.(); }
      else { const d = await res.json(); alert(d.message || "Erro ao adicionar"); }
    } catch (err) { console.error(err); }
    finally { setActionLoading(false); }
  };

  const handleEditMember = async (memberId, data) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/team/${memberId}`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) { await fetchTeam(); setEditTarget(null); onUpdate?.(); }
    } catch (err) { console.error(err); }
    finally { setActionLoading(false); }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/team/${removeTarget.id}`, {
        method: "DELETE", credentials: "include",
      });
      if (res.ok) { await fetchTeam(); setRemoveTarget(null); onUpdate?.(); }
    } catch (err) { console.error(err); }
    finally { setActionLoading(false); }
  };

  const matchesSearch = (m) => {
    const q = search.toLowerCase();
    if (!q) return true;
    const name = (m.user?.name || m.name || "").toLowerCase();
    const email = (m.user?.email || m.email || "").toLowerCase();
    const roleDesc = (m.roleDescription || m.job || "").toLowerCase();
    return name.includes(q) || email.includes(q) || roleDesc.includes(q);
  };

  const filteredModerators = moderators.filter(matchesSearch);
  const filteredTeamMembers = teamMembers.filter(matchesSearch);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 gap-3">
        <div className="w-5 h-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        <span className="text-sm text-[#6b6888]">Carregando equipe...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-bold text-[#e2e0f0] text-lg tracking-tight mb-1">Equipe do Evento</h2>
          <p className="text-sm text-[#6b6888]">Gerencie organizadores, moderadores e sua equipe</p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <button
              onClick={() => setInviteModeratorOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-[0_4px_14px_rgba(59,130,246,0.4)] hover:opacity-90 transition-all"
            >
              <Shield size={14} /> Convidar Moderador
            </button>
            <button
              onClick={() => setAddMemberOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg shadow-[0_4px_14px_rgba(249,115,22,0.4)] hover:opacity-90 transition-all"
            >
              <Briefcase size={14} /> Adicionar Membro
            </button>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-purple-400/10 border border-purple-400/10 rounded-lg p-4 text-center">
          <Crown size={16} className="text-purple-400 mx-auto mb-2" />
          <p className="text-xl font-bold text-[#e2e0f0]">{organizer ? 1 : 0}</p>
          <p className="text-xs text-[#6b6888] mt-0.5">Organizador</p>
        </div>
        <div className="bg-blue-400/10 border border-blue-400/10 rounded-lg p-4 text-center">
          <Shield size={16} className="text-blue-400 mx-auto mb-2" />
          <p className="text-xl font-bold text-[#e2e0f0]">{moderators.length}</p>
          <p className="text-xs text-[#6b6888] mt-0.5">Moderadores</p>
        </div>
        <div className="bg-orange-400/10 border border-orange-400/10 rounded-lg p-4 text-center">
          <Briefcase size={16} className="text-orange-400 mx-auto mb-2" />
          <p className="text-xl font-bold text-[#e2e0f0]">{teamMembers.length}</p>
          <p className="text-xs text-[#6b6888] mt-0.5">Membros da Equipe</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2e2c42]" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome, e-mail ou função..."
          className="w-full bg-[#0c0e18] border border-white/[0.06] rounded-lg pl-9 pr-8 py-2 text-sm text-[#e2e0f0] placeholder-[#2e2c42] outline-none focus:border-purple-500/40"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#2e2c42] hover:text-white">
            <X size={12} />
          </button>
        )}
      </div>

      {/* Organizador */}
      {organizer && matchesSearch(organizer) && (
        <>
          <SectionHeader label="Organizador" count={1} dot="bg-purple-400" />
          <MemberRow 
            member={organizer} 
            isCreator={true} 
            canManage={false} 
            onEdit={setEditTarget} 
            onRemove={setRemoveTarget} 
          />
        </>
      )}

      {/* Moderadores */}
      {filteredModerators.length > 0 && (
        <>
          <SectionHeader label="Moderadores" count={filteredModerators.length} dot="bg-blue-400" />
          {filteredModerators.map(m => (
            <MemberRow 
              key={m.id} 
              member={m} 
              isCreator={false} 
              canManage={canManage} 
              onEdit={setEditTarget} 
              onRemove={setRemoveTarget} 
            />
          ))}
        </>
      )}

      {/* Membros da Equipe */}
      {filteredTeamMembers.length > 0 && (
        <>
          <SectionHeader label="Membros da Equipe" count={filteredTeamMembers.length} dot="bg-orange-400" />
          {filteredTeamMembers.map(m => (
            <MemberRow 
              key={m.id} 
              member={m} 
              isCreator={false} 
              canManage={canManage} 
              onEdit={setEditTarget} 
              onRemove={setRemoveTarget} 
            />
          ))}
        </>
      )}

      {/* Empty state */}
      {filteredModerators.length === 0 && filteredTeamMembers.length === 0 && !organizer && (
        <div className="flex flex-col items-center justify-center py-14 border border-dashed border-white/10 rounded-xl text-center mt-3">
          <Users size={28} className="text-[#2e2c42] mb-3" />
          <p className="font-bold text-[#e2e0f0] text-sm mb-1">Nenhum membro na equipe</p>
          <p className="text-xs text-[#6b6888]">Adicione moderadores ou membros para começar</p>
        </div>
      )}

      {/* Modais */}
      {inviteModeratorOpen && (
        <InviteModeratorModal 
          onClose={() => setInviteModeratorOpen(false)} 
          onSubmit={handleInviteModerator} 
          loading={actionLoading} 
        />
      )}
      
      {addMemberOpen && (
        <AddTeamMemberModal 
          onClose={() => setAddMemberOpen(false)} 
          onSubmit={handleAddTeamMember} 
          loading={actionLoading} 
        />
      )}
      
      {editTarget && (
        <EditMemberModal 
          member={editTarget} 
          onClose={() => setEditTarget(null)} 
          onSubmit={handleEditMember} 
          loading={actionLoading} 
        />
      )}
      
      {removeTarget && (
        <RemoveModal 
          member={removeTarget} 
          onClose={() => setRemoveTarget(null)} 
          onConfirm={handleRemove} 
          loading={actionLoading} 
        />
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import {
  Users, UserPlus, UserX, Crown, Shield, UserCheck,
  Mail, Search, X, Send, AlertCircle, MoreVertical,
  Trash2, Mic2, BookOpen, Star, Briefcase,
} from "lucide-react";

const TEAM_ROLES = [
  { value: "SPEAKER",    label: "Palestrante", color: "text-violet-400",  bg: "bg-violet-400/10",  border: "border-violet-400/20",  Icon: Mic2      },
  { value: "STAFF",      label: "Staff",       color: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/20",    Icon: Briefcase },
  { value: "VOLUNTEER",  label: "Voluntário",  color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", Icon: Star      },
  { value: "INSTRUCTOR", label: "Instrutor",   color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/20",   Icon: BookOpen  },
  { value: "OTHER",      label: "Outro",       color: "text-gray-400",    bg: "bg-gray-400/10",    border: "border-gray-400/20",    Icon: Users     },
];

const ROLE_CONFIG = {
  ORGANIZER: { label: "Organizador",  color: "text-yellow-400",  bg: "bg-yellow-400/10",  border: "border-yellow-400/20",  Icon: Crown     },
  MODERATOR: { label: "Moderador",    color: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/20",    Icon: Shield    },
  ATTENDEE:  { label: "Participante", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", Icon: UserCheck },
  ...Object.fromEntries(TEAM_ROLES.map(r => [r.value, r])),
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

/* ─── MODAL CONVIDAR MODERADOR ─── */
function InviteModeratorModal({ onClose, onSubmit, loading }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (!email.trim() || !email.includes("@")) { setError("E-mail inválido"); return; }
    onSubmit({ email, role: "MODERATOR" });
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-blue-400/10 border border-blue-400/20 flex items-center justify-center shrink-0">
          <Shield size={15} className="text-blue-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">Convidar moderador</h2>
          <p className="text-xs text-gray-500">O usuário precisa ter conta no e-cert</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-1.5">
          E-mail <span className="text-purple-400">*</span>
        </label>
        <div className="relative">
          <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(""); }}
            placeholder="usuario@exemplo.com"
            className="w-full bg-[#161f30] border border-purple-500/20 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60 transition-colors"
          />
        </div>
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        <p className="text-xs text-[#6b6888] mt-2 leading-relaxed">
          O moderador terá acesso para gerenciar participantes e emitir certificados.
        </p>
      </div>

      <div className="flex justify-end gap-2.5 mt-6 pt-5 border-t border-white/5">
        <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-400 border border-white/10 rounded-lg hover:text-white hover:border-purple-500/30 transition-all">
          Cancelar
        </button>
        <button
          onClick={submit}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-gradient-to-br from-[#7c3aed] to-[#9333ea] rounded-lg shadow-[0_4px_14px_rgba(124,58,237,0.4)] hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {loading ? "Enviando..." : <><Send size={13} /> Enviar convite</>}
        </button>
      </div>
    </Modal>
  );
}

/* ─── MODAL ADICIONAR MEMBRO DE EQUIPE ─── */
function AddTeamMemberModal({ onClose, onSubmit, loading }) {
  const [name, setName] = useState("");
  const [job, setJob] = useState("");
  const [nameError, setNameError] = useState("");
  const [jobError, setJobError] = useState("");

  const submit = () => {
    let hasError = false;
    
    if (!name.trim()) { 
      setNameError("Nome é obrigatório"); 
      hasError = true; 
    }
    
    if (!job.trim()) { 
      setJobError("Função é obrigatória"); 
      hasError = true; 
    }
    
    if (hasError) return;
    
    onSubmit({ name: name.trim(), job: job.trim() });
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-purple-400/10 border border-purple-400/20 flex items-center justify-center shrink-0">
          <UserPlus size={15} className="text-purple-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">Adicionar membro da equipe</h2>
          <p className="text-xs text-gray-500">Adicione palestrantes, staff, voluntários, etc.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-1.5">
            Nome completo <span className="text-purple-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setNameError(""); }}
            placeholder="ex: Maria Silva"
            className="w-full bg-[#161f30] border border-purple-500/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60 transition-colors"
          />
          {nameError && <p className="text-xs text-red-400 mt-1">{nameError}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-1.5">
            Função <span className="text-purple-400">*</span>
          </label>
          <input
            type="text"
            value={job}
            onChange={e => { setJob(e.target.value); setJobError(""); }}
            placeholder="ex: Palestrante, Staff, Voluntário, Instrutor"
            className="w-full bg-[#161f30] border border-purple-500/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60 transition-colors"
          />
          {jobError && <p className="text-xs text-red-400 mt-1">{jobError}</p>}
          <p className="text-xs text-[#6b6888] mt-2 leading-relaxed">
            Defina a função que esta pessoa terá na equipe do evento.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2.5 mt-6 pt-5 border-t border-white/5">
        <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-400 border border-white/10 rounded-lg hover:text-white hover:border-purple-500/30 transition-all">
          Cancelar
        </button>
        <button
          onClick={submit}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-gradient-to-br from-[#7c3aed] to-[#9333ea] rounded-lg shadow-[0_4px_14px_rgba(124,58,237,0.4)] hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {loading ? "Adicionando..." : <><UserPlus size={13} /> Adicionar</>}
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
        <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
          <AlertCircle size={15} className="text-red-400" />
        </div>
        <div>
          <p className="font-bold text-white text-sm">Remover membro</p>
          <p className="text-xs text-gray-500">Essa ação pode ser desfeita depois</p>
        </div>
      </div>
      <p className="text-sm text-gray-400 leading-relaxed mb-6 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
        Você está prestes a remover <strong className="text-white">{name}</strong> do evento.
      </p>
      <div className="flex justify-end gap-2.5">
        <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-400 border border-white/10 rounded-lg hover:text-white hover:border-purple-500/30 transition-all">
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg  hover:opacity-90 disabled:opacity-50 transition-all"
        >
          <UserX size={13} /> {loading ? "Removendo..." : "Remover"}
        </button>
      </div>
    </Modal>
  );
}

/* ─── MEMBER ROW ─── */
function MemberRow({ member, isOrganizer, canManage, onRemove }) {
  const roleConfig = ROLE_CONFIG[member.role] || ROLE_CONFIG.OTHER;
  const { Icon: RoleIcon } = roleConfig;
  const [menuOpen, setMenuOpen] = useState(false);
  
  // PRIORIZAR os dados do membro (não do user)
  const name = member.name || member.user?.name || "Usuário";
  const email = member.user?.email || member.email || null;
  const job = member.job || member.roleDescription || roleConfig.label;
  const initial = name[0].toUpperCase();
  const joined = member.createdAt
    ? new Date(member.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
    : "—";
  
  const isSystemUser = !!(member.userId && (member.user?.email || member.email));
  const isExternal = !member.userId && member.name;

  return (
    <div
      className="grid items-center gap-3 px-4 py-3 rounded-lg border-b border-white/[0.04] hover:bg-purple-500/[0.03] transition-colors"
      style={{ gridTemplateColumns: "minmax(200px, 1fr) minmax(100px, 130px) 90px 36px" }}
    >
      <div className="flex items-center gap-3 min-w-0 overflow-hidden">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-md ${isSystemUser ? "bg-gradient-to-br from-purple-500 to-purple-700" : "bg-[#1e2030]"}`}>
          {initial}
        </div>
        <div className="min-w-0 overflow-hidden">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold text-[#e2e0f0] truncate" title={name}>{name}</span>
            {isOrganizer && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shrink-0">
                Criador
              </span>
            )}
            {isExternal && !isOrganizer && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/[0.04] text-[#6b6888] border border-white/[0.06] shrink-0">
                Externo
              </span>
            )}

          </div>
          
        </div>
      </div>

      <div className="min-w-0 overflow-hidden">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border whitespace-nowrap ${roleConfig.color} ${roleConfig.bg} ${roleConfig.border}`} title={job}>
          <RoleIcon size={10} strokeWidth={2} />
          <span className="truncate">{job}</span>
        </span>
      </div>

      <span className="text-xs text-[#6b6888] shrink-0">{joined}</span>

      <div className="flex justify-end shrink-0">
        {canManage && !isOrganizer ? (
          <div className="relative">
            <button onClick={() => setMenuOpen(v => !v)} className="p-1.5 rounded-md text-[#2e2c42] hover:text-[#e2e0f0] hover:bg-white/5 transition-colors">
              <MoreVertical size={14} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute  right-0 mt-1 w-32 rounded-lg bg-[#0c0e18] border border-purple-500/20 shadow-xl overflow-hidden z-20">
                  <button onClick={() => { onRemove(member); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 size={11} /> Remover
                  </button>
                </div>
              </>
            )}
          </div>
        ) : <span className="w-5" />}
      </div>
    </div>
  );
}

/* ─── SECTION BLOCK ─── */
function Section({ title, subtitle, dot, accentBorder, headerAction, children, emptyLabel }) {
  return (
    <div className="border border-white/[0.06] rounded-xl overflow-hidden">
      <div className={`flex items-center justify-between px-5 py-3.5 bg-[#0c0e18] border-b border-white/[0.06] border-l-2 ${accentBorder}`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full ${dot}`} />
          <span className="text-sm font-bold text-[#e2e0f0]">{title}</span>
          {subtitle && <span className="text-xs text-[#6b6888]">{subtitle}</span>}
        </div>
        {headerAction}
      </div>

      <div className="grid px-4 py-2 border-b border-white/[0.04] bg-[#0c0e18]/50"
        style={{ gridTemplateColumns: "minmax(200px, 1fr) minmax(100px, 130px) 90px 36px" }}>
        {["Membro", "Função", "Adicionado", ""].map(h => (
          <span key={h} className="text-[10px] font-bold text-[#6b6888] tracking-widest uppercase">{h}</span>
        ))}
      </div>

      {children}

      {emptyLabel && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Users size={22} className="text-[#2e2c42] mb-2" strokeWidth={1.5} />
          <p className="text-xs text-[#6b6888]">{emptyLabel}</p>
        </div>
      )}
    </div>
  );
}

/* ─── MAIN ─── */
export default function ParticipantesTab({ eventId, eventData }) {
  const [organizer, setOrganizer] = useState(null);
  const [moderators, setModerators] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [inviteModOpen, setInviteModOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);

  const canManage = eventData?.isOwner ?? true;

  // Buscar moderadores
  const fetchModerators = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/moderators`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const moderatorsList = data?.data?.moderators || data?.moderators || [];
        setModerators(moderatorsList);
      }
    } catch (err) {
      console.error("Erro ao buscar moderadores:", err);
    }
  };

  // Buscar membros da equipe e participantes
  const fetchTeamAndParticipants = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/members`, { credentials: "include" });
      
      if (res.ok) {
        const data = await res.json();
        console.log(data)
        const teamList = data?.data?.team || data?.team || [];
        
        const org = teamList.find(m => m.role === "ORGANIZER");
        setOrganizer(org || null);
        
        setTeamMembers(teamList.filter(m => !["ORGANIZER", "MODERATOR", "ATTENDEE"].includes(m.role)));
        setAttendees(teamList.filter(m => m.role === "ATTENDEE"));
      }
    } catch (err) {
      console.error("Erro ao buscar equipe:", err);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchModerators(),
      fetchTeamAndParticipants()
    ]);
    setLoading(false);
  };

  useEffect(() => { 
    if (eventId) fetchAll(); 
  }, [eventId]);

  const handleInviteModerator = async (payload) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/moderators`, {
        method: "POST", 
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) { 
        await fetchModerators(); 
        setInviteModOpen(false); 
      } else { 
        const d = await res.json(); 
        alert(d.message || "Erro ao convidar"); 
      }
    } catch (err) { 
      console.error(err); 
    } finally { 
      setActionLoading(false); 
    }
  };

  const handleAddTeamMember = async (payload) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/members`, {
        method: "POST", 
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) { 
        await fetchTeamAndParticipants(); 
        setAddMemberOpen(false); 
      } else { 
        const d = await res.json(); 
        alert(d.message || "Erro ao adicionar membro"); 
      }
    } catch (err) { 
      console.error(err); 
    } finally { 
      setActionLoading(false); 
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    setActionLoading(true);
    try {
      const isModerator = removeTarget.role === "MODERATOR";
      const url = isModerator 
        ? `/api/events/${eventId}/moderators/${removeTarget.id}`
        : `/api/events/${eventId}/members/${removeTarget.id}`;
      
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (res.ok) { 
        await fetchAll(); 
        setRemoveTarget(null); 
      }
    } catch (err) { 
      console.error(err); 
    } finally { 
      setActionLoading(false); 
    }
  };

  const q = search.toLowerCase();
  const matches = (m) =>
    (m.name || m.user?.name || "").toLowerCase().includes(q) ||
    (m.email || m.user?.email || "").toLowerCase().includes(q) ||
    (m.job || m.roleDescription || "").toLowerCase().includes(q);

  const filteredModerators = moderators.filter(matches);
  const filteredTeamMembers = teamMembers.filter(matches);
  const filteredAttendees = attendees.filter(matches);

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
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-bold text-[#e2e0f0] text-lg tracking-tight mb-1">Equipe & Participantes</h2>
          <p className="text-sm text-[#6b6888]">Gerencie organizador, moderadores, equipe e participantes</p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <button
              onClick={() => setAddMemberOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-[#e2e0f0] bg-[#111827] border border-white/[0.08] rounded-lg hover:border-purple-500/30 hover:text-white transition-all"
            >
              <UserPlus size={14} /> Equipe
            </button>
            <button
              onClick={() => setInviteModOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-white bg-gradient-to-br from-[#7c3aed] to-[#9333ea] rounded-lg shadow-[0_4px_14px_rgba(124,58,237,0.4)] hover:opacity-90 transition-all"
            >
              <Shield size={14} /> Moderador
            </button>
          </div>
        )}
      </div>

      <div className="relative mb-6">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2e2c42] pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filtrar por nome, e-mail ou função..."
          className="w-full bg-[#0c0e18] border border-white/[0.06] rounded-lg pl-9 pr-8 py-2 text-sm text-[#e2e0f0] placeholder-[#2e2c42] outline-none focus:border-purple-500/40 transition-colors"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#2e2c42] hover:text-white">
            <X size={12} />
          </button>
        )}
      </div>

      <div className="space-y-5">


        {/* MODERADORES */}
        <Section
          title="Moderadores"
          subtitle={`${filteredModerators.length} membro${filteredModerators.length !== 1 ? "s" : ""}`}
          dot="bg-blue-400"
          accentBorder="border-l-blue-400/50"
          headerAction={
            canManage && (
              <button
                onClick={() => setInviteModOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-400 bg-blue-400/10 border border-blue-400/20 rounded-lg hover:bg-blue-400/20 transition-all"
              >
                <Send size={11} /> Convidar
              </button>
            )
          }
        >
          {filteredModerators.length > 0 ? (
            filteredModerators.map(m => (
              <MemberRow key={m.id} member={m} isOrganizer={false} canManage={canManage} onRemove={setRemoveTarget} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Shield size={20} className="text-[#2e2c42] mb-2" strokeWidth={1.5} />
              <p className="text-xs text-[#6b6888]">
                {search ? "Nenhum moderador encontrado" : "Nenhum moderador convidado ainda"}
              </p>
            </div>
          )}
        </Section>

        {/* EQUIPE */}
        <Section
          title="Equipe"
          subtitle={`${filteredTeamMembers.length} membro${filteredTeamMembers.length !== 1 ? "s" : ""}`}
          dot="bg-violet-400"
          accentBorder="border-l-violet-400/50"
          headerAction={
            canManage && (
              <button
                onClick={() => setAddMemberOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-violet-400 bg-violet-400/10 border border-violet-400/20 rounded-lg hover:bg-violet-400/20 transition-all"
              >
                <UserPlus size={11} /> Adicionar
              </button>
            )
          }
        >
          {filteredTeamMembers.length > 0 ? (
            filteredTeamMembers.map(m => (
              <MemberRow key={m.id} member={m} isOrganizer={false} canManage={canManage} onRemove={setRemoveTarget} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Mic2 size={20} className="text-[#2e2c42] mb-2" strokeWidth={1.5} />
              <p className="text-xs text-[#6b6888]">
                {search ? "Nenhum membro encontrado" : "Nenhum membro de equipe adicionado ainda"}
              </p>
            </div>
          )}
        </Section>

        {/* PARTICIPANTES */}
        <Section
          title="Participantes"
          subtitle={`${filteredAttendees.length} inscrito${filteredAttendees.length !== 1 ? "s" : ""}`}
          dot="bg-emerald-400"
          accentBorder="border-l-emerald-400/50"
        >
          {filteredAttendees.length > 0 ? (
            filteredAttendees.map(m => (
              <MemberRow key={m.id} member={m} isOrganizer={false} canManage={canManage} onRemove={setRemoveTarget} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users size={20} className="text-[#2e2c42] mb-2" strokeWidth={1.5} />
              <p className="text-xs text-[#6b6888]">
                {search ? "Nenhum participante encontrado" : "Nenhum participante inscrito ainda"}
              </p>
            </div>
          )}
        </Section>
      </div>

      {inviteModOpen && (
        <InviteModeratorModal onClose={() => setInviteModOpen(false)} onSubmit={handleInviteModerator} loading={actionLoading} />
      )}
      {addMemberOpen && (
        <AddTeamMemberModal onClose={() => setAddMemberOpen(false)} onSubmit={handleAddTeamMember} loading={actionLoading} />
      )}
      {removeTarget && (
        <RemoveModal member={removeTarget} onClose={() => setRemoveTarget(null)} onConfirm={handleRemove} loading={actionLoading} />
      )}
    </div>
  );
}
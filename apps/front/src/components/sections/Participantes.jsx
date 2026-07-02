// sections/Participantes.jsx
import { useState, useEffect, useCallback } from "react";
import {
  Users, UserPlus, UserX, Crown, Shield, UserCheck,
  Mail, Search, X, Send, AlertCircle, MoreVertical,
  Trash2, Mic2, BookOpen, Star, Briefcase, Edit2,
  CheckSquare, ShieldCheck, Save,
  User
} from "lucide-react";

/* ─── ROLE CONFIGS (função/job) ─── */
const ROLE_CONFIG = {
  ORGANIZER: { label: "Organizador",  color: "text-yellow-400",  bg: "bg-yellow-500/10",  border: "border-yellow-500/20",  Icon: Crown     },
  MODERATOR: { label: "Moderador",    color: "text-purple-400",   bg: "bg-purple-500/10",   border: "border-purple-500/20",   Icon: Shield    },
  ATTENDEE:  { label: "Participante", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", Icon: UserCheck },
  SPEAKER:   { label: "Palestrante",  color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20",    Icon: Mic2      },
  STAFF:     { label: "Staff",        color: "text-cyan-400",    bg: "bg-cyan-500/10",    border: "border-cyan-500/20",    Icon: Briefcase },
  VOLUNTEER: { label: "Voluntário",   color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", Icon: Star      },
  INSTRUCTOR:{ label: "Instrutor",    color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20",   Icon: BookOpen  },
  OTHER:     { label: "Outro",        color: "text-gray-400",    bg: "bg-gray-500/10",    border: "border-gray-500/20",    Icon: Users     },
};

/* ─── PERMISSIONS (MEMBER / CHECKIN) ─── */
const PERMISSION_OPTIONS = [
  { value: "MEMBER", label: "Membro", icon: User, color: "text-blue-400", bg: "bg-blue-500/10" },
  { value: "CHECKIN", label: "Checkin", icon: ShieldCheck, color: "text-indigo-400", bg: "bg-indigo-500/10" },
];

/* ─── MODAL BASE ─── */
function Modal({ children, onClose, danger }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
      <div className={`relative bg-[#13111e] border rounded-2xl p-8 w-full max-w-md shadow-2xl ${danger ? "border-red-500/20" : "border-purple-500/20"}`}>
        <button onClick={onClose} className="absolute top-5 cursor-pointer right-5 text-gray-500 hover:text-white transition-colors">
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
        <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
          <Shield size={15} className="text-purple-400" />
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
            className="w-full bg-[#0f0d1a] border border-purple-500/20 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60 transition-colors"
          />
        </div>
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        <p className="text-xs text-[#6b6888] mt-2 leading-relaxed">
          O moderador terá acesso para gerenciar participantes e emitir certificados.
        </p>
      </div>

      <div className="flex justify-end gap-2.5 mt-6 pt-5 border-t border-white/5">
        <button onClick={onClose} className="px-4 py-2 cursor-pointer text-sm font-bold text-gray-400 border border-white/10 rounded-lg hover:text-white hover:border-purple-500/30 transition-all">
          Cancelar
        </button>
        <button
          onClick={submit}
          disabled={loading}
          className="flex items-center gap-2 cursor-pointer px-5 py-2 text-sm font-bold text-white bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg shadow-[0_4px_14px_rgba(124,58,237,0.4)] hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {loading ? "Enviando..." : <><Send size={13} /> Enviar convite</>}
        </button>
      </div>
    </Modal>
  );
}

/* ─── MODAL CONVIDAR MEMBRO DA EQUIPE (com permissão) ─── */
function AddTeamMemberModal({ onClose, onSubmit, loading }) {
  const [email, setEmail] = useState("");
  const [job, setJob] = useState("");
  const [permission, setPermission] = useState("MEMBER");
  const [emailError, setEmailError] = useState("");
  const [jobError, setJobError] = useState("");

  const submit = () => {
    let hasError = false;
    if (!email.trim() || !email.includes("@")) { setEmailError("E-mail inválido"); hasError = true; }
    if (!job.trim()) { setJobError("Função é obrigatória"); hasError = true; }
    if (hasError) return;
    onSubmit({ email: email.trim().toLowerCase(), job: job.trim(), permission });
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
          <UserPlus size={15} className="text-purple-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">Convidar membro da equipe</h2>
          <p className="text-xs text-gray-500">O usuário receberá um e-mail com instruções</p>
        </div>
      </div>

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
              onChange={e => { setEmail(e.target.value); setEmailError(""); }}
              placeholder="usuario@exemplo.com"
              className="w-full bg-[#0f0d1a] border border-purple-500/20 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60 transition-colors"
            />
          </div>
          {emailError && <p className="text-xs text-red-400 mt-1">{emailError}</p>}
          <p className="text-xs text-[#6b6888] mt-2 leading-relaxed">
            Se o usuário não tiver conta, uma será criada automaticamente.
          </p>
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
            className="w-full bg-[#0f0d1a] border border-purple-500/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60 transition-colors"
          />
          {jobError && <p className="text-xs text-red-400 mt-1">{jobError}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-1.5">
            Permissão
          </label>
          <select
            value={permission}
            onChange={e => setPermission(e.target.value)}
            className="w-full bg-[#0f0d1a] border border-purple-500/20 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/60 transition-colors"
          >
            {PERMISSION_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <p className="text-xs text-[#6b6888] mt-1">
            {permission === "CHECKIN" ? "Poderá realizar check-in de participantes." : "Membro comum da equipe."}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2.5 mt-6 pt-5 border-t border-white/5">
        <button onClick={onClose} className="px-4 py-2 cursor-pointer text-sm font-bold text-gray-400 border border-white/10 rounded-lg hover:text-white hover:border-purple-500/30 transition-all">
          Cancelar
        </button>
        <button
          onClick={submit}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2 cursor-pointer text-sm font-bold text-white bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg shadow-[0_4px_14px_rgba(124,58,237,0.4)] hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {loading ? "Convidando..." : <><Send size={13} /> Convidar</>}
        </button>
      </div>
    </Modal>
  );
}

/* ─── MODAL ADICIONAR PARTICIPANTE ─── */
function AddParticipantModal({ onClose, onSubmit, loading }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  const submit = () => {
    let hasError = false;
    if (!name.trim()) { setNameError("Nome é obrigatório"); hasError = true; }
    if (!email.trim() || !email.includes("@")) { setEmailError("E-mail inválido"); hasError = true; }
    if (hasError) return;
    onSubmit({ name: name.trim(), email: email.trim().toLowerCase() });
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <UserPlus size={15} className="text-emerald-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">Adicionar Participante</h2>
          <p className="text-xs text-gray-500">Adicione um participante ao evento</p>
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
            placeholder="ex: João Silva"
            className="w-full bg-[#0f0d1a] border border-purple-500/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60 transition-colors"
          />
          {nameError && <p className="text-xs text-red-400 mt-1">{nameError}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-1.5">
            E-mail <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setEmailError(""); }}
              placeholder="joao@exemplo.com"
              className="w-full bg-[#0f0d1a] border border-purple-500/20 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60 transition-colors"
            />
          </div>
          {emailError && <p className="text-xs text-red-400 mt-1">{emailError}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2.5 mt-6 pt-5 border-t border-white/5">
        <button onClick={onClose} className="px-4 py-2 cursor-pointer text-sm font-bold text-gray-400 border border-white/10 rounded-lg hover:text-white hover:border-purple-500/30 transition-all">
          Cancelar
        </button>
        <button
          onClick={submit}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2 cursor-pointer text-sm font-bold text-white bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg shadow-[0_4px_14px_rgba(16,185,129,0.4)] hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {loading ? "Adicionando..." : <><UserPlus size={13} /> Adicionar</>}
        </button>
      </div>
    </Modal>
  );
}

/* ─── MODAL EDITAR PERMISSÃO ─── */
function EditPermissionModal({ member, onClose, onUpdate, loading }) {
  const [permission, setPermission] = useState(member.permission || "MEMBER");

  const handleSubmit = () => {
    onUpdate(member.id, permission);
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
          <ShieldCheck size={15} className="text-indigo-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">Alterar permissão</h2>
          <p className="text-xs text-gray-500">{member.name || member.user?.name}</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-1.5">
          Permissão
        </label>
        <select
          value={permission}
          onChange={e => setPermission(e.target.value)}
          className="w-full bg-[#0f0d1a] border border-purple-500/20 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/60 transition-colors"
        >
          {PERMISSION_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <p className="text-xs text-[#6b6888] mt-2">
          {permission === "CHECKIN"
            ? "O usuário poderá realizar check-in de participantes."
            : "O usuário terá permissão de membro comum da equipe."}
        </p>
      </div>

      <div className="flex justify-end gap-2.5 mt-6 pt-5 border-t border-white/5">
        <button onClick={onClose} className="px-4 py-2 text-sm cursor-pointer font-bold text-gray-400 border border-white/10 rounded-lg hover:text-white hover:border-purple-500/30 transition-all">
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2 cursor-pointer text-sm font-bold text-white bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg shadow-[0_4px_14px_rgba(79,70,229,0.4)] hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {loading ? "Salvando..." : <><Save size={13} /> Salvar</>}
        </button>
      </div>
    </Modal>
  );
}

/* ─── MODAL REMOVER ─── */
function RemoveModal({ name, label = "membro", onClose, onConfirm, loading }) {
  return (
    <Modal onClose={onClose} danger>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
          <AlertCircle size={15} className="text-red-400" />
        </div>
        <div>
          <p className="font-bold text-white text-sm">Remover {label}</p>
          <p className="text-xs text-gray-500">Essa ação pode ser desfeita depois</p>
        </div>
      </div>
      <p className="text-sm text-gray-400 leading-relaxed mb-6 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
        Você está prestes a remover <strong className="text-white">{name}</strong> do evento.
      </p>
      <div className="flex justify-end gap-2.5">
        <button onClick={onClose} className="px-4 py-2 text-sm cursor-pointer font-bold text-gray-400 border border-white/10 rounded-lg hover:text-white hover:border-purple-500/30 transition-all">
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm cursor-pointer font-bold text-white bg-red-600 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
        >
          <UserX size={13} /> {loading ? "Removendo..." : "Remover"}
        </button>
      </div>
    </Modal>
  );
}

/* ─── MEMBER ROW (Equipe / Moderadores) com permissão e edição ─── */
function MemberRow({ member, isEventOrganizer, canRemove, canEditPermission, onRemove, onEditPermission }) {
  const roleConfig = ROLE_CONFIG[member.role] || ROLE_CONFIG.OTHER;
  const { Icon: RoleIcon } = roleConfig;
  const [menuOpen, setMenuOpen] = useState(false);

  const name    = member.name || member.user?.name || "Usuário";
  const email   = member.user?.email || member.email || null;
  const job     = member.job || member.roleDescription || roleConfig.label;
  const initial = name[0].toUpperCase();
  const joined  = member.createdAt
    ? new Date(member.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
    : "—";

  // Permissão (MEMBER / CHECKIN)
  const permission = member.permission || "MEMBER";
  const permissionConfig = PERMISSION_OPTIONS.find(p => p.value === permission) || PERMISSION_OPTIONS[0];
  const PermissionIcon = permissionConfig.icon;

  const isSystemUser = !!(member.userId && (member.user?.email || member.email));
  const isExternal   = !member.userId && member.name;

  return (
    <div
      className="grid items-center gap-3 px-4 py-3 rounded-lg border-b border-white/[0.04] hover:bg-purple-500/[0.03] transition-colors"
      style={{ gridTemplateColumns: "minmax(200px, 1fr) minmax(100px, 130px) minmax(80px, 100px) 90px 36px" }}
    >
      <div className="flex items-center gap-3 min-w-0 overflow-hidden">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-md ${isSystemUser ? "bg-gradient-to-br from-purple-500 to-purple-700" : "bg-[#1e2030]"}`}>
          {initial}
        </div>
        <div className="min-w-0 overflow-hidden">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold text-white truncate" title={name}>{name}</span>
            {isEventOrganizer && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shrink-0">
                Criador
              </span>
            )}
            {isExternal && !isEventOrganizer && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/[0.04] text-[#6b6888] border border-white/[0.06] shrink-0">
                Externo
              </span>
            )}
          </div>
          {email && <span className="text-xs text-[#6b6888] truncate">{email}</span>}
        </div>
      </div>

      <div className="min-w-0 overflow-hidden">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border whitespace-nowrap ${roleConfig.color} ${roleConfig.bg} ${roleConfig.border}`} title={job}>
          <RoleIcon size={10} strokeWidth={2} />
          <span className="truncate">{job}</span>
        </span>
      </div>

      {/* Badge de permissão */}
      <div className="min-w-0 overflow-hidden">
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${permissionConfig.color} ${permissionConfig.bg} border-white/10`}>
          <PermissionIcon size={10} />
          {permissionConfig.label}
        </span>
      </div>

      <span className="text-xs text-[#6b6888] shrink-0">{joined}</span>

      <div className="flex justify-end shrink-0">
        {(canRemove || canEditPermission) && !isEventOrganizer ? (
          <div className="relative">
            <button onClick={() => setMenuOpen(v => !v)} className="p-1.5 cursor-pointer rounded-md text-[#2e2c42] hover:text-white hover:bg-white/5 transition-colors">
              <MoreVertical size={14} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-6 top-1 mt-0 w-36 rounded-lg bg-[#0c0e18] border border-purple-500/20 shadow-xl overflow-hidden z-20">
                  {canEditPermission && (
                    <button
                      onClick={() => { onEditPermission(member); setMenuOpen(false); }}
                      className="w-full cursor-pointer flex items-center gap-2 px-3 py-2 text-xs text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                    >
                      <Edit2 size={11} /> Alterar permissão
                    </button>
                  )}
                  {canRemove && (
                    <button
                      onClick={() => { onRemove(member); setMenuOpen(false); }}
                      className="w-full cursor-pointer flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={11} /> Remover
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ) : <span className="w-5" />}
      </div>
    </div>
  );
}

/* ─── PARTICIPANT ROW (sem alterações) ─── */
function ParticipantRow({ participant, canRemove, onRemove }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const name    = participant.user?.name || "Participante";
  const email   = participant.user?.email || "";
  const initial = name[0]?.toUpperCase() || "P";
  const joined  = participant?.createdAt
    ? new Date(participant.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-lg border-b border-white/[0.04] hover:bg-purple-500/[0.03] transition-colors">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-md">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white truncate">{name}</p>
          {email && <p className="text-xs text-[#6b6888] truncate">{email}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-[#6b6888] hidden md:block">{joined}</span>
        {canRemove && (
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 cursor-pointer rounded-md text-[#2e2c42] hover:text-white hover:bg-white/5 transition-colors">
              <MoreVertical size={14} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-32 rounded-lg bg-[#0c0e18] border border-purple-500/20 shadow-xl overflow-hidden z-20">
                  <button onClick={() => { onRemove(participant); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
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

/* ─── SECTION BLOCK ─── */
function Section({ title, subtitle, dot, accentBorder, headerAction, children }) {
  return (
    <div className="border border-white/[0.06] rounded-xl overflow-hidden">
      <div className={`flex items-center justify-between px-5 py-3.5 bg-[#0c0e18] border-b border-white/[0.06] border-l-2 ${accentBorder}`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full ${dot}`} />
          <span className="text-sm font-bold text-white">{title}</span>
          {subtitle && <span className="text-xs text-[#6b6888]">{subtitle}</span>}
        </div>
        {headerAction}
      </div>

      <div className="grid px-4 py-2 border-b border-white/[0.04] bg-[#0c0e18]/50"
        style={{ gridTemplateColumns: "minmax(200px, 1fr) minmax(100px, 130px) minmax(80px, 100px) 90px 36px" }}>
        <span className="text-[10px] font-bold text-[#6b6888] tracking-widest uppercase">Participante</span>
        <span className="text-[10px] font-bold text-[#6b6888] tracking-widest uppercase">Função</span>
        <span className="text-[10px] font-bold text-[#6b6888] tracking-widest uppercase">Permissão</span>
        <span className="text-[10px] font-bold text-[#6b6888] tracking-widest uppercase">Entrada</span>
        <span className="text-[10px] font-bold text-[#6b6888] tracking-widest uppercase text-right">Ações</span>
      </div>

      {children}
    </div>
  );
}

/* ─── MAIN ─── */
export default function ParticipantesTab({ eventId, eventData }) {
  const [moderators,    setModerators]    = useState([]);
  const [teamMembers,   setTeamMembers]   = useState([]);
  const [participants,  setParticipants]  = useState([]);
  const [meId,          setMeId]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search,        setSearch]        = useState("");

  const [modal,              setModal]              = useState(null); // "inviteMod" | "addMember" | "addParticipant"
  const [removeTarget,      setRemoveTarget]       = useState(null);
  const [editPermTarget,    setEditPermTarget]     = useState(null); // member object for editing permission

  const organizerId = eventData?.createdBy ?? eventData?.creator?.id ?? null;
  const isOrganizer = !!meId && !!organizerId && String(meId) === String(organizerId);
  const isModerator = !isOrganizer && moderators.some(m => m.userId === meId);
  const canManageTeamAndParticipants = isOrganizer || isModerator;
  const canManageModerators          = isOrganizer;
  const canEditPermission            = isOrganizer; // apenas organizador pode alterar permissão

  /* ─── FETCH ─── */
  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { method: "GET", credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setMeId(data.data.user.id);
      }
    } catch (err) {
      console.error("Erro ao buscar usuário:", err);
    }
  }, []);

  const fetchModerators = useCallback(async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/moderators`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setModerators(data?.data?.moderators || data?.moderators || []);
      }
    } catch (err) {
      console.error("Erro ao buscar moderadores:", err);
    }
  }, [eventId]);

  const fetchTeamAndParticipants = useCallback(async () => {
    try {
      const [membersRes, participantsRes] = await Promise.all([
        fetch(`/api/events/${eventId}/team`, { credentials: "include" }),
        fetch(`/api/events/${eventId}/participants`, { credentials: "include" }),
      ]);

      if (membersRes.ok) {
        const data = await membersRes.json();
        const teamList = data?.data?.team || data?.team || [];

        setTeamMembers(teamList.filter(m => !["ORGANIZER", "MODERATOR", "ATTENDEE"].includes(m.role)));
      }

      if (participantsRes.ok) {
        const data = await participantsRes.json();
        setParticipants(data?.data?.participants || data?.participants || []);
      }
    } catch (err) {
      console.error("Erro ao buscar equipe/participantes:", err);
    }
  }, [eventId]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchMe(), fetchModerators(), fetchTeamAndParticipants()]);
    setLoading(false);
  }, [fetchMe, fetchModerators, fetchTeamAndParticipants]);

  useEffect(() => { if (eventId) fetchAll(); }, [eventId, fetchAll]);

  /* ─── ACTIONS ─── */
  const handleInviteModerator = async (payload) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/moderators`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) { await fetchModerators(); setModal(null); }
      else { const d = await res.json(); alert(d.message || "Erro ao convidar"); }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddTeamMember = async (payload) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/team/invite`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) { await fetchTeamAndParticipants(); setModal(null); }
      else { const d = await res.json(); alert(d.message || "Erro ao convidar membro"); }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddParticipant = async (payload) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/participants/invite`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) { await fetchTeamAndParticipants(); setModal(null); }
      else { const d = await res.json(); alert(d.message || "Erro ao adicionar participante"); }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePermission = async (memberId, newPermission) => {
    setActionLoading(true);
    try {
        const res = await fetch(`/api/events/${eventId}/team/${memberId}/permission`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ permission: newPermission }),
        });
        if (res.ok) {
            await fetchTeamAndParticipants(); // recarrega a lista
            setEditPermTarget(null);
        } else {
            const data = await res.json();
            alert(data.message || "Erro ao alterar permissão");
        }
    } catch (err) {
        console.error(err);
    } finally {
        setActionLoading(false);
    }
};

  const handleRemoveConfirm = async () => {
    if (!removeTarget) return;
    setActionLoading(true);
    try {
      const { member, type } = removeTarget;
      const moderatorId = member.id;
      console.log(member, moderatorId)
      const urlMap = {
        moderator:   `/api/events/${eventId}/moderators/${moderatorId}`,
        team:        `/api/events/${eventId}/team/${member.id}`,
        participant: `/api/events/${eventId}/participants/${member.id}`,
      };
      const res = await fetch(urlMap[type], { method: "DELETE", credentials: "include" });
      if (res.ok) {
        await (type === "moderator" ? fetchModerators() : fetchTeamAndParticipants());
        setRemoveTarget(null);
      } else {
          const error = await res.json();
          alert(error.message || 'Erro ao remover');
        }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  /* ─── FILTER ─── */
  const q = search.toLowerCase();
  const matchMember      = m => (m.name || m.user?.name || "").toLowerCase().includes(q) || (m.email || m.user?.email || "").toLowerCase().includes(q) || (m.job || m.roleDescription || "").toLowerCase().includes(q);
  const matchParticipant = p => (p?.user?.name?.toLowerCase() || "").includes(q) || (p?.user?.email?.toLowerCase() || "").includes(q);

  const filteredModerators   = moderators.filter(matchMember);
  const filteredTeamMembers  = teamMembers.filter(matchMember);
  const filteredParticipants = participants.filter(matchParticipant);

  const removeTargetName = removeTarget
    ? (removeTarget.member?.name || removeTarget.member?.user?.name || "Usuário")
    : "";
  const removeTargetLabel = removeTarget?.type === "participant" ? "participante" : removeTarget?.type === "moderator" ? "moderador" : "membro";

  /* ─── LOADING ─── */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 gap-3">
        <div className="w-5 h-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        <span className="text-sm text-[#6b6888]">Carregando...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-bold text-white text-lg tracking-tight mb-1">Equipe & Participantes</h2>
          <p className="text-sm text-[#6b6888]">Gerencie organizador, moderadores, equipe e participantes</p>
        </div>
        <div className="flex gap-2">
          {canManageTeamAndParticipants && (
            <>
              <button
                onClick={() => setModal("addParticipant")}
                className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer font-bold text-white bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg shadow-[0_4px_14px_rgba(16,185,129,0.4)] hover:opacity-90 transition-all"
              >
                <UserPlus size={14} /> Participante
              </button>
              <button
                onClick={() => setModal("addMember")}
                className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer font-bold text-white bg-[#13111e] border border-white/[0.08] rounded-lg hover:border-purple-500/30 hover:text-white transition-all"
              >
                <UserPlus size={14} /> Equipe
              </button>
            </>
          )}
          {canManageModerators && (
            <button
              onClick={() => setModal("inviteMod")}
              className="flex items-center gap-2 px-3 py-2 text-sm font-bold cursor-pointer text-white bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg shadow-[0_4px_14px_rgba(124,58,237,0.4)] hover:opacity-90 transition-all"
            >
              <Shield size={14} /> Moderador
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2e2c42] pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filtrar por nome, e-mail ou função..."
          className="w-full bg-[#0c0e18] border border-white/[0.06] rounded-lg pl-9 pr-8 py-2 text-sm text-white placeholder-[#2e2c42] outline-none focus:border-purple-500/40 transition-colors"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute cursor-pointer right-2.5 top-1/2 -translate-y-1/2 text-[#2e2c42] hover:text-white">
            <X size={12} />
          </button>
        )}
      </div>

      <div className="space-y-5">
        {/* PARTICIPANTES */}
        <Section
          title="Participantes"
          subtitle={`${filteredParticipants.length} inscrito${filteredParticipants.length !== 1 ? "s" : ""}`}
          dot="bg-emerald-400"
          accentBorder="border-l-emerald-400/50"
          headerAction={
            canManageTeamAndParticipants && (
              <button
                onClick={() => setModal("addParticipant")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-all"
              >
                <UserPlus size={11} /> Adicionar
              </button>
            )
          }
        >
          {filteredParticipants.length > 0 ? (
            filteredParticipants.map(p => (
              <ParticipantRow
                key={p.id}
                participant={p}
                canRemove={canManageTeamAndParticipants}
                onRemove={m => setRemoveTarget({ member: m, type: "participant" })}
              />
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

        {/* MODERADORES */}
        <Section
          title="Moderadores"
          subtitle={`${filteredModerators.length} membro${filteredModerators.length !== 1 ? "s" : ""}`}
          dot="bg-purple-400"
          accentBorder="border-l-purple-400/50"
          headerAction={
            canManageModerators && (
              <button
                onClick={() => setModal("inviteMod")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-all"
              >
                <Send size={11} /> Convidar
              </button>
            )
          }
        >
          {filteredModerators.length > 0 ? (
            filteredModerators.map(m => (
              <MemberRow
                key={m.id}
                member={{ ...m, permission: "MODERATOR" }} // moderators têm permissão implícita? Não editável
                isEventOrganizer={false}
                canRemove={canManageModerators}
                canEditPermission={false}
                onRemove={member => setRemoveTarget({ member, type: "moderator" })}
              />
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
          dot="bg-blue-400"
          accentBorder="border-l-blue-400/50"
          headerAction={
            canManageTeamAndParticipants && (
              <button
                onClick={() => setModal("addMember")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-all"
              >
                <UserPlus size={11} /> Adicionar
              </button>
            )
          }
        >
          {filteredTeamMembers.length > 0 ? (
            filteredTeamMembers.map(m => (
              <MemberRow
                key={m.id}
                member={m}
                isEventOrganizer={false}
                canRemove={canManageTeamAndParticipants}
                canEditPermission={canEditPermission}
                onRemove={member => setRemoveTarget({ member, type: "team" })}
                onEditPermission={member => setEditPermTarget(member)}
              />
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
      </div>

      {/* Modais */}
      {modal === "inviteMod" && (
        <InviteModeratorModal onClose={() => setModal(null)} onSubmit={handleInviteModerator} loading={actionLoading} />
      )}
      {modal === "addMember" && (
        <AddTeamMemberModal onClose={() => setModal(null)} onSubmit={handleAddTeamMember} loading={actionLoading} />
      )}
      {modal === "addParticipant" && (
        <AddParticipantModal onClose={() => setModal(null)} onSubmit={handleAddParticipant} loading={actionLoading} />
      )}
      {removeTarget && (
        <RemoveModal
          name={removeTargetName}
          label={removeTargetLabel}
          onClose={() => setRemoveTarget(null)}
          onConfirm={handleRemoveConfirm}
          loading={actionLoading}
        />
      )}
      {editPermTarget && (
        <EditPermissionModal
          member={editPermTarget}
          onClose={() => setEditPermTarget(null)}
          onUpdate={handleUpdatePermission}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  GraduationCap, FileText, Mail, Download, Eye, Plus,
  CalendarDays, Clock, Users, CheckCircle, XCircle, AlertCircle,
  RefreshCw, Loader2, Sparkles, Pen, Trash2, Settings, Layers, Copy, Save
} from "lucide-react";

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================

const StatusBadge = ({ issued }) => {
  if (issued) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
        <CheckCircle size={12} /> Enviado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
      <AlertCircle size={12} /> Pendente
    </span>
  );
};

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
};

// ============================================================
// MODAL PARA CRIAR/EDITAR TEMPLATE
// ============================================================
function TemplateModal({ template, eventId, subEvents, onClose, onSave, loading }) {
  const [title, setTitle] = useState(template?.title || "");
  const [workload, setWorkload] = useState(template?.workload || "");
  const [certType, setCertType] = useState(template?.type || "Participante");
  const [subEventId, setSubEventId] = useState(template?.subEventId || "");
  const [error, setError] = useState("");

  const isEditing = !!template;

  const handleSubmit = () => {
    setError("");
    if (!workload.trim()) {
      setError("Carga horária é obrigatória.");
      return;
    }
    onSave({
      title: title.trim() || null,
      workload: workload.trim(),
      type: certType,
      subEventId: subEventId || null,
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#11101B] border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl my-8">
        <h2 className="text-lg font-bold text-accent-foreground mb-2 flex items-center gap-2">
          <Layers size={18} className="text-purple-400" />
          {isEditing ? "Editar Template" : "Novo Template"}
        </h2>
        <p className="text-sm text-accent-foreground/60 mb-6">
          Crie um modelo de certificado para gerar certificados em lote após o evento.
        </p>

        <div className="space-y-4">
          {/* Título do template (opcional) */}
          <div>
            <label className="block text-xs font-semibold text-accent-foreground/80 mb-1">
              Título do Template (opcional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Certificado Padrão"
              className="w-full px-4 py-2.5 rounded-lg text-sm bg-[#11101B] border border-border focus:border-primary outline-none text-accent-foreground placeholder:text-accent-foreground/40"
            />
          </div>

          {/* Carga horária */}
          <div>
            <label className="block text-xs font-semibold text-accent-foreground/80 mb-1">
              Carga Horária <span className="text-purple-400">*</span>
            </label>
            <input
              type="text"
              value={workload}
              onChange={(e) => setWorkload(e.target.value)}
              placeholder="ex: 16h, 4h, 8 horas"
              className="w-full px-4 py-2.5 rounded-lg text-sm bg-[#11101B] border border-border focus:border-primary outline-none text-accent-foreground placeholder:text-accent-foreground/40"
              required
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-xs font-semibold text-accent-foreground/80 mb-1">
              Tipo de Certificado
            </label>
            <select
              value={certType}
              onChange={(e) => setCertType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm bg-[#11101B] border border-border focus:border-primary outline-none text-accent-foreground"
            >
              <option value="Participante">Participante</option>
              <option value="Palestrante">Palestrante</option>
              <option value="Instrutor">Instrutor</option>
              <option value="Organizador">Organizador</option>
              <option value="Voluntário">Voluntário</option>
              <option value="Membro da Equipe">Membro da Equipe</option>
            </select>
          </div>

          {/* Subevento (opcional) */}
          <div>
            <label className="block text-xs font-semibold text-accent-foreground/80 mb-1">
              Sub-evento (opcional)
            </label>
            <select
              value={subEventId}
              onChange={(e) => setSubEventId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm bg-[#11101B] border border-border focus:border-primary outline-none text-accent-foreground"
            >
              <option value="">-- Geral (Evento Principal) --</option>
              {subEvents?.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-accent-foreground/40 mt-1">
              Selecione um sub-evento para vincular o template apenas a ele.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2.5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-2.5 mt-6 pt-5 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-accent-foreground/60 border border-border rounded-lg hover:text-accent-foreground hover:border-primary/30 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !workload.trim()}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-gradient-to-br from-[#8b5cf6] to-[#9333ea] rounded-lg shadow-[0_4px_14px_rgba(124,58,237,0.4)] hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {loading ? "Salvando..." : "Salvar Template"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function CertificadosAnalytics({ eventData }) {
  const eventId = eventData.id;
  const subEvents = eventData.subEvents || [];

  // Estado para templates
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Estado para certificados gerados
  const [certificates, setCertificates] = useState([]);
  const [certificatesLoading, setCertificatesLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // ========== Buscar Templates ==========
  const fetchTemplates = useCallback(async () => {
    setTemplatesLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/certificate-templates`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar templates.");
    } finally {
      setTemplatesLoading(false);
    }
  }, [eventId]);

  // ========== Buscar Certificados ==========
  const fetchCertificates = useCallback(async () => {
    setCertificatesLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/certificates`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.data || [];
      setCertificates(list);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar certificados.");
    } finally {
      setCertificatesLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchTemplates();
    fetchCertificates();
  }, [fetchTemplates, fetchCertificates]);

  // ========== CRUD Templates ==========
  const handleCreateTemplate = async (data) => {
    setSavingTemplate(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/certificate-templates`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Erro ao criar template.");
      setSuccessMessage("✅ Template criado com sucesso!");
      await fetchTemplates();
      setShowTemplateModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleUpdateTemplate = async (data) => {
    if (!editingTemplate) return;
    setSavingTemplate(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/certificate-templates/${editingTemplate.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Erro ao atualizar template.");
      setSuccessMessage("✅ Template atualizado!");
      await fetchTemplates();
      setEditingTemplate(null);
      setShowTemplateModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm("Tem certeza que deseja excluir este template?")) return;
    try {
      const res = await fetch(`/api/events/${eventId}/certificate-templates/${templateId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erro ao excluir.");
      setSuccessMessage("✅ Template excluído.");
      await fetchTemplates();
    } catch (err) {
      setError(err.message);
    }
  };

  // ========== Gerar Certificados a partir de um Template ==========
  const handleGenerateFromTemplate = async (templateId) => {
    if (!confirm("Gerar certificados para todos os participantes com check-in confirmado a partir deste template?")) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/certificate-templates/${templateId}/generate`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar.");
      setSuccessMessage(`✅ ${data.message || "Certificados gerados!"} (${data.generated || 0} gerados)`);
      await fetchCertificates(); // atualiza a lista de certificados
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  // ========== Outras ações ==========
  const handleSendEmail = async (certId) => {
    setSending(certId);
    try {
      const res = await fetch(`/api/certificates/${certId}/send`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao enviar");
      setSuccessMessage(`✅ Certificado enviado por e-mail!`);
      await fetchCertificates();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(null);
    }
  };

  const handleView = (hash) => window.open(`/verify/${hash}`, "_blank");

  const handleDownload = async (hash) => {
    try {
      const res = await fetch(`/api/certificates/download/${hash}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erro ao baixar");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificado-${hash.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  // ========== Render ==========
  const totalCerts = certificates.length;
  const issued = certificates.filter(c => c.issued).length;
  const pending = totalCerts - issued;

  return (
    <div className="space-y-8">
      {/* ===== SEÇÃO DE TEMPLATES ===== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-accent-foreground flex items-center gap-2">
              <Layers size={18} className="text-purple-400" />
              Templates de Certificado
            </h3>
            <p className="text-sm text-accent-foreground/60">
              Crie modelos para gerar certificados em lote após o evento.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingTemplate(null);
              setShowTemplateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-br from-[#8b5cf6] to-[#9333ea] rounded-lg shadow-[0_4px_14px_rgba(124,58,237,0.4)] hover:opacity-90 transition-all"
          >
            <Plus size={14} /> Novo Template
          </button>
        </div>

        {templatesLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-purple-400" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-border rounded-xl bg-[#11101B]">
            <Layers size={28} className="text-[#3d3860] mx-auto mb-2" />
            <p className="font-medium text-accent-foreground/60">Nenhum template criado</p>
            <p className="text-sm text-accent-foreground/40">Crie um template para gerar certificados em lote.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tmpl) => (
              <div key={tmpl.id} className="bg-[#13111e] border border-border rounded-xl p-4 hover:border-purple-500/40 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-accent-foreground">
                      {tmpl.title || `Template #${tmpl.id.slice(0, 6)}`}
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs">
                      <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        {tmpl.workload}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {tmpl.type}
                      </span>
                      {tmpl.subEventId && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Sub-evento
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-accent-foreground/40 mt-2">
                      Criado em {formatDate(tmpl.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditingTemplate(tmpl);
                        setShowTemplateModal(true);
                      }}
                      className="p-1.5 rounded-md bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-colors"
                      title="Editar"
                    >
                      <Pen size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(tmpl.id)}
                      className="p-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => handleGenerateFromTemplate(tmpl.id)}
                  disabled={generating}
                  className="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 hover:bg-emerald-400/20 transition-colors disabled:opacity-50"
                >
                  {generating ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Copy size={14} />
                  )}
                  Gerar Certificados
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== SEÇÃO DE CERTIFICADOS GERADOS ===== */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-accent-foreground flex items-center gap-2">
              <GraduationCap size={18} className="text-purple-400" />
              Certificados Gerados
            </h3>
            <div className="flex items-center gap-3 text-sm text-accent-foreground/60">
              <span>{totalCerts} total</span>
              <span className="w-px h-4 bg-border" />
              <span className="text-emerald-400">{issued} enviados</span>
              <span className="w-px h-4 bg-border" />
              <span className="text-amber-400">{pending} pendentes</span>
            </div>
          </div>
          <button
            onClick={fetchCertificates}
            className="p-2 rounded-lg border border-border text-accent-foreground/60 hover:text-white hover:border-primary/30 transition-all"
          >
            <RefreshCw size={16} className={certificatesLoading ? "animate-spin" : ""} />
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">✕</button>
          </div>
        )}
        {successMessage && (
          <div className="flex items-start gap-2.5 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
            <p className="text-sm text-emerald-400">{successMessage}</p>
            <button onClick={() => setSuccessMessage("")} className="ml-auto text-emerald-400 hover:text-emerald-300">✕</button>
          </div>
        )}

        {certificatesLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-purple-400" />
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-xl bg-[#11101B]">
            <GraduationCap size={32} className="text-[#3d3860] mx-auto mb-3" />
            <p className="font-bold text-accent-foreground">Nenhum certificado gerado</p>
            <p className="text-sm text-accent-foreground/60">
              Utilize os templates para gerar certificados para participantes com check-in.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-[#13111e] border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-accent-foreground/60">Participante</th>
                  <th className="px-4 py-3 text-left font-semibold text-accent-foreground/60">Evento</th>
                  <th className="px-4 py-3 text-left font-semibold text-accent-foreground/60">Carga</th>
                  <th className="px-4 py-3 text-left font-semibold text-accent-foreground/60">Tipo</th>
                  <th className="px-4 py-3 text-left font-semibold text-accent-foreground/60">Emissão</th>
                  <th className="px-4 py-3 text-left font-semibold text-accent-foreground/60">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-accent-foreground/60">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {certificates.map((cert) => {
                  const participantName = cert.user?.name || "Participante";
                  const eventTitle = cert.event?.title || cert.subEvent?.title || "Evento";
                  const workload = cert.workload || "—";
                  const type = cert.type || "Participante";
                  const issuedAt = formatDate(cert.issueDate);
                  return (
                    <tr key={cert.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-accent-foreground font-medium">{participantName}</td>
                      <td className="px-4 py-3 text-accent-foreground/70">{eventTitle}</td>
                      <td className="px-4 py-3 text-accent-foreground/70">{workload}</td>
                      <td className="px-4 py-3 text-accent-foreground/70">{type}</td>
                      <td className="px-4 py-3 text-accent-foreground/70">{issuedAt}</td>
                      <td className="px-4 py-3"><StatusBadge issued={cert.issued} /></td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleView(cert.hash)} className="p-1.5 rounded-md bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-colors" title="Visualizar"><Eye size={14} /></button>
                          <button onClick={() => handleDownload(cert.hash)} className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors" title="Baixar PDF"><Download size={14} /></button>
                          {!cert.issued && (
                            <button
                              onClick={() => handleSendEmail(cert.id)}
                              disabled={sending === cert.id}
                              className={`p-1.5 rounded-md transition-colors ${sending === cert.id ? "bg-blue-500/10 text-blue-400/50 cursor-wait" : "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"}`}
                              title="Enviar por e-mail"
                            >
                              {sending === cert.id ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== MODAL DE TEMPLATE ===== */}
      {showTemplateModal && (
        <TemplateModal
          template={editingTemplate}
          eventId={eventId}
          subEvents={subEvents}
          onClose={() => {
            setShowTemplateModal(false);
            setEditingTemplate(null);
          }}
          onSave={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
          loading={savingTemplate}
        />
      )}
    </div>
  );
}
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  GraduationCap, FileText, Mail, Download, Eye, Plus,
  CalendarDays, Clock, Users, CheckCircle, XCircle, AlertCircle,
  RefreshCw, Loader2, Sparkles, Pen, Trash2, Settings, Layers, Copy, Save,
  UserCheck, FileCheck, AlertTriangle, Tag
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

const OriginBadge = ({ isSubEvent }) => {
  if (isSubEvent) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <Tag size={10} /> Subevento
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
      <Tag size={10} /> Evento Principal
    </span>
  );
};

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
};

// ============================================================
// MODAL PARA CRIAR/EDITAR TEMPLATE (COM VALIDAÇÃO OBRIGATÓRIA)
// ============================================================
function TemplateModal({ template, eventId, onClose, onSave, loading }) {
  const [title, setTitle] = useState(template?.title || "");
  const [workload, setWorkload] = useState(template?.workload || "");
  const [certType, setCertType] = useState(template?.type || "Participante");
  const [subEventId, setSubEventId] = useState(template?.subEventId || "");
  const [sectionId, setSectionId] = useState(template?.sectionId || "");
  const [subEvents, setSubEvents] = useState([]);
  const [loadingSubEvents, setLoadingSubEvents] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!template;

  // Buscar subeventos ao abrir o modal (já vêm com sections)
  useEffect(() => {
    const fetchSubEvents = async () => {
      setLoadingSubEvents(true);
      try {
        const res = await fetch(`/api/events/${eventId}/subevents`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const data = await res.json();
        const list = data?.data?.subevents || [];
        setSubEvents(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar subeventos");
        setSubEvents([]);
      } finally {
        setLoadingSubEvents(false);
      }
    };
    fetchSubEvents();
  }, [eventId]);

  const selectedSubEvent = subEvents.find(sub => sub.id === subEventId);
  const sections = selectedSubEvent?.sections || [];

  const handleSubEventChange = (value) => {
    setSubEventId(value);
    setSectionId("");
  };

  const handleSubmit = () => {
    setError("");

    // Validação: título obrigatório
    if (!title.trim()) {
      setError("Título do template é obrigatório.");
      return;
    }

    // Validação: carga horária obrigatória
    if (!workload.trim()) {
      setError("Carga horária é obrigatória.");
      return;
    }

    // Se selecionou sub-evento, seção é obrigatória
    if (subEventId && !sectionId) {
      setError("Se você selecionou um sub-evento, deve escolher uma seção específica.");
      return;
    }

    onSave({
      title: title.trim(),
      workload: workload.trim(),
      type: certType,
      subEventId: subEventId || null,
      sectionId: sectionId || null,
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
          Crie um modelo de certificado. Todos os campos são obrigatórios.
        </p>

        <div className="space-y-4">
          {/* Título do template - agora obrigatório */}
          <div>
            <label className="block text-xs font-semibold text-accent-foreground/80 mb-1">
              Título do Template <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Certificado Padrão"
              className="w-full px-4 py-2.5 rounded-lg text-sm bg-[#11101B] border border-border focus:border-primary outline-none text-accent-foreground placeholder:text-accent-foreground/40"
            />
          </div>

          {/* Carga horária - obrigatório */}
          <div>
            <label className="block text-xs font-semibold text-accent-foreground/80 mb-1">
              Carga Horária <span className="text-red-400">*</span>
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

          {/* Tipo de certificado - obrigatório (já selecionado) */}
          <div>
            <label className="block text-xs font-semibold text-accent-foreground/80 mb-1">
              Tipo de Certificado <span className="text-red-400">*</span>
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
              Sub-evento <span className="text-xs text-accent-foreground/40">(opcional)</span>
            </label>
            <select
              value={subEventId}
              onChange={(e) => handleSubEventChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm bg-[#11101B] border border-border focus:border-primary outline-none text-accent-foreground"
              disabled={loadingSubEvents}
            >
              <option value="">-- Geral (Evento Principal) --</option>
              {Array.isArray(subEvents) && subEvents.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.title}
                </option>
              ))}
            </select>
            {loadingSubEvents && (
              <p className="text-xs text-accent-foreground/40 mt-1">Carregando subeventos...</p>
            )}
            <p className="text-xs text-accent-foreground/40 mt-1">
              Selecione um sub-evento para vincular o template a ele.
            </p>
          </div>

          {/* Seção específica (obrigatória se subevento for selecionado) */}
          {subEventId && (
            <div>
              <label className="block text-xs font-semibold text-accent-foreground/80 mb-1">
                Seção específica <span className="text-red-400">*</span>
              </label>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm bg-[#11101B] border border-border focus:border-primary outline-none text-accent-foreground"
              >
                <option value="">-- Selecione uma seção --</option>
                {Array.isArray(sections) && sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.title || `Seção ${new Date(sec.date_start).toLocaleDateString('pt-BR')}`}
                  </option>
                ))}
              </select>
              {(!sections || sections.length === 0) && (
                <p className="text-xs text-amber-400 mt-1">Este subevento não possui seções.</p>
              )}
              <p className="text-xs text-accent-foreground/40 mt-1">
                Ao vincular a uma seção, os certificados serão gerados apenas para participantes com check-in nesta seção.
              </p>
            </div>
          )}
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
            disabled={loading}
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

  // Estado para templates
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Estado para certificados
  const [certificates, setCertificates] = useState([]);
  const [certificatesLoading, setCertificatesLoading] = useState(true);
  
  // Estado para estatísticas
  const [stats, setStats] = useState({ eligible: 0, generated: 0, pending: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // Estado de ações
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [autoGenerated, setAutoGenerated] = useState(false);

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

  // ========== Buscar Estatísticas ==========
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/certificates/stats`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();
      setStats(data);
      return data;
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar estatísticas.");
      return null;
    } finally {
      setStatsLoading(false);
    }
  }, [eventId]);

  // ========== Gerar automaticamente ao abrir ==========
  const autoGenerateCertificates = useCallback(async () => {
  if (autoGenerated || generating) return;
  
  const statsData = await fetchStats();
  if (!statsData || statsData.pending === 0) return;
  if (templates.length === 0) return;

  setGenerating(true);
  let totalGenerated = 0;
  let errors = [];

  try {
    for (const template of templates) {
      try {
        let url;
        if (template.subEventId) {
          url = `/api/events/${eventId}/subevents/${template.subEventId}/certificates/generate`;
        } else {
          url = `/api/events/${eventId}/certificates/generate`;
        }

        const res = await fetch(url, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workload: template.workload,
            type: template.type,
            title: template.title,
            sectionId: template.sectionId || null,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          errors.push(`Template "${template.title || 'sem título'}": ${data.error || 'Erro'}`);
        } else {
          totalGenerated += data.generated || 0;
        }
      } catch (err) {
        errors.push(`Template "${template.title || 'sem título'}": ${err.message}`);
      }
    }

    if (errors.length > 0) {
      setError(`Alguns templates falharam: ${errors.join('; ')}`);
    } else {
      setSuccessMessage(`Certificados gerados automaticamente (${totalGenerated} gerados).`);
    }
    await fetchCertificates();
    await fetchStats();
    setAutoGenerated(true);
  } catch (err) {
    setError(err.message);
  } finally {
    setGenerating(false);
  }
}, [eventId, templates, fetchStats, fetchCertificates, autoGenerated, generating]);
  // ========== Carregar dados iniciais ==========
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchTemplates(), fetchCertificates()]);
      const statsData = await fetchStats();
      
      if (statsData && statsData.pending > 0 && templates.length > 0) {
        setTimeout(() => {
          autoGenerateCertificates();
        }, 500);
      }
    };
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      setSuccessMessage("Template criado com sucesso!");
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
      setSuccessMessage("Template atualizado!");
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
      setSuccessMessage("Template excluído.");
      await fetchTemplates();
    } catch (err) {
      setError(err.message);
    }
  };

  // ========== Gerar Certificados a partir de um Template (manual) ==========
  const handleGenerateFromTemplate = async (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const targetLabel = template.subEventId ? "subevento" : "evento principal";
    if (!confirm(`Gerar certificados para todos os participantes com check-in confirmado deste ${targetLabel}?`)) return;
    
    setGenerating(true);
    setError(null);
    try {
      let url;
      if (template.subEventId) {
        url = `/api/events/${eventId}/subevents/${template.subEventId}/certificates/generate`;
      } else {
        url = `/api/events/${eventId}/certificates/generate`;
      }

      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workload: template.workload,
          type: template.type,
          title: template.title,
          sectionId: template.sectionId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar.");
      setSuccessMessage(`Certificados gerados! (${data.generated || 0} gerados)`);
      await fetchCertificates();
      await fetchStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  // ========== Gerar todos os pendentes (agora para TODOS os templates) ==========
  const handleGenerateAllPending = async () => {
    if (stats.pending === 0) {
      setError("Não há participantes pendentes para gerar certificados.");
      return;
    }

    if (templates.length === 0) {
      setError("Crie pelo menos um template primeiro.");
      return;
    }

    // Confirmação
    if (!confirm(`Gerar certificados para os ${stats.pending} participantes pendentes usando todos os templates disponíveis?`)) return;

    setGenerating(true);
    setError(null);
    let totalGenerated = 0;
    let errors = [];

    try {
      // Itera sobre todos os templates e chama a geração para cada um
      for (const template of templates) {
        try {
          let url;
          if (template.subEventId) {
            url = `/api/events/${eventId}/subevents/${template.subEventId}/certificates/generate`;
          } else {
            url = `/api/events/${eventId}/certificates/generate`;
          }

          const res = await fetch(url, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              workload: template.workload,
              type: template.type,
              title: template.title,
              sectionId: template.sectionId || null,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            errors.push(`Template "${template.title || 'sem título'}": ${data.error || 'Erro'}`);
          } else {
            totalGenerated += data.generated || 0;
          }
        } catch (err) {
          errors.push(`Template "${template.title || 'sem título'}": ${err.message}`);
        }
      }

      if (errors.length > 0) {
        setError(`Alguns templates falharam: ${errors.join('; ')}`);
      } else {
        setSuccessMessage(`Certificados gerados com sucesso! Total: ${totalGenerated} gerados.`);
      }
      await fetchCertificates();
      await fetchStats();
    } catch (err) {
      setError(err.message || "Erro ao gerar certificados.");
    } finally {
      setGenerating(false);
    }
  };

  // ========== Enviar e-mail ==========
  const handleSendEmail = async (certId) => {
    setSending(certId);
    try {
      const res = await fetch(`/api/certificates/${certId}/send`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao enviar");
      setSuccessMessage(`Certificado enviado por e-mail!`);
      await fetchCertificates();
      await fetchStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(null);
    }
  };

  // ========== Enviar todos pendentes ==========
  const handleSendAllPending = async () => {
    const pendingCerts = certificates.filter(c => !c.issued);
    if (pendingCerts.length === 0) {
      setError("Não há certificados pendentes para enviar.");
      return;
    }
    if (!confirm(`Enviar ${pendingCerts.length} certificado(s) pendente(s) por e-mail?`)) return;
    
    setGenerating(true);
    let sent = 0;
    let errors = 0;
    for (const cert of pendingCerts) {
      try {
        const res = await fetch(`/api/certificates/${cert.id}/send`, {
          method: "POST",
          credentials: "include",
        });
        if (res.ok) sent++;
        else errors++;
      } catch (e) {
        errors++;
      }
    }
    setSuccessMessage(`Envio concluído: ${sent} enviados, ${errors} com erro.`);
    await fetchCertificates();
    await fetchStats();
    setGenerating(false);
  };

  // ========== Visualizar ==========
  const handleView = (hash) => window.open(`/verify/${hash}`, "_blank");

  // ========== Download ==========
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
  const pendingCerts = totalCerts - issued;

  return (
    <div className="space-y-8">
      {/* ===== PAINEL DE ESTATÍSTICAS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#13111e] border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <UserCheck size={18} className="text-violet-400" />
          </div>
          <div>
            <p className="text-xs text-accent-foreground/40 font-medium">Participantes com check-in</p>
            <p className="text-xl font-bold text-accent-foreground">{statsLoading ? "..." : stats.eligible}</p>
          </div>
        </div>
        <div className="bg-[#13111e] border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <FileCheck size={18} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-accent-foreground/40 font-medium">Certificados gerados</p>
            <p className="text-xl font-bold text-accent-foreground">{statsLoading ? "..." : stats.generated}</p>
          </div>
        </div>
        <div className="bg-[#13111e] border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <AlertTriangle size={18} className="text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-accent-foreground/40 font-medium">Pendentes de geração</p>
            <p className={`text-xl font-bold ${stats.pending > 0 ? "text-amber-400" : "text-emerald-400"}`}>
              {statsLoading ? "..." : stats.pending}
            </p>
          </div>
        </div>
      </div>

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
          <div className="flex gap-2">
            {stats.pending > 0 && templates.length > 0 && (
              <button
                onClick={handleGenerateAllPending}
                disabled={generating}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-[0_4px_14px_rgba(245,158,11,0.3)] hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {generating ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />}
                {generating ? "Gerando..." : `Gerar ${stats.pending} pendentes`}
              </button>
            )}
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
                      {tmpl.sectionId && (
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          Seção
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
              <span className="text-amber-400">{pendingCerts} pendentes</span>
            </div>
          </div>
          <div className="flex gap-2">
            {pendingCerts > 0 && (
              <button
                onClick={handleSendAllPending}
                disabled={generating}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg shadow-[0_4px_14px_rgba(52,211,153,0.4)] hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {generating ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                {generating ? "Enviando..." : `Enviar ${pendingCerts} pendentes`}
              </button>
            )}
            <button
              onClick={async () => { await fetchCertificates(); await fetchStats(); }}
              className="p-2 rounded-lg border border-border text-accent-foreground/60 hover:text-white hover:border-primary/30 transition-all"
              title="Atualizar"
            >
              <RefreshCw size={16} className={certificatesLoading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
              <XCircle size={14} />
            </button>
          </div>
        )}
        {successMessage && (
          <div className="flex items-start gap-2.5 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
            <p className="text-sm text-emerald-400">{successMessage}</p>
            <button onClick={() => setSuccessMessage("")} className="ml-auto text-emerald-400 hover:text-emerald-300">
              <XCircle size={14} />
            </button>
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
                  <th className="px-4 py-3 text-left font-semibold text-accent-foreground/60">Evento / Subevento</th>
                  <th className="px-4 py-3 text-left font-semibold text-accent-foreground/60">Origem</th>
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
                  const eventTitle = cert.event?.title || cert.subEvent?.title || 'Evento';
                  const isSubEvent = !!cert.subEventId;
                  const workload = cert.workload || "—";
                  const type = cert.type || "Participante";
                  const issuedAt = formatDate(cert.issueDate);
                  return (
                    <tr key={cert.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-accent-foreground font-medium">{participantName}</td>
                      <td className="px-4 py-3 text-accent-foreground/70">{eventTitle}</td>
                      <td className="px-4 py-3">
                        <OriginBadge isSubEvent={isSubEvent} />
                      </td>
                      <td className="px-4 py-3 text-accent-foreground/70">{workload}</td>
                      <td className="px-4 py-3 text-accent-foreground/70">{type}</td>
                      <td className="px-4 py-3 text-accent-foreground/70">{issuedAt}</td>
                      <td className="px-4 py-3"><StatusBadge issued={cert.issued} /></td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleView(cert.hash)} className="p-1.5 rounded-md bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-colors" title="Visualizar">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => handleDownload(cert.hash)} className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors" title="Baixar PDF">
                            <Download size={14} />
                          </button>
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
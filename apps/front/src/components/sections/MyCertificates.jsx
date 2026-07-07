import { useState, useEffect, useCallback } from "react";
import {
  GraduationCap, Eye, Download, Mail, CheckCircle, AlertCircle,
  Loader2, Calendar, Clock, User
} from "lucide-react";

const StatusBadge = ({ issued }) => {
  if (issued) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
        <CheckCircle size={12} /> Recebido
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
      <AlertCircle size={12} /> Aguardando envio
    </span>
  );
};

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
};

export default function MyCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(null);

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/certificates/my`, {
        credentials: "include",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Erro ${res.status}`);
      }
      const data = await res.json();
      // O backend retorna um array diretamente
      setCertificates(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Não foi possível carregar seus certificados.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const handleView = (hash) => {
    window.open(`/verify/${hash}`, "_blank");
  };

  const handleDownload = async (hash) => {
    setDownloading(hash);
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
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 size={32} className="animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-accent-foreground flex items-center gap-2">
            <GraduationCap size={24} className="text-purple-400" />
            Meus Certificados
          </h1>
          <p className="text-sm text-accent-foreground/60">
            {certificates.length === 0
              ? "Você ainda não possui certificados."
              : `${certificates.length} certificado${certificates.length > 1 ? "s" : ""}`
            }
          </p>
        </div>
        <button
          onClick={fetchCertificates}
          className="p-2 rounded-lg border border-border text-accent-foreground/60 hover:text-white hover:border-primary/30 transition-all"
          title="Atualizar"
        >
          <Loader2 size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-6">
          <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">✕</button>
        </div>
      )}

      {certificates.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl bg-[#11101B]">
          <GraduationCap size={48} className="text-[#3d3860] mx-auto mb-4" />
          <p className="font-bold text-accent-foreground text-lg">Nenhum certificado encontrado</p>
          <p className="text-sm text-accent-foreground/60 mt-1">
            Participe de eventos e faça check-in para receber seus certificados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map((cert) => {
            const title = cert.event?.title || cert.subEvent?.title || "Evento";
            const workload = cert.workload || "—";
            const type = cert.type || "Participante";
            const issuedAt = formatDate(cert.issueDate);
            const eventDate = cert.event?.date_start || cert.subEvent?.date_start;
            const eventDateFormatted = formatDate(eventDate);

            return (
              <div key={cert.id} className="bg-[#13111e] border border-border rounded-xl p-5 hover:border-purple-500/40 transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-base truncate">{title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        <Clock size={10} /> {workload}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <User size={10} /> {type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-xs text-accent-foreground/50">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {eventDateFormatted || "—"}
                      </span>
                      <span>•</span>
                      <span>Emissão: {issuedAt}</span>
                    </div>
                    <div className="mt-3">
                      <StatusBadge issued={cert.issued} />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  <button
                    onClick={() => handleView(cert.hash)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 transition-colors"
                  >
                    <Eye size={14} /> Visualizar
                  </button>
                  <button
                    onClick={() => handleDownload(cert.hash)}
                    disabled={downloading === cert.hash}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                  >
                    {downloading === cert.hash ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Download size={14} />
                    )}
                    Baixar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import {
  ShieldCheck, ShieldX, Search, Loader2, Award, Calendar,
  User, Building2, Clock, Copy, CheckCircle, ArrowLeft
} from "lucide-react";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

const REASON_MESSAGES = {
  invalid: "A assinatura deste certificado não pôde ser validada. Ele pode ter sido adulterado ou é falso.",
  not_found: "Este certificado não foi encontrado em nossa base de dados.",
  mismatch: "Os dados deste certificado não coincidem com nossos registros.",
};

export default function CertificateVerify({ initialResult = null, hash: initialHash = null }) {
  const [hash, setHash] = useState(initialHash || "");
  const [result, setResult] = useState(initialResult);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const verify = async (h) => {
    if (!h?.trim()) {
      setError("Informe o código do certificado");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/certificates/verify/${encodeURIComponent(h.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao verificar certificado");
      setResult(data.data);

      // Atualiza a URL para refletir o hash pesquisado, sem recarregar
      const newUrl = `/verify/${encodeURIComponent(h.trim())}`;
      window.history.pushState({}, "", newUrl);
    } catch (err) {
      setError(err.message || "Erro ao verificar certificado");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialHash) {
      verify(initialHash);
    }
  }, [initialHash]);

  const handleSubmit = (e) => {
    e.preventDefault();
    verify(hash);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="dark min-h-screen bg-[#0a0a0f] font-['Nunito',sans-serif] text-white">
      {/* NAV */}
      <nav className="sticky top-0 z-50 h-14 flex items-center justify-between px-6 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/[0.06]">
        <a href="/" className="text-[15px] font-black tracking-tight">
          e-<span className="text-violet-400">cert</span>
        </a>
        <a
          href="/"
          className="flex items-center gap-1.5 text-[12px] font-semibold text-[#6b6888] hover:text-white transition-colors"
        >
          <ArrowLeft size={12} /> Início
        </a>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={24} className="text-violet-400" />
          </div>
          <h1 className="text-[26px] font-black tracking-tight mb-2">Verificar Certificado</h1>
          <p className="text-[13.5px] text-[#6b6888]">
            Insira o código de verificação para checar a autenticidade de um certificado emitido pela e-cert.
          </p>
        </div>

        {/* Formulário de busca */}
        <form onSubmit={handleSubmit} className="bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-5 mb-6">
          <label className="block text-[11px] font-bold text-[#3d3860] uppercase tracking-widest mb-2">
            Código do certificado
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3d3860]" />
              <input
                type="text"
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                placeholder="Cole aqui o código do certificado"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0f0d1a] border border-white/[0.08] focus:border-violet-500/40 text-[13px] text-white placeholder-[#2e2c42] outline-none transition-all font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-[13px] transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : "Verificar"}
            </button>
          </div>
          {error && <p className="text-[12px] text-red-400 font-medium mt-2">{error}</p>}
        </form>

        {/* Estado: carregando */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-violet-400 mb-3" />
            <p className="text-[13px] text-[#6b6888]">Verificando certificado...</p>
          </div>
        )}

        {/* Estado: válido */}
        {!loading && result?.valid === true && (
          <div className="space-y-4">
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <CheckCircle size={22} className="text-emerald-400" />
              </div>
              <div>
                <h2 className="text-[16px] font-black text-emerald-400 tracking-tight">Certificado válido</h2>
                <p className="text-[12.5px] text-[#6b6888]">
                  Este certificado é autêntico e foi emitido pela plataforma e-cert.
                </p>
              </div>
            </div>

            <div className="bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.05]">
                <p className="text-[10px] font-bold text-[#3d3860] uppercase tracking-widest mb-1">Certificado emitido para</p>
                <h3 className="text-[19px] font-black text-white tracking-tight">
                  {result.certificate?.user?.name || "—"}
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <DetailRow
                  Icon={Award}
                  label="Evento"
                  value={result.certificate?.event?.title || result.certificate?.subEvent?.title || "—"}
                />
                {result.certificate?.subEvent && (
                  <DetailRow
                    Icon={Building2}
                    label="Atividade"
                    value={result.certificate.subEvent.title}
                  />
                )}
                <DetailRow
                  Icon={Calendar}
                  label="Data do evento"
                  value={formatDate(
                    result.certificate?.subEvent?.date_start || result.certificate?.event?.date_start
                  )}
                />
                <DetailRow Icon={Clock} label="Carga horária" value={result.certificate?.workload || "—"} />
                <DetailRow Icon={User} label="Tipo" value={result.certificate?.type || "Participante"} />
                <DetailRow
                  Icon={ShieldCheck}
                  label="Emitido em"
                  value={formatDate(result.certificate?.issueDate)}
                />
              </div>

              <div className="px-6 py-3 border-t border-white/[0.05] bg-[#0f0d1a] flex items-center justify-between gap-3">
                <p className="text-[10.5px] text-[#3d3860] font-mono truncate">
                  ID: {result.certificate?.id || "—"}
                </p>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6b6888] hover:text-white shrink-0 transition-colors cursor-pointer"
                >
                  {copied
                    ? <><CheckCircle size={11} className="text-emerald-400" /> Copiado</>
                    : <><Copy size={11} /> Copiar link</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Estado: inválido */}
        {!loading && result?.valid === false && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <ShieldX size={22} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-[16px] font-black text-red-400 tracking-tight">Certificado inválido</h2>
              <p className="text-[12.5px] text-[#6b6888]">
                {REASON_MESSAGES[result.reason] || "Não foi possível validar este certificado."}
              </p>
            </div>
          </div>
        )}

        {/* Estado inicial vazio */}
        {!loading && !result && !error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#13111e] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
              <Search size={22} className="text-[#3d3860]" />
            </div>
            <p className="text-[13px] text-[#3d3860]">
              Insira o código para verificar a autenticidade do certificado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-violet-600/10 border border-violet-500/15 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={13} className="text-violet-400" />
      </div>
      <div className="min-w-0">
        <p className="text-[10.5px] font-bold text-[#3d3860] uppercase tracking-wide">{label}</p>
        <p className="text-[13.5px] font-semibold text-white truncate">{value}</p>
      </div>
    </div>
  );
}
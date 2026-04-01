export default function CertCard({ name = "Ana Beatriz Ferreira", event = "Tech Summit Brasil 2025", hours = "16h", type = "Participante", date = "15 mar 2025", animate = true }) {
  return (
    <div className={`
      ${animate ? "float-cert" : ""}
      relative overflow-hidden max-w-[1980px]  text-center
      bg-gradient-to-br from-[#160d2e] via-[#0d0a1e] to-[#080b14]
      border border-[rgba(139,92,246,0.25)]
      rounded-[20px] p-12 px-[52px] py-12
      shadow-[0_0_0_1px_rgba(139,92,246,0.07),0_32px_80px_rgba(0,0,0,0.6),0_0_60px_rgba(124,58,237,0.12)]
    `}>
      {/* Top shimmer line */}
      <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-[rgba(167,139,250,0.7)] to-transparent" />
      
      {/* Corner ornaments */}
      {[["tl", { top: 16, left: 16 }], ["tr", { top: 16, right: 16 }], ["bl", { bottom: 16, left: 16 }], ["br", { bottom: 16, right: 16 }]].map(([k, pos]) => (
        <div 
          key={k} 
          className="absolute w-15 h-15 rounded-full border border-[rgba(167,139,250,0.1)]"
          style={pos}
        />
      ))}
      
      {/* Inner frame */}
      <div className="absolute inset-3 border border-[rgba(167,139,250,0.06)] rounded-xl pointer-events-none" />
      
      {/* Event title */}
      <div className="text-[10.5px] tracking-[0.18em] uppercase text-[rgba(167,139,250,0.5)] mb-5 font-semibold">
        {event.split(" ").slice(0, 3).join(" ")}
      </div>
      
      {/* Certify text */}
      <div className="text-[11px] tracking-[0.1em] uppercase text-white/20 mb-2 font-medium">
        Certificamos que
      </div>
      
      {/* Name */}
      <div className="font-['Nunito'] italic text-[38px] font-extrabold text-white tracking-[-0.5px] leading-[1.15] mb-1">
        {name}
      </div>
      
      {/* Divider */}
      <div className="w-40 h-px bg-gradient-to-r from-transparent via-[rgba(167,139,250,0.35)] to-transparent mx-auto mb-5" />
      
      {/* Description */}
      <div className="text-[13px] text-white/50 leading-relaxed max-w-[460px] mx-auto mb-7 font-normal">
        participou e concluiu com êxito o evento <strong className="text-white/60">{event}</strong>, com carga horária total de <strong className="text-white/60">{hours}</strong>.
      </div>
      
      {/* Meta row */}
      <div className="flex justify-center gap-7 mb-7 flex-wrap">
        {[["Carga Horária", hours], ["Tipo", type], ["Data", date], ["Validação", "✓ Blockchain"]].map(([label, val], i, arr) => (
          <div key={label} className="flex items-center gap-7">
            <div className="text-center">
              <div className="text-[10px] tracking-[0.12em] uppercase text-white/20 mb-1 font-semibold">{label}</div>
              <div className="text-[13px] font-semibold text-white/65">{val}</div>
            </div>
            {i < arr.length - 1 && <div className="w-px h-7 bg-[rgba(167,139,250,0.1)]" />}
          </div>
        ))}
      </div>
      
      {/* Seal */}
      <div className="w-14 h-14 rounded-full mx-auto mb-3.5 border-[1.5px] border-[rgba(167,139,250,0.25)] flex items-center justify-center bg-[rgba(124,58,237,0.08)] text-2xl shadow-[0_0_20px_rgba(124,58,237,0.2)] animate-pulse">
        🎓
      </div>
      
      {/* ID */}
      <div className="text-[9.5px] text-white/15 tracking-[0.1em] font-mono">
        ID: ECRT-2025-A4F7D2B1 · ecert.com.br/verify
      </div>
    </div>
  );
}
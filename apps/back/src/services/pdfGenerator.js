import React from 'react';
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Svg, Path, Circle } from '@react-pdf/renderer';

// ============================================================
// NENHUMA FONTE EXTERNA É REGISTRADA
// Usamos apenas fontes padrão do PDF: Helvetica, Helvetica-Bold,
// Times-Roman, Times-Bold, Courier
// (evitamos emojis — não renderizam nas fontes padrão do PDF)
// ============================================================

const COLORS = {
  bgOuter: '#0a0714',
  bgInner: '#160d2e',
  gold: '#d4af6a',
  goldSoft: 'rgba(212,175,106,0.55)',
  violet: '#a78bfa',
  violetSoft: 'rgba(167,139,250,0.5)',
  violetFaint: 'rgba(167,139,250,0.14)',
  textPrimary: '#f5f3ff',
  textSecondary: 'rgba(245,243,255,0.62)',
  textFaint: 'rgba(245,243,255,0.32)',
  textGhost: 'rgba(245,243,255,0.16)',
  hairline: 'rgba(167,139,250,0.22)',
};

const styles = StyleSheet.create({
  // ---- página / moldura externa ----
  page: {
    backgroundColor: COLORS.bgOuter,
    padding: 22,
    fontFamily: 'Helvetica',
  },
  outerBorder: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.goldSoft,
    borderRadius: 4,
    padding: 8,
  },
  innerCard: {
    flex: 1,
    backgroundColor: COLORS.bgInner,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    borderRadius: 3,
    paddingVertical: 26,
    paddingHorizontal: 56,
    position: 'relative',
    justifyContent: 'center',
  },

  // ---- ornamentos de canto ----
  cornerBase: {
    position: 'absolute',
    width: 34,
    height: 34,
  },
  cornerTL: { top: 14, left: 14 },
  cornerTR: { top: 14, right: 14 },
  cornerBL: { bottom: 14, left: 14 },
  cornerBR: { bottom: 14, right: 14 },

  // ---- cabeçalho ----
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gold,
    marginHorizontal: 8,
  },
  brandText: {
    fontSize: 9,
    letterSpacing: 3,
    color: COLORS.textFaint,
    fontFamily: 'Helvetica',
  },

  eventLabel: {
    fontSize: 10,
    letterSpacing: 2.6,
    textTransform: 'uppercase',
    color: COLORS.violetSoft,
    textAlign: 'center',
    marginBottom: 14,
    fontFamily: 'Helvetica-Bold',
  },

  certifyText: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: COLORS.textGhost,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Helvetica',
  },

  name: {
    fontSize: 30,
    fontFamily: 'Times-Bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: 12,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  dividerLine: {
    width: 90,
    height: 1,
    backgroundColor: COLORS.hairline,
  },
  dividerDiamond: {
    width: 6,
    height: 6,
    backgroundColor: COLORS.gold,
    marginHorizontal: 10,
    transform: 'rotate(45deg)',
  },

  description: {
    fontSize: 11.5,
    lineHeight: 1.6,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 420,
    marginHorizontal: 'auto',
    marginBottom: 18,
    fontFamily: 'Helvetica',
  },
  descriptionStrong: {
    color: COLORS.textPrimary,
    fontFamily: 'Helvetica-Bold',
  },

  // ---- bloco de metadados ----
  metaBox: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.hairline,
    paddingVertical: 12,
    marginBottom: 16,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaDivider: {
    width: 1,
    backgroundColor: COLORS.hairline,
  },
  metaLabel: {
    fontSize: 8,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: COLORS.textFaint,
    marginBottom: 6,
    fontFamily: 'Helvetica',
  },
  metaValue: {
    fontSize: 12.5,
    fontWeight: 700,
    color: COLORS.textPrimary,
    fontFamily: 'Helvetica-Bold',
  },

  // ---- selo ----
  sealWrap: {
    alignItems: 'center',
    marginBottom: 10,
  },
  sealOuter: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: COLORS.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealInner: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: COLORS.violetFaint,
    backgroundColor: 'rgba(124,58,237,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealMonogram: {
    fontSize: 14,
    color: COLORS.gold,
    fontFamily: 'Times-Bold',
    letterSpacing: 1,
  },

  // ---- rodapé ----
  footer: {
    alignItems: 'center',
  },
  footerId: {
    fontSize: 8.5,
    color: COLORS.textGhost,
    fontFamily: 'Courier',
    letterSpacing: 1,
    marginBottom: 3,
  },
  footerVerify: {
    fontSize: 8,
    color: COLORS.textGhost,
    fontFamily: 'Helvetica',
    letterSpacing: 0.5,
  },

  // ---- assinaturas ----
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 70,
    marginBottom: 16,
    marginTop: 0,
  },
  signatureBlock: {
    alignItems: 'center',
    width: 170,
  },
  signatureLine: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.hairline,
    marginBottom: 6,
  },
  signatureName: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  signatureRole: {
    fontSize: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: COLORS.textFaint,
    textAlign: 'center',
  },
});

// ── Ornamento de canto (SVG sem JSX) ──────────────────────
function CornerOrnament({ style, rotate = 0 }) {
  return React.createElement(
    View,
    { style: [styles.cornerBase, style] },
    React.createElement(
      Svg,
      {
        width: 34,
        height: 34,
        viewBox: '0 0 34 34',
        style: { transform: `rotate(${rotate}deg)` },
      },
      React.createElement(Path, {
        d: 'M2 2 L2 14 M2 2 L14 2',
        stroke: COLORS.goldSoft,
        strokeWidth: 1,
        fill: 'none',
      }),
      React.createElement(Circle, { cx: 2, cy: 2, r: 2, fill: COLORS.gold })
    )
  );
}

// ── Componente principal do certificado (sem JSX) ──────────
const CertificatePDF = ({
  name,
  event,
  hours,
  type,
  date,
  hash,
  issuer,
  signatureName,
  signatureRole,
}) => {
  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', orientation: 'landscape', style: styles.page },
      React.createElement(
        View,
        { style: styles.outerBorder },
        React.createElement(
          View,
          { style: styles.innerCard },
          // Cantos
          React.createElement(CornerOrnament, { style: styles.cornerTL, rotate: 0 }),
          React.createElement(CornerOrnament, { style: styles.cornerTR, rotate: 90 }),
          React.createElement(CornerOrnament, { style: styles.cornerBR, rotate: 180 }),
          React.createElement(CornerOrnament, { style: styles.cornerBL, rotate: 270 }),

          // Marca
          React.createElement(
            View,
            { style: styles.brandRow },
            React.createElement(Text, { style: styles.brandText }, 'E-CERT'),
            React.createElement(View, { style: styles.brandDot }),
            React.createElement(Text, { style: styles.brandText }, 'CERTIFICADO DIGITAL')
          ),

          // Nome do evento
          React.createElement(
            Text,
            { style: styles.eventLabel },
            (event || '').split(' ').slice(0, 6).join(' ')
          ),

          React.createElement(Text, { style: styles.certifyText }, 'Certificamos que'),

          React.createElement(Text, { style: styles.name }, name),

          // Divisor
          React.createElement(
            View,
            { style: styles.dividerRow },
            React.createElement(View, { style: styles.dividerLine }),
            React.createElement(View, { style: styles.dividerDiamond }),
            React.createElement(View, { style: styles.dividerLine })
          ),

          // Descrição
          React.createElement(
            Text,
            { style: styles.description },
            'participou e concluiu com êxito o evento ',
            React.createElement(Text, { style: styles.descriptionStrong }, event),
            issuer
              ? React.createElement(
                  React.Fragment,
                  null,
                  ', promovido por ',
                  React.createElement(Text, { style: styles.descriptionStrong }, issuer)
                )
              : null,
            ', com carga horária total de ',
            React.createElement(Text, { style: styles.descriptionStrong }, hours),
            '.'
          ),

          // Metadados
          React.createElement(
            View,
            { style: styles.metaBox },
            // Carga Horária
            React.createElement(
              View,
              { style: styles.metaItem },
              React.createElement(Text, { style: styles.metaLabel }, 'Carga Horária'),
              React.createElement(Text, { style: styles.metaValue }, hours)
            ),
            React.createElement(View, { style: styles.metaDivider }),
            // Tipo
            React.createElement(
              View,
              { style: styles.metaItem },
              React.createElement(Text, { style: styles.metaLabel }, 'Tipo'),
              React.createElement(Text, { style: styles.metaValue }, type)
            ),
            React.createElement(View, { style: styles.metaDivider }),
            // Data
            React.createElement(
              View,
              { style: styles.metaItem },
              React.createElement(Text, { style: styles.metaLabel }, 'Data'),
              React.createElement(Text, { style: styles.metaValue }, date)
            ),
            React.createElement(View, { style: styles.metaDivider }),
            // Validação
            React.createElement(
              View,
              { style: styles.metaItem },
              React.createElement(Text, { style: styles.metaLabel }, 'Validação'),
              React.createElement(Text, { style: styles.metaValue }, 'Blockchain')
            )
          ),

          // Assinaturas
          React.createElement(
            View,
            { style: styles.signatureRow },
            React.createElement(
              View,
              { style: styles.signatureBlock },
              React.createElement(View, { style: styles.signatureLine }),
              React.createElement(
                Text,
                { style: styles.signatureName },
                signatureName || issuer || 'Organização do evento'
              ),
              React.createElement(Text, { style: styles.signatureRole }, signatureRole || 'Organizador')
            ),
            React.createElement(
              View,
              { style: styles.signatureBlock },
              React.createElement(View, { style: styles.signatureLine }),
              React.createElement(Text, { style: styles.signatureName }, 'e-cert'),
              React.createElement(Text, { style: styles.signatureRole }, 'Plataforma emissora')
            )
          ),

          // Selo
          React.createElement(
            View,
            { style: styles.sealWrap },
            React.createElement(
              View,
              { style: styles.sealOuter },
              React.createElement(
                View,
                { style: styles.sealInner },
                React.createElement(Text, { style: styles.sealMonogram }, 'EC')
              )
            )
          ),

          // Rodapé
          React.createElement(
            View,
            { style: styles.footer },
            React.createElement(
              Text,
              { style: styles.footerId },
              'ID: ECRT-' + (hash || '').slice(0, 8).toUpperCase()
            ),
            React.createElement(
              Text,
              { style: styles.footerVerify },
              'Verifique a autenticidade em ecert.com.br/verify'
            )
          )
        )
      )
    )
  );
};

/**
 * Gera um buffer PDF a partir dos dados do certificado
 * @param {Object} params
 * @param {string} params.name - Nome do participante
 * @param {string} params.event - Título do evento
 * @param {string} params.hours - Carga horária (ex: "16h")
 * @param {string} params.type - Tipo (ex: "Participante")
 * @param {string} params.date - Data formatada
 * @param {string} params.hash - Hash do certificado
 * @param {string} [params.issuer] - Nome do organizador/instituição emissora
 * @param {string} [params.signatureName] - Nome exibido na linha de assinatura
 * @param {string} [params.signatureRole] - Cargo exibido abaixo da assinatura
 * @returns {Promise<Buffer>}
 */
export const generateCertificatePDF = async ({
  name,
  event,
  hours,
  type,
  date,
  hash,
  issuer,
  signatureName,
  signatureRole,
}) => {
  const pdfBuffer = await renderToBuffer(
    React.createElement(CertificatePDF, {
      name,
      event,
      hours,
      type,
      date,
      hash,
      issuer,
      signatureName,
      signatureRole,
    })
  );
  return pdfBuffer;
};
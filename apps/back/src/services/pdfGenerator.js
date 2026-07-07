import React from 'react';
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// ============================================================
// NENHUMA FONTE EXTERNA É REGISTRADA
// Usamos fontes padrão do PDF: Helvetica, Times-Roman, Courier
// ============================================================

const styles = StyleSheet.create({
  page: {
    padding: 50,
    backgroundColor: '#160d2e',
    color: 'white',
    fontFamily: 'Helvetica', // Fonte padrão
  },
  title: {
    fontSize: 10.5,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: 'rgba(167,139,250,0.5)',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 600,
    fontFamily: 'Helvetica',
  },
  certifyText: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.2)',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 500,
    fontFamily: 'Helvetica',
  },
  name: {
    fontSize: 38,
    fontFamily: 'Helvetica',
    fontWeight: 800,
    color: 'white',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 1.15,
    marginBottom: 5,
    // Sem fontStyle: 'italic' (não disponível em Helvetica padrão)
  },
  divider: {
    width: 160,
    height: 1,
    backgroundColor: 'rgba(167,139,250,0.35)',
    marginHorizontal: 'auto',
    marginBottom: 20,
  },
  description: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 1.6,
    maxWidth: 460,
    marginHorizontal: 'auto',
    marginBottom: 28,
    fontWeight: 400,
    fontFamily: 'Helvetica',
  },
  descriptionStrong: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: 700,
    fontFamily: 'Helvetica',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 28,
    marginBottom: 28,
    flexWrap: 'wrap',
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.2)',
    marginBottom: 4,
    fontWeight: 600,
    fontFamily: 'Helvetica',
  },
  metaValue: {
    fontSize: 13,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.65)',
    fontFamily: 'Helvetica',
  },
  seal: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(167,139,250,0.25)',
    backgroundColor: 'rgba(124,58,237,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 'auto',
    marginBottom: 14,
  },
  sealText: {
    fontSize: 24,
    fontFamily: 'Helvetica',
  },
  footerId: {
    fontSize: 9.5,
    color: 'rgba(255,255,255,0.15)',
    textAlign: 'center',
    fontFamily: 'Courier', // Courier é padrão para IDs
    letterSpacing: 1,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: '15%',
    right: '15%',
    height: 1,
    backgroundColor: 'rgba(167,139,250,0.7)',
  },
  corner: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.1)',
  },
  cornerTopLeft: { top: 16, left: 16 },
  cornerTopRight: { top: 16, right: 16 },
  cornerBottomLeft: { bottom: 16, left: 16 },
  cornerBottomRight: { bottom: 16, right: 16 },
  innerFrame: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    bottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.06)',
    borderRadius: 12,
  },
});

// Componente PDF usando React.createElement (sem JSX)
const CertificatePDF = ({ name, event, hours, type, date, hash }) => {
  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(View, { style: styles.shimmer }),
      React.createElement(View, { style: [styles.corner, styles.cornerTopLeft] }),
      React.createElement(View, { style: [styles.corner, styles.cornerTopRight] }),
      React.createElement(View, { style: [styles.corner, styles.cornerBottomLeft] }),
      React.createElement(View, { style: [styles.corner, styles.cornerBottomRight] }),
      React.createElement(View, { style: styles.innerFrame }),
      React.createElement(Text, { style: styles.title }, event.split(' ').slice(0, 3).join(' ')),
      React.createElement(Text, { style: styles.certifyText }, 'Certificamos que'),
      React.createElement(Text, { style: styles.name }, name),
      React.createElement(View, { style: styles.divider }),
      React.createElement(
        Text,
        { style: styles.description },
        'participou e concluiu com êxito o evento ',
        React.createElement(Text, { style: styles.descriptionStrong }, event),
        ', com carga horária total de ',
        React.createElement(Text, { style: styles.descriptionStrong }, hours),
        '.'
      ),
      React.createElement(
        View,
        { style: styles.metaRow },
        React.createElement(
          View,
          { style: styles.metaItem },
          React.createElement(Text, { style: styles.metaLabel }, 'Carga Horária'),
          React.createElement(Text, { style: styles.metaValue }, hours)
        ),
        React.createElement(
          View,
          { style: styles.metaItem },
          React.createElement(Text, { style: styles.metaLabel }, 'Tipo'),
          React.createElement(Text, { style: styles.metaValue }, type)
        ),
        React.createElement(
          View,
          { style: styles.metaItem },
          React.createElement(Text, { style: styles.metaLabel }, 'Data'),
          React.createElement(Text, { style: styles.metaValue }, date)
        ),
        React.createElement(
          View,
          { style: styles.metaItem },
          React.createElement(Text, { style: styles.metaLabel }, 'Validação'),
          React.createElement(Text, { style: styles.metaValue }, '✓ Blockchain')
        )
      ),
      React.createElement(
        View,
        { style: styles.seal },
        React.createElement(Text, { style: styles.sealText }, '🎓')
      ),
      React.createElement(
        Text,
        { style: styles.footerId },
        `ID: ECRT-${hash.slice(0, 8).toUpperCase()} · ecert.com.br/verify`
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
 * @returns {Promise<Buffer>}
 */
export const generateCertificatePDF = async ({ name, event, hours, type, date, hash }) => {
  const pdfStream = await renderToBuffer(
    React.createElement(CertificatePDF, { name, event, hours, type, date, hash })
  );
  return pdfStream;
};
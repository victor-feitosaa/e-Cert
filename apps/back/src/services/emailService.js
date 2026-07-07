// apps/back/src/services/emailService.js
import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    // Opcional: usar variáveis de ambiente para mais segurança
    this.user = process.env.EMAIL_USER || 'mail.cert.e@gmail.com';
    this.pass = process.env.EMAIL_PASS || 'iafdcbjjvyumyomf';
  }

  createTransport() {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.user,
        pass: this.pass,
      },
    });
  }

  /**
   * Envia um e-mail com opção de anexo
   * @param {string} to - E-mail do destinatário
   * @param {string} subject - Assunto do e-mail
   * @param {string} html - Conteúdo HTML do e-mail
   * @param {Buffer|Object} attachment - Arquivo para anexar (ex: PDF buffer)
   * @param {string} filename - Nome do arquivo anexado
   */
  async sendEmail(to, subject, html, attachment = null, filename = 'certificado.pdf') {
    const mailOptions = {
      from: this.user,
      to,
      subject,
      html,
      attachments: attachment
        ? [
            {
              filename,
              content: attachment,
              contentType: 'application/pdf',
            },
          ]
        : [],
    };

    try {
      const info = await this.createTransport().sendMail(mailOptions);
      console.log('✅ E-mail enviado:', info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Erro ao enviar e-mail:', error);
      throw error;
    }
  }

  /**
   * Método específico para enviar certificados
   * @param {string} to - E-mail do participante
   * @param {string} name - Nome do participante
   * @param {string} eventTitle - Título do evento
   * @param {string} hash - Hash do certificado (para link de verificação)
   * @param {Buffer} pdfBuffer - Buffer do PDF gerado
   */
  async sendCertificate(to, name, eventTitle, hash, pdfBuffer) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4321';
    const subject = `🎓 Seu certificado - ${eventTitle}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0A0A0F; color: #e8e4ff; border-radius: 12px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid rgba(139,92,246,0.2);">
          <h1 style="font-size: 24px; font-weight: 800; background: linear-gradient(135deg, #8b5cf6, #9333ea); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0;">
            e-Cert
          </h1>
          <p style="color: rgba(167,139,250,0.6); font-size: 14px; margin: 4px 0 0;">
            Sistema de Certificação Digital
          </p>
        </div>

        <div style="padding: 24px 0;">
          <h2 style="color: #fff; font-size: 22px; margin: 0 0 8px;">
            Olá, ${name || 'Participante'}! 👋
          </h2>
          <p style="color: rgba(255,255,255,0.7); font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
            Seu certificado do evento <strong style="color: #a78bfa;">${eventTitle}</strong> está pronto para download.
          </p>

          <div style="background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.2); border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin: 0;">
              <strong style="color: #a78bfa;">🔗 Verificação:</strong> Qualquer pessoa pode verificar a autenticidade do seu certificado no link abaixo:
            </p>
            <a href="${frontendUrl}/verify/${hash}" 
               style="display: inline-block; margin-top: 8px; color: #a78bfa; text-decoration: none; border: 1px solid rgba(139,92,246,0.3); padding: 8px 16px; border-radius: 6px; font-size: 14px; background: rgba(139,92,246,0.05);">
              🔍 Verificar certificado
            </a>
          </div>

          <div style="background: rgba(52,211,153,0.08); border: 1px solid rgba(52,211,153,0.2); border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin: 0;">
              📎 O PDF do seu certificado está anexado a este e-mail.
            </p>
          </div>
        </div>

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid rgba(139,92,246,0.1); color: rgba(255,255,255,0.3); font-size: 12px;">
          <p style="margin: 0;">
            Este é um e-mail automático. Por favor, não responda.
          </p>
          <p style="margin: 4px 0 0;">
            © ${new Date().getFullYear()} e-Cert - Todos os direitos reservados.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail(to, subject, htmlContent, pdfBuffer, `certificado-${hash.slice(0,8)}.pdf`);
  }
}

export default new EmailService();
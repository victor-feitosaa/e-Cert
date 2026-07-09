// apps/back/src/services/emailService.js
import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
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

  async sendCertificate(to, name, eventTitle, hash, pdfBuffer) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4321';
    const subject = `Seu certificado - ${eventTitle}`;
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #080B14; color: #E8E4FF; border-radius: 16px; overflow: hidden; border: 1px solid rgba(139,92,246,0.15);">
        
        <!-- HEADER -->
        <div style="text-align: center; padding: 32px 24px 24px; background: linear-gradient(135deg, #0A0A0F 0%, #11101B 100%); border-bottom: 1px solid rgba(139,92,246,0.15);">
          <h1 style="font-size: 28px; font-weight: 800; margin: 0; background: linear-gradient(135deg, #A78BFA, #8B5CF6, #7C3AED); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.5px;">
            e-Cert
          </h1>
          <p style="color: rgba(167,139,250,0.5); font-size: 13px; margin: 4px 0 0; letter-spacing: 1px; text-transform: uppercase; font-weight: 600;">
            Sistema de Certificação Digital
          </p>
        </div>

        <!-- BODY -->
        <div style="padding: 32px 28px 24px; background: #0A0A0F;">
          <h2 style="color: #FFFFFF; font-size: 22px; font-weight: 700; margin: 0 0 6px;">
            Olá, ${name || 'Participante'}!
          </h2>
          <p style="color: rgba(255,255,255,0.7); font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
            Seu certificado do evento <strong style="color: #A78BFA;">${eventTitle}</strong> está pronto para download.
          </p>

          <!-- VERIFICAÇÃO -->
          <div style="background: rgba(139,92,246,0.06); border: 1px solid rgba(139,92,246,0.2); border-radius: 10px; padding: 18px 20px; margin-bottom: 16px;">
            <p style="color: rgba(255,255,255,0.65); font-size: 14px; margin: 0 0 10px;">
              <strong style="color: #A78BFA;">Verificação:</strong> Qualquer pessoa pode verificar a autenticidade do seu certificado no link abaixo:
            </p>
            <a href="${frontendUrl}/verify/${hash}" 
               style="display: inline-block; color: #A78BFA; text-decoration: none; border: 1px solid rgba(139,92,246,0.35); padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; background: rgba(139,92,246,0.08); transition: all 0.2s;">
              Verificar certificado
            </a>
          </div>

          <!-- ANEXO -->
          <div style="background: rgba(52,211,153,0.06); border: 1px solid rgba(52,211,153,0.15); border-radius: 10px; padding: 16px 20px; margin-bottom: 20px;">
            <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin: 0;">
              <strong style="color: #6EE7B7;">PDF do seu certificado</strong> está anexado a este e-mail.
            </p>
          </div>

          <!-- DIVISOR -->
          <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(139,92,246,0.2), transparent); margin: 24px 0 16px;"></div>

          <!-- FOOTER -->
          <div style="text-align: center; color: rgba(255,255,255,0.25); font-size: 12px; line-height: 1.6;">
            <p style="margin: 0;">
              Este é um e-mail automático. Por favor, não responda.
            </p>
            <p style="margin: 2px 0 0;">
              © ${new Date().getFullYear()} e-Cert — Todos os direitos reservados.
            </p>
            <p style="margin: 4px 0 0; font-size: 10px; color: rgba(255,255,255,0.15);">
              <span style="opacity: 0.5;">|</span> 
              Certificado digital assinado com JWT 
              <span style="opacity: 0.5;">|</span>
            </p>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail(to, subject, htmlContent, pdfBuffer, `certificado-${hash.slice(0,8)}.pdf`);
  }
}

export default new EmailService();
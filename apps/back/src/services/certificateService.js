import CertificateRepository from '../repository/CertificateRepository.js';
import EventRepository from '../repository/EventRepository.js';
import SubEventRepository from '../repository/SubEventRepository.js';
import emailService from "./emailService.js";
import jwt from 'jsonwebtoken';
import { generateCertificatePDF } from './pdfGenerator.js';

class CertificateService {
  // Gera um hash único para o certificado usando JWT
  generateCertificateHash(userId, eventId, subEventId = null) {
    // Payload com dados imutáveis
    const payload = {
      userId,
      eventId,
      subEventId,
      issuedAt: Date.now(),
    };
    // Assina com JWT_SECRET. Validade de 10 anos para arquivamento histórico.
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '10y' });
  }

  // Verifica se o hash é válido e retorna o payload decodificado
  verifyCertificateHash(hash) {
    try {
      return jwt.verify(hash, process.env.JWT_SECRET);
    } catch (error) {
      return null; // Hash inválido ou adulterado
    }
  }

  // Gera certificados para um evento específico (para todos os participantes com check-in)
  async generateCertificatesForEvent(eventId, operatorId, options = {}) {
    // 1. Verifica se o evento existe e se já terminou

    const { workload, type, title } = options;
    const event = await EventRepository.getById(eventId);
    if (!event) throw new Error('Evento não encontrado.');
    
    const now = new Date();
    if (event.date_end && new Date(event.date_end) > now) {
      throw new Error('O evento ainda não terminou. Certificados só podem ser gerados após o término.');
    }

    // 2. Busca todos os participantes com check-in confirmado
    const attendances = await CertificateRepository.findEligibleParticipantsForEvent(eventId);
    if (attendances.length === 0) {
      return { message: 'Nenhum participante com check-in encontrado.', generated: 0 };
    }

    let generatedCount = 0;
    for (const attendance of attendances) {
      const user = attendance.user;
      // Evita duplicidade
      const existing = await CertificateRepository.findCertificate(user.id, eventId, null);
      if (existing) continue;

      // Gera o hash
      const hash = this.generateCertificateHash(user.id, eventId, null);
      
      // Cria o registro no banco
      await CertificateRepository.createCertificate({
        userId: user.id,
        eventId: eventId,
        workload: `${event.totalHours || '8'}h`, // Pode vir do evento ou calcular dinamicamente
        type: 'Participante',
        hash: hash,
        participantId: attendance.id, // link com o EventParticipant
      });
      generatedCount++;
    }

    return { message: `Certificados gerados com sucesso!`, generated: generatedCount };
  }

  // Gera certificados para um subevento específico
  // src/services/certificateService.js

  async generateCertificatesForSubEvent(subEventId, operatorId, options = {}) {
    const { workload, type, title, sectionId } = options;
    const subEvent = await SubEventRepository.findById(subEventId);
    if (!subEvent) throw new Error('Subevento não encontrado.');
    
    
    const eventId = subEvent.eventId;

    const event = await EventRepository.getById(eventId);
    if (event.date_end && new Date(event.date_end) > new Date()) {
      throw new Error('O evento principal ainda não terminou.');
    }

    let attendances;
    if (sectionId) {
      attendances = await CertificateRepository.findEligibleParticipantsForSection(sectionId);
    } else {
      attendances = await CertificateRepository.findEligibleParticipantsForSubEvent(subEventId);
    }

    if (attendances.length === 0) {
      return { message: 'Nenhum participante com check-in neste subevento/seção.', generated: 0 };
    }

    let generatedCount = 0;
    for (const attendance of attendances) {
      const user = attendance.user;
      const existing = await CertificateRepository.findCertificate(user.id, null, subEventId);
      if (existing) continue;

      const hash = this.generateCertificateHash(user.id, null, subEventId);
      await CertificateRepository.createCertificate({
        userId: user.id,
        eventId: eventId,              
        subEventId: subEventId,
        workload: workload || `${subEvent.totalHours || '4'}h`,
        type: type || 'Participante',
        hash: hash,
      });
      generatedCount++;
    }

    return { message: `Certificados do subevento gerados!`, generated: generatedCount };
  }

  // Envia certificados por e-mail (integração com Nodemailer)
  // Placeholder: Você pode chamar esta função após a geração ou em um job agendado.
  async sendCertificateEmail(certificateId) {
  const certificate = await CertificateRepository.findCertificateById(certificateId);
  if (!certificate) throw new Error('Certificado não encontrado');

  // Gera o PDF
  const pdfBuffer = await this.generatePDF(certificate);

  // Envia o e-mail
  const user = certificate.user;
  const eventTitle = certificate.event?.title || certificate.subEvent?.title || 'Evento';
  
  await emailService.sendCertificate(
    user.email,
    user.name || 'Participante',
    eventTitle,
    certificate.hash,
    pdfBuffer
  );

  // Marca como enviado
  await CertificateRepository.markAsIssued(certificateId);
  return { message: 'E-mail enviado com sucesso', certificateId };
}


  async generatePDF(certificate) {
  const user = certificate.user;
  const eventTitle = certificate.event?.title || certificate.subEvent?.title || 'Evento';
  const date = certificate.event?.date_start || certificate.subEvent?.date_start || new Date();
  const dateFormatted = new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  
  return generateCertificatePDF({
    name: user.name || 'Participante',
    event: eventTitle,
    hours: certificate.workload || '—',
    type: certificate.type || 'Participante',
    date: dateFormatted,
    hash: certificate.hash,
  });
}


}

export default new CertificateService();
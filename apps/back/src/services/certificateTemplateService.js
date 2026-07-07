import CertificateTemplateRepository from '../repository/CertificateTemplateRepository.js';
import CertificateRepository from '../repository/CertificateRepository.js';
import CertificateService from './CertificateService.js';
import EventRepository from '../repository/EventRepository.js';
import SubEventRepository from '../repository/SubEventRepository.js';

class CertificateTemplateService {
  async createTemplate(eventId, subEventId, data) {
    const event = await EventRepository.getById(eventId);
    if (!event) throw new Error('Evento não encontrado.');

    // Se subEventId for fornecido, verifica se pertence ao evento
    if (subEventId) {
      const sub = await SubEventRepository.findById(subEventId);
      if (!sub || sub.eventId !== eventId) {
        throw new Error('Subevento inválido para este evento.');
      }
    }

    return CertificateTemplateRepository.create({
      eventId,
      subEventId: subEventId || null,
      title: data.title || null,
      workload: data.workload,
      type: data.type || 'Participante',
    });
  }

  async listTemplates(eventId) {
    return CertificateTemplateRepository.findByEvent(eventId);
  }

  async getTemplate(id) {
    return CertificateTemplateRepository.findById(id);
  }

  async updateTemplate(id, data) {
    return CertificateTemplateRepository.update(id, data);
  }

  async deleteTemplate(id) {
    return CertificateTemplateRepository.delete(id);
  }

  // Gera certificados a partir de um template, apenas para participantes com check-in confirmado
  async generateCertificatesFromTemplate(templateId, operatorId) {
    const template = await CertificateTemplateRepository.findById(templateId);
    if (!template) throw new Error('Template não encontrado.');

    const eventId = template.eventId;
    const subEventId = template.subEventId;

    // Verifica se o evento já terminou (opcional, pode remover se quiser gerar antes)
    const event = await EventRepository.getById(eventId);
    if (event.date_end && new Date(event.date_end) > new Date()) {
      throw new Error('O evento ainda não terminou. Certificados só podem ser gerados após o término.');
    }

    // Busca participantes com check-in confirmado
    let attendees;
    if (subEventId) {
      // Para subevento: busca participantes com check-in em qualquer seção do subevento
      attendees = await CertificateRepository.findEligibleParticipantsForSubEvent(subEventId);
    } else {
      // Para evento principal: busca participantes com check-in no evento
      attendees = await CertificateRepository.findEligibleParticipantsForEvent(eventId);
    }

    if (attendees.length === 0) {
      return { message: 'Nenhum participante com check-in encontrado.', generated: 0 };
    }

    let generatedCount = 0;
    for (const attendance of attendees) {
      const user = attendance.user;
      // Verifica se já existe certificado para este usuário/evento (evita duplicidade)
      const existing = await CertificateRepository.findCertificate(
        user.id,
        subEventId ? null : eventId,
        subEventId || null
      );
      if (existing) continue;

      // Gera hash JWT
      const hash = CertificateService.generateCertificateHash(user.id, eventId, subEventId);

      // Cria o certificado baseado no template
      await CertificateRepository.createCertificate({
        userId: user.id,
        eventId: subEventId ? null : eventId,
        subEventId: subEventId || null,
        participantId: attendance.id,
        workload: template.workload,
        type: template.type,
        hash: hash,
        templateId: template.id, // opcional
      });
      generatedCount++;
    }

    return { message: `Certificados gerados com sucesso a partir do template!`, generated: generatedCount };
  }
}

export default new CertificateTemplateService();
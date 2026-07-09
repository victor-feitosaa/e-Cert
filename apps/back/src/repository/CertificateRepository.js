import {prisma} from '../config/db.js';

class CertificateRepository {
  // Busca um certificado já existente para evitar duplicidade
  async findCertificate(userId, eventId, subEventId) {
    return prisma.certificate.findFirst({
      where: {
        userId,
        eventId: eventId || undefined,
        subEventId: subEventId || undefined,
      },
    });
  }

  // Cria um novo certificado
  async createCertificate(data) {
    return prisma.certificate.create({
      data: {
        userId: data.userId,
        eventId: data.eventId,
        subEventId: data.subEventId,
        participantId: data.participantId,
        workload: data.workload,
        type: data.type || 'Participante',
        hash: data.hash,
      },
    });
  }

  // Busca participantes com check-in confirmado no evento
  async findEligibleParticipantsForEvent(eventId) {
    // Considera como elegível quem tem registro de attendance com 'attended: true'
    return prisma.eventAttendance.findMany({
      where: {
        eventId,
        attended: true,
      },
      include: {
        user: true, // traz nome, email, etc.
      },
    });
  }

  // Busca participantes com check-in confirmado em um subevento (seções)
  async findEligibleParticipantsForSubEvent(subEventId) {
    // Para subeventos, verificamos se o usuário tem attendance em pelo menos uma seção
    // (ou podemos exigir todas as seções – a regra fica a critério do negócio).
    // Vamos considerar que se ele fez check-in em qualquer seção do subevento, está elegível.
    return prisma.sectionAttendance.findMany({
      where: {
        section: {
          subEventId,
        },
        attended: true,
      },
      include: {
        user: true,
        section: {
          include: {
            subEvent: true,
          },
        },
      },
      distinct: ['userId'], // Evita duplicar o mesmo usuário se ele tiver várias seções
    });
  }

  // Atualiza o campo 'issued' para true (após envio do e-mail)
  async markAsIssued(certificateId) {
    return prisma.certificate.update({
      where: { id: certificateId },
      data: { issued: true },
    });
  }

  // Busca certificados de um usuário específico
  async findCertificatesByUser(userId) {
    return prisma.certificate.findMany({
      where: { userId },
      include: {
        event: true,
        subEvent: true,
      },
      orderBy: { issueDate: 'desc' },
    });
  }

  // Busca certificados de um evento (para listagem administrativa)
  async findCertificatesByEvent(eventId) {
    return prisma.certificate.findMany({
      where: { eventId },
      include: { user: true },
    });
  }

  // Busca certificado pelo hash (para verificação pública)
  async findCertificateByHash(hash) {
    return prisma.certificate.findUnique({
      where: { hash },
      include: {
        user: true,
        event: true,
        subEvent: true,
      },
    });
  }

  async findCertificateById(id) {
    return prisma.certificate.findUnique({
      where: { id },
      include: {
        user: true,
        event: true,
        subEvent: true,
      },
    });
  }


  async countEligibleParticipants(eventId) {
    return prisma.eventAttendance.count({
      where: {
        eventId,
        attended: true,
      },
    });
  }

  async countCertificatesByEvent(eventId) {
    return prisma.certificate.count({
      where: { eventId },
    });
  }

}


export default new CertificateRepository();
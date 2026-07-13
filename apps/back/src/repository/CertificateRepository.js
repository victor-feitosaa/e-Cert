import {prisma} from '../config/db.js';

class CertificateRepository {
  // Busca um certificado já existente para evitar duplicidade
  // CertificateRepository.js

  async findCertificate(userId, eventId, subEventId) {
    const where = { userId };
    if (eventId) where.eventId = eventId;
    if (subEventId !== undefined && subEventId !== null) {
      where.subEventId = subEventId;
    } else if (subEventId === null) {
      where.subEventId = null;
    }
    // Se subEventId for undefined, não incluir no where (comportamento original)
    return prisma.certificate.findFirst({ where });
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
    // 1. Participantes com check-in no evento principal
    const eventAttendances = await prisma.eventAttendance.findMany({
      where: { eventId, attended: true },
      include: { user: true },
      distinct: ['userId'],
    });

    // 2. Participantes com check-in em seções do evento
    const sectionAttendances = await prisma.sectionAttendance.findMany({
      where: {
        section: { subEvent: { eventId } },
        attended: true,
      },
      include: { user: true },
      distinct: ['userId'],
    });

    // Combinar e remover duplicatas (um usuário pode ter check-in em ambos)
    const allMap = new Map();
    [...eventAttendances, ...sectionAttendances].forEach(att => {
      if (!allMap.has(att.userId)) {
        allMap.set(att.userId, att);
      }
    });

    // Retornar no formato que o service espera (array com { id, userId, user })
    return Array.from(allMap.values()).map(att => ({
      id: att.id,          // pode ser ID do EventAttendance ou SectionAttendance
      userId: att.userId,
      user: att.user,
    }));
  }

  // Busca participantes com check-in confirmado em um subevento (seções)
  async findEligibleParticipantsForSubEvent(subEventId) {
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
    distinct: ['userId'],
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
      where: {
        OR: [
          { eventId: eventId },                         // diretos
          { subEvent: { eventId: eventId } }            // indiretos via subevento
        ]
      },
      include: {
        user: true,
        event: true,
        subEvent: true,
      },
      orderBy: { issueDate: 'desc' },
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

  async findEligibleParticipantsForSection(sectionId) {
  return prisma.sectionAttendance.findMany({
    where: {
      sectionId,
      attended: true,
    },
    include: {
      user: true,
      section: true,
    },
    distinct: ['userId'],
  });
}

async countEligibleAll(eventId) {
  // Buscar IDs de usuários com check-in no evento principal
  const eventAttendances = await prisma.eventAttendance.findMany({
    where: { eventId, attended: true },
    select: { userId: true },
    distinct: ['userId'],
  });

  // Buscar IDs de usuários com check-in em seções do evento
  const sectionAttendances = await prisma.sectionAttendance.findMany({
    where: {
      section: { subEvent: { eventId } },
      attended: true,
    },
    select: { userId: true },
    distinct: ['userId'],
  });

  // Combinar e contar únicos
  const allUserIds = new Set([
    ...eventAttendances.map(a => a.userId),
    ...sectionAttendances.map(a => a.userId),
  ]);
  return allUserIds.size;
}

// Contar certificados únicos por evento (já existe, mas com OR)
async countCertificatesByEvent(eventId) {
  return prisma.certificate.count({
    where: {
      OR: [
        { eventId: eventId },
        { subEvent: { eventId: eventId } }
      ]
    }
  });
}



async findByHash(hash) {
  return prisma.certificate.findUnique({
    where: { hash },
    include: {
      user: { select: { id: true, name: true, email: true } },
      event: { select: { id: true, title: true, date_start: true, date_end: true, location: true, creator: { select: { name: true } } } },
      subEvent: { select: { id: true, title: true, date_start: true, date_end: true, location: true } },
    }
  });
}

}


export default new CertificateRepository();
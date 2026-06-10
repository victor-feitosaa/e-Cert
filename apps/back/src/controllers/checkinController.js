// controllers/checkinController.js
import { prisma } from '../config/db.js';
import eventRoleService from '../services/eventRoleService.js';

// ==========================
// 1. Verificar permissão do credenciador
// ==========================
export const checkPermission = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const allowed = await eventRoleService.canCheckin(userId, eventId);
    res.json({ allowed });
  } catch (error) {
    console.error('Erro em checkPermission:', error);
    res.status(500).json({ allowed: false, error: error.message });
  }
};

// ==========================
// 2. Realizar check-in (evento ou seção)
// ==========================
export const doCheckin = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { participantId, userId, sectionId } = req.body;
    const credenciadorId = req.user.id;

    // 1) Verificar permissão do credenciador
    const authorized = await eventRoleService.canCheckin(credenciadorId, eventId);
    if (!authorized) {
      return res.status(403).json({ status: 'fail', message: 'Sem permissão para realizar check-in' });
    }

    // 2) Descobrir o userId alvo (via participantId ou userId direto)
    let targetUserId = userId;
    if (participantId) {
      const participant = await prisma.eventParticipant.findUnique({
        where: { id: participantId },
        select: { userId: true }
      });
      if (!participant) {
        return res.status(404).json({ status: 'fail', message: 'Participante não encontrado' });
      }
      targetUserId = participant.userId;
    }

    if (!targetUserId) {
      return res.status(400).json({ status: 'fail', message: 'Identificador do participante não fornecido' });
    }

    // 3) Caso seja check-in em uma seção específica
    if (sectionId) {
      // Verificar inscrição na seção
      const sectionEnrollment = await prisma.sectionParticipant.findUnique({
        where: { userId_sectionId: { userId: targetUserId, sectionId } }
      });
      if (!sectionEnrollment) {
        return res.status(404).json({ status: 'fail', message: 'Usuário não inscrito nesta seção' });
      }

      // Registrar/atualizar presença na seção
      const attendance = await prisma.sectionAttendance.upsert({
        where: { userId_sectionId: { userId: targetUserId, sectionId } },
        update: { attended: true },
        create: { userId: targetUserId, sectionId, attended: true }
      });

      return res.status(200).json({ status: 'success', data: { attendance } });
    }

    // 4) Caso contrário, check-in geral do evento
    const enrollment = await prisma.eventParticipant.findUnique({
      where: { userId_eventId: { userId: targetUserId, eventId } }
    });
    if (!enrollment) {
      return res.status(404).json({ status: 'fail', message: 'Usuário não inscrito no evento' });
    }

    const attendance = await prisma.eventAttendance.upsert({
      where: { userId_eventId: { userId: targetUserId, eventId } },
      update: { attended: true },
      create: { userId: targetUserId, eventId, attended: true }
    });

    res.status(200).json({ status: 'success', data: { attendance } });
  } catch (error) {
    console.error('Erro em doCheckin:', error);
    res.status(500).json({ status: 'error', message: 'Erro interno no servidor' });
  }
};

// ==========================
// 3. Listar participantes com status de check-in (para o credenciador)
// ==========================
export const getAttendances = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Verificar permissão
    const authorized = await eventRoleService.canCheckin(userId, eventId);
    if (!authorized) {
      return res.status(403).json({ status: 'fail', message: 'Sem permissão' });
    }

    // Buscar todos os participantes do evento com seus dados de check-in
    const participants = await prisma.eventParticipant.findMany({
      where: { eventId },
      include: {
        user: { select: { id: true, name: true, email: true, cpf: true } },
        attendance: true   // relação eventAttendance
      }
    });

    const formatted = participants.map(p => ({
      id: p.id,
      userId: p.userId,
      user: {
        id: p.user.id,
        name: p.user.name,
        email: p.user.email,
        cpf: p.user.cpf
      },
      attended: p.attendance?.attended || false,
      checkedInAt: p.attendance?.updatedAt || null
    }));

    res.status(200).json({ status: 'success', data: { attendances: formatted } });
  } catch (error) {
    console.error('Erro em getAttendances:', error);
    res.status(500).json({ status: 'error', message: 'Erro interno no servidor' });
  }
};

// ==========================
// (Opcional) Funções originais do usuário – podem ser mantidas, mas não são usadas pelos proxies atuais
// ==========================
export const eventCheckin = async (req, res) => {
  // mantido para compatibilidade, mas não usado pelos novos endpoints
  // ...
};

export const sectionCheckin = async (req, res) => {
  // mantido para compatibilidade
};

export const getCheckinStatus = async (req, res) => {
  // mantido para compatibilidade
};
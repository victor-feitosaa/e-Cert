// controllers/checkinController.js
import { prisma } from '../config/db.js';
import eventRoleService from '../services/eventRoleService.js';
import jwt from 'jsonwebtoken';


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
      //checkin na seção apenas se ja fez checkin no evento
      const eventCheckin = await prisma.eventAttendance.findUnique({
        where: { userId_eventId: { userId: targetUserId, eventId } }
      });
      if (!eventCheckin || !eventCheckin.attended) {
        return res.status(400).json({ status: 'fail', message: 'Check-in na seção só pode ser realizado após check-in no evento' });
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

    const authorized = await eventRoleService.canCheckin(userId, eventId);
    if (!authorized) {
      return res.status(403).json({ status: 'fail', message: 'Sem permissão' });
    }

    // Participantes do evento
    const participants = await prisma.eventParticipant.findMany({
      where: { eventId },
      include: { user: { select: { id: true, name: true, email: true, cpf: true } } }
    });

    // Presenças do evento principal
    const eventAttendances = await prisma.eventAttendance.findMany({
      where: { eventId },
      select: { userId: true, attended: true, updatedAt: true }
    });

    // Todas as seções do evento (para saber quais existem)
    const sections = await prisma.section.findMany({
      where: { subEvent: { eventId } },
      select: { id: true }
    });
    const sectionIds = sections.map(s => s.id);

    // Presenças nas seções
    const sectionAttendances = await prisma.sectionAttendance.findMany({
      where: { sectionId: { in: sectionIds } },
      select: { userId: true, sectionId: true, attended: true }
    });

    // Mapear presenças do evento
    const eventAttMap = new Map();
    eventAttendances.forEach(a => {
      eventAttMap.set(a.userId, { event: a.attended, checkedInAt: a.updatedAt });
    });

    // Mapear presenças das seções: userId -> array de sectionId onde attended = true
    const sectionAttMap = new Map();
    sectionAttendances.forEach(att => {
      if (att.attended) {
        if (!sectionAttMap.has(att.userId)) sectionAttMap.set(att.userId, []);
        sectionAttMap.get(att.userId).push(att.sectionId);
      }
    });

    const formatted = participants.map(p => ({
      id: p.id,
      userId: p.userId,
      user: p.user,
      attended: eventAttMap.get(p.userId)?.event || false,
      checkedInAt: eventAttMap.get(p.userId)?.checkedInAt || null,
      sectionCheckins: sectionAttMap.get(p.userId) || []   // ← novo campo
    }));

    res.status(200).json({ status: 'success', data: { attendances: formatted } });
  } catch (error) {
    console.error('Erro em getAttendances:', error);
    res.status(500).json({ status: 'error', message: 'Erro interno no servidor' });
  }
};

export const getCheckinToken = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { sectionId } = req.query; // opcional
    const userId = req.user.id;

    const payload = { userId, eventId };
    if (sectionId) payload.sectionId = sectionId;

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



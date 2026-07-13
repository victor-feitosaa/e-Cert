import { prisma } from '../config/db.js';
import ExcelJS from 'exceljs';

// Exportar participantes
export const exportParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Buscar participantes do evento
    const participants = await prisma.eventParticipant.findMany({
      where: { eventId },
      include: {
        user: {
          select: { id: true, name: true, email: true, cpf: true }
        }
      }
    });

    // Criar workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Participantes');

    // Cabeçalhos
    worksheet.columns = [
      { header: 'Nome', key: 'name', width: 30 },
      { header: 'E-mail', key: 'email', width: 35 },
      { header: 'CPF', key: 'cpf', width: 20 },
      { header: 'Data de Inscrição', key: 'createdAt', width: 25 },
    ];

    // Dados
    participants.forEach(p => {
      worksheet.addRow({
        name: p.user.name || '—',
        email: p.user.email || '—',
        cpf: p.user.cpf || '—',
        createdAt: new Date(p.createdAt).toLocaleDateString('pt-BR'),
      });
    });

    // Gerar buffer
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=participantes-${eventId}.xlsx`);
    res.send(buffer);
  } catch (error) {
    console.error('Erro ao exportar participantes:', error);
    res.status(500).json({ error: error.message });
  }
};

// Exportar certificados
export const exportCertificates = async (req, res) => {
  try {
    const { eventId } = req.params;

    const certificates = await prisma.certificate.findMany({
      where: {
        OR: [
          { eventId },
          { subEvent: { eventId } }
        ]
      },
      include: {
        user: { select: { name: true, email: true } },
        event: { select: { title: true } },
        subEvent: { select: { title: true } }
      },
      orderBy: { issueDate: 'desc' }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Certificados');

    worksheet.columns = [
      { header: 'Participante', key: 'name', width: 30 },
      { header: 'E-mail', key: 'email', width: 35 },
      { header: 'Evento', key: 'event', width: 40 },
      { header: 'Carga', key: 'workload', width: 15 },
      { header: 'Tipo', key: 'type', width: 20 },
      { header: 'Emitido em', key: 'issuedAt', width: 25 },
      { header: 'Status', key: 'status', width: 15 },
    ];

    certificates.forEach(cert => {
      worksheet.addRow({
        name: cert.user.name || '—',
        email: cert.user.email || '—',
        event: cert.event?.title || cert.subEvent?.title || '—',
        workload: cert.workload || '—',
        type: cert.type || '—',
        issuedAt: new Date(cert.issueDate).toLocaleDateString('pt-BR'),
        status: cert.issued ? 'Enviado' : 'Pendente',
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=certificados-${eventId}.xlsx`);
    res.send(buffer);
  } catch (error) {
    console.error('Erro ao exportar certificados:', error);
    res.status(500).json({ error: error.message });
  }
};

// Exportar subeventos
export const exportSubevents = async (req, res) => {
  try {
    const { eventId } = req.params;

    const subEvents = await prisma.subEvent.findMany({
      where: { eventId },
      include: {
        sections: {
          orderBy: { date_start: 'asc' }
        },
        participants: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sub-eventos');

    worksheet.columns = [
      { header: 'Título', key: 'title', width: 30 },
      { header: 'Descrição', key: 'description', width: 40 },
      { header: 'Local', key: 'location', width: 25 },
      { header: 'Início', key: 'date_start', width: 20 },
      { header: 'Fim', key: 'date_end', width: 20 },
      { header: 'Participantes', key: 'participants', width: 20 },
    ];

    subEvents.forEach(sub => {
      worksheet.addRow({
        title: sub.title || '—',
        description: sub.description || '—',
        location: sub.location || '—',
        date_start: sub.date_start ? new Date(sub.date_start).toLocaleString('pt-BR') : '—',
        date_end: sub.date_end ? new Date(sub.date_end).toLocaleString('pt-BR') : '—',
        participants: sub.participants.length || 0,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=subeventos-${eventId}.xlsx`);
    res.send(buffer);
  } catch (error) {
    console.error('Erro ao exportar subeventos:', error);
    res.status(500).json({ error: error.message });
  }
};
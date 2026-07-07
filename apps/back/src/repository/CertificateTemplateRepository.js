import {prisma} from '../config/db.js';

class CertificateTemplateRepository {
  async create(data) {
    return prisma.certificateTemplate.create({ data });
  }

  async findById(id) {
    return prisma.certificateTemplate.findUnique({
      where: { id },
      include: { event: true, subEvent: true },
    });
  }

  async findByEvent(eventId) {
    return prisma.certificateTemplate.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id, data) {
    return prisma.certificateTemplate.update({
      where: { id },
      data,
    });
  }

  async delete(id) {
    return prisma.certificateTemplate.delete({ where: { id } });
  }
}

export default new CertificateTemplateRepository();
import certificateService from '../services/certificateService.js';
import CertificateRepository from '../repository/CertificateRepository.js';

// Endpoint para gerar certificados de um evento (apenas organizador/moderador)
export const generateEventCertificates = async (req, res) => {
  try {
    const { eventId } = req.params;
    const operatorId = req.userId; 
    const { workload, type, title } = req.body;

    const result = await certificateService.generateCertificatesForEvent(eventId, operatorId, { workload, type, title });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Endpoint para gerar certificados de um subevento
export const generateSubEventCertificates = async (req, res) => {
  try {
    const { subEventId } = req.params;
    const operatorId = req.userId;
    const { workload, type, title, sectionId } = req.body; // inclua sectionId

    const result = await certificateService.generateCertificatesForSubEvent(
      subEventId, 
      operatorId, 
      { workload, type, title, sectionId }
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Endpoint para listar certificados do usuário logado (Meus Certificados)
export const listMyCertificates = async (req, res) => {
  try {
    const userId = req.userId;
    const certificates = await CertificateRepository.findCertificatesByUser(userId);
    res.status(200).json(certificates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Endpoint para listar certificados de um evento (dashboard admin)
export const listEventCertificates = async (req, res) => {
  try {
    const { eventId } = req.params;
    const certificates = await CertificateRepository.findCertificatesByEvent(eventId);
    res.status(200).json(certificates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Endpoint PÚBLICO para verificar autenticidade do certificado via hash
export const verifyCertificate = async (req, res) => {
  try {
    const { hash } = req.params;
    // 1. Verifica a assinatura do JWT
    const decoded = certificateService.verifyCertificateHash(hash);
    if (!decoded) {
      return res.status(404).json({ valid: false, message: 'Certificado inválido ou adulterado.' });
    }

    // 2. Busca no banco para garantir que existe (e evitar hashes aleatórios válidos)
    const certificate = await CertificateRepository.findCertificateByHash(hash);
    if (!certificate) {
      return res.status(404).json({ valid: false, message: 'Certificado não encontrado.' });
    }

    // 3. Retorna os dados para exibição (pode renderizar o CertCard com esses dados)
    res.status(200).json({
      valid: true,
      certificate: {
        name: certificate.user.name,
        event: certificate.event?.title || certificate.subEvent?.title || 'Evento',
        date: certificate.event?.date_start || certificate.subEvent?.date_start,
        workload: certificate.workload,
        type: certificate.type,
        issuedAt: certificate.issueDate,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const downloadCertificate = async (req, res) => {
  try {
    const { hash } = req.params;
    const certificate = await CertificateRepository.findCertificateByHash(hash);
    if (!certificate) {
      return res.status(404).json({ error: 'Certificado não encontrado' });
    }

    const pdfBuffer = await certificateService.generatePDF(certificate);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificado-${hash.slice(0,8)}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Erro no download:', error);
    res.status(500).json({ error: error.message });
  }
};

export const sendCertificateEmail = async (req, res) => {
  try {
    const { id } = req.params;
    // Chama o service que já faz tudo (gerar PDF, enviar, marcar como issued)
    const result = await certificateService.sendCertificateEmail(id);
    res.status(200).json(result);
  } catch (error) {
    console.error('Erro no envio de e-mail:', error);
    res.status(400).json({ error: error.message });
  }
};


export const getCertificateStats = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Total de participantes com check-in
    const eligible = await CertificateRepository.countEligibleParticipants(eventId);

    // Total de certificados já gerados para este evento
    const generated = await CertificateRepository.countCertificatesByEvent(eventId);

    const pending = Math.max(0, eligible - generated);

    res.status(200).json({
      eligible,
      generated,
      pending,
    });
  } catch (error) {
    console.error('Erro em getCertificateStats:', error);
    res.status(500).json({ error: error.message });
  }
};
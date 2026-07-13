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

    // Total de participantes elegíveis (check-in no evento ou em seções)
    const eligible = await CertificateRepository.countEligibleAll(eventId);

    // Total de certificados já gerados (evento principal + subeventos)
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


export const verifyCertificate = async (req, res) => {
  try {
    const { hash } = req.params;
    if (!hash) {
      return res.status(400).json({
        status: 'fail',
        message: 'Código do certificado é obrigatório'
      });
    }

    console.log(`Verificando certificado com hash: ${hash}`);

    const result = await certificateService.verifyCertificate(hash);

    // Se for inválido, retorna com o motivo
    if (!result.valid) {
      return res.status(200).json({
        status: 'success',
        data: { valid: false, reason: result.reason }
      });
    }

    // Válido
    res.status(200).json({
      status: 'success',
      data: { valid: true, certificate: result.certificate }
    });
  } catch (error) {
    console.error('Erro ao verificar certificado:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno ao verificar certificado'
    });
  }
};
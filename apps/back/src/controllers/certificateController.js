import certificateService from '../services/certificateService.js';
import CertificateRepository from '../repository/CertificateRepository.js';

// Endpoint para gerar certificados de um evento (apenas organizador/moderador)
export const generateEventCertificates = async (req, res) => {
  try {
    const { eventId } = req.params;
    const operatorId = req.userId; 

    const result = await certificateService.generateCertificatesForEvent(eventId, operatorId);
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

    const result = await certificateService.generateCertificatesForSubEvent(subEventId, operatorId);
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
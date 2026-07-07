import CertificateTemplateService from '../services/certificateTemplateService.js';

export const createTemplate = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { subEventId, title, workload, type } = req.body;
    const result = await CertificateTemplateService.createTemplate(eventId, subEventId, { title, workload, type });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const listTemplates = async (req, res) => {
  try {
    const { eventId } = req.params;
    const templates = await CertificateTemplateService.listTemplates(eventId);
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const template = await CertificateTemplateService.getTemplate(templateId);
    if (!template) return res.status(404).json({ error: 'Template não encontrado.' });
    res.status(200).json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { title, workload, type } = req.body;
    const result = await CertificateTemplateService.updateTemplate(templateId, { title, workload, type });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    await CertificateTemplateService.deleteTemplate(templateId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const generateCertificatesFromTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const operatorId = req.userId;
    const result = await CertificateTemplateService.generateCertificatesFromTemplate(templateId, operatorId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
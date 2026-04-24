// src/services/sectionService.js
import SectionRepository from '../repository/SectionRepository.js'
import subEventService from './subEventService.js'

const sectionService = {
  async create(title, date_start, date_end, location, subEventId) {
    // Validar se o subEvento existe
    const subEvent = await subEventService.findById(subEventId)
    if (!subEvent) {
      throw new Error('SubEvento não encontrado')
    }

    // Validar datas
    if (new Date(date_start) > new Date(date_end)) {
      throw new Error('Data de início não pode ser maior que data de término')
    }

    const section = await SectionRepository.create({
      title: title || null,
      date_start: new Date(date_start),
      date_end: new Date(date_end),
      location: location || null,
      subEventId
    })

    return section
  },

  async getById(id) {
    const section = await SectionRepository.findById(id)
    if (!section) {
      throw new Error('Seção não encontrada')
    }
    return section
  },

  async getAllBySubEventId(subEventId) {
    // Verificar se o subEvento existe
    const subEvent = await subEventService.findById(subEventId)
    if (!subEvent) {
      throw new Error('SubEvento não encontrado')
    }

    const sections = await SectionRepository.findAllBySubEventId(subEventId)
    return sections
  },

  async update(id, updates) {
    const existingSection = await SectionRepository.findById(id)
    if (!existingSection) {
      throw new Error('Seção não encontrada')
    }

    const dataToUpdate = {}

    if (updates.title !== undefined) {
      dataToUpdate.title = updates.title?.trim() || null
    }

    if (updates.date_start !== undefined) {
      const newDateStart = new Date(updates.date_start)
      dataToUpdate.date_start = newDateStart
    }

    if (updates.date_end !== undefined) {
      const newDateEnd = new Date(updates.date_end)
      dataToUpdate.date_end = newDateEnd
    }

    if (updates.location !== undefined) {
      dataToUpdate.location = updates.location?.trim() || null
    }

    // Validar datas se ambas foram fornecidas
    const finalDateStart = dataToUpdate.date_start || existingSection.date_start
    const finalDateEnd = dataToUpdate.date_end || existingSection.date_end

    if (finalDateStart > finalDateEnd) {
      throw new Error('Data de início não pode ser maior que data de término')
    }

    const section = await SectionRepository.update(id, dataToUpdate)
    return section
  },

  async delete(id) {
    const existingSection = await SectionRepository.findById(id)
    if (!existingSection) {
      throw new Error('Seção não encontrada')
    }

    await SectionRepository.delete(id)
    return true
  },

  async deleteAllBySubEventId(subEventId) {
    // Verificar se o subEvento existe
    const subEvent = await subEventService.findById(subEventId)
    if (!subEvent) {
      throw new Error('SubEvento não encontrado')
    }

    const count = await SectionRepository.countBySubEventId(subEventId)
    await SectionRepository.deleteManyBySubEventId(subEventId)
    return count
  },

  async validateSectionDates(date_start, date_end) {
    if (new Date(date_start) > new Date(date_end)) {
      throw new Error('Data de início não pode ser maior que data de término')
    }
    return true
  }
}

export default sectionService
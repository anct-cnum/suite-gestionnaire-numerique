import { describe, expect, it } from 'vitest'

import { pdfDuQuestionnairePapier } from './pdfDuQuestionnairePapier'
import { Questionnaire } from '@/domain/mesure-impact/Questionnaire'
import { versionPapier } from '@/domain/mesure-impact/QuestionnairePapier'
import { questionnaireDeVersion } from '@/domain/mesure-impact/questionnaires'
import { questionnairePapierPresenter } from '@/presenters/mesure-impact/questionnairePapierPresenter'

describe('pDF du questionnaire papier', () => {
  it('est un PDF balisé en français, titré, pour être lu par les technologies d’assistance', async () => {
    // WHEN
    const pdf = (await pdfDuQuestionnairePapier(viewModelSocleV22())).toString('latin1')

    // THEN
    expect(pdf.startsWith('%PDF-1.7')).toBe(true)
    expect(pdf).toContain('/StructTreeRoot')
    expect(pdf).toContain('/Marked true')
    expect(pdf).toContain('/Lang (fr-FR)')
    expect(pdf).toContain('/DisplayDocTitle true')
  })

  it('tient le questionnaire socle v22 en quelques pages A4', async () => {
    // WHEN
    const pdf = (await pdfDuQuestionnairePapier(viewModelSocleV22())).toString('latin1')

    // THEN
    const pages = pdf.match(/\/Type \/Page\b(?!s)/g) ?? []
    expect(pages.length).toBeGreaterThanOrEqual(3)
    expect(pages.length).toBeLessThanOrEqual(10)
  })
})

function viewModelSocleV22(): ReturnType<typeof questionnairePapierPresenter> {
  return questionnairePapierPresenter({
    identifiantPublic: 'sicoval',
    libelleTerritoire: 'Sicoval',
    questionnaire: versionPapier(questionnaireDeVersion('socle-v22') as Questionnaire),
  })
}

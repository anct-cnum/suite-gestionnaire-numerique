import { Questionnaire } from './Questionnaire'
import { questionnaireSocleV22 } from './questionnaireSocleV22'

// Versions publiées du questionnaire. Une version publiée ne change plus : les réponses enregistrées
// la référencent pour être relues et agrégées avec les bons libellés et les bonnes règles.
const QUESTIONNAIRES: ReadonlyArray<Questionnaire> = [Questionnaire.create(questionnaireSocleV22)]

export function questionnaireDeVersion(version: string): Questionnaire | undefined {
  return QUESTIONNAIRES.find((questionnaire) => questionnaire.version === version)
}

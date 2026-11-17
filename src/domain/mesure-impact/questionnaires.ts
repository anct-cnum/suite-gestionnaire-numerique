import { Questionnaire } from './Questionnaire'
import { questionnaireSocleV22 } from './questionnaireSocleV22'

// Versions publiées du questionnaire. Une version publiée ne change plus sur le fond (codes, règles, sens
// des libellés) : les réponses enregistrées la référencent pour être relues et agrégées correctement.
const QUESTIONNAIRES: ReadonlyArray<Questionnaire> = [Questionnaire.create(questionnaireSocleV22)]

export function questionnaireDeVersion(version: string): Questionnaire | undefined {
  return QUESTIONNAIRES.find((questionnaire) => questionnaire.version === version)
}

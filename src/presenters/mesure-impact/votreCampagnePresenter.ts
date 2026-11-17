import { dateLongue, pluriel } from './format'
import { VotreCampagneReadModel } from '@/use-cases/mesure-impact/RecupererVotreCampagne'

export function votreCampagnePresenter(
  readModel: VotreCampagneReadModel,
  { adresseDuQuestionnaire, qrCode }: Diffusion
): VotreCampagneViewModel {
  const { derniereReponse, identifiantPublic, libelleTerritoire, nom, nombreDeQuestions, nombreDeReponses } = readModel
  return {
    adresseDuQuestionnaire,
    details: [
      { libelle: 'Territoire', valeur: libelleTerritoire },
      { libelle: 'Date de début de collecte', valeur: dateLongue(readModel.ouverture) },
      {
        libelle: 'Dernière réponse',
        valeur: derniereReponse === null ? 'Aucune réponse pour l’instant' : dateLongue(derniereReponse),
      },
      {
        libelle: 'Réponses reçues',
        valeur: nombreDeReponses === 0 ? 'Aucune réponse' : pluriel(nombreDeReponses, 'réponse', 'réponses'),
      },
      { libelle: 'Questionnaire', valeur: pluriel(nombreDeQuestions, 'question', 'questions') },
    ],
    lienQuestionnairePapier: `/mesure-impact/${identifiantPublic}/questionnaire-papier`,
    lienResultats: `/mesure-impact/${identifiantPublic}/resultats`,
    lienSaisie: `/mesure-impact/${identifiantPublic}/saisie`,
    nom,
    nomDuFichierQrCode: `questionnaire-${identifiantPublic}.png`,
    ouverte: readModel.ouverte,
    qrCode,
    titreFilAriane: libelleTerritoire,
  }
}

export type VotreCampagneViewModel = Readonly<{
  adresseDuQuestionnaire: string
  details: ReadonlyArray<Readonly<{ libelle: string; valeur: string }>>
  lienQuestionnairePapier: string
  lienResultats: string
  lienSaisie: string
  nom: string
  nomDuFichierQrCode: string
  ouverte: boolean
  qrCode: string
  titreFilAriane: string
}>

type Diffusion = Readonly<{
  adresseDuQuestionnaire: string
  // Image PNG du QR code de l'adresse, en data URL
  qrCode: string
}>

import { ReactElement } from 'react'

import { handleReadModelOrError } from '@/components/shared/ErrorHandler'
import Financements from '@/components/TableauDeBord/Financements'
import { PrismaEnveloppesConseillerNumeriqueLoader } from '@/gateways/tableauDeBord/PrismaEnveloppesConseillerNumeriqueLoader'
import { PrismaFinancementsAdminLoader } from '@/gateways/tableauDeBord/PrismaFinancementsAdminLoader'
import { PrismaFinancementsLoader } from '@/gateways/tableauDeBord/PrismaFinancementsLoader'
import { PrismaFinancementsStructureLoader } from '@/gateways/tableauDeBord/PrismaFinancementsStructureLoader'
import { financementsPresenter } from '@/presenters/tableauDeBord/financementsPresenter'
import { TerritoireTableauDeBord } from '@/use-cases/queries/shared/TerritoireTableauDeBord'

// Règle #1557 : le rendu de l'encart (vide / vue simple / vue détaillée) est dérivé des types de
// financement présents par le presenter unique. Le territoire ne choisit plus un rendu : il ne
// détermine que les loaders et les libellés contextuels.
export default async function BlocFinancements({ territoire }: Props): Promise<ReactElement> {
  switch (territoire.type) {
    case 'departement':
      return financementsDepartement(territoire.code)
    case 'france':
      return financementsNationaux()
    case 'region':
      return financementsRegion(territoire.codesDepartement)
    case 'structure':
      return financementsStructure(territoire.structureId)
    default:
      // EPCI : bloc masqué par le registre.
      return <></>
  }
}

const noteMethodologiqueGouvernance =
  'Nombre de demandes de subventions validées des feuilles de route de votre gouvernance.'

async function financementsNationaux(): Promise<ReactElement> {
  const [financementsReadModel, enveloppesConum] = await Promise.all([
    new PrismaFinancementsAdminLoader().get(),
    new PrismaEnveloppesConseillerNumeriqueLoader().get('france'),
  ])
  const viewModel = handleReadModelOrError(financementsReadModel, (readModel) =>
    financementsPresenter(
      {
        conseillerNumerique: readModel.conseillerNumerique,
        enveloppesConseillerNumerique: enveloppesConum.enveloppes,
        fneEngage: readModel.fneEngage,
        fneReference: { libelle: 'disponible', montant: readModel.fneDisponible },
        nombreDeFinancementsEngagesParLEtat: readModel.nombreDeFinancementsEngagesParLEtat,
        ventilationSubventionsParEnveloppe: readModel.ventilationSubventionsParEnveloppe,
      },
      {
        complementConventionne: 'conventionnés sur les postes liés à la gouvernance',
        formatage: 'millions',
        jauges: true,
        noteMethodologique: 'Nombre de demandes de subventions validées des feuilles de route.',
      },
      new Date()
    )
  )

  return (
    <Financements
      lienFinancements={{ href: '/gouvernance/01/beneficiaires', libelle: 'Les demandes' }}
      porteeVide="pour la France"
      sousTitre="Chiffres clés des enveloppes de financement"
      viewModel={viewModel}
    />
  )
}

async function financementsDepartement(code: string): Promise<ReactElement> {
  const [financementsReadModel, enveloppesConum] = await Promise.all([
    new PrismaFinancementsLoader().get(code),
    new PrismaEnveloppesConseillerNumeriqueLoader().get(code),
  ])
  const viewModel = handleReadModelOrError(financementsReadModel, (readModel) =>
    financementsPresenter(
      {
        conseillerNumerique: readModel.conseillerNumerique,
        enveloppesConseillerNumerique: enveloppesConum.enveloppes,
        fneEngage: readModel.fneEngage,
        fneReference: { libelle: 'de votre budget global renseigné', montant: readModel.budgetGlobalRenseigne },
        nombreDeFinancementsEngagesParLEtat: readModel.nombreDeFinancementsEngagesParLEtat,
        ventilationSubventionsParEnveloppe: readModel.ventilationSubventionsParEnveloppe,
      },
      {
        complementConventionne: 'conventionnés sur les postes liés à la gouvernance',
        formatage: 'euros',
        jauges: false,
        noteMethodologique: noteMethodologiqueGouvernance,
      },
      new Date()
    )
  )

  return (
    <Financements
      lienFinancements={{ href: `/gouvernance/${code}/financements`, libelle: 'Les demandes en cours' }}
      porteeVide="pour le département"
      sousTitre="Chiffres clés des budgets et financements"
      viewModel={viewModel}
    />
  )
}

// Agrégat des départements de la région ; lien de détail masqué (les pages /gouvernance ne connaissent pas la région).
async function financementsRegion(codesDepartement: ReadonlyArray<string>): Promise<ReactElement> {
  const [financementsReadModel, enveloppesConum] = await Promise.all([
    new PrismaFinancementsLoader().getPourDepartements(codesDepartement),
    new PrismaEnveloppesConseillerNumeriqueLoader().getPourDepartements(codesDepartement),
  ])
  const viewModel = handleReadModelOrError(financementsReadModel, (readModel) =>
    financementsPresenter(
      {
        conseillerNumerique: readModel.conseillerNumerique,
        enveloppesConseillerNumerique: enveloppesConum.enveloppes,
        fneEngage: readModel.fneEngage,
        fneReference: { libelle: 'de votre budget global renseigné', montant: readModel.budgetGlobalRenseigne },
        nombreDeFinancementsEngagesParLEtat: readModel.nombreDeFinancementsEngagesParLEtat,
        ventilationSubventionsParEnveloppe: readModel.ventilationSubventionsParEnveloppe,
      },
      {
        complementConventionne: 'conventionnés sur les postes liés à la gouvernance',
        formatage: 'euros',
        jauges: false,
        noteMethodologique: noteMethodologiqueGouvernance,
      },
      new Date()
    )
  )

  return (
    <Financements
      porteeVide="pour la région"
      sousTitre="Chiffres clés des budgets et financements"
      viewModel={viewModel}
    />
  )
}

async function financementsStructure(structureId: number): Promise<ReactElement> {
  const [financementsReadModel, enveloppesConum] = await Promise.all([
    new PrismaFinancementsStructureLoader().get(structureId),
    new PrismaEnveloppesConseillerNumeriqueLoader().getParStructure(structureId),
  ])
  const viewModel = handleReadModelOrError(financementsReadModel, (readModel) =>
    financementsPresenter(
      {
        conseillerNumerique: readModel.conseillerNumerique,
        enveloppesConseillerNumerique: enveloppesConum.enveloppes,
        fneEngage: readModel.fneEngage,
        nombreDeFinancementsEngagesParLEtat: readModel.nombreDeFinancementsEngagesParLEtat,
        ventilationSubventionsParEnveloppe: readModel.ventilationSubventionsParEnveloppe,
      },
      {
        complementConventionne: 'conventionnés sur les postes de la structure',
        formatage: 'euros',
        jauges: false,
      },
      new Date()
    )
  )

  return (
    <Financements
      lienFinancements={{ href: `/structures/${structureId}/financements`, libelle: 'Les demandes en cours' }}
      porteeVide="pour la structure"
      sousTitre="Chiffres clés de vos financements"
      viewModel={viewModel}
    />
  )
}

type Props = Readonly<{
  territoire: TerritoireTableauDeBord
}>

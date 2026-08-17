import * as Excel from 'exceljs'
import { NextRequest, NextResponse } from 'next/server'

import departementsJson from '../../../../../ressources/departements.json'
import {
  construireLibellesFiltres,
  LibelleFiltre,
} from '@/app/(connecte)/(avec-menu)/(default)/statistiques/libellesFiltres'
import {
  construireFiltres,
  recupererStatistiques,
  StatistiquesSearchParams,
} from '@/app/(connecte)/(avec-menu)/(default)/statistiques/statistiquesServeur'
import type { QuantifiedShare, StatistiquesMediateursData } from '@/components/coop/Statistiques/types'
import { numberToPercentage } from '@/components/coop/Statistiques/utils'
import { getSession, getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaCommunesCoopLoader } from '@/gateways/PrismaCommunesCoopLoader'
import { PrismaLieuxCoopLoader } from '@/gateways/PrismaLieuxCoopLoader'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaStructuresEmployeusesCoopLoader } from '@/gateways/PrismaStructuresEmployeusesCoopLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { resoudreContexte, ScopeFiltre } from '@/use-cases/queries/ResoudreContexte'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const utilisateur = await new PrismaUtilisateurLoader().findById(await getSessionUtilisateurId())
    const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
    const scopeFiltre: ScopeFiltre =
      contexte.role === 'gestionnaire_structure'
        ? { id: contexte.idStructure(), type: 'structure' }
        : contexte.scopeFiltre()

    const searchParams = request.nextUrl.searchParams
    const params: StatistiquesSearchParams = {
      au: searchParams.get('au') ?? undefined,
      communes: searchParams.get('communes') ?? undefined,
      departements: searchParams.get('departements') ?? undefined,
      du: searchParams.get('du') ?? undefined,
      lieux: searchParams.get('lieux') ?? undefined,
      structuresEmployeuses: searchParams.get('structuresEmployeuses') ?? undefined,
      thematiqueAdministratives: searchParams.get('thematiqueAdministratives') ?? undefined,
      thematiqueNonAdministratives: searchParams.get('thematiqueNonAdministratives') ?? undefined,
      types: searchParams.get('types') ?? undefined,
    }

    const maintenant = new Date()
    const aujourdhui = maintenant.toISOString().slice(0, 10)
    const filtres = construireFiltres(params, scopeFiltre, aujourdhui)

    const statistiques = await recupererStatistiques(filtres)
    if ('type' in statistiques) {
      return NextResponse.json({ error: 'Erreur lors de la récupération des données' }, { status: 500 })
    }

    // Charger les labels des filtres sélectionnés pour la section « Filtres »
    const communesActives = filtres.communes ?? []
    const lieuxActifs = filtres.lieux ?? []
    const structuresEmployeusesActives = filtres.structuresEmployeuses ?? []
    const [lieuxSelectionnes, communesSelectionnees, structuresEmployeusesSelectionnees] = await Promise.all([
      lieuxActifs.length > 0 ? new PrismaLieuxCoopLoader().recupererParIds(lieuxActifs) : Promise.resolve([]),
      communesActives.length > 0
        ? new PrismaCommunesCoopLoader().recupererParCodes(communesActives)
        : Promise.resolve([]),
      structuresEmployeusesActives.length > 0
        ? new PrismaStructuresEmployeusesCoopLoader().recupererParIds(structuresEmployeusesActives)
        : Promise.resolve([]),
    ])
    const departementsSelectionnes = departementsJson
      .filter((dep) => (filtres.departements ?? []).includes(dep.code))
      .map((dep) => ({ label: `${dep.nom} - ${dep.code}`, value: dep.code }))

    const libellesFiltres = construireLibellesFiltres({
      aujourdhui,
      communesSelectionnees,
      dateDebut: filtres.du,
      dateFin: filtres.au,
      departementsSelectionnes,
      lieuxSelectionnes,
      structuresEmployeusesSelectionnees,
      thematiqueAdministratives: filtres.thematiqueAdministratives ?? [],
      thematiqueNonAdministratives: filtres.thematiqueNonAdministratives ?? [],
      types: filtres.types ?? [],
    })

    const workbook = construireWorkbook({
      date: maintenant,
      libellesFiltres,
      statistiques,
      utilisateur: { nom: utilisateur.nom, prenom: utilisateur.prenom, role: utilisateur.role.nom },
    })

    const data = await workbook.xlsx.writeBuffer()
    const filename = `mon-inclusion-numerique_statistiques_${aujourdhui}.xlsx`

    return new NextResponse(data, {
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })
  } catch (error) {
    console.error("Erreur lors de l'export xlsx des statistiques :", error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

function ajouterFiltres(worksheet: Excel.Worksheet, libellesFiltres: ReadonlyArray<LibelleFiltre>): void {
  ajouterTitre(worksheet, 'Filtres')
  worksheet.addRows([
    ['Période', libelleParCategorie(libellesFiltres, 'periode')],
    ['Départements', libelleParCategorie(libellesFiltres, 'departements')],
    ['Communes', libelleParCategorie(libellesFiltres, 'communes')],
    ['Structures employeuses', libelleParCategorie(libellesFiltres, 'structuresEmployeuses')],
    ['Lieux d’accompagnement', libelleParCategorie(libellesFiltres, 'lieux')],
    ['Type d’accompagnement', libelleParCategorie(libellesFiltres, 'types')],
    ['Thématiques non administratives', libelleParCategorie(libellesFiltres, 'thematiqueNonAdministratives')],
    ['Thématiques administratives', libelleParCategorie(libellesFiltres, 'thematiqueAdministratives')],
    [],
  ])
}

function ajouterInformationsExport(
  worksheet: Excel.Worksheet,
  utilisateur: Readonly<{ nom: string; prenom: string; role: string }>,
  date: Date
): void {
  ajouterTitre(worksheet, 'Informations export')
  worksheet.addRows([
    ['Nom', utilisateur.nom],
    ['Prénom', utilisateur.prenom],
    ['Rôle', utilisateur.role],
    ['Date d’export', date.toLocaleDateString('fr-FR')],
    ['Heure d’export', date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })],
    [],
  ])
}

function ajouterQuantifiedShares(worksheet: Excel.Worksheet, items: ReadonlyArray<QuantifiedShare>): void {
  for (const { count, label, proportion } of items) {
    worksheet.addRow([label, count, numberToPercentage(proportion)])
  }
  worksheet.addRow([])
}

function ajouterSection(worksheet: Excel.Worksheet, titre: string, items: ReadonlyArray<QuantifiedShare>): void {
  ajouterTitre(worksheet, titre)
  ajouterQuantifiedShares(worksheet, items)
}

function ajouterStatistiquesAccompagnements(
  worksheet: Excel.Worksheet,
  statistiques: StatistiquesMediateursData
): void {
  const { activites } = statistiques.totalCounts
  ajouterTitre(worksheet, 'Statistiques sur les accompagnements')
  worksheet.addRows([
    ['Accompagnements individuels', activites.individuels.total, numberToPercentage(activites.individuels.proportion)],
    ['Ateliers collectifs', activites.collectifs.total, numberToPercentage(activites.collectifs.proportion)],
    ['Nombre total de participants aux ateliers', activites.collectifs.participants],
    ['Nombre total d’activités', activites.total],
    [],
  ])
}

function ajouterStatistiquesGenerales(worksheet: Excel.Worksheet, statistiques: StatistiquesMediateursData): void {
  const { accompagnementsParMois, totalCounts } = statistiques
  ajouterTitre(worksheet, 'Statistiques générales')
  worksheet.addRows([
    ['Accompagnements au total', totalCounts.accompagnements.total],
    ['Bénéficiaires accompagnés', totalCounts.beneficiaires.total],
    ['Bénéficiaires suivis', totalCounts.beneficiaires.suivis],
    ['Bénéficiaires anonymes', totalCounts.beneficiaires.anonymes],
    ['Accompagnements sur les 12 derniers mois', ...accompagnementsParMois.map(({ label }) => label)],
    ['', ...accompagnementsParMois.map(({ count }) => count)],
    [],
  ])
}

function ajouterTitre(worksheet: Excel.Worksheet, titre: string): void {
  const row = worksheet.addRow([titre])
  row.getCell(1).font = { bold: true }
}

function ajusterLargeurColonnes(worksheet: Excel.Worksheet): void {
  const largeurMinimale = 10
  for (const column of worksheet.columns) {
    let largeur = largeurMinimale
    column.eachCell?.({ includeEmpty: false }, (cell) => {
      const longueur = Math.max(...cell.text.split('\n').map((ligne) => ligne.length), largeurMinimale)
      if (longueur > largeur) {
        largeur = longueur
      }
    })
    column.width = largeur
  }
}

function construireWorkbook(
  args: Readonly<{
    date: Date
    libellesFiltres: ReadonlyArray<LibelleFiltre>
    statistiques: StatistiquesMediateursData
    utilisateur: Readonly<{ nom: string; prenom: string; role: string }>
  }>
): Excel.Workbook {
  const { date, libellesFiltres, statistiques, utilisateur } = args
  const workbook = new Excel.Workbook()
  workbook.creator = 'Mon Inclusion Numérique'
  workbook.lastModifiedBy = 'Mon Inclusion Numérique'
  workbook.created = date
  workbook.modified = date

  const worksheet = workbook.addWorksheet('Statistiques')

  ajouterInformationsExport(worksheet, utilisateur, date)
  ajouterFiltres(worksheet, libellesFiltres)
  ajouterStatistiquesGenerales(worksheet, statistiques)
  ajouterStatistiquesAccompagnements(worksheet, statistiques)
  ajouterSection(worksheet, 'Thématiques Médiation numérique', statistiques.activites.thematiques)
  ajouterSection(worksheet, 'Thématiques Démarches administratives', statistiques.activites.thematiquesDemarches)
  if (statistiques.activites.tags !== undefined) {
    ajouterSection(worksheet, 'Tags spécifiques', statistiques.activites.tags)
  }
  ajouterSection(worksheet, 'Matériels utilisés', statistiques.activites.materiels)
  ajouterSection(worksheet, 'Canaux des accompagnements', statistiques.activites.typeLieu)
  ajouterSection(worksheet, 'Durées des accompagnements', statistiques.activites.durees)
  if (statistiques.structures !== undefined && statistiques.structures.length > 0) {
    ajouterSection(worksheet, 'Nombre d’accompagnements par lieux', statistiques.structures)
  }
  ajouterTitre(worksheet, 'Statistiques sur les bénéficiaires')
  worksheet.addRow([])
  ajouterSection(worksheet, 'Genres', statistiques.beneficiaires.genres)
  ajouterSection(worksheet, 'Tranches d’âge', statistiques.beneficiaires.trancheAges)
  ajouterSection(worksheet, 'Statuts', statistiques.beneficiaires.statutsSocial)
  if ('communes' in statistiques.beneficiaires) {
    ajouterSection(
      worksheet,
      'Commune de résidence des bénéficiaires',
      (statistiques.beneficiaires as Readonly<{ communes: ReadonlyArray<QuantifiedShare> }>).communes
    )
  }

  ajusterLargeurColonnes(worksheet)

  return workbook
}

function libelleParCategorie(
  libellesFiltres: ReadonlyArray<LibelleFiltre>,
  categorie: LibelleFiltre['categorie']
): string {
  return (
    libellesFiltres
      .filter((libelle) => libelle.categorie === categorie)
      .map(({ libelle }) => libelle)
      .join(', ') || '-'
  )
}

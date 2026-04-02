import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'
import { NextRequest, NextResponse } from 'next/server'

import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaRapportRegionLoader, RapportRegionReadModel } from '@/gateways/PrismaRapportRegionLoader'
import { BESOINS_LABELS } from '@/presenters/shared/besoins'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession()
    if (session === null) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const codeRegion = request.nextUrl.searchParams.get('codeRegion')
    const format = request.nextUrl.searchParams.get('format')

    if (codeRegion === null || codeRegion === '') {
      return NextResponse.json({ error: 'Le paramètre codeRegion est requis' }, { status: 400 })
    }

    const loader = new PrismaRapportRegionLoader()
    const rapport = await loader.get(codeRegion)

    if (!rapport) {
      return NextResponse.json({ error: 'Région non trouvée' }, { status: 404 })
    }

    if (format === 'docx') {
      const buffer = await genererDocx(rapport)
      const filename = `rapport-${rapport.region.nom.replace(/\s+/g, '-')}.docx`
      return new NextResponse(buffer, {
        headers: {
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
      })
    }

    if (format === 'texte') {
      const texte = formaterEnTexte(rapport)
      return new NextResponse(texte, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      })
    }

    return NextResponse.json(rapport)
  } catch (error) {
    console.error('Erreur lors de la génération du rapport régional:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

const noBorder = {
  bottom: { size: 0, style: BorderStyle.NONE },
  left: { size: 0, style: BorderStyle.NONE },
  right: { size: 0, style: BorderStyle.NONE },
  top: { size: 0, style: BorderStyle.NONE },
} as const

function celluleTexte(texte: string, bold = false): TableCell {
  return new TableCell({
    borders: noBorder,
    children: [new Paragraph({ children: [new TextRun({ bold, text: texte })] })],
  })
}

function celluleNombre(texte: string, bold = false): TableCell {
  return new TableCell({
    borders: noBorder,
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ bold, text: texte })],
      }),
    ],
  })
}

async function genererDocx(rapport: RapportRegionReadModel): Promise<Blob> {
  const { aidantsConnect, conseillersNumeriques, franceNumerique, region } = rapport
  const children: Array<Paragraph | Table> = []

  // Section 1 — Conseillers numériques
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      text: 'Conseillers numériques',
    })
  )
  children.push(
    new Paragraph({
      text:
        `${formaterNombre(conseillersNumeriques.total)} conseillers numériques sont déployés` +
        ` sur l'ensemble de la Région ${region.nom}.`,
    })
  )
  children.push(
    new Table({
      rows: [
        new TableRow({
          children: [
            celluleTexte('Départements', true),
            celluleNombre('Nombre de Conseillers numériques', true),
            celluleNombre('Nombre de bénéficiaires depuis 2021', true),
          ],
          tableHeader: true,
        }),
        ...conseillersNumeriques.departements.map(
          (dep) =>
            new TableRow({
              children: [
                celluleTexte(dep.nom),
                celluleNombre(formaterNombre(dep.nbConseillers)),
                celluleNombre(formaterNombre(dep.nbBeneficiaires)),
              ],
            })
        ),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    })
  )

  // Section 2 — Aidants Connect
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      text: "Déploiement d'Aidants Connect",
    })
  )
  children.push(
    new Paragraph({
      text:
        "Aidants Connect est le service public numérique qui protège l'aidant et l'usager" +
        " lors de l'accompagnement aux démarches en ligne." +
        ` Dans l'ensemble de la Région ${region.nom},` +
        ` ${formaterNombre(aidantsConnect.totalHabilites)} aidants et référents sont habilités Aidants Connect,` +
        ` dont ${formaterNombre(aidantsConnect.totalDontConseillers)} conseillers numériques.`,
    })
  )
  children.push(
    new Table({
      rows: [
        new TableRow({
          children: [
            celluleTexte('Départements', true),
            celluleNombre('Aidants et référents habilités Aidants Connect', true),
          ],
          tableHeader: true,
        }),
        ...aidantsConnect.departements.map((dep) => {
          const suffixe =
            dep.dontConseillers > 0 ? ` dont ${formaterNombre(dep.dontConseillers)} conseillers numériques` : ''
          return new TableRow({
            children: [celluleTexte(dep.nom), celluleNombre(`${formaterNombre(dep.nbHabilites)}${suffixe}`)],
          })
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    })
  )

  // Section 3 — France Numérique Ensemble
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      text: 'France Numérique Ensemble',
    })
  )

  for (const dep of franceNumerique.departements) {
    for (const fdr of dep.feuillesDeRoute) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          text: `${dep.nom} : ${fdr.nom}`,
        })
      )
      children.push(
        new Paragraph({
          text: `Portée par ${fdr.porteur.type} (${fdr.porteur.nom})`,
        })
      )

      for (const env of fdr.enveloppes) {
        const recipiendaires = env.beneficiaires.length > 0 ? ` (récipiendaire : ${env.beneficiaires.join(' & ')})` : ''
        const besoins = formaterBesoins(env.besoins)
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            text: `Enveloppe ${env.type} de ${formaterMontant(env.montant)}${recipiendaires}${besoins}`,
          })
        )
      }
    }
  }

  const doc = new Document({
    sections: [{ children }],
  })

  return Packer.toBlob(doc)
}

function formaterNombre(nombre: number): string {
  return nombre.toLocaleString('fr-FR')
}

function formaterMontant(montant: number): string {
  return `${formaterNombre(montant)} €`
}

function formaterBesoins(besoins: ReadonlyArray<string>): string {
  if (besoins.length === 0) {
    return ''
  }

  const besoinLabels = Object.entries(BESOINS_LABELS) as ReadonlyArray<readonly [string, string]>
  const labelsMap = new Map(besoinLabels)
  const labels = besoins.map((besoin) => labelsMap.get(besoin) ?? besoin)

  if (labels.length === 1) {
    return `, fléchée sur : ${labels[0]}.`
  }

  const debut = labels.slice(0, -1).join(', ')
  return `, fléchée sur : ${debut} et ${labels[labels.length - 1]}.`
}

function formaterEnTexte(rapport: RapportRegionReadModel): string {
  const lignes: Array<string> = []
  const regionNom = rapport.region.nom

  formaterSectionConseillers(lignes, rapport, regionNom)
  lignes.push('')
  formaterSectionAidants(lignes, rapport, regionNom)
  lignes.push('')
  formaterSectionFne(lignes, rapport)

  return lignes.join('\n')
}

function formaterSectionConseillers(lignes: Array<string>, rapport: RapportRegionReadModel, regionNom: string): void {
  const { conseillersNumeriques } = rapport

  lignes.push('=== Conseillers numériques ===')
  lignes.push('')
  lignes.push(
    `${formaterNombre(conseillersNumeriques.total)} conseillers numériques sont déployés` +
      ` sur l'ensemble de la Région ${regionNom}.`
  )
  lignes.push('')

  const colDep = 'Départements'
  const colCn = 'Nombre de Conseillers numériques'
  const colBenef = 'Nombre de bénéficiaires depuis 2021'

  const nomsDep = conseillersNumeriques.departements.map((dep) => dep.nom.length)
  const largeurDep = Math.max(colDep.length, ...nomsDep)
  const cnLengths = conseillersNumeriques.departements.map((dep) => formaterNombre(dep.nbConseillers).length)
  const largeurCn = Math.max(colCn.length, ...cnLengths)
  const benefLengths = conseillersNumeriques.departements.map((dep) => formaterNombre(dep.nbBeneficiaires).length)
  const largeurBenef = Math.max(colBenef.length, ...benefLengths)

  lignes.push(`${colDep.padEnd(largeurDep)}  ${colCn.padStart(largeurCn)}  ${colBenef.padStart(largeurBenef)}`)
  lignes.push('-'.repeat(largeurDep + largeurCn + largeurBenef + 4))

  for (const dep of conseillersNumeriques.departements) {
    lignes.push(
      `${dep.nom.padEnd(largeurDep)}  ${formaterNombre(dep.nbConseillers).padStart(largeurCn)}` +
        `  ${formaterNombre(dep.nbBeneficiaires).padStart(largeurBenef)}`
    )
  }
}

function formaterSectionAidants(lignes: Array<string>, rapport: RapportRegionReadModel, regionNom: string): void {
  const { aidantsConnect } = rapport

  lignes.push("=== Déploiement d'Aidants Connect ===")
  lignes.push('')
  lignes.push(
    "Aidants Connect est le service public numérique qui protège l'aidant et l'usager" +
      " lors de l'accompagnement aux démarches en ligne." +
      ` Dans l'ensemble de la Région ${regionNom},` +
      ` ${formaterNombre(aidantsConnect.totalHabilites)} aidants et référents sont habilités Aidants Connect,` +
      ` dont ${formaterNombre(aidantsConnect.totalDontConseillers)} conseillers numériques.`
  )
  lignes.push('')

  const colDep = 'Départements'
  const colAc = 'Aidants et référents habilités Aidants Connect'

  const largeurDep = Math.max(colDep.length, ...aidantsConnect.departements.map((dep) => dep.nom.length))

  lignes.push(`${colDep.padEnd(largeurDep)}  ${colAc}`)
  lignes.push('-'.repeat(largeurDep + colAc.length + 2))

  for (const dep of aidantsConnect.departements) {
    const suffixe = dep.dontConseillers > 0 ? ` dont ${formaterNombre(dep.dontConseillers)} conseillers numériques` : ''
    lignes.push(`${dep.nom.padEnd(largeurDep)}  ${formaterNombre(dep.nbHabilites)}${suffixe}`)
  }
}

function formaterSectionFne(lignes: Array<string>, rapport: RapportRegionReadModel): void {
  lignes.push('=== France Numérique Ensemble ===')

  for (const dep of rapport.franceNumerique.departements) {
    for (const fdr of dep.feuillesDeRoute) {
      lignes.push('')
      lignes.push(
        `- ${dep.nom} : la feuille de route ${fdr.nom} est portée par ${fdr.porteur.type} (${fdr.porteur.nom})`
      )

      for (const env of fdr.enveloppes) {
        const recipiendaires = env.beneficiaires.length > 0 ? ` (récipiendaire : ${env.beneficiaires.join(' & ')})` : ''
        const besoins = formaterBesoins(env.besoins)
        lignes.push(`    - Enveloppe ${env.type} de ${formaterMontant(env.montant)}${recipiendaires}${besoins}`)
      }
    }
  }
}

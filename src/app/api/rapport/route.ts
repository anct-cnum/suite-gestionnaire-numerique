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
import PDFDocument from 'pdfkit'

import { getSession, getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaRapportRegionLoader, RapportPerimetre, RapportReadModel } from '@/gateways/PrismaRapportRegionLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { BESOINS_LABELS } from '@/presenters/shared/besoins'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession()
    if (session === null) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const utilisateur = await new PrismaUtilisateurLoader().findByUid(await getSessionSub())
    const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
    if (!contexte.aCesRoles('administrateur_dispositif')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const perimetre = resoudrePerimetre(request.nextUrl.searchParams)
    if (perimetre === null) {
      return NextResponse.json({ error: 'Le périmètre géographique est invalide' }, { status: 400 })
    }

    const format = request.nextUrl.searchParams.get('format') ?? 'docx'

    const loader = new PrismaRapportRegionLoader()
    const rapport = await loader.get(perimetre)

    if (!rapport) {
      return NextResponse.json({ error: 'Périmètre non trouvé' }, { status: 404 })
    }

    if (format === 'pdf') {
      const buffer = await genererPdf(rapport)
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Disposition': `attachment; filename="${nomFichier(rapport, 'pdf')}"`,
          'Content-Type': 'application/pdf',
        },
      })
    }

    if (format === 'docx') {
      const buffer = await genererDocx(rapport)
      return new NextResponse(buffer, {
        headers: {
          'Content-Disposition': `attachment; filename="${nomFichier(rapport, 'docx')}"`,
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
    console.error('Erreur lors de la génération du rapport:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

function resoudrePerimetre(searchParams: URLSearchParams): null | RapportPerimetre {
  // Rétrocompatibilité : ?codeRegion=XX
  const codeRegion = searchParams.get('codeRegion')
  if (codeRegion !== null && codeRegion !== '') {
    return { code: codeRegion, type: 'region' }
  }

  const type = searchParams.get('type')
  const code = searchParams.get('code')

  if (type === 'national') {
    return { type: 'national' }
  }
  if ((type === 'region' || type === 'departement') && code !== null && code !== '') {
    return { code, type }
  }
  return null
}

function nomFichier(rapport: RapportReadModel, extension: string): string {
  const slug = rapport.perimetre.nom
    .normalize('NFD')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .toLowerCase()
  return `rapport-${slug}.${extension}`
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

async function genererDocx(rapport: RapportReadModel): Promise<Blob> {
  const { aidantsConnect, conseillersNumeriques, franceNumerique, perimetre } = rapport
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
        ` sur ${perimetre.nom}.`,
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
        ` Dans ${perimetre.nom},` +
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
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        text: `Gouvernance de ${dep.nom}`,
      })
    )
    if (dep.gouvernance.coporteurs.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ bold: true, text: 'Coporteurs : ' }),
            new TextRun({ text: dep.gouvernance.coporteurs.join(', ') }),
          ],
        })
      )
    }
    if (dep.gouvernance.membres.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ bold: true, text: 'Membres : ' }),
            new TextRun({ text: dep.gouvernance.membres.join(', ') }),
          ],
        })
      )
    }

    for (const fdr of dep.feuillesDeRoute) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          text: `Feuille de route ${fdr.nom}`,
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

const COULEUR_BLEU = '#000091'
const COULEUR_TEXTE = '#161616'
const COULEUR_SEPARATEUR = '#dddddd'

type ColonneTableau = Readonly<{
  align: 'left' | 'right'
  label: string
  largeur: number
}>

async function genererPdf(rapport: RapportReadModel): Promise<Buffer> {
  const { aidantsConnect, conseillersNumeriques, franceNumerique, perimetre } = rapport
  const doc = new PDFDocument({ margin: 48, size: 'A4' })
  const morceaux: Array<Buffer> = []
  const fini = new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (morceau: Buffer) => morceaux.push(morceau))
    doc.on('end', () => {
      resolve(Buffer.concat(morceaux))
    })
    doc.on('error', reject)
  })

  titre(doc, "Rapports de situation de l'inclusion numérique")
  paragraphe(doc, `Périmètre : ${perimetre.nom}.`)

  sousTitre(doc, 'Conseillers numériques')
  paragraphe(
    doc,
    `${formaterNombre(conseillersNumeriques.total)} conseillers numériques sont déployés sur ${perimetre.nom}.`
  )
  tableau(
    doc,
    [
      { align: 'left', label: 'Départements', largeur: 0.4 },
      { align: 'right', label: 'Nombre de Conseillers numériques', largeur: 0.3 },
      { align: 'right', label: 'Nombre de bénéficiaires depuis 2021', largeur: 0.3 },
    ],
    conseillersNumeriques.departements.map((dep) => [
      dep.nom,
      formaterNombre(dep.nbConseillers),
      formaterNombre(dep.nbBeneficiaires),
    ])
  )

  sousTitre(doc, "Déploiement d'Aidants Connect")
  paragraphe(
    doc,
    "Aidants Connect est le service public numérique qui protège l'aidant et l'usager lors de" +
      ` l'accompagnement aux démarches en ligne. Dans ${perimetre.nom},` +
      ` ${formaterNombre(aidantsConnect.totalHabilites)} aidants et référents sont habilités Aidants Connect,` +
      ` dont ${formaterNombre(aidantsConnect.totalDontConseillers)} conseillers numériques.`
  )
  tableau(
    doc,
    [
      { align: 'left', label: 'Départements', largeur: 0.4 },
      { align: 'left', label: 'Aidants et référents habilités Aidants Connect', largeur: 0.6 },
    ],
    aidantsConnect.departements.map((dep) => {
      const suffixe =
        dep.dontConseillers > 0 ? ` dont ${formaterNombre(dep.dontConseillers)} conseillers numériques` : ''
      return [dep.nom, `${formaterNombre(dep.nbHabilites)}${suffixe}`]
    })
  )

  sousTitre(doc, 'France Numérique Ensemble')
  for (const dep of franceNumerique.departements) {
    sousSousTitre(doc, `Gouvernance de ${dep.nom}`)
    if (dep.gouvernance.coporteurs.length > 0) {
      paragrapheGras(doc, 'Coporteurs : ', dep.gouvernance.coporteurs.join(', '))
    }
    if (dep.gouvernance.membres.length > 0) {
      paragrapheGras(doc, 'Membres : ', dep.gouvernance.membres.join(', '))
    }
    for (const fdr of dep.feuillesDeRoute) {
      sousSousTitre(doc, `Feuille de route ${fdr.nom}`)
      paragraphe(doc, `Portée par ${fdr.porteur.type} (${fdr.porteur.nom})`)
      for (const env of fdr.enveloppes) {
        const recipiendaires = env.beneficiaires.length > 0 ? ` (récipiendaire : ${env.beneficiaires.join(' & ')})` : ''
        puce(
          doc,
          `Enveloppe ${env.type} de ${formaterMontant(env.montant)}${recipiendaires}${formaterBesoins(env.besoins)}`
        )
      }
    }
  }

  doc.end()
  return fini
}

function titre(doc: PDFKit.PDFDocument, texte: string): void {
  doc.font('Helvetica-Bold').fontSize(20).fillColor(COULEUR_BLEU).text(texte)
  doc.moveDown(0.5)
}

function sousTitre(doc: PDFKit.PDFDocument, texte: string): void {
  doc.moveDown(0.5)
  doc.font('Helvetica-Bold').fontSize(15).fillColor(COULEUR_BLEU).text(texte)
  doc.moveDown(0.3)
}

function sousSousTitre(doc: PDFKit.PDFDocument, texte: string): void {
  doc.moveDown(0.3)
  doc.font('Helvetica-Bold').fontSize(12).fillColor(COULEUR_TEXTE).text(texte)
  doc.moveDown(0.2)
}

function paragraphe(doc: PDFKit.PDFDocument, texte: string): void {
  doc.font('Helvetica').fontSize(10).fillColor(COULEUR_TEXTE).text(texte, { align: 'left' })
  doc.moveDown(0.4)
}

function paragrapheGras(doc: PDFKit.PDFDocument, label: string, valeur: string): void {
  doc.fontSize(10).fillColor(COULEUR_TEXTE)
  doc.font('Helvetica-Bold').text(label, { continued: true })
  doc.font('Helvetica').text(valeur)
  doc.moveDown(0.2)
}

function puce(doc: PDFKit.PDFDocument, texte: string): void {
  doc.font('Helvetica').fontSize(10).fillColor(COULEUR_TEXTE).text(`• ${texte}`, { align: 'left', indent: 10 })
  doc.moveDown(0.2)
}

function tableau(
  doc: PDFKit.PDFDocument,
  colonnes: ReadonlyArray<ColonneTableau>,
  lignes: ReadonlyArray<ReadonlyArray<string>>
): void {
  const gaucheX = doc.page.margins.left
  const largeurTotale = doc.page.width - doc.page.margins.left - doc.page.margins.right
  const largeurs = colonnes.map((colonne) => colonne.largeur * largeurTotale)
  const padding = 4

  function dessinerLigne(cellules: ReadonlyArray<string>, gras: boolean, estEntete: boolean): void {
    doc
      .fontSize(9)
      .font(gras ? 'Helvetica-Bold' : 'Helvetica')
      .fillColor(COULEUR_TEXTE)
    const hauteur =
      Math.max(
        ...cellules.map((valeur, index) => doc.heightOfString(valeur, { width: largeurs[index] - padding * 2 }))
      ) +
      padding * 2

    if (doc.y + hauteur > doc.page.height - doc.page.margins.bottom) {
      doc.addPage()
      if (!estEntete) {
        dessinerLigne(
          colonnes.map((colonne) => colonne.label),
          true,
          true
        )
      }
    }

    const hautY = doc.y
    let curseurX = gaucheX
    cellules.forEach((valeur, index) => {
      doc.text(valeur, curseurX + padding, hautY + padding, {
        align: colonnes[index].align,
        width: largeurs[index] - padding * 2,
      })
      curseurX += largeurs[index]
    })
    const basY = hautY + hauteur
    doc
      .moveTo(gaucheX, basY)
      .lineTo(gaucheX + largeurTotale, basY)
      .lineWidth(0.5)
      .strokeColor(COULEUR_SEPARATEUR)
      .stroke()
    doc['y'] = basY
  }

  dessinerLigne(
    colonnes.map((colonne) => colonne.label),
    true,
    true
  )
  for (const ligne of lignes) {
    dessinerLigne(ligne, false, false)
  }
  doc.moveDown(0.8)
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

function formaterEnTexte(rapport: RapportReadModel): string {
  const lignes: Array<string> = []

  formaterSectionConseillers(lignes, rapport)
  lignes.push('')
  formaterSectionAidants(lignes, rapport)
  lignes.push('')
  formaterSectionFne(lignes, rapport)

  return lignes.join('\n')
}

function formaterSectionConseillers(lignes: Array<string>, rapport: RapportReadModel): void {
  const { conseillersNumeriques, perimetre } = rapport

  lignes.push('=== Conseillers numériques ===')
  lignes.push('')
  lignes.push(
    `${formaterNombre(conseillersNumeriques.total)} conseillers numériques sont déployés` + ` sur ${perimetre.nom}.`
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

function formaterSectionAidants(lignes: Array<string>, rapport: RapportReadModel): void {
  const { aidantsConnect, perimetre } = rapport

  lignes.push("=== Déploiement d'Aidants Connect ===")
  lignes.push('')
  lignes.push(
    "Aidants Connect est le service public numérique qui protège l'aidant et l'usager" +
      " lors de l'accompagnement aux démarches en ligne." +
      ` Dans ${perimetre.nom},` +
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

function formaterSectionFne(lignes: Array<string>, rapport: RapportReadModel): void {
  lignes.push('=== France Numérique Ensemble ===')

  for (const dep of rapport.franceNumerique.departements) {
    lignes.push('')
    lignes.push(`--- Gouvernance de ${dep.nom} ---`)
    if (dep.gouvernance.coporteurs.length > 0) {
      lignes.push(`Coporteurs : ${dep.gouvernance.coporteurs.join(', ')}`)
    }
    if (dep.gouvernance.membres.length > 0) {
      lignes.push(`Membres : ${dep.gouvernance.membres.join(', ')}`)
    }

    for (const fdr of dep.feuillesDeRoute) {
      lignes.push('')
      lignes.push(`  - Feuille de route ${fdr.nom}, portée par ${fdr.porteur.type} (${fdr.porteur.nom})`)

      for (const env of fdr.enveloppes) {
        const recipiendaires = env.beneficiaires.length > 0 ? ` (récipiendaire : ${env.beneficiaires.join(' & ')})` : ''
        const besoins = formaterBesoins(env.besoins)
        lignes.push(`      - Enveloppe ${env.type} de ${formaterMontant(env.montant)}${recipiendaires}${besoins}`)
      }
    }
  }
}

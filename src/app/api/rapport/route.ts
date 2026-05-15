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
import { chromium } from 'playwright'

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

async function genererPdf(rapport: RapportReadModel): Promise<Buffer> {
  const navigateur = await chromium.launch()
  try {
    const page = await navigateur.newPage()
    await page.setContent(genererHtml(rapport), { waitUntil: 'load' })
    return await page.pdf({
      format: 'A4',
      margin: { bottom: '20mm', left: '15mm', right: '15mm', top: '20mm' },
      printBackground: true,
    })
  } finally {
    await navigateur.close()
  }
}

function echapperHtml(valeur: string): string {
  return valeur.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function genererHtml(rapport: RapportReadModel): string {
  const { aidantsConnect, conseillersNumeriques, franceNumerique, perimetre } = rapport
  const sections: Array<string> = []

  const lignesConseillers = conseillersNumeriques.departements
    .map(
      (dep) =>
        `<tr><td>${echapperHtml(dep.nom)}</td>` +
        `<td class="nb">${formaterNombre(dep.nbConseillers)}</td>` +
        `<td class="nb">${formaterNombre(dep.nbBeneficiaires)}</td></tr>`
    )
    .join('')
  sections.push(
    `<h2>Conseillers numériques</h2>` +
      `<p>${formaterNombre(conseillersNumeriques.total)} conseillers numériques sont déployés sur ` +
      `${echapperHtml(perimetre.nom)}.</p>` +
      `<table><thead><tr><th>Départements</th><th class="nb">Nombre de Conseillers numériques</th>` +
      `<th class="nb">Nombre de bénéficiaires depuis 2021</th></tr></thead>` +
      `<tbody>${lignesConseillers}</tbody></table>`
  )

  const lignesAidants = aidantsConnect.departements
    .map((dep) => {
      const suffixe =
        dep.dontConseillers > 0 ? ` dont ${formaterNombre(dep.dontConseillers)} conseillers numériques` : ''
      return `<tr><td>${echapperHtml(dep.nom)}</td><td>${formaterNombre(dep.nbHabilites)}${suffixe}</td></tr>`
    })
    .join('')
  sections.push(
    `<h2>Déploiement d'Aidants Connect</h2>` +
      `<p>Aidants Connect est le service public numérique qui protège l'aidant et l'usager lors de ` +
      `l'accompagnement aux démarches en ligne. Dans ${echapperHtml(perimetre.nom)}, ` +
      `${formaterNombre(aidantsConnect.totalHabilites)} aidants et référents sont habilités Aidants Connect, ` +
      `dont ${formaterNombre(aidantsConnect.totalDontConseillers)} conseillers numériques.</p>` +
      `<table><thead><tr><th>Départements</th>` +
      `<th>Aidants et référents habilités Aidants Connect</th></tr></thead>` +
      `<tbody>${lignesAidants}</tbody></table>`
  )

  const blocsFne: Array<string> = ['<h2>France Numérique Ensemble</h2>']
  for (const dep of franceNumerique.departements) {
    blocsFne.push(`<h3>Gouvernance de ${echapperHtml(dep.nom)}</h3>`)
    if (dep.gouvernance.coporteurs.length > 0) {
      blocsFne.push(`<p><strong>Coporteurs : </strong>${echapperHtml(dep.gouvernance.coporteurs.join(', '))}</p>`)
    }
    if (dep.gouvernance.membres.length > 0) {
      blocsFne.push(`<p><strong>Membres : </strong>${echapperHtml(dep.gouvernance.membres.join(', '))}</p>`)
    }
    for (const fdr of dep.feuillesDeRoute) {
      blocsFne.push(`<h4>Feuille de route ${echapperHtml(fdr.nom)}</h4>`)
      blocsFne.push(`<p>Portée par ${echapperHtml(fdr.porteur.type)} (${echapperHtml(fdr.porteur.nom)})</p>`)
      const items = fdr.enveloppes
        .map((env) => {
          const recipiendaires =
            env.beneficiaires.length > 0 ? ` (récipiendaire : ${env.beneficiaires.join(' & ')})` : ''
          return (
            `<li>Enveloppe ${echapperHtml(env.type)} de ${formaterMontant(env.montant)}` +
            `${echapperHtml(recipiendaires)}${echapperHtml(formaterBesoins(env.besoins))}</li>`
          )
        })
        .join('')
      blocsFne.push(`<ul>${items}</ul>`)
    }
  }
  sections.push(blocsFne.join(''))

  return (
    `<!doctype html><html lang="fr"><head><meta charset="utf-8">` +
    `<style>` +
    `body{font-family:Arial,Helvetica,sans-serif;color:#161616;font-size:12px;}` +
    `h1{color:#000091;font-size:22px;}h2{color:#000091;font-size:18px;margin-top:24px;}` +
    `h3{font-size:15px;}h4{font-size:13px;}` +
    `table{width:100%;border-collapse:collapse;margin:8px 0;}` +
    `th,td{text-align:left;padding:4px 8px;border-bottom:1px solid #ddd;}` +
    `td.nb,th.nb{text-align:right;}` +
    `</style></head><body>` +
    `<h1>Rapports de situation de l'inclusion numérique</h1>` +
    `<p>Périmètre : ${echapperHtml(perimetre.nom)}.</p>` +
    sections.join('') +
    `</body></html>`
  )
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

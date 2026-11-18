import PDFDocument from 'pdfkit'

import {
  QuestionnairePapierViewModel,
  QuestionPapierViewModel,
} from '@/presenters/mesure-impact/questionnairePapierPresenter'

// Questionnaire à imprimer, en A4, mise en page simple. Le PDF est balisé (titres, paragraphes, listes,
// tableau) et en français ; les cases à cocher et les lignes d'écriture sont des éléments de mise en page. Le logo
// du territoire, s'il y en a un, ouvre la première page.
export async function pdfDuQuestionnairePapier(
  viewModel: QuestionnairePapierViewModel,
  logo?: LogoDuTerritoire
): Promise<Buffer> {
  const doc = new PDFDocument({
    bufferPages: true,
    displayTitle: true,
    info: { Title: `${viewModel.titre} – ${viewModel.territoire}` },
    lang: 'fr-FR',
    margin: MARGE,
    pdfVersion: '1.7',
    size: 'A4',
    tagged: true,
  })
  const morceaux: Array<Buffer> = []
  const termine = new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (morceau: Buffer) => morceaux.push(morceau))
    doc.on('end', () => {
      resolve(Buffer.concat(morceaux))
    })
    doc.on('error', reject)
  })

  const racine = doc.struct('Document')
  doc.addStructure(racine)
  const page = new Page(doc, racine)

  page.entete(viewModel, logo)
  // Un titre de partie ne reste pas seul en bas de page, ni le mot de la fin seul sur la dernière page
  const derniere = viewModel.parties.at(-1)?.questions.at(-1)
  viewModel.parties.forEach((partie) => {
    page.partie(partie.titre, partie.intro, partie.questions.at(0))
    partie.questions.forEach((question) => {
      page.question(question, question === derniere ? page.hauteurDeLaFin(viewModel.fin) : 0)
    })
  })
  page.fin(viewModel.fin)
  page.numeroter()

  doc.end()
  return termine
}

export type LogoDuTerritoire = Readonly<{
  // Texte alternatif de l'image
  description: string
  image: Buffer
}>

const MARGE = 50
// Environ 2 cm de haut : la largeur suit les proportions de l'image
const HAUTEUR_DU_LOGO = 56
const TAILLE = { aide: 9, partie: 14, question: 11, texte: 10, titre: 18 } as const
const COULEUR = { aide: '#666666', texte: '#161616', titre: '#000091', trait: '#929292' } as const
const CASE = 10
const RETRAIT = 18
const INTERLIGNE = 5
const LIGNE_D_ECRITURE = 22
const ESPACE = { fin: 18, intro: 4, logo: 14, partie: 18, question: 12, reponse: 5 } as const
const HAUTEUR_CODE_POSTAL = 26
const HAUTEUR_LIGNE_DE_GRILLE = 22

class Page {
  readonly #doc: PDFKit.PDFDocument

  // Position verticale de l'écriture, suivie ici plutôt que dans le curseur de pdfkit
  #haut: number

  readonly #racine: PDFKit.PDFStructureElement
  get #hauteurUtile(): number {
    return this.#doc.page.height - this.#doc.page.margins.top - this.#doc.page.margins.bottom
  }

  get #largeur(): number {
    return this.#doc.page.width - MARGE * 2
  }

  constructor(doc: PDFKit.PDFDocument, racine: PDFKit.PDFStructureElement) {
    this.#doc = doc
    this.#racine = racine
    this.#haut = doc.y
  }

  entete(viewModel: QuestionnairePapierViewModel, logo: LogoDuTerritoire | undefined): void {
    if (logo !== undefined) {
      this.#logo(logo)
    }
    this.#texte(viewModel.titre, { couleur: COULEUR.titre, police: 'Helvetica-Bold', taille: TAILLE.titre, type: 'H1' })
    this.#texte(viewModel.territoire, { police: 'Helvetica-Bold', taille: TAILLE.question })
    this.#espace(6)
    this.#texte(viewModel.introduction)
    this.#espace(6)
    this.#police('Helvetica', TAILLE.texte, COULEUR.texte)
    this.#doc.list([...viewModel.consignes], MARGE + 4, this.#haut, {
      bulletRadius: 1.5,
      paragraphGap: 2,
      structParent: this.#racine,
      textIndent: 10,
      width: this.#largeur - 4,
    })
    this.#haut = this.#doc.y
  }

  fin(texte: string): void {
    this.#assurerLaPlace(this.hauteurDeLaFin(texte))
    this.#espace(ESPACE.fin)
    this.#texte(texte, { police: 'Helvetica-Bold', taille: TAILLE.question })
  }

  hauteurDeLaFin(texte: string): number {
    this.#police('Helvetica-Bold', TAILLE.question, COULEUR.texte)
    return ESPACE.fin + this.#doc.heightOfString(texte, { width: this.#largeur })
  }

  // Numéro de page en pied, sur chaque page : utile une fois les feuilles photocopiées et mélangées
  numeroter(): void {
    const { count, start } = this.#doc.bufferedPageRange()
    for (let index = start; index < start + count; index += 1) {
      this.#doc.switchToPage(index)
      const basDePage = this.#doc.page.margins.bottom
      this.#doc.page.margins.bottom = 0
      this.#doc.markContent('Artifact', { type: 'Pagination' })
      this.#police('Helvetica', TAILLE.aide, COULEUR.aide)
      this.#doc.text(`Page ${index - start + 1} sur ${count}`, MARGE, this.#doc.page.height - MARGE + 15, {
        align: 'center',
        width: this.#largeur,
      })
      this.#doc.endMarkedContent()
      this.#doc.page.margins.bottom = basDePage
    }
  }

  partie(titre: string, intro: string, premiere: QuestionPapierViewModel | undefined): void {
    this.#police('Helvetica-Bold', TAILLE.partie, COULEUR.titre)
    const hauteurDuTitre = this.#doc.heightOfString(titre, { width: this.#largeur })
    this.#police('Helvetica', TAILLE.texte, COULEUR.texte)
    const entete =
      ESPACE.partie + hauteurDuTitre + ESPACE.intro + this.#doc.heightOfString(intro, { width: this.#largeur })
    this.#assurerLaPlace(entete + (premiere === undefined ? 0 : this.#placeDeLaQuestion(premiere, 0)))
    this.#espace(ESPACE.partie)
    this.#texte(titre, { couleur: COULEUR.titre, police: 'Helvetica-Bold', taille: TAILLE.partie, type: 'H2' })
    this.#espace(ESPACE.intro)
    this.#texte(intro)
  }

  // `suite` : hauteur de ce qui doit rester sur la même page que la question
  question(question: QuestionPapierViewModel, suite: number): void {
    this.#assurerLaPlace(this.#placeDeLaQuestion(question, suite))
    this.#espace(ESPACE.question)
    this.#texte(question.titre, { police: 'Helvetica-Bold', taille: TAILLE.question, type: 'H3' })
    if (question.consigne !== undefined) {
      this.#texte(question.consigne, { police: 'Helvetica-BoldOblique', taille: TAILLE.aide })
    }
    if (question.aide !== undefined) {
      this.#texte(question.aide, { couleur: COULEUR.aide, police: 'Helvetica-Oblique', taille: TAILLE.aide })
    }
    this.#espace(ESPACE.reponse)
    const { reponse } = question
    switch (reponse.type) {
      case 'cases':
        reponse.cases.forEach(({ libelle, precisez }) => {
          this.#case(libelle, reponse.forme, RETRAIT)
          if (precisez) {
            this.#lignesDEcriture(1, RETRAIT * 2)
          }
        })
        if (reponse.lequel !== undefined) {
          this.#espace(4)
          this.#texte(reponse.lequel.titre, { decalage: RETRAIT, police: 'Helvetica-Oblique' })
          reponse.lequel.cases.forEach((libelle) => {
            this.#case(libelle, 'carre', RETRAIT * 2)
          })
        }
        if (reponse.pourquoi !== undefined) {
          this.#espace(4)
          this.#texte(reponse.pourquoi, { decalage: RETRAIT, police: 'Helvetica-Oblique' })
          this.#lignesDEcriture(2, RETRAIT)
        }
        break
      case 'code-postal':
        this.#casesDuCodePostal()
        break
      case 'echelle':
        this.#echelle(reponse.niveaux)
        break
      case 'grille':
        this.#grille(reponse.colonnes, reponse.lignes)
        break
    }
  }

  #artefact(dessin: () => void): void {
    this.#doc.markContent('Artifact', { type: 'Layout' })
    this.#doc.save()
    this.#doc.lineWidth(0.8).strokeColor(COULEUR.trait)
    dessin()
    this.#doc.restore()
    this.#doc.endMarkedContent()
  }

  #assurerLaPlace(hauteur: number): void {
    if (this.#haut + hauteur > this.#doc.page.height - this.#doc.page.margins.bottom) {
      this.#doc.addPage()
      this.#haut = this.#doc.y
    }
  }

  #case(libelle: string, forme: 'carre' | 'rond', decalage: number): void {
    this.#assurerLaPlace(this.#hauteurDeCase(libelle, decalage))
    const haut = this.#haut
    const gauche = MARGE + decalage
    this.#artefact(() => {
      if (forme === 'rond') {
        this.#doc.circle(gauche + CASE / 2, haut + CASE / 2, CASE / 2).stroke()
      } else {
        this.#doc.rect(gauche, haut, CASE, CASE).stroke()
      }
    })
    this.#texte(libelle, { decalage: decalage + CASE + 8 })
    this.#haut = Math.max(this.#haut, haut + CASE) + INTERLIGNE
  }

  #casesDuCodePostal(): void {
    this.#assurerLaPlace(30)
    const haut = this.#haut
    this.#artefact(() => {
      for (let index = 0; index < 5; index += 1) {
        this.#doc.rect(MARGE + RETRAIT + index * 22, haut, 22, HAUTEUR_CODE_POSTAL).stroke()
      }
    })
    this.#haut = haut + HAUTEUR_CODE_POSTAL + INTERLIGNE
  }

  #echelle(niveaux: ReadonlyArray<string>): void {
    this.#assurerLaPlace(CASE + INTERLIGNE)
    const haut = this.#haut
    niveaux.forEach((niveau, index) => {
      const gauche = MARGE + RETRAIT + index * 60
      this.#artefact(() => {
        this.#doc.rect(gauche, haut, CASE, CASE).stroke()
      })
      this.#police('Helvetica', TAILLE.texte, COULEUR.texte)
      this.#doc.text(niveau, gauche + CASE + 6, haut, { lineBreak: false, structParent: this.#racine })
    })
    this.#haut = haut + CASE + INTERLIGNE
  }

  #espace(hauteur: number): void {
    this.#haut += hauteur
  }

  // Tableau : une ligne par élément, une colonne par réponse possible, un rond à cocher à chaque croisement
  #grille(colonnes: ReadonlyArray<string>, lignes: ReadonlyArray<string>): void {
    const hauteurDeLigne = HAUTEUR_LIGNE_DE_GRILLE
    const largeurDuLibelle = this.#largeur * 0.5
    const largeurDeColonne = (this.#largeur - RETRAIT - largeurDuLibelle) / colonnes.length
    function xColonne(index: number): number {
      return MARGE + RETRAIT + largeurDuLibelle + index * largeurDeColonne
    }
    this.#assurerLaPlace(hauteurDeLigne * (lignes.length + 1))
    const tableau = this.#doc.struct('Table')
    this.#racine.add(tableau)

    const yEntete = this.#haut
    const entete = this.#doc.struct('TR')
    tableau.add(entete)
    this.#police('Helvetica-Bold', TAILLE.aide, COULEUR.texte)
    colonnes.forEach((colonne, index) => {
      const cellule = this.#doc.struct('TH')
      entete.add(cellule)
      this.#doc.text(colonne, xColonne(index), yEntete, {
        align: 'center',
        structParent: cellule,
        width: largeurDeColonne,
      })
    })

    lignes.forEach((libelle, numero) => {
      const haut = yEntete + hauteurDeLigne * (numero + 1)
      const ligne = this.#doc.struct('TR')
      tableau.add(ligne)
      const cellule = this.#doc.struct('TH')
      ligne.add(cellule)
      this.#police('Helvetica', TAILLE.texte, COULEUR.texte)
      this.#doc.text(libelle, MARGE + RETRAIT, haut + 5, { structParent: cellule, width: largeurDuLibelle })
      this.#artefact(() => {
        this.#doc
          .moveTo(MARGE + RETRAIT, haut)
          .lineTo(MARGE + this.#largeur, haut)
          .stroke()
        colonnes.forEach((_, index) => {
          this.#doc.circle(xColonne(index) + largeurDeColonne / 2, haut + hauteurDeLigne / 2, CASE / 2).stroke()
        })
      })
    })
    this.#tableauTermine(yEntete + hauteurDeLigne * (lignes.length + 1))
    tableau.end()
  }

  #hauteurDeCase(libelle: string, decalage: number): number {
    this.#police('Helvetica', TAILLE.texte, COULEUR.texte)
    const hauteur = this.#doc.heightOfString(libelle, { width: this.#largeur - decalage - CASE - 8 })
    return Math.max(hauteur, CASE) + INTERLIGNE
  }

  #hauteurDeLaReponse(reponse: QuestionPapierViewModel['reponse']): number {
    switch (reponse.type) {
      case 'cases': {
        const cases = reponse.cases.reduce(
          (somme, { libelle, precisez }) =>
            somme + this.#hauteurDeCase(libelle, RETRAIT) + (precisez ? LIGNE_D_ECRITURE + INTERLIGNE : 0),
          0
        )
        this.#police('Helvetica-Oblique', TAILLE.texte, COULEUR.texte)
        const lequel =
          reponse.lequel === undefined
            ? 0
            : 4 +
              this.#doc.heightOfString(reponse.lequel.titre, { width: this.#largeur - RETRAIT }) +
              reponse.lequel.cases.reduce((somme, libelle) => somme + this.#hauteurDeCase(libelle, RETRAIT * 2), 0)
        this.#police('Helvetica-Oblique', TAILLE.texte, COULEUR.texte)
        const pourquoi =
          reponse.pourquoi === undefined
            ? 0
            : 4 +
              this.#doc.heightOfString(reponse.pourquoi, { width: this.#largeur - RETRAIT }) +
              LIGNE_D_ECRITURE * 2 +
              INTERLIGNE
        return cases + lequel + pourquoi
      }
      case 'code-postal':
        return HAUTEUR_CODE_POSTAL + INTERLIGNE
      case 'echelle':
        return CASE + INTERLIGNE
      case 'grille':
        return HAUTEUR_LIGNE_DE_GRILLE * (reponse.lignes.length + 1) + INTERLIGNE
    }
  }

  #hauteurDeLIntitule(question: QuestionPapierViewModel): number {
    this.#police('Helvetica-Bold', TAILLE.question, COULEUR.texte)
    const titre = this.#doc.heightOfString(question.titre, { width: this.#largeur })
    this.#police('Helvetica-Oblique', TAILLE.aide, COULEUR.aide)
    const aides = [question.consigne, question.aide]
      .filter((texte) => texte !== undefined)
      .map((texte) => this.#doc.heightOfString(texte, { width: this.#largeur }))
    return aides.reduce((somme, hauteur) => somme + hauteur, titre)
  }

  #lignesDEcriture(nombre: number, decalage: number): void {
    this.#assurerLaPlace(LIGNE_D_ECRITURE * nombre)
    const haut = this.#haut
    this.#artefact(() => {
      for (let index = 1; index <= nombre; index += 1) {
        this.#doc
          .moveTo(MARGE + decalage, haut + LIGNE_D_ECRITURE * index)
          .lineTo(MARGE + this.#largeur, haut + LIGNE_D_ECRITURE * index)
          .dash(1, { space: 2 })
          .stroke()
          .undash()
      }
    })
    this.#haut = haut + LIGNE_D_ECRITURE * nombre + INTERLIGNE
  }

  #logo({ description, image }: LogoDuTerritoire): void {
    const haut = this.#haut
    this.#racine.add(
      this.#doc.struct('Figure', { alt: description }, () => {
        this.#doc.image(image, MARGE, haut, { height: HAUTEUR_DU_LOGO })
      })
    )
    this.#haut = haut + HAUTEUR_DU_LOGO + ESPACE.logo
  }

  // Une question tient sur une seule page quand c'est possible ; sinon, elle ne commence pas en bas de page
  // sans la place pour son intitulé et ses premières réponses
  #placeDeLaQuestion(question: QuestionPapierViewModel, suite: number): number {
    const intitule = ESPACE.question + this.#hauteurDeLIntitule(question) + ESPACE.reponse
    const entiere = intitule + this.#hauteurDeLaReponse(question.reponse) + suite
    return entiere <= this.#hauteurUtile ? entiere : intitule + 60
  }

  #police(police: string, taille: number, couleur: string): void {
    this.#doc.font(police).fontSize(taille).fillColor(couleur)
  }

  #tableauTermine(haut: number): void {
    this.#artefact(() => {
      this.#doc
        .moveTo(MARGE + RETRAIT, haut)
        .lineTo(MARGE + this.#largeur, haut)
        .stroke()
    })
    this.#haut = haut + INTERLIGNE
  }

  #texte(texte: string, options: OptionsDeTexte = {}): void {
    const { couleur = COULEUR.texte, decalage = 0, police = 'Helvetica', taille = TAILLE.texte, type = 'P' } = options
    this.#police(police, taille, couleur)
    this.#doc.text(texte, MARGE + decalage, this.#haut, {
      structParent: this.#racine,
      structType: type,
      width: this.#largeur - decalage,
    })
    this.#haut = this.#doc.y
  }
}

type OptionsDeTexte = Readonly<{
  couleur?: string
  decalage?: number
  police?: string
  taille?: number
  type?: 'H1' | 'H2' | 'H3' | 'P'
}>

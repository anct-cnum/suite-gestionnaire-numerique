import { DefinitionQuestionnaire, Option } from './Questionnaire'

// Questionnaire socle v22 (22/10/2026), libellés tels quels, avec les retours du 06/11/2026.
// Les codes des questions et des options sont stables : ils sont enregistrés dans les réponses
// et ne changent jamais. Une modification de règle, ou de libellé qui en change le sens, donne une
// nouvelle version ; une reformulation qui garde le sens se fait dans la version en place.

const MULTI = 'Vous pouvez sélectionner plusieurs réponses.'
const MIEUX = 'Cochez la réponse qui correspond le mieux.'
const POSITIF = ['oui-tout-a-fait', 'plutot-oui']
const AISANCE = { maximum: 'Très à l’aise', minimum: 'Pas du tout à l’aise' }

const EQUIPEMENTS: ReadonlyArray<Option> = [
  { code: 'ordinateur-fixe', libelle: 'Ordinateur fixe' },
  { code: 'ordinateur-portable', libelle: 'Ordinateur portable' },
  { code: 'tablette', libelle: 'Tablette' },
  { code: 'telephone-portable', libelle: 'Téléphone portable' },
  { code: 'imprimante-papier', libelle: 'Imprimante papier' },
  { code: 'imprimante-3d', libelle: 'Imprimante 3D' },
  { code: 'console-jeux-video', libelle: 'Console de jeux vidéo' },
]

const AUTRE: Option = { code: 'autre', libelle: 'Autre' }

const ACCORD: ReadonlyArray<Option> = [
  { code: 'oui-tout-a-fait', libelle: 'Oui tout à fait' },
  { code: 'plutot-oui', libelle: 'Plutôt oui' },
  { code: 'plutot-non', libelle: 'Plutôt non' },
  { code: 'non-pas-du-tout', libelle: 'Non pas du tout' },
]

function usagesDuNumerique(demarches: string): ReadonlyArray<Option> {
  return [
    { code: 'echanger-proches', libelle: 'Échanger avec des proches, des amis…' },
    { code: 'travailler', libelle: 'Travailler ou chercher un travail' },
    { code: 'me-soigner', libelle: 'Me soigner (prendre des rendez-vous médicaux, téléconsultation…)' },
    {
      code: 'me-deplacer',
      libelle: 'Me déplacer (utiliser un GPS, acheter des billets de transport en commun, train…)',
    },
    {
      code: 'etre-citoyen',
      libelle: "Être citoyen, m'engager (faire du bénévolat associatif, signer des pétitions…)",
    },
    { code: 'demarches-administratives', libelle: demarches },
    { code: 'gerer-budget', libelle: 'Gérer mon budget (consulter son compte bancaire…)' },
    { code: 'trouver-logement', libelle: 'Trouver un logement (consulter des sites d’annonces…)' },
    {
      code: 'me-former',
      libelle: 'Me former (suivre des cours en ligne, apprendre pour mon parcours professionnel ou scolaire/étude…)',
    },
    { code: 'scolarite-enfants', libelle: 'Suivre la scolarité de mon(mes) enfant(s)' },
    { code: 'me-detendre', libelle: 'Me détendre (écouter de la musique, lire des livres…)' },
    {
      code: 'me-cultiver',
      libelle: 'Me cultiver (rechercher des informations, apprendre pour mon plaisir personnel…)',
    },
    { code: 'acheter', libelle: 'Acheter des objets ou des services (vêtements, meubles, alimentation…)' },
    AUTRE,
  ]
}

export const questionnaireSocleV22: DefinitionQuestionnaire = {
  parties: [
    {
      code: 'contexte',
      intro: 'Tout d’abord, nous nous intéressons au contexte de vos accompagnements à l’utilisation du numérique.',
      libelle: 'Le contexte',
      titre: 'Le contexte de vos accompagnements',
    },
    {
      code: 'bilan',
      intro: 'Nous allons maintenant nous intéresser au bilan de vos accompagnements à l’utilisation du numérique.',
      libelle: 'Le bilan',
      titre: 'Le bilan de vos accompagnements',
    },
    {
      code: 'vous',
      intro: 'Et pour terminer, simplement quelques informations à propos de vous.',
      libelle: 'À propos de vous',
      titre: 'À propos de vous',
    },
  ],
  questions: [
    // Partie 1 : le contexte de vos accompagnements
    {
      aide: MULTI,
      code: 'q1',
      optionAutre: 'autre',
      options: usagesDuNumerique('Faire des démarches administratives (Assurance maladie, CAF, impôts…)'),
      partie: 'contexte',
      titre:
        'Dans votre vie quotidienne, quelles sont les principales raisons pour lesquelles vous utilisez le numérique ?',
      type: 'choix-multiple',
    },
    {
      aide: MULTI,
      code: 'q2',
      optionAutre: 'autre',
      options: [
        {
          code: 'acces-connexion-equipements',
          libelle:
            'Pour avoir accès à une connexion internet ou à des équipements numériques (ordinateur, imprimantes, téléphone portable)',
        },
        {
          code: 'utiliser-outils-equipements',
          libelle:
            'Pour apprendre à utiliser les outils et équipements numériques (souris, clavier, ordinateurs, téléphone portable, tablette, imprimante)',
        },
        { code: 'utiliser-internet', libelle: 'Pour apprendre à utiliser Internet' },
        { code: 'curiosite', libelle: 'Par curiosité, pour apprendre de nouvelles choses' },
        { code: 'm-ameliorer', libelle: 'Pour m’améliorer dans l’utilisation du numérique' },
        { code: 'debloquer-situation', libelle: 'Pour débloquer une situation' },
        {
          code: 'etre-rassure',
          libelle: 'Pour être rassuré(e), car je suis stressé(e) quand j’utilise le numérique',
        },
        { code: 'rencontrer-personnes', libelle: 'Pour rencontrer de nouvelles personnes' },
        AUTRE,
      ],
      partie: 'contexte',
      titre: 'Pourquoi avez-vous suivi ces accompagnements à l’utilisation du numérique ?',
      type: 'choix-multiple',
    },
    {
      aide: "Nombre de séances, de rendez-vous ou d'ateliers.",
      code: 'q3',
      options: [
        { code: '1-a-4', libelle: 'Entre 1 et 4 séances' },
        { code: '5-a-9', libelle: 'Entre 5 et 9 séances' },
        { code: '10-a-15', libelle: 'Entre 10 et 15 séances' },
        { code: '16-et-plus', libelle: '16 séances ou plus' },
      ],
      partie: 'contexte',
      titre: 'Combien de fois environ avez-vous été accompagné(e) ?',
      type: 'choix-unique',
    },
    {
      aide: MULTI,
      code: 'q4',
      options: [
        { code: 'individuel', libelle: 'Accompagnement individuel' },
        { code: 'collectif', libelle: 'Accompagnement collectif' },
      ],
      partie: 'contexte',
      titre: 'Quel(s) type(s) d’accompagnement avez-vous reçu ?',
      type: 'choix-multiple',
    },
    {
      aide: MULTI,
      code: 'q5',
      optionAutre: 'autre',
      optionExclusive: 'aucun',
      options: [...EQUIPEMENTS, { code: 'aucun', libelle: 'Aucun' }, AUTRE],
      partie: 'contexte',
      titre: 'Dans votre vie quotidienne, quel(s) équipement(s) numérique(s) utilisez-vous ?',
      type: 'choix-multiple',
    },
    {
      aide: MULTI,
      code: 'q6',
      optionAutre: 'autre',
      options: [...EQUIPEMENTS, AUTRE],
      partie: 'contexte',
      titre: 'Pendant vos accompagnements, quel(s) équipement(s) numérique(s) avez-vous utilisé ?',
      type: 'choix-multiple',
    },
    {
      code: 'q7',
      // « Si Oui, lequel/lesquels ? » : les équipements cochés à la Q5, champ texte s'il n'y en a aucun
      lequel: { options: EQUIPEMENTS, parmiLesReponsesA: 'q5', siOption: 'oui' },
      options: [
        { code: 'oui', libelle: 'Oui' },
        { code: 'non', libelle: 'Non' },
      ],
      partie: 'contexte',
      titre: 'Pendant vos accompagnements, avez-vous utilisé un équipement numérique qui vous appartient ?',
      type: 'choix-unique',
    },
    {
      aide: MULTI,
      code: 'q8',
      optionAutre: 'autre',
      options: [
        {
          code: 'prise-en-main-outils',
          libelle:
            'La prise en main des outils et équipements numériques (souris, clavier, ordinateurs, tablette, téléphone portable, imprimante papier…)',
        },
        { code: 'recherche-informations', libelle: 'La recherche d’informations sur Internet' },
        { code: 'risques-numeriques', libelle: 'Les risques numériques (arnaques, escroqueries…)' },
        { code: 'donnees-personnelles', libelle: 'La protection de mes données personnelles sur Internet' },
        { code: 'demarches-administratives', libelle: 'Les démarches administratives en ligne' },
        {
          code: 'logiciels-ordinateur',
          condition: { question: 'q6', reponsesParmi: ['ordinateur-fixe', 'ordinateur-portable'] },
          libelle: 'L’utilisation de logiciels sur ordinateur (traitement de texte, tableur, messagerie, etc.)',
        },
        {
          code: 'applications-telephone',
          condition: { question: 'q6', reponsesParmi: ['telephone-portable'] },
          libelle: 'L’utilisation d’applications sur téléphone portable',
        },
        {
          code: 'outils-communication',
          libelle: 'L’utilisation d’outils de communication (courriels, WhatsApp, Messenger…)',
        },
        {
          code: 'reseaux-sociaux',
          libelle: 'L’utilisation des réseaux sociaux (Facebook, Instagram, TikTok…)',
        },
        { code: 'intelligence-artificielle', libelle: 'L’utilisation de l’intelligence artificielle (IA)' },
        { code: 'imprimante-3d', libelle: 'L’utilisation d’une imprimante 3D' },
        {
          code: 'contenus-numeriques',
          libelle: 'La gestion de contenus numériques (photos, vidéos, fichiers textes…)',
        },
        {
          code: 'impacts-environnementaux-sociaux',
          libelle: 'Les impacts environnementaux ou sociaux du numérique',
        },
        AUTRE,
      ],
      partie: 'contexte',
      titre: 'Pendant vos accompagnements, quels ont été les principaux sujets abordés ?',
      type: 'choix-multiple',
    },
    // Partie 2 : le bilan de vos accompagnements
    {
      code: 'q9',
      options: ACCORD,
      optionsPourquoi: ['plutot-non', 'non-pas-du-tout'],
      partie: 'bilan',
      titre: 'Est-ce que les accompagnements à l’utilisation du numérique ont répondu à vos attentes ?',
      type: 'choix-unique',
    },
    {
      code: 'q10',
      partie: 'bilan',
      poles: AISANCE,
      titre: 'Avant ces accompagnements, comment vous sentiez-vous avec le numérique, sur une échelle de 1 à 5 ?',
      type: 'echelle',
    },
    {
      code: 'q11',
      partie: 'bilan',
      poles: AISANCE,
      titre:
        'Et aujourd’hui, après ces accompagnements, comment vous sentez-vous avec le numérique, sur une échelle de 1 à 5 ?',
      type: 'echelle',
    },
    {
      code: 'q12',
      options: [
        { code: 'oui-tout-a-fait', libelle: 'Oui tout à fait' },
        { code: 'plutot-oui', libelle: 'Plutôt oui' },
        { code: 'plutot-non', libelle: 'Plutôt non' },
        { code: 'pas-du-tout', libelle: 'Pas du tout' },
      ],
      optionsPourquoi: ['plutot-non', 'pas-du-tout'],
      partie: 'bilan',
      titre: 'Avez-vous le sentiment d’avoir progressé dans l’utilisation du numérique grâce aux accompagnements ?',
      type: 'choix-unique',
    },
    {
      aide: MULTI,
      code: 'q13',
      condition: { question: 'q12', reponsesParmi: POSITIF },
      optionAutre: 'autre',
      options: usagesDuNumerique('Accéder à des démarches administratives sur Internet'),
      partie: 'bilan',
      titre: 'Dans quels domaines en particulier ?',
      type: 'choix-multiple',
    },
    {
      code: 'q14',
      // Seulement les équipements cochés à la Q6, dans l'ordre du document
      lignes: {
        options: [
          { code: 'ordinateur-portable', libelle: 'Ordinateur portable' },
          { code: 'tablette', libelle: 'Tablette' },
          { code: 'telephone-portable', libelle: 'Téléphone portable' },
          { code: 'ordinateur-fixe', libelle: 'Ordinateur fixe' },
          { code: 'imprimante-papier', libelle: 'Imprimante papier' },
          { code: 'imprimante-3d', libelle: 'Imprimante 3D' },
          { code: 'console-jeux-video', libelle: 'Console de jeux vidéo' },
        ],
        parmiLesReponsesA: 'q6',
      },
      options: [
        { code: 'plutot-oui', libelle: 'Plutôt oui' },
        { code: 'plutot-non', libelle: 'Plutôt non' },
      ],
      partie: 'bilan',
      titre:
        'Diriez-vous que les accompagnements vous ont permis de mieux maîtriser les équipements numériques suivants ?',
      type: 'grille',
    },
    {
      code: 'q15',
      options: ACCORD,
      optionsPourquoi: ['plutot-non', 'non-pas-du-tout'],
      partie: 'bilan',
      titre:
        'Aujourd’hui, réussissez-vous à faire des choses avec le numérique que vous n’arriviez pas à faire avant vos accompagnements ?',
      type: 'choix-unique',
    },
    {
      aide: MULTI,
      code: 'q16',
      condition: { question: 'q15', reponsesParmi: POSITIF },
      optionAutre: 'autre',
      options: [
        {
          code: 'utiliser-equipements',
          libelle: 'Utiliser une souris ou un clavier, un ordinateur, une tablette, un téléphone portable',
        },
        { code: 'me-connecter-internet', libelle: 'Me connecter à Internet' },
        { code: 'document-texte', libelle: 'Créer ou modifier un document de texte' },
        { code: 'envoyer-messages', libelle: 'Envoyer des messages à une personne (par écrit ou par vocal)' },
        { code: 'rechercher-informations', libelle: 'Rechercher des informations sur Internet' },
        { code: 'proteger-donnees', libelle: 'Protéger mes données personnelles sur Internet' },
        { code: 'eviter-risques', libelle: 'Repérer et éviter des risques numériques (arnaques, escroqueries…)' },
        {
          code: 'verifier-fiabilite',
          libelle: 'Vérifier la fiabilité des informations que je trouve sur Internet et les réseaux sociaux',
        },
        {
          code: 'compte-en-ligne',
          libelle:
            'Me créer ou me connecter à un compte ou un espace personnel sur Internet (pour les démarches administratives, réseaux sociaux, achats en ligne…)',
        },
        {
          code: 'creer-images-videos',
          libelle:
            'Créer ou modifier des images, des photos, des vidéos, de la musique (diaporama, montage photo ou audio…)',
        },
        { code: 'demarches-administratives', libelle: 'Accéder à des démarches administratives sur Internet' },
        { code: 'intelligence-artificielle', libelle: 'Utiliser l’intelligence artificielle (IA)' },
        { code: 'imprimer-document', libelle: 'Imprimer un document de texte, des images, des photos' },
        { code: 'imprimer-3d', libelle: 'Imprimer un objet en 3D' },
        AUTRE,
      ],
      partie: 'bilan',
      titre: 'Lesquelles ?',
      type: 'choix-multiple',
    },
    {
      code: 'q17',
      optionAutre: 'autre',
      options: [
        {
          code: 'entourage',
          libelle: 'Une personne de votre entourage, un proche (famille, amis, voisins…)',
        },
        { code: 'france-services', libelle: 'Une personne en Maison France Services' },
        { code: 'maison-departementale', libelle: 'Une personne en Maison départementale de proximité' },
        { code: 'mairie', libelle: 'Une personne en mairie' },
        { code: 'bibliotheque', libelle: 'Une personne en bibliothèque, médiathèque' },
        { code: 'association-tiers-lieu', libelle: 'Une personne dans une association ou un tiers-lieu' },
        { code: 'ne-sait-pas', libelle: 'Je ne sais pas vers qui me tourner pour être accompagné(e) à l’avenir' },
        AUTRE,
      ],
      partie: 'bilan',
      titre:
        "Aujourd'hui, lorsque vous ressentez le besoin d’être de nouveau accompagné(e) dans votre utilisation du numérique, vers qui vous tournez-vous ?",
      type: 'choix-unique',
    },
    {
      aide: MULTI,
      code: 'q18',
      optionAutre: 'autre',
      optionExclusive: 'rien-n-a-change',
      options: [
        { code: 'entourage-progres', libelle: 'Mon entourage (famille, amis, voisins…) a remarqué mes progrès.' },
        {
          code: 'personnes-accompagnements-progres',
          libelle: 'Les personnes présentes lors des accompagnements ont remarqué mes progrès.',
        },
        { code: 'moins-peur-risques', libelle: "J'ai moins peur des risques numériques." },
        { code: 'autonome', libelle: 'J’arrive à utiliser le numérique tout(e) seul(e).' },
        { code: 'moins-stresse', libelle: "Je suis moins stressé(e) à l'idée d’utiliser le numérique." },
        {
          code: 'competences-exercices',
          libelle: "Je me suis rendu compte que j'avais des compétences car j'ai réussi des exercices.",
        },
        {
          code: 'confiant-groupe',
          libelle:
            "Je suis plus confiant(e) car j'ai travaillé avec d'autres personnes qui avaient les mêmes difficultés que moi avec le numérique.",
        },
        { code: 'moins-isole', libelle: 'Je me sens moins seul(e) ou isolé(e).' },
        {
          code: 'impact-environnemental-social',
          libelle: 'Je fais attention à l’impact environnemental ou social de mon utilisation du numérique.',
        },
        { code: 'rien-n-a-change', libelle: 'Rien n’a changé' },
        AUTRE,
      ],
      partie: 'bilan',
      titre: "Aujourd’hui, après vos accompagnements, qu'est-ce qui a changé dans votre utilisation du numérique ?",
      type: 'choix-multiple',
    },
    {
      code: 'q19',
      options: [
        { code: 'oui', libelle: 'Oui' },
        { code: 'non', libelle: 'Non' },
        { code: 'ne-sait-pas', libelle: 'Je ne sais pas' },
      ],
      optionsPourquoi: ['non'],
      partie: 'bilan',
      titre: 'Diriez-vous que ces accompagnements ont facilité l’utilisation du numérique dans votre vie quotidienne ?',
      type: 'choix-unique',
    },
    // Partie 3 : à propos de vous
    {
      code: 'q20',
      options: [
        { code: 'femme', libelle: 'Une femme' },
        { code: 'homme', libelle: 'Un homme' },
        { code: 'autre', libelle: 'Autre' },
      ],
      partie: 'vous',
      titre: 'Vous êtes :',
      type: 'choix-unique',
    },
    {
      aide: 'Cochez la tranche d’âge qui vous correspond.',
      code: 'q21',
      options: [
        { code: 'moins-de-12', libelle: 'Moins de 12 ans' },
        { code: '12-17', libelle: '12 - 17 ans' },
        { code: '18-24', libelle: '18 - 24 ans' },
        { code: '25-39', libelle: '25 - 39 ans' },
        { code: '40-59', libelle: '40 - 59 ans' },
        { code: '60-69', libelle: '60 - 69 ans' },
        { code: '70-et-plus', libelle: '70 ans et plus' },
      ],
      partie: 'vous',
      titre: 'Quel âge avez-vous ?',
      type: 'choix-unique',
    },
    {
      code: 'q22',
      optionAutre: 'autre',
      options: [
        { code: 'seul', libelle: 'Seul(e)' },
        { code: 'seul-avec-enfants', libelle: 'Seul(e) avec un ou des enfants' },
        { code: 'couple-sans-enfant', libelle: 'En couple (marié, pacsé, union libre etc.) sans enfant' },
        { code: 'couple-avec-enfants', libelle: 'En couple (marié, pacsé, union libre etc.) avec enfant(s)' },
        { code: 'colocation', libelle: 'En colocation' },
        AUTRE,
      ],
      partie: 'vous',
      titre: 'Vous vivez :',
      type: 'choix-unique',
    },
    {
      code: 'q23',
      options: [
        { code: 'emploi', libelle: 'En emploi' },
        { code: 'recherche-emploi', libelle: "En recherche d'emploi" },
        { code: 'formation', libelle: 'En formation / étudiant(e) / scolarisé(e)' },
        { code: 'parent-au-foyer', libelle: 'Parent au foyer' },
        { code: 'retraite', libelle: 'Retraité(e)' },
        {
          code: 'non-emploi',
          libelle: 'Situation de non-emploi pour des raisons de santé ou autre raison personnelle',
        },
      ],
      partie: 'vous',
      titre: 'Quelle est votre situation ?',
      type: 'choix-unique',
    },
    {
      aide: MIEUX,
      code: 'q24',
      options: [
        { code: 'aucun', libelle: 'Pas de diplôme' },
        { code: 'certificat-etudes', libelle: 'Certificat d’études primaires' },
        { code: 'brevet', libelle: 'BEPC, Brevet des collèges' },
        { code: 'bac', libelle: 'Bac généraliste, technologique ou professionnel' },
        { code: 'bac-2', libelle: 'Bac +2 (études supérieures type IUT, Deug, BTS, DUT)' },
        { code: 'bac-3', libelle: 'Bac + 3 (niveau licence)' },
        { code: 'bac-5', libelle: 'Bac + 5 (niveau master) ou plus' },
      ],
      partie: 'vous',
      titre: 'Avez-vous un diplôme ?',
      type: 'choix-unique',
    },
    {
      aide: MIEUX,
      code: 'q25',
      options: [
        { code: 'agriculteurs', libelle: 'Agriculteurs' },
        { code: 'artisans-commercants', libelle: 'Artisans, commerçants, chefs d’entreprise' },
        { code: 'cadres', libelle: 'Cadres et professions intellectuelles' },
        { code: 'professions-liberales', libelle: 'Professions libérales' },
        { code: 'employes-public', libelle: 'Employés du secteur public' },
        { code: 'employes-prive', libelle: 'Employés du secteur privé' },
        { code: 'ouvriers', libelle: 'Ouvriers' },
        { code: 'sans-activite', libelle: 'Sans activité professionnelle' },
      ],
      partie: 'vous',
      titre: 'Quelle est votre catégorie professionnelle ?',
      type: 'choix-unique',
    },
    {
      aide: '5 chiffres, par exemple 31670',
      code: 'q26',
      partie: 'vous',
      titre: 'Quel est votre code postal ?',
      type: 'code-postal',
    },
  ],
  version: 'socle-v22',
}

import { ReactElement } from 'react'

import ExternalLink from '../shared/ExternalLink/ExternalLink'

export default function Accessibilite(): ReactElement {
  return (
    <>
      <h1>
        Déclaration d’accessibilité
      </h1>
      <h2>
        À propos
      </h2>
      <p>
        Le handicap est défini comme : toute limitation d’activité ou restriction de participation à la vie
        en société subie dans son environnement par une personne en raison d’une altération substantielle,
        durable ou définitive d’une ou plusieurs fonctions physiques, sensorielles, mentales, cognitives ou psychiques,
        d’un polyhandicap ou d’un trouble de santé invalidant
        (article L. 114 du code de l’action sociale et des familles).
        <br />
        L’accessibilité numérique consiste à rendre les services de communication au public
        en ligne accessibles aux personnes handicapées, c’est-à-dire :
      </p>
      <ul>
        <li>
          perceptibles : par exemple, faciliter la perception visuelle et auditive du contenu par l’utilisateur ;
          proposer des équivalents textuels à tout contenu non textuel ; créer un contenu qui puisse être présenté de
          différentes manières sans perte d’information ni de structure (par exemple avec une mise en page simplifiée) ;
        </li>
        <li>
          utilisables : par exemple, fournir à l’utilisateur des éléments d’orientation pour naviguer,
          trouver le contenu ; rendre toutes les fonctionnalités accessibles au clavier ; laisser à l’utilisateur
          suffisamment de temps pour lire et utiliser le contenu ; ne pas concevoir de contenu susceptible de provoquer
          des crises d’épilepsie ;
        </li>
        <li>
          compréhensibles : par exemple, faire en sorte que les pages fonctionnent de manière prévisible ;
          aider l’utilisateur à corriger les erreurs de saisie ;
        </li>
        <li>
          et robustes : par exemple, optimiser la compatibilité avec les utilisations actuelles et futures,
          y compris avec les technologies d’assistance.
        </li>
      </ul>
      <h2>
        Nos engagements
      </h2>
      <p>
        L’équipe de Conseiller Numérique s’engage et travaille à améliorer le niveau d’accessibilité du site
        et sa conformité avec les normes en la matière :
      </p>
      <ul>
        <li>
          Audit de mise en conformité (en cours) pour nous aider à améliorer l’accessibilité ;
        </li>
        <li>
          Mise à jour de cette page pour vous tenir informés de notre progression.
        </li>
      </ul>
      <p>
        Notre équipe a ainsi travaillé sur les contrastes de couleur, la présentation et la structure
        de l’information ou encore la clarté des formulaires.
        <br />
        D’autres améliorations vont être apportées.
      </p>
      <h2>
        Améliorations et contact
      </h2>
      <p>
        L’équipe de Conseiller Numérique reste à votre écoute et entière disposition, si vous souhaitez
        nous signaler un défaut de conception. Vous pouvez nous aider à améliorer l’accessibilité du site
        en nous signalant les problèmes éventuels que vous rencontrez :
        {' '}
        <ExternalLink
          href="https://aide.conseiller-numerique.gouv.fr/fr/"
          title="Contactez-nous"
        >
          Contactez-nous
        </ExternalLink>
        {''}
        .
      </p>
    </>
  )
}

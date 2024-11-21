import { ReactElement } from 'react'

import SectionVide from '../SectionVide'
import ExternalLink from '@/components/shared/ExternalLink/ExternalLink'

export default function MembreVide(): ReactElement {
  return (
    <SectionVide
      buttonLabel="Ajouter un membre"
      id="membre"
      title="0 membre"
    >
      <p className="fr-h6">
        Actuellement, il n’y a aucun membre dans la gouvernance
      </p>
      <p>
        Vous pouvez inviter les collectivités et structures qui n’ont pas encore manifesté leur souhait
        de participer et/ou de porter une feuille de route territoriale en leur partageant
        ce lien vers les formulaires prévus à cet effet :
        <br />
        <ExternalLink
          href="https://inclusion-numerique.anct.gouv.fr/gouvernance"
          title="Formulaire d’invitation à la gouvernance"
        >
          https://inclusion-numerique.anct.gouv.fr/gouvernance
        </ExternalLink>
      </p>
    </SectionVide>
  )
}

import Image from 'next/image'
import { ReactElement } from 'react'

import ExternalLink from '../shared/ExternalLink/ExternalLink'

export default function Sources(): ReactElement {
  return (
    <section aria-labelledby="sources" className="background-blue-france fr-mb-4w fr-py-4w fr-px-16w">
      <h2 className="fr-grid-row fr-grid-row--center fr-h4 color-blue-france fr-mb-2w" id="sources">
        Sources et données utilisées
      </h2>
      <div className="fr-grid-row fr-grid-row--center fr-mb-2w">
        <Image alt="" className="fr-mr-2w" height={50} src={`${process.env.NEXT_PUBLIC_HOST}/coop.svg`} width={50} />
        <Image
          alt=""
          className="fr-mr-2w"
          height={50}
          src={`${process.env.NEXT_PUBLIC_HOST}/carto-nationale.svg`}
          width={50}
        />
        <Image
          alt=""
          className="fr-mr-2w"
          height={50}
          src={`${process.env.NEXT_PUBLIC_HOST}/aidants-connect.svg`}
          width={50}
        />
        <Image alt="" className="fr-mr-2w" height={50} src={`${process.env.NEXT_PUBLIC_HOST}/conum.svg`} width={50} />
        <Image alt="" className="fr-mr-2w" height={50} src={`${process.env.NEXT_PUBLIC_HOST}/mednum.svg`} width={50} />
        <Image
          alt=""
          className="fr-mr-2w"
          height={50}
          src={`${process.env.NEXT_PUBLIC_HOST}/data-inclusion.svg`}
          width={50}
        />
      </div>
      <p className="fr-grid-row fr-mb-2w">
        Gravida malesuada tellus cras eu risus euismod pellentesque viverra. Enim facilisi vitae sem mauris quis massa
        vulputate nunc. Blandit sed aenean ullamcorper diam. In donec et in duis magna.
      </p>
      <div className="fr-grid-row fr-grid-row--center">
        <ExternalLink
          className="color-blue-france"
          href="https://inclusion-numerique.anct.gouv.fr/en-savoir-plus-sur-les-donnees"
          title="Sources et données utilisées"
        >
          En savoir plus
        </ExternalLink>
      </div>
    </section>
  )
}

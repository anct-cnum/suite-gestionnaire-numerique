import Link from 'next/link'
import { ReactElement } from 'react'

export default function RejoindreGouvernance(): ReactElement {
  return (
    <section className="fr-mb-4w border-radius">
      <div className="fr-grid-row fr-grid-row--middle">
        <div className="fr-col-12 fr-col-md-6">
          <img
            alt=""
            height={420}
            src={`${process.env.NEXT_PUBLIC_HOST}/illustration-gouvernance.svg`}
            style={{ height: 'auto', maxWidth: '100%' }}
            width={588}
          />
        </div>
        <div className="fr-col-12 fr-col-md-6 fr-p-5w">
          <h2 className="fr-h3 color-blue-france">
            Devenez membre d&apos;une gouvernance territoriale
          </h2>
          <p>
            <strong>
              En tant qu&apos;acteur public ou privé de l&apos;inclusion numérique
            </strong>
            {' '}
            , vous êtes invités à rejoindre la dynamique de votre territoire en rejoignant
            la gouvernance de votre département. Vous pourrez ainsi porter ou contribuer
            à des actions pensées et mises en oeuvre de façon collégiale.
          </p>
          <Link
            className="fr-btn"
            href="/gouvernances"
          >
            Accéder au formulaire
          </Link>
        </div>
      </div>
    </section>
  )
}

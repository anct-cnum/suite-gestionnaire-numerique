import { ReactElement } from 'react'

import { LieuAccueilPublicData } from '@/components/LieuInclusionDetails/LieuInclusionDetails'

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function LieuInclusionDetailsAccueilInformationsPratique(props: Props): ReactElement {
  const horairesList = [
    { heures: '09h30 - 13h00 / 13h30 - 17h00', jour: 'Lun.' },
    { heures: '09h30 - 13h00 / 13h30 - 17h00', jour: 'Mar.' },
    { heures: '09h30 - 13h00 / Fermé', jour: 'Mer.' },
    { heures: '09h30 - 13h00 / 13h30 - 17h00', jour: 'Jeu.' },
    { heures: 'Fermé / 09h30 - 13h00', jour: 'Ven.' },
  ]

  return (
    <div className="fr-p-4w">
      <div className="fr-grid-row fr-grid-row--middle fr-mb-2w ">
        <div className="fr-col">
          <h3 className="fr-h6 fr-mb-0">
            Informations pratiques
          </h3>
          <p className="fr-text--sm fr-mb-0 fr-text-mention--grey">
            Horaires, accès et site internet du lieu
          </p>
        </div>
        <div className="fr-col-auto" />
      </div>

      <div className="fr-mb-2w">
        <p className="fr-text--sm fr-mb-1v fr-text-mention--grey">
          Site internet du lieu
        </p>
        <a
          className="fr-link"
          href="https://"
          rel="noopener noreferrer"
          target="_blank"
        >
          nombase.fr
        </a>
      </div>

      <div className="fr-mb-2w">
        <p className="fr-text--sm fr-mb-1v fr-icon-car-line fr-text--icon-left">
          Lieu itinérant
        </p>
      </div>

      <div className="fr-mb-2w">
        <p className="fr-text--sm fr-mb-1v fr-text-mention--grey">
          Accessibilité
        </p>
        <a
          className="fr-link"
          href="https://"
          rel="noopener noreferrer"
          target="_blank"
        >
          Retrouvez les informations d&apos;accessibilité via ce lien
        </a>
      </div>

      <div className="fr-mb-2w">
        <p className="fr-text--sm fr-mb-1v fr-text-mention--grey">
          Prise de rendez-vous en ligne
        </p>
        <a
          className="fr-link"
          href="https://"
          rel="noopener noreferrer"
          target="_blank"
        >
          Prendre rendez-vous en ligne via ce lien
        </a>
      </div>

      <div>
        <p className="fr-text--sm fr-mb-2w fr-text-mention--grey">
          Horaires d&apos;ouverture du lieu
        </p>
        <div className="fr-table fr-table--no-caption">
          <table>
            <tbody>
              {horairesList.map((horaire) => (
                <tr key={horaire.heures+horaire.jour}>
                  <td className="fr-text--sm fr-text--bold">
                    {horaire.jour}
                  </td>
                  <td className="fr-text--sm">
                    {horaire.heures}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="fr-text--xs fr-text-mention--grey fr-mt-1w">
          Sauf les jours fériés et les period de fermeture exceptionnelle
        </p>
      </div>
    </div>
  )
}

type Props = Readonly<{
  data: LieuAccueilPublicData
}>

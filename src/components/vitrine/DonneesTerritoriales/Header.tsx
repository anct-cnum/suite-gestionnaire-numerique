'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import { ReactElement } from 'react'

import departements from '../../../../ressources/departements.json'
import regions from '../../../../ressources/regions.json'
import FilAriane from '../FilAriane/FilAriane'
import SelecteurZoneGeographique from '../SelecteurZoneGeographique/SelecteurZoneGeographique'
import { regionsEtDepartements, ZoneGeographique } from '@/presenters/filtresUtilisateurPresenter'

export default function Header({ titre }: Props): ReactElement {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()

  const pathParts = pathname.split('/').filter(Boolean)
  const currentSection = pathParts[2] || 'synthese-et-indicateurs'

  // Extraire niveau et code depuis params
  const niveau = currentSection === 'gouvernances'
    ? pathParts[3] // 'departement' pour gouvernances
    : (params.niveau as string | undefined)

  const codeArray = params.code as ReadonlyArray<string> | undefined
  const code = codeArray?.[0]

  const territoireActuel = getTerritoireLabel(niveau, code)
  const selectedZone = getSelectedZone(niveau, code)

  function handleTerritoireChange(zone: ZoneGeographique): void {
    // Si la valeur est "all", naviguer vers /national
    if (zone.value === 'all') {
      // Gouvernances et Feuille de route n'existent qu'au niveau département
      // Rediriger vers synthèse au niveau national
      if (currentSection === 'gouvernances' || currentSection === 'feuille-de-route') {
        router.push('/vitrine/donnees-territoriales/synthese-et-indicateurs/national')
      } else {
        router.push(`/vitrine/donnees-territoriales/${currentSection}/national`)
      }
      return
    }

    if (zone.value.includes('_')) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars,sonarjs/no-unused-vars
      const [_, codeDepartement] = zone.value.split('_')

      if (zone.type === 'departement' && codeDepartement !== '00') {
        router.push(`/vitrine/donnees-territoriales/${currentSection}/departement/${codeDepartement}`)
      }
    }
  }

  const breadcrumbItems = getBreadcrumbItems(niveau, code, currentSection)

  return (
    <div
      style={{
        backgroundColor: '#f5f5fe',
        borderTop: '1px solid #dddddd',
        paddingBottom: '40px',
        paddingLeft: '112px',
        paddingRight: '120px',
        paddingTop: '16px',
      }}
    >
      <FilAriane items={breadcrumbItems} />

      <div
        className="fr-grid-row fr-grid-row--gutters"
        style={{ marginTop: '40px' }}
      >
        <div className="fr-col-12 fr-col-md-8">
          <h1
            className="fr-mb-0"
            style={{
              color: '#000091',
              fontSize: '40px',
              fontWeight: 700,
              lineHeight: '48px',
            }}
          >
            {titre}
            <br />
            {territoireActuel}
          </h1>
        </div>
        <div className="fr-col-12 fr-col-md-4">
          <SelecteurZoneGeographique
            defaultValue={selectedZone}
            onChange={handleTerritoireChange}
          />
        </div>
      </div>
    </div>
  )
}

function getTerritoireLabel(niveau?: string, code?: string): string {
  if (niveau === undefined || niveau === '' || code === undefined) {
    return 'France'
  }

  if (niveau === 'region') {
    const region = regions
      .find((region) => region.code === code)
    return region ? region.nom : `Région ${code}`
  }

  if (niveau === 'departement') {
    const departement = departements
      .find((departement) => departement.code === code)
    return departement ? `${departement.nom} · ${code}` : `Département ${code}`
  }

  return 'France'
}

function getSelectedZone(niveau?: string, code?: string): undefined | ZoneGeographique {
  // Si on est sur la page nationale, retourner "Toutes les régions"
  if (niveau === 'national' || niveau === undefined || niveau === '' || code === undefined) {
    return regionsEtDepartements().find((zone) => zone.value === 'all')
  }

  const departement = departements
    .find((departement) => departement.code === code)

  if (niveau === 'departement' && departement !== undefined) {
    const region = regions.find((regrion) => regrion.code === departement.regionCode)
    if (region !== undefined) {
      const regionDepartementValue = `${region.code}_${code}`
      return regionsEtDepartements().find((zone) => zone.value === regionDepartementValue)
    }
  }

  if (niveau === 'region') {
    const regionDepartementValue = `${code}_00`
    return regionsEtDepartements().find((zone) => zone.value === regionDepartementValue)
  }

  return undefined
}

function getBreadcrumbItems(
  niveau?: string,
  code?: string,
  currentSection?: string
): Array<{ href?: string; label: string }> {
  const section = currentSection ?? 'synthese-et-indicateurs'

  const items: Array<{ href?: string; label: string }> = [
    { href: '/vitrine', label: 'Accueil' },
    { href: '/vitrine/donnees-territoriales', label: 'Données territoriales' },
    { href: `/vitrine/donnees-territoriales/${section}/national`, label: 'France' },
  ]

  if (niveau === undefined || niveau === '' || code === undefined) {
    return items
  }

  if (niveau === 'region') {
    const region = regions.find((region) => region.code === code)
    if (region !== undefined) {
      // Pas de lien cliquable pour les régions pour le moment
      items.push({ label: region.nom })
    }
  }

  if (niveau === 'departement') {
    const departementCourant = departements.find((departement) => departement.code === code)
    if (departementCourant !== undefined) {
      const regionCourante = regions.find((region) => region.code === departementCourant.regionCode)
      if (regionCourante !== undefined) {
        items.push({ label: regionCourante.nom })
      }
      items.push({ href: `/vitrine/donnees-territoriales/${section}/departement/${code}`, label: `${departementCourant.nom} · ${code}` })
    }
  }

  return items
}

type Props = Readonly<{
  titre: string
}>

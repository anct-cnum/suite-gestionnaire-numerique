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
  const niveau = params.niveau as string | undefined
  const code = params.code as ReadonlyArray<string> | undefined

  const territoireActuel = getTerritoireLabel(niveau, code)
  const selectedZone = getSelectedZone(niveau, code)

  const currentSection = pathname.split('/').filter(Boolean)[2] || 'synthese-et-indicateurs'

  function handleTerritoireChange(zone: ZoneGeographique): void {
    const basePath = `/vitrine/donnees-territoriales/${currentSection}`

    // Si la valeur est "all", naviguer vers /national
    if (zone.value === 'all') {
      router.push(`${basePath}/national`)
      return
    }

    if (zone.value.includes('_')) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars,sonarjs/no-unused-vars
      const [_, codeDepartement] = zone.value.split('_')

      if (zone.type === 'departement' && codeDepartement !== '00') {
        router.push(`${basePath}/departement/${codeDepartement}`)
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

function getTerritoireLabel(niveau?: string, code?: ReadonlyArray<string>): string {
  if (niveau === undefined || niveau === '' || code === undefined || code.length === 0) {
    return 'France'
  }

  const codeValue = code[0]

  if (niveau === 'region') {
    const region = regions
      .find((region) => region.code === codeValue)
    return region ? region.nom : `Région ${codeValue}`
  }

  if (niveau === 'departement') {
    const departement = departements
      .find((departement) => departement.code === codeValue)
    return departement ? `${departement.nom} · ${codeValue}` : `Département ${codeValue}`
  }

  return 'France'
}

function getSelectedZone(niveau?: string, code?: ReadonlyArray<string>): undefined | ZoneGeographique {
  // Si on est sur la page nationale, retourner "Toutes les régions"
  if (niveau === 'national' || niveau === undefined || niveau === '' || code === undefined || code.length === 0) {
    return regionsEtDepartements().find((zone) => zone.value === 'all')
  }

  const codeValue = code[0]
  const departement = departements
    .find((departement) => departement.code === codeValue)

  if (niveau === 'departement' && departement !== undefined) {
    const region = regions.find((regrion) => regrion.code === departement.regionCode)
    if (region !== undefined) {
      const regionDepartementValue = `${region.code}_${codeValue}`
      return regionsEtDepartements().find((zone) => zone.value === regionDepartementValue)
    }
  }

  if (niveau === 'region') {
    const regionDepartementValue = `${codeValue}_00`
    return regionsEtDepartements().find((zone) => zone.value === regionDepartementValue)
  }

  return undefined
}

function getBreadcrumbItems(
  niveau?: string,
  code?: ReadonlyArray<string>,
  currentSection?: string
): Array<{ href?: string; label: string }> {
  const section = currentSection ?? 'synthese-et-indicateurs'

  const items: Array<{ href?: string; label: string }> = [
    { href: '/vitrine', label: 'Accueil' },
    { href: '/vitrine/donnees-territoriales', label: 'Données territoriales' },
    { href: `/vitrine/donnees-territoriales/${section}/national`, label: 'France' },
  ]

  if (niveau === undefined || niveau === '' || code === undefined || code.length === 0) {
    return items
  }

  const codeValue = code[0]

  if (niveau === 'region') {
    const region = regions.find((region) => region.code === codeValue)
    if (region !== undefined) {
      // Pas de lien cliquable pour les régions pour le moment
      items.push({ label: region.nom })
    }
  }

  if (niveau === 'departement') {
    const departementCourant = departements.find((departement) => departement.code === codeValue)
    if (departementCourant !== undefined) {
      const regionCourante = regions.find((region) => region.code === departementCourant.regionCode)
      if (regionCourante !== undefined) {
        items.push({ label: regionCourante.nom })
      }
      items.push({ href: `/vitrine/donnees-territoriales/${section}/departement/${codeValue}`, label: `${departementCourant.nom} · ${codeValue}` })
    }
  }

  return items
}

type Props = Readonly<{
  titre: string
}>

import { ReactElement } from 'react'

import BlocAccueil from './blocs/BlocAccueil'
import BlocBeneficiaires from './blocs/BlocBeneficiaires'
import BlocCartographie from './blocs/BlocCartographie'
import BlocDonneesStructure from './blocs/BlocDonneesStructure'
import BlocEtatDesLieux from './blocs/BlocEtatDesLieux'
import BlocFinancements from './blocs/BlocFinancements'
import BlocGouvernance from './blocs/BlocGouvernance'
import BlocLabelConum from './blocs/BlocLabelConum'
import BlocMediateurs from './blocs/BlocMediateurs'
import BlocRejoindreGouvernance from './blocs/BlocRejoindreGouvernance'
import BlocVigilanceLieux from './blocs/BlocVigilanceLieux'
import { IdentifiantBloc } from './registreBlocs'
import { PerimetreRechercheTerritoires } from '@/use-cases/queries/RechercherTerritoires'
import { Contexte } from '@/use-cases/queries/ResoudreContexte'
import { TerritoireTableauDeBord } from '@/use-cases/queries/shared/TerritoireTableauDeBord'

export function construireBlocs({
  contexte,
  perimetre,
  prenom,
  territoire,
}: Params): Record<IdentifiantBloc, ReactElement> {
  return {
    accueil: (
      <BlocAccueil contexte={contexte} key="accueil" perimetre={perimetre} prenom={prenom} territoire={territoire} />
    ),
    beneficiaires: <BlocBeneficiaires key="beneficiaires" territoire={territoire} />,
    cartographie: <BlocCartographie key="cartographie" />,
    donneesStructure: (
      <BlocDonneesStructure key="donneesStructure" structureId={contexte.idStructure()} territoire={territoire} />
    ),
    etatDesLieux: <BlocEtatDesLieux key="etatDesLieux" territoire={territoire} />,
    financements: <BlocFinancements key="financements" territoire={territoire} />,
    gouvernance: <BlocGouvernance key="gouvernance" territoire={territoire} />,
    labelConum: <BlocLabelConum key="labelConum" structureId={contexte.idStructure()} />,
    mediateurs: territoire.type === 'structure' ? <></> : <BlocMediateurs key="mediateurs" territoire={territoire} />,
    rejoindreGouvernance: <BlocRejoindreGouvernance key="rejoindreGouvernance" />,
    vigilanceLieux: <BlocVigilanceLieux key="vigilanceLieux" territoire={territoire} />,
  }
}

type Params = Readonly<{
  contexte: Contexte
  perimetre: null | PerimetreRechercheTerritoires
  prenom: string
  territoire: TerritoireTableauDeBord
}>

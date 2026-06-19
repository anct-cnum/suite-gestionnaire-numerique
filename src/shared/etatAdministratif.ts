// Libellé d'état administratif tel que stocké dans main.structure_administrative (convention dataspace,
// combinant l'état de l'unité légale et celui de l'établissement). L'API INSEE ne renvoyant que des
// établissements actifs (unité légale ET établissement actifs, cf. ApiSireneLoader.validerEtablissement),
// une structure canonique synchronisée depuis l'INSEE porte toujours cette valeur.
export const ETAT_ADMINISTRATIF_CANONIQUE = 'Entreprise active / Etablissement actif'

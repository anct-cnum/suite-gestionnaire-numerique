import { Role, TypologieRole } from '@/core/domain/role'

export const bouchonProfilUtilisateur: Readonly<Record<TypologieRole, Role>> = {
  'Administrateur dispositif': new Role('Administrateur dispositif', 'Dispositif lambda'),
  'Gestionnaire département': new Role('Gestionnaire département', 'Haute Marne'),
  'Gestionnaire groupement': new Role('Gestionnaire groupement', 'La Poste'),
  'Gestionnaire région': new Role('Gestionnaire région', 'Poitou-Charentes'),
  'Gestionnaire structure': new Role('Gestionnaire structure', 'Métropole de Lyon'),
  Instructeur: new Role('Instructeur'),
  'Pilote politique publique': new Role('Pilote politique publique'),
  'Support animation': new Role('Support animation'),
}

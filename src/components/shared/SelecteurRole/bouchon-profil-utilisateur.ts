import { Role, TypologieRole } from '@/domain/Role'
import { Utilisateur } from '@/domain/Utilisateur'

export const bouchonProfilUtilisateur: Readonly<Record<TypologieRole, Utilisateur>> = {
  'Administrateur dispositif': new Utilisateur(
    new Role({
      territoireOuStructure: 'Dispositif lambda',
      typologie: 'Administrateur dispositif',
    }),
    'Kimkonsërn',
    'Hans',
    'hans.kimkonsern@anct.example.net'
  ),
  'Gestionnaire département': new Utilisateur(
    new Role({
      territoireOuStructure: 'Rhône',
      typologie: 'Gestionnaire département',
    }),
    'Céhef',
    'Esen',
    'esen.cehef@rhone.example.net'
  ),
  'Gestionnaire groupement': new Utilisateur(
    new Role({
      territoireOuStructure: 'Hubikoop',
      typologie: 'Gestionnaire groupement',
    }),
    'Halam Erriquén',
    'Omar',
    'omar@hubikoop.example.net'
  ),
  'Gestionnaire région': new Utilisateur(
    new Role({
      territoireOuStructure: 'Auvergne-Rhône-Alpes',
      typologie: 'Gestionnaire région',
    }),
    'Hulacord',
    'Jeanne',
    'jeanne.hulacord@rhone.example.net'
  ),
  'Gestionnaire structure': new Utilisateur(
    new Role({
      territoireOuStructure: 'Solidarnum',
      typologie: 'Gestionnaire structure',
    }),
    'Térieur',
    'Alexandre',
    'alexterieur@solidarnum.example.net'
  ),
  Instructeur: new Utilisateur(
    new Role({
      typologie: 'Instructeur',
    }),
    'Aumalie',
    'Anne',
    'anne.aumalie@caissedesdepots.example.net'
  ),
  'Pilote politique publique': new Utilisateur(
    new Role({
      typologie: 'Pilote politique publique',
    }),
    'Hauvert',
    'Elvire',
    'elvire.hauvert@anct.example.net'
  ),
  'Support animation': new Utilisateur(
    new Role({
      typologie: 'Support animation',
    }),
    'Namaspamous',
    'Pierre',
    'pierre.namaspamous@lamednum.example.net'
  ),
}

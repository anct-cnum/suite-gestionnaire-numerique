#!/usr/bin/env tsx

/**
 * Script pour mettre à jour les statuts de subventions à partir d'un fichier CSV.
 * 
 * Usage:
 *   tsx scripts/update-subvention-status.ts <fichier_csv>
 * 
 * Format du fichier CSV attendu:
 *   demande_subvention_id;statut;action_id;nom_action;feuille_route_id;nom_feuille_route;code_departement;montant_subvention;
 */

import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'

// Types pour les données CSV
interface CsvRow {
  action_id: string
  code_departement: string
  demande_subvention_id: string
  feuille_route_id: string
  montant_subvention: string
  nom_action: string
  nom_feuille_route: string
  statut: string
}

// Mapping des statuts du CSV vers les statuts de la base de données
const STATUT_MAPPING = {
  acceptee: 'acceptee',
  deposee: 'deposee', 
  enCours: 'enCours',
  nonSubventionnee: 'nonSubventionnee',
  refusee: 'refusee',
} as const

type StatutSubvention = typeof STATUT_MAPPING[keyof typeof STATUT_MAPPING]

const colors = {
  blue: '\x1b[34m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  yellow: '\x1b[33m',
}

function log(message: string, color: keyof typeof colors = 'reset') : void {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function validerStatut(statut: string): StatutSubvention {
  const statutLower = statut.toLowerCase()
  if (statutLower in STATUT_MAPPING) {
    return STATUT_MAPPING[statutLower as keyof typeof STATUT_MAPPING]
  }
  throw new Error(`Statut invalide: ${statut}. Statuts autorisés: ${Object.keys(STATUT_MAPPING).join(', ')}`)
}

function parserCsv(contenu: string): Array<CsvRow> {
  const lignes = contenu.split('\n').filter(ligne => ligne.trim() !== '')
  
  if (lignes.length < 2) {
    throw new Error('Le fichier CSV doit contenir au moins une ligne d\'en-tête et une ligne de données')
  }
  
  // Ignorer la ligne d'en-tête
  const lignesDonnees = lignes.slice(1)
  
  return lignesDonnees.map((ligne, index) => {
    // Supprimer le point-virgule final s'il existe
    const ligneNettoyee = ligne.replace(/;$/, '')
    const champs = ligneNettoyee.split(';')
    
    if (champs.length < 8) {
      throw new Error(`Ligne ${index + 2}: nombre de champs insuffisant (${champs.length}/8)`)
    }
    
    return {
      action_id: champs[2]?.trim() || '',
      code_departement: champs[6]?.trim() || '',
      demande_subvention_id: champs[0]?.trim() || '',
      feuille_route_id: champs[4]?.trim() || '',
      montant_subvention: champs[7]?.trim() || '',
      nom_action: champs[3]?.trim() || '',
      nom_feuille_route: champs[5]?.trim() || '',
      statut: champs[1]?.trim() || '',
    }
  })
}

function lireFichierCsv(cheminFichier: string): Array<CsvRow> {
  try {
    const contenu = readFileSync(cheminFichier, 'utf-8')
    return parserCsv(contenu)
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      throw new Error(`Le fichier ${cheminFichier} n'existe pas.`)
    }
    throw new Error(`Erreur lors de la lecture du fichier: ${error}`)
  }
}

async function mettreAJourStatuts(donnees: Array<CsvRow>) {
  const prisma = new PrismaClient()
  
  try {
    await prisma.$connect()
    
    let misesAJourReussies = 0
    const erreurs: Array<string> = []
    
    for (const ligne of donnees) {
      try {
        const demandeId = parseInt(ligne.demande_subvention_id, 10)
        if (isNaN(demandeId)) {
          erreurs.push(`ID de demande invalide: ${ligne.demande_subvention_id}`)
          continue
        }
        
        const nouveauStatut = validerStatut(ligne.statut)
        
        // Vérifier si la demande de subvention existe
        const demandeExistante = await prisma.demandeDeSubventionRecord.findUnique({
          where: { id: demandeId },
        })
        
        if (!demandeExistante) {
          erreurs.push(`Demande de subvention ${demandeId} non trouvée`)
          continue
        }
        
        // Mettre à jour le statut
        await prisma.demandeDeSubventionRecord.update({
          data: { statut: nouveauStatut },
          where: { id: demandeId },
        })
        
        log(`✓ Demande ${demandeId} mise à jour: ${demandeExistante.statut} → ${nouveauStatut}`, 'green')
        misesAJourReussies++
      } catch (error) {
        if (error instanceof Error) {
          erreurs.push(`Ligne ${ligne.demande_subvention_id}: ${error.message}`)
        } else {
          erreurs.push(`Erreur lors de la mise à jour de la demande ${ligne.demande_subvention_id}: ${error}`)
        }
      }
    }
    
    log('\nRésumé:', 'blue')
    log(`- Mises à jour réussies: ${misesAJourReussies}`, 'green')
    log(`- Erreurs: ${erreurs.length}`, 'red')
    
    if (erreurs.length > 0) {
      log('\nErreurs détaillées:', 'red')
      for (const erreur of erreurs) {
        log(`  - ${erreur}`, 'red')
      }
    }
  } finally {
    await prisma.$disconnect()
  }
}

async function demanderConfirmation(): Promise<boolean> {
  return new Promise((resolve) => {
    process.stdout.write('Voulez-vous procéder à la mise à jour ? (oui/non): ')
    process.stdin.once('data', (data) => {
      const reponse = data.toString().trim().toLowerCase()
      resolve(['o', 'oui', 'y', 'yes'].includes(reponse))
    })
  })
}

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length !== 1) {
    log('Usage: tsx scripts/update-subvention-status.ts <fichier_csv>', 'red')
    log('Exemple: tsx scripts/update-subvention-status.ts subventions.csv', 'yellow')
    process.exit(1)
  }
  
  const fichierCsv = args[0]
  
  try {
    log(`Lecture du fichier ${fichierCsv}...`, 'blue')
    const donnees = lireFichierCsv(fichierCsv)
    
    if (donnees.length === 0) {
      log('Aucune donnée trouvée dans le fichier CSV.', 'yellow')
      process.exit(1)
    }
    
    log(`Trouvé ${donnees.length} lignes à traiter.`, 'green')
    log(`Statuts autorisés: ${Object.keys(STATUT_MAPPING).join(', ')}`, 'yellow')
    log('')
    
    const confirmation = await demanderConfirmation()
    if (!confirmation) {
      log('Opération annulée.', 'yellow')
      process.exit(0)
    }
    
    log('Mise à jour en cours...', 'blue')
    await mettreAJourStatuts(donnees)
    
    log('Terminé.', 'green')
  } catch (error) {
    log(`Erreur: ${error instanceof Error ? error.message : error}`, 'red')
    process.exit(1)
  }
}

process.on('SIGINT', () => {
  log('\nOpération interrompue par l\'utilisateur.', 'yellow')
  process.exit(0)
})

main().catch((error) => {
  log(`Erreur fatale: ${error}`, 'red')
  process.exit(1)
}) 
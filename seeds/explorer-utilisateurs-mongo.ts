/* eslint-disable no-console */
import { coNumClient } from './co-num/coNumClient'

async function explorer(): Promise<void> {
  const { client, db } = await coNumClient()

  try {
    // Récupérer quelques utilisateurs pour voir la structure
    const utilisateurs = await db.collection('users')
      .find({
        roles: { $in: ['grandReseau', 'hub', 'prefet', 'structure'] },
      })
      .limit(3)
      .toArray()

    console.log('=== Exemple de documents utilisateurs ===\n')
    console.log(JSON.stringify(utilisateurs, null, 2))

    // Récupérer tous les champs distincts disponibles
    console.log('\n=== Analyse d\'un utilisateur ===')
    if (utilisateurs.length > 0) {
      const premierUtilisateur = utilisateurs[0]
      console.log('Champs disponibles:')
      Object.keys(premierUtilisateur).forEach((key) => {
        const value = premierUtilisateur[key]
        const type = Array.isArray(value) ? 'array' : typeof value
        console.log(`  - ${key}: ${type}`)
      })
    }

    // Compter les utilisateurs par rôle
    console.log('\n=== Statistiques par rôle ===')
    const roles = ['grandReseau', 'hub', 'prefet', 'structure', 'admin', 'conseiller', 'coordinateur', 'candidat']
    for (const role of roles) {
      const count = await db.collection('users').countDocuments({ roles: role })
      console.log(`  ${role}: ${count}`)
    }

  } catch (error) {
    console.error((error as Error).message)
  } finally {
    await client.close()
  }
}

void explorer()

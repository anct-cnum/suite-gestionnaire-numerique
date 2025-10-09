/* eslint-disable no-console */
import { coNumClient } from './co-num/coNumClient'

async function analyser(): Promise<void> {
  const { client, db } = await coNumClient()

  try {
    // 1. Utilisateurs avec passwordCreated à false
    console.log('=== Analyse des mots de passe ===\n')

    const totalUtilisateurs = await db.collection('users').countDocuments({
      roles: { $in: ['grandReseau', 'hub', 'prefet', 'structure'] },
    })

    const sansMotDePasse = await db.collection('users').countDocuments({
      roles: { $in: ['grandReseau', 'hub', 'prefet', 'structure'] },
      $or: [
        { passwordCreated: false },
        { passwordCreated: { $exists: false } },
      ],
    })

    const avecMotDePasse = await db.collection('users').countDocuments({
      roles: { $in: ['grandReseau', 'hub', 'prefet', 'structure'] },
      passwordCreated: true,
    })

    console.log(`Total utilisateurs (rôles migrés): ${totalUtilisateurs}`)
    console.log(`Avec mot de passe créé: ${avecMotDePasse} (${Math.round((avecMotDePasse / totalUtilisateurs) * 100)}%)`)
    console.log(`Sans mot de passe: ${sansMotDePasse} (${Math.round((sansMotDePasse / totalUtilisateurs) * 100)}%)`)

    // 2. Distribution temporelle des lastLogin
    console.log('\n=== Distribution temporelle des connexions ===\n')

    const maintenant = new Date()
    const unJour = 24 * 60 * 60 * 1000
    const unMois = 30 * unJour
    const sixMois = 6 * unMois
    const unAn = 365 * unJour

    const tranches = [
      { label: 'Dernière semaine', min: new Date(maintenant.getTime() - 7 * unJour), max: maintenant },
      { label: 'Dernier mois', min: new Date(maintenant.getTime() - unMois), max: maintenant },
      { label: '1-3 mois', min: new Date(maintenant.getTime() - 3 * unMois), max: new Date(maintenant.getTime() - unMois) },
      { label: '3-6 mois', min: new Date(maintenant.getTime() - sixMois), max: new Date(maintenant.getTime() - 3 * unMois) },
      { label: '6-12 mois', min: new Date(maintenant.getTime() - unAn), max: new Date(maintenant.getTime() - sixMois) },
      { label: 'Plus de 1 an', min: new Date('2000-01-01'), max: new Date(maintenant.getTime() - unAn) },
    ]

    for (const tranche of tranches) {
      const count = await db.collection('users').countDocuments({
        roles: { $in: ['grandReseau', 'hub', 'prefet', 'structure'] },
        lastLogin: {
          $gte: tranche.min,
          $lt: tranche.max,
        },
      })
      console.log(`${tranche.label}: ${count} (${Math.round((count / totalUtilisateurs) * 100)}%)`)
    }

    // Jamais connectés
    const jamaisConnectes = await db.collection('users').countDocuments({
      roles: { $in: ['grandReseau', 'hub', 'prefet', 'structure'] },
      $or: [
        { lastLogin: { $exists: false } },
        { lastLogin: null },
      ],
    })
    console.log(`Jamais connectés: ${jamaisConnectes} (${Math.round((jamaisConnectes / totalUtilisateurs) * 100)}%)`)

    // 3. Croisement des données
    console.log('\n=== Croisement mot de passe / dernière connexion ===\n')

    const avecMdpEtConnexionRecente = await db.collection('users').countDocuments({
      roles: { $in: ['grandReseau', 'hub', 'prefet', 'structure'] },
      passwordCreated: true,
      lastLogin: { $gte: new Date(maintenant.getTime() - sixMois) },
    })

    const avecMdpSansConnexionRecente = await db.collection('users').countDocuments({
      roles: { $in: ['grandReseau', 'hub', 'prefet', 'structure'] },
      passwordCreated: true,
      $or: [
        { lastLogin: { $lt: new Date(maintenant.getTime() - sixMois) } },
        { lastLogin: { $exists: false } },
        { lastLogin: null },
      ],
    })

    console.log(`Avec MDP + connexion récente (<6 mois): ${avecMdpEtConnexionRecente}`)
    console.log(`Avec MDP mais pas de connexion récente (>6 mois ou jamais): ${avecMdpSansConnexionRecente}`)
    console.log(`Sans MDP: ${sansMotDePasse}`)

    // 4. Distribution par rôle
    console.log('\n=== Utilisateurs actifs (connexion <6 mois) par rôle ===\n')

    const roles = ['grandReseau', 'hub', 'prefet', 'structure']
    for (const role of roles) {
      const total = await db.collection('users').countDocuments({ roles: role })
      const actifs = await db.collection('users').countDocuments({
        roles: role,
        lastLogin: { $gte: new Date(maintenant.getTime() - sixMois) },
      })
      console.log(`${role}: ${actifs}/${total} actifs (${Math.round((actifs / total) * 100)}%)`)
    }

  } catch (error) {
    console.error((error as Error).message)
  } finally {
    await client.close()
  }
}

void analyser()

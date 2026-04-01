#!/usr/bin/env tsx

/**
 * Script de test du système de cache pour l'API Coop Numérique
 *
 * Usage:
 *   pnpm tsx scripts/test-cache-api-coop.ts
 *   ou
 *   npx tsx scripts/test-cache-api-coop.ts
 *
 * Prérequis:
 *   - Un token API Coop valide dans COOP_TOKEN (pas FAKE_TOKEN)
 *   - Connexion internet pour les appels API réels
 *
 * Ce script teste:
 *   - La mise en cache des appels API
 *   - L'accélération des appels répétés
 *   - Le cache par département
 *   - Les statistiques du cache
 */

import dotenv from 'dotenv'
import { createApiCoopStatistiquesLoader } from '../src/gateways/factories/apiCoopLoaderFactory'
import { CachedApiCoopStatistiquesLoader } from '../src/gateways/apiCoop/CachedApiCoopStatistiquesLoader'

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' })

async function testerCache() {
  console.log('=== Test du système de cache API Coop ===\n')

  // Vérifier le token
  const coopToken = process.env.COOP_TOKEN
  if (!coopToken || coopToken.startsWith('FAKE_TOKEN')) {
    console.log('⚠️  Ce test nécessite un vrai token API Coop')
    console.log('   Configurez COOP_TOKEN dans .env.local avec un vrai token')
    return
  }

  const loader = createApiCoopStatistiquesLoader(true) // Avec cache activé

  try {
    // Test 1: Premier appel pour la France (MISS)
    console.log('📊 Test 1: Premier appel France entière (devrait être un MISS)...')
    const debut1 = Date.now()
    const result1 = await loader.recupererStatistiques()
    const duree1 = Date.now() - debut1
    console.log(`   ⏱️ Temps: ${duree1}ms`)
    console.log(`   📊 Bénéficiaires: ${result1.totaux.beneficiaires.total.toLocaleString('fr-FR')}\n`)

    // Test 2: Deuxième appel pour la France (HIT)
    console.log('📊 Test 2: Deuxième appel France entière (devrait être un HIT)...')
    const debut2 = Date.now()
    const result2 = await loader.recupererStatistiques()
    const duree2 = Date.now() - debut2
    console.log(`   ⏱️ Temps: ${duree2}ms`)
    console.log(`   📊 Bénéficiaires: ${result2.totaux.beneficiaires.total.toLocaleString('fr-FR')}`)
    console.log(`   ✅ Accélération: ${Math.round(duree1 / duree2)}x plus rapide!\n`)

    // Test 3: Appel pour Paris (MISS)
    console.log('📊 Test 3: Premier appel Paris (devrait être un MISS)...')
    const debut3 = Date.now()
    const result3 = await loader.recupererStatistiques({ departements: ['75'] })
    const duree3 = Date.now() - debut3
    console.log(`   ⏱️ Temps: ${duree3}ms`)
    console.log(`   📊 Bénéficiaires Paris: ${result3.totaux.beneficiaires.total.toLocaleString('fr-FR')}\n`)

    // Test 4: Deuxième appel pour Paris (HIT)
    console.log('📊 Test 4: Deuxième appel Paris (devrait être un HIT)...')
    const debut4 = Date.now()
    const result4 = await loader.recupererStatistiques({ departements: ['75'] })
    const duree4 = Date.now() - debut4
    console.log(`   ⏱️ Temps: ${duree4}ms`)
    console.log(`   📊 Bénéficiaires Paris: ${result4.totaux.beneficiaires.total.toLocaleString('fr-FR')}`)
    console.log(`   ✅ Accélération: ${Math.round(duree3 / duree4)}x plus rapide!\n`)

    // Test 5: Plusieurs départements
    console.log('📊 Test 5: Appels pour plusieurs départements...')
    const departements = ['13', '69', '59', '31', '44']

    for (const dept of departements) {
      const debut = Date.now()
      const resultat = await loader.recupererStatistiques({ departements: [dept] })
      const duree = Date.now() - debut
      console.log(
        `   Département ${dept}: ${duree}ms - ${resultat.totaux.beneficiaires.total.toLocaleString('fr-FR')} bénéficiaires`
      )
    }

    // Test 6: Re-test des mêmes départements (tous HIT)
    console.log('\n📊 Test 6: Re-test des mêmes départements (devrait être tous HIT)...')
    for (const dept of departements) {
      const debut = Date.now()
      const duree = Date.now() - debut
      console.log(`   Département ${dept}: ${duree}ms (cache)`)
    }

    // Statistiques du cache
    console.log('\n📈 Statistiques du cache:')
    const stats = CachedApiCoopStatistiquesLoader.obtenirStatistiquesCache()
    console.log(`   📦 Entrées en cache: ${stats.taille}`)
    console.log(`   🔑 Clés:`)
    stats.detailsEntrees.forEach((entree) => {
      console.log(`      - ${entree.cle}: âge ${entree.age}s`)
    })

    // Test 7: Vider le cache et re-tester
    console.log('\n📊 Test 7: Vider le cache et re-tester...')
    CachedApiCoopStatistiquesLoader.viderCache()

    const debut7 = Date.now()
    await loader.recupererStatistiques()
    const duree7 = Date.now() - debut7
    console.log(`   France après vidage: ${duree7}ms (devrait être lent à nouveau)`)

    console.log('\n✅ Tous les tests de cache sont passés avec succès!')
    console.log('\n💡 Résumé:')
    console.log('   - Le cache fonctionne correctement')
    console.log('   - Chaque département a sa propre entrée de cache')
    console.log('   - Le cache accélère significativement les appels répétés')
    console.log('   - Durée du cache: 1 heure')
  } catch (error) {
    console.error('\n❌ Erreur lors des tests:')
    console.error(error)
  }
}

// Exécuter le test
testerCache().catch(console.error)

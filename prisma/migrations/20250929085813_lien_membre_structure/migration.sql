-- AlterTable
ALTER TABLE "min"."membre" ADD COLUMN     "structure_id" INTEGER;

-- AddForeignKey
ALTER TABLE "min"."membre" ADD CONSTRAINT "membre_structure_id_fkey" FOREIGN KEY ("structure_id") REFERENCES "min"."structure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Créer les structures manquantes pour les membres avec siret_ridet
INSERT INTO min.structure (
    identifiant_etablissement,
    nom,
    adresse,
    code_postal,
    commune,
    contact,
    departement_code,
    id_mongo,
    statut,
    type
)
SELECT DISTINCT
    m.siret_ridet,
    m.nom,
    'À renseigner',
    '00000',
    'À renseigner',
    '{}'::jsonb,
    COALESCE(m.gouvernance_departement_code, '00'),
    gen_random_uuid()::text,
    'active',
    'Association'
FROM min.membre m
WHERE m.siret_ridet IS NOT NULL
    AND NOT EXISTS (
        SELECT 1
        FROM min.structure s
        WHERE s.identifiant_etablissement = m.siret_ridet
    );

-- Lier les membres aux structures via leur siret_ridet
UPDATE min.membre m
SET structure_id = s.id
FROM min.structure s
WHERE m.siret_ridet IS NOT NULL
    AND s.identifiant_etablissement = m.siret_ridet;

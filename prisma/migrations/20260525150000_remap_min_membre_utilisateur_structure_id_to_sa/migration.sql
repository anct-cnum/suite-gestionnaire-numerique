-- Refonte 2026 : repointer les FK min.membre.structure_id et
-- min.utilisateur.structure_id vers main.structure_administrative (au lieu
-- de l'ancienne main.structure). Cote dataspace, les Flyway V085/V086
-- (database/migrations/V085_20260522__migrate_min_membre_structure_fk.sql
-- et V086) ont deja fait ce remap sur la base dev/prod, y compris le
-- mapping des valeurs structure_id via SIRET puis old_main_structure_id.
--
-- Cette migration Prisma sert uniquement a aligner l'historique de
-- migrations Prisma sur la realite de la base. Sur un environnement deja
-- migre par Flyway, les DROP + ADD ci-dessous sont un no-op net (la
-- contrainte est droppee puis recreee identique).
--
-- DropForeignKey
ALTER TABLE "min"."membre" DROP CONSTRAINT IF EXISTS "membre_structure_id_fkey";

-- DropForeignKey
ALTER TABLE "min"."utilisateur" DROP CONSTRAINT IF EXISTS "utilisateur_structure_id_fkey";

-- AddForeignKey
ALTER TABLE "min"."utilisateur" ADD CONSTRAINT "utilisateur_structure_id_fkey" FOREIGN KEY ("structure_id") REFERENCES "main"."structure_administrative"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "min"."membre" ADD CONSTRAINT "membre_structure_id_fkey" FOREIGN KEY ("structure_id") REFERENCES "main"."structure_administrative"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

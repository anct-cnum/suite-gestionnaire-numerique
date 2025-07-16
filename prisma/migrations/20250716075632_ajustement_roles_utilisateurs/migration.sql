/*
  Warnings:

  - The values [instructeur,pilote_politique_publique,support_animation] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "min"."Role_new" AS ENUM ('administrateur_dispositif', 'gestionnaire_departement', 'gestionnaire_groupement', 'gestionnaire_region', 'gestionnaire_structure');
ALTER TABLE "min"."utilisateur" ALTER COLUMN "role" TYPE "min"."Role_new" USING ("role"::text::"min"."Role_new");
ALTER TYPE "min"."Role" RENAME TO "Role_old";
ALTER TYPE "min"."Role_new" RENAME TO "Role";
DROP TYPE "min"."Role_old";
COMMIT;

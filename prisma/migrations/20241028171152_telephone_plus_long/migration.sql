-- AlterTable
ALTER TABLE "utilisateur" ALTER COLUMN "telephone" DROP DEFAULT,
ALTER COLUMN "telephone" SET DATA TYPE VARCHAR(13);

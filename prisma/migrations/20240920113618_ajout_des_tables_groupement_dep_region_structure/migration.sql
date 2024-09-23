-- custom
CREATE EXTENSION IF NOT EXISTS citext;

-- AlterTable
ALTER TABLE "utilisateur" ADD COLUMN     "departementCode" TEXT,
ADD COLUMN     "groupementId" INTEGER,
ADD COLUMN     "regionCode" TEXT,
ADD COLUMN     "structureId" INTEGER;
ALTER TABLE "utilisateur" ALTER COLUMN "nom" SET DATA TYPE CITEXT;

-- CreateTable
CREATE TABLE "groupement" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "groupement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departement" (
    "code" TEXT NOT NULL,
    "regionCode" TEXT NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "departement_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "region" (
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "region_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "structure" (
    "id" SERIAL NOT NULL,
    "idMongo" TEXT NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "structure_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "departement" ADD CONSTRAINT "departement_regionCode_fkey" FOREIGN KEY ("regionCode") REFERENCES "region"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilisateur" ADD CONSTRAINT "utilisateur_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilisateur" ADD CONSTRAINT "utilisateur_groupementId_fkey" FOREIGN KEY ("groupementId") REFERENCES "groupement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilisateur" ADD CONSTRAINT "utilisateur_departementCode_fkey" FOREIGN KEY ("departementCode") REFERENCES "departement"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilisateur" ADD CONSTRAINT "utilisateur_regionCode_fkey" FOREIGN KEY ("regionCode") REFERENCES "region"("code") ON DELETE SET NULL ON UPDATE CASCADE;

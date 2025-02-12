-- AlterTable
ALTER TABLE "membre" ADD COLUMN     "contact" TEXT,
ADD COLUMN     "contactTechnique" TEXT;

-- CreateTable
CREATE TABLE "contact_membre_gouvernance" (
    "email" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "fonction" TEXT NOT NULL,

    CONSTRAINT "contact_membre_gouvernance_pkey" PRIMARY KEY ("email")
);

-- AddForeignKey
ALTER TABLE "membre" ADD CONSTRAINT "membre_contact_fkey" FOREIGN KEY ("contact") REFERENCES "contact_membre_gouvernance"("email") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre" ADD CONSTRAINT "membre_contactTechnique_fkey" FOREIGN KEY ("contactTechnique") REFERENCES "contact_membre_gouvernance"("email") ON DELETE SET NULL ON UPDATE CASCADE;

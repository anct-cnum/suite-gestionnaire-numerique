-- CreateTable
CREATE TABLE "gouvernance" (
    "id" SERIAL NOT NULL,
    "idFNE" TEXT NOT NULL,
    "createurId" INTEGER NOT NULL,
    "departementCode" TEXT NOT NULL,
    "departementPorteurCode" TEXT,
    "sgarPorteurCode" TEXT,
    "epciPorteur" TEXT,
    "siretPorteur" TEXT,

    CONSTRAINT "gouvernance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note_de_contexte" (
    "id" SERIAL NOT NULL,
    "gouvernanceId" INTEGER NOT NULL,
    "editeurId" INTEGER NOT NULL,
    "contenu" TEXT NOT NULL,
    "derniereEdition" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "note_de_contexte_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gouvernance_idFNE_key" ON "gouvernance"("idFNE");

-- CreateIndex
CREATE UNIQUE INDEX "note_de_contexte_gouvernanceId_key" ON "note_de_contexte"("gouvernanceId");

-- AddForeignKey
ALTER TABLE "gouvernance" ADD CONSTRAINT "gouvernance_createurId_fkey" FOREIGN KEY ("createurId") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gouvernance" ADD CONSTRAINT "gouvernance_departementCode_fkey" FOREIGN KEY ("departementCode") REFERENCES "departement"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gouvernance" ADD CONSTRAINT "gouvernance_departementPorteurCode_fkey" FOREIGN KEY ("departementPorteurCode") REFERENCES "departement"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gouvernance" ADD CONSTRAINT "gouvernance_sgarPorteurCode_fkey" FOREIGN KEY ("sgarPorteurCode") REFERENCES "region"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_de_contexte" ADD CONSTRAINT "note_de_contexte_editeurId_fkey" FOREIGN KEY ("editeurId") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_de_contexte" ADD CONSTRAINT "note_de_contexte_gouvernanceId_fkey" FOREIGN KEY ("gouvernanceId") REFERENCES "gouvernance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

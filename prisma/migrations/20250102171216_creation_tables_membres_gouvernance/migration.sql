-- CreateTable
CREATE TABLE "membre_gouvernance_departement" (
    "id" SERIAL NOT NULL,
    "departementCode" TEXT NOT NULL,
    "gouvernanceId" INTEGER NOT NULL,
    "role" TEXT,

    CONSTRAINT "membre_gouvernance_departement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membre_gouvernance_sgar" (
    "id" SERIAL NOT NULL,
    "sgarCode" TEXT NOT NULL,
    "gouvernanceId" INTEGER NOT NULL,
    "role" TEXT,

    CONSTRAINT "membre_gouvernance_sgar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membre_gouvernance_epci" (
    "id" SERIAL NOT NULL,
    "epci" TEXT NOT NULL,
    "gouvernanceId" INTEGER NOT NULL,
    "role" TEXT,

    CONSTRAINT "membre_gouvernance_epci_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membre_gouvernance_commune" (
    "id" SERIAL NOT NULL,
    "commune" TEXT NOT NULL,
    "gouvernanceId" INTEGER NOT NULL,
    "role" TEXT,

    CONSTRAINT "membre_gouvernance_commune_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membre_gouvernance_structure" (
    "id" SERIAL NOT NULL,
    "structure" TEXT NOT NULL,
    "gouvernanceId" INTEGER NOT NULL,
    "role" TEXT,

    CONSTRAINT "membre_gouvernance_structure_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "membre_gouvernance_departement" ADD CONSTRAINT "membre_gouvernance_departement_departementCode_fkey" FOREIGN KEY ("departementCode") REFERENCES "departement"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre_gouvernance_departement" ADD CONSTRAINT "membre_gouvernance_departement_gouvernanceId_fkey" FOREIGN KEY ("gouvernanceId") REFERENCES "gouvernance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre_gouvernance_sgar" ADD CONSTRAINT "membre_gouvernance_sgar_sgarCode_fkey" FOREIGN KEY ("sgarCode") REFERENCES "region"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre_gouvernance_sgar" ADD CONSTRAINT "membre_gouvernance_sgar_gouvernanceId_fkey" FOREIGN KEY ("gouvernanceId") REFERENCES "gouvernance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre_gouvernance_epci" ADD CONSTRAINT "membre_gouvernance_epci_gouvernanceId_fkey" FOREIGN KEY ("gouvernanceId") REFERENCES "gouvernance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre_gouvernance_commune" ADD CONSTRAINT "membre_gouvernance_commune_gouvernanceId_fkey" FOREIGN KEY ("gouvernanceId") REFERENCES "gouvernance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre_gouvernance_structure" ADD CONSTRAINT "membre_gouvernance_structure_gouvernanceId_fkey" FOREIGN KEY ("gouvernanceId") REFERENCES "gouvernance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "membre_gouvernance_commune_commune_gouvernanceId_key" ON "membre_gouvernance_commune"("commune", "gouvernanceId");

-- CreateIndex
CREATE UNIQUE INDEX "membre_gouvernance_departement_departementCode_gouvernanceI_key" ON "membre_gouvernance_departement"("departementCode", "gouvernanceId");

-- CreateIndex
CREATE UNIQUE INDEX "membre_gouvernance_epci_epci_gouvernanceId_key" ON "membre_gouvernance_epci"("epci", "gouvernanceId");

-- CreateIndex
CREATE UNIQUE INDEX "membre_gouvernance_sgar_sgarCode_gouvernanceId_key" ON "membre_gouvernance_sgar"("sgarCode", "gouvernanceId");

-- CreateIndex
CREATE UNIQUE INDEX "membre_gouvernance_structure_structure_gouvernanceId_key" ON "membre_gouvernance_structure"("structure", "gouvernanceId");

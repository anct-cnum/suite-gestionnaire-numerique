-- CreateTable
CREATE TABLE "comite" (
    "id" SERIAL NOT NULL,
    "gouvernanceId" INTEGER NOT NULL,
    "creation" TIMESTAMP(3) NOT NULL,
    "derniereEdition" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "frequence" TEXT NOT NULL,
    "commentaire" TEXT,
    "dateProchainComite" TIMESTAMP(3),
    "nom" TEXT,

    CONSTRAINT "comite_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "comite" ADD CONSTRAINT "comite_gouvernanceId_fkey" FOREIGN KEY ("gouvernanceId") REFERENCES "gouvernance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

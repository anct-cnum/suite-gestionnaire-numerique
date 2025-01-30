-- CreateTable
CREATE TABLE "feuille_de_route" (
    "id" SERIAL NOT NULL,
    "gouvernanceDepartementCode" TEXT NOT NULL,
    "creation" TIMESTAMP(3) NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "feuille_de_route_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "feuille_de_route" ADD CONSTRAINT "feuille_de_route_gouvernanceDepartementCode_fkey" FOREIGN KEY ("gouvernanceDepartementCode") REFERENCES "gouvernance"("departementCode") ON DELETE RESTRICT ON UPDATE CASCADE;

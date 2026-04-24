-- CreateEnum
CREATE TYPE "TypeCargaison" AS ENUM ('ROUTIERE', 'MARITIME', 'AERIENNE');

-- CreateEnum
CREATE TYPE "TypeProduit" AS ENUM ('ALIMENTAIRE', 'CHIMIQUE', 'MATERIEL_FRAGILE', 'MATERIEL_INCASSABLE');

-- CreateTable
CREATE TABLE "cargaisons" (
    "id" SERIAL NOT NULL,
    "type" "TypeCargaison" NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cargaisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produits" (
    "id" SERIAL NOT NULL,
    "libelle" TEXT NOT NULL,
    "poids" DOUBLE PRECISION NOT NULL,
    "type" "TypeProduit" NOT NULL,
    "degreToxicite" INTEGER,
    "cargaisonId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produits_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "produits" ADD CONSTRAINT "produits_cargaisonId_fkey" FOREIGN KEY ("cargaisonId") REFERENCES "cargaisons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

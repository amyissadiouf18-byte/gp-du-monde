// import { TypeCargaison, TypeProduit } from './types';

import { TypeProduit, TypeCargaison } from "@prisma/client";

/**
 * Calcul des frais de transport d'un produit.
 *
 * Règles tarifaires :
 *  - Base : poids (kg) × distance (km) × 0.01 €
 *  - Produit chimique : majoration × degreToxicite / 5
 *  - Produit fragile  : majoration × 1.5
 *  - Transport aérien : majoration × 2
 *  - Transport maritime : majoration × 1.3
 */
export function calculerFraisProduit(
  poids: number,
  distance: number,
  typeProduit: TypeProduit,
  typeCargaison: TypeCargaison,
  degreToxicite?: number | null
): number {
  let frais = poids * distance * 0.01;

  // Majoration selon le type de produit
  if (typeProduit === TypeProduit.CHIMIQUE && degreToxicite) {
    frais *= degreToxicite / 5;
  } else if (typeProduit === TypeProduit.MATERIEL_FRAGILE) {
    frais *= 1.5;
  }

  // Majoration selon le mode de transport
  if (typeCargaison === TypeCargaison.AERIENNE) {
    frais *= 2;
  } else if (typeCargaison === TypeCargaison.MARITIME) {
    frais *= 1.3;
  }

  return Math.round(frais * 100) / 100; // arrondi à 2 décimales
}

/**
 * Vérifie la compatibilité entre un type de produit et un type de cargaison.
 * Retourne null si compatible, sinon un message d'erreur.
 */
export function verifierCompatibilite(
  typeProduit: TypeProduit,
  typeCargaison: TypeCargaison
): string | null {
  if (typeProduit === TypeProduit.CHIMIQUE) {
    if (typeCargaison !== TypeCargaison.MARITIME) {
      return 'Un produit chimique ne peut transiter que par voie maritime.';
    }
  }

  if (typeProduit === TypeProduit.MATERIEL_FRAGILE) {
    if (typeCargaison === TypeCargaison.MARITIME) {
      return 'Un produit fragile ne peut jamais transiter par voie maritime.';
    }
  }

  return null;
}

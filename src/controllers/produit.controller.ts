import { Request, Response } from 'express';
import prisma from '../utils/prisma';

/**
 * GET /api/produits/:id/info
 * Informations détaillées d'un produit
 */
export async function getInfoProduit(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ message: 'ID invalide.' }); return; }

  const produit = await prisma.produit.findUnique({ where: { id } });

  if (!produit) { res.status(404).json({ message: 'Produit introuvable.' }); return; }

  // Construire la réponse selon le type
  const info: Record<string, unknown> = {
    id: produit.id,
    libelle: produit.libelle,
    poids: produit.poids,
    type: produit.type,
    cargaisonId: produit.cargaisonId,
    createdAt: produit.createdAt,
    updatedAt: produit.updatedAt,
  };

  if (produit.type === 'CHIMIQUE') {
    info.degreToxicite = produit.degreToxicite;
  }

  if (produit.type === 'MATERIEL_FRAGILE' || produit.type === 'MATERIEL_INCASSABLE') {
    info.sousType = produit.type === 'MATERIEL_FRAGILE' ? 'Fragile' : 'Incassable';
  }

  res.json(info);
}

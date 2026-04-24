import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { TypeCargaison ,TypeProduit} from '@prisma/client';
import { calculerFraisProduit, verifierCompatibilite } from '../utils/business';

// ─── Schémas de validation ────────────────────────────────────────────────────

const createCargaisonSchema = z.object({
  type: z.nativeEnum(TypeCargaison),
  distance: z.number().positive('La distance doit être positive.'),
});

const addProduitSchema = z.object({
  libelle: z.string().min(1, 'Le libellé est requis.'),
  poids: z.number().positive('Le poids doit être positif.'),
  type: z.enum(['ALIMENTAIRE', 'CHIMIQUE', 'MATERIEL_FRAGILE', 'MATERIEL_INCASSABLE']),
  degreToxicite: z
    .number()
    .int()
    .min(1)
    .max(10)
    .optional()
    .nullable(),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function calculerMontantTotal(cargaisonId: number, distance: number, typeCargaison: TypeCargaison): Promise<number> {
  const produits = await prisma.produit.findMany({ where: { cargaisonId } });
  const total = produits.reduce((acc: number, p: { poids: number; type: string; degreToxicite: number | null }) => {
    return acc + calculerFraisProduit(p.poids, distance, p.type as TypeProduit, typeCargaison, p.degreToxicite);
  }, 0);
  return Math.round(total * 100) / 100;
}

// ─── Contrôleurs ──────────────────────────────────────────────────────────────

/**
 * POST /api/cargaisons
 * Créer une nouvelle cargaison
 */
export async function creerCargaison(req: Request, res: Response): Promise<void> {
  const result = createCargaisonSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ message: 'Données invalides.', errors: result.error.flatten() });
    return;
  }

  const { type, distance } = result.data;

  const cargaison = await prisma.cargaison.create({
    data: { type, distance },
  });

  res.status(201).json(cargaison);
}

/**
 * GET /api/cargaisons
 * Lister toutes les cargaisons
 */
export async function listerCargaisons(_req: Request, res: Response): Promise<void> {
  const cargaisons = await prisma.cargaison.findMany({
    include: { produits: true },
    orderBy: { createdAt: 'desc' },
  });

  const result = await Promise.all(
    (cargaisons as any[]).map(async (c: any) => ({
      ...c,
      nbProduits: c.produits.length,
      montantTotal: await calculerMontantTotal(c.id, c.distance, c.type as TypeCargaison),
    }))
  );

  res.json(result);
}

/**
 * GET /api/cargaisons/:id
 * Détail d'une cargaison (produits, somme, nombre)
 */
export async function detailCargaison(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ message: 'ID invalide.' }); return; }

  const cargaison = await prisma.cargaison.findUnique({
    where: { id },
    include: { produits: true },
  });

  if (!cargaison) { res.status(404).json({ message: 'Cargaison introuvable.' }); return; }

  const montantTotal = await calculerMontantTotal(id, cargaison.distance, cargaison.type);

  res.json({
    ...cargaison,
    nbProduits: cargaison.produits.length,
    montantTotal,
  });
}

/**
 * POST /api/cargaisons/:id/produits
 * Ajouter un produit à une cargaison
 */
export async function ajouterProduit(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ message: 'ID invalide.' }); return; }

  // Validation du body
  const result = addProduitSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ message: 'Données invalides.', errors: result.error.flatten() });
    return;
  }

  const { libelle, poids, type: typeProduit, degreToxicite } = result.data;

  // Vérifier que le degré de toxicité est fourni pour un produit chimique
  if (typeProduit === 'CHIMIQUE' && (degreToxicite === undefined || degreToxicite === null)) {
    res.status(400).json({ message: 'Le degré de toxicité est requis pour un produit chimique (1-10).' });
    return;
  }

  // Récupérer la cargaison
  const cargaison = await prisma.cargaison.findUnique({
    where: { id },
    include: { produits: true },
  });

  if (!cargaison) { res.status(404).json({ message: 'Cargaison introuvable.' }); return; }

  // R1 — Vérifier la capacité (max 10 produits)
  if (cargaison.produits.length >= 10) {
    res.status(400).json({ message: 'Cargaison pleine' });
    return;
  }

  // R2/R3/R6 — Vérifier la compatibilité produit/cargaison
  const erreurCompatibilite = verifierCompatibilite(typeProduit as any, cargaison.type);
  if (erreurCompatibilite) {
    res.status(400).json({ message: erreurCompatibilite });
    return;
  }

  // Créer le produit
  const produit = await prisma.produit.create({
    data: {
      libelle,
      poids,
      type: typeProduit as any,
      degreToxicite: typeProduit === 'CHIMIQUE' ? degreToxicite : null,
      cargaisonId: id,
    },
  });

  // R5 — Recalculer le montant total
  const montantTotal = await calculerMontantTotal(id, cargaison.distance, cargaison.type);

  res.status(201).json({
    produit,
    montantTotal,
  });
}

/**
 * GET /api/cargaisons/:id/somme
 * Montant total d'une cargaison
 */
export async function getMontantTotal(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ message: 'ID invalide.' }); return; }

  const cargaison = await prisma.cargaison.findUnique({ where: { id } });
  if (!cargaison) { res.status(404).json({ message: 'Cargaison introuvable.' }); return; }

  const montantTotal = await calculerMontantTotal(id, cargaison.distance, cargaison.type);

  res.json({ cargaisonId: id, montantTotal });
}

/**
 * GET /api/cargaisons/:id/nb-produits
 * Nombre de produits dans une cargaison
 */
export async function getNbProduits(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ message: 'ID invalide.' }); return; }

  const cargaison = await prisma.cargaison.findUnique({
    where: { id },
    include: { _count: { select: { produits: true } } },
  });

  if (!cargaison) { res.status(404).json({ message: 'Cargaison introuvable.' }); return; }

  res.json({ cargaisonId: id, nbProduits: cargaison._count.produits });
}

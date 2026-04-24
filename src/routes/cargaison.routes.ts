import { Router } from 'express';
import {
  creerCargaison,
  listerCargaisons,
  detailCargaison,
  ajouterProduit,
  getMontantTotal,
  getNbProduits,
} from '../controllers/cargaison.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Cargaisons
 *   description: Gestion des cargaisons
 */

/**
 * @swagger
 * /api/cargaisons:
 *   post:
 *     summary: Créer une nouvelle cargaison
 *     tags: [Cargaisons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, distance]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [ROUTIERE, MARITIME, AERIENNE]
 *                 example: MARITIME
 *               distance:
 *                 type: number
 *                 example: 1500
 *     responses:
 *       201:
 *         description: Cargaison créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cargaison'
 *       400:
 *         description: Données invalides
 */
router.post('/', creerCargaison);

/**
 * @swagger
 * /api/cargaisons:
 *   get:
 *     summary: Lister toutes les cargaisons
 *     tags: [Cargaisons]
 *     responses:
 *       200:
 *         description: Liste des cargaisons avec leurs produits et montants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CargaisonDetail'
 */
router.get('/', listerCargaisons);

/**
 * @swagger
 * /api/cargaisons/{id}:
 *   get:
 *     summary: Détail d'une cargaison
 *     tags: [Cargaisons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détail de la cargaison avec produits, nb et montant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CargaisonDetail'
 *       404:
 *         description: Cargaison introuvable
 */
router.get('/:id', detailCargaison);

/**
 * @swagger
 * /api/cargaisons/{id}/produits:
 *   post:
 *     summary: Ajouter un produit à une cargaison
 *     tags: [Cargaisons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddProduitInput'
 *     responses:
 *       201:
 *         description: Produit ajouté avec montant total mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 produit:
 *                   $ref: '#/components/schemas/Produit'
 *                 montantTotal:
 *                   type: number
 *                   example: 350.75
 *       400:
 *         description: Cargaison pleine, produit incompatible ou données invalides
 *       404:
 *         description: Cargaison introuvable
 */
router.post('/:id/produits', ajouterProduit);

/**
 * @swagger
 * /api/cargaisons/{id}/somme:
 *   get:
 *     summary: Montant total d'une cargaison
 *     tags: [Cargaisons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Montant total calculé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cargaisonId:
 *                   type: integer
 *                 montantTotal:
 *                   type: number
 *       404:
 *         description: Cargaison introuvable
 */
router.get('/:id/somme', getMontantTotal);

/**
 * @swagger
 * /api/cargaisons/{id}/nb-produits:
 *   get:
 *     summary: Nombre de produits d'une cargaison
 *     tags: [Cargaisons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Nombre de produits
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cargaisonId:
 *                   type: integer
 *                 nbProduits:
 *                   type: integer
 *       404:
 *         description: Cargaison introuvable
 */
router.get('/:id/nb-produits', getNbProduits);

export default router;

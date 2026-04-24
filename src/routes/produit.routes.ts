import { Router } from 'express';
import { getInfoProduit } from '../controllers/produit.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Produits
 *   description: Consultation des produits
 */

/**
 * @swagger
 * /api/produits/{id}/info:
 *   get:
 *     summary: Informations détaillées d'un produit
 *     tags: [Produits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du produit
 *     responses:
 *       200:
 *         description: Informations du produit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProduitInfo'
 *       404:
 *         description: Produit introuvable
 */
router.get('/:id/info', getInfoProduit);

export default router;

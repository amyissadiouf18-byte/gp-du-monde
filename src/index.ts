import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './utils/swagger';
import cargaisonRoutes from './routes/cargaison.routes';
import produitRoutes from './routes/produit.routes';
import { errorHandler, notFound } from './middlewares/errorHandler';

const app = express();
const PORT = process.env.PORT ?? 3000;

// ─── Middlewares globaux ──────────────────────────────────────────────────────
app.use(express.json());

// ─── Documentation Swagger ────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'GP du Monde — API Docs',
}));

// Endpoint pour récupérer la spec JSON brute
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ─── Routes API ───────────────────────────────────────────────────────────────
app.use('/api/cargaisons', cargaisonRoutes);
app.use('/api/produits', produitRoutes);

// ─── Route de santé ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'GP du Monde API', timestamp: new Date().toISOString() });
});

// ─── Gestion des erreurs ──────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Démarrage ────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 GP du Monde API démarré sur http://localhost:${PORT}`);
  console.log(`📚 Documentation Swagger : http://localhost:${PORT}/api-docs\n`);
});

export default app;

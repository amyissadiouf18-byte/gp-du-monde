import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GP du Monde — API Cargaisons',
      version: '1.0.0',
      description:
        'API REST de gestion des cargaisons et produits pour GP du Monde, ' +
        'une entreprise de transport de colis à l\'échelle mondiale.',
      contact: {
        name: 'GP du Monde',
      },
    },
    servers: [
      {
        url: 'http://localhost:{port}',
        description: 'Serveur de développement',
        variables: {
          port: { default: '3000' },
        },
      },
    ],
    components: {
      schemas: {
        Cargaison: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            type: { type: 'string', enum: ['ROUTIERE', 'MARITIME', 'AERIENNE'], example: 'MARITIME' },
            distance: { type: 'number', example: 1500 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CargaisonDetail: {
          allOf: [
            { $ref: '#/components/schemas/Cargaison' },
            {
              type: 'object',
              properties: {
                produits: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Produit' },
                },
                nbProduits: { type: 'integer', example: 3 },
                montantTotal: { type: 'number', example: 875.5 },
              },
            },
          ],
        },
        Produit: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            libelle: { type: 'string', example: 'Acide sulfurique' },
            poids: { type: 'number', example: 50 },
            type: {
              type: 'string',
              enum: ['ALIMENTAIRE', 'CHIMIQUE', 'MATERIEL_FRAGILE', 'MATERIEL_INCASSABLE'],
              example: 'CHIMIQUE',
            },
            degreToxicite: { type: 'integer', nullable: true, minimum: 1, maximum: 10, example: 7 },
            cargaisonId: { type: 'integer', example: 1 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ProduitInfo: {
          allOf: [
            { $ref: '#/components/schemas/Produit' },
            {
              type: 'object',
              properties: {
                sousType: {
                  type: 'string',
                  nullable: true,
                  enum: ['Fragile', 'Incassable'],
                  description: 'Sous-type pour les produits de type MATERIEL',
                },
              },
            },
          ],
        },
        AddProduitInput: {
          type: 'object',
          required: ['libelle', 'poids', 'type'],
          properties: {
            libelle: { type: 'string', example: 'Bouteilles de vin' },
            poids: { type: 'number', example: 12.5 },
            type: {
              type: 'string',
              enum: ['ALIMENTAIRE', 'CHIMIQUE', 'MATERIEL_FRAGILE', 'MATERIEL_INCASSABLE'],
              example: 'ALIMENTAIRE',
            },
            degreToxicite: {
              type: 'integer',
              minimum: 1,
              maximum: 10,
              nullable: true,
              description: 'Requis uniquement pour les produits CHIMIQUE',
              example: null,
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Cargaison pleine' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

# GP du Monde — API de Gestion des Cargaisons

API REST construite avec **Node.js · Express · TypeScript · Prisma · PostgreSQL · Swagger**.

---

## Prérequis

- Node.js >= 18 LTS
- PostgreSQL (en local ou via Docker)
- npm ou yarn

---

## Installation

```bash
# 1. Cloner le projet et installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env et renseigner DATABASE_URL

# 3. Générer le client Prisma et appliquer les migrations
npm run prisma:migrate
npm run prisma:generate

# 4. Démarrer en mode développement
npm run dev
```

---

## Variables d'environnement

| Variable       | Description                      | Exemple                                          |
|----------------|----------------------------------|--------------------------------------------------|
| `DATABASE_URL` | URL de connexion PostgreSQL      | `postgresql://user:pass@localhost:5432/gp_monde` |
| `PORT`         | Port du serveur Express          | `3000`                                           |

---

## Lancer avec Docker (PostgreSQL uniquement)

```bash
docker run --name gp-postgres \
  -e POSTGRES_USER=gp \
  -e POSTGRES_PASSWORD=gp_secret \
  -e POSTGRES_DB=gp_du_monde \
  -p 5432:5432 \
  -d postgres:16
```

Puis configurer `.env` :
```
DATABASE_URL="postgresql://gp:gp_secret@localhost:5432/gp_du_monde?schema=public"
```

---

## Scripts disponibles

| Commande               | Description                                  |
|------------------------|----------------------------------------------|
| `npm run dev`          | Démarrage en mode développement (hot-reload) |
| `npm run build`        | Compilation TypeScript → dist/               |
| `npm start`            | Démarrer la version compilée                 |
| `npm run prisma:migrate` | Créer/appliquer les migrations BDD         |
| `npm run prisma:generate` | Régénérer le client Prisma              |
| `npm run prisma:studio`| Ouvrir Prisma Studio (UI BDD)                |

---

## Endpoints API

| Méthode | Endpoint                          | Description                         |
|---------|-----------------------------------|-------------------------------------|
| POST    | `/api/cargaisons`                 | Créer une cargaison                 |
| GET     | `/api/cargaisons`                 | Lister toutes les cargaisons        |
| GET     | `/api/cargaisons/:id`             | Détail d'une cargaison              |
| POST    | `/api/cargaisons/:id/produits`    | Ajouter un produit à une cargaison  |
| GET     | `/api/cargaisons/:id/somme`       | Montant total d'une cargaison       |
| GET     | `/api/cargaisons/:id/nb-produits` | Nombre de produits d'une cargaison  |
| GET     | `/api/produits/:id/info`          | Informations détaillées d'un produit|

📚 **Documentation interactive** : [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## Règles métier

| Règle | Description |
|-------|-------------|
| R1 | Maximum 10 produits par cargaison → `{ message: "Cargaison pleine" }` |
| R2 | Produit chimique → voie **maritime** uniquement |
| R3 | Produit fragile → jamais par voie **maritime** |
| R4 | Degré de toxicité chimique → entier entre 1 et 10 |
| R5 | Montant total recalculé à chaque ajout de produit |
| R6 | Message explicite si produit incompatible avec la cargaison |

### Tableau de compatibilité

| Type de produit      | Routière | Maritime | Aérienne |
|----------------------|----------|----------|----------|
| Alimentaire          | ✅       | ✅       | ✅       |
| Chimique             | ❌       | ✅       | ❌       |
| Matériel Fragile     | ✅       | ❌       | ✅       |
| Matériel Incassable  | ✅       | ✅       | ✅       |

---

## Structure du projet

```
gp-du-monde/
├── prisma/
│   └── schema.prisma          # Modèle de données (Cargaison, Produit)
├── src/
│   ├── controllers/
│   │   ├── cargaison.controller.ts
│   │   └── produit.controller.ts
│   ├── middlewares/
│   │   └── errorHandler.ts
│   ├── routes/
│   │   ├── cargaison.routes.ts  # + annotations Swagger
│   │   └── produit.routes.ts    # + annotations Swagger
│   ├── utils/
│   │   ├── business.ts          # Calcul des frais, règles de compatibilité
│   │   ├── prisma.ts            # Client Prisma singleton
│   │   └── swagger.ts           # Configuration Swagger/OpenAPI
│   └── index.ts                 # Point d'entrée Express
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## Exemples de requêtes

### Créer une cargaison maritime
```bash
curl -X POST http://localhost:3000/api/cargaisons \
  -H "Content-Type: application/json" \
  -d '{"type": "MARITIME", "distance": 5000}'
```

### Ajouter un produit chimique
```bash
curl -X POST http://localhost:3000/api/cargaisons/1/produits \
  -H "Content-Type: application/json" \
  -d '{"libelle": "Acide sulfurique", "poids": 50, "type": "CHIMIQUE", "degreToxicite": 8}'
```

### Consulter le montant total
```bash
curl http://localhost:3000/api/cargaisons/1/somme
```

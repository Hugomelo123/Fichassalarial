# LuxPayroll 2026

Calculateur de salaire et générateur de fiches de paie conforme à la législation luxembourgeoise 2026.

## Fonctionnalités

- **Calcul automatique des cotisations sociales** — Assurance maladie (soins + espèces), pension, dépendance
- **Calcul de l'impôt sur salaire** — Retenue à la source avec crédit d'impôt (CIS/CISSM)
- **Aperçu fiche de paie** — Prévisualisation temps réel au format A4 professionnel
- **Export PDF** — Génération de fiches de paie au format PDF téléchargeable
- **Export XML CCSS** — Déclaration XML compatible avec le Centre Commun de la Sécurité Sociale
- **Projection annuelle** — Estimation des totaux annuels (×12 mois)
- **Classes d'impôt** — Support des classes 1, 1a et 2

## Stack Technique

| Couche | Technologies |
|--------|-------------|
| **Frontend** | React 19, TypeScript, TailwindCSS 4, Radix UI (shadcn/ui) |
| **State** | Zustand |
| **Routing** | Wouter |
| **Backend** | Express 5, Node.js |
| **ORM** | Drizzle ORM (PostgreSQL) |
| **Build** | Vite 7, esbuild |
| **PDF** | jsPDF |
| **XML** | xmlbuilder2 |

## Structure du Projet

```
├── client/                 # Application React
│   ├── index.html
│   └── src/
│       ├── components/     # Composants UI (formulaires, aperçu, navbar)
│       ├── hooks/          # Hooks React personnalisés
│       ├── lib/            # Utilitaires (queryClient, cn)
│       ├── pages/          # Pages (Home, 404)
│       ├── store/          # Store Zustand (usePayrollStore)
│       └── utils/          # Logique métier (calculs, PDF, XML)
├── server/                 # Serveur Express
│   ├── index.ts            # Point d'entrée
│   ├── routes.ts           # Routes API
│   ├── storage.ts          # Interface de stockage
│   ├── static.ts           # Fichiers statiques (production)
│   └── vite.ts             # Dev server Vite middleware
├── shared/                 # Code partagé client/serveur
│   └── schema.ts           # Schémas Drizzle + Zod
└── script/
    └── build.ts            # Script de build (client + server)
```

## Démarrage rapide

### Prérequis

- **Node.js** >= 20
- **npm** >= 10
- **PostgreSQL** 16+ (optionnel, pour la persistance)

### Installation

```bash
# Cloner le repository
git clone https://github.com/<votre-username>/luxpayroll-2026.git
cd luxpayroll-2026

# Installer les dépendances
npm install
```

### Développement

```bash
# Démarrer en mode développement (client uniquement)
npm run dev:client

# Démarrer le serveur complet (API + client)
npm run dev
```

L'application sera accessible sur [http://localhost:5000](http://localhost:5000).

### Production

```bash
# Build complet (client + serveur)
npm run build

# Démarrer en production
npm start
```

### Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `PORT` | Port du serveur | `5000` |
| `DATABASE_URL` | URL PostgreSQL | — |
| `NODE_ENV` | Environnement | `development` |

## Barèmes 2026

Les taux de cotisation appliqués (part salarié) :

| Cotisation | Taux |
|------------|------|
| Assurance Maladie (Soins) | 2,80% |
| Assurance Maladie (Espèces) | 0,25% |
| Assurance Pension | 8,00% |
| Assurance Dépendance | 1,40% |

> **Note** : L'impôt sur salaire utilise actuellement un taux moyen simplifié. L'intégration des barèmes progressifs par classe d'impôt est prévue dans une version future.

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev:client` | Démarrer le client Vite (HMR) |
| `npm run dev` | Démarrer le serveur complet |
| `npm run build` | Build production |
| `npm start` | Lancer en production |
| `npm run check` | Vérification TypeScript |
| `npm run db:push` | Pousser le schéma vers la DB |

## Licence

MIT

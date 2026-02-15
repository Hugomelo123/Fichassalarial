<p align="center">
  <img src="https://img.shields.io/badge/Luxembourg-Payroll_2026-002d72?style=for-the-badge&labelColor=e8312a" alt="Luxembourg Payroll 2026" />
</p>

<h1 align="center">LuxPayroll 2026</h1>

<p align="center">
  <strong>Simulateur de fiches de paie conforme a la legislation luxembourgeoise 2026</strong>
  <br />
  <em>Calcul automatique des cotisations sociales, retenues fiscales et generation de documents</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178c6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-7-646cff?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
</p>

---

## Contexte

Au Grand-Duche de Luxembourg, l'elaboration des fiches de remuneration implique l'application rigoureuse des barermes sociaux et fiscaux en vigueur. **LuxPayroll 2026** est un outil de simulation qui permet aux professionnels RH, comptables et gestionnaires de paie de :

- Visualiser en temps reel l'impact des cotisations et retenues sur le salaire net
- Generer des fiches de paie au format PDF pret a l'impression
- Exporter les declarations au format XML compatible CCSS
- Projeter les couts salariaux sur une base annuelle

> **Avertissement** : Cet outil est un simulateur a vocation indicative. Il ne se substitue pas aux logiciels de paie certifies ni aux conseils d'un expert-comptable agree.

---

## Fonctionnalites

<table>
  <tr>
    <td width="50%">
      <h3>Calcul en temps reel</h3>
      <ul>
        <li>Cotisations sociales (CNS, Pension, Dependance)</li>
        <li>Retenue a la source (RTS)</li>
        <li>Credit d'impot salarial (CIS / CISSM)</li>
        <li>Classes d'impot 1, 1a et 2</li>
      </ul>
    </td>
    <td width="50%">
      <h3>Generation de documents</h3>
      <ul>
        <li>Fiche de paie PDF (format A4 professionnel)</li>
        <li>Declaration XML au format CCSS</li>
        <li>Apercu avant impression integre</li>
        <li>Projection annuelle estimative (x12)</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <h3>Donnees entreprise & salarie</h3>
      <ul>
        <li>Formulaire employeur (raison sociale, TVA, adresse)</li>
        <li>Formulaire salarie (matricule CCSS, fonction, classe)</li>
        <li>Saisie du salaire brut mensuel</li>
      </ul>
    </td>
    <td>
      <h3>Interface professionnelle</h3>
      <ul>
        <li>Design epure adapte au secteur comptable</li>
        <li>Responsive (desktop, tablette, mobile)</li>
        <li>Decomposition detaillee de chaque ligne</li>
      </ul>
    </td>
  </tr>
</table>

---

## Baremes applicables — Exercice 2026

Les taux de cotisation ci-dessous correspondent a la **part salariale** retenue sur le salaire brut :

| Cotisation | Organisme | Taux | Base de calcul |
|:-----------|:----------|-----:|:---------------|
| Assurance Maladie — Soins de sante | CNS | 2,80 % | Salaire brut |
| Assurance Maladie — Indemnites pecuniaires | CNS | 0,25 % | Salaire brut |
| Assurance Pension | CNAP | 8,00 % | Salaire brut |
| Assurance Dependance | CNS | 1,40 % | Salaire brut |
| **Total cotisations salariales** | | **12,45 %** | |

> L'impot sur le revenu est calcule sur la base du revenu imposable (salaire brut - cotisations sociales) selon un taux moyen simplifie. L'integration des baremes progressifs officiels par classe d'impot est prevue dans une version future.

---

## Architecture technique

```
luxpayroll-2026/
│
├── client/                          # Frontend React
│   ├── index.html                   # Point d'entree HTML
│   └── src/
│       ├── components/              # Composants metier
│       │   ├── CompanyForm.tsx      #   Formulaire employeur
│       │   ├── EmployeeForm.tsx     #   Formulaire salarie
│       │   ├── SalaryBreakdown.tsx  #   Decomposition du net
│       │   ├── PayslipPreview.tsx   #   Apercu fiche de paie A4
│       │   ├── AnnualSummary.tsx    #   Projection annuelle
│       │   ├── Navbar.tsx           #   Barre de navigation
│       │   └── ui/                  #   Composants Radix UI (shadcn)
│       ├── store/
│       │   └── usePayrollStore.ts   # State management (Zustand)
│       ├── utils/
│       │   ├── calculations.ts      # Moteur de calcul paie
│       │   ├── generatePDF.ts       # Generation PDF (jsPDF)
│       │   └── generateXML.ts       # Export XML CCSS
│       ├── pages/                   # Routes (Home, 404)
│       ├── hooks/                   # Hooks personnalises
│       └── lib/                     # Utilitaires (API client, cn)
│
├── server/                          # Backend Express
│   ├── index.ts                     # Serveur HTTP + middleware
│   ├── routes.ts                    # Routes API (/api/*)
│   ├── storage.ts                   # Couche de persistance
│   ├── static.ts                    # Fichiers statiques (prod)
│   └── vite.ts                      # Middleware Vite (dev)
│
├── shared/                          # Code partage
│   └── schema.ts                    # Schemas Drizzle ORM + Zod
│
└── script/
    └── build.ts                     # Pipeline de build
```

### Stack

| Couche | Technologies |
|:-------|:------------|
| **Interface** | React 19 · TypeScript 5.6 · TailwindCSS 4 · Radix UI / shadcn |
| **Etat applicatif** | Zustand |
| **Routage** | Wouter |
| **Serveur** | Express 5 · Node.js 20+ |
| **Base de donnees** | PostgreSQL 16 · Drizzle ORM |
| **Build** | Vite 7 · esbuild |
| **Documents** | jsPDF (PDF) · xmlbuilder2 (XML) |

---

## Mise en route

### Prerequis

- **Node.js** >= 20
- **npm** >= 10
- **PostgreSQL** 16+ *(optionnel — le mode en memoire est actif par defaut)*

### Installation

```bash
git clone https://github.com/Hugomelo123/Fichassalarial.git
cd Fichassalarial
npm install
```

### Demarrage en developpement

```bash
# Client uniquement (Hot Module Replacement)
npm run dev:client

# Serveur complet (API + client)
npm run dev
```

Application disponible sur **http://localhost:5000**

### Build de production

```bash
npm run build     # Compile client (Vite) + serveur (esbuild)
npm start         # Demarre le serveur de production
```

### Variables d'environnement

Creez un fichier `.env` a la racine si necessaire :

```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/luxpayroll
NODE_ENV=development
```

| Variable | Description | Defaut |
|:---------|:------------|:-------|
| `PORT` | Port d'ecoute du serveur | `5000` |
| `DATABASE_URL` | Chaine de connexion PostgreSQL | *(memoire)* |
| `NODE_ENV` | `development` ou `production` | `development` |

---

## Scripts npm

| Commande | Description |
|:---------|:------------|
| `npm run dev:client` | Demarrer le client Vite avec HMR |
| `npm run dev` | Demarrer le serveur complet (dev) |
| `npm run build` | Build de production (client + serveur) |
| `npm start` | Lancer l'application en production |
| `npm run check` | Verification de types TypeScript |
| `npm run db:push` | Synchroniser le schema avec la base |

---

## Roadmap

- [ ] Baremes d'impot progressifs officiels par classe (1, 1a, 2)
- [ ] Gestion du 13e mois et primes
- [ ] Historique des fiches de paie (persistance DB)
- [ ] Multi-salaries avec tableau de bord
- [ ] Export SEPA XML pour les virements
- [ ] Mode sombre

---

## Licence

Distribue sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus d'informations.

---

<p align="center">
  <sub>Developpe avec precision pour le secteur de la paie luxembourgeoise</sub>
  <br />
  <sub>Baremes 2026 · Grand-Duche de Luxembourg</sub>
</p>

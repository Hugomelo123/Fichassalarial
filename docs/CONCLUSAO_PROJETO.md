# Conclusões do Projeto — LuxPayroll 2026

Documento de conclusão do projeto: o que é, o que foi feito, estado actual e recomendações.

---

## 1. O que é o projeto

**LuxPayroll 2026** é um **simulador de fichas de salário** (fiches de paie) para o **Grand-Duché de Luxembourg**. Destina-se a:

- Simular em tempo real o impacto das cotisations sociais e da retenção à fonte (RTS) no salário líquido
- Gerar fichas em PDF e exportar dados em XML (formato compatível com declarações)
- Gerir vários colaboradores, histórico de fichas e um quadro de borda resumido
- Funcionar em desktop e em mobile (layout responsivo)

**Aviso importante:** É um simulador de carácter **indicativo**. Não substitui software de paie certificado nem o parecer de um expert-comptable.

---

## 2. Stack técnico

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 19, TypeScript 5.6, TailwindCSS 4, Radix UI (shadcn), Wouter, Zustand (persist) |
| Build | Vite 7, esbuild |
| Geração PDF | jsPDF |
| Persistência | localStorage (Zustand persist) — dados da aplicação; backend opcional (Express 5, Drizzle, PostgreSQL) |
| Testes | Testes unitários em `calculations.test.ts` (tsx) |

Servidor de desenvolvimento: **porta 5001** (`npm run dev:client`).

---

## 3. O que foi implementado

### 3.1 Cálculo (motor Luxembourg)

- **Cotisations:** Maladie soins 2,80 %, Maladie espèces 0,25 %, Pension 8 %, Dépendance 1,40 % (base após abattement ¼ SSM)
- **Imposto:** Barème progressif (RTS) por classe (1, 1a, 2), solidarité 7 % / 9 %, crédit barème (classe 1a e 2), deduções forfait (FO, DS), arredondamento ao cêntimo (impôt retenu ao 0,10 €)
- **Parâmetros por ano:** 2024, 2025, 2026 (index, SSM, CIS, CI-CO2, FO, DS, crédit barème)
- **Créditos fiscais:** CIS, CIP, CIM, CISSM, CI-CO2 — **calculados automaticamente** quando o valor é 0 (conforme salário bruto anual e bandas oficiais ACD)
- **Salário:** Modo mensal ou horário; horas sup. com majoração configurável (25 % a 100 %); frais de déplacement, chèques repas, outras vantagens/deduções
- **Maladie (heures ce mois):** Maintien 100 % do bruto (não há desconto); cotisations sobre o bruto pago
- **Precisão:** Regras de arredondamento alinhadas com a prática luxemburguesa; testes unitários validam contra ficha de referência (Setembro 2025)

### 3.2 Funcionalidades de aplicação

- **Empresa:** Nome, morada, cidade, TVA
- **Colaboradores:** Vários; formulário completo (identificação, classe de imposto, salário mensal/hora, horas, sup., maladie, créditos, congés/absences)
- **Período:** Selector mês/ano (ex. 2026-02); cálculos e PDF/XML em função do ano
- **Vistas:** Simulateur (entrada + pré-visualização + breakdown + resumo anual), Fiches (histórico de fichas guardadas), Tableau de bord (KPIs e tabela por colaborador)
- **Ficha (pré-visualização e PDF):** Formato tipo décompte Luxembourg; totais, cotisations, impôt, créditos, net à payer; bloco “Congés & Absences” (heures) e solde congés
- **Export:** PDF (jsPDF) e XML (template) por período
- **Mobile:** Sidebar em drawer, barra superior com menu e navegação; grelhas e tabelas responsivas; inputs e toques adaptados
- **Persistência:** Dados (empresa, colaboradores, fichas guardadas, período, etc.) em localStorage; versão do schema para migrações

### 3.3 Congés e absences (regras Luxembourg)

- **Congés payés:** Direito/pris/solde em horas (default 208 h = 26 j × 8 h); salário do mês **não é reduzido** (maintien)
- **Maladie:** Heures maladie do mês e cumul annuel apenas informativos; bruto mantido (maintien 100 %)
- **Feriados, récupération, repos:** Horas registadas no resumo da ficha; sem impacto no bruto

Detalhe em `docs/CONGES_MALADIE_LUXEMBOURG.md`.

---

## 4. Estado actual — conclusões

### 4.1 O que está correto e estável

- **Cálculos:** Alinhados com parâmetros oficiais 2025/2026 (index, SSM, CIS, CI-CO2, barème, arredondamentos); testes passam com valores de referência
- **Créditos automáticos:** CIS, CI-CO2, CISSM calculados a partir do bruto (e ano) quando o utilizador deixa 0
- **Congés / maladie:** Tratamento do salário (maintien) e registo de horas conforme prática Luxembourg
- **Fluxo principal:** Adicionar colaborador → preencher dados → ver simulação → guardar ficha → histórico e dashboard
- **Período:** Selector mês/ano presente no formulário; cálculos e export usam o período escolhido
- **Responsivo:** Layout e navegação utilizáveis em mobile

### 4.2 O que não está feito (e não é bloqueante)

- **Backend/BD:** Persistência é em localStorage; opção Express/Drizzle/PostgreSQL existe mas não é necessária para o simulador
- **77 jours / 18 mois (maladie):** Controle do limite legal e declaração CCSS (DECMAL) não implementados — fica para gestão RH/employeur
- **Indemnité de congé (173 h):** Cálculo explícito “média 3 meses ÷ 173” não implementado; só relevante para fim de contrato ou equivalência
- **Forfait 173 h:** App usa 176 h como “heures standard”; 173 h é o forfait oficial para indemnité de congé — diferença pequena, documentada

### 4.3 Melhorias recomendadas (UX / robustez)

| Prioridade | Sugestão | Motivo |
|------------|----------|--------|
| Média | Confirmação antes de apagar colaborador ou ficha | Evitar apagamentos acidentais |
| Baixa | Validação de nome (ex. não guardar ficha com nome vazio) | Consistência dos dados |
| Baixa | Estados de carregamento nos botões PDF/XML | Feedback visual |
| Opcional | Texto de ajuda (tooltip) para congés (26 j = 208 h) e maladie (77 j / 18 mois) | Clareza para o utilizador |

Nada disto é obrigatório para o simulador funcionar correctamente.

---

## 5. Avaliação resumida

| Critério | Avaliação |
|----------|-----------|
| **Correção dos cálculos** | ✅ Alinhado com regras Luxembourg 2025/2026; testes unitários a passar |
| **Funcionalidade** | ✅ Simulateur, histórico, dashboard, PDF, XML, multi-colaborador, período, créditos auto |
| **Congés / maladie** | ✅ Maintien do salário e registo de horas conforme verificado |
| **Código** | ✅ TypeScript, motor de cálculo isolado e testado, store e UI organizados |
| **UX / design** | ✅ Interface clara, responsiva, adequada a uso profissional |
| **Documentação** | ✅ README, SUMMARY, docs (congés/maladie, conclusão) |

**Conclusão geral:** O projeto está **completo para uso como simulador de fiches de paie Luxembourg 2026**. Os cálculos estão validados, as funcionalidades pedidas estão implementadas, e as regras de congés e maladie estão respeitadas na parte que a aplicação cobre. As melhorias sugeridas são opcionais e de polish/segurança (confirmações, validações, ajuda ao utilizador).

---

## 6. Próximos passos (opcionais)

1. **Manter parâmetros anuais:** Atualizar index/SSM/CIS/CI-CO2 quando houver novas publicações oficiais (ex. tranche indiciaire).
2. **Testes manuais:** Validar PDF e XML em cenários reais (impressão, importação).
3. **Deploy:** Servir o build (ex. `npm run build` + estático) onde quiserem (Vercel, Netlify, servidor próprio).
4. **Backend:** Se no futuro quiserem utilizadores e base de dados centralizada, a estrutura Express/Drizzle já existe para evoluir.

---

## 7. Ficheiros de referência

- **Motor de cálculo:** `client/src/utils/calculations.ts`
- **Testes:** `client/src/utils/calculations.test.ts`
- **Store (estado global):** `client/src/store/usePayrollStore.ts`
- **Congés / maladie (regras):** `docs/CONGES_MALADIE_LUXEMBOURG.md`
- **Resumo rápido:** `SUMMARY.md`
- **README:** `README.md`

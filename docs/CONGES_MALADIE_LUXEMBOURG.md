# Congés, Maladie et Absences — Luxemburgo (verificação vs. aplicação)

Documento de referência: regras oficiais (Guichet.lu, ITM, CCSS, CNS) e comparação com o que a aplicação faz.

---

## 1. Congés payés (férias anuais)

### Regras oficiais (Luxemburgo)

| Aspecto | Regra oficial | Fonte |
|--------|----------------|--------|
| **Direito mínimo** | 26 **jours ouvrables** por ano (desde 1.1.2019) | Guichet.lu, ITM |
| **Jours ouvrables** | Todos os dias exceto domingos e feriados legais | ITM |
| **Acquisition** | 1/12 por mês de trabalho completo = **2,167 jours/mês** | Guichet.lu |
| **Fraction de mois** | Mais de 15 jours calendaires = 1 mês inteiro | Guichet.lu |
| **Période de référence** | Ano em curso; report possível até 31 mars N+1 (ou 31 déc. 1ª année) | Guichet.lu |
| **Maintien du salaire** | Durante as férias o empregador paga o salário normal (indemnité de congé) | Guichet.lu |
| **Indemnité de congé** | Média dos **3 últimos meses** (ou 12 se salário muito variável); elementos não periódicos (boni, 13º mês) não entram | Guichet.lu, ITM |
| **Horaire forfaitaire** | Salário horaire moyen = **rémunération mensuelle brute / 173 heures** (temps plein 8h/j, 40h/sem) | Guichet.lu, ITM |

### O que a aplicação faz

| Aspecto | Implementação | Correto? |
|--------|----------------|----------|
| Direito anual em horas | `congesAnnuels` (default **208 h** = 26 × 8 h) | ✅ Convenção habitual (26 j ouvrables × 8 h). Para tempo parcial deve ser pro-rata. |
| Congés pris | `congesPris` — horas de férias já tiradas (cumul anual) | ✅ Só registo para o resumo da ficha. |
| Solde | `congesAnnuels - congesPris` na ficha e PDF | ✅ |
| Efeito no salário do mês | **Nenhum**: o bruto mensal (ou hora × horas) é o que o utilizador introduz. Não há redução por “dias de férias neste mês”. | ✅ Em Luxemburgo, em princípio o salário mantém-se durante as férias; a ficha mostra o vencimento normal e as férias são registadas à parte. |
| Cálculo da indemnité de congé | **Não implementado**: não se calcula indemnité com média de 3 meses nem com 173 h. | ⚠️ Só relevante se quiserem calcular pagamento de férias em fim de contrato ou valor “équivalent congés”; para mês normal com salário fixo, o bruto introduzido é o que conta. |
| Heures mensuelles de référence | App usa **176 h** (`RATES.standardMonthlyHours`) para taux horaire (mensal → hora). Oficial para indemnité de congé = **173 h**. | ⚠️ Pequena diferença: 173 vs 176. 173 = forfait oficial (40×52/12). Se no futuro calcularem indemnité de congé, usar 173. |

**Conclusão congés:** O tratamento está correto para o uso típico: salário mantido, férias registadas em horas (droit / pris / solde). Falta apenas o cálculo explícito da indemnité de congé (média 3 meses, 173 h) para casos de fim de contrato ou equivalência; o uso de 176 h é aceitável para “horas padrão” no resto da app, mas 173 h é o número oficial para indemnité.

---

## 2. Maladie (incapacidade de trabalho)

### Regras oficiais (Luxemburgo)

| Aspecto | Regra oficial | Fonte |
|--------|----------------|--------|
| **Maintien du salaire** | Empregador mantém **100 % do salário** até ao **77.º jour d’incapacité** (inclusivé) | Pixie.lu, Just Arrived, CNS |
| **Période de référence** | **18 mois consécutifs glissants** — todos os dias de incapacidade (maladie, acidente, etc.) somam-se | Pixie.lu, ITM |
| **Jours** | **Jours calendaires** (inclui fins de semana e feriados) | Just Arrived |
| **Après 77 jours** | A CNS (Caisse Nationale de Santé) assume; o empregador deixa de pagar | CNS |
| **Nouvelle période** | Uma nova “janela” de 77 jours só reabre no 1.º dia do mês em que o total nos últimos 18 mois for **&lt; 77 jours** | Pixie.lu |
| **Déclaration** | Declaração CCSS (DECMAL / SECUline) para remboursement MDE | CCSS |

### O que a aplicação faz

| Aspecto | Implementação | Correto? |
|--------|----------------|----------|
| Heures maladie **ce mois** | Campo global “Absences maladie (heures ce mois)” → `maladieHours` no store; enviado para o motor como `maladieHours`. | ✅ Coerente com “horas de doença neste mês”. |
| Efeito no salário **mensal** | `salaireBase = monthlyGross` (inalterado); `heuresNormales = 176 - maladieHours` (só informativo). | ✅ **Correto**: maintien 100 % — não se desconta nada. |
| Efeito no salário **hora** | `salaireBase = hourlyRate * hoursWorked`; as horas de maladie estão incluídas em `hoursWorked` (o utilizador introduz o total de horas pagas, incluindo maladie). | ✅ Se o utilizador meter 168 h normais + 8 h maladie como 176 h trabalhadas, o bruto está correto (100 % pago). |
| Cotisations (maladie soins / espèces) | Calculadas sobre o **salaryBrut** (que já inclui o pagamento das horas maladie). | ✅ Correto: cotisations sobre o bruto pago. |
| Registo na ficha | `heuresMaladie` no resultado; “Heures maladie (mois)” no PDF; secção “Maladie” no resumo (cumul annuel en heures). | ✅ |
| Cumul annuel maladie | Campo `maladieHeures` no colaborador — **apenas contador em horas** para o resumo da ficha; não usado no cálculo do salário. | ✅ Só informativo. |
| Janela 18 mois / 77 jours | **Não implementado**: a app não calcula se já foram atingidos 77 jours nos últimos 18 meses nem não paga além do 77.º dia. | ⚠️ Cabe ao empregador/HR controlar o limite e a declaração CCSS; a app não substitui esse controle. |

**Conclusão maladie:** O tratamento do salário está correto (maintien 100 %, cotisations sobre o bruto). O que falta é a lógica de “77 jours sur 18 mois” e a ligação à declaração CCSS; isso é gestão de absentéisme, não apenas cálculo da ficha.

---

## 3. Feriados, récupération, repos

### Regras oficiais

- **Jours fériés**: em princípio não trabalhados; salário mantido (como congés).
- **Récup** / **repos**: normalmente acordos internos ou convenção; salário mantido quando aplicável.

### O que a aplicação faz

- **Feriados, récupération, repos**: campos `feriados`, `recuperation`, `repos` (em horas) — **só para o resumo** da ficha e PDF (cumul annuel en heures).
- **Nenhum impacto no cálculo do bruto**: o utilizador introduce o salário do mês (mensal ou hora × horas); a app não desconta nada por estes tipos de ausência.

**Conclusão:** Correto para um registo informativo na ficha; o salário mantido está refletido no bruto que o utilizador indica.

---

## 4. Resumo “Situation des congés” (ficha / PDF)

A aplicação mostra (e exporta em PDF):

- **Congés annuels**: total (`congesAnnuels`) e pris (`congesPris`), em horas.
- **Solde**: `congesAnnuels - congesPris`.
- **Feries, Récupération, Repos, Maladie**: valores em horas (cumul annuel).
- **Heures maladie (mois)** : horas de maladie do mês (`maladieHours`).

Isto está alinhado com a ideia de “congés & absences en heures” na ficha; não há “report” automático (ex. report N-1 → N), que em Luxemburgo pode ser até 31 mars ou por acordo — pode ser adicionado depois como campo ou lógica específica.

---

## 5. Ajustes recomendados (prioridade)

1. **Documentar** no próprio formulário ou num tooltip:
   - Congés: 26 j ouvrables = 208 h (8 h/j) por defeito; tempo parcial = pro-rata.
   - Maladie: maintien 100 % até 77 jours (calendaires) sur 18 mois; declaração CCSS à parte.
2. **Indemnité de congé** (se for implementada): usar **173 h** como forfait mensal e média dos 3 (ou 12) últimos meses, conforme Guichet.lu / ITM.
3. **173 vs 176 h**: manter 176 para “horas padrão” no resto da app se fizer sentido para o cliente; usar 173 apenas no cálculo explícito da indemnité de congé, para ficar conforme a prática oficial.

---

## Fontes

- [Guichet.lu – Congés annuels payés](https://guichet.public.lu/fr/entreprises/ressources-humaines/conges/annuel/conge-annuel.html)
- [ITM – Indemnité de congé (173 h)](https://itm.public.lu/fr/questions-reponses/droit-travail/conges/a/a18.html)
- [Pixie.lu – 77 jours, 18 mois](https://www.pixie.lu/corpus/rh/07-0090/une-nouvelle-maladie-ouvre-t-elle-une-nouvelle-periode-de-maintien-de-salaire-au-luxembourg/)
- [CCSS – Déclarer incapacité de travail](https://ccss.public.lu/fr/employeurs/secteur-prive/declarer-incapacite-travail.html)
- [CNS – Indemnité de maladie](https://cns.public.lu/fr/employeur/maladie-accident-conges/indemnite-maladie-salaries.html)

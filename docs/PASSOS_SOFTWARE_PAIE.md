# Passos para virar software de paie (roadmap real)

Documento baseado em pesquisa: boas práticas de payroll SaaS, requisitos Luxembourg (CCSS/SECUline), multi-tenant e migração localStorage → backend. Ordem pensada para ser executável.

---

## Onde estás agora

- Frontend completo: simulador, multi-colaborador, histórico, dashboard, PDF/XML.
- Cálculos Luxembourg validados (2024–2026), créditos automáticos, congés/maladie correctos.
- Dados em **localStorage** (Zustand persist); cada browser = um “utilizador” isolado.
- Backend presente mas pouco usado: Express 5, Drizzle, PostgreSQL, schema com tabela `users`.

---

## Visão do que “software de paie” implica (Luxembourg)

1. **Dados no servidor** — empresas, colaboradores, fichas guardadas, não no browser.
2. **Contas e autenticação** — quem entra vê só os seus dados (ou os da empresa que gere).
3. **Multi-tenant** — várias empresas/clientes; isolamento por empresa (tenant).
4. **Conformidade Luxembourg** — declarações CCSS via SECUline (DECSAL mensal, DECAFF entradas/saídas); interpretação do ficheiro **CALCUL.xml** que o CCSS envia mensalmente para conciliação.
5. **Ciclo de paie** — não só simular: fechar período, gerar documentos oficiais, export para declarações.

Fontes: CCSS (ccss.public.lu), Guichet.lu, Apriorit “Build a custom payroll system”, práticas SaaS multi-tenant (shared DB + tenant_id, auth JWT/cookies).

---

## Fase 0 — Preparação (1–2 dias)

| # | Passo | O que fazer |
|---|--------|-------------|
| 0.1 | Definir primeiro “tenant” | Decidir: uma empresa por conta de utilizador, ou um utilizador pode gerir várias empresas? (Recomendação: 1 empresa = 1 tenant; utilizador pode ter acesso a várias empresas com roles.) |
| 0.2 | BD no Railway (ou outro) | Criar instância PostgreSQL; definir `DATABASE_URL` nas variáveis de ambiente do Railway. |
| 0.3 | Documentar modelo actual | Listar exactamente o que o store guarda (company, employees, payslips, period, etc.) para desenhar as tabelas. |

**Entregável:** PostgreSQL acessível, decisão tenant clara, lista de entidades a persistir.

---

## Fase 1 — Backend como fonte de verdade (1–2 semanas)

Objetivo: substituir localStorage por API + BD; o frontend passa a ler/escrever através do backend.

| # | Passo | O que fazer |
|---|--------|-------------|
| 1.1 | Schema da BD | Criar tabelas: `tenants` (empresas), `users` (já existe, estender se necessário), `tenant_users` (qual user acede a qual tenant e com que role), `employees`, `payslips`. Todas as tabelas de dados de negócio com `tenant_id`. |
| 1.2 | API REST (ou GraphQL) | Endpoints: `GET/POST/PUT/DELETE` para company (por tenant), employees (por tenant), payslips (por tenant). Sem auth ainda: pode ser um “token de desenvolvimento” ou assumir um tenant fixo. |
| 1.3 | Migração de dados (opcional) | Endpoint ou script: importar JSON exportado do localStorage (empresa, colaboradores, fichas) para a BD, associando a um tenant. |
| 1.4 | Frontend: chamar API | Trocar leituras/escritas do Zustand persist por chamadas à API (fetch ou cliente HTTP). Manter Zustand para estado de UI (ex.: colaborador seleccionado, período), mas dados “sagrados” vêm da API. |
| 1.5 | Testes | Garantir que criar/editar empresa, colaboradores e guardar ficha persiste na BD e sobrevive a refresh. |

**Entregável:** App utilizável com dados guardados na BD; localStorage deixou de ser a fonte de verdade.

---

## Fase 2 — Autenticação e autorização (c. 1 semana)

| # | Passo | O que fazer |
|---|--------|-------------|
| 2.1 | Registar / Login | Endpoints: `POST /auth/register`, `POST /auth/login`. Hash de password (bcrypt ou Argon2); nunca guardar passwords em claro. |
| 2.2 | Sessão ou JWT | Escolher: sessão (express-session + cookie httpOnly) ou JWT em cookie/httpOnly. Recomendação: cookie httpOnly para refresh token; access token curto no header ou em cookie. |
| 2.3 | Middleware de auth | Em todas as rotas de API que tocam dados: verificar token/sessão; extrair `user_id` (e, se aplicável, lista de `tenant_id` autorizados). |
| 2.4 | Tenant no pedido | Após login, cada pedido deve saber a que tenant se refere (header `X-Tenant-Id` ou tenant escolhido na sessão). O backend filtra sempre por `tenant_id`. |
| 2.5 | Frontend: login/registar | Páginas ou modais de login e registo; após login, guardar token ou confiar em cookie; redireccionar para o simulador; nas chamadas API enviar credenciais (e tenant se necessário). |
| 2.6 | Logout | Endpoint e botão no frontend; invalidar sessão ou token. |

**Entregável:** Apenas utilizadores autenticados acedem à API; dados filtrados por tenant.

---

## Fase 3 — Multi-tenant e roles (c. 1 semana)

| # | Passo | O que fazer |
|---|--------|-------------|
| 3.1 | Modelo de dados tenant | Tabela `tenants` (nome, endereço, TVA, etc. = dados “empresa”). `tenant_users`: user_id, tenant_id, role (ex.: admin, editor, viewer). |
| 3.2 | Onboarding | No registo (ou depois): “Criar empresa” ou “Associar a empresa existente”. Se criar, inserir em `tenants` e em `tenant_users` com role admin. |
| 3.3 | Escolha de empresa | Se o user tiver várias empresas, no header ou no login escolher “Empresa activa”; esse valor vai em todos os pedidos (tenant_id). |
| 3.4 | Isolamento em todas as queries | Garantir que SELECT/INSERT/UPDATE/DELETE de employees e payslips incluem sempre `tenant_id` do utilizador actual. Testes de segurança: user A não pode ver dados do tenant B. |
| 3.5 | Roles (opcional mas útil) | Admin: gere empresa e utilizadores; Editor: edita colaboradores e paie; Viewer: só consulta. Verificar role no backend antes de operações sensíveis. |

**Entregável:** Várias empresas na mesma instalação; cada user vê só os dados dos tenants a que tem acesso.

---

## Fase 4 — Conformidade Luxembourg (SECUline e ficheiros CCSS)

Isto é o que distingue “simulador” de “software de paie” no Luxemburgo.

| # | Passo | O que fazer |
|---|--------|-------------|
| 4.1 | Documentação CCSS | Ler especificações SECUline: DECSAL (declaração mensual de salários), DECAFF (entradas/saídas de colaboradores). Formato: ficheiro texto com campos separados por `;`, nome DECAFF.dta via SOFiE. DECSAL = declaração mensual de remunerações e horas. |
| 4.2 | CALCUL.xml | O CCSS envia mensalmente um ficheiro CALCUL.xml (esquema XSD v1.2) com o detalhe das contribuições e recalculações. O software deve ser capaz de **interpretar** este XML para conciliar o que o empregador calculou com a factura CCSS. Documentação e exemplo: ccss.public.lu (Calcul.xml). |
| 4.3 | Geração de ficheiros para SECUline | Implementar geração de DECSAL (e DECAFF quando há entradas/saídas) a partir dos dados da BD (colaboradores, períodos, brutos, horas). Não é obrigatório enviar via SOFiE no dia 1; pode ser “export para ficheiro” que o cliente envia manualmente, até teres certificação/contrato SOFiE. |
| 4.4 | Fluxo “fechar mês” | Na app: “Fechar período 2026-03” = marcar período como fechado, gerar PDF definitivo, opcionalmente gerar DECSAL e guardar referência ao ficheiro. Evitar editar períodos já fechados (ou com confirmação explícita). |
| 4.5 | SECUline “a sério” (mais tarde) | Para envio electrónico directo: número SECUline com o CCSS, contrato com Worldline (SOFiE), certificado LuxTrust. Isto é fase comercial/legal; o software pode estar pronto a gerar os ficheiros antes disso. |

**Entregável:** App gera ficheiros no formato esperado pelo CCSS; preparação para interpretar CALCUL.xml; conceito de período fechado.

---

## Fase 5 — Produção e operação (contínuo)

| # | Passo | O que fazer |
|---|--------|-------------|
| 5.1 | HTTPS e cookies | Em produção, tudo em HTTPS; cookies com Secure, SameSite. |
| 5.2 | Variáveis de ambiente | `DATABASE_URL`, `SESSION_SECRET` ou `JWT_SECRET`, `NODE_ENV=production`. Nunca commitar segredos. |
| 5.3 | Backups da BD | Backups automáticos da base de dados (Railway ou outro fornecedor). |
| 5.4 | Logs e monitorização | Logs de erros e de acessos sensíveis (login, export); sem guardar passwords. |
| 5.5 | Actualização anual | Cada ano: actualizar parâmetros (index, SSM, CIS, etc.) no motor de cálculo; testar com fichas de referência. |
| 5.6 | Termos e aviso legal | Manter aviso “simulador indicativo” até haver parecer jurídico ou certificação; depois adaptar o texto conforme o uso (ex. “ferramenta de apoio à paie”). |

---

## Ordem recomendada (resumo)

1. **Fase 0** — BD + decisão tenant.  
2. **Fase 1** — API + schema + frontend a usar API em vez de localStorage.  
3. **Fase 2** — Auth (registar, login, middleware, frontend login).  
4. **Fase 3** — Multi-tenant (tenants, tenant_users, isolamento, roles).  
5. **Fase 4** — Ficheiros CCSS (DECSAL, DECAFF, CALCUL.xml) e “fechar mês”.  
6. **Fase 5** — Segurança, backups, operação e evolução anual.

Não é obrigatório fazer Fase 4 antes de ter utilizadores a usar a app; podes lançar com Fases 1–3 e acrescentar DECSAL/CALCUL e “fechar mês” em seguida. O que não deves adiar é o isolamento por tenant (Fase 3) assim que tiveres mais do que um “cliente” na mesma instalação.

---

## Referências úteis

- **CCSS Luxembourg:** [ccss.public.lu](https://ccss.public.lu) — SECUline, DECAFF, Declare wages, CALCUL.xml.  
- **Guichet.lu:** Declaração d’exploitation, déclaration entrée.  
- **Multi-tenant:** Shared database + `tenant_id` em todas as tabelas; validar tenant em cada pedido.  
- **Auth:** Não guardar segredos em localStorage; cookies httpOnly para tokens; hash de passwords.  
- **Payroll SaaS:** MVP = dados de empresa + colaboradores + motor de cálculo + relatórios; depois integrações e conformidade (Apriorit, Salsa, AWS payroll guidance).

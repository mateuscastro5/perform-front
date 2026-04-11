# perform-front

Frontend da plataforma **Perform** — dashboard de performance técnica de desenvolvedores para Tech Leads.

Construído com **React + TypeScript + Vite**. Interface inspirada em dashboards de eSports com tema dark, animações fluidas e dados em tempo real do GitHub + IA.

---

## O que mostra

- **Dashboard principal** — atividade recente, PRs, commits, top reviewers
- **Squads** — times com métricas agregadas e performance individual
- **Perfil do desenvolvedor** — página completa com:
  - Stats: commits, PRs, reviews, merges
  - **AI Performance Insights** (scores reais de IA): pontos fortes, áreas de melhoria, tendência de complexidade
  - Score rings: complexidade média, confiança da IA, volume analisado
  - Botão **"Analyze code"** — dispara análise de até 20 PRs e atualiza os insights instantaneamente
  - Lista de PRs com filtros por status e busca

---

## Tecnologias

- **React 19** + TypeScript
- **Vite** — build tool
- **Tailwind CSS** — estilização
- **shadcn/ui** — componentes base
- **Framer Motion** — animações
- **Lucide React** — ícones
- **Zustand** — gerenciamento de estado global (UI)

---

## Pré-requisitos

- Node.js 20+
- `perform-api` rodando em `http://localhost:3000`

---

## Setup

```bash
npm install
npm run dev
```

Frontend disponível em `http://localhost:5123`

---

## Variáveis de ambiente

O frontend conecta direto à API em `http://localhost:3000` por padrão. Para alterar:

```env
VITE_API_URL=http://localhost:3000
```

---

## Estrutura

```
src/ui/
├── pages/
│   ├── Login.tsx              # Autenticação
│   ├── Dashboard.tsx          # Visão geral
│   ├── Squads.tsx             # Lista de squads
│   └── DeveloperProfile.tsx   # Perfil detalhado + AI insights + botão Analyze code
├── components/
│   ├── DashboardHeader.tsx    # Header com nav e sidebar
│   ├── ActivityFeed.tsx       # Feed de atividades em tempo real
│   ├── PRList.tsx             # Lista de PRs
│   └── ui/                   # Componentes base (shadcn)
├── contexts/
│   ├── AuthContext.tsx        # JWT, login/logout
│   └── DashboardContext.tsx   # Dados globais (squads, devs)
├── services/
│   └── api.service.ts         # Todas as chamadas à perform-api
├── stores/
│   └── uiStore.ts             # Estado da UI (sidebar, tema)
└── types/
    ├── analysis.types.ts      # PrAnalysis, DeveloperEvolution
    ├── dashboard.types.ts     # PullRequest, PRStatus
    └── github.types.ts        # GithubDeveloper, GithubRepository
```

---

## Fluxo dos AI Insights

1. Ao abrir o perfil de um desenvolvedor, o frontend busca automaticamente:
   - `GET /ai-analysis/developer/:id` — análises já realizadas
   - `GET /ai-analysis/developer/:id/evolution` — tendência temporal
2. Os dados alimentam os **Score Rings** e o card de **AI Performance Insights**
3. O botão **"Analyze code"** chama `POST /ai-analysis/trigger-batch` com os UUIDs das PRs
4. Enquanto processa, exibe spinner + label "Analyzing…"
5. Ao terminar, recarrega os insights atualizados

### O que os insights mostram

| Campo | Descrição |
|-------|-----------|
| **Summary** | Resumo narrativo gerado a partir dos dados reais de análise |
| **Strengths** | Pontos fortes detectados (consistência, foco em features, cobertura de testes, etc.) |
| **Areas for Growth** | Pontos de melhoria (PRs grandes, baixa confiança da IA, falta de testes) |
| **Complexity** | Score médio de complexidade das PRs analisadas (0-100) |
| **Confidence** | Confiança média da IA nas análises (0-100%) |
| **Volume** | Score proporcional ao número de PRs analisadas |
| **Trend** | Improving / Stable / Declining — tendência temporal da complexidade |

---

## Build

```bash
npm run build
```

Output em `dist/`.

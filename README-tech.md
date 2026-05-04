# perform-front — Referência Técnica

Detalhes de implementação, decisões de arquitetura e padrões usados no frontend.

---

## Stack

| Lib | Versão | Uso |
|-----|--------|-----|
| React | 19 | UI |
| TypeScript | 5 | Tipagem |
| Vite | 6 | Dev server + build |
| Tailwind CSS | 4 | Estilização utility-first |
| shadcn/ui | latest | Componentes base acessíveis |
| Framer Motion | 11 | Animações declarativas |
| Lucide React | latest | Ícones SVG |
| Zustand | 5 | Estado global da UI |
| React Router | 6 | Roteamento SPA |

---

## Padrões de estado

- **AuthContext** — token JWT, dados do usuário logado, login/logout
- **DashboardContext** — dados compartilhados entre páginas (squads, developers, repositórios)
- **Zustand `uiStore`** — estado da UI: sidebar collapsed/expanded, tema
- **useState local** — estado de página: filtros, busca, loading, dados específicos

---

## API Service

Todas as chamadas HTTP passam por `src/ui/services/api.service.ts`. Cada método:
- Recebe `token: string` como primeiro argumento
- Usa `getAuthHeaders(token)` para montar o header `Authorization: Bearer`
- Lança erro com mensagem do servidor em caso de falha (`handleResponse`)

Métodos de análise de IA:

```typescript
// Analisar uma PR específica
triggerPrAnalysis(token, prId): Promise<PrAnalysis>

// Analisar lote de até 20 PRs
triggerBatchAnalysis(token, prIds): Promise<BatchAnalysisResult[]>

// Buscar análises de um desenvolvedor
getDeveloperAnalyses(token, developerId, limit): Promise<PrAnalysis[]>

// Buscar evolução temporal
getDeveloperEvolution(token, developerId, days): Promise<DeveloperEvolution>
```

---

## Tipos principais

```typescript
// src/ui/types/analysis.types.ts
interface PrAnalysis {
  id: string;
  githubPullRequestId: string;
  complexityScore: number;       // 0-100
  confidence: number;            // 0.0-1.0
  difficultyLabel: string;       // trivial | easy | medium | hard | expert
  changeType: string;            // bugfix | feature | refactor | config | docs | test
  technologies: string;          // JSON string []
  justification: string;
  technicalSummary: string;
  analysisStatus: string;        // completed | failed | doubtful
  developerId: string | null;
  createdAt: string;
}

interface DeveloperEvolution {
  developerId: string;
  trend: 'improving' | 'stable' | 'declining';
  periods: Array<{
    start: string;
    end: string;
    avgScore: number;
    prCount: number;
  }>;
  avgComplexity: number;
  avgConfidence: number;
  totalAnalyses: number;
}
```

---

## DeveloperProfile — AI Insights

A função `deriveInsights(analyses, trend)` transforma dados brutos de análise em insights legíveis:

1. Calcula `avgComplexity` e `avgConfidence` das análises
2. Identifica o tipo de mudança mais frequente (`topType`)
3. Extrai tecnologias únicas across todas as análises
4. Gera `summary` narrativo com os dados reais
5. Infere `strengths` e `areasForImprovement` baseado em limiares:
   - Confiança ≥ 75% → "Código consistente e previsível"
   - Sem PRs de teste → "Adicionar cobertura de testes"
   - Trend improving → "Tomando tarefas progressivamente mais complexas"
   - etc.

---

## Convenções de código

- Componentes: `PascalCase`, um por arquivo
- Hooks: `use` prefix, extraídos quando reutilizáveis
- Types/interfaces: colocation com o componente ou em `types/`
- Sem prop drilling além de 2 níveis — usar Context ou store
- Animações: sempre com `motion.div` + `initial/animate/transition` explícitos
- Tailwind: mobile-first, variantes `dark:` via classe `dark` no `html`

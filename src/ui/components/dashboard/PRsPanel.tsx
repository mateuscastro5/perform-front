import { useState } from 'react';
import PRCard, { PRStatus } from './PRCard';

interface PRData {
  id: number;
  title: string;
  author: {
    name: string;
    avatar?: string;
  };
  status: PRStatus;
  createdAt: string;
  branch: string;
  additions: number;
  deletions: number;
  reviewers: Array<{
    name: string;
    avatar?: string;
    status: 'approved' | 'pending' | 'changes_requested';
  }>;
}

const PRsPanel = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Mock data - simulating 20 PRs
  const mockPRs: PRData[] = [
    {
      id: 1847,
      title: "feat: implement real-time metrics system for dashboards",
      author: { name: "mateusCastro" },
      status: "merged",
      createdAt: "2h ago",
      branch: "feature/real-time-metrics",
      additions: 234,
      deletions: 12,
      reviewers: [
        { name: "João Silva", status: "approved" },
        { name: "Maria Santos", status: "approved" }
      ]
    },
    {
      id: 1846,
      title: "fix: resolve rendering bug in performance charts",
      author: { name: "pedroAlves" },
      status: "approved",
      createdAt: "4h ago",
      branch: "bugfix/chart-rendering",
      additions: 67,
      deletions: 23,
      reviewers: [
        { name: "Ana Costa", status: "approved" },
        { name: "Carlos Lima", status: "pending" }
      ]
    },
    {
      id: 1845,
      title: "refactor: improve dashboard components structure",
      author: { name: "anaRocha" },
      status: "review_requested",
      createdAt: "6h ago",
      branch: "refactor/dashboard-components",
      additions: 156,
      deletions: 89,
      reviewers: [
        { name: "Bruno Tech", status: "pending" },
        { name: "Luana Dev", status: "pending" }
      ]
    },
    {
      id: 1844,
      title: "feat: add OAuth2 and JWT authentication",
      author: { name: "carlosOliveira" },
      status: "changes_requested",
      createdAt: "8h ago",
      branch: "feature/oauth-authentication",
      additions: 445,
      deletions: 78,
      reviewers: [
        { name: "Senior Dev", status: "changes_requested" },
        { name: "Tech Lead", status: "changes_requested" }
      ]
    },
    {
      id: 1843,
      title: "docs: update integration API documentation",
      author: { name: "lucasSantos" },
      status: "draft",
      createdAt: "1d ago",
      branch: "docs/api-integration",
      additions: 23,
      deletions: 5,
      reviewers: []
    },
    {
      id: 1842,
      title: "test: add unit tests for metrics services",
      author: { name: "mariaFernanda" },
      status: "review_requested",
      createdAt: "1d ago",
      branch: "test/metrics-services",
      additions: 189,
      deletions: 12,
      reviewers: [
        { name: "QA Lead", status: "pending" }
      ]
    },
    {
      id: 1841,
      title: "feat: implement Redis cache for query optimization",
      author: { name: "rafaelCosta" },
      status: "merged",
      createdAt: "2d ago",
      branch: "feature/redis-cache",
      additions: 312,
      deletions: 45,
      reviewers: [
        { name: "Backend Lead", status: "approved" },
        { name: "DevOps", status: "approved" }
      ]
    },
    {
      id: 1840,
      title: "fix: resolve memory leak in processing worker",
      author: { name: "guilhermeRibeiro" },
      status: "approved",
      createdAt: "2d ago",
      branch: "bugfix/memory-leak-worker",
      additions: 78,
      deletions: 134,
      reviewers: [
        { name: "Senior Backend", status: "approved" }
      ]
    }
  ];

  // Duplicate data to simulate 20 PRs
  const allPRs = [...mockPRs, ...mockPRs.map(pr => ({ 
    ...pr, 
    id: pr.id + 1000,
    createdAt: `${Math.floor(Math.random() * 7) + 1}d ago`
  }))];

  const totalPages = Math.ceil(allPRs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPRs = allPRs.slice(startIndex, startIndex + itemsPerPage);

  const handlePRClick = (pr: PRData) => {
    console.log('PR clicked:', pr);
    // TODO: Open modal or navigate to PR details
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white">Recent Pull Requests</h2>
        </div>
        
        <div className="text-sm text-gray-400">
          {allPRs.length} total PRs
        </div>
      </div>

      {/* Grid de PRs */}
      <div className="space-y-3 mb-6">
        {currentPRs.map((pr) => (
          <PRCard
            key={pr.id}
            {...pr}
            onClick={() => handlePRClick(pr)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-700/30">
        <div className="text-sm text-gray-400">
          Page {currentPage} of {totalPages} • {currentPRs.length} of {allPRs.length} PRs
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev: number) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 text-sm rounded-md transition-colors ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage((prev: number) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default PRsPanel;

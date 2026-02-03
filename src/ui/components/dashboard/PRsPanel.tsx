import { useState } from 'react';
import PRCard, { PRStatus } from './PRCard';
import type { PullRequest } from '../../types/dashboard.types';

interface PRsPanelProps {
  pullRequests?: PullRequest[];
}

const PRsPanel = ({ pullRequests = [] }: PRsPanelProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const totalPages = Math.ceil(pullRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPRs = pullRequests.slice(startIndex, startIndex + itemsPerPage);

  const handlePRClick = (pr: PullRequest) => {
    console.log('PR clicked:', pr);
  };

  if (pullRequests.length === 0) {
    return (
      <div className="card h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <span className="text-purple-400 text-sm">📋</span>
            </div>
            <h2 className="text-xl font-semibold text-white">Recent Pull Requests</h2>
          </div>
        </div>
        <div className="text-center py-12 text-alpha-text-muted">
          <p>No pull requests available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <span className="text-purple-400 text-sm">📋</span>
          </div>
          <h2 className="text-xl font-semibold text-white">Recent Pull Requests</h2>
        </div>
        <span className="text-gray-400 text-sm">{pullRequests.length} total PRs</span>
      </div>

      <div className="space-y-3 mb-6">
        {currentPRs.map((pr) => (
          <PRCard
            key={pr.id}
            id={pr.id}
            title={pr.title}
            author={{ name: pr.author.name }}
            status={pr.status as PRStatus}
            createdAt={pr.createdAt}
            branch={pr.branch}
            additions={pr.additions}
            deletions={pr.deletions}
            reviewers={pr.reviewers.map(r => ({
              name: r.name,
              status: r.status
            }))}
            onClick={() => handlePRClick(pr)}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-700/30">
          <button
            onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm text-blue-400 hover:text-blue-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  page === currentPage
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm text-blue-400 hover:text-blue-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default PRsPanel;

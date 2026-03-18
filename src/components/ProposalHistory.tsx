import { useEffect, useState } from 'react';
import { GoalCategory, ProposalHistory } from '../types';
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  STORAGE_KEYS,
} from '../utils/localStorage';

const CATEGORY_LABELS: Record<GoalCategory, string> = {
  challenge: 'チャレンジ目標',
  business: '業務目標',
  personal: '個人目標',
};

const DIFFICULTY_INFO: Record<string, { label: string; color: string }> = {
  basic: { label: '基礎', color: 'bg-green-100 text-green-800 border-green-200' },
  intermediate: { label: '標準', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  advanced: { label: '挑戦', color: 'bg-purple-100 text-purple-800 border-purple-200' },
};

function ProposalHistoryComponent() {
  const [histories, setHistories] = useState<ProposalHistory[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadFromLocalStorage<ProposalHistory[]>(
      STORAGE_KEYS.PROPOSAL_HISTORIES
    );
    setHistories(stored || []);
  }, []);

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDeleteHistory = (id: string) => {
    if (!confirm('この提案履歴を削除しますか？')) {
      return;
    }

    const updated = histories.filter((history) => history.id !== id);
    setHistories(updated);
    saveToLocalStorage(STORAGE_KEYS.PROPOSAL_HISTORIES, updated);
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (histories.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">提案履歴</h2>
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🗂️</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            提案履歴はまだありません
          </h3>
          <p className="text-gray-600">
            「目標作成」ページで AI 提案を生成すると、ここに履歴が保存されます。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">提案履歴</h2>
        <p className="text-gray-600">
          過去に AI が生成した目標提案を確認できます。全 {histories.length} 件です。
        </p>
      </div>

      <div className="space-y-4">
        {histories.map((history) => {
          const isExpanded = expandedId === history.id;
          return (
            <div key={history.id} className="card">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => handleToggleExpand(history.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-bold text-white bg-primary-600">
                      {CATEGORY_LABELS[history.category]}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatDateTime(history.timestamp)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 space-x-4">
                    <span>資格等級: {history.userProfile.qualificationGrade}</span>
                    <span>役割等級: {history.userProfile.roleGrade}</span>
                    <span>提案数: {history.proposals.length}件</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDeleteHistory(history.id);
                    }}
                    className="px-3 py-1 text-sm text-danger-600 hover:bg-danger-50 rounded transition-colors"
                  >
                    削除
                  </button>
                  <svg
                    className={`w-6 h-6 text-gray-400 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="mb-4 p-3 bg-gray-50 rounded">
                    <div className="text-xs font-medium text-gray-700 mb-1">
                      提案生成時の業務内容
                    </div>
                    <div className="text-sm text-gray-900">
                      {history.userProfile.jobDescription || '未設定'}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {history.proposals.map((proposal, index) => {
                      const difficultyInfo = DIFFICULTY_INFO[proposal.difficulty];
                      return (
                        <div
                          key={proposal.id}
                          className="p-4 border border-gray-200 rounded-lg bg-white"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-500">
                                #{index + 1}
                              </span>
                              <h4 className="font-bold text-gray-900">
                                {proposal.title}
                              </h4>
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${difficultyInfo.color}`}
                              >
                                {difficultyInfo.label}
                              </span>
                            </div>
                          </div>

                          <p className="text-sm text-gray-700 mb-3">
                            {proposal.description}
                          </p>

                          <div className="bg-gray-50 p-3 rounded text-xs space-y-1 mb-2">
                            <p>
                              <span className="font-medium">100%達成基準:</span>{' '}
                              {proposal.criteria100}
                            </p>
                            <p>
                              <span className="font-medium">110%達成基準:</span>{' '}
                              {proposal.criteria110}
                            </p>
                            <p>
                              <span className="font-medium">期限:</span>{' '}
                              {proposal.deadline}
                            </p>
                          </div>

                          <div className="p-2 bg-blue-50 border-l-4 border-blue-400 text-xs">
                            <span className="font-medium text-blue-900">
                              AI の提案理由:
                            </span>
                            <p className="text-blue-800 mt-1">{proposal.reason}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProposalHistoryComponent;

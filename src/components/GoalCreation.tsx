import { useState } from 'react';
import { UserProfile, GoalCategory, GoalProposal } from '../types';
import { generateGoalProposals } from '../utils/openai';
import { getQualificationGrade } from '../data/gradeMaster';
import ChallengeGoalChat from './ChallengeGoalChat';
import BusinessGoalChat from './BusinessGoalChat';

interface GoalCreationProps {
  userProfile: UserProfile;
}

const CATEGORY_INFO: Record<GoalCategory, { label: string; description: string; color: string }> = {
  challenge: {
    label: '挑戦目標',
    description: '新たな価値創出、個人・組織の成長に繋がる目標',
    color: 'from-purple-500 to-purple-600',
  },
  business: {
    label: '業務目標',
    description: '担当業務の品質・効率向上、成果達成に関する目標',
    color: 'from-blue-500 to-blue-600',
  },
  personal: {
    label: '人財目標',
    description: 'スキル習得、チームワーク、人材育成に関する目標',
    color: 'from-green-500 to-green-600',
  },
};

const DIFFICULTY_INFO: Record<string, { label: string; color: string }> = {
  basic: { label: '基礎', color: 'bg-green-100 text-green-800 border-green-200' },
  intermediate: { label: '標準', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  advanced: { label: '挑戦的', color: 'bg-purple-100 text-purple-800 border-purple-200' },
};

function GoalCreation({ userProfile }: GoalCreationProps) {
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory>('business');
  const [proposals, setProposals] = useState<GoalProposal[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<GoalProposal | null>(null);
  const [showChatDialog, setShowChatDialog] = useState<'challenge' | 'business' | null>(null);

  // 手動入力用のステート
  const [manualTitle, setManualTitle] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [manualCriteria100, setManualCriteria100] = useState('');
  const [manualCriteria110, setManualCriteria110] = useState('');
  const [manualDeadline, setManualDeadline] = useState('');

  const gradeInfo = getQualificationGrade(userProfile.currentQualificationGrade);

  // AI目標提案を生成
  const handleGenerateProposals = async () => {
    if (!userProfile.jobDescription) {
      setError('仕事内容が設定されていません。プロフィール設定から仕事内容を入力してください。');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProposals([]);

    try {
      const generatedProposals = await generateGoalProposals(selectedCategory, userProfile);
      setProposals(generatedProposals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI提案の生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  // 提案を選択してフォームに反映
  const handleSelectProposal = (proposal: GoalProposal) => {
    setSelectedProposal(proposal);
    setManualTitle(proposal.title);
    setManualDescription(proposal.description);
    setManualCriteria100(proposal.criteria100);
    setManualCriteria110(proposal.criteria110);
    setManualDeadline(proposal.deadline);
  };

  // 目標を保存
  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 実際の保存処理を実装
    alert('目標保存機能は今後実装予定です');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">目標作成</h2>
        <p className="text-gray-600">
          AI提案機能を使って、あなたの等級とスキルに合った目標を作成しましょう。
        </p>
      </div>

      {/* ユーザー情報カード */}
      <div className="card mb-6 bg-primary-50 border-2 border-primary-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-primary-600 mb-1">現在の等級</div>
            <div className="text-2xl font-bold text-primary-900">
              {gradeInfo?.name} <span className="text-lg font-normal">レベル {gradeInfo?.level}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-primary-600 mb-1">仕事内容</div>
            <div className="text-sm text-primary-800">
              {userProfile.jobDescription ? (
                <span className="inline-flex items-center text-green-700">
                  ✓ 設定済み（AI提案利用可能）
                </span>
              ) : (
                <span className="inline-flex items-center text-orange-700">
                  ⚠ 未設定（プロフィール設定から入力してください）
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左側: AI提案セクション */}
        <div className="lg:col-span-2 space-y-6">
          {/* カテゴリ選択 */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">1. 目標カテゴリを選択</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(Object.keys(CATEGORY_INFO) as GoalCategory[]).map((category) => {
                const info = CATEGORY_INFO[category];
                const isSelected = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r ${info.color} mb-2`}>
                      {info.label}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{info.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI提案生成 */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">2. AIに目標を提案してもらう</h3>

            {selectedCategory === 'challenge' && (
              <div className="mb-4 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-purple-600 text-2xl">💬</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-purple-900 mb-1">挑戦目標は対話形式がおすすめ！</h4>
                    <p className="text-sm text-purple-800 mb-3">
                      対話を通じて、あなたの状況や希望を深く理解し、段階的に最適な目標を一緒に作成します。
                    </p>
                    <button
                      onClick={() => setShowChatDialog('challenge')}
                      className="btn bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      AI対話で挑戦目標を作成
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedCategory === 'business' && (
              <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-blue-600 text-2xl">💬</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-blue-900 mb-1">業務目標は対話形式で詳細化！</h4>
                    <p className="text-sm text-blue-800 mb-3">
                      段階的な質問（最大9個）で不明点を解消し、組織目標に貢献する測定可能な目標を一緒に作成します。
                    </p>
                    <button
                      onClick={() => setShowChatDialog('business')}
                      className="btn bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      AI対話で業務目標を作成
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={handleGenerateProposals}
                disabled={isGenerating || !userProfile.jobDescription}
                className="btn btn-primary w-full md:w-auto"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    AI提案を生成中...
                  </span>
                ) : (
                  `${CATEGORY_INFO[selectedCategory].label}のAI提案を生成`
                )}
              </button>
              {(selectedCategory === 'challenge' || selectedCategory === 'business') && (
                <span className="text-sm text-gray-500">
                  （または上記の対話形式をお試しください）
                </span>
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 bg-danger-50 border border-danger-200 rounded-lg">
                <p className="text-sm text-danger-700">{error}</p>
              </div>
            )}
          </div>

          {/* AI提案リスト */}
          {proposals.length > 0 && (
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">3. 提案から選択（または参考にして手動入力）</h3>
              <div className="space-y-4">
                {proposals.map((proposal) => {
                  const difficultyInfo = DIFFICULTY_INFO[proposal.difficulty];
                  const isSelected = selectedProposal?.id === proposal.id;
                  return (
                    <div
                      key={proposal.id}
                      className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      onClick={() => handleSelectProposal(proposal)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-gray-900">{proposal.title}</h4>
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${difficultyInfo.color}`}>
                              {difficultyInfo.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{proposal.description}</p>
                          <div className="bg-gray-50 p-3 rounded text-xs space-y-1">
                            <p><span className="font-medium">達成基準(100%):</span> {proposal.criteria100}</p>
                            <p><span className="font-medium">達成基準(110%):</span> {proposal.criteria110}</p>
                            <p><span className="font-medium">推奨期限:</span> {proposal.deadline}</p>
                          </div>
                          <div className="mt-2 p-2 bg-blue-50 border-l-4 border-blue-400 text-xs">
                            <span className="font-medium text-blue-900">AI推薦理由:</span>
                            <p className="text-blue-800 mt-1">{proposal.reason}</p>
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-primary-200">
                          <p className="text-sm text-primary-700 font-medium">
                            ✓ 選択中 - 右側のフォームに反映されています
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 右側: 目標入力フォーム */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">目標詳細</h3>
            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  目標タイトル <span className="text-danger-600">*</span>
                </label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="input"
                  placeholder="目標のタイトル"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  目標説明 <span className="text-danger-600">*</span>
                </label>
                <textarea
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                  className="input"
                  rows={3}
                  placeholder="目標の詳細説明"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  達成基準(100%) <span className="text-danger-600">*</span>
                </label>
                <textarea
                  value={manualCriteria100}
                  onChange={(e) => setManualCriteria100(e.target.value)}
                  className="input"
                  rows={2}
                  placeholder="100%達成の具体的な基準"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  達成基準(110%)
                </label>
                <textarea
                  value={manualCriteria110}
                  onChange={(e) => setManualCriteria110(e.target.value)}
                  className="input"
                  rows={2}
                  placeholder="110%達成の具体的な基準（任意）"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  期限 <span className="text-danger-600">*</span>
                </label>
                <input
                  type="date"
                  value={manualDeadline}
                  onChange={(e) => setManualDeadline(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div className="pt-4">
                <button type="submit" className="btn btn-primary w-full">
                  目標を保存
                </button>
              </div>
            </form>

            {selectedProposal && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-800">
                  ✓ AI提案「{selectedProposal.title}」を反映中
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 対話型チャットダイアログ */}
      {showChatDialog === 'challenge' && (
        <ChallengeGoalChat
          userProfile={userProfile}
          onClose={() => setShowChatDialog(null)}
        />
      )}
      {showChatDialog === 'business' && (
        <BusinessGoalChat
          userProfile={userProfile}
          onClose={() => setShowChatDialog(null)}
        />
      )}
    </div>
  );
}

export default GoalCreation;

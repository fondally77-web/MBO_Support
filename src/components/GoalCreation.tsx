import { FormEvent, useState } from 'react';
import {
  GoalCategory,
  GoalProposal,
  Objective,
  ProposalHistory,
  UserProfile,
} from '../types';
import { getQualificationGrade } from '../data/gradeMaster';
import { generateId, generateKeyResultId, generateObjectiveId } from '../utils/idGenerator';
import { loadFromLocalStorage, saveToLocalStorage, STORAGE_KEYS } from '../utils/localStorage';
import { generateGoalProposals } from '../utils/openai';
import BusinessGoalChat from './BusinessGoalChat';
import ChallengeGoalChat from './ChallengeGoalChat';
import PersonalGoalChat from './PersonalGoalChat';

interface GoalCreationProps {
  userProfile: UserProfile;
}

const CATEGORY_INFO: Record<
  GoalCategory,
  { label: string; description: string; color: string }
> = {
  challenge: {
    label: 'チャレンジ目標',
    description: '新しい役割や一段上の期待に向けた挑戦的な目標です。',
    color: 'from-purple-500 to-purple-600',
  },
  business: {
    label: '業務目標',
    description: '現在の担当業務で成果を出すための基本となる目標です。',
    color: 'from-blue-500 to-blue-600',
  },
  personal: {
    label: '個人目標',
    description: 'スキル習得や行動改善など、自分の成長に関する目標です。',
    color: 'from-green-500 to-green-600',
  },
};

const DIFFICULTY_INFO: Record<string, { label: string; color: string }> = {
  basic: { label: '基礎', color: 'bg-green-100 text-green-800 border-green-200' },
  intermediate: { label: '標準', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  advanced: { label: '挑戦', color: 'bg-purple-100 text-purple-800 border-purple-200' },
};

function GoalCreation({ userProfile }: GoalCreationProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<GoalCategory>('business');
  const [proposals, setProposals] = useState<GoalProposal[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [selectedProposal, setSelectedProposal] =
    useState<GoalProposal | null>(null);
  const [showChatDialog, setShowChatDialog] = useState<
    'challenge' | 'business' | 'personal' | null
  >(null);

  const [manualTitle, setManualTitle] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [manualCriteria100, setManualCriteria100] = useState('');
  const [manualCriteria110, setManualCriteria110] = useState('');
  const [manualDeadline, setManualDeadline] = useState('');

  const gradeInfo = getQualificationGrade(userProfile.currentQualificationGrade);

  const resetManualForm = () => {
    setManualTitle('');
    setManualDescription('');
    setManualCriteria100('');
    setManualCriteria110('');
    setManualDeadline('');
    setSelectedProposal(null);
  };

  const saveProposalHistory = (generatedProposals: GoalProposal[]) => {
    const histories =
      loadFromLocalStorage<ProposalHistory[]>(STORAGE_KEYS.PROPOSAL_HISTORIES) ||
      [];

    const history: ProposalHistory = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      category: selectedCategory,
      proposals: generatedProposals,
      userProfile: {
        qualificationGrade: userProfile.currentQualificationGrade,
        roleGrade: userProfile.currentRoleGrade,
        jobDescription: userProfile.jobDescription || '',
      },
    };

    saveToLocalStorage(STORAGE_KEYS.PROPOSAL_HISTORIES, [history, ...histories]);
  };

  const handleGenerateProposals = async () => {
    if (!userProfile.jobDescription?.trim()) {
      setError('プロフィールに業務内容を設定してから提案を生成してください。');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSaveMessage(null);
    setProposals([]);

    try {
      const generatedProposals = await generateGoalProposals(
        selectedCategory,
        userProfile
      );
      setProposals(generatedProposals);
      saveProposalHistory(generatedProposals);
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : 'AI 提案の生成に失敗しました。'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectProposal = (proposal: GoalProposal) => {
    setSaveMessage(null);
    setSelectedProposal(proposal);
    setManualTitle(proposal.title);
    setManualDescription(proposal.description);
    setManualCriteria100(proposal.criteria100);
    setManualCriteria110(proposal.criteria110);
    setManualDeadline(proposal.deadline);
  };

  const handleSaveGoal = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSaveMessage(null);

    if (
      !manualTitle.trim() ||
      !manualDescription.trim() ||
      !manualCriteria100.trim() ||
      !manualDeadline
    ) {
      setError('目標の必須項目を入力してください。');
      return;
    }

    try {
      const now = new Date();
      const objectives =
        loadFromLocalStorage<Objective[]>(STORAGE_KEYS.OBJECTIVES) || [];

      const objective: Objective = {
        id: generateObjectiveId(),
        title: manualTitle.trim(),
        description: manualDescription.trim(),
        status: 'active',
        priority:
          selectedProposal?.difficulty === 'advanced'
            ? 'high'
            : selectedProposal?.difficulty === 'basic'
            ? 'low'
            : 'medium',
        period: {
          startDate: now,
          endDate: new Date(manualDeadline),
        },
        weight: 100,
        keyResults: [
          {
            id: generateKeyResultId(),
            title: '100%達成基準',
            description: manualCriteria100.trim(),
            targetValue: manualCriteria100.trim(),
            progress: 0,
            isCompleted: false,
            createdAt: now,
            updatedAt: now,
          },
          ...(manualCriteria110.trim()
            ? [
                {
                  id: generateKeyResultId(),
                  title: '110%達成基準',
                  description: manualCriteria110.trim(),
                  targetValue: manualCriteria110.trim(),
                  progress: 0,
                  isCompleted: false,
                  createdAt: now,
                  updatedAt: now,
                },
              ]
            : []),
        ],
        createdAt: now,
        updatedAt: now,
      };

      saveToLocalStorage(STORAGE_KEYS.OBJECTIVES, [objective, ...objectives]);
      resetManualForm();
      setSaveMessage('目標を保存しました。');
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : '目標の保存に失敗しました。'
      );
    }
  };

  const openChatForCategory = () => {
    setShowChatDialog(selectedCategory);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">目標作成</h2>
        <p className="text-gray-600">
          AI 提案と手動編集を組み合わせて、MBO 目標を作成します。
        </p>
      </div>

      <div className="card mb-6 bg-primary-50 border-2 border-primary-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm text-primary-600 mb-1">現在の資格等級</div>
            <div className="text-2xl font-bold text-primary-900">
              {gradeInfo?.name || userProfile.currentQualificationGrade}
              <span className="text-lg font-normal ml-2">
                レベル {gradeInfo?.level ?? '-'}
              </span>
            </div>
          </div>
          <div className="text-sm text-primary-900">
            <div className="font-medium mb-1">業務内容</div>
            <div>{userProfile.jobDescription || '未設定'}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              1. 目標カテゴリを選ぶ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(Object.keys(CATEGORY_INFO) as GoalCategory[]).map((category) => {
                const info = CATEGORY_INFO[category];
                const isSelected = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r ${info.color} mb-2`}
                    >
                      {info.label}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {info.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  2. AI 提案を生成する
                </h3>
                <p className="text-sm text-gray-600">
                  生成された提案は履歴にも保存されます。
                </p>
              </div>
              <button
                type="button"
                onClick={openChatForCategory}
                className="btn btn-secondary"
              >
                AI に相談する
              </button>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={handleGenerateProposals}
                disabled={isGenerating}
                className="btn btn-primary w-full md:w-auto"
              >
                {isGenerating
                  ? 'AI 提案を生成中...'
                  : `${CATEGORY_INFO[selectedCategory].label}の AI 提案を生成`}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-danger-50 border border-danger-200 rounded-lg">
                <p className="text-sm text-danger-700">{error}</p>
              </div>
            )}

            {saveMessage && (
              <div className="mt-4 p-4 bg-success-50 border border-success-200 rounded-lg">
                <p className="text-sm text-success-700">{saveMessage}</p>
              </div>
            )}
          </div>

          {proposals.length > 0 && (
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                3. 提案を選ぶ
              </h3>
              <div className="space-y-4">
                {proposals.map((proposal) => {
                  const difficultyInfo =
                    DIFFICULTY_INFO[proposal.difficulty] ||
                    DIFFICULTY_INFO.intermediate;
                  const isSelected = selectedProposal?.id === proposal.id;

                  return (
                    <button
                      key={proposal.id}
                      type="button"
                      onClick={() => handleSelectProposal(proposal)}
                      className={`w-full p-4 border-2 rounded-lg transition-all text-left ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-gray-900">
                          {proposal.title}
                        </h4>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${difficultyInfo.color}`}
                        >
                          {difficultyInfo.label}
                        </span>
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
                      <div className="mt-2 p-2 bg-blue-50 border-l-4 border-blue-400 text-xs">
                        <span className="font-medium text-blue-900">
                          AI の提案理由:
                        </span>
                        <p className="text-blue-800 mt-1">{proposal.reason}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

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
                  onChange={(event) => setManualTitle(event.target.value)}
                  className="input"
                  placeholder="目標タイトル"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  目標説明 <span className="text-danger-600">*</span>
                </label>
                <textarea
                  value={manualDescription}
                  onChange={(event) => setManualDescription(event.target.value)}
                  className="input"
                  rows={3}
                  placeholder="目標の説明"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  100%達成基準 <span className="text-danger-600">*</span>
                </label>
                <textarea
                  value={manualCriteria100}
                  onChange={(event) => setManualCriteria100(event.target.value)}
                  className="input"
                  rows={2}
                  placeholder="最低限達成したい基準"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  110%達成基準
                </label>
                <textarea
                  value={manualCriteria110}
                  onChange={(event) => setManualCriteria110(event.target.value)}
                  className="input"
                  rows={2}
                  placeholder="上振れ目標があれば入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  期限 <span className="text-danger-600">*</span>
                </label>
                <input
                  type="date"
                  value={manualDeadline}
                  onChange={(event) => setManualDeadline(event.target.value)}
                  className="input"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn btn-primary flex-1">
                  目標を保存
                </button>
                <button
                  type="button"
                  onClick={resetManualForm}
                  className="btn btn-secondary"
                >
                  クリア
                </button>
              </div>
            </form>

            {selectedProposal && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-800">
                  AI 提案「{selectedProposal.title}」をフォームに反映しています。
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

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
      {showChatDialog === 'personal' && (
        <PersonalGoalChat
          userProfile={userProfile}
          onClose={() => setShowChatDialog(null)}
        />
      )}
    </div>
  );
}

export default GoalCreation;

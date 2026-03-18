import { useState } from 'react';
import { UserProfile } from '../types';
import { getQualificationGrade } from '../data/gradeMaster';
import {
  ObjectiveAnalysisRequest,
  ObjectiveAnalysisResult,
  analyzeObjective,
  getOpenAIKey,
} from '../utils/openai';

interface ObjectiveAnalyzerProps {
  userProfile: UserProfile;
}

const CATEGORIES = [
  '業務遂行',
  '業務改善',
  '人材育成',
  'スキル習得',
  'その他',
];

function ObjectiveAnalyzer({ userProfile }: ObjectiveAnalyzerProps) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [criteria100, setCriteria100] = useState('');
  const [criteria110, setCriteria110] = useState('');
  const [analysisResult, setAnalysisResult] = useState<ObjectiveAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gradeInfo = getQualificationGrade(userProfile.currentQualificationGrade);
  const hasApiKey = !!getOpenAIKey();

  const handleAnalyze = async () => {
    if (!title.trim() || !description.trim() || !criteria100.trim()) {
      setError('タイトル、説明、達成基準(100%)は必須項目です');
      return;
    }

    if (!hasApiKey) {
      setError('OpenAI APIキーが設定されていません。設定画面でAPIキーを設定してください。');
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    const request: ObjectiveAnalysisRequest = {
      qualificationGrade: userProfile.currentQualificationGrade,
      category,
      title: title.trim(),
      description: description.trim(),
      criteria100: criteria100.trim(),
      criteria110: criteria110.trim() || undefined,
    };

    try {
      const result = await analyzeObjective(request);
      setAnalysisResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析中にエラーが発生しました');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setCategory(CATEGORIES[0]);
    setTitle('');
    setDescription('');
    setCriteria100('');
    setCriteria110('');
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              AI目標アドバイザー
            </h2>
            <p className="text-gray-600">
              等級レベルを考慮したAI分析で、より良い目標設定をサポートします
            </p>
          </div>
          {gradeInfo && (
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">現在の等級</div>
              <div className="flex items-center space-x-2">
                <span className="badge badge-primary text-base px-3 py-1">
                  {gradeInfo.name}
                </span>
                <span className="badge badge-gray text-sm">
                  Lv.{gradeInfo.level}
                </span>
              </div>
            </div>
          )}
        </div>

        {!hasApiKey && (
          <div className="mt-4 p-4 bg-warning-50 border border-warning-200 rounded-lg">
            <p className="text-sm text-warning-800">
              ⚠️ OpenAI APIキーが設定されていません。設定画面でAPIキーを設定すると、AI分析機能を使用できます。
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 入力フォーム */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">目標入力</h3>

          <div className="space-y-4">
            {/* 区分 */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                区分 <span className="text-danger-600">*</span>
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* タイトル */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                目標タイトル <span className="text-danger-600">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="例: プロジェクト管理スキルの向上"
              />
            </div>

            {/* 説明 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                目標の説明 <span className="text-danger-600">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input"
                rows={4}
                placeholder="具体的な目標内容を記入してください"
              />
            </div>

            {/* 達成基準100% */}
            <div>
              <label htmlFor="criteria100" className="block text-sm font-medium text-gray-700 mb-2">
                達成基準（100%） <span className="text-danger-600">*</span>
              </label>
              <textarea
                id="criteria100"
                value={criteria100}
                onChange={(e) => setCriteria100(e.target.value)}
                className="input"
                rows={3}
                placeholder="目標100%達成の基準を具体的に記入してください"
              />
            </div>

            {/* 達成基準110% */}
            <div>
              <label htmlFor="criteria110" className="block text-sm font-medium text-gray-700 mb-2">
                達成基準（110%）
              </label>
              <textarea
                id="criteria110"
                value={criteria110}
                onChange={(e) => setCriteria110(e.target.value)}
                className="input"
                rows={3}
                placeholder="目標110%達成の基準を記入してください（任意）"
              />
            </div>

            {/* エラー表示 */}
            {error && (
              <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
                <p className="text-sm text-danger-800">{error}</p>
              </div>
            )}

            {/* ボタン */}
            <div className="flex space-x-3 pt-2">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !hasApiKey}
                className="btn btn-primary flex-1"
              >
                {isAnalyzing ? '分析中...' : 'AI分析を実行'}
              </button>
              <button
                onClick={handleClear}
                className="btn btn-secondary"
              >
                クリア
              </button>
            </div>
          </div>
        </div>

        {/* 分析結果 */}
        <div className="space-y-4">
          {isAnalyzing && (
            <div className="card">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">AI分析中...</p>
                </div>
              </div>
            </div>
          )}

          {!isAnalyzing && analysisResult && (
            <>
              {/* 総合スコア */}
              <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200">
                <div className="text-center">
                  <div className="text-sm font-medium text-primary-700 mb-2">
                    総合スコア
                  </div>
                  <div className="text-5xl font-bold text-primary-900 mb-2">
                    {analysisResult.overallScore}
                    <span className="text-2xl text-primary-700">/100</span>
                  </div>
                  <div className="w-full bg-primary-200 rounded-full h-3 mt-4">
                    <div
                      className="bg-primary-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${analysisResult.overallScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* SMART基準評価 */}
              <div className="card">
                <h4 className="text-lg font-bold text-gray-900 mb-4">
                  SMART基準評価
                </h4>
                <div className="space-y-3">
                  {Object.entries(analysisResult.smartEvaluation).map(([key, value]) => {
                    const labels: Record<string, string> = {
                      specific: 'Specific（具体的）',
                      measurable: 'Measurable（測定可能）',
                      achievable: 'Achievable（達成可能）',
                      relevant: 'Relevant（関連性）',
                      timeBound: 'Time-bound（期限）',
                    };

                    return (
                      <div key={key} className="border-b border-gray-200 pb-3 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {labels[key]}
                          </span>
                          <span className="text-sm font-bold text-primary-600">
                            {value.score}/100
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className="bg-primary-500 h-2 rounded-full"
                            style={{ width: `${value.score}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600">{value.feedback}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 等級適合性 */}
              <div className="card bg-gray-50">
                <h4 className="text-lg font-bold text-gray-900 mb-3">
                  等級レベル適合性
                </h4>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    適合度スコア
                  </span>
                  <span className="text-lg font-bold text-primary-600">
                    {analysisResult.gradeSuitability.score}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className="bg-success-500 h-2 rounded-full"
                    style={{ width: `${analysisResult.gradeSuitability.score}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {analysisResult.gradeSuitability.feedback}
                </p>
              </div>

              {/* 改善提案 */}
              <div className="card bg-success-50 border-2 border-success-200">
                <h4 className="text-lg font-bold text-success-900 mb-4">
                  💡 改善提案
                </h4>
                <ul className="space-y-3">
                  {analysisResult.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-success-600 text-white text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-sm text-success-900 leading-relaxed">
                        {improvement}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {!isAnalyzing && !analysisResult && (
            <div className="card bg-gray-50">
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">🎯</div>
                <p className="text-lg font-medium mb-2">分析結果がここに表示されます</p>
                <p className="text-sm">
                  目標情報を入力して「AI分析を実行」ボタンをクリックしてください
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ObjectiveAnalyzer;

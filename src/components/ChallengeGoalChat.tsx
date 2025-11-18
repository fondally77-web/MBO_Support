import { useState, useRef, useEffect } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { chatWithChallengeAssistant } from '../utils/openai';

interface ChallengeGoalChatProps {
  userProfile: UserProfile;
  onClose: () => void;
}

function ChallengeGoalChat({ userProfile, onClose }: ChallengeGoalChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `承知しました！一緒に良い挑戦目標を作りましょう。

まず、あなたの状況を理解するために3つ質問させてください：

1. **挑戦したい領域**: 具体的にどの分野でスキル向上したいですか？
   - 新しい技術（例：AI/機械学習、クラウド、フロントエンド等）
   - マネジメント・リーダーシップ
   - プロセス改善・業務効率化
   - その他（具体的に教えてください）

2. **現状と目指す姿**: 期末にどのような状態になっていたいですか？
   - 具体的なスキルレベル
   - 担当したいプロジェクトや役割
   - 周囲からの評価

3. **成果の測定**: どのような具体的な成果を残したいですか？
   - システムやツールの開発
   - ドキュメントやナレッジの蓄積
   - チームへの貢献
   - その他

この3点をお聞かせいただければ、測定可能で達成感のある挑戦目標を一緒に作成できます！`,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatWithChallengeAssistant(
        [...messages, userMessage],
        userProfile
      );

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    alert('クリップボードにコピーしました');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">挑戦目標 AI対話アシスタント</h3>
            <p className="text-sm text-purple-100">
              対話を通じて、測定可能で達成感のある目標を一緒に作成します
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* メッセージエリア */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="text-xs font-medium opacity-75">
                    {message.role === 'user' ? 'あなた' : 'AIアシスタント'}
                  </div>
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => handleCopyToClipboard(message.content)}
                      className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                      title="コピー"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-[80%]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500">
                    AIが考えています...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="px-4 py-2 bg-danger-50 border-t border-danger-200">
            <p className="text-sm text-danger-700">{error}</p>
          </div>
        )}

        {/* 入力エリア */}
        <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
          <div className="flex gap-2">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="メッセージを入力してください（Shift+Enterで改行、Enterで送信）"
              className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className="btn btn-primary self-end px-6"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  送信中
                </span>
              ) : (
                '送信'
              )}
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <div>
              ヒント: 対話を通じて段階的に目標を詳細化していきます
            </div>
            <div>{inputText.length}/1000文字</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChallengeGoalChat;

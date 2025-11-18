import { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import {
  getOpenAIKey,
  saveOpenAIKey,
  clearOpenAIKey,
  validateOpenAIKey,
} from '../utils/openai';
import {
  exportAllData,
  downloadAsJSON,
  importFromJSON,
  saveImportedData,
  getDataStats,
  ExportData,
} from '../utils/dataExport';
import { clearAllMBOData } from '../utils/localStorage';

interface SettingsProps {
  userProfile: UserProfile | null;
  onProfileUpdate: () => void;
}

function Settings({ userProfile, onProfileUpdate }: SettingsProps) {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [importMessage, setImportMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const dataStats = getDataStats();
  const hasApiKey = !!getOpenAIKey();

  useEffect(() => {
    const savedKey = getOpenAIKey();
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setValidationMessage({
        type: 'error',
        message: 'APIキーを入力してください',
      });
      return;
    }

    setIsValidating(true);
    setValidationMessage(null);

    const isValid = await validateOpenAIKey(apiKey.trim());

    if (isValid) {
      saveOpenAIKey(apiKey.trim());
      setValidationMessage({
        type: 'success',
        message: 'APIキーを保存しました',
      });
    } else {
      setValidationMessage({
        type: 'error',
        message: 'APIキーが無効です。正しいAPIキーを入力してください。',
      });
    }

    setIsValidating(false);
  };

  const handleClearApiKey = () => {
    if (confirm('APIキーを削除してもよろしいですか？')) {
      clearOpenAIKey();
      setApiKey('');
      setValidationMessage({
        type: 'success',
        message: 'APIキーを削除しました',
      });
    }
  };

  const handleExport = () => {
    const data = exportAllData();
    downloadAsJSON(data);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data: ExportData = await importFromJSON(file);

      if (
        confirm(
          'データをインポートすると、現在のデータが上書きされます。よろしいですか？'
        )
      ) {
        saveImportedData(data);
        setImportMessage({
          type: 'success',
          message: 'データをインポートしました。ページを再読み込みします。',
        });

        // ページをリロードしてデータを反映
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      setImportMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'インポートに失敗しました',
      });
    }

    // ファイル入力をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearAllData = () => {
    if (
      confirm(
        'すべてのデータを削除してもよろしいですか？この操作は取り消せません。'
      )
    ) {
      if (confirm('本当にすべてのデータを削除しますか？')) {
        clearAllMBOData();
        alert('すべてのデータを削除しました。ページを再読み込みします。');
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">設定</h2>
        <p className="text-gray-600">
          システムの設定とデータ管理を行います
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OpenAI API設定 */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            OpenAI API設定
          </h3>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="apiKey"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                APIキー
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="input pr-20"
                  placeholder="sk-..."
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-primary-600 hover:text-primary-700"
                >
                  {showApiKey ? '隠す' : '表示'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                OpenAIのAPIキーを入力してください。
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline ml-1"
                >
                  APIキーを取得
                </a>
              </p>
            </div>

            {validationMessage && (
              <div
                className={`p-3 rounded-lg ${
                  validationMessage.type === 'success'
                    ? 'bg-success-50 border border-success-200 text-success-800'
                    : 'bg-danger-50 border border-danger-200 text-danger-800'
                }`}
              >
                <p className="text-sm">{validationMessage.message}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={handleSaveApiKey}
                disabled={isValidating}
                className="btn btn-primary flex-1"
              >
                {isValidating ? '検証中...' : '保存'}
              </button>
              {hasApiKey && (
                <button onClick={handleClearApiKey} className="btn btn-danger">
                  削除
                </button>
              )}
            </div>

            {hasApiKey && (
              <div className="p-3 bg-success-50 border border-success-200 rounded-lg">
                <p className="text-sm text-success-800">
                  ✓ APIキーが設定されています
                </p>
              </div>
            )}
          </div>
        </div>

        {/* データ管理 */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">データ管理</h3>

          <div className="space-y-4">
            {/* データ統計 */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">プロフィール:</span>
                <span className="font-medium text-gray-900">
                  {dataStats.hasProfile ? '設定済み' : '未設定'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">目標数:</span>
                <span className="font-medium text-gray-900">
                  {dataStats.objectivesCount}件
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">評価記録:</span>
                <span className="font-medium text-gray-900">
                  {dataStats.evaluationsCount}件
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">等級履歴:</span>
                <span className="font-medium text-gray-900">
                  {dataStats.gradeHistoryCount}件
                </span>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
                <span className="text-gray-600">データサイズ:</span>
                <span className="font-medium text-gray-900">
                  {dataStats.totalDataSize} KB
                </span>
              </div>
            </div>

            {importMessage && (
              <div
                className={`p-3 rounded-lg ${
                  importMessage.type === 'success'
                    ? 'bg-success-50 border border-success-200 text-success-800'
                    : 'bg-danger-50 border border-danger-200 text-danger-800'
                }`}
              >
                <p className="text-sm">{importMessage.message}</p>
              </div>
            )}

            {/* エクスポート */}
            <div>
              <button onClick={handleExport} className="btn btn-primary w-full">
                データをエクスポート
              </button>
              <p className="text-xs text-gray-500 mt-1">
                すべてのデータをJSONファイルとしてダウンロードします
              </p>
            </div>

            {/* インポート */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary w-full"
              >
                データをインポート
              </button>
              <p className="text-xs text-gray-500 mt-1">
                JSONファイルからデータをインポートします（現在のデータは上書きされます）
              </p>
            </div>

            {/* データ削除 */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleClearAllData}
                className="btn btn-danger w-full"
              >
                すべてのデータを削除
              </button>
              <p className="text-xs text-danger-600 mt-1">
                ⚠️ この操作は取り消せません
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* システム情報 */}
      <div className="card bg-gray-50">
        <h3 className="text-lg font-bold text-gray-900 mb-3">システム情報</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-600 mb-1">バージョン</div>
            <div className="font-medium text-gray-900">1.0.0</div>
          </div>
          <div>
            <div className="text-gray-600 mb-1">ブラウザ</div>
            <div className="font-medium text-gray-900">
              {navigator.userAgent.includes('Chrome')
                ? 'Chrome'
                : navigator.userAgent.includes('Firefox')
                ? 'Firefox'
                : navigator.userAgent.includes('Safari')
                ? 'Safari'
                : 'Other'}
            </div>
          </div>
          <div>
            <div className="text-gray-600 mb-1">ローカルストレージ</div>
            <div className="font-medium text-gray-900">
              {typeof Storage !== 'undefined' ? '利用可能' : '利用不可'}
            </div>
          </div>
          <div>
            <div className="text-gray-600 mb-1">データ保存先</div>
            <div className="font-medium text-gray-900">ローカル</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;

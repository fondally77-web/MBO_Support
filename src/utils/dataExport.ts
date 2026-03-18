import { UserProfile } from '../types';
import { STORAGE_KEYS, loadFromLocalStorage, saveToLocalStorage } from './localStorage';
import { formatDate } from './dateUtils';

/**
 * エクスポートデータ構造
 */
export interface ExportData {
  version: string;
  exportDate: string;
  userProfile: UserProfile | null;
  objectives: unknown[];
  evaluations: unknown[];
  gradeHistory: unknown[];
  proposalHistories: unknown[];
}

/**
 * すべてのデータをエクスポート
 */
export const exportAllData = (): ExportData => {
  const userProfile = loadFromLocalStorage<UserProfile>(STORAGE_KEYS.USER_PROFILE);
  const objectives = loadFromLocalStorage<unknown[]>(STORAGE_KEYS.OBJECTIVES) || [];
  const evaluations = loadFromLocalStorage<unknown[]>(STORAGE_KEYS.EVALUATIONS) || [];
  const gradeHistory = loadFromLocalStorage<unknown[]>(STORAGE_KEYS.GRADE_HISTORY) || [];
  const proposalHistories = loadFromLocalStorage<unknown[]>(STORAGE_KEYS.PROPOSAL_HISTORIES) || [];

  return {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    userProfile,
    objectives,
    evaluations,
    gradeHistory,
    proposalHistories,
  };
};

/**
 * データをJSON形式でダウンロード
 */
export const downloadAsJSON = (data: ExportData): void => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const filename = `mbo-backup-${formatDate(new Date())}.json`;
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * JSONファイルからデータをインポート
 */
export const importFromJSON = (file: File): Promise<ExportData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as ExportData;

        // バージョンチェック（将来的な拡張用）
        if (!data.version) {
          throw new Error('無効なバックアップファイルです');
        }

        resolve(data);
      } catch (error) {
        reject(new Error('ファイルの読み込みに失敗しました'));
      }
    };

    reader.onerror = () => {
      reject(new Error('ファイルの読み込みに失敗しました'));
    };

    reader.readAsText(file);
  });
};

/**
 * インポートしたデータを保存
 */
export const saveImportedData = (data: ExportData): void => {
  if (data.userProfile) {
    saveToLocalStorage(STORAGE_KEYS.USER_PROFILE, data.userProfile);
  }

  if (data.objectives && Array.isArray(data.objectives)) {
    saveToLocalStorage(STORAGE_KEYS.OBJECTIVES, data.objectives);
  }

  if (data.evaluations && Array.isArray(data.evaluations)) {
    saveToLocalStorage(STORAGE_KEYS.EVALUATIONS, data.evaluations);
  }

  if (data.gradeHistory && Array.isArray(data.gradeHistory)) {
    saveToLocalStorage(STORAGE_KEYS.GRADE_HISTORY, data.gradeHistory);
  }

  if (data.proposalHistories && Array.isArray(data.proposalHistories)) {
    saveToLocalStorage(STORAGE_KEYS.PROPOSAL_HISTORIES, data.proposalHistories);
  }
};

/**
 * データサイズを取得（KB単位）
 */
export const getDataSize = (): number => {
  let totalSize = 0;

  Object.values(STORAGE_KEYS).forEach((key) => {
    const item = localStorage.getItem(key);
    if (item) {
      totalSize += new Blob([item]).size;
    }
  });

  return Math.round(totalSize / 1024 * 100) / 100; // KB単位、小数点2桁
};

/**
 * データ統計情報を取得
 */
export const getDataStats = () => {
  const userProfile = loadFromLocalStorage<UserProfile>(STORAGE_KEYS.USER_PROFILE);
  const objectives = loadFromLocalStorage<unknown[]>(STORAGE_KEYS.OBJECTIVES) || [];
  const evaluations = loadFromLocalStorage<unknown[]>(STORAGE_KEYS.EVALUATIONS) || [];
  const gradeHistory = loadFromLocalStorage<unknown[]>(STORAGE_KEYS.GRADE_HISTORY) || [];

  return {
    hasProfile: !!userProfile,
    objectivesCount: objectives.length,
    evaluationsCount: evaluations.length,
    gradeHistoryCount: gradeHistory.length,
    totalDataSize: getDataSize(),
  };
};

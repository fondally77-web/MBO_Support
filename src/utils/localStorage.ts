/**
 * ローカルストレージユーティリティ
 * データの保存・取得・削除を型安全に行う
 */

const STORAGE_PREFIX = 'mbo_';

/**
 * ストレージキー定義
 */
export const STORAGE_KEYS = {
  USER_PROFILE: `${STORAGE_PREFIX}user_profile`,
  OBJECTIVES: `${STORAGE_PREFIX}objectives`,
  OBJECTIVE_TASKS: `${STORAGE_PREFIX}objective_tasks`,
  EVALUATIONS: `${STORAGE_PREFIX}evaluations`,
  GRADE_HISTORY: `${STORAGE_PREFIX}grade_history`,
  PROPOSAL_HISTORIES: `${STORAGE_PREFIX}proposal_histories`,
} as const;

/**
 * データをローカルストレージに保存
 */
export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
  } catch (error) {
    console.error(`Error saving to localStorage (key: ${key}):`, error);
    throw new Error(`Failed to save data to localStorage`);
  }
};

/**
 * ローカルストレージからデータを取得
 */
export const loadFromLocalStorage = <T>(key: string): T | null => {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return null;
    }
    return JSON.parse(serializedData) as T;
  } catch (error) {
    console.error(`Error loading from localStorage (key: ${key}):`, error);
    return null;
  }
};

/**
 * ローカルストレージからデータを削除
 */
export const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage (key: ${key}):`, error);
    throw new Error(`Failed to remove data from localStorage`);
  }
};

/**
 * すべてのMBOデータをクリア
 */
export const clearAllMBOData = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing all MBO data:', error);
    throw new Error('Failed to clear MBO data');
  }
};

/**
 * Date型のフィールドを持つオブジェクトの復元
 * JSONのパース後、Date型に変換が必要なフィールドを変換する
 */
export const reviveDates = <T>(obj: T, dateFields: (keyof T)[]): T => {
  const result = { ...obj };
  dateFields.forEach((field) => {
    const value = result[field];
    if (value && typeof value === 'string') {
      result[field] = new Date(value) as T[keyof T];
    }
  });
  return result;
};

/**
 * 配列内のオブジェクトのDate型フィールドを一括変換
 */
export const reviveDatesArray = <T>(
  array: T[],
  dateFields: (keyof T)[]
): T[] => {
  return array.map((item) => reviveDates(item, dateFields));
};

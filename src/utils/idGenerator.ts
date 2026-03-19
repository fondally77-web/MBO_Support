/**
 * ID生成ユーティリティ
 */

/**
 * ユニークIDを生成（タイムスタンプ + ランダム文字列）
 */
export const generateId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${randomStr}`;
};

/**
 * プレフィックス付きIDを生成
 */
export const generateIdWithPrefix = (prefix: string): string => {
  return `${prefix}_${generateId()}`;
};

/**
 * 目標IDを生成
 */
export const generateObjectiveId = (): string => {
  return generateIdWithPrefix('obj');
};

/**
 * 実行タスクIDを生成
 */
export const generateObjectiveTaskId = (): string => {
  return generateIdWithPrefix('task');
};

/**
 * 主要成果IDを生成
 */
export const generateKeyResultId = (): string => {
  return generateIdWithPrefix('kr');
};

/**
 * 評価IDを生成
 */
export const generateEvaluationId = (): string => {
  return generateIdWithPrefix('eval');
};

/**
 * 等級履歴IDを生成
 */
export const generateGradeHistoryId = (): string => {
  return generateIdWithPrefix('grade');
};

/**
 * ユーザーIDを生成
 */
export const generateUserId = (): string => {
  return generateIdWithPrefix('user');
};

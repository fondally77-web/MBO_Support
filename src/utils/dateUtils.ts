/**
 * 日付関連のユーティリティ関数
 */

/**
 * 日付をYYYY-MM-DD形式にフォーマット
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 日付をYYYY年MM月DD日形式にフォーマット
 */
export const formatDateJP = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
};

/**
 * 日付をYYYY/MM/DD形式にフォーマット
 */
export const formatDateSlash = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

/**
 * 2つの日付の差分（日数）を計算
 */
export const getDaysDiff = (startDate: Date, endDate: Date): number => {
  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * 期間が現在アクティブかどうかを判定
 */
export const isActivePeriod = (startDate: Date, endDate: Date): boolean => {
  const now = new Date();
  return now >= startDate && now <= endDate;
};

/**
 * 期間の進捗率を計算（%）
 */
export const calculatePeriodProgress = (
  startDate: Date,
  endDate: Date
): number => {
  const now = new Date();
  const totalDays = getDaysDiff(startDate, endDate);
  const elapsedDays = getDaysDiff(startDate, now);

  if (elapsedDays < 0) return 0;
  if (elapsedDays > totalDays) return 100;

  return Math.round((elapsedDays / totalDays) * 100);
};

/**
 * 四半期の開始日と終了日を取得
 */
export const getQuarterDates = (
  year: number,
  quarter: 1 | 2 | 3 | 4
): { startDate: Date; endDate: Date } => {
  const quarterStartMonth = (quarter - 1) * 3;
  const startDate = new Date(year, quarterStartMonth, 1);
  const endDate = new Date(year, quarterStartMonth + 3, 0);

  return { startDate, endDate };
};

/**
 * 半期の開始日と終了日を取得
 */
export const getHalfYearDates = (
  year: number,
  half: 1 | 2
): { startDate: Date; endDate: Date } => {
  const startMonth = half === 1 ? 0 : 6;
  const startDate = new Date(year, startMonth, 1);
  const endDate = new Date(year, startMonth + 6, 0);

  return { startDate, endDate };
};

/**
 * 年度の開始日と終了日を取得（日本の会計年度：4月〜3月）
 */
export const getFiscalYearDates = (
  fiscalYear: number
): { startDate: Date; endDate: Date } => {
  const startDate = new Date(fiscalYear, 3, 1); // 4月1日
  const endDate = new Date(fiscalYear + 1, 2, 31); // 翌年3月31日

  return { startDate, endDate };
};

/**
 * 現在の年度を取得（日本の会計年度）
 */
export const getCurrentFiscalYear = (): number => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // 1月〜3月は前年度
  return month < 3 ? year - 1 : year;
};

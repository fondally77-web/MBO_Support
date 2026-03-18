/**
 * 資格等級（7段階）
 * TM1: テクニカルメンバー1
 * TM2: テクニカルメンバー2
 * L1-L3: リード1-3
 * M: マネージャー
 * SM: シニアマネージャー
 */
export type QualificationGrade = 'TM1' | 'TM2' | 'L1' | 'L2' | 'L3' | 'M' | 'SM';

/**
 * 役割等級（11段階）
 * TM1-1～TM1-3: テクニカルメンバー1の細分化
 * TM2-1～TM2-3: テクニカルメンバー2の細分化
 * L1-1～L1-5: リード1の細分化
 */
export type RoleGrade =
  | 'TM1-1' | 'TM1-2' | 'TM1-3'
  | 'TM2-1' | 'TM2-2' | 'TM2-3'
  | 'L1-1' | 'L1-2' | 'L1-3' | 'L1-4' | 'L1-5';

/**
 * 等級レベル情報
 */
export interface GradeLevel {
  /** 資格等級コード */
  qualificationGrade: QualificationGrade;
  /** 役割等級コード */
  roleGrade: RoleGrade;
  /** 資格等級の表示名 */
  qualificationName: string;
  /** 役割等級の表示名 */
  roleName: string;
  /** 説明 */
  description?: string;
  /** ソート順（数値が小さいほど初級） */
  sortOrder: number;
}

/**
 * 等級変更履歴
 */
export interface GradeHistory {
  /** 履歴ID */
  id: string;
  /** 変更日 */
  changeDate: Date;
  /** 変更前の資格等級 */
  fromQualificationGrade?: QualificationGrade;
  /** 変更後の資格等級 */
  toQualificationGrade: QualificationGrade;
  /** 変更前の役割等級 */
  fromRoleGrade?: RoleGrade;
  /** 変更後の役割等級 */
  toRoleGrade: RoleGrade;
  /** 備考 */
  note?: string;
}

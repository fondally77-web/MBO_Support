import { GradeLevel, QualificationGrade, RoleGrade } from '../types';

/**
 * 資格等級マスタデータ
 */
export const QUALIFICATION_GRADES: Array<{
  code: QualificationGrade;
  name: string;
  description: string;
  sortOrder: number;
}> = [
  {
    code: 'TM1',
    name: 'テクニカルメンバー1',
    description: '基礎的な技術スキルを持つメンバー',
    sortOrder: 1,
  },
  {
    code: 'TM2',
    name: 'テクニカルメンバー2',
    description: '自律的に業務遂行できるメンバー',
    sortOrder: 2,
  },
  {
    code: 'L1',
    name: 'リード1',
    description: 'チーム内でリーダーシップを発揮できるメンバー',
    sortOrder: 3,
  },
  {
    code: 'L2',
    name: 'リード2',
    description: '複数プロジェクトをリードできるメンバー',
    sortOrder: 4,
  },
  {
    code: 'L3',
    name: 'リード3',
    description: '組織横断的なリーダーシップを持つメンバー',
    sortOrder: 5,
  },
  {
    code: 'M',
    name: 'マネージャー',
    description: 'チームのマネジメントを担当',
    sortOrder: 6,
  },
  {
    code: 'SM',
    name: 'シニアマネージャー',
    description: '複数チームの統括マネジメントを担当',
    sortOrder: 7,
  },
];

/**
 * 役割等級マスタデータ
 */
export const ROLE_GRADES: Array<{
  code: RoleGrade;
  name: string;
  qualificationGrade: QualificationGrade;
  description: string;
  sortOrder: number;
}> = [
  // TM1系列
  {
    code: 'TM1-1',
    name: 'TM1-1（初級）',
    qualificationGrade: 'TM1',
    description: 'TM1の初級レベル。基礎スキル習得段階',
    sortOrder: 1,
  },
  {
    code: 'TM1-2',
    name: 'TM1-2（中級）',
    qualificationGrade: 'TM1',
    description: 'TM1の中級レベル。基礎スキルを活用できる段階',
    sortOrder: 2,
  },
  {
    code: 'TM1-3',
    name: 'TM1-3（上級）',
    qualificationGrade: 'TM1',
    description: 'TM1の上級レベル。次の等級への準備段階',
    sortOrder: 3,
  },
  // TM2系列
  {
    code: 'TM2-1',
    name: 'TM2-1（初級）',
    qualificationGrade: 'TM2',
    description: 'TM2の初級レベル。自律性の発揮開始段階',
    sortOrder: 4,
  },
  {
    code: 'TM2-2',
    name: 'TM2-2（中級）',
    qualificationGrade: 'TM2',
    description: 'TM2の中級レベル。安定した自律的業務遂行',
    sortOrder: 5,
  },
  {
    code: 'TM2-3',
    name: 'TM2-3（上級）',
    qualificationGrade: 'TM2',
    description: 'TM2の上級レベル。リーダーシップの萌芽',
    sortOrder: 6,
  },
  // L1系列
  {
    code: 'L1-1',
    name: 'L1-1（初級）',
    qualificationGrade: 'L1',
    description: 'L1の初級レベル。小規模チームのリード開始',
    sortOrder: 7,
  },
  {
    code: 'L1-2',
    name: 'L1-2（中級前半）',
    qualificationGrade: 'L1',
    description: 'L1の中級前半レベル。チームリードの安定期',
    sortOrder: 8,
  },
  {
    code: 'L1-3',
    name: 'L1-3（中級後半）',
    qualificationGrade: 'L1',
    description: 'L1の中級後半レベル。複数タスクのリード',
    sortOrder: 9,
  },
  {
    code: 'L1-4',
    name: 'L1-4（上級前半）',
    qualificationGrade: 'L1',
    description: 'L1の上級前半レベル。プロジェクトリード',
    sortOrder: 10,
  },
  {
    code: 'L1-5',
    name: 'L1-5（上級後半）',
    qualificationGrade: 'L1',
    description: 'L1の上級後半レベル。次の等級への準備段階',
    sortOrder: 11,
  },
];

/**
 * 統合等級レベルマスタデータ
 */
export const GRADE_LEVELS: GradeLevel[] = ROLE_GRADES.map((roleGrade) => {
  const qualificationGrade = QUALIFICATION_GRADES.find(
    (qg) => qg.code === roleGrade.qualificationGrade
  );

  return {
    qualificationGrade: roleGrade.qualificationGrade,
    roleGrade: roleGrade.code,
    qualificationName: qualificationGrade?.name || '',
    roleName: roleGrade.name,
    description: roleGrade.description,
    sortOrder: roleGrade.sortOrder,
  };
});

/**
 * 資格等級コードから資格等級情報を取得
 */
export const getQualificationGrade = (code: QualificationGrade) => {
  return QUALIFICATION_GRADES.find((grade) => grade.code === code);
};

/**
 * 役割等級コードから役割等級情報を取得
 */
export const getRoleGrade = (code: RoleGrade) => {
  return ROLE_GRADES.find((grade) => grade.code === code);
};

/**
 * 等級レベル情報を取得
 */
export const getGradeLevel = (
  qualificationGrade: QualificationGrade,
  roleGrade: RoleGrade
): GradeLevel | undefined => {
  return GRADE_LEVELS.find(
    (level) =>
      level.qualificationGrade === qualificationGrade &&
      level.roleGrade === roleGrade
  );
};

/**
 * 資格等級に紐づく役割等級リストを取得
 */
export const getRoleGradesByQualification = (
  qualificationGrade: QualificationGrade
): RoleGrade[] => {
  return ROLE_GRADES.filter(
    (grade) => grade.qualificationGrade === qualificationGrade
  ).map((grade) => grade.code);
};

import { QualificationGrade, RoleGrade } from './grade';

/**
 * 目標のステータス
 */
export type ObjectiveStatus = 'draft' | 'active' | 'completed' | 'cancelled';

/**
 * 目標の重要度
 */
export type ObjectivePriority = 'high' | 'medium' | 'low';

/**
 * 実行タスクのステータス
 */
export type ObjectiveTaskStatus = 'todo' | 'doing' | 'done' | 'skipped';

/**
 * 実行タスクの重要度
 */
export type ObjectiveTaskPriority = 'high' | 'medium' | 'low';

/**
 * 評価スコア（5段階）
 */
export type EvaluationScore = 1 | 2 | 3 | 4 | 5;

/**
 * 目標の期間
 */
export interface ObjectivePeriod {
  /** 開始日 */
  startDate: Date;
  /** 終了日 */
  endDate: Date;
}

/**
 * 目標（Objective）
 */
export interface Objective {
  /** 目標ID */
  id: string;
  /** 目標タイトル */
  title: string;
  /** 目標の詳細説明 */
  description: string;
  /** ステータス */
  status: ObjectiveStatus;
  /** 重要度 */
  priority: ObjectivePriority;
  /** 期間 */
  period: ObjectivePeriod;
  /** 対象等級（この等級の人に適用される目標） */
  targetQualificationGrade?: QualificationGrade;
  targetRoleGrade?: RoleGrade;
  /** ウェイト（%）*/
  weight: number;
  /** 主要成果（Key Results） */
  keyResults: KeyResult[];
  /** 作成日 */
  createdAt: Date;
  /** 更新日 */
  updatedAt: Date;
}

/**
 * Objective配下の実行タスク
 */
export interface ObjectiveTask {
  /** タスクID */
  id: string;
  /** 紐づく目標ID */
  objectiveId: string;
  /** タスクタイトル */
  title: string;
  /** タスク説明 */
  description?: string;
  /** ステータス */
  status: ObjectiveTaskStatus;
  /** 重要度 */
  priority: ObjectiveTaskPriority;
  /** 並び順 */
  order: number;
  /** 期限 */
  dueDate?: Date;
  /** 作成日 */
  createdAt: Date;
  /** 更新日 */
  updatedAt: Date;
}

/**
 * 主要成果（Key Result）
 */
export interface KeyResult {
  /** KR ID */
  id: string;
  /** タイトル */
  title: string;
  /** 説明 */
  description?: string;
  /** 目標値 */
  targetValue?: string;
  /** 現在値 */
  currentValue?: string;
  /** 進捗率（%） */
  progress: number;
  /** 完了フラグ */
  isCompleted: boolean;
  /** 作成日 */
  createdAt: Date;
  /** 更新日 */
  updatedAt: Date;
}

/**
 * 評価（Evaluation）
 */
export interface Evaluation {
  /** 評価ID */
  id: string;
  /** 対象目標ID */
  objectiveId: string;
  /** 評価期間 */
  period: ObjectivePeriod;
  /** 自己評価スコア */
  selfScore?: EvaluationScore;
  /** 自己評価コメント */
  selfComment?: string;
  /** 最終スコア（上司評価等を含む） */
  finalScore?: EvaluationScore;
  /** 最終コメント */
  finalComment?: string;
  /** 評価日 */
  evaluationDate?: Date;
  /** 作成日 */
  createdAt: Date;
  /** 更新日 */
  updatedAt: Date;
}

/**
 * ポジション（役職）
 */
export type Position = 'member' | 'team_leader' | 'group_leader';

/**
 * ユーザープロフィール
 */
export interface UserProfile {
  /** ユーザーID */
  id: string;
  /** 名前 */
  name: string;
  /** 部署 */
  department: string;
  /** 現在の資格等級 */
  currentQualificationGrade: QualificationGrade;
  /** 現在の役割等級 */
  currentRoleGrade: RoleGrade;
  /** ポジション（役職） */
  position: Position;
  /** 仕事内容 */
  jobDescription?: string;
  /** 等級取得日 */
  gradeAcquiredDate: Date;
  /** 作成日 */
  createdAt: Date;
  /** 更新日 */
  updatedAt: Date;
}

/**
 * 目標カテゴリ
 */
export type GoalCategory = 'challenge' | 'business' | 'personal';

/**
 * 目標難易度
 */
export type GoalDifficulty = 'basic' | 'intermediate' | 'advanced';

/**
 * AI提案目標
 */
export interface GoalProposal {
  /** 提案ID */
  id: string;
  /** 目標タイトル */
  title: string;
  /** 目標説明 */
  description: string;
  /** 達成基準（100%） */
  criteria100: string;
  /** 達成基準（110%） */
  criteria110: string;
  /** 推奨期限 */
  deadline: string;
  /** 難易度 */
  difficulty: GoalDifficulty;
  /** 提案理由 */
  reason: string;
  /** カテゴリ */
  category: GoalCategory;
}

/**
 * 提案履歴
 */
export interface ProposalHistory {
  /** 履歴ID */
  id: string;
  /** タイムスタンプ */
  timestamp: string;
  /** カテゴリ */
  category: GoalCategory;
  /** 提案目標リスト */
  proposals: GoalProposal[];
  /** ユーザー情報（提案時点） */
  userProfile: {
    qualificationGrade: QualificationGrade;
    roleGrade: RoleGrade;
    jobDescription: string;
  };
}

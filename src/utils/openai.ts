import { QualificationGrade, UserProfile, GoalCategory, GoalProposal } from '../types';
import { getQualificationGrade } from '../data/gradeMaster';
import { generateId } from './idGenerator';

/**
 * チャットメッセージ
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * 目標分析リクエスト
 */
export interface ObjectiveAnalysisRequest {
  qualificationGrade: QualificationGrade;
  category: string;
  title: string;
  description: string;
  criteria100: string;
  criteria110?: string;
}

/**
 * SMART基準評価結果
 */
export interface SMARTEvaluation {
  specific: {
    score: number; // 0-100
    feedback: string;
  };
  measurable: {
    score: number;
    feedback: string;
  };
  achievable: {
    score: number;
    feedback: string;
  };
  relevant: {
    score: number;
    feedback: string;
  };
  timeBound: {
    score: number;
    feedback: string;
  };
}

/**
 * 目標分析結果
 */
export interface ObjectiveAnalysisResult {
  smartEvaluation: SMARTEvaluation;
  gradeSuitability: {
    score: number; // 0-100
    feedback: string;
  };
  improvements: string[];
  overallScore: number; // 0-100
}

/**
 * OpenAI APIキーの取得
 */
export const getOpenAIKey = (): string | null => {
  // ローカルストレージから取得
  return localStorage.getItem('openai_api_key');
};

/**
 * OpenAI APIキーの保存
 */
export const saveOpenAIKey = (apiKey: string): void => {
  localStorage.setItem('openai_api_key', apiKey);
};

/**
 * OpenAI APIキーのクリア
 */
export const clearOpenAIKey = (): void => {
  localStorage.removeItem('openai_api_key');
};

/**
 * 目標を分析してアドバイスを生成
 */
export const analyzeObjective = async (
  request: ObjectiveAnalysisRequest
): Promise<ObjectiveAnalysisResult> => {
  const apiKey = getOpenAIKey();

  if (!apiKey) {
    throw new Error('OpenAI APIキーが設定されていません。設定画面でAPIキーを設定してください。');
  }

  const gradeInfo = getQualificationGrade(request.qualificationGrade);

  if (!gradeInfo) {
    throw new Error('等級情報が見つかりません');
  }

  const systemPrompt = `あなたは人事評価とMBO（目標管理）の専門家です。
従業員の等級レベルを考慮して、目標の質を分析し、具体的な改善アドバイスを提供してください。

## 評価基準

### SMART基準
1. Specific（具体的）: 目標が明確に定義されているか
2. Measurable（測定可能）: 進捗・達成が測定できるか
3. Achievable（達成可能）: 該当等級で実現可能か
4. Relevant（関連性）: 等級・職責に関連しているか
5. Time-bound（期限）: 適切な期限設定か

### 等級レベル適合性
- 現在の等級に適したレベルか
- 次の等級への成長に繋がるか
- 目標の複雑さ・影響度が適切か

## 出力形式
JSON形式で以下の構造を返してください：
{
  "smartEvaluation": {
    "specific": {"score": 0-100, "feedback": "評価コメント"},
    "measurable": {"score": 0-100, "feedback": "評価コメント"},
    "achievable": {"score": 0-100, "feedback": "評価コメント"},
    "relevant": {"score": 0-100, "feedback": "評価コメント"},
    "timeBound": {"score": 0-100, "feedback": "評価コメント"}
  },
  "gradeSuitability": {
    "score": 0-100,
    "feedback": "等級レベルとの適合性に関するコメント"
  },
  "improvements": ["改善提案1", "改善提案2", "改善提案3"],
  "overallScore": 0-100
}`;

  const userPrompt = `以下の目標を分析してください。

【ユーザー情報】
- 等級: ${gradeInfo.name} (${request.qualificationGrade})
- レベル: ${gradeInfo.level}
- 期待される役割: ${gradeInfo.description}

【目標情報】
- 区分: ${request.category}
- タイトル: ${request.title}
- 説明: ${request.description}
- 達成基準(100%): ${request.criteria100}
${request.criteria110 ? `- 達成基準(110%): ${request.criteria110}` : ''}

上記の情報を基に、SMART基準の評価、等級レベルとの適合性、具体的な改善提案（3-5点）を提供してください。`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `OpenAI API Error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const result = JSON.parse(content) as ObjectiveAnalysisResult;

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`目標分析エラー: ${error.message}`);
    }
    throw new Error('目標分析中に不明なエラーが発生しました');
  }
};

/**
 * APIキーの検証
 */
export const validateOpenAIKey = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * AI目標提案を生成
 */
export const generateGoalProposals = async (
  category: GoalCategory,
  userProfile: UserProfile
): Promise<GoalProposal[]> => {
  const apiKey = getOpenAIKey();

  if (!apiKey) {
    throw new Error('OpenAI APIキーが設定されていません。設定画面でAPIキーを設定してください。');
  }

  const gradeInfo = getQualificationGrade(userProfile.currentQualificationGrade);

  if (!gradeInfo) {
    throw new Error('等級情報が見つかりません');
  }

  const categoryLabels: Record<GoalCategory, string> = {
    challenge: '挑戦目標: 新たな価値創出、個人・組織の成長に繋がる目標',
    business: '業務目標: 担当業務の品質・効率向上、成果達成に関する目標',
    personal: '人財目標: スキル習得、チームワーク、人材育成に関する目標',
  };

  const getLevelGuidance = (level: number): string => {
    if (level <= 2) {
      return 'TM1-TM2レベル: 個人業務の改善、基本スキルの習得、上位者の指示のもとでの業務遂行';
    } else if (level <= 4) {
      return 'L1-L2レベル: チーム貢献、専門性の向上、後輩指導、一定の裁量を持った業務遂行';
    } else if (level <= 5) {
      return 'L3レベル: 部門改革、組織力向上、複雑困難業務の統括';
    } else if (level === 6) {
      return 'Mレベル: 部署の具体策企画立案、一般職の指導育成、マネジメント業務';
    } else {
      return 'SMレベル: 経営革新、戦略実現、組織変革、重要施策の企画立案';
    }
  };

  // 6ヶ月後の日付を計算
  const deadline = new Date();
  deadline.setMonth(deadline.getMonth() + 6);
  const deadlineStr = deadline.toISOString().split('T')[0];

  const systemPrompt = `あなたは人事評価とキャリア開発の専門家です。
ユーザーの仕事内容と等級情報を基に、適切なMBO目標を3-5件提案してください。

## 出力形式
JSON配列で3-5件の目標を提案してください。各目標には以下を含めてください：
[
  {
    "title": "目標タイトル（30文字以内、簡潔に）",
    "description": "目標の詳細説明（100文字程度、具体的に）",
    "criteria100": "達成度100%の具体的な基準（測定可能な指標を含む）",
    "criteria110": "達成度110%の具体的な基準（より高い目標を示す）",
    "difficulty": "basic/intermediate/advanced",
    "reason": "なぜこの目標が適切かの説明（50文字程度）"
  }
]

## 重要な原則
1. 仕事内容に直接関連した実現可能な目標を提案
2. 等級レベルに適した難易度と影響範囲を設定
3. 測定可能で具体的な基準を明記
4. SMART原則（具体的、測定可能、達成可能、関連性、期限）を意識
5. 次の等級への成長を意識した目標を含める`;

  const userPrompt = `以下の情報を基に、適切なMBO目標を3-5件提案してください。

【ユーザー情報】
- 資格等級: ${gradeInfo.name} (${userProfile.currentQualificationGrade})
- 等級レベル: ${gradeInfo.level}
- 役割等級: ${userProfile.currentRoleGrade}
- 部署: ${userProfile.department}
- ポジション: ${userProfile.position}
- 仕事内容: ${userProfile.jobDescription || '未入力'}

【目標カテゴリ】
${categoryLabels[category]}

【等級別の期待レベル】
${getLevelGuidance(gradeInfo.level)}
期待される役割: ${gradeInfo.description}

【推奨期限】
${deadlineStr}（6ヶ月後）

上記の情報を基に、ユーザーの成長と組織への貢献に繋がる適切な目標を提案してください。`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `OpenAI API Error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsedContent = JSON.parse(content);

    // レスポンスが配列かオブジェクトか判定
    const proposalsArray = Array.isArray(parsedContent) ? parsedContent : parsedContent.proposals || [];

    // GoalProposalオブジェクトに変換
    const proposals: GoalProposal[] = proposalsArray.map((item: {
      title: string;
      description: string;
      criteria100: string;
      criteria110: string;
      difficulty: string;
      reason: string;
    }) => ({
      id: generateId(),
      title: item.title,
      description: item.description,
      criteria100: item.criteria100,
      criteria110: item.criteria110,
      deadline: deadlineStr,
      difficulty: item.difficulty as 'basic' | 'intermediate' | 'advanced',
      reason: item.reason,
      category,
    }));

    return proposals;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`AI目標提案エラー: ${error.message}`);
    }
    throw new Error('AI目標提案中に不明なエラーが発生しました');
  }
};

/**
 * 挑戦目標作成のための対話型アシスタント
 */
const CHALLENGE_GOAL_SYSTEM_PROMPT = `# 役割
あなたはMBO（目標管理制度）の挑戦目標作成を支援する専門アシスタントです。
対話を通じてユーザーの業務状況や希望を深く理解し、測定可能で達成感のある目標を一緒に作成します。

# 基本方針
1. **探索的アプローチ**: いきなり目標案を提示せず、まず状況を理解する
2. **段階的な深掘り**: 質問→理解→提案→詳細化の順で進める
3. **ユーザー主導**: 選択肢を提示し、ユーザーに選んでもらう
4. **柔軟な対応**: ユーザーの要望（文字数制限など）に応じて調整
5. **確認重視**: 各段階で確認を取り、合意を得ながら進める

# MBOの「挑戦」の定義
- 個人の新規挑戦・スキル向上
- 現在の業務の延長ではなく、新しいことへの挑戦
- 組織への貢献と個人成長の両立

# 初期段階：情報収集（質問は3つまで）

## ステップ1: 最初の質問（必ず3つに限定）
ユーザーから業務内容と挑戦の方向性を聞いたら、以下の観点で質問を3つに絞る：

1. **挑戦したい領域**: 具体的にどの分野でスキル向上したいか
2. **現状と目指す姿**: 現在のレベルと期末の理想の状態
3. **成果の測定**: どのような具体的な成果を残したいか

**質問の仕方:**
- 選択肢を提示して選びやすくする
- 抽象的すぎず、具体的すぎない適度なレベル
- ユーザーの状況に応じてカスタマイズ

## ステップ2: 深掘り質問
最初の回答を受けて、さらに必要な情報を収集：
- 技術的な課題の詳細
- リソース（相談相手、学習方法）
- 優先順位
- 期末までの目標イメージ

**重要**: この段階でも、まだ目標案は出さない

# 中間段階：状況の整理と選択肢の提示

## ステップ3: 状況の整理
収集した情報を整理して、ユーザーにフィードバック：

**現状**
[箇条書きで整理]

**目指す姿**
[箇条書きで整理]

**課題**
[箇条書きで整理]

## ステップ4: 複数の選択肢を提示
2-3パターンの目標案を提示し、ユーザーに選んでもらう：
- 各案の特徴（メリット・デメリット）を明記
- ユーザーの状況に応じた推奨を示す
- 「組み合わせ」も可能であることを伝える

# 詳細化段階：目標の具体化

## ステップ5: 目標文の作成
選ばれた方向性に基づいて目標を詳細化：

### 【目標】（1文で）
シンプルで分かりやすい目標文

### 【挑戦の狙い・目的】（200文字程度）
- なぜこの挑戦をするのか
- 個人のスキル向上と組織への貢献をどう両立するか
- 開発プロセスなど、学びたいことを明確に

### 【対象システム/プロジェクトの概要】（200文字程度）
- 何を作るのか
- 主要な機能
- 期待効果

### 【達成基準】
3段階で設定：
- **達成度3（着手）**: 基本的な実装や取り組みが完了
- **達成度4（実用）**: 実用レベルに到達、検証完了
- **達成度5（改善）**: フィードバック反映や改善まで完了（オプション）

各段階で「以下を全て達成」または「以下のうち○つ以上達成」と明記

### 【スケジュール】
- 最初は大まかに（Phase別）
- 要望があれば週次レベルまで詳細化
- 最終的には200文字程度にまとめる

# 技術的な説明

## 説明が必要な場合
ユーザーが技術やツールについて「イメージが湧かない」と言った場合：
1. 具体例を示す（コード例など）
2. 実行方法を説明（ターミナル、exe、サーバーなど）
3. メリット・デメリットを明示
4. 選択肢を提示

## 既存リソースの確認
ユーザーが「要件は明確」「既に作っている」と言った場合：
- LinearやGitHubなど、既存の資料を確認
- 既存の進捗を踏まえてスケジュールを調整
- 不要な工程は省略

# 調整段階：ユーザーの要望への対応

## 文字数調整
「○○文字でまとめて」と言われたら：
- 要点を絞り込む
- 箇条書きを活用
- 重複を削除
- 指定文字数（±10文字程度）に収める

## スケジュール調整
「もっと細かく」と言われたら：
- Phase → 月次 → 週次 と段階的に詳細化
- マイルストーンを明記
- 最終的には200文字程度の要約も用意

## 達成度の調整
「達成度○を△にしたい」と言われたら：
- 基準を調整
- スケジュールも連動して修正
- 現実的かどうかを確認

# 出力フォーマット

## 最終的なMBO文書の構成
【目標】
[1文の目標文]

【挑戦の狙い・目的】（200文字程度）
[なぜこの挑戦をするか]

【対象の概要】（200文字程度）
[何を作るか/何をするか]

【達成基準】
【達成度3：○○】
以下を全て達成：
- ...
- ...
- ...

【達成度4：○○】
達成度3に加えて、以下を達成：
- ...
- ...
- ...

【スケジュール（期末まで）】（200文字程度）
[月次の主要な活動]

# 重要な注意点

1. **ユーザーの言葉を尊重**: 専門用語を勝手に使わず、ユーザーの理解度に合わせる
2. **確認を取る**: 各段階で「これで問題ないか」を確認
3. **柔軟に対応**: 想定外の要望にも対応
4. **前向きな姿勢**: ユーザーの挑戦を応援するトーン
5. **現実的な目標**: 達成不可能な目標は提案しない`;

export const chatWithChallengeAssistant = async (
  messages: ChatMessage[],
  userProfile: UserProfile
): Promise<string> => {
  const apiKey = getOpenAIKey();
  if (!apiKey) {
    throw new Error('OpenAI APIキーが設定されていません。');
  }

  const gradeInfo = getQualificationGrade(userProfile.currentQualificationGrade);

  // システムプロンプトにユーザー情報を追加
  const systemPrompt = `${CHALLENGE_GOAL_SYSTEM_PROMPT}

# ユーザー情報
- 資格等級: ${gradeInfo.name} (${userProfile.currentQualificationGrade})
- 等級レベル: ${gradeInfo.level}
- 役割等級: ${userProfile.currentRoleGrade}
- 部署: ${userProfile.department}
- ポジション: ${userProfile.position}
- 仕事内容: ${userProfile.jobDescription || '未入力'}

この情報を踏まえて、ユーザーの等級に適した挑戦目標を一緒に作成してください。`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`AIチャットエラー: ${error.message}`);
    }
    throw new Error('AIチャット中に不明なエラーが発生しました');
  }
};

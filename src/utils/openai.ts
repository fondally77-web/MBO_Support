import { QualificationGrade, UserProfile, GoalCategory, GoalProposal } from '../types';
import { getQualificationGrade } from '../data/gradeMaster';
import { generateId } from './idGenerator';

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

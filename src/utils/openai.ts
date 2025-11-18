import { QualificationGrade } from '../types';
import { getQualificationGrade } from '../data/gradeMaster';

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

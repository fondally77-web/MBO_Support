import { useState } from 'react';
import { UserProfile, QualificationGrade, RoleGrade, Position } from '../types';
import { generateUserId } from '../utils/idGenerator';
import {
  QUALIFICATION_GRADES,
  ROLE_GRADES,
  getRoleGradesByQualification,
  getQualificationGrade
} from '../data/gradeMaster';

interface ProfileSetupProps {
  onSave: (profile: UserProfile) => void;
}

const POSITIONS: Array<{ value: Position; label: string; description: string }> = [
  { value: 'member', label: 'メンバー', description: '一般メンバーとして業務を遂行' },
  { value: 'team_leader', label: 'チームリーダー', description: 'チームのリーダーとして小規模グループを統括' },
  { value: 'group_leader', label: 'グループリーダー', description: 'グループリーダーとして複数チームを統括' },
];

function ProfileSetup({ onSave }: ProfileSetupProps) {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [qualificationGrade, setQualificationGrade] = useState<QualificationGrade>('TM1');
  const [roleGrade, setRoleGrade] = useState<RoleGrade>('TM1-1');
  const [position, setPosition] = useState<Position>('member');
  const [jobDescription, setJobDescription] = useState('');
  const [gradeAcquiredDate, setGradeAcquiredDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // 資格等級変更時に役割等級をリセット
  const handleQualificationGradeChange = (newQualificationGrade: QualificationGrade) => {
    setQualificationGrade(newQualificationGrade);
    const availableRoleGrades = getRoleGradesByQualification(newQualificationGrade);
    if (availableRoleGrades.length > 0) {
      setRoleGrade(availableRoleGrades[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('名前を入力してください');
      return;
    }

    if (!department.trim()) {
      alert('部署を入力してください');
      return;
    }

    const profile: UserProfile = {
      id: generateUserId(),
      name: name.trim(),
      department: department.trim(),
      currentQualificationGrade: qualificationGrade,
      currentRoleGrade: roleGrade,
      position,
      jobDescription: jobDescription.trim() || undefined,
      gradeAcquiredDate: new Date(gradeAcquiredDate),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onSave(profile);
  };

  // 選択可能な役割等級リスト
  const availableRoleGrades = ROLE_GRADES.filter(
    (rg) => rg.qualificationGrade === qualificationGrade
  );

  // 選択中の資格等級情報
  const selectedQualificationGrade = getQualificationGrade(qualificationGrade);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メインフォーム */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              プロフィール設定
            </h2>
            <p className="text-gray-600 mb-8">
              MBOシステムを始めるために、あなたの基本情報を入力してください。
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 名前 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  名前 <span className="text-danger-600">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="山田 太郎"
                  required
                />
              </div>

              {/* 部署 */}
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                  部署 <span className="text-danger-600">*</span>
                </label>
                <input
                  type="text"
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="input"
                  placeholder="開発部"
                  required
                />
              </div>

              {/* 仕事内容 */}
              <div>
                <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  仕事内容
                </label>
                <textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="input"
                  rows={4}
                  maxLength={300}
                  placeholder="担当業務、使用技術、日常的なタスクなどを具体的に記入してください（AI目標提案機能で活用されます）"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {jobDescription.length}/300文字（任意）
                  {jobDescription.length > 0 && (
                    <span className="ml-2 text-primary-600">
                      ✓ AI目標提案機能が利用可能になります
                    </span>
                  )}
                </p>
              </div>

          {/* 資格等級 */}
          <div>
            <label htmlFor="qualificationGrade" className="block text-sm font-medium text-gray-700 mb-2">
              資格等級 <span className="text-danger-600">*</span>
            </label>
            <select
              id="qualificationGrade"
              value={qualificationGrade}
              onChange={(e) => handleQualificationGradeChange(e.target.value as QualificationGrade)}
              className="input"
              required
            >
              {QUALIFICATION_GRADES.map((grade) => (
                <option key={grade.code} value={grade.code}>
                  {grade.name} ({grade.code})
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              {QUALIFICATION_GRADES.find(g => g.code === qualificationGrade)?.description}
            </p>
          </div>

          {/* 役割等級 */}
          <div>
            <label htmlFor="roleGrade" className="block text-sm font-medium text-gray-700 mb-2">
              役割等級 <span className="text-danger-600">*</span>
            </label>
            <select
              id="roleGrade"
              value={roleGrade}
              onChange={(e) => setRoleGrade(e.target.value as RoleGrade)}
              className="input"
              required
            >
              {availableRoleGrades.map((grade) => (
                <option key={grade.code} value={grade.code}>
                  {grade.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              {availableRoleGrades.find(g => g.code === roleGrade)?.description}
            </p>
          </div>

              {/* ポジション */}
              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                  ポジション <span className="text-danger-600">*</span>
                </label>
                <select
                  id="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value as Position)}
                  className="input"
                  required
                >
                  {POSITIONS.map((pos) => (
                    <option key={pos.value} value={pos.value}>
                      {pos.label}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  {POSITIONS.find(p => p.value === position)?.description}
                </p>
              </div>

              {/* 等級取得日 */}
              <div>
                <label htmlFor="gradeAcquiredDate" className="block text-sm font-medium text-gray-700 mb-2">
                  等級取得日 <span className="text-danger-600">*</span>
                </label>
                <input
                  type="date"
                  id="gradeAcquiredDate"
                  value={gradeAcquiredDate}
                  onChange={(e) => setGradeAcquiredDate(e.target.value)}
                  className="input"
                  required
                />
              </div>

              {/* 送信ボタン */}
              <div className="flex justify-end pt-4">
                <button type="submit" className="btn btn-primary">
                  プロフィールを保存して開始
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 等級別ガイダンス */}
        <div className="lg:col-span-1">
          <div className="card bg-primary-50 border-2 border-primary-200 sticky top-4">
            <h3 className="text-lg font-bold text-primary-900 mb-4">
              等級別ガイダンス
            </h3>

            {selectedQualificationGrade && (
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-primary-700 mb-1">
                    選択中の等級
                  </div>
                  <div className="text-xl font-bold text-primary-900">
                    {selectedQualificationGrade.name}
                  </div>
                  <div className="text-sm text-primary-600 mt-1">
                    レベル {selectedQualificationGrade.level}
                  </div>
                </div>

                <div className="border-t border-primary-200 pt-4">
                  <div className="text-sm font-medium text-primary-700 mb-2">
                    期待される役割
                  </div>
                  <div className="text-sm text-primary-900 leading-relaxed">
                    {selectedQualificationGrade.description}
                  </div>
                </div>

                <div className="border-t border-primary-200 pt-4">
                  <div className="text-sm font-medium text-primary-700 mb-2">
                    ヒント
                  </div>
                  <div className="text-xs text-primary-800 space-y-2">
                    <p>• この等級に応じた目標を設定しましょう</p>
                    <p>• 定期的に進捗を確認し、記録しましょう</p>
                    <p>• 上位等級への成長を意識しましょう</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileSetup;

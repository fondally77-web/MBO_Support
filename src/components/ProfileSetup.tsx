import { useState } from 'react';
import { UserProfile, QualificationGrade, RoleGrade } from '../types';
import { generateUserId } from '../utils/idGenerator';
import {
  QUALIFICATION_GRADES,
  ROLE_GRADES,
  getRoleGradesByQualification
} from '../data/gradeMaster';

interface ProfileSetupProps {
  onSave: (profile: UserProfile) => void;
}

function ProfileSetup({ onSave }: ProfileSetupProps) {
  const [name, setName] = useState('');
  const [qualificationGrade, setQualificationGrade] = useState<QualificationGrade>('TM1');
  const [roleGrade, setRoleGrade] = useState<RoleGrade>('TM1-1');
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

    const profile: UserProfile = {
      id: generateUserId(),
      name: name.trim(),
      currentQualificationGrade: qualificationGrade,
      currentRoleGrade: roleGrade,
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

  return (
    <div className="max-w-2xl mx-auto">
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
  );
}

export default ProfileSetup;

import { UserProfile } from '../types';
import { getGradeLevel } from '../data/gradeMaster';
import { formatDateJP } from '../utils/dateUtils';

interface ProfileCardProps {
  userProfile: UserProfile;
}

const POSITION_LABELS: Record<string, string> = {
  member: 'メンバー',
  team_leader: 'チームリーダー',
  group_leader: 'グループリーダー',
};

function ProfileCard({ userProfile }: ProfileCardProps) {
  const gradeLevel = getGradeLevel(
    userProfile.currentQualificationGrade,
    userProfile.currentRoleGrade
  );

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {userProfile.name}
          </h2>
          <p className="text-gray-600">{userProfile.department}</p>
        </div>
        <span className="badge badge-primary text-base px-4 py-2">
          {POSITION_LABELS[userProfile.position]}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 資格等級 */}
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-4 border border-primary-200">
          <div className="text-xs text-primary-600 font-medium mb-1 uppercase tracking-wide">
            資格等級
          </div>
          <div className="text-lg font-bold text-primary-900">
            {gradeLevel?.qualificationName}
          </div>
          <div className="text-sm text-primary-700 mt-1">
            {userProfile.currentQualificationGrade}
          </div>
        </div>

        {/* 役割等級 */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <div className="text-xs text-gray-600 font-medium mb-1 uppercase tracking-wide">
            役割等級
          </div>
          <div className="text-lg font-bold text-gray-900">
            {gradeLevel?.roleName}
          </div>
          <div className="text-sm text-gray-700 mt-1">
            {userProfile.currentRoleGrade}
          </div>
        </div>

        {/* 等級取得日 */}
        <div className="bg-gradient-to-br from-success-50 to-success-100 rounded-lg p-4 border border-success-200">
          <div className="text-xs text-success-600 font-medium mb-1 uppercase tracking-wide">
            等級取得日
          </div>
          <div className="text-base font-bold text-success-900">
            {formatDateJP(userProfile.gradeAcquiredDate)}
          </div>
        </div>
      </div>

      {/* 等級説明 */}
      {gradeLevel?.description && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">
            期待される役割
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            {gradeLevel.description}
          </p>
        </div>
      )}
    </div>
  );
}

export default ProfileCard;

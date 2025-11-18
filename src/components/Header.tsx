import { UserProfile } from '../types';
import { getQualificationGrade, getRoleGrade } from '../data/gradeMaster';

interface HeaderProps {
  userProfile: UserProfile | null;
}

function Header({ userProfile }: HeaderProps) {
  const qualificationGrade = userProfile
    ? getQualificationGrade(userProfile.currentQualificationGrade)
    : null;
  const roleGrade = userProfile
    ? getRoleGrade(userProfile.currentRoleGrade)
    : null;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">個人用MBOシステム</h1>
            <p className="text-sm text-gray-600 mt-1">目標管理と成長記録</p>
          </div>

          {userProfile && (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {userProfile.name}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="badge badge-primary">
                    {qualificationGrade?.name}
                  </span>
                  <span className="badge badge-gray">
                    {roleGrade?.name}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;

import { UserProfile } from '../types';
import { getQualificationGrade } from '../data/gradeMaster';
import { Page } from '../App';

interface HeaderProps {
  userProfile: UserProfile | null;
  currentPage?: Page;
  onPageChange?: (page: Page) => void;
}

const POSITION_LABELS: Record<string, string> = {
  member: 'メンバー',
  team_leader: 'チームリーダー',
  group_leader: 'グループリーダー',
};

function Header({ userProfile, currentPage = 'dashboard', onPageChange }: HeaderProps) {
  const qualificationGrade = userProfile
    ? getQualificationGrade(userProfile.currentQualificationGrade)
    : null;

  return (
    <header className="bg-gradient-to-r from-primary-600 to-primary-700 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
              <h1 className="text-xl font-bold text-white">MBO</h1>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">個人用MBOシステム</h2>
              <p className="text-xs text-primary-100">目標管理と成長記録</p>
            </div>
          </div>

          {userProfile && (
            <div className="flex items-center space-x-6">
              {/* ユーザー情報 */}
              <div className="text-right">
                <div className="flex items-center justify-end space-x-2 mb-1">
                  <span className="text-sm font-medium text-white">
                    {userProfile.name}
                  </span>
                  <span className="text-xs text-primary-100">
                    ({userProfile.department})
                  </span>
                </div>
                <div className="flex items-center justify-end space-x-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white bg-opacity-20 text-white border border-white border-opacity-30">
                    {POSITION_LABELS[userProfile.position]}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white text-primary-700">
                    {qualificationGrade?.name}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-800 text-white">
                    Lv.{qualificationGrade?.level}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ナビゲーションメニュー */}
      {userProfile && onPageChange && (
        <nav className="bg-primary-800 bg-opacity-50 border-t border-primary-500">
          <div className="container mx-auto px-4">
            <div className="flex space-x-1">
              <button
                onClick={() => onPageChange('dashboard')}
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-lg ${
                  currentPage === 'dashboard'
                    ? 'text-white bg-white bg-opacity-10'
                    : 'text-primary-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
                }`}
              >
                ダッシュボード
              </button>
              <button
                onClick={() => onPageChange('analyzer')}
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-lg ${
                  currentPage === 'analyzer'
                    ? 'text-white bg-white bg-opacity-10'
                    : 'text-primary-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
                }`}
              >
                AI目標アドバイザー
              </button>
              <button
                onClick={() => onPageChange('settings')}
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-lg ml-auto ${
                  currentPage === 'settings'
                    ? 'text-white bg-white bg-opacity-10'
                    : 'text-primary-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
                }`}
              >
                設定
              </button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

export default Header;

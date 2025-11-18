import { UserProfile } from '../types';
import ProfileCard from './ProfileCard';

interface DashboardProps {
  userProfile: UserProfile;
}

function Dashboard({ userProfile }: DashboardProps) {
  return (
    <div className="space-y-6">
      {/* プロフィールカード */}
      <ProfileCard userProfile={userProfile} />

      {/* 目標サマリー */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-4">目標サマリー</h3>
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-4">まだ目標が設定されていません</p>
          <p className="text-sm">「新規目標を追加」ボタンから目標を作成してください</p>
        </div>
      </div>

      {/* クイックアクション */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="card hover:shadow-lg transition-shadow text-left">
          <div className="text-primary-600 text-3xl mb-2">📝</div>
          <h4 className="font-bold text-gray-900 mb-1">新規目標を追加</h4>
          <p className="text-sm text-gray-600">新しいMBO目標を設定します</p>
        </button>

        <button className="card hover:shadow-lg transition-shadow text-left">
          <div className="text-success-600 text-3xl mb-2">📊</div>
          <h4 className="font-bold text-gray-900 mb-1">進捗を確認</h4>
          <p className="text-sm text-gray-600">現在の目標達成状況を確認します</p>
        </button>

        <button className="card hover:shadow-lg transition-shadow text-left">
          <div className="text-warning-600 text-3xl mb-2">⭐</div>
          <h4 className="font-bold text-gray-900 mb-1">評価を記録</h4>
          <p className="text-sm text-gray-600">目標の評価を記録します</p>
        </button>
      </div>
    </div>
  );
}

export default Dashboard;

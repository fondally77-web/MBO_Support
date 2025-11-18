import { UserProfile } from '../types';
import { getGradeLevel } from '../data/gradeMaster';
import { formatDateJP } from '../utils/dateUtils';

interface DashboardProps {
  userProfile: UserProfile;
}

function Dashboard({ userProfile }: DashboardProps) {
  const gradeLevel = getGradeLevel(
    userProfile.currentQualificationGrade,
    userProfile.currentRoleGrade
  );

  return (
    <div className="space-y-6">
      {/* ウェルカムセクション */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ようこそ、{userProfile.name}さん
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-primary-50 rounded-lg p-4">
            <div className="text-sm text-primary-600 font-medium mb-1">資格等級</div>
            <div className="text-xl font-bold text-primary-900">
              {gradeLevel?.qualificationName}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 font-medium mb-1">役割等級</div>
            <div className="text-xl font-bold text-gray-900">
              {gradeLevel?.roleName}
            </div>
          </div>
          <div className="bg-success-50 rounded-lg p-4">
            <div className="text-sm text-success-600 font-medium mb-1">等級取得日</div>
            <div className="text-lg font-bold text-success-900">
              {formatDateJP(userProfile.gradeAcquiredDate)}
            </div>
          </div>
        </div>
      </div>

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

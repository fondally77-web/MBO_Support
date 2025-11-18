import { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProfileSetup from './components/ProfileSetup';
import ObjectiveAnalyzer from './components/ObjectiveAnalyzer';
import Settings from './components/Settings';
import { UserProfile } from './types';
import { loadFromLocalStorage, saveToLocalStorage, STORAGE_KEYS } from './utils/localStorage';

export type Page = 'dashboard' | 'analyzer' | 'settings';

function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  // 初期ロード時にプロフィール情報を取得
  useEffect(() => {
    const loadProfile = () => {
      const savedProfile = loadFromLocalStorage<UserProfile>(STORAGE_KEYS.USER_PROFILE);
      setUserProfile(savedProfile);
      setIsLoading(false);
    };

    loadProfile();
  }, []);

  // プロフィール保存ハンドラ
  const handleSaveProfile = (profile: UserProfile) => {
    saveToLocalStorage(STORAGE_KEYS.USER_PROFILE, profile);
    setUserProfile(profile);
  };

  // プロフィール更新ハンドラ（設定画面から）
  const handleProfileUpdate = () => {
    const savedProfile = loadFromLocalStorage<UserProfile>(STORAGE_KEYS.USER_PROFILE);
    setUserProfile(savedProfile);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        userProfile={userProfile}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <main className="container mx-auto px-4 py-8">
        {!userProfile ? (
          <ProfileSetup onSave={handleSaveProfile} />
        ) : (
          <>
            {currentPage === 'dashboard' && <Dashboard userProfile={userProfile} />}
            {currentPage === 'analyzer' && <ObjectiveAnalyzer userProfile={userProfile} />}
            {currentPage === 'settings' && (
              <Settings userProfile={userProfile} onProfileUpdate={handleProfileUpdate} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;

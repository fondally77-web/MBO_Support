import { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProfileSetup from './components/ProfileSetup';
import { UserProfile } from './types';
import { loadFromLocalStorage, saveToLocalStorage, STORAGE_KEYS } from './utils/localStorage';

function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userProfile={userProfile} />

      <main className="container mx-auto px-4 py-8">
        {!userProfile ? (
          <ProfileSetup onSave={handleSaveProfile} />
        ) : (
          <Dashboard userProfile={userProfile} />
        )}
      </main>
    </div>
  );
}

export default App;

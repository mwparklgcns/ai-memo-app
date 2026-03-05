'use client';

import { useState } from 'react';

interface ProfileLoginProps {
  onLogin: (profile: string) => void;
}

export default function ProfileLogin({ onLogin }: ProfileLoginProps) {
  const [profile, setProfile] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (profile.trim()) {
      onLogin(profile.trim());
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-xs">
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="profile">
              프로필 이름
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="profile"
              type="text"
              placeholder="프로필 이름을 입력하세요"
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              로그인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React from 'react'
import { useAuth } from '../hooks/useAuth'

const GoogleLoginButton: React.FC = () => {
  const { signUpGoogle, error } = useAuth()

  const handleGoogleLogin = async () => {
    try {
      await signUpGoogle()
      console.log('✅ 구글 로그인 성공')
    } catch (err) {
      console.error('❌ 구글 로그인 실패:', err)
    }
  }

  return (
    <div>
      <button
        onClick={handleGoogleLogin}
        className="w-full bg-blue-600 text-black py-3 px-4 ring-1 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Google 계정으로 로그인
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
}

export default GoogleLoginButton
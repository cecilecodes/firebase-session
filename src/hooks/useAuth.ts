// src/hooks/useAuth.ts
import { useState, useEffect } from 'react'
import { 
  createUserWithEmailAndPassword, // 이메일 & 비밀번호로 회원가입
  signInWithEmailAndPassword,     // 이메일 & 비밀번호로 로그인
  signOut,                        // 로그아웃
  onAuthStateChanged,             // 로그인 상태 변경 감지 (실시간)
  type User,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { auth } from '../lib/firebase'

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null)   // 현재 로그인된 유저 정보
    const [loading, setLoading] = useState(true)          // 초기 로딩 상태
    const [error, setError] = useState<string | null>(null) // 에러 메시지

    /**
     * 	•	컴포넌트가 마운트될 때 Firebase의 로그인 상태 변화를 구독
	 * •	로그인/로그아웃이 발생하면 user 상태 자동 업데이트
	 * •	컴포넌트가 언마운트되면 unsubscribe()로 메모리 누수 방지
     */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // 이메일 회원가입
  const signUp = async (email: string, password: string) => {
    try {
      setError(null)
      const result = await createUserWithEmailAndPassword(auth, email, password)
      return result.user
      /* eslint-disable */
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code)
      setError(errorMessage)
      throw error
    }
  }
  // 구글 로그인 및 회원가입
  const signUpGoogle = async () => {
  try {
    setError(null)
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider) // 팝업으로 로그인 가능하게 해줌.
    return result.user
  } catch (error: any) {
    setError('구글 로그인에 실패했습니다.')
    throw error
  }
}

  // 로그인
  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      const result = await signInWithEmailAndPassword(auth, email, password)
      return result.user
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code)
      setError(errorMessage)
      throw error
    }
  }

  const logout = async () => {
    try {
      setError(null)
      await signOut(auth)
    } catch (error: any) {
      setError('로그아웃에 실패했습니다.')
      throw error
    }
  }

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    logout,
    signUpGoogle
  }
}

// Firebase Auth 에러 메시지 한국어 변환
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return '등록되지 않은 이메일입니다.'
    case 'auth/wrong-password':
      return '비밀번호가 올바르지 않습니다.'
    case 'auth/email-already-in-use':
      return '이미 사용 중인 이메일입니다.'
    case 'auth/weak-password':
      return '비밀번호는 6자리 이상이어야 합니다.'
    case 'auth/invalid-email':
      return '유효하지 않은 이메일 형식입니다.'
    case 'auth/too-many-requests':
      return '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
    default:
      return '인증 중 오류가 발생했습니다.'
  }
}
// src/App.tsx
import { useAuth } from './hooks/useAuth'
import Auth from './components/Auth'
import TodoApp from './components/TodoApp'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="fixed inset-0 top-0 left-0 mx-auto w-screen h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">앱을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-screen h-screen flex justify-center items-center">
      {user ? <TodoApp /> : <Auth />}
    </div>
  )
}

export default App
// src/components/TodoApp.tsx
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTodos } from '../hooks/useTodos'
import TodoItem from './TodoItem'

export default function TodoApp() {
  const [newTodo, setNewTodo] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  
  const { user, logout } = useAuth()
  const { 
    todos, 
    loading, 
    error, 
    addTodo, 
    toggleTodo, 
    updateTodoText, 
    deleteTodo, 
    deleteCompletedTodos 
  } = useTodos(user?.uid)

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    await addTodo({ text: newTodo })
    setNewTodo('')
  }

  // 필터링된 Todo 목록
  const filteredTodos = todos.filter(todo => {
    switch (filter) {
      case 'active':
        return !todo.completed
      case 'completed':
        return todo.completed
      default:
        return true
    }
  })

  // 통계
  const stats = {
    total: todos.length,
    completed: todos.filter(todo => todo.completed).length,
    active: todos.filter(todo => !todo.completed).length
  }

  if (loading) {
    return (
      <div className="fixed inset-0 top-0 left-0 mx-auto w-screen h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-auto  bg-slate-100 rounded-xl">
      {/* 헤더 */}
      <header className="bg-slate-400 border-b border-gray-200 px-4 py-4 rounded-t-xl">
        <div className="max-w-2xl mx-auto flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Firebase Todo</h1>
            <p className="text-md text-white">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Todo 추가 폼 */}
        <form onSubmit={handleAddTodo} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="새로운 할일을 입력하세요..."
              className="flex-1 px-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
            <button
              type="submit"
              disabled={!newTodo.trim()}
              className="px-6 py-3 bg-blue-600 text-black ring-1 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              추가
            </button>
          </div>
        </form>

        {/* 통계 및 필터 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              전체 {stats.total}개 · 완료 {stats.completed}개 · 남은 일 {stats.active}개
            </div>
            {stats.completed > 0 && (
              <button
                onClick={deleteCompletedTodos}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                완료된 항목 삭제
              </button>
            )}
          </div>

          {/* 필터 버튼 */}
          <div className="flex gap-2">
            {(['all', 'active', 'completed'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter === filterType
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {filterType === 'all' ? '전체' : filterType === 'active' ? '진행중' : '완료됨'}
              </button>
            ))}
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Todo 목록 */}
        <div className="space-y-3">
          {filteredTodos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? '아직 할일이 없습니다. 새로운 할일을 추가해보세요!' 
                  : filter === 'active' 
                  ? '진행중인 할일이 없습니다.'
                  : '완료된 할일이 없습니다.'
                }
              </p>
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onUpdate={updateTodoText}
                onDelete={deleteTodo}
              />
            ))
          )}
        </div>
      </main>
    </div>
  )
}
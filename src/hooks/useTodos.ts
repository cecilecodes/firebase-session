// src/hooks/useTodos.ts
import { useState, useEffect } from 'react'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  where
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { CreateTodoData, Todo } from '../types/todo'

export const useTodos = (userId?: string) => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 실시간 Todo 구독
  useEffect(() => {
    if (!userId) {
      setTodos([])
      setLoading(false)
      return
    }

    const todosQuery = query(
      collection(db, 'todos'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      todosQuery,
      (snapshot) => {
        const todosData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as Todo[]
        
        setTodos(todosData)
        setLoading(false)
        setError(null)
      },
      (error) => {
        console.error('Error fetching todos:', error)
        setError('할일 목록을 불러오는데 실패했습니다.')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId])

  // Todo 추가
  const addTodo = async (todoData: CreateTodoData) => {
    if (!userId) return

    try {
      const now = new Date()
      await addDoc(collection(db, 'todos'), {
        text: todoData.text.trim(),
        completed: false,
        createdAt: now,
        updatedAt: now,
        userId: userId
      })
    } catch (error) {
      console.error('Error adding todo:', error)
      setError('할일 추가에 실패했습니다.')
    }
  }

  // Todo 완료 상태 토글
  const toggleTodo = async (todoId: string, completed: boolean) => {
    try {
      await updateDoc(doc(db, 'todos', todoId), {
        completed: !completed,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating todo:', error)
      setError('할일 수정에 실패했습니다.')
    }
  }

  // Todo 텍스트 수정
  const updateTodoText = async (todoId: string, newText: string) => {
    try {
      await updateDoc(doc(db, 'todos', todoId), {
        text: newText.trim(),
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating todo text:', error)
      setError('할일 수정에 실패했습니다.')
    }
  }

  // Todo 삭제
  const deleteTodo = async (todoId: string) => {
    try {
      await deleteDoc(doc(db, 'todos', todoId))
    } catch (error) {
      console.error('Error deleting todo:', error)
      setError('할일 삭제에 실패했습니다.')
    }
  }

  // 완료된 Todo 일괄 삭제
  const deleteCompletedTodos = async () => {
    try {
      const completedTodos = todos.filter(todo => todo.completed)
      const deletePromises = completedTodos.map(todo => deleteDoc(doc(db, 'todos', todo.id)))
      await Promise.all(deletePromises)
    } catch (error) {
      console.error('Error deleting completed todos:', error)
      setError('완료된 할일 삭제에 실패했습니다.')
    }
  }

  return {
    todos,
    loading,
    error,
    addTodo,
    toggleTodo,
    updateTodoText,
    deleteTodo,
    deleteCompletedTodos
  }
}
export interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: Date
  updatedAt: Date
  userId?: string
}

export interface CreateTodoData {
  text: string
  completed?: boolean
  userId?: string
}
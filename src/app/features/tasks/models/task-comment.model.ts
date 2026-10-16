export interface TaskComment {
  id: number;
  taskId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskCommentRequest {
  content: string;
}

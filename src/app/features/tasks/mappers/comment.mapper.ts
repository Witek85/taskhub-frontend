import { CommentResponse } from '@openapi/taskhub-service';

import { TaskComment } from '../models/task-comment.model';

export function mapCommentFromApi(comment: CommentResponse, taskId: number): TaskComment {
  return {
    id: comment.id!,
    taskId,
    content: comment.content!,
    createdAt: comment.createdAt!,
    updatedAt: comment.updatedAt!,
  };
}

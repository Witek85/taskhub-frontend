import {
  CreateTaskRequest as ApiCreateTaskRequest,
  CreateTaskRequestPriorityEnum,
  PageTaskResponse,
  ReplaceTaskRequest as ApiReplaceTaskRequest,
  ReplaceTaskRequestPriorityEnum,
  ReplaceTaskRequestStatusEnum,
  TaskResponse,
  UpdateTaskRequest as ApiUpdateTaskRequest,
  UpdateTaskRequestPriorityEnum,
  UpdateTaskRequestStatusEnum,
} from '@openapi/taskhub-service';

import {
  CreateTaskRequest,
  PageResponse,
  Task,
  TaskTag,
  UpdateTaskRequest,
} from '../models/task.model';
import { TaskPriority } from '../models/task-priority.model';
import { TaskStatus } from '../models/task-status.model';

export function mapCreateTaskToApi(request: CreateTaskRequest): ApiCreateTaskRequest {
  return {
    name: request.name,
    description: request.description ?? undefined,
    priority: request.priority as CreateTaskRequestPriorityEnum,
    tagCodes: request.tagCodes,
  };
}

export function mapUpdateTaskToApi(request: Partial<UpdateTaskRequest>): ApiUpdateTaskRequest {
  return {
    name: request.name,
    description: request.description ?? undefined,
    priority: request.priority as UpdateTaskRequestPriorityEnum | undefined,
    status: request.status as UpdateTaskRequestStatusEnum | undefined,
    tagCodes: request.tagCodes,
  };
}

export function mapReplaceTaskToApi(request: UpdateTaskRequest): ApiReplaceTaskRequest {
  return {
    name: request.name ?? '',
    description: request.description ?? undefined,
    priority: request.priority as ReplaceTaskRequestPriorityEnum,
    status: request.status as ReplaceTaskRequestStatusEnum,
    tagCodes: request.tagCodes,
  };
}

export function mapTaskFromApi(task: TaskResponse): Task {
  return {
    id: task.id!,
    name: task.name!,
    description: task.description ?? null,
    createdAt: task.createdAt!,
    updatedAt: task.updatedAt!,
    priority: task.priority as TaskPriority,
    status: task.status as TaskStatus,
    tags: (task.tags ?? []).map(
      (tag): TaskTag => ({
        code: tag.code!,
        label: tag.label!,
        color: tag.color ?? null,
      }),
    ),
  };
}

export function mapTaskPageFromApi(page: PageTaskResponse): PageResponse<Task> {
  return {
    content: (page.content ?? []).map(mapTaskFromApi),
    totalElements: page.totalElements!,
    totalPages: page.totalPages!,
    size: page.size!,
    number: page.number!,
  };
}

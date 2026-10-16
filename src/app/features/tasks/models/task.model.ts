import { FormControl } from '@angular/forms';
import { TaskPriority } from './task-priority.model';
import { TaskStatus } from './task-status.model';

export interface TaskTag {
  code: string;
  label: string;
  color?: string | null;
}

export interface Task {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  priority: TaskPriority;
  status: TaskStatus;
  tags: TaskTag[];
}

export interface CreateTaskRequest {
  name: string;
  description: string | null;
  priority: TaskPriority;
  tagCodes: string[];
}

export interface UpdateTaskRequest {
  name?: string;
  description?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  tagCodes?: string[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface TaskSearchCriteria {
  name?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  createdFrom?: string;
  createdTo?: string;
}

export type TaskFormControls = {
  name: FormControl<string | null>;
  description: FormControl<string | null>;
  priority: FormControl<TaskPriority | null>;
  tagCodes: FormControl<string[] | null>;
};

export type TaskFilterFormControls = {
  name: FormControl<string | null>;
  priority: FormControl<TaskPriority | null>;
  status: FormControl<TaskStatus | null>;
  createdFrom: FormControl<Date | null>;
  createdTo: FormControl<Date | null>;
};

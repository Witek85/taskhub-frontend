import { Injectable, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TaskFilterFormControls } from '../../models/task.model';
import { TaskPriority } from '../../models/task-priority.model';
import { TaskStatus } from '../../models/task-status.model';

@Injectable()
export class TaskListPageStateService {
  public readonly page: WritableSignal<number> = signal(0);
  public readonly size: WritableSignal<number> = signal(10);
  public readonly first: WritableSignal<number> = signal(0);
  public readonly totalElements: WritableSignal<number> = signal(0);
  public readonly totalPages: WritableSignal<number> = signal(0);
  public readonly sortField: WritableSignal<string> = signal('createdAt');
  public readonly sortOrder: WritableSignal<number> = signal(-1);

  public get taskFilterForm(): FormGroup<TaskFilterFormControls> {
    return this._taskFilterForm;
  }

  public setPageData(totalElements: number, totalPages: number, page: number, size: number): void {
    this.totalElements.set(totalElements);
    this.totalPages.set(totalPages);
    this.page.set(page);
    this.size.set(size);
  }

  public setSort(field: string, order: number): void {
    this.sortField.set(field);
    this.sortOrder.set(order);
  }

  public resetPagination(): void {
    this.page.set(0);
    this.first.set(0);
  }

  public resetSort(): void {
    this.sortField.set('createdAt');
    this.sortOrder.set(-1);
  }

  private _taskFilterForm: FormGroup<TaskFilterFormControls> = new FormGroup({
    name: new FormControl<string | null>(null),
    priority: new FormControl<TaskPriority | null>(null),
    status: new FormControl<TaskStatus | null>(null),
    createdFrom: new FormControl<Date | null>(null),
    createdTo: new FormControl<Date | null>(null),
  });
}

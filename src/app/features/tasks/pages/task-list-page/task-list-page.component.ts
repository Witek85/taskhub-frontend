import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { TaskApiService } from '../../api/task-api.service';
import { Task, TaskSearchCriteria } from '../../models/task.model';
import { LoaderService } from '../../../../core/loader/loader.service';
import { ConfirmationService } from 'primeng/api';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TaskListPageStateService } from './task-list-page-state-service';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TaskPriority } from '../../models/task-priority.model';
import { TaskStatus } from '../../models/task-status.model';
import { DictionaryOption } from '../../models/dictionary-option.model';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { DatePipe } from '@angular/common';
import { TableLazyLoadEvent } from 'primeng/table';
import { TagPillComponent } from '../../../../shared/components/tag-pill/tag-pill.component';

@Component({
  selector: 'app-task-list-page',
  imports: [
    TableModule,
    ButtonModule,
    TagPillComponent,
    ConfirmDialogModule,
    ReactiveFormsModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    DatePipe,
  ],
  providers: [ConfirmationService, TaskListPageStateService],
  templateUrl: './task-list-page.component.html',
  styleUrl: './task-list-page.component.scss',
})
export class TaskListPageComponent implements OnInit {
  tasks = signal<Task[]>([]);
  loading = signal(false);
  public priorities = signal<DictionaryOption<TaskPriority>[]>([]);
  public statuses = signal<DictionaryOption<TaskStatus>[]>([]);
  public searchCriteria = signal<TaskSearchCriteria>({});

  public readonly taskListPageStateService: TaskListPageStateService =
    inject(TaskListPageStateService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly loaderService = inject(LoaderService);
  private readonly taskApi = inject(TaskApiService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);

  public ngOnInit(): void {
    this.getPriorities();
    this.getStatuses();
  }

  public onClear(): void {
    this.taskListPageStateService.taskFilterForm.reset({
      name: null,
      priority: null,
      status: null,
      createdFrom: null,
      createdTo: null,
    });

    this.searchCriteria.set({});
    this.taskListPageStateService.resetPagination();
    this.taskListPageStateService.resetSort();

    this.loadTasks(0, this.taskListPageStateService.size());
  }

  public onSubmit(): void {
    const criteria = this.buildSearchCriteria();

    this.searchCriteria.set(criteria);
    this.taskListPageStateService.resetPagination();
    this.taskListPageStateService.resetSort();

    this.loadTasks(0, this.taskListPageStateService.size());
  }

  public loadTasks(
    page = this.taskListPageStateService.page(),
    size = this.taskListPageStateService.size(),
  ): void {
    this.loading.set(true);

    this.taskApi
      .getTasks(this.searchCriteria(), page, size, this.buildSortParam())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (response) => {
          this.tasks.set(response.content);

          this.taskListPageStateService.setPageData(
            response.totalElements,
            response.totalPages,
            response.number,
            response.size,
          );
        },
        error: (err) => {
          console.log('error', err);
        },
      });
  }

  public onLazyLoadTasks(event: TableLazyLoadEvent): void {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.taskListPageStateService.size();

    const page = Math.floor(first / rows);
    const size = rows;

    const sortField =
      typeof event.sortField === 'string'
        ? event.sortField
        : this.taskListPageStateService.sortField();

    const sortOrder = event.sortOrder ?? this.taskListPageStateService.sortOrder();

    this.taskListPageStateService.setSort(sortField, sortOrder);
    this.taskListPageStateService.first.set(first);

    this.scrollToTop();
    this.loadTasks(page, size);
  }

  public openTask(task: Task): void {
    this.router.navigate(['/tasks', task.id]);
  }

  public editTask(event: Event, taskId: number): void {
    event.stopPropagation();
    this.router.navigate(['/tasks', taskId, 'edit']);
  }

  public onDeleteTask(event: Event, taskId: number): void {
    event.stopPropagation();

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected task?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger',
      },
      accept: () => {
        this.deleteTask(taskId);
      },
    });
  }

  private deleteTask(taskId: number): void {
    this.loaderService.startLoading();

    this.taskApi
      .deleteTask(taskId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loaderService.completeLoading();
        }),
      )
      .subscribe({
        next: () => {
          this.loadTasks();
        },
        error: (err: string) => {
          console.log('error', err);
        },
      });
  }

  private getPriorities(): void {
    this.taskApi
      .getPriorities()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.priorities.set(res);
      });
  }

  private getStatuses(): void {
    this.taskApi
      .getStatuses()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.statuses.set(res);
      });
  }

  private buildSearchCriteria(): TaskSearchCriteria {
    const value = this.taskListPageStateService.taskFilterForm.getRawValue();

    return {
      name: value.name?.trim() || undefined,
      priority: value.priority || undefined,
      status: value.status || undefined,
      createdFrom: this.toDateParam(value.createdFrom),
      createdTo: this.toDateParam(value.createdTo),
    };
  }

  private buildSortParam(): string {
    const field = this.taskListPageStateService.sortField();
    const direction = this.taskListPageStateService.sortOrder() === 1 ? 'asc' : 'desc';

    return `${field},${direction}`;
  }

  private toDateParam(date: Date | null): string | undefined {
    if (!date) {
      return undefined;
    }

    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
}

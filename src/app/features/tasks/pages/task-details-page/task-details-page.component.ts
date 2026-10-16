import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CardModule } from 'primeng/card';

import { TaskApiService } from '../../api/task-api.service';
import { Task } from '../../models/task.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { finalize, switchMap } from 'rxjs/operators';
import { TaskComment } from '../../models/task-comment.model';
import { LoaderService } from '../../../../core/loader/loader.service';
import { TagPillComponent } from '../../../../shared/components/tag-pill/tag-pill.component';
import { of } from 'rxjs/internal/observable/of';

@Component({
  selector: 'app-task-details-page',
  imports: [CardModule, TagPillComponent, DatePipe, FormsModule, TextareaModule, ButtonModule],
  templateUrl: './task-details-page.component.html',
  styleUrl: './task-details-page.component.scss',
})
export class TaskDetailsPageComponent implements OnInit {
  task = signal<Task | null>(null);
  loading = signal(false);

  public comments = signal<TaskComment[]>([]);
  public newComment = signal('');
  public taskId = signal<number | null>(null);

  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly loaderService: LoaderService = inject(LoaderService);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly taskApi: TaskApiService,
  ) {}

  public ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      return;
    }

    this.taskId.set(id);
    this.loading.set(true);

    this.taskApi
      .getTaskById(id)
      .pipe(
        switchMap((task) => {
          this.task.set(task);

          return this.taskApi.getCommentsByTaskId(task.id);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (comments) => {
          this.comments.set(comments);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  public addComment(): void {
    const taskId = this.taskId();
    const content = this.newComment().trim();

    if (!taskId || !content) {
      return;
    }

    this.loaderService.startLoading();

    this.taskApi
      .createComment(taskId, { content })
      .pipe(
        switchMap(() => this.taskApi.getCommentsByTaskId(taskId)),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loaderService.completeLoading()),
      )
      .subscribe({
        next: (comments) => {
          this.comments.set(comments);
          this.newComment.set('');
        },
        error: (err) => {
          console.log('error', err);
        },
      });
  }
}

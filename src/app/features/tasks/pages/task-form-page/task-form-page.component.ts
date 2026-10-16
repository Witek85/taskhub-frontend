import { AfterViewInit, Component, DestroyRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { DialogModule } from 'primeng/dialog';
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';

import { TaskApiService } from '../../api/task-api.service';
import { DictionaryOption } from '../../models/dictionary-option.model';
import { TaskPriority } from '../../models/task-priority.model';
import { FluidModule } from 'primeng/fluid';
import { TaskFormPageStateService } from './task-form-page-state-service';
import { Task, TaskFormControls } from '../../models/task.model';
import { FormControlErrorStateDirective } from '../../../../shared/directives/form-control-error-state.directive';
import { LoaderService } from '../../../../core/loader/loader.service';
import { finalize, startWith } from 'rxjs';

@Component({
  standalone: true,
  selector: 'ws-task-form',
  imports: [
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    ButtonModule,
    FluidModule,
    FormControlErrorStateDirective,
    DialogModule,
    MultiSelectModule,
  ],
  providers: [TaskFormPageStateService],
  templateUrl: './task-form-page.component.html',
  styleUrl: './task-form-page.component.scss',
})
export class TaskFormPageComponent implements OnInit, AfterViewInit {
  @ViewChild('tagSelect') private tagSelect?: MultiSelect;
  private readonly taskApi = inject(TaskApiService);
  private readonly route = inject(ActivatedRoute);

  public readonly TaskFormPageStateService: TaskFormPageStateService =
    inject(TaskFormPageStateService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly loaderService = inject(LoaderService);

  public priorities = signal<DictionaryOption<TaskPriority>[]>([]);
  public showDialog = signal<boolean>(false);
  public dialogMessage = signal<string>('');
  public editMode = signal<boolean>(false);
  public tags = signal<DictionaryOption[]>([]);

  public task!: Task;

  public ngOnInit(): void {
    const mode = this.route.snapshot.data['mode'];

    if (mode === 'edit') {
      this.editMode.set(true);
      const id = this.route.snapshot.paramMap.get('id');
      this.loadTask(Number(id));
    }

    this.getPriorities();
    this.getTags();
  }

  public ngAfterViewInit(): void {
    const tagCodes = this.TaskFormPageStateService.taskForm.controls.tagCodes;
    tagCodes.valueChanges
      .pipe(startWith(tagCodes.value), takeUntilDestroyed(this.destroyRef))
      .subscribe((codes) => this.tagSelect?.writeValue(codes ?? []));
  }

  public onTagsChange(codes: string[]): void {
    this.TaskFormPageStateService.taskForm.controls.tagCodes.setValue(codes);
  }

  public onClear(): void {
    this.TaskFormPageStateService.taskForm.reset();
  }

  public onClose(): void {
    this.showDialog.set(false);
    this.dialogMessage.set('');
  }

  public onSubmit(): void {
    const form = this.TaskFormPageStateService.taskForm;
    if (form.invalid) {
      form.markAllAsTouched();
      form.updateValueAndValidity();
      return;
    }

    if (this.editMode()) {
      this.updateTask();
    } else {
      this.createTask();
    }
  }

  public isInvalid(controlName: keyof TaskFormControls): boolean {
    const control = this.TaskFormPageStateService.taskForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  private getPriorities(): void {
    this.taskApi
      .getPriorities()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.priorities.set(res);
      });
  }

  private getTags(): void {
    this.taskApi
      .getTags()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.tags.set(res);
      });
  }

  private loadTask(id: number): void {
    this.loaderService.startLoading();
    this.taskApi
      .getTaskById(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loaderService.completeLoading();
        }),
      )
      .subscribe({
        next: (task) => {
          this.task = task;
          this.TaskFormPageStateService.updateForm(task);
        },
        error: (err) => {
          console.log('error, err');
        },
      });
  }

  private createTask(): void {
    const value = this.TaskFormPageStateService.taskForm.getRawValue();

    if (!value.name || !value.priority) {
      return;
    }

    this.loaderService.startLoading();
    this.taskApi
      .createTask({
        name: value.name,
        description: value.description,
        priority: value.priority,
        tagCodes: value.tagCodes ?? [],
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loaderService.completeLoading();
        }),
      )
      .subscribe({
        next: (task) => {
          this.showDialog.set(true);
          this.dialogMessage.set('Task has been succesfully created');
          this.onClear();
        },
        error: (err) => {
          console.log('error', err);
        },
      });
  }

  private updateTask(): void {
    const value = this.TaskFormPageStateService.taskForm.getRawValue();

    if (!value.name || !value.priority) {
      return;
    }

    this.loaderService.startLoading();
    this.taskApi
      .updateTask(this.task.id, {
        name: value.name,
        description: value.description,
        priority: value.priority,
        status: this.task.status,
        tagCodes: value.tagCodes ?? [],
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loaderService.completeLoading();
        }),
      )
      .subscribe({
        next: (task) => {
          this.showDialog.set(true);
          this.dialogMessage.set('Task has been succesfully updated');
        },
        error: (err) => {
          console.log('error', err);
        },
      });
  }
}

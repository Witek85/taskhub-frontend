import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Task, TaskFormControls } from '../../models/task.model';
import { TaskPriority } from '../../models/task-priority.model';

@Injectable()
export class TaskFormPageStateService {
  public get taskForm(): FormGroup<TaskFormControls> {
    return this._taskForm;
  }

  private _taskForm: FormGroup<TaskFormControls> = new FormGroup({
    name: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(255)]),
    description: new FormControl<string | null>(null, [Validators.maxLength(2000)]),
    priority: new FormControl<TaskPriority | null>(null, [Validators.required]),
    tagCodes: new FormControl<string[] | null>([]),
  });

  public updateForm(task: Task): void {
    this.taskForm.patchValue({
      name: task.name,
      description: task.description,
      priority: task.priority,
      tagCodes: task.tags.map((tag) => tag.code),
    });
  }
}

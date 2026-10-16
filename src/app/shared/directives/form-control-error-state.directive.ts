import { Directive, DoCheck, HostBinding, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appFormControlErrorState]',
  standalone: true,
})
export class FormControlErrorStateDirective {
  private readonly ngControl = inject(NgControl, { self: true, optional: true });

  @HostBinding('class.ng-invalid')
  get invalidClass(): boolean {
    return this.isInvalid();
  }

  @HostBinding('class.ng-dirty')
  get dirtyClass(): boolean {
    return this.isInvalid();
  }

  private isInvalid(): boolean {
    const control = this.ngControl?.control;

    if (!control) {
      return false;
    }

    return control.invalid && (control.touched || control.dirty);
  }
}

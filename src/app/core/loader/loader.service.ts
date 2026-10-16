import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private requestsCount = 0;

  readonly isLoading = signal(false);

  startLoading(): void {
    this.requestsCount++;
    this.isLoading.set(true);
  }

  completeLoading(): void {
    this.requestsCount = Math.max(0, this.requestsCount - 1);

    if (this.requestsCount === 0) {
      this.isLoading.set(false);
    }
  }

  reset(): void {
    this.requestsCount = 0;
    this.isLoading.set(false);
  }
}

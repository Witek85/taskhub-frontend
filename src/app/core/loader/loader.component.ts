import { Component, inject } from '@angular/core';
import { LoaderService } from './loader.service';

import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'ws-loader',
  standalone: true,
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
  imports: [ProgressSpinnerModule],
})
export class LoaderComponent {
  readonly loaderService = inject(LoaderService);
}

import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'ws-tag-pill',
  standalone: true,
  templateUrl: './tag-pill.component.html',
  styleUrl: './tag-pill.component.scss',
})
export class TagPillComponent {
  public value = input.required<string>();
  public color = input<string | null>(null);

  private readonly defaultColor = '#64748b'; // slate/primary grey-blue

  public backgroundColor = computed(() => {
    const color = this.color() || this.defaultColor;
    return `${color}22`;
  });

  public textColor = computed(() => {
    const color = this.color() || this.defaultColor;
    return this.darkenHexColor(color, 25);
  });

  private darkenHexColor(hex: string, percent: number): string {
    const normalized = hex.replace('#', '');

    const r = parseInt(normalized.substring(0, 2), 16);
    const g = parseInt(normalized.substring(2, 4), 16);
    const b = parseInt(normalized.substring(4, 6), 16);

    const factor = (100 - percent) / 100;

    return `rgb(${Math.round(r * factor)}, ${Math.round(g * factor)}, ${Math.round(b * factor)})`;
  }
}

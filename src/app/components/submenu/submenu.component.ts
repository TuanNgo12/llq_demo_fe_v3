import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';

@Component({
  selector: 'app-ph-submenu',
  standalone: true,
  imports: [TuiIcon],
  templateUrl: './submenu.component.html',
  styleUrl: './submenu.component.scss',
})
export class SubmenuComponent {
  @Input() items: string[] = [];

  @Input() active = '';

  @Output() readonly activeChange = new EventEmitter<string>();

  @Input() collapsed = false;

  @Output() readonly collapsedChange = new EventEmitter<boolean>();

  protected select(item: string): void {
    this.activeChange.emit(item);
  }

  protected toggle(): void {
    this.collapsedChange.emit(!this.collapsed);
  }
}

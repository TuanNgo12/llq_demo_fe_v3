import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';
import { MenuItem } from '../../models/menu-item.model';

@Component({
  selector: 'app-ph-menu',
  standalone: true,
  imports: [TuiIcon],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {
  /** List of icon items rendered in the sidebar. */
  @Input() items: MenuItem[] = [];

  /** Whether the sidebar shows icon-only (true) or icon + label (false). */
  @Input() collapsed = false;

  /** Emits the new collapsed state when the user toggles the sidebar. */
  @Output() readonly collapsedChange = new EventEmitter<boolean>();

  protected toggle(): void {
    this.collapsedChange.emit(!this.collapsed);
  }
}

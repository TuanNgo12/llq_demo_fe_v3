import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiButton, TuiIcon, TuiLabel, TuiTextfield } from '@taiga-ui/core';
import { TuiTextarea } from '@taiga-ui/kit';

@Component({
  selector: 'app-ph-delete-confirm-dialog',
  standalone: true,
  imports: [FormsModule, TuiButton, TuiIcon, TuiTextarea, TuiTextfield],
  templateUrl: './delete-confirm-dialog.component.html',
  styleUrl: './delete-confirm-dialog.component.scss',
})
export class DeleteConfirmDialogComponent {

  @Input() recordLabel = '';
  @Output() readonly confirm = new EventEmitter<string>();
  @Output() readonly cancel = new EventEmitter<void>();

  protected reason = '';
  protected touched = false;

  protected onConfirm(): void {
    this.touched = true;
    this.confirm.emit(this.reason.trim());
  }
}

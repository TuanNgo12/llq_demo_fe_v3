import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiButton, TuiTextfield } from '@taiga-ui/core';
import { TuiTextarea } from '@taiga-ui/kit';

@Component({
  selector: 'app-ph-reject-reason-dialog',
  standalone: true,
  imports: [FormsModule, TuiButton, TuiTextarea, TuiTextfield],
  templateUrl: './reject-reason-dialog.component.html',
  styleUrl: './reject-reason-dialog.component.scss',
})
export class RejectReasonDialogComponent {

  @Input() count = 1;
  @Output() readonly confirm = new EventEmitter<string>();
  @Output() readonly cancel = new EventEmitter<void>();

  protected reason = '';
  protected touched = false;

  protected get isValid(): boolean {
    return this.reason.trim().length > 0;
  }

  protected onConfirm(): void {
    this.touched = true;
    if (!this.isValid) {
      return;
    }
    console.log('Rejecting reason:', this.reason.trim());
    this.confirm.emit(this.reason.trim());
  }
}

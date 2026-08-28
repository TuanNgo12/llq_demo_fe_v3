import { Component, inject } from '@angular/core';
import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';
import { TuiIcon } from '@taiga-ui/core';
import { APP_ROLES } from '../../../models/auth.model';
import { GROUP_CATEGORY_STATUS, GroupCategory } from '../../../models/group-category.model';
import { AuthService } from '../../../services/auth/auth.service';

/** Extra params passed in via `colDef.cellRendererParams` (record-table.component.ts). */
export interface ActionsCellParams extends ICellRendererParams<GroupCategory> {
  onEdit: (row: GroupCategory) => void;
  onCopy: (row: GroupCategory) => void;
  onDelete: (row: GroupCategory) => void;
}

/** AG Grid cell renderer for the "Thao tác" column (Sửa / Sao chép / Xóa). */
@Component({
  selector: 'app-ph-actions-cell',
  standalone: true,
  imports: [TuiIcon],
  template: `
    <div class="row-actions">
      @if (canCopy) {
      <button type="button" class="row-actions__btn row-actions__btn_copy" title="Sao chép" (click)="copy()">
        <tui-icon icon="@tui.copy" />
      </button>
      }
      @if(canEdit){
      <button type="button" class="row-actions__btn row-actions__btn_edit" title="Sửa" (click)="edit()">
        <tui-icon icon="@tui.pencil" />
      </button>
      }
      @if(canDelete){
      <button type="button" class="row-actions__btn row-actions__btn_delete" title="Xóa" (click)="delete()">
        <tui-icon icon="@tui.trash-2" />
      </button>
      }
      @if (!canCopy && !canEdit && !canDelete) {
      <span class="row-actions__none">—</span>
      }
    </div>
  `,
  styleUrl: './actions-cell.component.scss',
})
export class ActionsCellComponent implements ICellRendererAngularComp {

  private readonly auth = inject(AuthService);

  private params!: ActionsCellParams;

  protected canEdit = true;

  protected canCopy = true;

  protected canDelete = true;

  agInit(params: ActionsCellParams): void {
    this.setParams(params);
  }

  refresh(params: ActionsCellParams): boolean {
    this.setParams(params);
    return true;
  }

  private setParams(params: ActionsCellParams): void {
    this.params = params;
    const isLocked =
      params.data?.status === GROUP_CATEGORY_STATUS.APPROVED ||
      params.data?.status === GROUP_CATEGORY_STATUS.PENDING;
    const is_Display = params.data?.isDisplay == 2;
    // Sao chép/Sửa/Xóa đều dẫn tới /add hoặc /update hoặc /delete ở BE — cả 3
    // endpoint này chỉ MAKER được gọi (xem GroupCategoryController), nên
    // CHECKER sẽ không thấy 3 nút này ở bất kỳ dòng nào.
    const isMaker = this.auth.hasRole(APP_ROLES.MAKER);
    this.canCopy = isMaker;
    this.canEdit = !isLocked && isMaker;
    this.canDelete = !is_Display && !isLocked && isMaker;
  }

  protected edit(): void {
    if (this.params.data) {
      this.params.onEdit(this.params.data);
    }
  }

  protected copy(): void {
    if (this.params.data) {
      this.params.onCopy(this.params.data);
    }
  }

  protected delete(): void {
    if (this.params.data) {
      this.params.onDelete(this.params.data);
    }
  }
}
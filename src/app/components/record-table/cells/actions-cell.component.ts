import { Component, inject } from '@angular/core';
import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';
import { TuiIcon } from '@taiga-ui/core';
import { APP_ROLES } from '../../../models/auth.model';
import { GROUP_CATEGORY_STATUS, GroupCategory } from '../../../models/group-category.model';
import { AuthService } from '../../../services/auth/auth.service';
import { HasRoleDirective } from '../../../directive/has-role.directive';


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
  imports: [TuiIcon, HasRoleDirective],
  template: `
    <div class="row-actions">
      <button *appHasRole="[APP_ROLES.MAKER, APP_ROLES.ADMIN]" tuiButton type="button"
        class="row-actions__btn row-actions__btn_copy" title="Sao chép" (click)="copy()">
        <tui-icon icon="@tui.copy" />
      </button>
      @if(notLocked){
      <button *appHasRole="[APP_ROLES.MAKER, APP_ROLES.ADMIN]" type="button" class="row-actions__btn row-actions__btn_edit" title="Sửa" (click)="edit()">
        <tui-icon icon="@tui.pencil" />
      </button>
      }
      @if(notLocked && notHidden){
      <button *appHasRole="APP_ROLES.ADMIN" type="button" class="row-actions__btn row-actions__btn_delete" title="Xóa" (click)="delete()">
        <tui-icon icon="@tui.trash-2" />
      </button>
      }
    </div>
  `,
  styleUrl: './actions-cell.component.scss',
})
export class ActionsCellComponent implements ICellRendererAngularComp {
  protected readonly APP_ROLES = APP_ROLES;

  private readonly auth = inject(AuthService);

  private params!: ActionsCellParams;

  protected notLocked = true;

  protected notHidden = true;

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
    const isDisplay = params.data?.isDisplay == 2;
    // Sao chép/Sửa/Xóa đều dẫn tới /add hoặc /update hoặc /delete ở BE — cả 3
    // endpoint này chỉ MAKER được gọi (xem GroupCategoryController), nên
    // CHECKER sẽ không thấy 3 nút này ở bất kỳ dòng nào.
    // const isMaker = this.auth.hasRole(APP_ROLES.MAKER);
    // const isAdmin = this.auth.hasRole(APP_ROLES.ADMIN);
    this.notLocked = !isLocked;
    this.notHidden = !isDisplay;
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
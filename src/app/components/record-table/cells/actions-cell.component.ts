import { Component } from '@angular/core';
import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';
import { TuiIcon } from '@taiga-ui/core';
import { GROUP_CATEGORY_STATUS, GroupCategory } from '../../../models/group-category.model';

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
      <button type="button" class="row-actions__btn row-actions__btn_copy" title="Sao chép" (click)="copy()">
        <tui-icon icon="@tui.copy" />
      </button>
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
    </div>
  `,
  styleUrl: './actions-cell.component.scss',
})
export class ActionsCellComponent implements ICellRendererAngularComp {

  private params!: ActionsCellParams;

  protected canEdit = true;

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
    this.canEdit = !isLocked;
    this.canDelete = !is_Display && !isLocked;
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

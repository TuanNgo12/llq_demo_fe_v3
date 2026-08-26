import { Component } from '@angular/core';
import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';
import { TuiBadge } from '@taiga-ui/kit';
import {
  GroupCategory,
  GROUP_CATEGORY_STATUS,
  groupCategoryStatusConfig,
  groupCategoryStatusLabel,
  GroupCategoryStatusConfig,
} from '../../../models/group-category.model';

@Component({
  selector: 'app-ph-status-cell',
  standalone: true,
  imports: [TuiBadge],
  template: `
       @if (data) {
      <span
        tuiBadge
        size="m"
        class="status-badge"
        [style.background-color]="config.background"
        [style.color]="config.color"
      >
        <span
          class="status-icon"
          [style.background-color]="
           data.status === GROUP_CATEGORY_STATUS.NEW ? 'transparent' : config.color
          "
          [style.color]="
            data.status === GROUP_CATEGORY_STATUS.NEW ? config.color : '#ffffff'
          "
        >       
        </span>
        {{ data.status }} - {{ label }}
      </span>
    }
  `,
})
export class StatusCellComponent implements ICellRendererAngularComp {

  protected readonly GROUP_CATEGORY_STATUS = GROUP_CATEGORY_STATUS;

  protected data?: GroupCategory;

  protected label = '';

  protected config: GroupCategoryStatusConfig =
    groupCategoryStatusConfig(1);

  agInit(params: ICellRendererParams<GroupCategory>): void {
    this.setData(params);
  }

  refresh(params: ICellRendererParams<GroupCategory>): boolean {
    this.setData(params);

    return true;
  }

  private setData(params: ICellRendererParams<GroupCategory>): void {
    this.data = params.data;

    if (!this.data) {
      this.label = '';
      this.config = groupCategoryStatusConfig(1);
      return;
    }

    this.label = groupCategoryStatusLabel(this.data.status);

    this.config = groupCategoryStatusConfig(this.data.status);
  }
}

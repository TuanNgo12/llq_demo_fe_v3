import { Component } from '@angular/core';
import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';
import {
    GroupCategory,
    groupCategoryActiveLabel,
} from '../../../models/group-category.model';

/** AG Grid cell renderer for the "Trạng thái hoạt động" column  */
@Component({
    selector: 'app-ph-is-active-cell',
    standalone: true,
    imports: [],
    template: `
    @if (data) {
      <span> {{ label }} </span>
    }
  `,
})
export class IsActiveCellComponent implements ICellRendererAngularComp {
    protected data?: GroupCategory;
    protected label = '';


    agInit(params: ICellRendererParams<GroupCategory>): void {
        this.setData(params);
    }

    refresh(params: ICellRendererParams<GroupCategory>): boolean {
        this.setData(params);

        return true;
    }

    private setData(params: ICellRendererParams<GroupCategory>): void {
        this.data = params.data;
        this.label = this.data ? groupCategoryActiveLabel(this.data.isActive) : '';
    }
}

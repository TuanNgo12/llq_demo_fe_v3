import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import {
  GROUP_CATEGORY_DISPLAY,
  GROUP_CATEGORY_STATUS,
  GroupCategory,
  groupCategoryStatusConfig,
  groupCategoryStatusLabel,
} from '../../models/group-category.model';

type DetailKey =
  | 'paramName'
  | 'paramValue'
  | 'paramType'
  | 'componentCode'
  | 'effectiveDate'
  | 'endEffectiveDate'
  | 'description';

interface DetailField {
  label: string;
  key: DetailKey;
}

const DETAIL_FIELDS: DetailField[] = [
  { label: 'Tên thành phần', key: 'paramName' },
  { label: 'Giá trị thành phần', key: 'paramValue' },
  { label: 'Danh mục theo nhóm', key: 'paramType' },
  { label: 'Cấu phần xử lý', key: 'componentCode' },
  { label: 'Ngày hiệu lực', key: 'effectiveDate' },
  { label: 'Ngày hết hiệu lực', key: 'endEffectiveDate' },
  { label: 'Mô tả', key: 'description' },
];

@Component({
  selector: 'app-ph-record-detail-dialog',
  standalone: true,
  imports: [TuiBadge, TuiButton, TuiIcon],
  templateUrl: './record-detail-dialog.component.html',
  styleUrl: './record-detail-dialog.component.scss',
})
export class RecordDetailDialogComponent {

  private _record!: GroupCategory;

  @Input({ required: true })
  set record(value: GroupCategory) {
    this._record = value;

    if (value.newData) {
      this.oldRecord = value;

      this.newRecord = {
        ...value,
        ...JSON.parse(value.newData),
      };
    } else {
      this.oldRecord = undefined;
      this.newRecord = value;
    }
  }

  get record(): GroupCategory {
    return this._record;
  }

  @Output() readonly cancel = new EventEmitter<GroupCategory>();

  @Output() readonly deleteRecord = new EventEmitter<GroupCategory>();

  @Output() readonly submitForApproval = new EventEmitter<number>();

  @Output() readonly approve = new EventEmitter<number>();

  @Output() readonly reject = new EventEmitter<GroupCategory>();

  protected readonly fields = DETAIL_FIELDS;

  protected readonly GROUP_CATEGORY_STATUS = GROUP_CATEGORY_STATUS;

  protected oldRecord?: GroupCategory;

  protected newRecord!: GroupCategory;

  protected get statusLabel(): string {
    return groupCategoryStatusLabel(this.record.status);
  }

  protected get statusConfig() {
    return groupCategoryStatusConfig(this.record.status);
  }

  protected get canDelete(): boolean {
    return this.record.isDisplay !== GROUP_CATEGORY_DISPLAY.NOT_DELETE;
  }

  protected oldValue(key: DetailKey): string {
    return this.formatValue(this.oldRecord?.[key]);
  }

  protected newValue(key: DetailKey): string {
    return this.formatValue(this.newRecord[key]);
  }

  protected isChanged(key: DetailKey): boolean {
    if (!this.oldRecord) {
      return false;
    }

    return this.formatValue(this.oldRecord[key]) !==
      this.formatValue(this.newRecord[key]);
  }

  private formatValue(value: unknown): string {
    if (!value || value === '-') {
      return '-';
    }

    if (typeof value === 'object') {
      return (value as { componentCode?: string }).componentCode ?? '-';
    }

    return String(value);
  }

  protected get hasOldData(): boolean {
    return !!this.oldRecord;
  }

  protected value(key: DetailKey): string {
    const v = this.record[key];

    if (!v || v === '-') {
      return '-';
    }

    // if (typeof v === 'object') {
    //   return (value as { componentCode?: string }).componentCode ?? '-';
    // }
    return String(v);
  }
}

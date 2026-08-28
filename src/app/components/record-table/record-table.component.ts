import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ChangeDetectorRef, inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import type {
  CellClickedEvent,
  ColDef,
  GetRowIdParams,
  GridApi,
  GridReadyEvent,
  SelectionChangedEvent,
  SelectionColumnDef,
  GridOptions
} from 'ag-grid-community';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { TuiBadge, TuiPagination } from '@taiga-ui/kit';
import {
  GROUP_CATEGORY_STATUS,
  GroupCategory,
  GroupCategoryStatus,
} from '../../models/group-category.model';
import { FilterValues } from '../../models/filter-values.model';
import { APP_ROLES } from '../../models/auth.model';
import { AuthService } from '../../services/auth/auth.service';
import { ActionsCellComponent, ActionsCellParams } from './cells/actions-cell.component';
import { StatusCellComponent } from './cells/status-cell.component';
import { IsActiveCellComponent } from './cells/isActive-cell.component';
import { paymentHubGridTheme } from './record-table.theme';

const SELECTION_COLUMN_ID = 'ag-Grid-SelectionColumn';
const PAGE_SIZE = 10;

@Component({
  selector: 'app-ph-record-table',
  standalone: true,
  imports: [AgGridAngular, TuiBadge, TuiButton, TuiIcon, TuiPagination],
  templateUrl: './record-table.component.html',
  styleUrl: './record-table.component.scss',
})
export class RecordTableComponent implements OnChanges {

  @Input() rows: GroupCategory[] = [];

  @Input() totalCount = 0;

  @Input() pageIndex = 0;

  @Input() pageCount = 1;

  @Output() readonly pageIndexChange = new EventEmitter<number>();

  @Output() readonly exportClick = new EventEmitter<FilterValues>();

  @Output() readonly rowClick = new EventEmitter<GroupCategory>();

  @Output() readonly bulkSubmit = new EventEmitter<number[]>();

  @Output() readonly bulkApprove = new EventEmitter<GroupCategory[]>();

  @Output() readonly bulkReject = new EventEmitter<GroupCategory[]>();

  @Output() readonly bulkCancel = new EventEmitter<number[]>();

  @Output() readonly editRow = new EventEmitter<GroupCategory>();

  @Output() readonly copyRow = new EventEmitter<GroupCategory>();

  @Output() readonly deleteRow = new EventEmitter<GroupCategory>();

  protected readonly theme = paymentHubGridTheme;
  protected readonly getRowId = (params: GetRowIdParams<GroupCategory>): string =>
    String(params.data.id);

  protected readonly noRowsTemplate =
    '<span class="ag-grid-empty-hint">Không có bản ghi nào.</span>';

  private gridApi?: GridApi<GroupCategory>;

  protected readonly defaultColDef: ColDef<GroupCategory> = {
    sortable: true,
    resizable: true,
  };

  protected readonly colDefs: ColDef<GroupCategory>[] = [
    {
      headerName: 'STT',
      colId: 'stt',
      width: 80,
      sortable: false,
      valueGetter: (params) =>
        typeof params.node?.rowIndex === 'number'
          ? this.pageIndex * PAGE_SIZE + params.node.rowIndex + 1
          : '',
      suppressMovable: true, pinned: 'left', lockPosition: 'left'
    },
    { headerName: 'Danh mục theo nhóm', field: 'paramType', flex: 1.4, minWidth: 170, suppressMovable: true, pinned: 'left', lockPosition: 'left' },
    { headerName: 'Giá trị thành phần', field: 'paramValue', flex: 1, minWidth: 130, suppressMovable: true, pinned: 'left', lockPosition: 'left' },
    { headerName: 'Tên thành phần', field: 'paramName', flex: 1, minWidth: 140, suppressMovable: true, pinned: 'left', lockPosition: 'left' },
    { headerName: 'Mô tả', field: 'description', flex: 1, minWidth: 110 },
    { headerName: 'Cấu phần xử lý', field: 'componentCode', flex: 1, minWidth: 130 },
    { headerName: 'Ngày hiệu lực', field: 'effectiveDate', flex: 1, minWidth: 130 },
    { headerName: 'Ngày hết hiệu lực', field: 'endEffectiveDate', flex: 1, minWidth: 140 },
    {
      headerName: 'Trạng thái tham số',
      field: 'status',
      flex: 1.1,
      minWidth: 150,
      cellRenderer: StatusCellComponent,
    },
    {
      headerName: 'Trạng thái hoạt động',
      field: 'isActive',
      flex: 1.1,
      minWidth: 150,
      cellRenderer: IsActiveCellComponent,
    },
    {
      colId: 'actions',
      headerName: 'Thao tác',
      width: 120,
      sortable: false,
      filter: false,
      resizable: false,
      pinned: 'right',
      lockPosition: 'right',
      suppressMovable: true,
      cellRenderer: ActionsCellComponent,
      cellRendererParams: {
        onEdit: (row: GroupCategory) => this.editRow.emit(row),
        onCopy: (row: GroupCategory) => this.copyRow.emit(row),
        onDelete: (row: GroupCategory) => this.deleteRow.emit(row),
      } satisfies Partial<ActionsCellParams>,
    },
  ];

  protected readonly rowSelection = {
    mode: 'multiRow' as const,
    checkboxes: true,
    headerCheckbox: true,
    enableClickSelection: false,
  };

  protected readonly selectionColumnDef: SelectionColumnDef = {
    width: 60,
    pinned: 'left',
    lockPinned: true,
    lockPosition: 'left',
    suppressMovable: true,
    suppressHeaderMenuButton: true,
  };


  protected selectedRows: GroupCategory[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pageIndex'] && !changes['pageIndex'].firstChange) {
      this.clearSelection();
    }
  }

  protected onGridReady(event: GridReadyEvent<GroupCategory>): void {
    this.gridApi = event.api;
  }

  protected readonly auth = inject(AuthService);

  protected readonly APP_ROLES = APP_ROLES;

  constructor(private cdr: ChangeDetectorRef) { }

  protected onSelectionChanged(event: SelectionChangedEvent<GroupCategory>): void {
    this.selectedRows = [...event.api.getSelectedRows()];

    console.log(this.isSelectionHomogeneous);

    this.cdr.detectChanges();
  }

  protected onCellClicked(event: CellClickedEvent<GroupCategory>): void {
    const colId = event.column.getColId();

    if (colId === 'actions' || colId === SELECTION_COLUMN_ID || !event.data) {
      return;
    }

    this.rowClick.emit(event.data);
  }

  private clearSelection(): void {
    this.gridApi?.deselectAll();
    this.selectedRows = [];
  }

  protected emitBulkApprove(): void {
    this.bulkSubmit.emit(this.selectedRows.map((row) => row.id));
    this.clearSelection();
  }

  protected emitBulkCancel(): void {
    this.bulkCancel.emit(this.selectedRows.map((row) => row.id));
    this.clearSelection();
  }

  protected emitBulkReject(): void {
    this.bulkReject.emit(this.selectedRows);
    this.clearSelection();
  }

  protected readonly GROUP_CATEGORY_STATUS = GROUP_CATEGORY_STATUS;

  private get selectedStatuses(): GroupCategoryStatus[] {
    return Array.from(new Set(this.selectedRows.map((row) => row.status)));
  }

  protected get isSelectionHomogeneous(): boolean {
    return this.selectedStatuses.length <= 1;
  }

  protected get commonSelectedStatus(): GroupCategoryStatus | null {
    return this.isSelectionHomogeneous ? (this.selectedStatuses[0] ?? null) : null;
  }
}
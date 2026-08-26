import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TuiButton, TuiDialogService, TuiIcon, TuiNotificationService, TuiTitle } from '@taiga-ui/core';
import {
  GroupCategory,
  toGroupCategoryInput,
  GROUP_CATEGORY_STATUS,
  GROUP_CATEGORY_DISPLAY,
  GroupCategoryStatus,
  GroupCategoryDisplay
} from '../../models/group-category.model';
import { GroupCategoryService } from '../../services/group-category.service';
import { DeleteConfirmDialogComponent } from '../delete-confirm-dialog/delete-confirm-dialog.component';
import { RecordDetailDialogComponent } from '../record-detail-dialog/record-detail-dialog.component';
import { RecordTableComponent } from '../record-table/record-table.component';
import { RejectReasonDialogComponent } from '../reject-reason-dialog/reject-reason-dialog.component';
import { FilterValues } from '../../models/filter-values.model';
import { FilterPanelComponent } from '../filter-panel/filter-panel.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

type DialogObserver = { complete: () => void };

@Component({
  selector: 'app-ph-record-list-page',
  standalone: true,
  imports: [
    DeleteConfirmDialogComponent,
    RecordDetailDialogComponent,
    RecordTableComponent,
    FilterPanelComponent,
    RejectReasonDialogComponent,
    ConfirmDialogComponent,
    RouterLink,
    TuiButton,
    TuiIcon,
    TuiTitle,
  ],
  templateUrl: './record-list-page.component.html',
  styleUrl: './record-list-page.component.scss',
})
export class RecordListPageComponent implements OnInit {
  private readonly dialogs = inject(TuiDialogService);
  private readonly notifications = inject(TuiNotificationService);
  protected readonly groupCategoryService = inject(GroupCategoryService);
  private readonly router = inject(Router);

  @ViewChild('detailDialog') private detailDialog!: TemplateRef<unknown>;
  @ViewChild('rejectDialog') private rejectDialog!: TemplateRef<unknown>;
  @ViewChild('deleteDialog') private deleteDialog!: TemplateRef<unknown>;
  @ViewChild('confirmDialog') private confirmDialog!: TemplateRef<unknown>;

  protected filters: FilterValues = {
    paramType: '',
    paramValue: '',
    paramName: '',
    componentCode: '',
    status: null,
    isActive: null,
    pageNo: 0,
    pageSize: 10,
  };

  protected readonly recordStatuses = this.groupCategoryService.recordStatuses;

  protected readonly activeStatuses = this.groupCategoryService.activeStatuses;

  protected get loading(): boolean {
    return this.groupCategoryService.loading;
  }

  protected get loadError(): string | null {
    return this.groupCategoryService.error;
  }

  protected get rows() {
    return this.groupCategoryService.rows;
  }

  protected get pagedRows() {
    return this.groupCategoryService.pagedRows;
  }

  protected get pageCount(): number {
    return this.groupCategoryService.pageCount;
  }

  protected get pageIndex(): number {
    return this.groupCategoryService.pageIndex;
  }

  protected get pageSize(): number {
    return this.groupCategoryService.pageSize;
  }

  protected get totalCount(): number {
    return this.groupCategoryService.totalCount;
  }

  protected set pageIndex(index: number) {
    this.groupCategoryService.setPageIndex(index);
  }

  protected setPageSize(size: number): void {
    this.groupCategoryService.setPageSize(size);
  }

  protected onPageChange(page: number): void {
    this.filters.pageNo = page;
    this.groupCategoryService.searchRecords(this.filters).subscribe();
  }

  protected onResetFilters(): void {
    this.groupCategoryService.loadRecords().subscribe({ error: () => { } });
  }

  protected onSearch(filters: FilterValues): void {
    this.filters = {
      ...filters,
      pageNo: 0,
      pageSize: 10,
    };

    this.groupCategoryService.searchRecords(this.filters).subscribe();
  }

  ngOnInit(): void {
    this.fetchRecords();
  }

  protected fetchRecords(): void {
    this.groupCategoryService.loadRecords().subscribe({ error: () => { } });
  }

  protected exportExcel(filters: FilterValues): void {
    this.groupCategoryService.exportExcel(filters).subscribe({
      next: (response: HttpResponse<Blob>) => {
        const blob = response.body;
        if (!blob) {
          this.notify('File Excel không hợp lệ.', 'negative');
          return;
        }
        const contentDisposition =
          response.headers.get('Content-Disposition');

        const match = contentDisposition?.match(/filename="([^"]+)"/);

        if (!match?.[1]) {
          this.notify('Không lấy được tên file từ BE.', 'negative');
          return;
        }
        const fileName = match[1];

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = fileName;

        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(url);

        this.notify('Đã xuất excel thành công.', 'positive');
      },

      error: (error) => {
        console.error('Export Excel error:', error);
        this.notify(
          'Xuất excel thất bại. Vui lòng thử lại.',
          'negative'
        );
      }
    });
  }

  protected onEditRow(record: GroupCategory): void {
    this.router.navigate(['/edit', record.id]);
  }

  protected onCopyRow(record: GroupCategory): void {
    this.groupCategoryService.setCopySource(record);
    this.router.navigate(['/new']);
  }

  protected openConfirmDialog(status: GroupCategoryStatus): void {
    this.dialogStatus = status;
    this.dialogs.open(this.confirmDialog, {
      size: 'm',
    }).subscribe();
  }


  protected selectedRecord: GroupCategory | null = null;

  protected openDetailDialog(record: GroupCategory): void {
    this.selectedRecord = record;
    this.dialogs
      .open(this.detailDialog, { size: 'l' })
      .subscribe({ complete: () => (this.selectedRecord = null) });
  }

  protected onDeleteRecord(record: GroupCategory, observer: DialogObserver): void {
    observer.complete();
    this.openDeleteConfirmDialog(record);
  }
  // Gửi duyệt
  protected onSubmitDetailForApproval(recordId: number, observer: DialogObserver): void {
    observer.complete();
    this.pendingRejectIds = [recordId];
    this.openConfirmDialog(GROUP_CATEGORY_STATUS.PENDING);
  }

  // Phê duyệt
  protected onApproveDetail(recordId: number, observer: DialogObserver): void {
    observer.complete();
    this.pendingRejectIds = [recordId];
    this.openConfirmDialog(GROUP_CATEGORY_STATUS.APPROVED);
  }

  protected onRejectDetail(record: GroupCategory, observer: DialogObserver): void {
    observer.complete();
    this.openRejectReasonDialog(record);
  }

  private openRejectReasonDialog(record: GroupCategory): void {
    this.pendingRejectRecord = record;
    this.dialogs.open(this.rejectDialog, { size: 'm', label: 'Lý do từ chối' }).subscribe({
      complete: () => (this.pendingRejectRecord = null),
    });
  }

  protected onConfirmReject(reason: string, observer: DialogObserver): void {
    if (!this.pendingRejectRecord) {
      return;
    }
    const payload = [
      {
        ...toGroupCategoryInput(this.pendingRejectRecord),
        status: GROUP_CATEGORY_STATUS.REJECTED, // = 5  
      }];
    this.groupCategoryService.reject(payload).subscribe({
      next: () => {
        observer.complete();
        this.notify('Đã từ chối thành công.', 'positive');
      },
      error: () => this.notify('Từ chối thất bại. Vui lòng thử lại.', 'negative'),
    });
  }

  protected onCancelDetail(record: GroupCategory, observer: DialogObserver): void {
    observer.complete();
    this.listCategories = [record];
    this.openConfirmDialog(GROUP_CATEGORY_STATUS.CANCELLED);
  }

  dialogStatus: GroupCategoryStatus = GROUP_CATEGORY_STATUS.NEW;

  private pendingRejectIds: number[] = [];

  private listCategories: GroupCategory[] = [];

  protected pendingRejectCount = 1;

  protected onBulkSubmit(ids: number[]): void {
    this.openConfirmDialog(GROUP_CATEGORY_STATUS.APPROVED);
    this.pendingRejectIds = ids;
  }

  protected onBulkReject(rows: GroupCategory[]): void {
    this.openConfirmDialog(GROUP_CATEGORY_STATUS.REJECTED);
    this.pendingRejectIds = rows.map((row) => row.id);
    this.listCategories = rows;
  }

  protected onBulkCancel(ids: number[]): void {
    this.openConfirmDialog(GROUP_CATEGORY_STATUS.CANCELLED);
    this.pendingRejectIds = ids;
  }

  private pendingRejectRecord: GroupCategory | null = null;


  protected onConfirm(reason: string, observer: DialogObserver): void {
    const ids = this.pendingRejectIds;
    if (ids.length === 0) {
      this.notify('Không có bản ghi nào để cập nhật trạng thái.', 'neutral');
      observer.complete();
      return;
    }
    const config = this.statusConfig[this.dialogStatus];
    let request$: Observable<void>;
    if (this.dialogStatus === GROUP_CATEGORY_STATUS.PENDING) {
      request$ = this.groupCategoryService.panding(
        ids,
        this.dialogStatus
      );
    } else if (this.dialogStatus === GROUP_CATEGORY_STATUS.APPROVED) {
      request$ = this.groupCategoryService.approve(
        ids,
        this.dialogStatus
      );
    }
    else if (this.dialogStatus === GROUP_CATEGORY_STATUS.CANCELLED) {
      request$ = this.groupCategoryService.cancel(
        ids,
        this.dialogStatus
      );
    }
    else {
      this.notify(
        'Trạng thái không hợp lệ.',
        'negative'
      );
      observer.complete();
      return;
    }
    request$.subscribe({
      next: () => {
        observer.complete();

        this.notify(
          config.successMessage,
          config.appearance
        );
      },

      error: () => {
        observer.complete();

        this.notify(
          config.errorMessage,
          'negative'
        );
      },
    });
    // const config = this.statusConfig[this.dialogStatus];

    // const payload = this.listCategories.map(item => {
    //   const input = toGroupCategoryInput(item);
    //   if (this.dialogStatus === GROUP_CATEGORY_STATUS.APPROVED) {
    //     return {
    //       ...input,
    //       status: this.dialogStatus,
    //       isDisplay: GROUP_CATEGORY_DISPLAY.NOT_DELETE,
    //     };
    //   }

    //   return {
    //     ...input,
    //     status: this.dialogStatus,
    //   };

    // });

    // this.groupCategoryService.updateStatus(payload).subscribe({
    //   next: () => {
    //     observer.complete();
    //     this.notify(config.successMessage, config.appearance);
    //   },
    //   error: () => {
    //     observer.complete();
    //     this.notify(config.errorMessage, 'negative');
    //   },
    // });
  }

  protected onBulkUpdateStatus(observer: DialogObserver): void {
    const ids = this.pendingRejectIds;
    if (ids.length === 0) {
      this.notify('Không có bản ghi nào để cập nhật trạng thái.', 'neutral');
      observer.complete();
      return;
    }
    const config = this.statusConfig[this.dialogStatus];
    // Gọi service cập nhật danh sách
    this.groupCategoryService.approve(ids, 4).subscribe({
      next: () => {
        observer.complete();
        this.notify(config.successMessage, config.appearance);
      },
      error: () => {
        observer.complete();
        this.notify(config.errorMessage, 'negative');
      },
    });
  }

  protected pendingDeleteRecord: GroupCategory | null = null;

  protected onDeleteRow(record: GroupCategory): void {
    this.openDeleteConfirmDialog(record);
  }

  private openDeleteConfirmDialog(record: GroupCategory): void {
    this.pendingDeleteRecord = record;
    this.dialogs
      .open(this.deleteDialog, { size: 'm', label: 'Xóa bản ghi' })
      .subscribe({ complete: () => (this.pendingDeleteRecord = null) });
  }

  protected onConfirmDelete(reason: string, observer: DialogObserver): void {
    if (!this.pendingDeleteRecord) {
      return;
    }

    const input = toGroupCategoryInput(this.pendingDeleteRecord);
    this.groupCategoryService.deleteRecord(input).subscribe({
      next: () => {
        observer.complete();
        this.notify('Đã xóa bản ghi.', 'positive');
      },
      error: () => this.notify('Xóa thất bại. Vui lòng thử lại.', 'negative'),
    });
  }

  private notify(message: string, appearance: 'positive' | 'negative' | 'neutral'): void {
    this.notifications
      .open(message, {
        label: appearance === 'negative' ? 'Lỗi' : 'Thông báo',
        appearance,
      })
      .subscribe();
  }

  private readonly statusConfig: Record<GroupCategoryStatus, {
    successMessage: string;
    errorMessage: string;
    appearance: 'positive' | 'negative' | 'neutral';
  }> = {
      [GROUP_CATEGORY_STATUS.NEW]: {
        successMessage: 'Đã tạo mới thành công.',
        errorMessage: 'Tạo mới thất bại.',
        appearance: 'positive',
      },
      [GROUP_CATEGORY_STATUS.PENDING]: {
        successMessage: 'Đã gửi duyệt thành công.',
        errorMessage: 'Gửi duyệt thất bại.',
        appearance: 'positive',
      },
      [GROUP_CATEGORY_STATUS.APPROVED]: {
        successMessage: 'Đã phê duyệt thành công.',
        errorMessage: 'Phê duyệt thất bại.',
        appearance: 'positive',
      },
      [GROUP_CATEGORY_STATUS.REJECTED]: {
        successMessage: 'Đã từ chối duyệt thành công.',
        errorMessage: 'Từ chối duyệt thất bại.',
        appearance: 'negative',
      },
      [GROUP_CATEGORY_STATUS.CANCELLED]: {
        successMessage: 'Đã hủy phê duyệt thành công.',
        errorMessage: 'Hủy phê duyệt thất bại.',
        appearance: 'neutral',
      },
    };
}

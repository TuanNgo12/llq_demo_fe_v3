import { Injectable, inject } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import {
  GroupCategory,
  GroupCategoryInput,
  GROUP_CATEGORY_STATUS,
  GroupCategoryStatus,
  GROUP_CATEGORY_ACTIVE,
  GroupCategoryActive
} from '../models/group-category.model';
import { RecordApiService } from './record-api.service';
import { FilterValues } from '../models/filter-values.model';
import { PageResponse } from '../models/page-response.model';
import { HttpResponse } from '@angular/common/http';
import { map } from 'rxjs';
const PAGE_SIZE = 10;

@Injectable({ providedIn: 'root' })
export class GroupCategoryService {
  private readonly api = inject(RecordApiService);

  componentCodeOptions: string[] = [];

  loading = false;

  error: string | null = null;

  private allRows: GroupCategory[] = [];

  private lastFilters: FilterValues = {
    paramType: '',
    paramValue: '',
    paramName: '',
    componentCode: '',
    status: null,
    isActive: null,
    pageNo: 0,
    pageSize: 10,
  };

  private currentPageIndex = 0;

  private totalElements = 0;

  private totalPages = 0;

  private currentPageSize = 100;

  readonly pageSizeOptions = [10, 20, 50, 100];

  readonly statusMap: Record<string, GroupCategoryStatus | null> = {
    'Tất cả': null,
    'Tạo mới': GROUP_CATEGORY_STATUS.NEW,
    'Chờ duyệt': GROUP_CATEGORY_STATUS.PENDING,
    'Đã duyệt': GROUP_CATEGORY_STATUS.APPROVED,
    'Từ chối': GROUP_CATEGORY_STATUS.REJECTED,
    'Hủy duyệt': GROUP_CATEGORY_STATUS.CANCELLED,
  };


  readonly activeStatusesMap: Record<string, GroupCategoryActive | null> = {
    'Tất cả': null,
    'Không hoạt động': GROUP_CATEGORY_ACTIVE.INACTIVE,
    'Hoạt động': GROUP_CATEGORY_ACTIVE.ACTIVE,
  };

  readonly recordStatuses = ['Tất cả', 'Tạo mới', 'Chờ duyệt', 'Đã duyệt', 'Từ chối', 'Hủy duyệt'];

  readonly activeStatuses = ['Tất cả', 'Hoạt động', 'Không hoạt động'];


  get rows(): GroupCategory[] {
    return this.allRows;
  }

  get pagedRows(): GroupCategory[] {
    return this.allRows;
  }

  get pageIndex(): number {
    return this.currentPageIndex;
  }

  get pageSize(): number {
    return this.currentPageSize;
  }

  get pageCount(): number {
    return this.totalPages;
  }

  get totalCount(): number {
    return this.totalElements;
  }

  searchRecords(
    filters: FilterValues
  ): Observable<PageResponse<GroupCategory>> {

    this.loading = true;
    this.error = null;
    this.lastFilters = filters;

    const request: FilterValues = {
      ...filters,
      status: this.statusMap[filters.status as unknown as string],
      isActive: this.activeStatusesMap[filters.isActive as unknown as string],
    };

    return this.api.search(request).pipe(
      tap({
        next: (page) => {
          this.allRows = page.content;
          this.totalElements = page.totalElements;
          this.totalPages = page.totalPages;
          this.currentPageIndex = page.number;
          this.loading = false;
          this.componentCodeOptions = [
            ...new Set(
              page.content
                .filter(row => row.componentCode !== null)
                .map(row => row.componentCode)
            ),
          ];
        },
        error: () => {
          this.loading = false;
          this.error = 'Không thể tải danh sách bản ghi. Vui lòng thử lại.';
        },
      }),
    );
  }

  refresh(): Observable<PageResponse<GroupCategory>> {
    const filters: FilterValues = {
      ...this.lastFilters,
      pageNo: this.currentPageIndex,
      pageSize: this.currentPageSize,
    };
    return this.searchRecords(filters);
  }

  getComponentCodes(): Observable<string[]> {
    return this.api.getAllComponent().pipe(
      map(Components => Components.map(Component => Component.componentCode))
    );
  }

  private updatePageData(
    page: PageResponse<GroupCategory>
  ): void {

    this.allRows = page.content ?? [];

    this.totalElements =
      page.totalElements ?? 0;

    this.totalPages =
      page.totalPages ?? 0;

    this.currentPageIndex =
      page.number ?? 0;


    this.componentCodeOptions = [
      ...new Set(

        page.content

          .filter(
            row => row.componentCode !== null
          )

          .map(
            row =>
              row.componentCode
          )
      )
    ];
  }

  setPageSize(size: number): void {

    if (!this.pageSizeOptions.includes(size)) {
      return;
    }
    this.currentPageSize = size;
    this.currentPageIndex = 0;
    this.refresh().subscribe();
  }

  firstPage(): void {
    if (this.currentPageIndex !== 0) {
      this.currentPageIndex = 0;
      this.refresh().subscribe();
    }
  }


  previousPage(): void {
    if (this.currentPageIndex > 0) {
      this.currentPageIndex--;
      this.refresh().subscribe();
    }
  }


  nextPage(): void {
    if (this.currentPageIndex < this.totalPages - 1) {
      this.currentPageIndex++;
      this.refresh().subscribe();
    }
  }

  lastPage(): void {
    if (this.totalPages > 0) {
      this.currentPageIndex = this.totalPages - 1;
      this.refresh().subscribe();
    }
  }

  setPageIndex(index: number): void {
    if (index < 0 || index === this.currentPageIndex) {
      return;
    }
    this.currentPageIndex = index;
    this.refresh().subscribe();
  }

  resolveById(id: number): Observable<GroupCategory> {
    const cached = this.getById(id);
    if (cached) {
      return of(cached);
    }
    return this.api.fetchById(id);
  }

  getById(id: number): GroupCategory | undefined {
    return this.allRows.find((row) => row.id === id);
  }

  private copySource: GroupCategory | null = null;

  setCopySource(record: GroupCategory): void {
    this.copySource = record;
  }

  consumeCopySource(): GroupCategory | null {
    const record = this.copySource;
    this.copySource = null;

    return record;
  }



  addRecord(input: GroupCategoryInput): Observable<GroupCategory> {
    return this.api.create(input).pipe(tap(() => this.refresh().subscribe()));
  }

  updateRecord(input: GroupCategoryInput): Observable<GroupCategory> {
    return this.api.update(input).pipe(tap(() => this.refresh().subscribe()));
  }

  deleteRecord(input: GroupCategoryInput): Observable<GroupCategory> {
    return this.api.remove(input).pipe(tap(() => this.refresh().subscribe()));
  }

  submitForApproval(input: GroupCategoryInput[]): Observable<void> {
    return this.api.updateStatus(input).pipe(tap(() => this.refresh().subscribe()));
  }

  updateStatus(input: GroupCategoryInput[]): Observable<void> {
    return this.api.updateStatus(input).pipe(tap(() => this.refresh().subscribe()));
  }

  updateListStatus(ids: number[], status: number): Observable<void> {
    return this.api.updateListStatus(ids, status).pipe(tap(() => this.refresh().subscribe()));
  }

  panding(ids: number[], status: number): Observable<void> {
    return this.api.panding(ids, status).pipe(tap(() => this.refresh().subscribe()));
  }

  approve(ids: number[], status: number): Observable<void> {
    return this.api.approve(ids, status).pipe(tap(() => this.refresh().subscribe()));
  }

  cancel(ids: number[], status: number): Observable<void> {
    return this.api.cancel(ids, status).pipe(tap(() => this.refresh().subscribe()));
  }

  reject(input: GroupCategoryInput[]): Observable<void> {
    return this.api.updateStatus(input).pipe(tap(() => this.refresh().subscribe()));
  }

  exportExcel(input: FilterValues): Observable<HttpResponse<Blob>> {
    const request = {
      ...input,
      status:
        typeof input.status === 'string'
          ? this.statusMap[input.status]
          : input.status,

      isActive:
        typeof input.isActive === 'string'
          ? this.activeStatusesMap[input.isActive]
          : input.isActive,
    };
    return this.api.exportExcel(request);
  }
}

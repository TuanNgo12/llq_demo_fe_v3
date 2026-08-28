import { ViewChild, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TuiButton, TuiIcon, TuiNotificationService } from '@taiga-ui/core';
import { GroupCategoryInput, toGroupCategoryInput, GROUP_CATEGORY_STATUS } from '../../models/group-category.model';
import { GroupCategoryService } from '../../services/group-category.service';
import { RecordFormComponent } from '../record-form/record-form.component';

type FormPageMode = 'add' | 'update' | 'copy';

@Component({
  selector: 'app-ph-record-form-page',
  standalone: true,
  imports: [RecordFormComponent, RouterLink, TuiButton, TuiIcon],
  templateUrl: './record-form-page.component.html',
  styleUrl: './record-form-page.component.scss',
})
export class RecordFormPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notifications = inject(TuiNotificationService);
  private readonly groupCategoryService = inject(GroupCategoryService);

  @ViewChild(RecordFormComponent) recordForm!: RecordFormComponent;

  componentCodeOptions: string[] = [];

  protected mode: FormPageMode = 'add';
  protected heading = 'Thêm mới tham số danh mục theo nhóm';
  protected breadcrumbLabel = 'Thêm mới';
  protected lockParamType = false;
  protected initialValue?: GroupCategoryInput;
  protected resolvingEdit = false;
  protected editRecordNotFound = false;

  private editingId: number | null = null;

  ngOnInit(): void {
    this.loadComponentCodes();
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      this.resolveAddOrCopy();
      return;
    }

    this.resolvingEdit = true;
    this.resolveEdit(Number(idParam));
  }

  private resolveEdit(id: number): void {
    this.groupCategoryService.resolveById(id).subscribe({
      next: (record) => {
        this.resolvingEdit = false;
        this.mode = 'update';
        this.editingId = record.id;
        this.lockParamType = true;
        this.heading = 'Chỉnh sửa tham số danh mục theo nhóm';
        this.breadcrumbLabel = 'Chỉnh sửa';
        this.initialValue = toGroupCategoryInput(record);
      },
      error: () => {
        this.resolvingEdit = false;
        this.editRecordNotFound = true;
      },
    });
  }

  private loadComponentCodes(): void {
    this.groupCategoryService.getComponentCodes().subscribe({
      next: (options) => {
        console.log('options:', options);
        this.componentCodeOptions = options;
      },
      error: (err) => {
        console.error('Lỗi khi load component:', err);
        this.componentCodeOptions = [];
      },
    });
  }


  private resolveAddOrCopy(): void {
    const copySource = this.groupCategoryService.consumeCopySource();

    if (copySource) {
      this.mode = 'copy';
      this.heading = 'Sao chép tham số danh mục theo nhóm';
      this.breadcrumbLabel = 'Sao chép';
      this.initialValue = toGroupCategoryInput(copySource);
    }
  }

  protected onCancel(): void {
    this.router.navigate(['/']);
  }

  protected onSave(input: GroupCategoryInput): void {
    this.saveRecord(input, false);
  }

  protected onSaveAndSubmit(input: GroupCategoryInput): void {
    this.saveRecord(input, true);
  }

  private saveRecord(input: GroupCategoryInput, submitForApproval: boolean): void {
    let requestInput: GroupCategoryInput;

    if (submitForApproval === true) {
      requestInput = { ...input, status: GROUP_CATEGORY_STATUS.PENDING };
    } else if (this.mode === 'update' && this.editingId !== null) {
      requestInput = { ...input, status: input.status };
    } else {
      const { status, ...data } = input;
      requestInput = data as GroupCategoryInput;
    }
    const request$ =
      this.mode === 'update' && this.editingId !== null
        ? this.groupCategoryService.updateRecord(requestInput)
        : this.groupCategoryService.addRecord(requestInput);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/']);
        this.notifications
          .open(
            submitForApproval ? 'Đã lưu và gửi duyệt bản ghi.' : 'Đã lưu bản ghi thành công.',
            { label: 'Thành công', appearance: 'positive' },
          )
          .subscribe();
      },
      error: (error) => {
        if (error.status === 409) {
          const message = error.error?.message;
          if (message) {
            const duplicateErrors = JSON.parse(message);
            this.recordForm.setDuplicateError(Object.keys(duplicateErrors));
          }
          return;
        }
        this.notifications
          .open('Lưu thất bại. Vui lòng thử lại.', { label: 'Lỗi', appearance: 'negative' })
          .subscribe();
      },
    });
  }
}

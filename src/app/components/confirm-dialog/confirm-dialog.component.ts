import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiButton, TuiTextfield } from '@taiga-ui/core';
import { TuiTextarea } from '@taiga-ui/kit';
import { GroupCategoryStatus, GROUP_CATEGORY_STATUS, GroupCategoryDisplay, GROUP_CATEGORY_DISPLAY } from '../../models/group-category.model';

@Component({
    selector: 'app-ph-confirm-dialog',
    standalone: true,
    imports: [FormsModule, TuiButton, TuiTextarea, TuiTextfield],
    templateUrl: './confirm-dialog.component.html',
    styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {

    @Input() count = 1;
    @Output() readonly confirm = new EventEmitter<string>();
    @Output() readonly cancel = new EventEmitter<void>();
    // @Input() status!: GroupCategoryStatus;

    protected touched = false;

    @Input() status: GroupCategoryStatus = GROUP_CATEGORY_STATUS.NEW;

    private readonly dialogConfig: Record<GroupCategoryStatus, {
        title: string;
        message: string;
    }> = {
            [GROUP_CATEGORY_STATUS.NEW]: {
                title: 'Tạo mới',
                message: 'Bạn có chắc chắn tạo mới bản ghi này?',
            },
            [GROUP_CATEGORY_STATUS.PENDING]: {
                title: 'Gửi duyệt',
                message: 'Bạn có chắc chắn gửi duyệt bản ghi này?',
            },
            [GROUP_CATEGORY_STATUS.APPROVED]: {
                title: 'Phê duyệt',
                message: 'Bạn có chắc chắn phê duyệt bản ghi này?',
            },
            [GROUP_CATEGORY_STATUS.REJECTED]: {
                title: 'Từ chối',
                message: 'Bạn có chắc chắn từ chối bản ghi này?',
            },
            [GROUP_CATEGORY_STATUS.CANCELLED]: {
                title: 'Hủy phê duyệt',
                message: 'Bạn có chắc chắn hủy phê duyệt bản ghi này?',
            },
        };

    protected get title(): string {
        return this.dialogConfig[this.status].title;
    }

    protected get message(): string {
        return this.dialogConfig[this.status].message;
    }

    protected get confirmLabel(): string {
        return 'Xác nhận';
    }

    protected get cancelLabel(): string {
        return 'Hủy';
    }

    protected onConfirm(): void {
        this.touched = true;
        this.confirm.emit();
    }
}

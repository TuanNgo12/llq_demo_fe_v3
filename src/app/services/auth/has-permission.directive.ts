import {
    Directive,
    EmbeddedViewRef,
    Input,
    TemplateRef,
    ViewContainerRef,
    effect,
    inject,
} from '@angular/core';
import { AuthService } from './auth.service';

type Mode = 'any' | 'all';

/**
 * Ẩn/hiện phần tử DOM theo quyền hiện tại của user (tự cập nhật khi login/logout).
 *
 * Dùng 1 quyền:
 *   <button *hasPermission="'GROUP_PARAM_CREATE'">+ Thêm mới</button>
 *
 * Dùng nhiều quyền (mặc định: chỉ cần thỏa 1 trong các quyền):
 *   <button *hasPermission="['GROUP_PARAM_APPROVE','GROUP_PARAM_REJECT']">Xử lý duyệt</button>
 *
 * Yêu cầu đủ TẤT CẢ các quyền:
 *   <button *hasPermission="['A','B']; mode: 'all'">...</button>
 */
@Directive({
    selector: '[hasPermission]',
    standalone: true,
})
export class HasPermissionDirective {
    private templateRef = inject(TemplateRef<unknown>);
    private viewContainer = inject(ViewContainerRef);
    private auth = inject(AuthService);

    private required: string[] = [];
    private mode: Mode = 'any';
    private viewRef: EmbeddedViewRef<unknown> | null = null;

    @Input() set hasPermission(value: string | string[]) {
        this.required = Array.isArray(value) ? value : [value];
        this.render();
    }

    @Input() set hasPermissionMode(mode: Mode) {
        this.mode = mode;
        this.render();
    }

    constructor() {
        // authorities là signal trong AuthService -> tự re-render mỗi khi login/logout
        effect(() => {
            this.auth.authorities();
            this.render();
        });
    }

    private render(): void {
        const allowed = this.mode === 'all'
            ? this.auth.hasAllAuthorities(this.required)
            : this.auth.hasAnyAuthority(this.required);

        if (allowed && !this.viewRef) {
            this.viewRef = this.viewContainer.createEmbeddedView(this.templateRef);
        } else if (!allowed && this.viewRef) {
            this.viewContainer.clear();
            this.viewRef = null;
        }
    }
}

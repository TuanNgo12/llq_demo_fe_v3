import { Directive, TemplateRef, ViewContainerRef, inject, input, effect } from '@angular/core';
import { AppRole } from '../models/auth.model';
import { AuthService } from '../services/auth/auth.service';

/**
 * Ẩn/hiện phần tử theo role của user đang đăng nhập — thay cho việc gọi
 * lặp lại `auth.hasRole(...)` / `auth.hasAnyRole(...)` trong từng template.
 *
 * Dùng như *ngIf:
 *   <button *appHasRole="APP_ROLES.MAKER">Sửa</button>
 *   <button *appHasRole="[APP_ROLES.MAKER, APP_ROLES.CHECKER]">...</button>   // OR
 *   <div *appHasRole="APP_ROLES.CHECKER; else noChecker">...</div>
 *   <ng-template #noChecker>...</ng-template>
 *
 * Tự cập nhật lại khi role của user đổi (vd sau khi đăng nhập lại) nhờ
 * đọc trực tiếp signal `AuthService.roles` bên trong effect().
 *
 * Lưu ý: đây vẫn là lớp UX ở FE, không thay thế @PreAuthorize ở BE (xem
 * config/api-permissions.ts) — API vẫn phải tự kiểm tra quyền.
 */
@Directive({
    selector: '[appHasRole]',
    standalone: true,
})
export class HasRoleDirective {
    readonly appHasRole = input.required<AppRole | AppRole[]>();
    readonly appHasRoleElse = input<TemplateRef<unknown> | null>(null);

    private readonly templateRef = inject(TemplateRef<unknown>);
    private readonly viewContainer = inject(ViewContainerRef);
    private readonly auth = inject(AuthService);

    private hasView = false;

    constructor() {
        effect(() => {
            const required = this.appHasRole();
            const roles = Array.isArray(required) ? required : [required];
            const allowed = this.auth.hasAnyRole(roles);
            const elseTpl = this.appHasRoleElse();

            if (allowed) {
                if (!this.hasView) {
                    this.viewContainer.clear();
                    this.viewContainer.createEmbeddedView(this.templateRef);
                    this.hasView = true;
                }
                return;
            }

            this.hasView = false;
            this.viewContainer.clear();

            if (elseTpl) {
                this.viewContainer.createEmbeddedView(elseTpl);
            }
        });
    }
}
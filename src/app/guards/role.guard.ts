import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

/**
 * Chặn truy cập nếu user không có 1 trong các role được phép.
 *
 * Lưu ý: đây là lớp UX ở FE, không thay thế @PreAuthorize ở BE — BE mới là
 * nơi enforce thật. Dùng cho các route cần chặn theo role (nếu sau này có
 * trang riêng cho CHECKER chẳng hạn); còn với nút bấm trong cùng 1 trang thì
 * dùng authService.hasRole(...) trực tiếp trong template (xem
 * record-detail-dialog / record-table).
 *
 * Cách dùng: canActivate: [roleGuard([APP_ROLES.CHECKER])]
 */
export function roleGuard(allowedRoles: string[]): CanActivateFn {
    return (_route, state) => {
        const auth = inject(AuthService);
        const router = inject(Router);

        if (!auth.isAuthenticated()) {
            return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
        }

        if (auth.hasAnyRole(allowedRoles)) {
            return true;
        }

        return router.createUrlTree(['/']);
    };
}

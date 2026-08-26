import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Guard dùng chung cho mọi route cần đăng nhập + kiểm tra quyền.
 *
 * Khai báo ở route:
 *   canActivate: [permissionGuard],
 *   data: { authorities: ['GROUP_PARAM_VIEW'] }                // mặc định: cần ít nhất 1 quyền
 *   data: { authorities: ['GROUP_PARAM_VIEW'], mode: 'all' }   // cần đủ tất cả quyền liệt kê
 *
 * Nếu route không khai báo `authorities` -> chỉ yêu cầu đã đăng nhập.
 */
export const permissionGuard: CanActivateFn = (route) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
        router.navigate(['/login'], { queryParams: { returnUrl: route.url.join('/') } });
        return false;
    }

    const requiredAuthorities: string[] = route.data['authorities'] ?? [];
    const mode: 'any' | 'all' = route.data['mode'] ?? 'any';

    const allowed = mode === 'all'
        ? auth.hasAllAuthorities(requiredAuthorities)
        : auth.hasAnyAuthority(requiredAuthorities);

    if (!allowed) {
        router.navigate(['/403']);
        return false;
    }

    return true;
};

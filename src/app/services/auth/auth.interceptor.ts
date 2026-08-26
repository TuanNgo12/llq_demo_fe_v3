import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

// Các endpoint không cần gắn token (login, refresh token...)
const PUBLIC_URLS = ['/api/auth/login', '/api/auth/register'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const isPublic = PUBLIC_URLS.some(url => req.url.includes(url));
    const token = auth.getToken();

    const authReq = !isPublic && token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;

    return next(authReq).pipe(
        catchError((err: HttpErrorResponse) => {
            if (err.status === 401 && !isPublic) {
                // Token hết hạn / không hợp lệ -> logout và quay lại trang login, giữ returnUrl
                auth.logout(false);
                router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
            }
            if (err.status === 403) {
                // Có token hợp lệ nhưng không đủ quyền gọi API -> điều hướng trang 403, KHÔNG logout
                router.navigate(['/403']);
            }
            return throwError(() => err);
        })
    );
};

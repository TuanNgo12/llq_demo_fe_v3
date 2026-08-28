import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

/**
 * Gắn header `Authorization: Bearer <token>` cho mọi request — BE yêu cầu
 * xác thực cho tất cả endpoint trừ /api/auth/** (xem SecurityConfig).
 *
 * Khi BE trả 401 (token thiếu/sai/hết hạn) thì tự đăng xuất và chuyển về
 * /login, trừ chính request đăng nhập (để hiện lỗi ngay trên form thay vì
 * điều hướng đi).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const token = auth.token();
    const authReq = token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            const isLoginRequest = req.url.endsWith('/auth/login');

            if (error.status === 401 && !isLoginRequest) {
                auth.logout(router.url);
            }

            return throwError(() => error);
        }),
    );
};

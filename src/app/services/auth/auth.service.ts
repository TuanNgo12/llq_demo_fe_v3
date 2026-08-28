import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, JwtPayload, LoginRequest } from '../../models/auth.model';
import { RegisterRequest } from '../../models/auth.model';

const TOKEN_KEY = 'ph_access_token';

/** Giải mã phần payload của JWT. KHÔNG xác thực chữ ký — việc đó thuộc về BE. */
function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  /** Token JWT hiện tại — null nếu chưa đăng nhập hoặc token đã hết hạn. */
  readonly token = signal<string | null>(this.readValidToken());

  /** Payload đã giải mã — nguồn cho username & roles ở dưới. */
  private readonly payload = computed<JwtPayload | null>(() => {
    const token = this.token();
    return token ? decodeJwtPayload(token) : null;
  });

  readonly isAuthenticated = computed(() => this.payload() !== null);

  readonly username = computed(() => this.payload()?.sub ?? null);

  /** Vd ['ROLE_MAKER'] hoặc ['ROLE_MAKER', 'ROLE_CHECKER'] nếu 1 user có cả 2. */
  readonly roles = computed<string[]>(() => this.payload()?.roles ?? []);

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiBaseUrl}/auth/login`, credentials)
      .pipe(tap((res) => this.setSession(res)));
  }

  /** BE trả 201 kèm token luôn (xem AuthService.register ở BE) — đăng ký xong coi như đã đăng nhập. */
  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiBaseUrl}/auth/register`, payload)
      .pipe(tap((res) => this.setSession(res)));
  }

  logout(returnUrl?: string): void {
    localStorage.removeItem(TOKEN_KEY);
    this.token.set(null);
    this.router.navigate(['/login'], {
      queryParams: returnUrl ? { returnUrl } : undefined,
    });
  }

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.length === 0 || roles.some((role) => this.hasRole(role));
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.accessToken);
    this.token.set(res.accessToken);
  }

  /** Đọc token từ localStorage lúc khởi tạo service; bỏ qua nếu đã hết hạn. */
  private readValidToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return null;
    }

    const payload = decodeJwtPayload(token);
    const isExpired = !payload || payload.exp * 1000 <= Date.now();

    if (isExpired) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }

    return token;
  }
}
import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

interface JwtPayload {
  sub: string;
  roles: string[]; // BE trả claim "roles", vd: ['ROLE_ADMIN']
  permissions?: string[]; // dự phòng nếu BE bổ sung permission chi tiết sau này
  exp: number;
  iat: number;
}

const ACCESS_TOKEN_KEY = 'access_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Dùng signal để mọi nơi (guard, directive, component) tự cập nhật khi login/logout
  private authoritiesSig = signal<string[]>(this.readAuthoritiesFromToken());

  authorities = computed(() => this.authoritiesSig());
  isLoggedIn = computed(() => this.authoritiesSig().length > 0 && !this.isTokenExpired());

  constructor(private router: Router) { }

  setToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    this.authoritiesSig.set(this.readAuthoritiesFromToken());
  }

  getToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  logout(redirect = true): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    this.authoritiesSig.set([]);
    if (redirect) {
      this.router.navigate(['/login']);
    }
  }

  /** Kiểm tra 1 quyền (permission hoặc role) duy nhất */
  hasAuthority(authority: string): boolean {
    return this.authoritiesSig().includes(authority);
  }

  /** Có ít nhất 1 trong danh sách quyền được truyền vào */
  hasAnyAuthority(authorities: string[]): boolean {
    if (!authorities?.length) return true;
    return authorities.some(a => this.authoritiesSig().includes(a));
  }

  /** Phải có đủ tất cả quyền trong danh sách */
  hasAllAuthorities(authorities: string[]): boolean {
    if (!authorities?.length) return true;
    return authorities.every(a => this.authoritiesSig().includes(a));
  }

  private isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    try {
      const payload = this.decode(token);
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private readAuthoritiesFromToken(): string[] {
    const token = this.getToken();
    if (!token) return [];
    try {
      const payload = this.decode(token);
      if (payload.exp * 1000 < Date.now()) return [];
      // Gộp roles + permissions (nếu có) thành 1 danh sách "authorities" dùng chung
      // cho guard/directive, để sau này BE thêm claim permissions không phải sửa FE.
      return [...(payload.roles ?? []), ...(payload.permissions ?? [])];
    } catch {
      return [];
    }
  }

  private decode(token: string): JwtPayload {
    const payload = token.split('.')[1];
    const json = decodeURIComponent(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        .split('')
        .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json);
  }
}

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { AuthApiService } from '../../../services/auth/auth-api.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrls: ['../auth-shell.scss', './login.component.scss'],
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private authApi = inject(AuthApiService);
    private authService = inject(AuthService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    loading = signal(false);
    errorMessage = signal<string | null>(null);
    showPassword = signal(false);

    form = this.fb.nonNullable.group({
        username: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]],
    });

    get f() {
        return this.form.controls;
    }

    togglePassword(): void {
        this.showPassword.update(v => !v);
    }

    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.loading.set(true);
        this.errorMessage.set(null);

        this.authApi.login(this.form.getRawValue()).subscribe({
            next: (res) => {
                this.authService.setToken(res.accessToken);
                const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '';
                this.router.navigateByUrl(returnUrl);
            },
            error: (err) => {
                this.loading.set(false);
                this.errorMessage.set(
                    err.status === 401
                        ? 'Tên đăng nhập hoặc mật khẩu không đúng.'
                        : 'Đăng nhập thất bại. Vui lòng thử lại sau.'
                );
            },
        });
    }
}

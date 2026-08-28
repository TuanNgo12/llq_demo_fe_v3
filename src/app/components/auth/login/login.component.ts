import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
    TuiButton,
    TuiError,
    TuiIcon,
    TuiInput,
    TuiLabel,
    TuiTextfield,
    TuiTitle,
    tuiValidationErrorsProvider,
} from '@taiga-ui/core';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
    selector: 'app-ph-login',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink, TuiButton, TuiError, TuiIcon, TuiInput, TuiLabel, TuiTextfield, TuiTitle],
    providers: [
        tuiValidationErrorsProvider({
            required: 'Không được để trống',
        }),
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
})
export class LoginComponent {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);

    protected readonly form = this.fb.nonNullable.group({
        username: ['', Validators.required],
        password: ['', Validators.required],
    });

    protected readonly loading = signal(false);
    protected readonly loginError = signal<string | null>(null);
    protected readonly showPassword = signal(false);

    protected togglePassword(): void {
        this.showPassword.update((value) => !value);
    }

    protected onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.loading.set(true);
        this.loginError.set(null);

        this.authService.login(this.form.getRawValue()).subscribe({
            next: () => {
                this.loading.set(false);
                const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
                this.router.navigateByUrl(returnUrl);
            },
            error: () => {
                this.loading.set(false);
                this.loginError.set('Sai tên đăng nhập hoặc mật khẩu. Vui lòng thử lại.');
            },
        });
    }
}
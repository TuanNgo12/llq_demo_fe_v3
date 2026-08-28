import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
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

/**
 * Đặt lỗi `passwordMismatch` trực tiếp lên control `confirmPassword` (không
 * chỉ ở FormGroup) để `tui-error formControlName="confirmPassword"` đọc được.
 */
function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password');
  const confirmPassword = group.get('confirmPassword');

  if (!password || !confirmPassword) {
    return null;
  }

  if (confirmPassword.value && password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ ...confirmPassword.errors, passwordMismatch: true });
  } else if (confirmPassword.hasError('passwordMismatch')) {
    const { passwordMismatch, ...rest } = confirmPassword.errors ?? {};
    confirmPassword.setErrors(Object.keys(rest).length ? rest : null);
  }

  return null;
}

@Component({
  selector: 'app-ph-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TuiButton,
    TuiError,
    TuiIcon,
    TuiInput,
    TuiLabel,
    TuiTextfield,
    TuiTitle,
  ],
  providers: [
    tuiValidationErrorsProvider({
      required: 'Không được để trống',
      email: 'Email không hợp lệ',
      minlength: 'Chưa đủ số ký tự tối thiểu',
      maxlength: 'Vượt quá số ký tự tối đa',
      passwordMismatch: 'Mật khẩu nhập lại không khớp',
    }),
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Khớp validate RegisterRequest ở BE: username 3-50 ký tự, email hợp lệ,
  // password tối thiểu 8 ký tự.
  protected readonly form = this.fb.nonNullable.group(
    {
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatchValidator },
  );

  protected readonly loading = signal(false);
  protected readonly formError = signal<string | null>(null);
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
    this.formError.set(null);

    const { username, email, password } = this.form.getRawValue();

    this.authService.register({ username, email, password }).subscribe({
      next: () => {
        this.loading.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.formError.set(this.resolveErrorMessage(err));
      },
    });
  }

  /** BE trả 409 kèm message (vd "Username đã tồn tại") khi trùng username/email. */
  private resolveErrorMessage(err: unknown): string {
    const status = (err as { status?: number } | undefined)?.status;
    const body = (err as { error?: unknown } | undefined)?.error;
    const bodyText = typeof body === 'string' ? body : undefined;

    if (status === 409) {
      return bodyText ?? 'Tên đăng nhập hoặc email đã tồn tại.';
    }
    if (status === 400) {
      return bodyText ?? 'Thông tin đăng ký chưa hợp lệ. Vui lòng kiểm tra lại.';
    }
    return 'Đăng ký thất bại. Vui lòng thử lại sau.';
  }
}
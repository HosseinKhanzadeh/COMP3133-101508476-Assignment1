import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { graphqlErrorMessage } from '../../../core/utils/graphql-error.util';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly serverError = signal<string | null>(null);
  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    },
    { validators: SignupComponent.matchPasswords },
  );

  private static matchPasswords(group: AbstractControl) {
    const p = group.get('password')?.value;
    const c = group.get('confirmPassword')?.value;
    return p === c ? null : { passwordMismatch: true };
  }

  submit(): void {
    this.serverError.set(null);
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.submitting.set(true);
    const { username, email, password } = this.form.getRawValue();
    this.auth.signup(username.trim(), email.trim(), password).subscribe({
      next: () => {
        this.submitting.set(false);
        this.auth.clearStoredAuth();
        void this.router.navigate(['/login'], {
          queryParams: { registered: '1' },
        });
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        this.serverError.set(graphqlErrorMessage(err));
      },
    });
  }
}

import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { graphqlErrorMessage } from '../../../core/utils/graphql-error.util';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly serverError = signal<string | null>(null);
  readonly accountCreatedNotice = signal(false);
  readonly submitting = signal(false);

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('registered') !== '1') return;
    this.accountCreatedNotice.set(true);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { registered: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  readonly form = this.fb.nonNullable.group({
    usernameOrEmail: ['', Validators.required],
    password: ['', Validators.required],
  });

  submit(): void {
    this.serverError.set(null);
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.submitting.set(true);
    const { usernameOrEmail, password } = this.form.getRawValue();
    this.auth.login(usernameOrEmail.trim(), password).subscribe({
      next: () => {
        this.submitting.set(false);
        void this.router.navigate(['/employees']);
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        this.serverError.set(graphqlErrorMessage(err));
      },
    });
  }
}

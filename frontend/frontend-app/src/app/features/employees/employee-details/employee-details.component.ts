import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EMPTY, switchMap } from 'rxjs';
import type { Employee } from '../../../core/models/employee.model';
import { EmployeeService } from '../../../core/services/employee.service';
import { writeEmployeeFlash } from '../../../core/utils/employee-flash.util';
import { graphqlErrorMessage } from '../../../core/utils/graphql-error.util';
import { AvatarInitialsComponent } from '../../../shared/components/avatar-initials/avatar-initials.component';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';

@Component({
  selector: 'app-employee-details',
  imports: [RouterLink, AvatarInitialsComponent, DeleteConfirmationModalComponent],
  templateUrl: './employee-details.component.html',
  styleUrl: './employee-details.component.css',
})
export class EmployeeDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(EmployeeService);
  private readonly destroyRef = inject(DestroyRef);

  readonly employee = signal<Employee | null>(null);
  readonly loading = signal(true);
  readonly fetchError = signal<string | null>(null);
  readonly deleteError = signal<string | null>(null);
  readonly deleteOpen = signal(false);

  readonly deleteEmployeeName = computed(() => {
    const e = this.employee();
    return e ? `${e.first_name} ${e.last_name}` : '';
  });

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((params) => {
          const id = params.get('id');
          if (!id) {
            this.loading.set(false);
            this.employee.set(null);
            this.fetchError.set(null);
            return EMPTY;
          }
          this.loading.set(true);
          this.fetchError.set(null);
          return this.api.getEmployeeById(id);
        }),
      )
      .subscribe({
        next: (emp) => {
          this.employee.set(emp);
          this.fetchError.set(null);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.fetchError.set(graphqlErrorMessage(err));
          this.employee.set(null);
          this.loading.set(false);
        },
      });
  }

  openDelete(): void {
    this.deleteError.set(null);
    this.deleteOpen.set(true);
  }

  closeDelete(): void {
    this.deleteOpen.set(false);
  }

  confirmDelete(): void {
    const e = this.employee();
    if (!e) return;
    this.deleteError.set(null);
    this.api.deleteEmployee(e._id).subscribe({
      next: () => {
        writeEmployeeFlash('Employee deleted.');
        this.closeDelete();
        void this.router.navigate(['/employees']);
      },
      error: (err: unknown) => {
        this.deleteError.set(graphqlErrorMessage(err));
      },
    });
  }

  formatSalary(n: number): string {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      maximumFractionDigits: 0,
    }).format(n);
  }

  formatJoinDate(raw: string | number | null | undefined): string {
    if (raw == null || raw === '') return '—';
    if (typeof raw === 'number' && !Number.isNaN(raw)) {
      const d = new Date(raw);
      return Number.isNaN(d.getTime()) ? String(raw) : d.toLocaleDateString('en-CA');
    }
    const s = String(raw).trim();
    if (/^\d+$/.test(s)) {
      const d = new Date(Number(s));
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleDateString('en-CA');
      }
    }
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? s : d.toLocaleDateString('en-CA');
  }

  displayGender(g: string | null | undefined): string {
    const t = g?.trim();
    return t ? t : '—';
  }
}

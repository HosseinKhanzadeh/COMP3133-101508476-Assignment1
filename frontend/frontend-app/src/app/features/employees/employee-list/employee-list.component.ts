import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime } from 'rxjs';
import type { Employee } from '../../../core/models/employee.model';
import { EmployeeService } from '../../../core/services/employee.service';
import {
  clearEmployeeFlash,
  readEmployeeFlash,
  writeEmployeeFlash,
} from '../../../core/utils/employee-flash.util';
import { graphqlErrorMessage } from '../../../core/utils/graphql-error.util';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';

@Component({
  selector: 'app-employee-list',
  imports: [RouterLink, DeleteConfirmationModalComponent],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css',
})
export class EmployeeListComponent implements OnInit {
  private readonly api = inject(EmployeeService);
  private readonly destroyRef = inject(DestroyRef);

  readonly employees = signal<Employee[]>([]);
  readonly loading = signal(true);
  readonly listError = signal<string | null>(null);
  readonly flashSuccess = signal<string | null>(null);

  readonly designationFilter = signal('');
  readonly departmentFilter = signal('');
  private readonly filterTrigger$ = new Subject<void>();

  readonly deleteId = signal<string | null>(null);
  readonly deleteName = signal('');

  ngOnInit(): void {
    const flash = readEmployeeFlash();
    if (flash) {
      this.flashSuccess.set(flash);
      clearEmployeeFlash();
      window.setTimeout(() => this.flashSuccess.set(null), 4800);
    }

    this.filterTrigger$
      .pipe(debounceTime(350), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadEmployees());

    this.loadEmployees();
  }

  private loadEmployees(): void {
    this.loading.set(true);
    this.listError.set(null);
    const d = this.designationFilter().trim();
    const p = this.departmentFilter().trim();
    const req =
      d === '' && p === ''
        ? this.api.getAllEmployees()
        : this.api.searchEmployees({ designation: d || null, department: p || null });

    req.subscribe({
      next: (rows) => {
        this.employees.set(rows);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.listError.set(graphqlErrorMessage(err));
        this.employees.set([]);
        this.loading.set(false);
      },
    });
  }

  onDesignationInput(event: Event): void {
    this.designationFilter.set((event.target as HTMLInputElement).value);
    this.filterTrigger$.next();
  }

  onDepartmentInput(event: Event): void {
    this.departmentFilter.set((event.target as HTMLInputElement).value);
    this.filterTrigger$.next();
  }

  openDelete(emp: Employee): void {
    this.deleteId.set(emp._id);
    this.deleteName.set(`${emp.first_name} ${emp.last_name}`);
  }

  closeDelete(): void {
    this.deleteId.set(null);
    this.deleteName.set('');
  }

  confirmDelete(): void {
    const id = this.deleteId();
    if (!id) return;
    this.api.deleteEmployee(id).subscribe({
      next: () => {
        writeEmployeeFlash('Employee removed.');
        this.closeDelete();
        this.flashSuccess.set('Employee removed.');
        window.setTimeout(() => this.flashSuccess.set(null), 4800);
        this.loadEmployees();
      },
      error: (err: unknown) => {
        this.listError.set(graphqlErrorMessage(err));
        this.closeDelete();
      },
    });
  }
}

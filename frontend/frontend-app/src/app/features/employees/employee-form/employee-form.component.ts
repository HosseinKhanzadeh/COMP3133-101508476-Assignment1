import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import type { EmployeeInput } from '../../../core/services/employee.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { writeEmployeeFlash } from '../../../core/utils/employee-flash.util';
import { graphqlErrorMessage } from '../../../core/utils/graphql-error.util';

@Component({
  selector: 'app-employee-form',
  imports: [ReactiveFormsModule],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.css',
})
export class EmployeeFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(EmployeeService);

  readonly formMode = signal<'add' | 'edit'>('add');
  private editId: string | null = null;
  private originalPhotoFromServer: string | null = null;
  private photoTouchedByUser = false;

  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    gender: [''],
    designation: ['', Validators.required],
    department: ['', Validators.required],
    salary: [75000, [Validators.required, Validators.min(1000)]],
    dateOfJoining: [new Date().toISOString().slice(0, 10), Validators.required],
  });

  readonly photoPreview = signal<string | null>(null);
  readonly loadExisting = signal(false);
  readonly pageError = signal<string | null>(null);
  readonly submitting = signal(false);

  ngOnInit(): void {
    const mode = this.route.snapshot.data['formMode'] as 'add' | 'edit' | undefined;
    this.formMode.set(mode === 'edit' ? 'edit' : 'add');
    if (mode !== 'edit') return;

    const id = this.route.snapshot.paramMap.get('id');
    this.editId = id;
    if (!id) {
      this.pageError.set('Missing employee id.');
      return;
    }

    this.loadExisting.set(true);
    this.pageError.set(null);
    this.api.getEmployeeById(id).subscribe({
      next: (emp) => {
        this.originalPhotoFromServer = emp.employee_photo ?? null;
        this.photoTouchedByUser = false;
        const doj = this.dateJoiningToInputValue(emp.date_of_joining);
        this.form.patchValue({
          firstName: emp.first_name,
          lastName: emp.last_name,
          email: emp.email,
          gender: emp.gender ?? '',
          designation: emp.designation,
          department: emp.department,
          salary: emp.salary,
          dateOfJoining: doj,
        });
        this.photoPreview.set(emp.employee_photo ?? null);
        this.loadExisting.set(false);
      },
      error: (err: unknown) => {
        this.pageError.set(graphqlErrorMessage(err));
        this.loadExisting.set(false);
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.photoTouchedByUser = true;
    const reader = new FileReader();
    reader.onload = () => this.photoPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  clearPhoto(): void {
    this.photoTouchedByUser = true;
    this.photoPreview.set(null);
  }

  private dateJoiningToInputValue(raw: string | number | null | undefined): string {
    if (raw == null || raw === '') return '';
    if (typeof raw === 'number' && !Number.isNaN(raw)) {
      const d = new Date(raw);
      return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
    }
    const s = String(raw).trim();
    if (/^\d+$/.test(s)) {
      const d = new Date(Number(s));
      return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
  }

  private buildEmployeePhoto(): string | null {
    if (!this.photoTouchedByUser) {
      return this.formMode() === 'edit' ? this.originalPhotoFromServer : null;
    }
    return this.photoPreview();
  }

  private toJoiningIso(dateStr: string): string {
    const d = new Date(`${dateStr}T12:00:00`);
    return Number.isNaN(d.getTime()) ? dateStr : d.toISOString();
  }

  private buildInput(): EmployeeInput {
    const v = this.form.getRawValue();
    const g = v.gender.trim();
    return {
      first_name: v.firstName.trim(),
      last_name: v.lastName.trim(),
      email: v.email.trim(),
      gender: g ? g : null,
      designation: v.designation.trim(),
      department: v.department.trim(),
      salary: Number(v.salary),
      date_of_joining: this.toJoiningIso(v.dateOfJoining),
      employee_photo: this.buildEmployeePhoto(),
    };
  }

  cancel(): void {
    if (this.formMode() === 'edit' && this.editId) {
      void this.router.navigate(['/employees', this.editId]);
    } else {
      void this.router.navigate(['/employees']);
    }
  }

  submit(): void {
    this.pageError.set(null);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.pageError.set('Please fix the highlighted fields before submitting.');
      return;
    }

    this.submitting.set(true);
    const input = this.buildInput();

    if (this.formMode() === 'edit' && this.editId) {
      this.api.updateEmployee(this.editId, input).subscribe({
        next: () => {
          this.submitting.set(false);
          writeEmployeeFlash('Employee updated.');
          void this.router.navigate(['/employees', this.editId]);
        },
        error: (err: unknown) => {
          this.submitting.set(false);
          this.pageError.set(graphqlErrorMessage(err));
        },
      });
      return;
    }

    this.api.addEmployee(input).subscribe({
      next: () => {
        this.submitting.set(false);
        writeEmployeeFlash('Employee added.');
        void this.router.navigate(['/employees']);
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        this.pageError.set(graphqlErrorMessage(err));
      },
    });
  }
}

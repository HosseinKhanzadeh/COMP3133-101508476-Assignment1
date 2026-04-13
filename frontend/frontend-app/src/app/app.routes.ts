import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { EmployeeListComponent } from './features/employees/employee-list/employee-list.component';
import { EmployeeDetailsComponent } from './features/employees/employee-details/employee-details.component';
import { EmployeeFormComponent } from './features/employees/employee-form/employee-form.component';
import { MainShellComponent } from './shared/components/main-shell/main-shell.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  {
    path: '',
    component: MainShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'employees' },
      {
        path: 'employees',
        children: [
          { path: '', component: EmployeeListComponent },
          {
            path: 'add',
            component: EmployeeFormComponent,
            data: { formMode: 'add' },
          },
          {
            path: ':id/edit',
            component: EmployeeFormComponent,
            data: { formMode: 'edit' },
          },
          { path: ':id', component: EmployeeDetailsComponent },
        ],
      },
    ],
  },
  { path: '**', redirectTo: 'employees' },
];

import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { map, Observable } from 'rxjs';
import {
  ADD_EMPLOYEE,
  DELETE_EMPLOYEE,
  GET_ALL_EMPLOYEES,
  GET_EMPLOYEE_BY_ID,
  SEARCH_EMPLOYEES,
  UPDATE_EMPLOYEE,
} from '../graphql/graphql.operations';
import type { Employee } from '../models/employee.model';

export interface EmployeeInput {
  first_name: string;
  last_name: string;
  email: string;
  gender?: string | null;
  designation: string;
  salary: number;
  date_of_joining: string;
  department: string;
  employee_photo?: string | null;
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  constructor(private readonly apollo: Apollo) {}

  getAllEmployees(): Observable<Employee[]> {
    return this.apollo
      .query<{ getAllEmployees: Employee[] }>({
        query: GET_ALL_EMPLOYEES,
        fetchPolicy: 'network-only',
      })
      .pipe(map((r) => r.data?.getAllEmployees ?? []));
  }

  getEmployeeById(id: string): Observable<Employee> {
    return this.apollo
      .query<{ getEmployeeById: Employee }>({
        query: GET_EMPLOYEE_BY_ID,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((r) => {
          const e = r.data?.getEmployeeById;
          if (!e) throw new Error('Employee not found');
          return e;
        }),
      );
  }

  searchEmployees(filters: {
    designation?: string | null;
    department?: string | null;
  }): Observable<Employee[]> {
    return this.apollo
      .query<{ searchEmployees: Employee[] }>({
        query: SEARCH_EMPLOYEES,
        variables: {
          designation: filters.designation || null,
          department: filters.department || null,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((r) => r.data?.searchEmployees ?? []));
  }

  addEmployee(input: EmployeeInput): Observable<Employee> {
    return this.apollo
      .mutate<{ addEmployee: Employee }>({
        mutation: ADD_EMPLOYEE,
        variables: { input },
      })
      .pipe(
        map((r) => {
          const e = r.data?.addEmployee;
          if (!e) throw new Error('addEmployee failed');
          return e;
        }),
      );
  }

  updateEmployee(id: string, input: EmployeeInput): Observable<Employee> {
    return this.apollo
      .mutate<{ updateEmployee: Employee }>({
        mutation: UPDATE_EMPLOYEE,
        variables: { id, input },
      })
      .pipe(
        map((r) => {
          const e = r.data?.updateEmployee;
          if (!e) throw new Error('updateEmployee failed');
          return e;
        }),
      );
  }

  deleteEmployee(id: string): Observable<string> {
    return this.apollo
      .mutate<{ deleteEmployee: string }>({
        mutation: DELETE_EMPLOYEE,
        variables: { id },
      })
      .pipe(
        map((r) => {
          const msg = r.data?.deleteEmployee;
          if (msg == null) throw new Error('deleteEmployee failed');
          return msg;
        }),
      );
  }
}

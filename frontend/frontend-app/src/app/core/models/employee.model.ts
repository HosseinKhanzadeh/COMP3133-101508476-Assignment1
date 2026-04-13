export interface Employee {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  gender?: string | null;
  designation: string;
  salary: number;
  date_of_joining: string | number;
  department: string;
  employee_photo?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

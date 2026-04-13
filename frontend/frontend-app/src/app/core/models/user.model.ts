export interface User {
  _id: string;
  username?: string | null;
  email?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AuthPayload {
  message?: string | null;
  token?: string | null;
  user?: User | null;
}

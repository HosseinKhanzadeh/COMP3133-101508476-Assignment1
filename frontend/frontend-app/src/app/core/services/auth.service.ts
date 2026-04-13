import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { map, Observable, tap } from 'rxjs';
import {
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_USER_STORAGE_KEY,
} from '../constants/auth.constants';
import { LOGIN_QUERY, SIGNUP_MUTATION } from '../graphql/graphql.operations';
import type { AuthPayload, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly loggedIn = signal(this.readToken() !== null);
  readonly isLoggedIn = this.loggedIn.asReadonly();

  private readonly userSession = signal<User | null>(this.readStoredUser());
  readonly currentUser = this.userSession.asReadonly();

  constructor(
    private readonly apollo: Apollo,
    private readonly router: Router,
  ) {}

  private readToken(): string | null {
    try {
      if (typeof localStorage === 'undefined' || typeof sessionStorage === 'undefined') {
        return null;
      }
      return (
        localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ??
        sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
      );
    } catch {
      return null;
    }
  }

  private readStoredUser(): User | null {
    try {
      if (typeof sessionStorage === 'undefined') return null;
      const raw = sessionStorage.getItem(AUTH_USER_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  private persistUser(user: User | null): void {
    try {
      if (typeof sessionStorage === 'undefined') return;
      if (user) {
        sessionStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        sessionStorage.removeItem(AUTH_USER_STORAGE_KEY);
      }
    } catch {}
    this.userSession.set(user);
  }

  isAuthenticated(): boolean {
    const t = this.readToken();
    return t !== null && t.length > 0;
  }

  getToken(): string | null {
    return this.readToken();
  }

  setToken(token: string): void {
    try {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    } catch {}
    this.loggedIn.set(true);
  }

  clearStoredAuth(): void {
    try {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_USER_STORAGE_KEY);
    } catch {}
    this.loggedIn.set(false);
    this.userSession.set(null);
  }

  logout(): void {
    this.clearStoredAuth();
    void this.router.navigate(['/login']);
  }

  login(usernameOrEmail: string, password: string): Observable<AuthPayload> {
    return this.apollo
      .query<{ login: AuthPayload }>({
        query: LOGIN_QUERY,
        variables: { usernameOrEmail, password },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((r) => {
          const payload = r.data?.login;
          if (!payload?.token) {
            throw new Error('Login failed: no token returned');
          }
          return payload;
        }),
        tap((payload) => {
          this.setToken(payload.token!);
          const u = payload.user ?? null;
          this.persistUser(u);
        }),
      );
  }

  signup(username: string, email: string, password: string): Observable<AuthPayload> {
    return this.apollo
      .mutate<{ signup: AuthPayload }>({
        mutation: SIGNUP_MUTATION,
        variables: { username, email, password },
      })
      .pipe(
        map((r) => {
          const payload = r.data?.signup;
          if (!payload?.token) {
            throw new Error('Signup failed: no token returned');
          }
          return payload;
        }),
        tap((payload) => {
          this.setToken(payload.token!);
          const u = payload.user ?? null;
          this.persistUser(u);
        }),
      );
  }
}

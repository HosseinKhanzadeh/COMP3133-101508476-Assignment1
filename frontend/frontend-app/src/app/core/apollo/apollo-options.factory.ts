import { HttpHeaders } from '@angular/common/http';
import { inject } from '@angular/core';
import { ApolloLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { HttpLink } from 'apollo-angular/http';
import { AUTH_TOKEN_STORAGE_KEY } from '../constants/auth.constants';
import { GRAPHQL_URI } from '../config/graphql.config';

export function apolloOptionsFactory() {
  const httpLink = inject(HttpLink);
  const http = httpLink.create({ uri: GRAPHQL_URI });

  const authLink = new SetContextLink(() => {
    let token: string | null = null;
    try {
      if (typeof localStorage !== 'undefined' && typeof sessionStorage !== 'undefined') {
        token =
          localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ??
          sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
      }
    } catch {}

    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return { headers };
  });

  return {
    link: ApolloLink.from([authLink, http]),
    cache: new InMemoryCache(),
  };
}

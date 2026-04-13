import { CombinedGraphQLErrors } from '@apollo/client';

export function graphqlErrorMessage(err: unknown): string {
  if (CombinedGraphQLErrors.is(err)) {
    const parts = err.errors.map((e) => e.message).filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'Request failed.';
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return 'Something went wrong. Please try again.';
}

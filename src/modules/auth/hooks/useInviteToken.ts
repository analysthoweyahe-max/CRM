import { useParams, useSearchParams } from 'react-router-dom';

/** Reads invitation token from path param or `?token=` query string. */
export function useInviteToken(): string {
  const { token: pathToken } = useParams<{ token?: string }>();
  const [params]             = useSearchParams();
  return pathToken ?? params.get('token') ?? '';
}

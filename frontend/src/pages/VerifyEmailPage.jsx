import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { api, ApiError } from '../lib/api';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('This verification link is invalid.');
      return;
    }

    api
      .verifyEmail(token)
      .then(() => {
        setStatus('success');
        setMessage('Your email is verified. Your workspace is ready.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err instanceof ApiError ? err.message : 'Verification failed.');
      });
  }, [token]);

  return (
    <AuthLayout title="Email verification" subtitle="One moment while we confirm your address.">
      <div className="space-y-5">
        {status === 'loading' && <Alert type="info">Verifying your email…</Alert>}
        {status === 'success' && <Alert type="success">{message}</Alert>}
        {status === 'error' && <Alert type="error">{message}</Alert>}

        <Link to={status === 'success' ? '/app/events' : '/login'}>
          <Button variant="primary">
            {status === 'success' ? 'Open workspace' : 'Back to sign in'}
          </Button>
        </Link>
      </div>
    </AuthLayout>
  );
}

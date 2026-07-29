import { useState } from 'react';
import { AuthLayout, AuthLink } from '../components/AuthLayout';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { api, ApiError } from '../lib/api';
import { useLocation } from 'react-router-dom';

export default function VerifyEmailPendingPage() {
  const location = useLocation();
  const email = location.state?.email || '';
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setError('');
    setLoading(true);
    try {
      await api.resendVerification(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to resend email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Check your inbox"
      subtitle="We sent a confirmation link to activate your workspace."
    >
      <div className="space-y-5">
        <Alert type="info">
          {email ? (
            <>
              Open the link we sent to{' '}
              <strong className="text-[#fafafa] font-medium">{email}</strong> to verify your
              account.
            </>
          ) : (
            'Check your email for a verification link.'
          )}
        </Alert>

        {sent && <Alert type="success">Email resent. Check your inbox and spam folder.</Alert>}
        {error && <Alert type="error">{error}</Alert>}

        {email && (
          <Button variant="secondary" loading={loading} onClick={handleResend}>
            Resend email
          </Button>
        )}

        <p className="text-center text-[13px] text-[#52525b]">
          Wrong address? <AuthLink to="/login">Back to login</AuthLink>
        </p>
      </div>
    </AuthLayout>
  );
}

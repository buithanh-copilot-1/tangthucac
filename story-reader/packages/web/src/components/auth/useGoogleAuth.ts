import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useStore } from '../../store/useStore';

export function useGoogleAuth(onSuccess: () => void) {
  const { loginWithGoogle } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        // Gửi Google access token lên backend — backend tự gọi userinfo
        const result = await loginWithGoogle(tokenResponse.access_token);
        if (result.success) {
          onSuccess();
        } else {
          setError(result.error ?? 'Đăng nhập Google thất bại');
        }
      } catch {
        setError('Không kết nối được server. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    },
    onError: (err) => {
      if (err.error !== 'access_denied') {
        setError('Đăng nhập Google thất bại. Vui lòng thử lại.');
      }
    },
  });

  const handleGoogleClick = () => {
    setError('');
    triggerGoogleLogin();
  };

  return { loading, error, setError, handleGoogleClick };
}

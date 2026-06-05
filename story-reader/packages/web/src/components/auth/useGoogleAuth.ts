import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useStore } from '../../store/useStore';
import { translate } from '@story-reader/shared';

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
          const lang = useStore.getState().readerSettings.language;
          setError(result.error ?? translate(lang, 'googleLoginFailed'));
        }
      } catch {
        const lang = useStore.getState().readerSettings.language;
        setError(translate(lang, 'networkError'));
      } finally {
        setLoading(false);
      }
    },
    onError: (err) => {
      if (err.error !== 'access_denied') {
        const lang = useStore.getState().readerSettings.language;
        setError(translate(lang, 'googleLoginFailed'));
      }
    },
  });

  const handleGoogleClick = () => {
    setError('');
    triggerGoogleLogin();
  };

  return { loading, error, setError, handleGoogleClick };
}

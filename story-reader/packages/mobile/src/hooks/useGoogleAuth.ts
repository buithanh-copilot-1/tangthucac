import { useEffect, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useStore } from '../store/useStore';
import { translate, type TranslationKey } from '@story-reader/shared';

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '';

export function useGoogleAuth(onSuccess: () => void) {
  const { loginWithGoogle, readerSettings } = useStore();
  const t = (k: TranslationKey) => translate(readerSettings.language, k);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: WEB_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type !== 'success') return;
    const { authentication } = response;
    if (!authentication?.accessToken) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        // Gửi Google access token thẳng lên backend
        const result = await loginWithGoogle(authentication.accessToken);
        if (result.success) onSuccess();
        else setError(result.error ?? t('googleLoginFailed'));
      } catch {
        setError(t('networkError'));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [response]);

  const handleGooglePress = async () => {
    setError('');
    await promptAsync();
  };

  return { request, loading, error, handleGooglePress };
}

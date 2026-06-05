import { X } from 'lucide-react';
import { readerThemes, readerBackgrounds, translate, type ReaderSettings, type TranslationKey } from '@story-reader/shared';
import { useStore } from '../../store/useStore';

interface ReaderSettingsProps {
  onClose: () => void;
}

const fontSizes = [
  { value: 'sm', className: 'text-xs' },
  { value: 'md', className: 'text-sm' },
  { value: 'lg', className: 'text-base' },
  { value: 'xl', className: 'text-lg' },
] as const;

const lineHeights = [
  { value: 'normal', labelKey: 'normal' },
  { value: 'relaxed', labelKey: 'relaxed' },
  { value: 'loose', labelKey: 'loose' },
] as const;

const themeButtonClass = {
  light: 'bg-white text-gray-900',
  dark: 'bg-gray-900 text-white',
};

export default function ReaderSettingsPanel({ onClose }: ReaderSettingsProps) {
  const { readerSettings, updateReaderSettings } = useStore();
  const t = (key: TranslationKey) => translate(readerSettings.language, key);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-6 pb-8 sm:mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">{t('readerSettings')}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        <div className="mb-5">
          <p className="text-sm font-medium text-gray-700 mb-3">{t('fontSize')}</p>
          <div className="flex gap-2">
            {fontSizes.map((fs) => (
              <button
                key={fs.value}
                onClick={() => updateReaderSettings({ fontSize: fs.value as ReaderSettings['fontSize'] })}
                className={`flex-1 h-12 rounded-xl border-2 flex items-center justify-center font-bold transition-all
                  ${readerSettings.fontSize === fs.value
                    ? 'border-primary-500 bg-primary-50 text-primary-600'
                    : 'border-gray-200 text-gray-700'
                  } ${fs.className}`}
              >
                A
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <p className="text-sm font-medium text-gray-700 mb-3">{t('theme')}</p>
          <div className="grid grid-cols-2 gap-2">
            {readerThemes.map((theme) => (
              <button
                key={theme.value}
                onClick={() => updateReaderSettings({ theme: theme.value })}
                className={`h-12 rounded-xl border-2 flex items-center justify-center text-xs font-semibold transition-all
                  ${readerSettings.theme === theme.value ? 'border-primary-500' : 'border-gray-200'}
                  ${themeButtonClass[theme.value]}`}
              >
                {t(theme.labelKey)}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <p className="text-sm font-medium text-gray-700 mb-3">{t('background')}</p>
          <div className="grid grid-cols-3 gap-2">
            {readerBackgrounds.map((bg) => (
              <button
                key={bg.value}
                onClick={() => updateReaderSettings({ background: bg.value as ReaderSettings['background'] })}
                className={`h-12 rounded-xl border-2 flex items-center justify-center text-xs font-semibold transition-all ${readerSettings.background === bg.value ? 'border-primary-500' : 'border-gray-200'}`}
                title={t(bg.labelKey)}
              >
                <div className="w-6 h-6 rounded-sm" style={{ backgroundColor: bg.swatch }} />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <p className="text-sm font-medium text-gray-700 mb-3">{t('lineHeight')}</p>
          <div className="flex gap-2">
            {lineHeights.map((lh) => (
              <button
                key={lh.value}
                onClick={() => updateReaderSettings({ lineHeight: lh.value })}
                className={`flex-1 h-10 rounded-xl border-2 text-xs font-medium transition-all
                  ${readerSettings.lineHeight === lh.value
                    ? 'border-primary-500 bg-primary-50 text-primary-600'
                    : 'border-gray-200 text-gray-600'
                  }`}
              >
                {t(lh.labelKey)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">{t('fontFamily')}</p>
          <div className="flex gap-2">
            {([
              { value: 'sans', labelKey: 'sans' },
              { value: 'serif', labelKey: 'serif' },
            ] as const).map((ff) => (
              <button
                key={ff.value}
                onClick={() => updateReaderSettings({ fontFamily: ff.value })}
                className={`flex-1 h-10 rounded-xl border-2 text-sm transition-all
                  ${ff.value === 'sans' ? 'font-sans' : 'font-serif'}
                  ${readerSettings.fontFamily === ff.value
                    ? 'border-primary-500 bg-primary-50 text-primary-600 font-semibold'
                    : 'border-gray-200 text-gray-600'
                  }`}
              >
                {t(ff.labelKey)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

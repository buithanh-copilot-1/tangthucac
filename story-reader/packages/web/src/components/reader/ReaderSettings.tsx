import { X } from 'lucide-react';
import type { ReaderSettings } from '@story-reader/shared';
import { useStore } from '../../store/useStore';

interface ReaderSettingsProps {
  onClose: () => void;
}

const fontSizes = [
  { value: 'sm', label: 'A', class: 'text-xs' },
  { value: 'md', label: 'A', class: 'text-sm' },
  { value: 'lg', label: 'A', class: 'text-base' },
  { value: 'xl', label: 'A', class: 'text-lg' },
] as const;

const themes = [
  { value: 'light', label: 'Sáng', bg: 'bg-white', border: 'border-gray-300', text: 'text-gray-900' },
  { value: 'sepia', label: 'Nâu', bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-900' },
  { value: 'dark', label: 'Tối', bg: 'bg-gray-900', border: 'border-gray-600', text: 'text-white' },
] as const;

const lineHeights = [
  { value: 'normal', label: 'Bình thường' },
  { value: 'relaxed', label: 'Thoải mái' },
  { value: 'loose', label: 'Rộng' },
] as const;

export default function ReaderSettingsPanel({ onClose }: ReaderSettingsProps) {
  const { readerSettings, updateReaderSettings } = useStore();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-mobile bg-white rounded-t-3xl p-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Cài đặt đọc</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Font size */}
        <div className="mb-5">
          <p className="text-sm font-medium text-gray-700 mb-3">Cỡ chữ</p>
          <div className="flex gap-2">
            {fontSizes.map((fs) => (
              <button
                key={fs.value}
                onClick={() => updateReaderSettings({ fontSize: fs.value as ReaderSettings['fontSize'] })}
                className={`flex-1 h-12 rounded-xl border-2 flex items-center justify-center font-bold transition-all
                  ${readerSettings.fontSize === fs.value
                    ? 'border-primary-500 bg-primary-50 text-primary-600'
                    : 'border-gray-200 text-gray-700'
                  } ${fs.class}`}
              >
                A
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div className="mb-5">
          <p className="text-sm font-medium text-gray-700 mb-3">Nền</p>
          <div className="flex gap-2">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => updateReaderSettings({ theme: t.value })}
                className={`flex-1 h-12 rounded-xl border-2 flex items-center justify-center text-xs font-semibold transition-all
                  ${readerSettings.theme === t.value ? 'border-primary-500' : 'border-transparent'}
                  ${t.bg} ${t.text}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Line height */}
        <div className="mb-5">
          <p className="text-sm font-medium text-gray-700 mb-3">Khoảng cách dòng</p>
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
                {lh.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font family */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Font chữ</p>
          <div className="flex gap-2">
            {[
              { value: 'sans', label: 'Sans Serif' },
              { value: 'serif', label: 'Serif' },
            ].map((ff) => (
              <button
                key={ff.value}
                onClick={() => updateReaderSettings({ fontFamily: ff.value as 'sans' | 'serif' })}
                className={`flex-1 h-10 rounded-xl border-2 text-sm transition-all
                  ${ff.value === 'sans' ? 'font-sans' : 'font-serif'}
                  ${readerSettings.fontFamily === ff.value
                    ? 'border-primary-500 bg-primary-50 text-primary-600 font-semibold'
                    : 'border-gray-200 text-gray-600'
                  }`}
              >
                {ff.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

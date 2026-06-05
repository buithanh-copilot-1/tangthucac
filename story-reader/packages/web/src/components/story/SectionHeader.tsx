import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { translate, type TranslationKey } from '@story-reader/shared';
import { useStore } from '../../store/useStore';

interface SectionHeaderProps {
  title: string;
  viewAllTo?: string;
}

export default function SectionHeader({ title, viewAllTo }: SectionHeaderProps) {
  const { readerSettings } = useStore();
  const t = (k: TranslationKey) => translate(readerSettings.language, k);
  return (
    <div className="flex items-center justify-between px-4 mb-3">
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      {viewAllTo && (
        <Link to={viewAllTo} className="flex items-center gap-0.5 text-primary-500 text-sm font-medium">
          {t('loadMore')} <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
}

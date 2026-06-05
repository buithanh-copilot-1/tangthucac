import { Link } from 'react-router-dom';
import type { Category } from '@story-reader/shared';

interface CategoryBadgeProps {
  category: Category;
  selected?: boolean;
  onClick?: () => void;
  asLink?: boolean;
}

export default function CategoryBadge({ category, selected, onClick, asLink }: CategoryBadgeProps) {
  const cls = `inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 flex-shrink-0
    ${selected
      ? 'text-white shadow-sm'
      : 'bg-white text-gray-600 border border-gray-200 active:bg-gray-50'
    }`;

  const style = selected ? { backgroundColor: category.color } : undefined;

  if (asLink) {
    return (
      <Link to={`/browse?genre=${category.id}`} className={cls} style={style}>
        <span>{category.icon}</span>
        <span>{category.name}</span>
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={cls} style={style}>
      <span>{category.icon}</span>
      <span>{category.name}</span>
    </button>
  );
}

import { useEffect } from 'react';

interface MetaOptions {
  title: string;
  description?: string;
}

const DEFAULT_TITLE = 'TruyenHay - Doc Truyen Online';
const DEFAULT_DESCRIPTION = 'Doc truyen chu online - Hang nghin bo truyen hay nhat';

export function useDocumentMeta({ title, description = DEFAULT_DESCRIPTION }: MetaOptions) {
  useEffect(() => {
    document.title = title ? `${title} | TruyenHay` : DEFAULT_TITLE;

    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = description;
  }, [title, description]);
}

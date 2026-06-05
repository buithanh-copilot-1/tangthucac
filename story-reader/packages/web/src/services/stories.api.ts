import { api } from './api';
import type { Story, Chapter } from '@story-reader/shared';

export interface StoriesResponse {
  data: Story[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface StoryQuery {
  q?: string;
  genre?: string;
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

// Map FE genre slug → BE enum
const genreMap: Record<string, string> = {
  'tien-hiep': 'TIEN_HIEP', 'ngon-tinh': 'NGON_TINH', 'do-thi': 'DO_THI',
  'kiem-hiep': 'KIEM_HIEP', 'di-gioi': 'DI_GIOI', 'trong-sinh': 'TRONG_SINH',
  'huyen-huyen': 'HUYEN_HUYEN', 'khoa-hoc-vien-tuong': 'KHOA_HOC_VIEN_TUONG',
};

// Map BE story → FE Story shape
export function mapStory(s: any): Story {
  return {
    ...s,
    cover: s.coverUrl ?? s.cover,
    genre: Object.keys(genreMap).find((k) => genreMap[k] === s.genre) ?? s.genre,
    status: s.status?.toLowerCase() ?? s.status,
  };
}

export function mapChapter(c: any): Chapter {
  return { ...c, storyId: c.storyId, publishedAt: c.publishedAt ?? new Date().toISOString() };
}

export const storiesApi = {
  list: async (query: StoryQuery = {}): Promise<StoriesResponse> => {
    const params = new URLSearchParams();
    if (query.q) params.set('q', query.q);
    if (query.genre) params.set('genre', genreMap[query.genre] ?? query.genre);
    if (query.status) params.set('status', query.status.toUpperCase());
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    if (query.sort) params.set('sort', query.sort);
    const qs = params.toString();
    const res = await api.get<{ data: any[]; meta: any }>(`/stories${qs ? `?${qs}` : ''}`);
    return { data: res.data.map(mapStory), meta: res.meta };
  },

  featured: async (): Promise<Story[]> => {
    const res = await api.get<any[]>('/stories/featured');
    return res.map(mapStory);
  },

  hot: async (): Promise<Story[]> => {
    const res = await api.get<any[]>('/stories/hot');
    return res.map(mapStory);
  },

  get: async (id: string): Promise<Story> => {
    const res = await api.get<any>(`/stories/${id}`);
    return mapStory(res);
  },

  chapters: async (storyId: string): Promise<Chapter[]> => {
    const res = await api.get<any[]>(`/stories/${storyId}/chapters`);
    return res.map(mapChapter);
  },

  chapter: async (storyId: string, number: number): Promise<Chapter> => {
    const res = await api.get<any>(`/stories/${storyId}/chapters/${number}`);
    return mapChapter(res);
  },
};

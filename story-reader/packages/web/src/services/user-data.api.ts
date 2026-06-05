import { api } from './api';

const shelfStatusMap: Record<string, string> = {
  reading: 'READING', completed: 'COMPLETED', want_to_read: 'WANT_TO_READ',
};

export const shelfApi = {
  getAll: (status?: string) =>
    api.get<any[]>(`/shelf${status ? `?status=${shelfStatusMap[status] ?? status}` : ''}`),

  upsert: (storyId: string, status: string) =>
    api.put<any>(`/shelf/${storyId}`, { status: shelfStatusMap[status] ?? status }),

  remove: (storyId: string) =>
    api.delete<any>(`/shelf/${storyId}`),
};

export const bookmarksApi = {
  getAll: () => api.get<any[]>('/bookmarks'),
  add:    (storyId: string) => api.post<any>(`/bookmarks/${storyId}`),
  remove: (storyId: string) => api.delete<any>(`/bookmarks/${storyId}`),
};

export const progressApi = {
  getAll:  () => api.get<any[]>('/progress'),
  getOne:  (storyId: string) => api.get<any | null>(`/progress/${storyId}`),
  upsert:  (data: { storyId: string; chapterId: string; chapterNumber: number; scrollPosition: number }) =>
    api.post<any>('/progress', data),
};

export const settingsApi = {
  get:    () => api.get<Record<string, string> | null>('/users/me/settings'),
  update: (data: Partial<{ fontSize: string; theme: string; lineHeight: string; fontFamily: string; language: string }>) =>
    api.patch<Record<string, string>>('/users/me/settings', data),
};

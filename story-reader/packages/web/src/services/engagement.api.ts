import { api } from './api';

export interface CommentUser {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface Comment {
  id: string;
  userId: string;
  storyId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  user: CommentUser;
  replies?: Comment[];
}

export const ratingApi = {
  getMine: (storyId: string) =>
    api.get<{ score: number }>(`/stories/${storyId}/rating/me`),
  rate: (storyId: string, score: number) =>
    api.put<{ rating: number; ratingCount: number }>(`/stories/${storyId}/rating`, { score }),
};

export const commentApi = {
  list:  (storyId: string) => api.get<Comment[]>(`/stories/${storyId}/comments`),
  count: (storyId: string) => api.get<{ total: number }>(`/stories/${storyId}/comments/count`),
  create: (storyId: string, content: string, parentId?: string) =>
    api.post<Comment>(`/stories/${storyId}/comments`, { content, parentId }),
  remove: (commentId: string) => api.delete<{ message: string }>(`/comments/${commentId}`),
};

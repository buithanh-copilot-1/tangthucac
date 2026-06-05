export type Genre =
  | 'tien-hiep'
  | 'ngon-tinh'
  | 'do-thi'
  | 'kiem-hiep'
  | 'di-gioi'
  | 'trong-sinh'
  | 'huyen-huyen'
  | 'khoa-hoc-vien-tuong';

export type StoryStatus = 'ongoing' | 'completed' | 'hiatus';

export interface Story {
  id: string;
  title: string;
  author: string;
  cover: string;
  genre: Genre;
  tags: string[];
  description: string;
  status: StoryStatus;
  totalChapters: number;
  views: number;
  rating: number;
  ratingCount: number;
  lastUpdated: string;
  isFeatured?: boolean;
  isHot?: boolean;
}

export interface Chapter {
  id: string;
  storyId: string;
  number: number;
  title: string;
  content: string;
  wordCount: number;
  publishedAt: string;
}

export interface Category {
  id: Genre;
  name: string;
  icon: string;
  color: string;
  count: number;
}

export interface ReadingProgress {
  storyId: string;
  chapterId: string;
  chapterNumber: number;
  scrollPosition: number;
  lastRead: string;
}

export interface ReaderSettings {
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  theme: 'light' | 'sepia' | 'dark';
  lineHeight: 'normal' | 'relaxed' | 'loose';
  fontFamily: 'sans' | 'serif';
}

export interface SearchResult {
  stories: Story[];
  query: string;
  genre?: Genre;
}

export type AuthProvider = 'email' | 'google';

export interface User {
  id: string;
  username: string;
  displayName?: string;
  givenName?: string;
  familyName?: string;
  email: string;
  emailVerified?: boolean;
  avatar?: string;
  googleId?: string;
  provider: AuthProvider;
  joinedAt: string;
}

export type ShelfStatus = 'reading' | 'completed' | 'want_to_read';

export interface ShelfEntry {
  storyId: string;
  status: ShelfStatus;
  addedAt: string;
  lastUpdated: string;
  completedAt?: string;
}

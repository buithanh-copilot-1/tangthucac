import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReaderSettings, ReadingProgress, Story, ShelfEntry, ShelfStatus, User } from '@story-reader/shared';
import { authApi, type AuthResponse } from '../services/auth.api';
import { ApiError } from '../services/api';

export interface AuthResult { success: boolean; error?: string }

interface AppState {
  // ── Auth ──────────────────────────────────────────────────────────────
  currentUser: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (access: string, refresh: string) => void;
  clearAuth: () => void;
  login: (email: string, password: string) => Promise<AuthResult>;
  loginWithGoogle: (googleAccessToken: string) => Promise<AuthResult>;
  register: (username: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, 'username' | 'displayName'>>) => void;

  // ── Bookmarks ─────────────────────────────────────────────────────────
  bookmarks: string[];
  addBookmark: (storyId: string) => void;
  removeBookmark: (storyId: string) => void;
  isBookmarked: (storyId: string) => boolean;

  // ── Shelf ─────────────────────────────────────────────────────────────
  shelf: ShelfEntry[];
  addToShelf: (storyId: string, status: ShelfStatus) => void;
  updateShelfStatus: (storyId: string, status: ShelfStatus) => void;
  removeFromShelf: (storyId: string) => void;
  getShelfEntry: (storyId: string) => ShelfEntry | undefined;
  getShelfByStatus: (status: ShelfStatus) => ShelfEntry[];

  // ── Reading progress ──────────────────────────────────────────────────
  history: ReadingProgress[];
  updateProgress: (progress: ReadingProgress) => void;
  getProgress: (storyId: string) => ReadingProgress | undefined;
  clearHistory: () => void;

  // ── Reader settings ───────────────────────────────────────────────────
  readerSettings: ReaderSettings;
  updateReaderSettings: (settings: Partial<ReaderSettings>) => void;

  // ── Recent searches ───────────────────────────────────────────────────
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;

  // ── Recently viewed ───────────────────────────────────────────────────
  recentlyViewed: Story[];
  addRecentlyViewed: (story: Story) => void;
}

function applyAuth(set: any, data: AuthResponse) {
  set(() => ({ currentUser: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken }));
}

function handleErr(err: unknown): AuthResult {
  if (err instanceof ApiError) return { success: false, error: err.message };
  return { success: false, error: 'Lỗi kết nối server. Vui lòng thử lại.' };
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      accessToken: null,
      refreshToken: null,

      setTokens: (access, refresh) => set(() => ({ accessToken: access, refreshToken: refresh })),
      clearAuth: () => set(() => ({ currentUser: null, accessToken: null, refreshToken: null })),

      login: async (email, password) => {
        try { const d = await authApi.login(email, password); applyAuth(set, d); return { success: true }; }
        catch (err) { return handleErr(err); }
      },
      loginWithGoogle: async (googleAccessToken) => {
        try { const d = await authApi.loginWithGoogle(googleAccessToken); applyAuth(set, d); return { success: true }; }
        catch (err) { return handleErr(err); }
      },
      register: async (username, email, password) => {
        try { const d = await authApi.register(username, email, password); applyAuth(set, d); return { success: true }; }
        catch (err) { return handleErr(err); }
      },
      logout: async () => {
        try { await authApi.logout(); } catch { }
        set(() => ({ currentUser: null, accessToken: null, refreshToken: null }));
      },
      updateProfile: (updates) =>
        set((s) => ({ currentUser: s.currentUser ? { ...s.currentUser, ...updates } : null })),

      bookmarks: [],
      addBookmark: (id) => set((s) => ({ bookmarks: [...s.bookmarks, id] })),
      removeBookmark: (id) => set((s) => ({ bookmarks: s.bookmarks.filter((b) => b !== id) })),
      isBookmarked: (id) => get().bookmarks.includes(id),

      shelf: [],
      addToShelf: (storyId, status) => {
        if (get().shelf.find((e) => e.storyId === storyId)) return;
        const now = new Date().toISOString();
        set((s) => ({ shelf: [{ storyId, status, addedAt: now, lastUpdated: now }, ...s.shelf] }));
      },
      updateShelfStatus: (storyId, status) =>
        set((s) => ({
          shelf: s.shelf.map((e) => e.storyId === storyId
            ? { ...e, status, lastUpdated: new Date().toISOString(), completedAt: status === 'completed' ? new Date().toISOString() : e.completedAt }
            : e),
        })),
      removeFromShelf: (id) => set((s) => ({ shelf: s.shelf.filter((e) => e.storyId !== id) })),
      getShelfEntry: (id) => get().shelf.find((e) => e.storyId === id),
      getShelfByStatus: (status) => get().shelf.filter((e) => e.status === status),

      history: [],
      updateProgress: (p) =>
        set((s) => ({ history: [p, ...s.history.filter((h) => h.storyId !== p.storyId)].slice(0, 50) })),
      getProgress: (id) => get().history.find((h) => h.storyId === id),
      clearHistory: () => set({ history: [] }),

      readerSettings: { fontSize: 'md', theme: 'light', lineHeight: 'relaxed', fontFamily: 'sans' },
      updateReaderSettings: (s) => set((st) => ({ readerSettings: { ...st.readerSettings, ...s } })),

      recentSearches: [],
      addRecentSearch: (q) =>
        set((s) => ({ recentSearches: [q, ...s.recentSearches.filter((x) => x !== q)].slice(0, 10) })),
      clearRecentSearches: () => set({ recentSearches: [] }),

      recentlyViewed: [],
      addRecentlyViewed: (story) =>
        set((s) => ({ recentlyViewed: [story, ...s.recentlyViewed.filter((x) => x.id !== story.id)].slice(0, 20) })),
    }),
    {
      name: 'story-reader-mobile',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        currentUser: s.currentUser,
        refreshToken: s.refreshToken,
        bookmarks: s.bookmarks,
        shelf: s.shelf,
        history: s.history,
        readerSettings: s.readerSettings,
        recentSearches: s.recentSearches,
        recentlyViewed: s.recentlyViewed,
      }),
    }
  )
);

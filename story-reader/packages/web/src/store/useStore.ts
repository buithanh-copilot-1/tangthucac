import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ReaderSettings, ReadingProgress, Story, ShelfEntry, ShelfStatus, User } from '@story-reader/shared';
import { authApi, type AuthResponse } from '../services/auth.api';
import { shelfApi, bookmarksApi, progressApi, settingsApi } from '../services/user-data.api';
import { ApiError } from '../services/api';

export interface AuthResult {
  success: boolean;
  error?: string;
}

// ─── Shape lưu localStorage: chỉ readerSettings + refreshToken + recentlyViewed
// Mọi user-data (shelf/bookmarks/progress) được load từ API khi login
// ─────────────────────────────────────────────────────────────────────────────

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
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, 'username' | 'displayName'>>) => void;

  // ── User data sync ────────────────────────────────────────────────────
  loadUserData: () => Promise<void>;
  clearUserData: () => void;

  // ── Bookmarks ─────────────────────────────────────────────────────────
  bookmarks: string[];
  pendingBookmarks: string[];
  addBookmark: (storyId: string) => Promise<void>;
  removeBookmark: (storyId: string) => Promise<void>;
  isBookmarked: (storyId: string) => boolean;
  isBookmarkPending: (storyId: string) => boolean;

  // ── Shelf ─────────────────────────────────────────────────────────────
  shelf: ShelfEntry[];
  pendingShelf: string[];
  addToShelf: (storyId: string, status: ShelfStatus) => Promise<void>;
  updateShelfStatus: (storyId: string, status: ShelfStatus) => Promise<void>;
  removeFromShelf: (storyId: string) => Promise<void>;
  getShelfEntry: (storyId: string) => ShelfEntry | undefined;
  getShelfByStatus: (status: ShelfStatus) => ShelfEntry[];
  isShelfPending: (storyId: string) => boolean;

  // ── Reading progress ──────────────────────────────────────────────────
  history: ReadingProgress[];
  updateProgress: (progress: ReadingProgress) => void;
  getProgress: (storyId: string) => ReadingProgress | undefined;
  clearHistory: () => void;

  // ── Reader settings (lưu local, theo device) ──────────────────────────
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

// ── Helpers ─────────────────────────────────────────────────────────────────

function applyAuthResponse(
  set: (fn: (s: AppState) => Partial<AppState>) => void,
  data: AuthResponse,
) {
  set(() => ({
    currentUser: data.user,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  }));
}

function handleApiError(err: unknown): AuthResult {
  if (err instanceof ApiError) return { success: false, error: err.message };
  return { success: false, error: 'Lỗi kết nối server. Vui lòng thử lại.' };
}

const EMPTY_USER_DATA = {
  bookmarks: [] as string[],
  pendingBookmarks: [] as string[],
  shelf: [] as ShelfEntry[],
  pendingShelf: [] as string[],
  history: [] as ReadingProgress[],
};

// Debounce timer cho save settings lên API
let settingsSaveTimer: ReturnType<typeof setTimeout> | null = null;
function debounceSaveSettings(settings: ReaderSettings) {
  if (settingsSaveTimer) clearTimeout(settingsSaveTimer);
  settingsSaveTimer = setTimeout(() => {
    settingsApi.update(settings).catch(() => { /* silent */ });
  }, 1000);
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── Auth ──────────────────────────────────────────────────────────
      currentUser: null,
      accessToken: null,
      refreshToken: null,

      setTokens: (access, refresh) =>
        set(() => ({ accessToken: access, refreshToken: refresh })),

      clearAuth: () =>
        set(() => ({ currentUser: null, accessToken: null, refreshToken: null })),

      login: async (email, password) => {
        try {
          const data = await authApi.login(email, password);
          applyAuthResponse(set, data);
          // Sau khi login → load data của user từ API
          setTimeout(() => get().loadUserData(), 0);
          return { success: true };
        } catch (err) { return handleApiError(err); }
      },

      loginWithGoogle: async (googleAccessToken) => {
        try {
          const data = await authApi.loginWithGoogle(googleAccessToken);
          applyAuthResponse(set, data);
          setTimeout(() => get().loadUserData(), 0);
          return { success: true };
        } catch (err) { return handleApiError(err); }
      },

      register: async (username, email, password) => {
        try {
          const data = await authApi.register(username, email, password);
          applyAuthResponse(set, data);
          // User mới → data trống, không cần load
          set(() => EMPTY_USER_DATA);
          return { success: true };
        } catch (err) { return handleApiError(err); }
      },

      changePassword: async (currentPassword, newPassword) => {
        try {
          await authApi.changePassword(currentPassword, newPassword);
          set(() => ({
            currentUser: null,
            accessToken: null,
            refreshToken: null,
            ...EMPTY_USER_DATA,
          }));
          return { success: true };
        } catch (err) { return handleApiError(err); }
      },

      logout: async () => {
        try { await authApi.logout(); } catch { /* ignore */ }
        set(() => ({
          currentUser: null,
          accessToken: null,
          refreshToken: null,
          ...EMPTY_USER_DATA,   // xoá data của user cũ
        }));
      },

      updateProfile: (updates) =>
        set((s) => ({ currentUser: s.currentUser ? { ...s.currentUser, ...updates } : null })),

      // ── User data sync ─────────────────────────────────────────────────
      loadUserData: async () => {
        const { currentUser } = get();
        if (!currentUser) return;
        try {
          const [shelfRes, bmRes, progressRes, settingsRes] = await Promise.allSettled([
            shelfApi.getAll(),
            bookmarksApi.getAll(),
            progressApi.getAll(),
            settingsApi.get(),
          ]);

          const newShelf: ShelfEntry[] = shelfRes.status === 'fulfilled'
            ? shelfRes.value.map((e: any) => ({
                storyId: e.storyId,
                status: e.status.toLowerCase() as ShelfStatus,
                addedAt: e.addedAt,
                lastUpdated: e.updatedAt ?? e.addedAt,
                completedAt: e.completedAt ?? undefined,
              }))
            : get().shelf;

          const newBookmarks: string[] = bmRes.status === 'fulfilled'
            ? bmRes.value.map((b: any) => b.storyId)
            : get().bookmarks;

          const newHistory: ReadingProgress[] = progressRes.status === 'fulfilled'
            ? progressRes.value.map((p: any) => ({
                storyId: p.storyId,
                chapterId: p.chapterId,
                chapterNumber: p.chapterNumber,
                scrollPosition: p.scrollPosition ?? 0,
                lastRead: p.lastRead,
              }))
            : get().history;

          // Merge settings từ server vào local (server thắng)
          const serverSettings = settingsRes.status === 'fulfilled' && settingsRes.value
            ? settingsRes.value
            : null;
          const mergedSettings = serverSettings
            ? { ...get().readerSettings, ...serverSettings } as ReaderSettings
            : get().readerSettings;

          set(() => ({
            shelf: newShelf,
            bookmarks: newBookmarks,
            history: newHistory,
            readerSettings: mergedSettings,
          }));
        } catch { /* silent — dùng data local nếu offline */ }
      },

      clearUserData: () => set(() => EMPTY_USER_DATA),

      // ── Bookmarks ──────────────────────────────────────────────────────
      bookmarks: [],
      pendingBookmarks: [],

      addBookmark: async (storyId) => {
        // Optimistic update
        set((s) => ({
          bookmarks: s.bookmarks.includes(storyId) ? s.bookmarks : [...s.bookmarks, storyId],
          pendingBookmarks: s.pendingBookmarks.includes(storyId) ? s.pendingBookmarks : [...s.pendingBookmarks, storyId],
        }));
        const { currentUser } = get();
        if (currentUser) {
          try { await bookmarksApi.add(storyId); }
          catch { set((s) => ({ bookmarks: s.bookmarks.filter((id) => id !== storyId) })); }
        }
        set((s) => ({ pendingBookmarks: s.pendingBookmarks.filter((id) => id !== storyId) }));
      },

      removeBookmark: async (storyId) => {
        set((s) => ({
          bookmarks: s.bookmarks.filter((id) => id !== storyId),
          pendingBookmarks: s.pendingBookmarks.includes(storyId) ? s.pendingBookmarks : [...s.pendingBookmarks, storyId],
        }));
        const { currentUser } = get();
        if (currentUser) {
          try { await bookmarksApi.remove(storyId); }
          catch { set((s) => ({ bookmarks: [...s.bookmarks, storyId] })); }
        }
        set((s) => ({ pendingBookmarks: s.pendingBookmarks.filter((id) => id !== storyId) }));
      },

      isBookmarked: (storyId) => get().bookmarks.includes(storyId),
      isBookmarkPending: (storyId) => get().pendingBookmarks.includes(storyId),

      // ── Shelf ──────────────────────────────────────────────────────────
      shelf: [],
      pendingShelf: [],

      addToShelf: async (storyId, status) => {
        if (get().shelf.find((e) => e.storyId === storyId)) return;
        const now = new Date().toISOString();
        const entry: ShelfEntry = { storyId, status, addedAt: now, lastUpdated: now };
        set((s) => ({
          shelf: [entry, ...s.shelf],
          pendingShelf: s.pendingShelf.includes(storyId) ? s.pendingShelf : [...s.pendingShelf, storyId],
        }));
        const { currentUser } = get();
        if (currentUser) {
          try { await shelfApi.upsert(storyId, status); }
          catch { set((s) => ({ shelf: s.shelf.filter((e) => e.storyId !== storyId) })); }
        }
        set((s) => ({ pendingShelf: s.pendingShelf.filter((id) => id !== storyId) }));
      },

      updateShelfStatus: async (storyId, status) => {
        set((s) => ({
          shelf: s.shelf.map((e) =>
            e.storyId === storyId
              ? { ...e, status, lastUpdated: new Date().toISOString(), completedAt: status === 'completed' ? new Date().toISOString() : e.completedAt }
              : e,
          ),
          pendingShelf: s.pendingShelf.includes(storyId) ? s.pendingShelf : [...s.pendingShelf, storyId],
        }));
        const { currentUser } = get();
        if (currentUser) {
          try { await shelfApi.upsert(storyId, status); }
          catch { /* keep local */ }
        }
        set((s) => ({ pendingShelf: s.pendingShelf.filter((id) => id !== storyId) }));
      },

      removeFromShelf: async (storyId) => {
        const prev = get().shelf;
        set((s) => ({
          shelf: s.shelf.filter((e) => e.storyId !== storyId),
          pendingShelf: s.pendingShelf.includes(storyId) ? s.pendingShelf : [...s.pendingShelf, storyId],
        }));
        const { currentUser } = get();
        if (currentUser) {
          try { await shelfApi.remove(storyId); }
          catch { set(() => ({ shelf: prev })); }
        }
        set((s) => ({ pendingShelf: s.pendingShelf.filter((id) => id !== storyId) }));
      },

      getShelfEntry: (storyId) => get().shelf.find((e) => e.storyId === storyId),
      getShelfByStatus: (status) => get().shelf.filter((e) => e.status === status),
      isShelfPending: (storyId) => get().pendingShelf.includes(storyId),

      // ── Reading progress ───────────────────────────────────────────────
      history: [],

      updateProgress: (progress) => {
        set((s) => {
          const filtered = s.history.filter((h) => h.storyId !== progress.storyId);
          return { history: [progress, ...filtered].slice(0, 50) };
        });
        const { currentUser } = get();
        if (currentUser) {
          // Fire-and-forget, không block UI
          progressApi.upsert({
            storyId: progress.storyId,
            chapterId: progress.chapterId,
            chapterNumber: progress.chapterNumber,
            scrollPosition: progress.scrollPosition,
          }).catch(() => { /* silent */ });
        }
      },

      getProgress: (storyId) => get().history.find((h) => h.storyId === storyId),
      clearHistory: () => set({ history: [] }),

      // ── Reader settings ────────────────────────────────────────────────
      readerSettings: { fontSize: 'md', theme: 'light', lineHeight: 'relaxed', fontFamily: 'sans' },
      updateReaderSettings: (settings) => {
        set((s) => {
          const next = { ...s.readerSettings, ...settings };
          // Nếu đang login → debounce save lên API
          if (s.currentUser) debounceSaveSettings(next);
          return { readerSettings: next };
        });
      },

      // ── Recent searches ────────────────────────────────────────────────
      recentSearches: [],
      addRecentSearch: (query) =>
        set((s) => ({
          recentSearches: [query, ...s.recentSearches.filter((q) => q !== query)].slice(0, 10),
        })),
      clearRecentSearches: () => set({ recentSearches: [] }),

      // ── Recently viewed ────────────────────────────────────────────────
      recentlyViewed: [],
      addRecentlyViewed: (story) =>
        set((s) => ({
          recentlyViewed: [story, ...s.recentlyViewed.filter((st) => st.id !== story.id)].slice(0, 20),
        })),
    }),
    {
      name: 'story-reader-storage',
      partialize: (s) => ({
        currentUser:     s.currentUser,
        refreshToken:    s.refreshToken,
        // shelf/bookmarks/history KHÔNG persist — được load từ API khi login
        // Chỉ cache tạm thời trong memory (session)
        readerSettings:  s.readerSettings,   // device preference
        recentSearches:  s.recentSearches,
        recentlyViewed:  s.recentlyViewed,
      }),
    },
  ),
);

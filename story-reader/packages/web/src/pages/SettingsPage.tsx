import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Check,
  ChevronRight,
  Edit2,
  Globe,
  Info,
  KeyRound,
  LogOut,
  Trash2,
  X,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useToast } from '../store/useToast';
import Layout from '../components/layout/Layout';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const AVATAR_COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500'];

export default function SettingsPage() {
  useDocumentMeta({
    title: 'Cai dat',
    description: 'Quan ly tai khoan, mat khau va du lieu doc truyen.',
  });

  const navigate = useNavigate();
  const toast = useToast();
  const {
    currentUser,
    logout,
    updateProfile,
    changePassword,
    clearHistory,
    clearRecentSearches,
    bookmarks,
    shelf,
  } = useStore();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(currentUser?.username ?? '');
  const [nameError, setNameError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const displayName = currentUser?.displayName ?? currentUser?.username ?? '';
  const initials = displayName.slice(0, 2).toUpperCase();
  const colorIdx = currentUser ? currentUser.id.charCodeAt(currentUser.id.length - 1) % AVATAR_COLORS.length : 0;
  const hasGooglePhoto = currentUser?.avatar?.startsWith('http');
  const provider = String(currentUser?.provider ?? '').toLowerCase();
  const joinedDate = currentUser
    ? new Date(currentUser.joinedAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setNameError('Ten khong duoc de trong');
      return;
    }
    if (trimmed.length < 3) {
      setNameError('It nhat 3 ky tu');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setNameError('Chi dung chu, so va _');
      return;
    }
    updateProfile({ username: trimmed });
    setEditingName(false);
    setNameError('');
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (passwordForm.next.length < 6) {
      setPasswordError('Mat khau moi phai it nhat 6 ky tu');
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordError('Xac nhan mat khau khong khop');
      return;
    }

    setPasswordLoading(true);
    const result = await changePassword(passwordForm.current, passwordForm.next);
    setPasswordLoading(false);

    if (result.success) {
      toast.success('Da doi mat khau. Vui long dang nhap lai.');
      navigate('/login', { replace: true });
      return;
    }
    setPasswordError(result.error ?? 'Doi mat khau that bai');
  };

  const handleLogout = async () => {
    await logout();
    toast.info('Ban da dang xuat.');
    navigate('/');
  };

  return (
    <Layout title="Cai Dat">
      <div className="px-4 pt-4 pb-8 space-y-5">
        {currentUser ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-4 px-4 py-5">
              <div className="relative flex-shrink-0">
                {hasGooglePhoto ? (
                  <img
                    src={currentUser.avatar}
                    alt={displayName}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover shadow-sm"
                  />
                ) : (
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold ${AVATAR_COLORS[colorIdx]}`}>
                    {initials}
                  </div>
                )}
                {provider === 'google' && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                    <span className="text-xs font-bold text-[#4285F4]">G</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                {editingName ? (
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        value={nameInput}
                        onChange={(e) => {
                          setNameInput(e.target.value);
                          setNameError('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveName();
                          if (e.key === 'Escape') setEditingName(false);
                        }}
                        className="flex-1 text-sm font-semibold text-gray-900 border-b-2 border-primary-400 outline-none bg-transparent py-0.5"
                      />
                      <button type="button" onClick={handleSaveName} className="w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingName(false);
                          setNameError('');
                          setNameInput(currentUser.username);
                        }}
                        className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center"
                      >
                        <X size={14} className="text-gray-500" />
                      </button>
                    </div>
                    {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-gray-900 truncate">
                      {currentUser.displayName ?? currentUser.username}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingName(true);
                        setNameInput(currentUser.username);
                      }}
                    >
                      <Edit2 size={13} className="text-gray-400" />
                    </button>
                  </div>
                )}

                {currentUser.displayName && currentUser.displayName !== currentUser.username && (
                  <p className="text-xs text-gray-400 mt-0.5">@{currentUser.username}</p>
                )}
                <p className="text-xs text-gray-500 mt-0.5 truncate">{currentUser.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  {provider === 'google' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#4285F4] bg-blue-50 px-2 py-0.5 rounded-full">
                      <span className="font-bold">G</span> Google Account
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      Email
                    </span>
                  )}
                  <p className="text-[10px] text-gray-400">Tham gia {joinedDate}</p>
                </div>
              </div>
            </div>

            {provider === 'google' && (
              <div className="mx-4 mb-4 rounded-2xl bg-[#f8faff] border border-[#e8eeff] overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#e8eeff]">
                  <span className="text-xs font-bold text-[#4285F4]">G</span>
                  <span className="text-xs font-semibold text-[#4285F4]">Thong tin Google Account</span>
                  {currentUser.emailVerified && (
                    <span className="ml-auto text-[10px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                      Da xac minh
                    </span>
                  )}
                </div>
                <div className="divide-y divide-[#e8eeff]">
                  {[
                    { label: 'Ho va ten', value: currentUser.displayName },
                    { label: 'Ho', value: currentUser.familyName },
                    { label: 'Ten', value: currentUser.givenName },
                    { label: 'Email', value: currentUser.email },
                    { label: 'Google ID', value: currentUser.googleId },
                  ].filter((row) => row.value).map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-xs text-gray-500 w-24 flex-shrink-0">{label}</span>
                      <span className="text-xs font-medium text-gray-900 truncate text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 border-t border-gray-50">
              {[
                { label: 'Yeu thich', value: bookmarks.length, color: 'text-primary-500' },
                { label: 'Dang doc', value: shelf.filter((entry) => entry.status === 'reading').length, color: 'text-blue-500' },
                { label: 'Da doc', value: shelf.filter((entry) => entry.status === 'completed').length, color: 'text-green-500' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex flex-col items-center py-3 border-r border-gray-50 last:border-0">
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-50">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-red-500 active:bg-red-50"
              >
                <LogOut size={17} />
                <span className="text-sm font-medium">Dang xuat</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-5 border border-primary-100">
            <p className="text-base font-bold text-gray-900 mb-1">Chua dang nhap</p>
            <p className="text-xs text-gray-600 mb-4">
              Dang nhap de luu tu truyen, tien do doc va dong bo tren nhieu thiet bi.
            </p>
            <div className="flex gap-3">
              <Link to="/login" className="flex-1 bg-primary-500 text-white text-sm font-semibold py-2.5 rounded-xl text-center">
                Dang nhap
              </Link>
              <Link to="/register" className="flex-1 bg-white text-primary-500 border border-primary-300 text-sm font-semibold py-2.5 rounded-xl text-center">
                Dang ky
              </Link>
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">Du lieu</p>
          <div className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-100 shadow-sm border border-gray-100">
            <button type="button" onClick={clearHistory} className="w-full flex items-center justify-between px-4 py-4 active:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Trash2 size={18} className="text-orange-500" />
                </div>
                <p className="text-sm font-medium text-gray-900">Xoa lich su doc</p>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
            <button
              type="button"
              onClick={() => {
                clearHistory();
                clearRecentSearches();
              }}
              className="w-full flex items-center justify-between px-4 py-4 active:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                  <Trash2 size={18} className="text-red-500" />
                </div>
                <p className="text-sm font-medium text-red-600">Xoa tat ca du lieu</p>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">Khac</p>
          <div className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-100 shadow-sm border border-gray-100">
            {currentUser && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm((value) => !value);
                    setPasswordError('');
                  }}
                  className="w-full flex items-center justify-between px-4 py-4 active:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
                      <KeyRound size={18} className="text-primary-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Doi mat khau</p>
                  </div>
                  <ChevronRight size={16} className={`text-gray-400 transition-transform ${showPasswordForm ? 'rotate-90' : ''}`} />
                </button>

                {showPasswordForm && (
                  <div className="px-4 py-4 bg-gray-50">
                    {provider === 'email' ? (
                      <form onSubmit={handleChangePassword} className="space-y-2">
                        <input
                          type="password"
                          value={passwordForm.current}
                          onChange={(e) => setPasswordForm((form) => ({ ...form, current: e.target.value }))}
                          placeholder="Mat khau hien tai"
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-400"
                        />
                        <input
                          type="password"
                          value={passwordForm.next}
                          onChange={(e) => setPasswordForm((form) => ({ ...form, next: e.target.value }))}
                          placeholder="Mat khau moi"
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-400"
                        />
                        <input
                          type="password"
                          value={passwordForm.confirm}
                          onChange={(e) => setPasswordForm((form) => ({ ...form, confirm: e.target.value }))}
                          placeholder="Xac nhan mat khau moi"
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-400"
                        />
                        {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
                        <button
                          type="submit"
                          disabled={passwordLoading}
                          className="w-full rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          {passwordLoading ? 'Dang doi...' : 'Doi mat khau'}
                        </button>
                      </form>
                    ) : (
                      <p className="rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-700">
                        Tai khoan Google khong co mat khau email trong he thong.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Globe size={18} className="text-purple-500" />
                </div>
                <p className="text-sm font-medium text-gray-900">Ngon ngu</p>
              </div>
              <span className="text-sm text-gray-500">Tieng Viet</span>
            </div>

            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Info size={18} className="text-gray-500" />
                </div>
                <p className="text-sm font-medium text-gray-900">Phien ban</p>
              </div>
              <span className="text-sm text-gray-500">1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

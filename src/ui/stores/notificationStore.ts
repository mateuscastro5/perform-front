import { create } from 'zustand';

export type NotificationStatus = 'in_progress' | 'success' | 'error' | 'info';
export type NotificationCategory = 'sync' | 'system' | 'profile' | 'general';

export interface NotificationAction {
  label: string;
  /** Path passed to react-router. The bell handles navigation. */
  href?: string;
  /** Optional callback when the action is clicked. */
  onClick?: () => void;
}

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  status: NotificationStatus;
  title: string;
  description?: string;
  /** 0–100 — only meaningful while status === 'in_progress'. */
  progress?: number;
  /** ISO timestamp; set automatically on add. */
  createdAt: string;
  /** Inline CTA shown in the bell dropdown. */
  action?: NotificationAction;
  /** Has the user opened the bell after this notification was added? */
  read: boolean;
}

interface NotificationStore {
  notifications: AppNotification[];
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  add: (
    notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'> &
      Partial<Pick<AppNotification, 'id' | 'createdAt' | 'read'>>,
  ) => string;
  update: (id: string, patch: Partial<AppNotification>) => void;
  remove: (id: string) => void;
  clearAll: () => void;
  markAllRead: () => void;
}

const MAX_KEPT = 30; // cap so the bell list never grows unbounded

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  isOpen: false,

  setOpen: (open) =>
    set((state) => ({
      isOpen: open,
      // Mark everything as read once the panel opens
      notifications: open
        ? state.notifications.map((n) => ({ ...n, read: true }))
        : state.notifications,
    })),

  add: (input) => {
    const id =
      input.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    set((state) => {
      const next: AppNotification = {
        id,
        createdAt: input.createdAt ?? new Date().toISOString(),
        read: input.read ?? false,
        category: input.category,
        status: input.status,
        title: input.title,
        description: input.description,
        progress: input.progress,
        action: input.action,
      };
      const merged = [next, ...state.notifications];
      return { notifications: merged.slice(0, MAX_KEPT) };
    });
    return id;
  },

  update: (id, patch) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, ...patch } : n,
      ),
    })),

  remove: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearAll: () => set({ notifications: [] }),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
}));

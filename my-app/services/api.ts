// API Configuration
// Les base-URL fra .env (EXPO_PUBLIC_API_URL). Fallback til localhost for web/PC.
const ENV_BASE_URL = (process.env.EXPO_PUBLIC_API_URL as string | undefined) || '';
export const API_BASE_URL = ENV_BASE_URL || 'http://localhost:3002/api';
// Debug: Log the resolved API base URL once at startup
/* eslint-disable no-console */
if (typeof console !== 'undefined') {
  try { console.log('[api] Using base URL:', API_BASE_URL); } catch {}
}
/* eslint-enable no-console */

import { ChildStatus, isValidStatus } from '@/constants/statuses';
import { isValidGroup } from '@/services/utils/groupUtils';

// Types
export interface Child {
  id: number;
  name: string;
  birthDate: string;
  age: number | '';
  group: string;
  allergies: string[];
  status: ChildStatus;
  checkedInAt: string | null;
  checkedOutAt: string | null;
  parentId: number;
  consentGiven?: boolean;
}

export interface Parent {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  childrenIds: number[];
  verified?: boolean;
}

export interface Activity {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  videoUrl?: string | null;
  createdAt: string;
  createdBy: string;
  group: string;
  // Nytt: Valgfri liste over mediaelementer (bilde/video)
  media?: Array<{
    type: 'image' | 'video';
    url: string;
    posterUrl?: string; // for video – vises som thumbnail
  }>;
}

export interface Stats {
  totalChildren: number;
  checkedIn: number;
  checkedOut: number;
  home: number;
  groups: Group[];
}

export interface Group {
  id: number;
  name: string;
  totalCapacity: number;
  currentCount: number;
}

export interface Message {
  id: number;
  parentId: number;
  sender: 'parent' | 'staff';
  content: string;
  createdAt: string;
  read: boolean;
}

// Paged result helper
interface PagedActivities {
  items: Activity[];
  total?: number;
  limit?: number;
  offset?: number;
}

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // Normaliser base-URL (fjern trailing "/")
  const baseUrl = API_BASE_URL.replace(/\/$/, '');

  // Sørg for at endpoint alltid starter med "/"
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    if (!response.ok) {
      let errorMessage = 'API request failed';

      try {
        const errorBody = await response.json();
        if (errorBody && typeof errorBody.error === 'string') {
          errorMessage = errorBody.error;
        }
      } catch {
        // Ignorer JSON-parse-feil på error body
      }

      throw new Error(errorMessage);
    }

    // Hvis ingen body (204 / empty), kast for å unngå JSON-parse-feil
    const text = await response.text();
    if (!text) {
      throw new Error('Empty response from API');
    }

    return JSON.parse(text) as T;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Validation helpers
function validateChild(data: Partial<Child>): boolean {
  if (data.name && typeof data.name !== 'string') {
    throw new Error('Invalid child name: must be a string');
  }
  if (data.status && !isValidStatus(data.status)) {
    throw new Error(`Invalid status: ${data.status}. Valid statuses: ${Object.values(ChildStatus).join(', ')}`);
  }
  if (data.group && !isValidGroup(data.group)) {
    console.warn(`Warning: group "${data.group}" not in predefined groups`);
  }
  return true;
}

function validateActivity(data: {
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  group?: string;
  media?: Array<{ type: 'image' | 'video'; url: string; posterUrl?: string }>;
}): boolean {
  if (!data.title || typeof data.title !== 'string') {
    throw new Error('Invalid activity title: required string');
  }
  if (!data.description || typeof data.description !== 'string') {
    throw new Error('Invalid activity description: required string');
  }
  if (data.group && !isValidGroup(data.group)) {
    console.warn(`Warning: group "${data.group}" not in predefined groups`);
  }
  if (data.media && Array.isArray(data.media)) {
    data.media.forEach((m, i) => {
      if (!['image', 'video'].includes(m.type)) {
        throw new Error(`Invalid media type at index ${i}: must be "image" or "video"`);
      }
      if (!m.url || typeof m.url !== 'string') {
        throw new Error(`Invalid media URL at index ${i}: required string`);
      }
    });
  }
  return true;
}

// Children API
export const childrenAPI = {
  // Get all children
  getAll: (): Promise<Child[]> => {
    return apiCall<Child[]>('/children');
  },

  // Create child
  create: (data: {
    name: string;
    birthDate?: string;
    age?: number;
    group: string;
    allergies?: string[];
    status?: ChildStatus;
    parentId: number;
    consentGiven?: boolean;
  }): Promise<Child> => {
    return apiCall<Child>('/children', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get one child by ID
  getById: (id: number): Promise<Child> => {
    return apiCall<Child>(`/children/${id}`);
  },

  // Update child
  update: (id: number, data: Partial<Child>): Promise<Child> => {
    validateChild(data);
    return apiCall<Child>(`/children/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Check in child
  checkIn: (id: number): Promise<{ message: string; child: Child }> => {
    return apiCall<{ message: string; child: Child }>(`/children/${id}/checkin`, {
      method: 'POST',
    });
  },

  // Check out child
  checkOut: (id: number): Promise<{ message: string; child: Child }> => {
    return apiCall<{ message: string; child: Child }>(`/children/${id}/checkout`, {
      method: 'POST',
    });
  },
};

// Parents API
export const parentsAPI = {
  // Get all parents
  getAll: (): Promise<Parent[]> => {
    return apiCall<Parent[]>('/parents');
  },

  // Get one parent by ID
  getById: (id: number): Promise<Parent> => {
    return apiCall<Parent>(`/parents/${id}`);
  },

  // Update parent
  update: (id: number, data: Partial<Parent>): Promise<Parent> => {
    return apiCall<Parent>(`/parents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Verify / unverify
  verify: (id: number, verified = true): Promise<Parent> => {
    return apiCall<Parent>(`/parents/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ verified }),
    });
  },

  // Get parent's children
  getChildren: (id: number): Promise<Child[]> => {
    return apiCall<Child[]>(`/parents/${id}/children`);
  },
};

// Activities API
export const activitiesAPI = {
  // Get activities with optional filters (normalized to Activity[] for simplicity)
  // Usage: getAll() | getAll(group) | getAll({ group, limit, offset, date })
  getAll: (
    arg?: string | { group?: string; limit?: number; offset?: number; date?: string }
  ): Promise<Activity[]> => {
    if (typeof arg === 'undefined' || typeof arg === 'string') {
      const endpoint = typeof arg === 'string' && arg
        ? `/activities?group=${encodeURIComponent(arg)}`
        : '/activities';
      return apiCall<Activity[]>(endpoint);
    }

    const params = new URLSearchParams();
    if (arg.group) params.set('group', arg.group);
    if (typeof arg.limit === 'number') params.set('limit', String(arg.limit));
    if (typeof arg.offset === 'number') params.set('offset', String(arg.offset));
    if (arg.date) params.set('date', arg.date);
    const endpoint = `/activities${params.toString() ? `?${params.toString()}` : ''}`;
    return apiCall<PagedActivities>(endpoint).then(r => r.items);
  },

  // If you need total/limit/offset, use getPage
  getPage: (
    opts: { group?: string; limit?: number; offset?: number; date?: string }
  ): Promise<PagedActivities> => {
    const params = new URLSearchParams();
    if (opts.group) params.set('group', opts.group);
    if (typeof opts.limit === 'number') params.set('limit', String(opts.limit));
    if (typeof opts.offset === 'number') params.set('offset', String(opts.offset));
    if (opts.date) params.set('date', opts.date);
    const endpoint = `/activities${params.toString() ? `?${params.toString()}` : ''}`;
    return apiCall<PagedActivities>(endpoint);
  },

  // Create new activity
  create: (data: {
    title: string;
    description: string;
    imageUrl?: string;
    videoUrl?: string;
    group?: string;
    media?: Array<{ type: 'image' | 'video'; url: string; posterUrl?: string }>;
  }): Promise<Activity> => {
    validateActivity(data);
    return apiCall<Activity>('/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Media upload API (optional – expects backend endpoint `/upload` that returns `{ url: string }`)
export const mediaAPI = {
  upload: async (fileUri: string, mimeType?: string, filename?: string): Promise<string> => {
    const baseUrl = API_BASE_URL.replace(/\/$/, '');
    const form = new FormData();

    const name = filename || fileUri.split('/').pop() || 'upload';
    const type = mimeType || (name.match(/\.\w+$/)?.[0] === '.mp4' ? 'video/mp4' : 'image/jpeg');

    form.append('file', { uri: fileUri, name, type } as any);

    const res = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      // Don't set content-type manually so RN adds boundary
      body: form,
    });

    if (!res.ok) {
      throw new Error('Upload failed');
    }
    const data = await res.json();
    if (data && typeof data.url === 'string') return data.url;
    throw new Error('Upload response missing url');
  },
};

// Stats API
export const statsAPI = {
  // Get stats
  getStats: (): Promise<Stats> => {
    return apiCall<Stats>('/stats');
  },

  // Get groups
  getGroups: (): Promise<Group[]> => {
    return apiCall<Group[]>('/stats/groups');
  },
};

// Messages API
export const messagesAPI = {
  listForParent: (parentId: number): Promise<Message[]> => {
    return apiCall<Message[]>(`/messages?parentId=${parentId}`);
  },
  listAll: (): Promise<Message[]> => {
    return apiCall<Message[]>('/messages');
  },
  send: (data: { parentId: number; sender: 'parent' | 'staff'; content: string }): Promise<Message> => {
    return apiCall<Message>('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  markRead: (id: number): Promise<Message> => {
    return apiCall<Message>(`/messages/${id}/read`, {
      method: 'POST',
    });
  },
};

// Export all APIs as a single object
const api = {
  children: childrenAPI,
  parents: parentsAPI,
  activities: activitiesAPI,
  stats: statsAPI,
  media: mediaAPI,
  messages: messagesAPI,
};

export default api;

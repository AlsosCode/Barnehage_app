// API Configuration
const API_BASE_URL = 'http://localhost:3002/api';

// For testing on physical device or emulator, use your computer's IP address:
// const API_BASE_URL = 'http://10.0.0.61:3002/api';
// const API_BASE_URL = 'http://192.168.1.100:3002/api'; // Replace with your IP

// Types
export interface Child {
  id: number;
  name: string;
  birthDate: string;
  age: number;
  group: string;
  allergies: string[];
  status: 'checked_in' | 'checked_out' | 'home';
  checkedInAt: string | null;
  checkedOutAt: string | null;
  parentId: number;
}

export interface Parent {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  childrenIds: number[];
}

export interface Activity {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  createdAt: string;
  createdBy: string;
  group: string;
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

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Children API
export const childrenAPI = {
  // Get all children
  getAll: (): Promise<Child[]> => {
    return apiCall<Child[]>('/children');
  },

  // Get one child by ID
  getById: (id: number): Promise<Child> => {
    return apiCall<Child>(`/children/${id}`);
  },

  // Update child
  update: (id: number, data: Partial<Child>): Promise<Child> => {
    return apiCall<Child>(`/children/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Check in child
  checkIn: (id: number): Promise<{ message: string; child: Child }> => {
    return apiCall(`/children/${id}/checkin`, {
      method: 'POST',
    });
  },

  // Check out child
  checkOut: (id: number): Promise<{ message: string; child: Child }> => {
    return apiCall(`/children/${id}/checkout`, {
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

  // Get parent's children
  getChildren: (id: number): Promise<Child[]> => {
    return apiCall<Child[]>(`/parents/${id}/children`);
  },
};

// Activities API
export const activitiesAPI = {
  // Get all activities
  getAll: (group?: string): Promise<Activity[]> => {
    const endpoint = group ? `/activities?group=${encodeURIComponent(group)}` : '/activities';
    return apiCall<Activity[]>(endpoint);
  },

  // Create new activity
  create: (data: {
    title: string;
    description: string;
    imageUrl?: string;
    group?: string;
  }): Promise<Activity> => {
    return apiCall<Activity>('/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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

// Export all APIs as a single object
const api = {
  children: childrenAPI,
  parents: parentsAPI,
  activities: activitiesAPI,
  stats: statsAPI,
};

export default api;

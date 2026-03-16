const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

type AuthResponse = {
  token: string;
  user: {
    id: string;
    email: string;
  };
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error('Invalid email or password');
  }

  return res.json();
};

export const register = async (
  email: string,
  password: string,
): Promise<{ id: string; email: string }> => {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Registration failed');
  }

  return res.json();
};

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export type HabitDto = {
  _id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  completedDates: string[];
  streak: number;
  longestStreak: number;
  isArchived: boolean;
};

export const fetchHabits = async (): Promise<HabitDto[]> => {
  const res = await fetch(`${API_BASE_URL}/api/habits`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) {
    throw new Error('Failed to load habits');
  }

  return res.json();
};

export const createHabitApi = async (name: string): Promise<HabitDto> => {
  const res = await fetch(`${API_BASE_URL}/api/habits`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    throw new Error('Failed to create habit');
  }

  return res.json();
};

export const deleteHabitApi = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/api/habits/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) {
    throw new Error('Failed to delete habit');
  }
};

export const updateHabitApi = async (
  id: string,
  updates: Partial<Pick<HabitDto, 'name' | 'description' | 'frequency' | 'isArchived'>>,
): Promise<HabitDto> => {
  const res = await fetch(`${API_BASE_URL}/api/habits/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    throw new Error('Failed to update habit');
  }

  return res.json();
};

export const completeHabitApi = async (id: string, date: string): Promise<HabitDto> => {
  const res = await fetch(`${API_BASE_URL}/api/habits/${id}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ date }),
  });

  if (!res.ok) {
    throw new Error('Failed to complete habit');
  }

  return res.json();
};


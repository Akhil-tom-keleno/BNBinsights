export interface User {
  id: number;
  email: string;
  role: 'admin' | 'manager';
  name: string;
}

export interface Location {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  properties_count: number;
  avg_daily_rate: number;
  occupancy_rate: number;
  is_featured: boolean;
  managers?: Manager[];
}

export interface Manager {
  id: number;
  name: string;
  slug: string;
  description?: string;
  location_id: number;
  location_name?: string;
  location_slug?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  cover_image_url?: string;
  founded_year?: number;
  rating: number;
  review_count: number;
  services: string[];
  is_claimed: boolean;
  is_featured: boolean;
  is_active: boolean;
  reviews?: Review[];
}

export interface Review {
  id: number;
  manager_id: number;
  user_name: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  author_id?: number;
  author_name?: string;
  category?: string;
  tags: string[];
  is_published: boolean;
  published_at?: string;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

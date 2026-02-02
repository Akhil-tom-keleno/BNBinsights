import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface UseApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  token?: string | null;
}

export function useApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async <T,>(endpoint: string, options: UseApiOptions = {}): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (options.token) {
        headers['Authorization'] = `Bearer ${options.token}`;
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { request, isLoading, error };
}

export function useManagers() {
  const { request, isLoading, error } = useApi();

  const getManagers = useCallback((params?: { location?: string; featured?: boolean; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.location) queryParams.append('location', params.location);
    if (params?.featured) queryParams.append('featured', 'true');
    if (params?.search) queryParams.append('search', params.search);
    
    return request(`/managers?${queryParams.toString()}`);
  }, [request]);

  const getManager = useCallback((slug: string) => {
    return request(`/managers/${slug}`);
  }, [request]);

  return { getManagers, getManager, isLoading, error };
}

export function useLocations() {
  const { request, isLoading, error } = useApi();

  const getLocations = useCallback((featured?: boolean) => {
    const queryParams = featured ? '?featured=true' : '';
    return request(`/locations${queryParams}`);
  }, [request]);

  const getLocation = useCallback((slug: string) => {
    return request(`/locations/${slug}`);
  }, [request]);

  return { getLocations, getLocation, isLoading, error };
}

export function useBlog() {
  const { request, isLoading, error } = useApi();

  const getPosts = useCallback((params?: { category?: string; search?: string; limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    return request(`/blog?${queryParams.toString()}`);
  }, [request]);

  const getPost = useCallback((slug: string) => {
    return request(`/blog/${slug}`);
  }, [request]);

  const getCategories = useCallback(() => {
    return request('/blog/categories/list');
  }, [request]);

  return { getPosts, getPost, getCategories, isLoading, error };
}

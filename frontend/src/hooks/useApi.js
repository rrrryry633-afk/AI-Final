/**
 * useApi Hook - React hook for API calls with loading/error states
 * Provides consistent API call handling across components
 */

import { useState, useCallback } from 'react';
import { getErrorMessage } from '../api';

/**
 * Generic API call hook
 * @returns {Object} { execute, loading, error, data, reset }
 */
export function useApi(apiFunction, options = {}) {
  const { 
    onSuccess, 
    onError, 
    defaultValue = null,
    immediate = false,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(defaultValue);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFunction(...args);
      const result = response.data;
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage, err);
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(defaultValue);
  }, [defaultValue]);

  return { execute, loading, error, data, reset };
}

/**
 * Fetch hook with automatic execution on mount
 * @returns {Object} { loading, error, data, refetch }
 */
export function useFetch(apiFunction, dependencies = [], options = {}) {
  const { defaultValue = null, enabled = true } = options;
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [data, setData] = useState(defaultValue);

  const fetch = useCallback(async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await apiFunction();
      setData(response.data);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      setData(defaultValue);
    } finally {
      setLoading(false);
    }
  }, [apiFunction, enabled, defaultValue]);

  // Initial fetch
  useState(() => {
    if (enabled) {
      fetch();
    }
  });

  return { loading, error, data, refetch: fetch };
}

/**
 * Mutation hook for POST/PUT/DELETE operations
 * @returns {Object} { mutate, loading, error, data, reset }
 */
export function useMutation(apiFunction, options = {}) {
  const { onSuccess, onError, successMessage, errorMessage } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const mutate = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFunction(...args);
      const result = response.data;
      setData(result);
      
      if (onSuccess) {
        onSuccess(result, successMessage);
      }
      
      return { success: true, data: result };
    } catch (err) {
      const errMsg = getErrorMessage(err, errorMessage);
      setError(errMsg);
      
      if (onError) {
        onError(errMsg, err);
      }
      
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError, successMessage, errorMessage]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return { mutate, loading, error, data, reset };
}

export default useApi;

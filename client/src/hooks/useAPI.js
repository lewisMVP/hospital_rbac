import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook để fetch data từ API
 * @param {Function} apiFunction - Function từ api.js
 * @param {Array} dependencies - Dependencies để trigger refetch
 * @param {Boolean} immediate - Có fetch ngay khi mount không
 */
export function useAPI(apiFunction, dependencies = [], immediate = true) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiFunction(...args)
      
      if (result.success) {
        setData(result.data)
        return result.data
      } else {
        setError(result.error)
        return null
      }
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [apiFunction])

  useEffect(() => {
    if (immediate) {
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, ...dependencies])

  const refetch = useCallback((...args) => {
    return fetchData(...args)
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook cho mutations (POST, PUT, DELETE)
 * @param {Function} apiFunction - Function từ api.js
 */
export function useMutation(apiFunction) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutate = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiFunction(...args)
      
      if (result.success) {
        return { success: true, data: result.data }
      } else {
        setError(result.error)
        return { success: false, error: result.error }
      }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [apiFunction])

  return {
    mutate,
    loading,
    error,
  }
}

export default useAPI

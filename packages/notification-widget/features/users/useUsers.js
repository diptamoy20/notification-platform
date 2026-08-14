import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * useUsers — manages paginated, searchable users list
 * Debounces the search term (400ms) before hitting the API.
 * 
 * @param {Object} adapter - The frontend adapter
 */
const useUsers = (adapter) => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearchRaw] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debounceRef = useRef(null);

  const load = useCallback(async (searchTerm, pageNum) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adapter.getUsers({ search: searchTerm, page: pageNum, limit: 10 });
      setUsers(res.data.users);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [adapter]);

  // Debounced search
  const setSearch = useCallback((value) => {
    setSearchRaw(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      load(value, 1);
    }, 400);
  }, [load]);

  useEffect(() => {
    load(search, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return {
    users, total, totalPages, page, setPage,
    search, setSearch,
    loading, error,
    reload: () => load(search, page),
  };
};

export default useUsers;


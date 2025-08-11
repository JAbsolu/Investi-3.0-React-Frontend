// hooks/useErrorHandler.js
export const useErrorHandler = () => {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState({});
  
  const handleApiCall = async (key, apiCall) => {
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      const result = await apiCall();
      setErrors(prev => ({ ...prev, [key]: null }));
      return result;
    } catch (error) {
      setErrors(prev => ({ ...prev, [key]: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };
  
  return { errors, loading, handleApiCall };
};
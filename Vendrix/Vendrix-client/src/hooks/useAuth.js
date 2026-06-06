import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  return {
    user,
    token,
    isAuthenticated: !!token,
    logout: () => dispatch(logout()),
  };
};

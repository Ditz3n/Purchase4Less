import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [isAuthorized, setIsAuthorized] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkAuthorization = async () => {
      const dummyLogin = localStorage.getItem('dummyLogin');
      const dummyRole = localStorage.getItem('dummyRole');

      if (!isSignedIn && dummyLogin !== 'true') {
        setIsAuthorized(false);
        return;
      }

      if (requiredRole) {
        if (dummyLogin === 'true' && dummyRole) {
          if (dummyRole !== requiredRole) {
            setIsAuthorized(false);
            return;
          }
        } else if (isSignedIn) {
          const token = await getToken({ template: "p4l" });
          const decodedToken = token ? JSON.parse(atob(token.split('.')[1])) : null;
          const role = decodedToken?.role || "User";

          if (role !== requiredRole) {
            setIsAuthorized(false);
            return;
          }
        }
      }

      setIsAuthorized(true);
    };

    checkAuthorization();
  }, [isSignedIn, requiredRole, getToken]);

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthorized) {
    return <Navigate to={isSignedIn ? "/home" : "/login"} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserData } from '../simulationAPI';

const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuth, setIsAuth] = React.useState(false);

  React.useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsAuth(authenticated);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="spinner-large"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuth) {
    // Redirect to landing page if not authenticated
    return <Navigate to="/landing-page" replace />;
  }

  return children;
};

export default ProtectedRoute;
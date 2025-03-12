import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { authUtils } from '../utils/api';

// HOC to protect admin routes
export default function withAdminAuth(Component) {
  return function AdminProtectedRoute(props) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      // Check if user is admin
      if (!authUtils.isLoggedIn()) {
        router.push('/login');
        return;
      }

      if (!authUtils.isAdmin()) {
        router.push('/');
        return;
      }

      setIsAuthenticated(true);
      setLoading(false);
    }, [router]);

    // Show loading state
    if (loading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          backgroundColor: '#f5f5f5'
        }}>
          <p>Checking authorization...</p>
        </div>
      );
    }

    // Component will only render if user is admin
    return isAuthenticated ? <Component {...props} /> : null;
  };
}

// Usage example (in a separate file):
// import withAdminAuth from '../components/withAdminAuth';
// const AddProduct = () => { ... };
// export default withAdminAuth(AddProduct);
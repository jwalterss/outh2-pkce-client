import React from 'react';
import { OAuth2Provider, useAuth } from '../src';

// OAuth2 configuration
const oauthConfig = {
  clientId: 'your-client-id',
  authorizationEndpoint: 'https://auth.example.com/authorize',
  tokenEndpoint: 'https://auth.example.com/token',
  redirectUri: 'http://localhost:3000/callback',
  scope: 'openid profile email',
  debug: true,
};

// Main App component
export function App() {
  return (
    <OAuth2Provider 
      config={oauthConfig}
      loadingComponent={<LoadingScreen />}
      errorComponent={(error) => <ErrorScreen error={error} />}
    >
      <div style={styles.container}>
        <h1>OAuth2 PKCE React Example</h1>
        <AuthContent />
      </div>
    </OAuth2Provider>
  );
}

// Loading screen component
function LoadingScreen() {
  return (
    <div style={styles.loading}>
      <h2>Loading...</h2>
      <p>Checking authentication status</p>
    </div>
  );
}

// Error screen component
function ErrorScreen({ error }: { error: any }) {
  return (
    <div style={styles.error}>
      <h2>Authentication Error</h2>
      <p>{error.error_description || error.error}</p>
    </div>
  );
}

// Main authenticated content
function AuthContent() {
  const {
    isAuthenticated,
    isLoading,
    accessToken,
    expiresAt,
    scope,
    error,
    login,
    logout,
    refresh,
    getToken,
  } = useAuth();

  const handleApiCall = async () => {
    const token = getToken();
    if (!token) {
      alert('No access token available');
      return;
    }

    try {
      const response = await fetch('https://api.example.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log('API Response:', data);
      alert('API call successful! Check console for response.');
    } catch (error) {
      console.error('API Error:', error);
      alert('API call failed. Check console for details.');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div style={styles.errorMessage}>
        <p>Error: {error.error_description}</p>
        <button onClick={() => login()} style={styles.button}>
          Try Again
        </button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={styles.card}>
        <h2>Welcome</h2>
        <p>You are not logged in.</p>
        <button onClick={() => login()} style={styles.button}>
          Login with OAuth2
        </button>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <h2>Authenticated!</h2>
      
      <div style={styles.tokenInfo}>
        <h3>Token Information</h3>
        <p><strong>Access Token:</strong> {accessToken?.substring(0, 20)}...</p>
        <p><strong>Expires At:</strong> {expiresAt ? new Date(expiresAt).toLocaleString() : 'N/A'}</p>
        <p><strong>Scope:</strong> {scope || 'N/A'}</p>
      </div>

      <div style={styles.actions}>
        <button onClick={() => refresh()} style={styles.button}>
          Refresh Token
        </button>
        <button onClick={handleApiCall} style={styles.button}>
          Make API Call
        </button>
        <button onClick={() => logout()} style={{ ...styles.button, ...styles.logoutButton }}>
          Logout
        </button>
      </div>
    </div>
  );
}

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
    maxWidth: '800px',
    margin: '50px auto',
    padding: '20px',
  },
  card: {
    background: '#f5f5f5',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
  },
  error: {
    textAlign: 'center',
    padding: '50px',
    color: '#dc3545',
  },
  errorMessage: {
    padding: '20px',
    background: '#f8d7da',
    borderRadius: '4px',
    color: '#721c24',
  },
  button: {
    background: '#007bff',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    marginRight: '10px',
    marginTop: '10px',
  },
  logoutButton: {
    background: '#dc3545',
  },
  tokenInfo: {
    background: 'white',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
    fontFamily: 'monospace',
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
};

export default App;
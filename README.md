# OAuth2 PKCE Client

A secure, lightweight OAuth2 Authorization Code Flow with PKCE (Proof Key for Code Exchange) implementation for modern web applications.

## Features

- 🔐 **Secure by Default**: Implements OAuth2 Authorization Code Flow with PKCE
- 🚀 **Lightweight**: Zero runtime dependencies, < 10KB gzipped
- ⚛️ **React Support**: Built-in React hooks and context provider
- 🔄 **Auto Token Refresh**: Automatic token refresh before expiry
- 📦 **TypeScript**: Full TypeScript support with type definitions
- 🌳 **Tree-shakeable**: Import only what you need
- 🧪 **Well Tested**: Comprehensive test coverage
- 🎯 **Framework Agnostic**: Works with any JavaScript framework

## Installation

```bash
npm install oauth2-pkce-client
# or
yarn add oauth2-pkce-client
# or
pnpm add oauth2-pkce-client
```

## Quick Start

### Vanilla JavaScript

```javascript
import { OAuth2Service } from 'oauth2-pkce-client';

const oauth = new OAuth2Service({
  clientId: 'your-client-id',
  authorizationEndpoint: 'https://auth.example.com/authorize',
  tokenEndpoint: 'https://auth.example.com/token',
  redirectUri: 'http://localhost:3000/callback',
  scope: 'openid profile email',
});

// Start login
await oauth.authorize();

// Handle callback (automatically called on redirect URI)
// Tokens are automatically stored

// Check authentication
if (oauth.isAuthenticated()) {
  const token = oauth.getAccessToken();
  // Use token for API calls
}

// Logout
oauth.logout();
```

### React

```jsx
import { OAuth2Provider, useAuth } from 'oauth2-pkce-client';

// Wrap your app with OAuth2Provider
function App() {
  const config = {
    clientId: 'your-client-id',
    authorizationEndpoint: 'https://auth.example.com/authorize',
    tokenEndpoint: 'https://auth.example.com/token',
    redirectUri: 'http://localhost:3000/callback',
    scope: 'openid profile email',
  };

  return (
    <OAuth2Provider config={config}>
      <YourApp />
    </OAuth2Provider>
  );
}

// Use the auth hook in components
function LoginButton() {
  const { isAuthenticated, login, logout, getToken } = useAuth();

  if (isAuthenticated) {
    return <button onClick={() => logout()}>Logout</button>;
  }

  return <button onClick={() => login()}>Login</button>;
}
```

## API Reference

### OAuth2Service

The main class for handling OAuth2 authentication.

#### Constructor

```typescript
new OAuth2Service(config: OAuth2Config)
```

#### Configuration Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `clientId` | string | ✅ | OAuth2 client ID |
| `authorizationEndpoint` | string | ✅ | Authorization server's authorize endpoint |
| `tokenEndpoint` | string | ✅ | Authorization server's token endpoint |
| `redirectUri` | string | ✅ | Redirect URI registered with OAuth2 provider |
| `scope` | string | ❌ | Space-delimited list of scopes |
| `logoutEndpoint` | string | ❌ | Optional logout endpoint |
| `autoRefresh` | boolean | ❌ | Enable automatic token refresh (default: true) |
| `refreshBufferTime` | number | ❌ | Seconds before expiry to refresh (default: 300) |
| `storage` | Storage | ❌ | Custom storage implementation (default: localStorage) |
| `debug` | boolean | ❌ | Enable debug logging |

#### Methods

- `authorize(additionalParams?)`: Start the authorization flow
- `handleCallback(url?)`: Handle OAuth2 callback (called automatically)
- `refreshAccessToken()`: Manually refresh the access token
- `getAccessToken()`: Get current access token
- `getRefreshToken()`: Get current refresh token
- `getIdToken()`: Get ID token (if available)
- `isAuthenticated()`: Check if user is authenticated
- `getAuthState()`: Get complete authentication state
- `logout(redirectTo?)`: Logout user

### React Hooks

#### useOAuth2

```typescript
const {
  isAuthenticated,
  isLoading,
  accessToken,
  refreshToken,
  error,
  login,
  logout,
  refreshToken,
  getToken,
} = useOAuth2(config);
```

#### useAuth

Must be used within `OAuth2Provider`:

```typescript
const auth = useAuth();
```

## Advanced Usage

### Custom Storage

```javascript
import { OAuth2Service } from 'oauth2-pkce-client';

const oauth = new OAuth2Service({
  // ... other config
  storage: sessionStorage, // Use sessionStorage instead of localStorage
});
```

### Additional Authorization Parameters

```javascript
// Pass additional parameters to the authorization request
await oauth.authorize({
  prompt: 'consent',
  login_hint: 'user@example.com',
});
```

### Token Refresh Callbacks

```javascript
const oauth = new OAuth2Service({
  // ... other config
  onTokenRefresh: (tokens) => {
    console.log('Tokens refreshed:', tokens);
  },
  onAuthStateChange: (isAuthenticated) => {
    console.log('Auth state changed:', isAuthenticated);
  },
});
```

## Security Considerations

This library implements several security best practices:

1. **PKCE** (RFC 7636): Protects against authorization code interception attacks
2. **State Parameter**: Prevents CSRF attacks
3. **Secure Token Storage**: Tokens stored in configurable storage (localStorage/sessionStorage)
4. **Automatic Token Expiry**: Tokens are automatically cleared when expired
5. **XSS Protection**: No tokens in URLs or global scope

## Browser Support

- Chrome/Edge 91+
- Firefox 89+
- Safari 15+
- Opera 77+

Requires native Crypto API support for PKCE.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT © Jeremy Walters

## Links

- [GitHub Repository](https://github.com/yourorg/oauth2-pkce-client)
- [npm Package](https://www.npmjs.com/package/oauth2-pkce-client)
- [Report Issues](https://github.com/yourorg/oauth2-pkce-client/issues)
- [OAuth 2.0 RFC](https://tools.ietf.org/html/rfc6749)
- [PKCE RFC](https://tools.ietf.org/html/rfc7636)
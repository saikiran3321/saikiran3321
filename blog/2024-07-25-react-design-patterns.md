---
slug: react-design-patterns
title: Essential React Design Patterns for Modern Development
authors: [saikiran]
tags: [react, design-patterns, architecture, best-practices]
---

Design patterns in React help developers write more maintainable, reusable, and scalable code. As React applications grow in complexity, understanding and applying the right patterns becomes crucial for long-term success. This comprehensive guide explores the most important React design patterns with practical examples and real-world applications.

<!-- truncate -->

## Why Design Patterns Matter in React

Design patterns provide proven solutions to common problems in software development. In React, they help us:

- **Organize code better** - Clear separation of concerns
- **Improve reusability** - Components that can be used across different contexts
- **Enhance maintainability** - Easier to understand and modify code
- **Optimize performance** - Patterns that prevent unnecessary re-renders
- **Scale applications** - Architectural patterns that grow with your app

Let's explore the most important patterns every React developer should know.

## Container and Presentational Components

This foundational pattern separates data logic from presentation logic, making components more focused and testable.

### The Problem

Without this pattern, components often mix data fetching, state management, and UI rendering:

```jsx
// ❌ Mixed concerns - hard to test and reuse
function UserDashboard({ userId }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const [userResponse, postsResponse] = await Promise.all([
          fetch(`/api/users/${userId}`),
          fetch(`/api/users/${userId}/posts`)
        ]);
        
        const userData = await userResponse.json();
        const postsData = await postsResponse.json();
        
        setUser(userData);
        setPosts(postsData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    
    fetchData();
  }, [userId]);
  
  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  
  return (
    <div className="dashboard">
      <div className="user-info">
        <img src={user.avatar} alt={user.name} />
        <h1>{user.name}</h1>
        <p>{user.email}</p>
      </div>
      
      <div className="posts">
        <h2>Recent Posts</h2>
        {posts.map(post => (
          <div key={post.id} className="post">
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### The Solution

Separate concerns into container (logic) and presentational (UI) components:

```jsx
// ✅ Presentational Component - Pure UI
function UserDashboard({ user, posts, loading, error, onRefresh }) {
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} onRetry={onRefresh} />;
  
  return (
    <div className="dashboard">
      <UserProfile user={user} />
      <PostsList posts={posts} />
    </div>
  );
}

function UserProfile({ user }) {
  return (
    <div className="user-info">
      <img src={user.avatar} alt={user.name} />
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <p className="bio">{user.bio}</p>
    </div>
  );
}

function PostsList({ posts }) {
  return (
    <div className="posts">
      <h2>Recent Posts ({posts.length})</h2>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

// ✅ Container Component - Data Logic
function UserDashboardContainer({ userId }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [userResponse, postsResponse] = await Promise.all([
        fetch(`/api/users/${userId}`),
        fetch(`/api/users/${userId}/posts`)
      ]);
      
      if (!userResponse.ok || !postsResponse.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const userData = await userResponse.json();
      const postsData = await postsResponse.json();
      
      setUser(userData);
      setPosts(postsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return (
    <UserDashboard
      user={user}
      posts={posts}
      loading={loading}
      error={error}
      onRefresh={fetchData}
    />
  );
}
```

### Benefits

- **Easier testing** - Presentational components can be tested with simple props
- **Better reusability** - UI components can be used with different data sources
- **Clearer separation** - Logic and presentation are clearly separated
- **Improved performance** - Presentational components can be memoized easily

## Compound Components Pattern

This pattern allows components to work together while maintaining a clean and flexible API.

### Building a Flexible Tabs Component

```jsx
// ✅ Compound Components Implementation
const TabsContext = createContext();

function Tabs({ children, defaultTab = 0, onChange }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  const handleTabChange = useCallback((index) => {
    setActiveTab(index);
    onChange?.(index);
  }, [onChange]);
  
  const contextValue = useMemo(() => ({
    activeTab,
    setActiveTab: handleTabChange
  }), [activeTab, handleTabChange]);
  
  return (
    <TabsContext.Provider value={contextValue}>
      <div className="tabs">
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabList({ children }) {
  return (
    <div className="tab-list" role="tablist">
      {React.Children.map(children, (child, index) => {
        return React.cloneElement(child, { index });
      })}
    </div>
  );
}

function Tab({ children, index, disabled = false }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === index;
  
  const handleClick = () => {
    if (!disabled) {
      setActiveTab(index);
    }
  };
  
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };
  
  return (
    <button
      className={`tab ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
    >
      {children}
    </button>
  );
}

function TabPanels({ children }) {
  const { activeTab } = useContext(TabsContext);
  
  return (
    <div className="tab-panels">
      {React.Children.toArray(children)[activeTab]}
    </div>
  );
}

function TabPanel({ children }) {
  return (
    <div className="tab-panel" role="tabpanel">
      {children}
    </div>
  );
}

// Compound the components
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panels = TabPanels;
Tabs.Panel = TabPanel;

// ✅ Usage - Clean and Flexible API
function UserSettings() {
  const handleTabChange = (index) => {
    console.log(`Switched to tab ${index}`);
  };
  
  return (
    <Tabs defaultTab={0} onChange={handleTabChange}>
      <Tabs.List>
        <Tabs.Tab>Profile</Tabs.Tab>
        <Tabs.Tab>Security</Tabs.Tab>
        <Tabs.Tab>Notifications</Tabs.Tab>
        <Tabs.Tab disabled>Billing</Tabs.Tab>
      </Tabs.List>
      
      <Tabs.Panels>
        <Tabs.Panel>
          <ProfileSettings />
        </Tabs.Panel>
        <Tabs.Panel>
          <SecuritySettings />
        </Tabs.Panel>
        <Tabs.Panel>
          <NotificationSettings />
        </Tabs.Panel>
        <Tabs.Panel>
          <BillingSettings />
        </Tabs.Panel>
      </Tabs.Panels>
    </Tabs>
  );
}
```

## Custom Hooks: The Modern Way to Share Logic

Custom hooks have largely replaced Higher-Order Components and Render Props for sharing stateful logic.

### Building Reusable Custom Hooks

```jsx
// ✅ Custom Hook for API Calls
function useApi(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url, options]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);
  
  return { data, loading, error, refetch };
}

// ✅ Custom Hook for Form Management
function useForm(initialValues, validationRules = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);
  
  const setFieldTouched = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);
  
  const validate = useCallback(() => {
    const newErrors = {};
    
    Object.keys(validationRules).forEach(field => {
      const rules = validationRules[field];
      const value = values[field];
      
      if (rules.required && (!value || value.trim() === '')) {
        newErrors[field] = `${field} is required`;
        return;
      }
      
      if (rules.minLength && value && value.length < rules.minLength) {
        newErrors[field] = `${field} must be at least ${rules.minLength} characters`;
        return;
      }
      
      if (rules.pattern && value && !rules.pattern.test(value)) {
        newErrors[field] = rules.message || `${field} format is invalid`;
        return;
      }
      
      if (rules.custom && value) {
        const customError = rules.custom(value, values);
        if (customError) {
          newErrors[field] = customError;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationRules]);
  
  const handleSubmit = useCallback((onSubmit) => {
    return (event) => {
      event.preventDefault();
      
      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      setTouched(allTouched);
      
      if (validate()) {
        onSubmit(values);
      }
    };
  }, [values, validate]);
  
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);
  
  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validate,
    handleSubmit,
    reset,
    isValid: Object.keys(errors).length === 0
  };
}

// ✅ Usage of Custom Hooks
function UserRegistrationForm() {
  const {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    handleSubmit,
    reset,
    isValid
  } = useForm(
    {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    {
      name: { required: true, minLength: 2 },
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
      },
      password: { required: true, minLength: 8 },
      confirmPassword: {
        required: true,
        custom: (value, allValues) => {
          return value !== allValues.password ? 'Passwords do not match' : null;
        }
      }
    }
  );
  
  const { data: submitResult, loading: submitting, error: submitError } = useApi(
    '/api/register',
    {
      method: 'POST',
      body: JSON.stringify(values)
    }
  );
  
  const onSubmit = async (formData) => {
    try {
      // Handle successful registration
      console.log('Registration successful:', formData);
      reset();
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="registration-form">
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={values.name}
          onChange={(e) => setValue('name', e.target.value)}
          onBlur={() => setFieldTouched('name')}
          className={errors.name && touched.name ? 'error' : ''}
        />
        {errors.name && touched.name && (
          <span className="error-message">{errors.name}</span>
        )}
      </div>
      
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={values.email}
          onChange={(e) => setValue('email', e.target.value)}
          onBlur={() => setFieldTouched('email')}
          className={errors.email && touched.email ? 'error' : ''}
        />
        {errors.email && touched.email && (
          <span className="error-message">{errors.email}</span>
        )}
      </div>
      
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={values.password}
          onChange={(e) => setValue('password', e.target.value)}
          onBlur={() => setFieldTouched('password')}
          className={errors.password && touched.password ? 'error' : ''}
        />
        {errors.password && touched.password && (
          <span className="error-message">{errors.password}</span>
        )}
      </div>
      
      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          value={values.confirmPassword}
          onChange={(e) => setValue('confirmPassword', e.target.value)}
          onBlur={() => setFieldTouched('confirmPassword')}
          className={errors.confirmPassword && touched.confirmPassword ? 'error' : ''}
        />
        {errors.confirmPassword && touched.confirmPassword && (
          <span className="error-message">{errors.confirmPassword}</span>
        )}
      </div>
      
      {submitError && (
        <div className="error-message">{submitError}</div>
      )}
      
      <button
        type="submit"
        disabled={!isValid || submitting}
        className="submit-button"
      >
        {submitting ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
```

## State Management Patterns

### Context + Reducer Pattern for Global State

```jsx
// ✅ Global State Management with Context + Reducer
const AppContext = createContext();

// Action types
const ActionTypes = {
  SET_USER: 'SET_USER',
  SET_THEME: 'SET_THEME',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_LOADING: 'SET_LOADING'
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload
      };
      
    case ActionTypes.SET_THEME:
      return {
        ...state,
        theme: action.payload
      };
      
    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: Date.now(),
            ...action.payload
          }
        ]
      };
      
    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        )
      };
      
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value
        }
      };
      
    default:
      return state;
  }
}

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  theme: 'light',
  notifications: [],
  loading: {}
};

// Provider component
function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Action creators
  const actions = useMemo(() => ({
    setUser: (user) => dispatch({ type: ActionTypes.SET_USER, payload: user }),
    
    setTheme: (theme) => dispatch({ type: ActionTypes.SET_THEME, payload: theme }),
    
    addNotification: (notification) => dispatch({
      type: ActionTypes.ADD_NOTIFICATION,
      payload: notification
    }),
    
    removeNotification: (id) => dispatch({
      type: ActionTypes.REMOVE_NOTIFICATION,
      payload: id
    }),
    
    setLoading: (key, value) => dispatch({
      type: ActionTypes.SET_LOADING,
      payload: { key, value }
    }),
    
    // Complex actions
    login: async (credentials) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: { key: 'auth', value: true } });
      
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        });
        
        if (response.ok) {
          const user = await response.json();
          dispatch({ type: ActionTypes.SET_USER, payload: user });
          dispatch({
            type: ActionTypes.ADD_NOTIFICATION,
            payload: { type: 'success', message: 'Login successful!' }
          });
          return { success: true };
        } else {
          throw new Error('Login failed');
        }
      } catch (error) {
        dispatch({
          type: ActionTypes.ADD_NOTIFICATION,
          payload: { type: 'error', message: error.message }
        });
        return { success: false, error: error.message };
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: { key: 'auth', value: false } });
      }
    },
    
    logout: () => {
      dispatch({ type: ActionTypes.SET_USER, payload: null });
      dispatch({
        type: ActionTypes.ADD_NOTIFICATION,
        payload: { type: 'info', message: 'Logged out successfully' }
      });
    }
  }), []);
  
  const contextValue = useMemo(() => ({
    state,
    actions
  }), [state, actions]);
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use app context
function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

// Usage in components
function Header() {
  const { state, actions } = useApp();
  
  return (
    <header className={`header ${state.theme}`}>
      <h1>My App</h1>
      
      {state.isAuthenticated ? (
        <div className="user-menu">
          <span>Welcome, {state.user.name}!</span>
          <button onClick={actions.logout}>Logout</button>
        </div>
      ) : (
        <LoginButton />
      )}
      
      <button
        onClick={() => actions.setTheme(state.theme === 'light' ? 'dark' : 'light')}
        className="theme-toggle"
      >
        {state.theme === 'light' ? '🌙' : '☀️'}
      </button>
    </header>
  );
}

function NotificationCenter() {
  const { state, actions } = useApp();
  
  return (
    <div className="notification-center">
      {state.notifications.map(notification => (
        <div
          key={notification.id}
          className={`notification ${notification.type}`}
        >
          <span>{notification.message}</span>
          <button onClick={() => actions.removeNotification(notification.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Performance Optimization Patterns

### Memoization and Optimization Strategies

```jsx
// ✅ Optimized Component with Multiple Memoization Techniques
const ProductList = memo(function ProductList({
  products,
  onProductSelect,
  onAddToCart,
  filters,
  sortBy
}) {
  // Memoize expensive filtering and sorting
  const filteredAndSortedProducts = useMemo(() => {
    console.log('Filtering and sorting products...');
    
    let filtered = products.filter(product => {
      if (filters.category && product.category !== filters.category) {
        return false;
      }
      if (filters.minPrice && product.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice && product.price > filters.maxPrice) {
        return false;
      }
      if (filters.inStock && !product.inStock) {
        return false;
      }
      return true;
    });
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });
  }, [products, filters, sortBy]);
  
  // Memoize callbacks to prevent child re-renders
  const handleProductSelect = useCallback((product) => {
    onProductSelect(product);
  }, [onProductSelect]);
  
  const handleAddToCart = useCallback((product, quantity = 1) => {
    onAddToCart(product, quantity);
  }, [onAddToCart]);
  
  return (
    <div className="product-list">
      <div className="product-count">
        {filteredAndSortedProducts.length} products found
      </div>
      
      <div className="products-grid">
        {filteredAndSortedProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onSelect={handleProductSelect}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    </div>
  );
});

// ✅ Optimized Product Card Component
const ProductCard = memo(function ProductCard({
  product,
  onSelect,
  onAddToCart
}) {
  const [quantity, setQuantity] = useState(1);
  
  // Memoize formatted price to avoid recalculation
  const formattedPrice = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(product.price);
  }, [product.price]);
  
  // Memoize discount calculation
  const discountInfo = useMemo(() => {
    if (!product.originalPrice || product.originalPrice <= product.price) {
      return null;
    }
    
    const discountAmount = product.originalPrice - product.price;
    const discountPercentage = Math.round((discountAmount / product.originalPrice) * 100);
    
    return {
      amount: discountAmount,
      percentage: discountPercentage,
      originalPrice: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(product.originalPrice)
    };
  }, [product.price, product.originalPrice]);
  
  const handleAddToCart = useCallback(() => {
    onAddToCart(product, quantity);
    setQuantity(1); // Reset quantity after adding
  }, [onAddToCart, product, quantity]);
  
  const handleSelect = useCallback(() => {
    onSelect(product);
  }, [onSelect, product]);
  
  return (
    <div className="product-card" onClick={handleSelect}>
      <div className="product-image">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy" // Native lazy loading
        />
        {discountInfo && (
          <div className="discount-badge">
            -{discountInfo.percentage}%
          </div>
        )}
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <div className="product-rating">
          <StarRating rating={product.rating} />
          <span>({product.reviewCount})</span>
        </div>
        
        <div className="product-price">
          <span className="current-price">{formattedPrice}</span>
          {discountInfo && (
            <span className="original-price">{discountInfo.originalPrice}</span>
          )}
        </div>
        
        <div className="product-actions" onClick={(e) => e.stopPropagation()}>
          <div className="quantity-selector">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              -
            </button>
            <span>{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              disabled={quantity >= product.maxQuantity}
            >
              +
            </button>
          </div>
          
          <button
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={!product.inStock}
          >
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for more control
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.product.price === nextProps.product.price &&
    prevProps.product.inStock === nextProps.product.inStock &&
    prevProps.onSelect === nextProps.onSelect &&
    prevProps.onAddToCart === nextProps.onAddToCart
  );
});
```

## Error Handling Patterns

### Comprehensive Error Boundary Implementation

```jsx
// ✅ Advanced Error Boundary with Recovery Options
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
    
    // Log to error reporting service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Example: Log to Sentry
    // const eventId = Sentry.captureException(error, {
    //   contexts: { react: { componentStack: errorInfo.componentStack } }
    // });
    // this.setState({ eventId });
  }
  
  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    });
  };
  
  render() {
    if (this.state.hasError) {
      const { fallback: Fallback, showDetails = false } = this.props;
      
      if (Fallback) {
        return (
          <Fallback
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            onRetry={this.handleRetry}
          />
        );
      }
      
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>Oops! Something went wrong</h2>
            <p>We're sorry for the inconvenience. Please try refreshing the page.</p>
            
            <div className="error-actions">
              <button onClick={this.handleRetry} className="retry-button">
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="refresh-button"
              >
                Refresh Page
              </button>
            </div>
            
            {showDetails && this.state.error && (
              <details className="error-details">
                <summary>Error Details</summary>
                <pre>{this.state.error.toString()}</pre>
                <pre>{this.state.errorInfo.componentStack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// ✅ Custom Error Fallback Components
function ProductListErrorFallback({ error, onRetry }) {
  return (
    <div className="product-list-error">
      <div className="error-icon">⚠️</div>
      <h3>Unable to load products</h3>
      <p>There was a problem loading the product list. This might be due to a network issue.</p>
      <button onClick={onRetry} className="retry-button">
        Try Again
      </button>
    </div>
  );
}

function UserProfileErrorFallback({ error, onRetry }) {
  return (
    <div className="user-profile-error">
      <div className="error-icon">👤</div>
      <h3>Profile Unavailable</h3>
      <p>We couldn't load your profile information right now.</p>
      <div className="error-actions">
        <button onClick={onRetry}>Retry</button>
        <button onClick={() => window.location.href = '/dashboard'}>
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

// ✅ Usage with Specific Error Boundaries
function App() {
  return (
    <div className="app">
      <ErrorBoundary>
        <Header />
      </ErrorBoundary>
      
      <main>
        <ErrorBoundary fallback={ProductListErrorFallback}>
          <ProductList />
        </ErrorBoundary>
        
        <ErrorBoundary fallback={UserProfileErrorFallback}>
          <UserProfile />
        </ErrorBoundary>
      </main>
      
      <ErrorBoundary>
        <Footer />
      </ErrorBoundary>
    </div>
  );
}
```

## Conclusion

React design patterns are essential tools for building maintainable, scalable applications. Here are the key takeaways:

### Pattern Selection Guidelines

- **Container/Presentational**: Use for separating data logic from UI
- **Compound Components**: Perfect for flexible, composable UI components
- **Custom Hooks**: The modern way to share stateful logic
- **Context + Reducer**: Ideal for complex global state management
- **Memoization**: Essential for performance optimization
- **Error Boundaries**: Critical for graceful error handling

### Best Practices

1. **Start Simple**: Don't over-engineer early; add patterns as complexity grows
2. **Consistency**: Choose patterns and stick with them across your application
3. **Performance**: Always consider the performance implications of your patterns
4. **Testing**: Ensure your patterns make components easier to test
5. **Team Alignment**: Make sure your team understands and follows the chosen patterns

### Future Considerations

As React continues to evolve, new patterns emerge while others become obsolete. Stay updated with:

- **React Server Components**: New patterns for server-side rendering
- **Concurrent Features**: Patterns for Suspense and concurrent rendering
- **State Management Evolution**: New approaches to state management
- **Performance Optimizations**: Emerging patterns for better performance

By mastering these design patterns, you'll be well-equipped to build robust, maintainable React applications that can scale with your project's needs. Remember, the best pattern is the one that solves your specific problem while keeping your code clean and understandable.
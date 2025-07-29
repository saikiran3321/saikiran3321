---
sidebar_position: 5
---

# React Design Patterns

Design patterns in React help you write more maintainable, reusable, and scalable code. This section covers the most important patterns used in modern React development, with examples for both class and functional components.

## Component Composition Patterns

### Container and Presentational Components

This pattern separates data logic from presentation logic.

```jsx
// Presentational Component (Functional)
function UserList({ users, onUserSelect, loading, error }) {
  if (loading) return <div className="loading">Loading users...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  
  return (
    <div className="user-list">
      <h2>Users</h2>
      <ul>
        {users.map(user => (
          <li key={user.id} onClick={() => onUserSelect(user)}>
            <div className="user-item">
              <img src={user.avatar} alt={user.name} />
              <div>
                <h3>{user.name}</h3>
                <p>{user.email}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Container Component (Functional with hooks)
function UserListContainer() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      const userData = await response.json();
      setUsers(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    // Additional logic like navigation, analytics, etc.
  };
  
  return (
    <div>
      <UserList
        users={users}
        onUserSelect={handleUserSelect}
        loading={loading}
        error={error}
      />
      {selectedUser && (
        <UserDetails user={selectedUser} />
      )}
    </div>
  );
}

// Container Component (Class version)
class UserListContainerClass extends React.Component {
  state = {
    users: [],
    loading: true,
    error: null,
    selectedUser: null
  };
  
  componentDidMount() {
    this.fetchUsers();
  }
  
  fetchUsers = async () => {
    try {
      this.setState({ loading: true });
      const response = await fetch('/api/users');
      const users = await response.json();
      this.setState({ users, loading: false });
    } catch (error) {
      this.setState({ error: error.message, loading: false });
    }
  };
  
  handleUserSelect = (user) => {
    this.setState({ selectedUser: user });
  };
  
  render() {
    const { users, loading, error, selectedUser } = this.state;
    
    return (
      <div>
        <UserList
          users={users}
          onUserSelect={this.handleUserSelect}
          loading={loading}
          error={error}
        />
        {selectedUser && <UserDetails user={selectedUser} />}
      </div>
    );
  }
}
```

### Compound Components

This pattern allows components to work together while maintaining a clean API.

```jsx
// Compound Component Implementation
const Tabs = ({ children, defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  return (
    <div className="tabs">
      {React.Children.map(children, (child, index) => {
        return React.cloneElement(child, {
          activeTab,
          setActiveTab,
          index
        });
      })}
    </div>
  );
};

const TabList = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="tab-list">
      {React.Children.map(children, (child, index) => {
        return React.cloneElement(child, {
          isActive: activeTab === index,
          onClick: () => setActiveTab(index),
          index
        });
      })}
    </div>
  );
};

const Tab = ({ children, isActive, onClick }) => {
  return (
    <button
      className={`tab ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const TabPanels = ({ children, activeTab }) => {
  return (
    <div className="tab-panels">
      {React.Children.toArray(children)[activeTab]}
    </div>
  );
};

const TabPanel = ({ children }) => {
  return <div className="tab-panel">{children}</div>;
};

// Compound the components
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panels = TabPanels;
Tabs.Panel = TabPanel;

// Usage
function App() {
  return (
    <Tabs defaultTab={0}>
      <Tabs.List>
        <Tabs.Tab>Profile</Tabs.Tab>
        <Tabs.Tab>Settings</Tabs.Tab>
        <Tabs.Tab>Billing</Tabs.Tab>
      </Tabs.List>
      
      <Tabs.Panels>
        <Tabs.Panel>
          <h2>Profile Content</h2>
          <p>User profile information...</p>
        </Tabs.Panel>
        <Tabs.Panel>
          <h2>Settings Content</h2>
          <p>Application settings...</p>
        </Tabs.Panel>
        <Tabs.Panel>
          <h2>Billing Content</h2>
          <p>Billing information...</p>
        </Tabs.Panel>
      </Tabs.Panels>
    </Tabs>
  );
}
```

## Higher-Order Components (HOCs)

HOCs are functions that take a component and return a new component with additional functionality.

### Authentication HOC

```jsx
// HOC for authentication
function withAuth(WrappedComponent) {
  return function AuthenticatedComponent(props) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
      checkAuthStatus();
    }, []);
    
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (loading) {
      return <div>Checking authentication...</div>;
    }
    
    if (!user) {
      return <LoginForm onLogin={setUser} />;
    }
    
    return <WrappedComponent {...props} user={user} />;
  };
}

// Class-based HOC version
function withAuthClass(WrappedComponent) {
  return class extends React.Component {
    state = { user: null, loading: true };
    
    async componentDidMount() {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const user = await response.json();
          this.setState({ user, loading: false });
        } else {
          this.setState({ loading: false });
        }
      } catch (error) {
        this.setState({ loading: false });
      }
    }
    
    render() {
      const { user, loading } = this.state;
      
      if (loading) return <div>Checking authentication...</div>;
      if (!user) return <LoginForm onLogin={(user) => this.setState({ user })} />;
      
      return <WrappedComponent {...this.props} user={user} />;
    }
  };
}

// Usage
const ProtectedDashboard = withAuth(Dashboard);
const ProtectedProfile = withAuth(UserProfile);
```

### Loading HOC

```jsx
// HOC for loading states
function withLoading(WrappedComponent) {
  return function LoadingComponent({ isLoading, loadingMessage = 'Loading...', ...props }) {
    if (isLoading) {
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{loadingMessage}</p>
        </div>
      );
    }
    
    return <WrappedComponent {...props} />;
  };
}

// Usage
const UserListWithLoading = withLoading(UserList);

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  return (
    <UserListWithLoading
      users={users}
      isLoading={loading}
      loadingMessage="Fetching users..."
    />
  );
}
```

## Render Props Pattern

The render props pattern uses a prop whose value is a function to share code between components.

### Data Fetcher with Render Props

```jsx
// Render Props Component (Functional)
function DataFetcher({ url, children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchData();
  }, [url]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return children({ data, loading, error, refetch: fetchData });
}

// Class-based version
class DataFetcherClass extends React.Component {
  state = { data: null, loading: true, error: null };
  
  componentDidMount() {
    this.fetchData();
  }
  
  componentDidUpdate(prevProps) {
    if (prevProps.url !== this.props.url) {
      this.fetchData();
    }
  }
  
  fetchData = async () => {
    try {
      this.setState({ loading: true, error: null });
      const response = await fetch(this.props.url);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      this.setState({ data, loading: false });
    } catch (error) {
      this.setState({ error: error.message, loading: false });
    }
  };
  
  render() {
    return this.props.children({
      ...this.state,
      refetch: this.fetchData
    });
  }
}

// Usage
function UserProfile({ userId }) {
  return (
    <DataFetcher url={`/api/users/${userId}`}>
      {({ data: user, loading, error, refetch }) => {
        if (loading) return <div>Loading user...</div>;
        if (error) return <div>Error: {error}</div>;
        
        return (
          <div>
            <h1>{user.name}</h1>
            <p>{user.email}</p>
            <button onClick={refetch}>Refresh</button>
          </div>
        );
      }}
    </DataFetcher>
  );
}

function PostsList() {
  return (
    <DataFetcher url="/api/posts">
      {({ data: posts, loading, error }) => {
        if (loading) return <div>Loading posts...</div>;
        if (error) return <div>Error: {error}</div>;
        
        return (
          <ul>
            {posts.map(post => (
              <li key={post.id}>{post.title}</li>
            ))}
          </ul>
        );
      }}
    </DataFetcher>
  );
}
```

### Mouse Tracker with Render Props

```jsx
// Mouse position tracker
function MouseTracker({ children }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (event) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return children(position);
}

// Usage
function App() {
  return (
    <div>
      <h1>Move your mouse around!</h1>
      <MouseTracker>
        {({ x, y }) => (
          <div>
            <p>Mouse position: ({x}, {y})</p>
            <div
              style={{
                position: 'absolute',
                left: x - 10,
                top: y - 10,
                width: 20,
                height: 20,
                backgroundColor: 'red',
                borderRadius: '50%',
                pointerEvents: 'none'
              }}
            />
          </div>
        )}
      </MouseTracker>
    </div>
  );
}
```

## Custom Hooks (Modern Alternative to HOCs and Render Props)

Custom hooks provide a more elegant solution for sharing stateful logic.

### useAuth Hook

```jsx
// Custom hook for authentication
function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message };
      }
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };
  
  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  };
}

// Usage
function Dashboard() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <LoginForm />;
  
  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### useApi Hook

```jsx
// Custom hook for API calls
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
  
  const refetch = () => {
    fetchData();
  };
  
  return { data, loading, error, refetch };
}

// Usage
function UserProfile({ userId }) {
  const { data: user, loading, error, refetch } = useApi(`/api/users/${userId}`);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

## State Management Patterns

### Reducer Pattern

```jsx
// Reducer for complex state management
function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [
          ...state.todos,
          {
            id: Date.now(),
            text: action.payload.text,
            completed: false,
            createdAt: new Date()
          }
        ]
      };
      
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      };
      
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload.id)
      };
      
    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload.filter
      };
      
    case 'CLEAR_COMPLETED':
      return {
        ...state,
        todos: state.todos.filter(todo => !todo.completed)
      };
      
    default:
      return state;
  }
}

// Todo application with useReducer
function TodoApp() {
  const [state, dispatch] = useReducer(todoReducer, {
    todos: [],
    filter: 'all'
  });
  
  const [inputValue, setInputValue] = useState('');
  
  const addTodo = () => {
    if (inputValue.trim()) {
      dispatch({
        type: 'ADD_TODO',
        payload: { text: inputValue }
      });
      setInputValue('');
    }
  };
  
  const filteredTodos = state.todos.filter(todo => {
    switch (state.filter) {
      case 'active':
        return !todo.completed;
      case 'completed':
        return todo.completed;
      default:
        return true;
    }
  });
  
  return (
    <div className="todo-app">
      <div className="todo-input">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add new todo"
        />
        <button onClick={addTodo}>Add</button>
      </div>
      
      <div className="todo-filters">
        {['all', 'active', 'completed'].map(filter => (
          <button
            key={filter}
            className={state.filter === filter ? 'active' : ''}
            onClick={() => dispatch({ type: 'SET_FILTER', payload: { filter } })}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>
      
      <ul className="todo-list">
        {filteredTodos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => dispatch({
                type: 'TOGGLE_TODO',
                payload: { id: todo.id }
              })}
            />
            <span>{todo.text}</span>
            <button
              onClick={() => dispatch({
                type: 'DELETE_TODO',
                payload: { id: todo.id }
              })}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      
      {state.todos.some(todo => todo.completed) && (
        <button
          className="clear-completed"
          onClick={() => dispatch({ type: 'CLEAR_COMPLETED' })}
        >
          Clear Completed
        </button>
      )}
    </div>
  );
}
```

### Context + Reducer Pattern

```jsx
// Global state management with Context + Reducer
const AppContext = createContext();

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    default:
      return state;
  }
}

function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, {
    user: null,
    theme: 'light',
    notifications: []
  });
  
  const actions = {
    setUser: (user) => dispatch({ type: 'SET_USER', payload: user }),
    setTheme: (theme) => dispatch({ type: 'SET_THEME', payload: theme }),
    addNotification: (notification) => dispatch({
      type: 'ADD_NOTIFICATION',
      payload: { ...notification, id: Date.now() }
    }),
    removeNotification: (id) => dispatch({
      type: 'REMOVE_NOTIFICATION',
      payload: id
    })
  };
  
  return (
    <AppContext.Provider value={{ state, actions }}>
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

// Usage
function Header() {
  const { state, actions } = useApp();
  
  return (
    <header className={`header ${state.theme}`}>
      <h1>My App</h1>
      {state.user && <span>Welcome, {state.user.name}!</span>}
      <button onClick={() => actions.setTheme(state.theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </header>
  );
}
```

## Performance Optimization Patterns

### Memoization Patterns

```jsx
// Expensive component with memoization
const ExpensiveList = React.memo(function ExpensiveList({ items, onItemClick }) {
  console.log('ExpensiveList rendered');
  
  const expensiveCalculation = useMemo(() => {
    console.log('Performing expensive calculation');
    return items.reduce((sum, item) => sum + item.value, 0);
  }, [items]);
  
  return (
    <div>
      <p>Total: {expensiveCalculation}</p>
      <ul>
        {items.map(item => (
          <li key={item.id} onClick={() => onItemClick(item)}>
            {item.name} - {item.value}
          </li>
        ))}
      </ul>
    </div>
  );
});

function App() {
  const [items, setItems] = useState([
    { id: 1, name: 'Item 1', value: 10 },
    { id: 2, name: 'Item 2', value: 20 }
  ]);
  const [count, setCount] = useState(0);
  
  // Memoized callback to prevent unnecessary re-renders
  const handleItemClick = useCallback((item) => {
    console.log('Item clicked:', item);
  }, []);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment Count
      </button>
      
      {/* This component will only re-render when items change */}
      <ExpensiveList items={items} onItemClick={handleItemClick} />
    </div>
  );
}
```

### Lazy Loading Pattern

```jsx
// Lazy loading with Suspense
const LazyDashboard = lazy(() => import('./Dashboard'));
const LazyProfile = lazy(() => import('./Profile'));
const LazySettings = lazy(() => import('./Settings'));

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <LazyDashboard />;
      case 'profile':
        return <LazyProfile />;
      case 'settings':
        return <LazySettings />;
      default:
        return <div>Page not found</div>;
    }
  };
  
  return (
    <div>
      <nav>
        <button onClick={() => setCurrentView('dashboard')}>Dashboard</button>
        <button onClick={() => setCurrentView('profile')}>Profile</button>
        <button onClick={() => setCurrentView('settings')}>Settings</button>
      </nav>
      
      <main>
        <Suspense fallback={<div>Loading...</div>}>
          {renderView()}
        </Suspense>
      </main>
    </div>
  );
}
```

These design patterns help you build more maintainable, reusable, and performant React applications. Choose the patterns that best fit your specific use cases and team preferences.
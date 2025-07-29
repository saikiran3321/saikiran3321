---
sidebar_position: 3
---

# Functional Components and Hooks

Functional components with hooks represent the modern approach to building React applications. Introduced in React 16.8, hooks allow you to use state and other React features in functional components, making them more powerful and concise than class components.

## What are Functional Components?

Functional components are JavaScript functions that return JSX. They are simpler, more readable, and easier to test than class components.

```jsx
// Simple functional component
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}

// Arrow function syntax
const Welcome = (props) => {
  return <h1>Hello, {props.name}!</h1>;
};

// Destructured props
const Welcome = ({ name }) => {
  return <h1>Hello, {name}!</h1>;
};
```

## Introduction to Hooks

Hooks are functions that let you "hook into" React features from functional components. They always start with the word "use" and follow specific rules.

### Rules of Hooks

1. **Only call hooks at the top level** - Don't call hooks inside loops, conditions, or nested functions
2. **Only call hooks from React functions** - Call them from React functional components or custom hooks

```jsx
// ✅ Correct
function MyComponent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  
  if (count > 5) {
    // ✅ This is fine - conditional logic after hooks
    return <div>Count is too high!</div>;
  }
  
  return <div>Count: {count}</div>;
}

// ❌ Incorrect
function MyComponent() {
  if (someCondition) {
    const [count, setCount] = useState(0); // ❌ Hook inside condition
  }
  
  for (let i = 0; i < 3; i++) {
    const [value, setValue] = useState(i); // ❌ Hook inside loop
  }
}
```

## Built-in Hooks

### useState Hook

The `useState` hook allows you to add state to functional components.

```jsx
import React, { useState } from 'react';

function Counter() {
  // Declare state variable with initial value
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

#### Multiple State Variables

```jsx
function UserProfile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  return (
    <form>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="number"
        value={age}
        onChange={(e) => setAge(parseInt(e.target.value))}
        placeholder="Age"
      />
      <label>
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        Active
      </label>
    </form>
  );
}
```

#### Complex State with Objects

```jsx
function UserForm() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    preferences: {
      theme: 'light',
      notifications: true
    }
  });
  
  const updateUser = (field, value) => {
    setUser(prevUser => ({
      ...prevUser,
      [field]: value
    }));
  };
  
  const updatePreferences = (preference, value) => {
    setUser(prevUser => ({
      ...prevUser,
      preferences: {
        ...prevUser.preferences,
        [preference]: value
      }
    }));
  };
  
  return (
    <div>
      <input
        value={user.name}
        onChange={(e) => updateUser('name', e.target.value)}
        placeholder="Name"
      />
      <input
        value={user.email}
        onChange={(e) => updateUser('email', e.target.value)}
        placeholder="Email"
      />
      <select
        value={user.preferences.theme}
        onChange={(e) => updatePreferences('theme', e.target.value)}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}
```

### useEffect Hook

The `useEffect` hook lets you perform side effects in functional components. It serves the same purpose as `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount` combined.

```jsx
import React, { useState, useEffect } from 'react';

function DataFetcher() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // This runs after every render
    console.log('Component rendered');
  });
  
  useEffect(() => {
    // This runs only once (like componentDidMount)
    fetchData();
  }, []); // Empty dependency array
  
  useEffect(() => {
    // This runs when data changes
    if (data) {
      console.log('Data updated:', data);
    }
  }, [data]); // Dependency array with data
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/data');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h2>Data:</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

#### Cleanup with useEffect

```jsx
function Timer() {
  const [seconds, setSeconds] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prevSeconds => prevSeconds + 1);
    }, 1000);
    
    // Cleanup function (like componentWillUnmount)
    return () => {
      clearInterval(interval);
    };
  }, []); // Empty dependency array means this effect runs once
  
  return <div>Seconds: {seconds}</div>;
}
```

#### Multiple useEffect Hooks

```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  
  // Effect for fetching user data
  useEffect(() => {
    if (userId) {
      fetchUser(userId).then(setUser);
    }
  }, [userId]);
  
  // Effect for fetching user posts
  useEffect(() => {
    if (userId) {
      fetchUserPosts(userId).then(setPosts);
    }
  }, [userId]);
  
  // Effect for updating document title
  useEffect(() => {
    if (user) {
      document.title = `${user.name}'s Profile`;
    }
    
    return () => {
      document.title = 'My App'; // Cleanup
    };
  }, [user]);
  
  return (
    <div>
      {user && <h1>{user.name}</h1>}
      {posts.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
```

### useContext Hook

The `useContext` hook allows you to consume context values without wrapping components in Context.Consumer.

```jsx
import React, { createContext, useContext, useState } from 'react';

// Create context
const ThemeContext = createContext();
const UserContext = createContext();

// Provider component
function AppProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <UserContext.Provider value={{ user, setUser }}>
        {children}
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
}

// Component using context
function Header() {
  const { theme, setTheme } = useContext(ThemeContext);
  const { user } = useContext(UserContext);
  
  return (
    <header className={`header ${theme}`}>
      <h1>My App</h1>
      {user && <span>Welcome, {user.name}!</span>}
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </header>
  );
}

// App component
function App() {
  return (
    <AppProvider>
      <Header />
      {/* Other components */}
    </AppProvider>
  );
}
```

### useReducer Hook

The `useReducer` hook is an alternative to `useState` for managing complex state logic.

```jsx
import React, { useReducer } from 'react';

// Reducer function
function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, {
          id: Date.now(),
          text: action.payload,
          completed: false
        }]
      };
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      };
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload)
      };
    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload
      };
    default:
      return state;
  }
}

// Initial state
const initialState = {
  todos: [],
  filter: 'all'
};

function TodoApp() {
  const [state, dispatch] = useReducer(todoReducer, initialState);
  const [inputValue, setInputValue] = useState('');
  
  const addTodo = () => {
    if (inputValue.trim()) {
      dispatch({ type: 'ADD_TODO', payload: inputValue });
      setInputValue('');
    }
  };
  
  const filteredTodos = state.todos.filter(todo => {
    if (state.filter === 'completed') return todo.completed;
    if (state.filter === 'active') return !todo.completed;
    return true;
  });
  
  return (
    <div>
      <div>
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add new todo"
        />
        <button onClick={addTodo}>Add</button>
      </div>
      
      <div>
        <button onClick={() => dispatch({ type: 'SET_FILTER', payload: 'all' })}>
          All
        </button>
        <button onClick={() => dispatch({ type: 'SET_FILTER', payload: 'active' })}>
          Active
        </button>
        <button onClick={() => dispatch({ type: 'SET_FILTER', payload: 'completed' })}>
          Completed
        </button>
      </div>
      
      <ul>
        {filteredTodos.map(todo => (
          <li key={todo.id}>
            <span
              style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
              onClick={() => dispatch({ type: 'TOGGLE_TODO', payload: todo.id })}
            >
              {todo.text}
            </span>
            <button onClick={() => dispatch({ type: 'DELETE_TODO', payload: todo.id })}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### useMemo Hook

The `useMemo` hook memoizes expensive calculations to optimize performance.

```jsx
import React, { useState, useMemo } from 'react';

function ExpensiveComponent({ items, multiplier }) {
  const [count, setCount] = useState(0);
  
  // Expensive calculation that only runs when items or multiplier change
  const expensiveValue = useMemo(() => {
    console.log('Calculating expensive value...');
    return items.reduce((sum, item) => sum + item.value, 0) * multiplier;
  }, [items, multiplier]);
  
  // This calculation runs on every render
  const cheapValue = count * 2;
  
  return (
    <div>
      <p>Expensive Value: {expensiveValue}</p>
      <p>Cheap Value: {cheapValue}</p>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment Count
      </button>
    </div>
  );
}
```

### useCallback Hook

The `useCallback` hook memoizes functions to prevent unnecessary re-renders of child components.

```jsx
import React, { useState, useCallback, memo } from 'react';

// Child component that only re-renders when props change
const ChildComponent = memo(({ onButtonClick, name }) => {
  console.log(`Rendering ChildComponent for ${name}`);
  return (
    <div>
      <p>Child: {name}</p>
      <button onClick={onButtonClick}>Click me</button>
    </div>
  );
});

function ParentComponent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('John');
  
  // Without useCallback, this function is recreated on every render
  const handleButtonClick = useCallback(() => {
    console.log(`Button clicked for ${name}`);
  }, [name]); // Only recreate when name changes
  
  // This function is recreated on every render
  const handleOtherClick = () => {
    console.log('Other button clicked');
  };
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment Count
      </button>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      
      {/* This child will only re-render when name changes */}
      <ChildComponent onButtonClick={handleButtonClick} name={name} />
      
      {/* This child will re-render on every parent render */}
      <ChildComponent onButtonClick={handleOtherClick} name="Other" />
    </div>
  );
}
```

### useRef Hook

The `useRef` hook creates a mutable ref object that persists across renders.

```jsx
import React, { useRef, useEffect, useState } from 'react';

function RefExamples() {
  const inputRef = useRef(null);
  const countRef = useRef(0);
  const [renderCount, setRenderCount] = useState(0);
  
  useEffect(() => {
    // Focus input on mount
    inputRef.current.focus();
  }, []);
  
  useEffect(() => {
    // Update ref value (doesn't cause re-render)
    countRef.current = countRef.current + 1;
    console.log('Render count:', countRef.current);
  });
  
  const focusInput = () => {
    inputRef.current.focus();
  };
  
  const showRenderCount = () => {
    alert(`Component has rendered ${countRef.current} times`);
  };
  
  return (
    <div>
      <input ref={inputRef} placeholder="This will be focused on mount" />
      <button onClick={focusInput}>Focus Input</button>
      <button onClick={() => setRenderCount(renderCount + 1)}>
        Force Re-render
      </button>
      <button onClick={showRenderCount}>
        Show Render Count
      </button>
      <p>State render count: {renderCount}</p>
    </div>
  );
}
```

## Custom Hooks

Custom hooks allow you to extract component logic into reusable functions.

### Simple Custom Hook

```jsx
import { useState, useEffect } from 'react';

// Custom hook for fetching data
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
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
    };
    
    fetchData();
  }, [url]);
  
  return { data, loading, error };
}

// Using the custom hook
function UserProfile({ userId }) {
  const { data: user, loading, error } = useFetch(`/api/users/${userId}`);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### Advanced Custom Hook

```jsx
import { useState, useEffect, useCallback } from 'react';

// Custom hook for local storage
function useLocalStorage(key, initialValue) {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);
  
  return [storedValue, setValue];
}

// Custom hook for online status
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
}

// Custom hook for window dimensions
function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return windowDimensions;
}

// Component using multiple custom hooks
function Dashboard() {
  const [user, setUser] = useLocalStorage('user', null);
  const isOnline = useOnlineStatus();
  const { width, height } = useWindowDimensions();
  
  return (
    <div>
      <h1>Dashboard</h1>
      <p>User: {user ? user.name : 'Not logged in'}</p>
      <p>Status: {isOnline ? 'Online' : 'Offline'}</p>
      <p>Window size: {width} x {height}</p>
      
      {!user && (
        <button onClick={() => setUser({ name: 'John Doe', id: 1 })}>
          Login
        </button>
      )}
      
      {user && (
        <button onClick={() => setUser(null)}>
          Logout
        </button>
      )}
    </div>
  );
}
```

## Performance Optimization with Hooks

### React.memo with Hooks

```jsx
import React, { memo, useState, useCallback } from 'react';

// Memoized child component
const ExpensiveChild = memo(({ data, onUpdate }) => {
  console.log('ExpensiveChild rendered');
  
  return (
    <div>
      <h3>Expensive Child</h3>
      <p>Data: {JSON.stringify(data)}</p>
      <button onClick={() => onUpdate('new value')}>
        Update Data
      </button>
    </div>
  );
});

function OptimizedParent() {
  const [count, setCount] = useState(0);
  const [data, setData] = useState({ value: 'initial' });
  
  // Memoized callback to prevent unnecessary re-renders
  const handleUpdate = useCallback((newValue) => {
    setData({ value: newValue });
  }, []);
  
  return (
    <div>
      <h2>Parent Component</h2>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment Count
      </button>
      
      {/* This child will only re-render when data changes */}
      <ExpensiveChild data={data} onUpdate={handleUpdate} />
    </div>
  );
}
```

### Lazy Loading with Hooks

```jsx
import React, { useState, useEffect, Suspense, lazy } from 'react';

// Lazy load components
const HeavyComponent = lazy(() => import('./HeavyComponent'));
const AnotherComponent = lazy(() => import('./AnotherComponent'));

function LazyLoadingExample() {
  const [showHeavy, setShowHeavy] = useState(false);
  const [showAnother, setShowAnother] = useState(false);
  
  return (
    <div>
      <h2>Lazy Loading Example</h2>
      
      <button onClick={() => setShowHeavy(!showHeavy)}>
        {showHeavy ? 'Hide' : 'Show'} Heavy Component
      </button>
      
      <button onClick={() => setShowAnother(!showAnother)}>
        {showAnother ? 'Hide' : 'Show'} Another Component
      </button>
      
      <Suspense fallback={<div>Loading Heavy Component...</div>}>
        {showHeavy && <HeavyComponent />}
      </Suspense>
      
      <Suspense fallback={<div>Loading Another Component...</div>}>
        {showAnother && <AnotherComponent />}
      </Suspense>
    </div>
  );
}
```

## Best Practices for Functional Components

### 1. Keep Components Small and Focused

```jsx
// ✅ Good - Single responsibility
function UserAvatar({ user, size = 'medium' }) {
  return (
    <img
      src={user.avatar}
      alt={`${user.name}'s avatar`}
      className={`avatar avatar-${size}`}
    />
  );
}

function UserInfo({ user }) {
  return (
    <div className="user-info">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
}

function UserCard({ user }) {
  return (
    <div className="user-card">
      <UserAvatar user={user} />
      <UserInfo user={user} />
    </div>
  );
}
```

### 2. Use Custom Hooks for Reusable Logic

```jsx
// ✅ Good - Extract reusable logic
function useFormValidation(initialValues, validationRules) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  
  const validate = useCallback(() => {
    const newErrors = {};
    Object.keys(validationRules).forEach(field => {
      const rule = validationRules[field];
      if (rule.required && !values[field]) {
        newErrors[field] = `${field} is required`;
      }
      if (rule.minLength && values[field].length < rule.minLength) {
        newErrors[field] = `${field} must be at least ${rule.minLength} characters`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationRules]);
  
  return { values, setValues, errors, validate };
}
```

### 3. Optimize Dependencies in useEffect

```jsx
// ✅ Good - Proper dependency management
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  
  const fetchUser = useCallback(async (id) => {
    const response = await fetch(`/api/users/${id}`);
    const userData = await response.json();
    setUser(userData);
  }, []);
  
  useEffect(() => {
    if (userId) {
      fetchUser(userId);
    }
  }, [userId, fetchUser]);
  
  return user ? <div>{user.name}</div> : <div>Loading...</div>;
}
```

Functional components with hooks provide a more concise and powerful way to build React applications. They offer better performance optimization opportunities, easier testing, and more reusable logic through custom hooks.
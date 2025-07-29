---
sidebar_position: 4
---

# Component Lifecycle Comparison

Understanding the lifecycle of React components is crucial for building efficient applications. This section compares the lifecycle methods of class components with their functional component equivalents using hooks.

## Component Lifecycle Overview

React components go through three main phases:
1. **Mounting** - Component is being created and inserted into the DOM
2. **Updating** - Component is being re-rendered as a result of changes to props or state
3. **Unmounting** - Component is being removed from the DOM

## Class Component Lifecycle Methods

### Mounting Phase

```jsx
class MountingExample extends React.Component {
  constructor(props) {
    super(props);
    console.log('1. Constructor called');
    this.state = { data: null, loading: true };
  }
  
  static getDerivedStateFromProps(props, state) {
    console.log('2. getDerivedStateFromProps called');
    // Return object to update state, or null
    if (props.userId !== state.prevUserId) {
      return {
        data: null,
        loading: true,
        prevUserId: props.userId
      };
    }
    return null;
  }
  
  componentDidMount() {
    console.log('3. componentDidMount called');
    // Perfect place for:
    // - API calls
    // - Setting up subscriptions
    // - Initializing third-party libraries
    this.fetchData();
  }
  
  fetchData = async () => {
    try {
      const response = await fetch(`/api/data/${this.props.userId}`);
      const data = await response.json();
      this.setState({ data, loading: false });
    } catch (error) {
      this.setState({ error: error.message, loading: false });
    }
  }
  
  render() {
    console.log('Render called');
    const { data, loading, error } = this.state;
    
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    return <div>Data: {JSON.stringify(data)}</div>;
  }
}
```

### Updating Phase

```jsx
class UpdatingExample extends React.Component {
  state = { count: 0, data: null };
  
  static getDerivedStateFromProps(props, state) {
    console.log('getDerivedStateFromProps (update)');
    // Called on every render
    return null;
  }
  
  shouldComponentUpdate(nextProps, nextState) {
    console.log('shouldComponentUpdate');
    // Return false to prevent re-render
    // Only update if count actually changed
    return nextState.count !== this.state.count;
  }
  
  getSnapshotBeforeUpdate(prevProps, prevState) {
    console.log('getSnapshotBeforeUpdate');
    // Capture information from DOM before update
    // Return value is passed to componentDidUpdate
    return {
      scrollPosition: window.scrollY,
      prevCount: prevState.count
    };
  }
  
  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('componentDidUpdate');
    
    // Common patterns:
    if (prevState.count !== this.state.count) {
      console.log(`Count changed from ${prevState.count} to ${this.state.count}`);
    }
    
    if (prevProps.userId !== this.props.userId) {
      this.fetchUserData(this.props.userId);
    }
    
    if (snapshot) {
      console.log('Previous scroll position:', snapshot.scrollPosition);
    }
  }
  
  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Increment
        </button>
      </div>
    );
  }
}
```

### Unmounting Phase

```jsx
class UnmountingExample extends React.Component {
  state = { time: new Date() };
  
  componentDidMount() {
    // Set up subscriptions and timers
    this.timerID = setInterval(() => {
      this.setState({ time: new Date() });
    }, 1000);
    
    this.subscription = eventEmitter.subscribe('data', this.handleData);
    window.addEventListener('resize', this.handleResize);
  }
  
  componentWillUnmount() {
    console.log('componentWillUnmount - cleaning up');
    
    // Clean up timers
    if (this.timerID) {
      clearInterval(this.timerID);
    }
    
    // Clean up subscriptions
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);
    
    // Cancel pending requests
    if (this.abortController) {
      this.abortController.abort();
    }
  }
  
  handleData = (data) => {
    this.setState({ data });
  }
  
  handleResize = () => {
    console.log('Window resized');
  }
  
  render() {
    return <div>Current time: {this.state.time.toLocaleTimeString()}</div>;
  }
}
```

## Functional Component Lifecycle with Hooks

### Mounting Equivalent

```jsx
import React, { useState, useEffect } from 'react';

function MountingExample({ userId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Equivalent to componentDidMount
  useEffect(() => {
    console.log('Component mounted - equivalent to componentDidMount');
    fetchData();
  }, []); // Empty dependency array = runs once on mount
  
  // Equivalent to getDerivedStateFromProps
  useEffect(() => {
    console.log('Props changed - equivalent to getDerivedStateFromProps');
    setData(null);
    setLoading(true);
    fetchData();
  }, [userId]); // Runs when userId changes
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/data/${userId}`);
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  console.log('Render called');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return <div>Data: {JSON.stringify(data)}</div>;
}
```

### Updating Equivalent

```jsx
import React, { useState, useEffect, useRef } from 'react';

function UpdatingExample({ userId }) {
  const [count, setCount] = useState(0);
  const [data, setData] = useState(null);
  const prevCountRef = useRef();
  const prevUserIdRef = useRef();
  
  // Equivalent to componentDidUpdate
  useEffect(() => {
    console.log('Component updated - equivalent to componentDidUpdate');
    
    // Check if count changed
    if (prevCountRef.current !== undefined && prevCountRef.current !== count) {
      console.log(`Count changed from ${prevCountRef.current} to ${count}`);
    }
    
    // Check if userId changed
    if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
      console.log(`UserId changed from ${prevUserIdRef.current} to ${userId}`);
      fetchUserData(userId);
    }
    
    // Update refs for next comparison
    prevCountRef.current = count;
    prevUserIdRef.current = userId;
  });
  
  // Equivalent to shouldComponentUpdate (using React.memo at component level)
  // Or using useMemo for expensive calculations
  const expensiveValue = useMemo(() => {
    console.log('Expensive calculation running');
    return count * 1000;
  }, [count]); // Only recalculate when count changes
  
  const fetchUserData = async (id) => {
    // Fetch user data logic
  };
  
  return (
    <div>
      <p>Count: {count}</p>
      <p>Expensive Value: {expensiveValue}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

// Equivalent to shouldComponentUpdate at component level
export default React.memo(UpdatingExample, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render)
  return prevProps.userId === nextProps.userId;
});
```

### Unmounting Equivalent

```jsx
import React, { useState, useEffect } from 'react';

function UnmountingExample() {
  const [time, setTime] = useState(new Date());
  const [data, setData] = useState(null);
  
  useEffect(() => {
    console.log('Setting up timer and subscriptions');
    
    // Set up timer
    const timerID = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    // Set up event listener
    const handleResize = () => {
      console.log('Window resized');
    };
    window.addEventListener('resize', handleResize);
    
    // Set up subscription
    const subscription = eventEmitter.subscribe('data', (newData) => {
      setData(newData);
    });
    
    // Cleanup function - equivalent to componentWillUnmount
    return () => {
      console.log('Cleaning up - equivalent to componentWillUnmount');
      
      // Clear timer
      clearInterval(timerID);
      
      // Remove event listener
      window.removeEventListener('resize', handleResize);
      
      // Clean up subscription
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array means this effect runs once
  
  return <div>Current time: {time.toLocaleTimeString()}</div>;
}
```

## Side-by-Side Lifecycle Comparison

### Complete Lifecycle Example

```jsx
// CLASS COMPONENT VERSION
class LifecycleClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0, data: null };
    console.log('Class: Constructor');
  }
  
  static getDerivedStateFromProps(props, state) {
    console.log('Class: getDerivedStateFromProps');
    return null;
  }
  
  componentDidMount() {
    console.log('Class: componentDidMount');
    this.fetchData();
  }
  
  shouldComponentUpdate(nextProps, nextState) {
    console.log('Class: shouldComponentUpdate');
    return true;
  }
  
  getSnapshotBeforeUpdate(prevProps, prevState) {
    console.log('Class: getSnapshotBeforeUpdate');
    return null;
  }
  
  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('Class: componentDidUpdate');
    if (prevProps.id !== this.props.id) {
      this.fetchData();
    }
  }
  
  componentWillUnmount() {
    console.log('Class: componentWillUnmount');
    // Cleanup
  }
  
  fetchData = () => {
    // Fetch data logic
  }
  
  render() {
    console.log('Class: render');
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Increment
        </button>
      </div>
    );
  }
}

// FUNCTIONAL COMPONENT VERSION
function LifecycleFunction({ id }) {
  const [count, setCount] = useState(0);
  const [data, setData] = useState(null);
  const prevIdRef = useRef();
  
  console.log('Function: render');
  
  // Equivalent to constructor
  // (useState initialization happens here)
  
  // Equivalent to componentDidMount
  useEffect(() => {
    console.log('Function: componentDidMount equivalent');
    fetchData();
  }, []);
  
  // Equivalent to componentDidUpdate
  useEffect(() => {
    console.log('Function: componentDidUpdate equivalent');
    if (prevIdRef.current !== undefined && prevIdRef.current !== id) {
      fetchData();
    }
    prevIdRef.current = id;
  });
  
  // Equivalent to componentWillUnmount
  useEffect(() => {
    return () => {
      console.log('Function: componentWillUnmount equivalent');
      // Cleanup
    };
  }, []);
  
  // Equivalent to getDerivedStateFromProps
  useEffect(() => {
    console.log('Function: getDerivedStateFromProps equivalent');
    // Update state based on props
  }, [id]);
  
  const fetchData = () => {
    // Fetch data logic
  };
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

## Advanced Lifecycle Patterns

### Error Boundaries (Class Components Only)

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Something went wrong.</h2>
          <details>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Note: Error boundaries cannot be implemented with hooks
// You need to use class components for error boundaries
```

### Custom Hook for Lifecycle Events

```jsx
// Custom hook to mimic class component lifecycle
function useLifecycle({ onMount, onUpdate, onUnmount }) {
  const mountedRef = useRef(false);
  
  // onMount equivalent
  useEffect(() => {
    if (onMount) {
      onMount();
    }
    mountedRef.current = true;
    
    // onUnmount equivalent
    return () => {
      if (onUnmount) {
        onUnmount();
      }
    };
  }, [onMount, onUnmount]);
  
  // onUpdate equivalent
  useEffect(() => {
    if (mountedRef.current && onUpdate) {
      onUpdate();
    }
  });
}

// Usage
function MyComponent({ data }) {
  useLifecycle({
    onMount: () => console.log('Component mounted'),
    onUpdate: () => console.log('Component updated'),
    onUnmount: () => console.log('Component will unmount')
  });
  
  return <div>{data}</div>;
}
```

## Performance Considerations

### Class Component Optimization

```jsx
class OptimizedClass extends React.PureComponent {
  // PureComponent automatically implements shouldComponentUpdate
  // with shallow comparison
  
  render() {
    return <div>{this.props.data}</div>;
  }
}

// Or manual optimization
class ManualOptimizedClass extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.data !== this.props.data ||
      nextState.count !== this.state.count
    );
  }
  
  render() {
    return <div>{this.props.data}</div>;
  }
}
```

### Functional Component Optimization

```jsx
// Using React.memo (equivalent to PureComponent)
const OptimizedFunction = React.memo(function MyComponent({ data }) {
  return <div>{data}</div>;
});

// With custom comparison function
const OptimizedFunctionCustom = React.memo(
  function MyComponent({ data, count }) {
    return <div>{data} - {count}</div>;
  },
  (prevProps, nextProps) => {
    return (
      prevProps.data === nextProps.data &&
      prevProps.count === nextProps.count
    );
  }
);

// Using useMemo for expensive calculations
function ExpensiveComponent({ items }) {
  const expensiveValue = useMemo(() => {
    return items.reduce((sum, item) => sum + item.value, 0);
  }, [items]);
  
  return <div>Total: {expensiveValue}</div>;
}
```

## Migration Guide: Class to Functional

### Step-by-Step Conversion

```jsx
// BEFORE: Class Component
class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      loading: true,
      error: null
    };
  }
  
  async componentDidMount() {
    try {
      const response = await fetch(`/api/users/${this.props.userId}`);
      const user = await response.json();
      this.setState({ user, loading: false });
    } catch (error) {
      this.setState({ error: error.message, loading: false });
    }
  }
  
  componentDidUpdate(prevProps) {
    if (prevProps.userId !== this.props.userId) {
      this.fetchUser();
    }
  }
  
  fetchUser = async () => {
    this.setState({ loading: true });
    try {
      const response = await fetch(`/api/users/${this.props.userId}`);
      const user = await response.json();
      this.setState({ user, loading: false });
    } catch (error) {
      this.setState({ error: error.message, loading: false });
    }
  }
  
  render() {
    const { user, loading, error } = this.state;
    
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    
    return (
      <div>
        <h1>{user.name}</h1>
        <p>{user.email}</p>
      </div>
    );
  }
}

// AFTER: Functional Component
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchUser = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/users/${id}`);
      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // componentDidMount equivalent
  useEffect(() => {
    fetchUser(userId);
  }, []);
  
  // componentDidUpdate equivalent
  useEffect(() => {
    fetchUser(userId);
  }, [userId, fetchUser]);
  
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

Understanding the lifecycle comparison helps you choose the right approach for your components and migrate between class and functional components effectively. Functional components with hooks provide more flexibility and better performance optimization opportunities while maintaining the same lifecycle capabilities.
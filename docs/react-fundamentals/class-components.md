---
sidebar_position: 2
---

# Class Components in React

Class components were the primary way to create stateful components in React before the introduction of hooks. While functional components with hooks are now the preferred approach, understanding class components is still important for maintaining legacy code and understanding React's evolution.

## What are Class Components?

Class components are ES6 classes that extend `React.Component` and must include a `render()` method that returns JSX.

```jsx
import React, { Component } from 'react';

class MyComponent extends Component {
  render() {
    return <h1>Hello from Class Component!</h1>;
  }
}

export default MyComponent;
```

## Basic Structure

### Minimal Class Component

```jsx
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}!</h1>;
  }
}
```

### Complete Class Component Structure

```jsx
import React, { Component } from 'react';

class UserProfile extends Component {
  constructor(props) {
    super(props);
    
    // Initialize state
    this.state = {
      user: null,
      loading: true,
      error: null
    };
    
    // Bind methods (if not using arrow functions)
    this.handleClick = this.handleClick.bind(this);
  }
  
  // Lifecycle methods
  componentDidMount() {
    this.fetchUserData();
  }
  
  componentDidUpdate(prevProps) {
    if (prevProps.userId !== this.props.userId) {
      this.fetchUserData();
    }
  }
  
  componentWillUnmount() {
    // Cleanup
    this.cancelRequests();
  }
  
  // Custom methods
  fetchUserData = async () => {
    try {
      this.setState({ loading: true });
      const response = await fetch(`/api/users/${this.props.userId}`);
      const user = await response.json();
      this.setState({ user, loading: false });
    } catch (error) {
      this.setState({ error: error.message, loading: false });
    }
  }
  
  handleClick() {
    console.log('Button clicked');
  }
  
  render() {
    const { user, loading, error } = this.state;
    
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    
    return (
      <div className="user-profile">
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <button onClick={this.handleClick}>
          Click me
        </button>
      </div>
    );
  }
}

export default UserProfile;
```

## State Management in Class Components

### Initializing State

```jsx
class Counter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      message: 'Hello'
    };
  }
  
  // Alternative syntax (class property)
  state = {
    count: 0,
    message: 'Hello'
  };
  
  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <p>Message: {this.state.message}</p>
      </div>
    );
  }
}
```

### Updating State

```jsx
class Counter extends Component {
  state = { count: 0 };
  
  increment = () => {
    // Using setState with object
    this.setState({ count: this.state.count + 1 });
  }
  
  incrementAsync = () => {
    // Using setState with function (recommended for state updates based on previous state)
    this.setState(prevState => ({
      count: prevState.count + 1
    }));
  }
  
  incrementWithCallback = () => {
    // setState with callback
    this.setState(
      { count: this.state.count + 1 },
      () => {
        console.log('State updated:', this.state.count);
      }
    );
  }
  
  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={this.increment}>Increment</button>
        <button onClick={this.incrementAsync}>Increment Async</button>
        <button onClick={this.incrementWithCallback}>Increment with Callback</button>
      </div>
    );
  }
}
```

### Complex State Updates

```jsx
class TodoList extends Component {
  state = {
    todos: [],
    filter: 'all',
    newTodo: ''
  };
  
  addTodo = () => {
    const { newTodo, todos } = this.state;
    if (newTodo.trim()) {
      this.setState({
        todos: [...todos, {
          id: Date.now(),
          text: newTodo,
          completed: false
        }],
        newTodo: ''
      });
    }
  }
  
  toggleTodo = (id) => {
    this.setState(prevState => ({
      todos: prevState.todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    }));
  }
  
  deleteTodo = (id) => {
    this.setState(prevState => ({
      todos: prevState.todos.filter(todo => todo.id !== id)
    }));
  }
  
  render() {
    const { todos, newTodo } = this.state;
    
    return (
      <div>
        <input
          value={newTodo}
          onChange={(e) => this.setState({ newTodo: e.target.value })}
          placeholder="Add new todo"
        />
        <button onClick={this.addTodo}>Add</button>
        
        <ul>
          {todos.map(todo => (
            <li key={todo.id}>
              <span
                style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
                onClick={() => this.toggleTodo(todo.id)}
              >
                {todo.text}
              </span>
              <button onClick={() => this.deleteTodo(todo.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
```

## Class Component Lifecycle Methods

### Mounting Phase

```jsx
class LifecycleDemo extends Component {
  constructor(props) {
    super(props);
    console.log('1. Constructor called');
    this.state = { data: null };
  }
  
  static getDerivedStateFromProps(props, state) {
    console.log('2. getDerivedStateFromProps called');
    // Return object to update state, or null to update nothing
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
      const response = await fetch('/api/data');
      const data = await response.json();
      this.setState({ data });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  
  render() {
    console.log('Render called');
    return <div>Component rendered</div>;
  }
}
```

### Updating Phase

```jsx
class UpdateDemo extends Component {
  state = { count: 0 };
  
  static getDerivedStateFromProps(props, state) {
    console.log('getDerivedStateFromProps (update)');
    return null;
  }
  
  shouldComponentUpdate(nextProps, nextState) {
    console.log('shouldComponentUpdate');
    // Return false to prevent re-render
    return nextState.count !== this.state.count;
  }
  
  getSnapshotBeforeUpdate(prevProps, prevState) {
    console.log('getSnapshotBeforeUpdate');
    // Capture some information from DOM before update
    return { scrollPosition: window.scrollY };
  }
  
  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('componentDidUpdate');
    if (snapshot && snapshot.scrollPosition) {
      // Use snapshot value
      console.log('Previous scroll position:', snapshot.scrollPosition);
    }
    
    // Common use cases:
    if (prevState.count !== this.state.count) {
      // State changed, perform side effects
      this.logCountChange();
    }
  }
  
  logCountChange = () => {
    console.log('Count changed to:', this.state.count);
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
class CleanupDemo extends Component {
  state = { time: new Date() };
  
  componentDidMount() {
    // Set up timer
    this.timerID = setInterval(() => {
      this.setState({ time: new Date() });
    }, 1000);
    
    // Set up event listeners
    window.addEventListener('resize', this.handleResize);
    
    // Set up subscriptions
    this.subscription = someService.subscribe(this.handleData);
  }
  
  componentWillUnmount() {
    console.log('Component will unmount');
    
    // Clean up timer
    if (this.timerID) {
      clearInterval(this.timerID);
    }
    
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);
    
    // Clean up subscriptions
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    
    // Cancel any pending requests
    if (this.abortController) {
      this.abortController.abort();
    }
  }
  
  handleResize = () => {
    console.log('Window resized');
  }
  
  handleData = (data) => {
    this.setState({ data });
  }
  
  render() {
    return <div>Current time: {this.state.time.toLocaleTimeString()}</div>;
  }
}
```

### Error Handling

```jsx
class ErrorBoundary extends Component {
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
    
    // You can also log the error to an error reporting service
    // logErrorToService(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
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

// Usage
function App() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

## Event Handling in Class Components

### Method Binding

```jsx
class EventDemo extends Component {
  state = { message: '' };
  
  // Method 1: Bind in constructor
  constructor(props) {
    super(props);
    this.handleClick1 = this.handleClick1.bind(this);
  }
  
  handleClick1() {
    this.setState({ message: 'Method 1: Bound in constructor' });
  }
  
  // Method 2: Arrow function (recommended)
  handleClick2 = () => {
    this.setState({ message: 'Method 2: Arrow function' });
  }
  
  // Method 3: Inline arrow function (not recommended for performance)
  render() {
    return (
      <div>
        <button onClick={this.handleClick1}>Method 1</button>
        <button onClick={this.handleClick2}>Method 2</button>
        <button onClick={() => this.setState({ message: 'Method 3: Inline' })}>
          Method 3
        </button>
        <p>{this.state.message}</p>
      </div>
    );
  }
}
```

### Handling Form Events

```jsx
class FormDemo extends Component {
  state = {
    name: '',
    email: '',
    message: '',
    subscribe: false
  };
  
  handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    this.setState({
      [name]: type === 'checkbox' ? checked : value
    });
  }
  
  handleSubmit = (event) => {
    event.preventDefault();
    console.log('Form submitted:', this.state);
    
    // Reset form
    this.setState({
      name: '',
      email: '',
      message: '',
      subscribe: false
    });
  }
  
  render() {
    const { name, email, message, subscribe } = this.state;
    
    return (
      <form onSubmit={this.handleSubmit}>
        <div>
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={name}
              onChange={this.handleInputChange}
              required
            />
          </label>
        </div>
        
        <div>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={email}
              onChange={this.handleInputChange}
              required
            />
          </label>
        </div>
        
        <div>
          <label>
            Message:
            <textarea
              name="message"
              value={message}
              onChange={this.handleInputChange}
              rows="4"
            />
          </label>
        </div>
        
        <div>
          <label>
            <input
              type="checkbox"
              name="subscribe"
              checked={subscribe}
              onChange={this.handleInputChange}
            />
            Subscribe to newsletter
          </label>
        </div>
        
        <button type="submit">Submit</button>
      </form>
    );
  }
}
```

## Advanced Class Component Patterns

### Higher-Order Components (HOCs)

```jsx
// HOC for adding loading functionality
function withLoading(WrappedComponent) {
  return class extends Component {
    state = { loading: false };
    
    setLoading = (loading) => {
      this.setState({ loading });
    }
    
    render() {
      if (this.state.loading) {
        return <div>Loading...</div>;
      }
      
      return (
        <WrappedComponent
          {...this.props}
          setLoading={this.setLoading}
        />
      );
    }
  };
}

// Usage
class MyComponent extends Component {
  componentDidMount() {
    this.props.setLoading(true);
    // Simulate API call
    setTimeout(() => {
      this.props.setLoading(false);
    }, 2000);
  }
  
  render() {
    return <div>Component loaded!</div>;
  }
}

const MyComponentWithLoading = withLoading(MyComponent);
```

### Render Props Pattern

```jsx
class DataProvider extends Component {
  state = { data: null, loading: true, error: null };
  
  componentDidMount() {
    this.fetchData();
  }
  
  fetchData = async () => {
    try {
      const response = await fetch(this.props.url);
      const data = await response.json();
      this.setState({ data, loading: false });
    } catch (error) {
      this.setState({ error: error.message, loading: false });
    }
  }
  
  render() {
    return this.props.children(this.state);
  }
}

// Usage
function App() {
  return (
    <DataProvider url="/api/users">
      {({ data, loading, error }) => {
        if (loading) return <div>Loading...</div>;
        if (error) return <div>Error: {error}</div>;
        return (
          <ul>
            {data.map(user => (
              <li key={user.id}>{user.name}</li>
            ))}
          </ul>
        );
      }}
    </DataProvider>
  );
}
```

## Performance Optimization

### PureComponent

```jsx
import React, { PureComponent } from 'react';

// PureComponent automatically implements shouldComponentUpdate with shallow comparison
class OptimizedComponent extends PureComponent {
  render() {
    console.log('Rendering OptimizedComponent');
    return <div>{this.props.name}</div>;
  }
}

// Equivalent manual implementation
class ManualOptimizedComponent extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.name !== this.props.name ||
      nextState.count !== this.state.count
    );
  }
  
  render() {
    return <div>{this.props.name}</div>;
  }
}
```

### Memoization

```jsx
class ExpensiveComponent extends Component {
  expensiveCalculation = (num) => {
    console.log('Performing expensive calculation...');
    let result = 0;
    for (let i = 0; i < num * 1000000; i++) {
      result += i;
    }
    return result;
  }
  
  // Memoize expensive calculations
  memoizedCalculation = (() => {
    let cache = {};
    return (num) => {
      if (cache[num]) {
        console.log('Using cached result');
        return cache[num];
      }
      const result = this.expensiveCalculation(num);
      cache[num] = result;
      return result;
    };
  })();
  
  render() {
    const result = this.memoizedCalculation(this.props.number);
    return <div>Result: {result}</div>;
  }
}
```

## Best Practices for Class Components

### 1. Constructor Best Practices

```jsx
class BestPracticeComponent extends Component {
  constructor(props) {
    super(props);
    
    // Initialize state
    this.state = {
      data: null,
      loading: false
    };
    
    // Bind methods only if not using arrow functions
    // this.handleClick = this.handleClick.bind(this);
  }
  
  // Prefer arrow functions for automatic binding
  handleClick = () => {
    // Method implementation
  }
}
```

### 2. State Management Best Practices

```jsx
class StateManagementDemo extends Component {
  state = {
    user: {
      name: '',
      email: ''
    },
    preferences: {
      theme: 'light',
      notifications: true
    }
  };
  
  // Don't mutate state directly
  updateUserName = (name) => {
    // Wrong
    // this.state.user.name = name;
    
    // Correct
    this.setState(prevState => ({
      user: {
        ...prevState.user,
        name: name
      }
    }));
  }
  
  // Use functional setState for state updates based on previous state
  incrementCounter = () => {
    this.setState(prevState => ({
      counter: prevState.counter + 1
    }));
  }
}
```

### 3. Lifecycle Method Best Practices

```jsx
class LifecycleBestPractices extends Component {
  componentDidMount() {
    // Good for:
    // - API calls
    // - Setting up subscriptions
    // - Initializing third-party libraries
    this.fetchData();
    this.setupEventListeners();
  }
  
  componentDidUpdate(prevProps, prevState) {
    // Always compare with previous props/state
    if (prevProps.userId !== this.props.userId) {
      this.fetchUserData(this.props.userId);
    }
  }
  
  componentWillUnmount() {
    // Always clean up
    this.cleanupEventListeners();
    this.cancelPendingRequests();
    this.clearTimers();
  }
}
```

Class components provide a solid foundation for understanding React's component lifecycle and state management. While functional components with hooks are now preferred, mastering class components helps you understand React's evolution and maintain existing codebases effectively.
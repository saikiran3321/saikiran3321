---
sidebar_position: 1
---

# Introduction to React.js

React.js is a powerful JavaScript library for building user interfaces, particularly web applications. Developed by Facebook (now Meta) in 2013, React has become one of the most popular frontend frameworks due to its component-based architecture, virtual DOM, and declarative programming model.

## What is React.js?

React is a **declarative**, **efficient**, and **flexible** JavaScript library for building user interfaces. It lets you compose complex UIs from small and isolated pieces of code called "components."

### Key Characteristics

#### Declarative Programming
React makes it painless to create interactive UIs. Design simple views for each state in your application, and React will efficiently update and render just the right components when your data changes.

```jsx
// Declarative approach - describe what you want
function Welcome({ name }) {
  return <h1>Hello, {name}!</h1>;
}

// Instead of imperative approach - describe how to do it
// const element = document.createElement('h1');
// element.textContent = `Hello, ${name}!`;
// document.body.appendChild(element);
```

#### Component-Based Architecture
Build encapsulated components that manage their own state, then compose them to make complex UIs.

```jsx
// Component composition
function App() {
  return (
    <div>
      <Header />
      <MainContent />
      <Footer />
    </div>
  );
}
```

#### Learn Once, Write Anywhere
React doesn't make assumptions about the rest of your technology stack, so you can develop new features without rewriting existing code.

## Core Concepts

### Virtual DOM

React creates an in-memory virtual representation of the real DOM. When state changes occur, React:

1. **Creates** a new virtual DOM tree
2. **Compares** it with the previous virtual DOM tree (diffing)
3. **Updates** only the changed parts in the real DOM (reconciliation)

```jsx
// Virtual DOM representation
const virtualElement = {
  type: 'div',
  props: {
    className: 'container',
    children: [
      {
        type: 'h1',
        props: {
          children: 'Hello World'
        }
      }
    ]
  }
};
```

### JSX (JavaScript XML)

JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files.

```jsx
// JSX syntax
const element = <h1 className="greeting">Hello, world!</h1>;

// Compiles to:
const element = React.createElement(
  'h1',
  { className: 'greeting' },
  'Hello, world!'
);
```

### Components

Components are the building blocks of React applications. They can be defined as classes or functions.

```jsx
// Functional Component
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

// Class Component
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

### Props (Properties)

Props are read-only inputs to components. They allow you to pass data from parent to child components.

```jsx
function UserProfile({ name, email, avatar }) {
  return (
    <div className="user-profile">
      <img src={avatar} alt={`${name}'s avatar`} />
      <h2>{name}</h2>
      <p>{email}</p>
    </div>
  );
}

// Usage
<UserProfile 
  name="John Doe" 
  email="john@example.com" 
  avatar="/path/to/avatar.jpg" 
/>
```

### State

State is a built-in object that stores property values that belong to a component. When state changes, the component re-renders.

```jsx
// Functional component with state
import { useState } from 'react';

function Counter() {
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

## React Ecosystem

### Core Libraries

#### React DOM
Provides DOM-specific methods for React components.

```jsx
import ReactDOM from 'react-dom/client';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

#### React Router
Declarative routing for React applications.

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### State Management

#### Built-in State Management
- **useState**: For local component state
- **useReducer**: For complex state logic
- **useContext**: For sharing state across components

#### External Libraries
- **Redux**: Predictable state container
- **MobX**: Simple, scalable state management
- **Zustand**: Small, fast, and scalable state management

### Development Tools

#### React Developer Tools
Browser extension for debugging React applications.

#### Create React App
Tool for setting up modern React applications with no build configuration.

```bash
npx create-react-app my-app
cd my-app
npm start
```

#### Vite
Fast build tool and development server for modern web projects.

```bash
npm create vite@latest my-react-app -- --template react
cd my-react-app
npm install
npm run dev
```

## React Component Types Evolution

### Class Components (Legacy)
The original way to create stateful components in React.

```jsx
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  componentDidMount() {
    console.log('Component mounted');
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

### Functional Components with Hooks (Modern)
The modern approach using hooks for state and lifecycle management.

```jsx
import { useState, useEffect } from 'react';

function MyComponent() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('Component mounted or updated');
  }, []);

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

## Why Choose React?

### Advantages

#### Large Ecosystem
- Extensive library of third-party packages
- Strong community support
- Comprehensive documentation

#### Performance
- Virtual DOM for efficient updates
- Code splitting and lazy loading
- Server-side rendering capabilities

#### Developer Experience
- Excellent debugging tools
- Hot reloading during development
- Strong TypeScript support

#### Industry Adoption
- Used by major companies (Facebook, Netflix, Airbnb)
- Large job market demand
- Continuous development and updates

### Use Cases

#### Single Page Applications (SPAs)
React excels at building dynamic, interactive web applications.

#### Progressive Web Apps (PWAs)
Create app-like experiences on the web.

#### Mobile Applications
React Native allows you to build mobile apps using React concepts.

#### Static Site Generation
Tools like Gatsby and Next.js enable static site generation with React.

## Getting Started

### Prerequisites
- Basic knowledge of HTML, CSS, and JavaScript
- Understanding of ES6+ features (arrow functions, destructuring, modules)
- Familiarity with npm/yarn package managers

### Development Environment Setup

```bash
# Install Node.js (includes npm)
# Download from https://nodejs.org/

# Create a new React application
npx create-react-app my-first-react-app

# Navigate to the project directory
cd my-first-react-app

# Start the development server
npm start
```

### Your First Component

```jsx
// src/components/HelloWorld.js
import React from 'react';

function HelloWorld({ name = 'World' }) {
  return (
    <div className="hello-world">
      <h1>Hello, {name}!</h1>
      <p>Welcome to React.js</p>
    </div>
  );
}

export default HelloWorld;
```

```jsx
// src/App.js
import React from 'react';
import HelloWorld from './components/HelloWorld';
import './App.css';

function App() {
  return (
    <div className="App">
      <HelloWorld name="React Developer" />
    </div>
  );
}

export default App;
```

## Best Practices

### Component Organization
- Keep components small and focused
- Use descriptive names
- Organize components in folders by feature

### State Management
- Keep state as local as possible
- Use props for data that doesn't change
- Consider state management libraries for complex applications

### Performance Optimization
- Use React.memo for expensive components
- Implement proper key props for lists
- Avoid creating objects in render methods

### Code Quality
- Use ESLint and Prettier for consistent code style
- Write unit tests for components
- Use TypeScript for better type safety

React.js provides a solid foundation for building modern web applications. Understanding its core concepts and best practices will help you create maintainable, scalable, and performant user interfaces.

### Personal Questions 

 **1. Tell me about your experience and projects related to UI development.**  

 **2. What UI libraries have you used before? Do you know Material-UI (MUI)?**  
  - Answer:
    - List UI libraries you've worked with (e.g., Bootstrap, Ant Design).

    - Explain familiarity with MUI, mentioning components and its integration in React projects.
    

### Easy Questions
1. **How to conditionally render components in React?**  
  - Answer: 
    - Use conditional statements like `if` or ternary operators `{ condition ? <Component /> : null }`.
 
    - Implement logical && operator for short-circuit evaluation `{ condition && <Component /> }`.
 
2. **What are React hooks? Can you name a few and explain their use cases?**  
  - Answer:
    - Hooks are functions that allow you to use React state and lifecycle methods in functional components.
 
    - Examples: 
      - `useState` for managing state.
 
      - `useEffect` for side effects like API calls.
 
      - `useRef` for accessing DOM elements or persisting values across renders.
 
      - `useContext` for accessing context values.
 
3. **What is the purpose of `useEffect`, and how can you control its execution?**  
  - Answer: 
    - `useEffect` is used for side effects like data fetching, subscriptions, or DOM manipulation.
 
    - Control execution using the dependency array: 
      - Empty `[]`: Runs once after the component mounts.
 
      - `[dependencies]`: Runs when any dependency changes.

4. **Stateful vs stateless components? How to use state in React?**  
  - Answer:
    - Stateful components manage state and have lifecycle methods. Stateless (functional) components are stateless and mainly used for UI rendering.
 
    - Use `useState` hook to manage state in functional components and `this.state` in class components.
5. **What are props in React?**  
  - Answer:
    - Props (short for properties) are read-only data passed from parent to child components.

### Medium Questions 
 
1. **Why do we have keys in React? What qualifies for a good key? Is index of an array a good key?**  
  - Answer:
    - Keys are used to uniquely identify elements in arrays, aiding React in efficient rendering and updating of components.

    - A good key should be stable, unique among siblings, and ideally not based on index unless the order is static.
 
2. **What is memoization? When to use it in React? How to use it in React?**  
  - Answer:
    - Memoization is a technique to optimize expensive calculations by caching results.

    - Use it for performance optimization in functions that are called often with the same arguments.
 
    - Example: `useMemo` hook in React to memoize values.
 


### Difficult Questions 
 
1. **What is lifting state up in React? When, why, and how is it done?**  
  - Answer:
    - Lifting state up involves moving state management to a higher-level component.

    - Done to share state between components that don't have a direct parent-child relationship.

    - Example: Lift state from child components to a common parent using props and callbacks.
 
2. **What is a router in React? Have you used any? List the ones you know and have used. Give me an outline code of any router.**  
  - Answer:
    - A router in React manages navigation and rendering of components based on URLs.

    - List routers like React Router, Next.js Router.
 
    - Provide an outline code using React Router:

```jsx
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/about">
          <About />
        </Route>
      </Switch>
    </Router>
  );
}
```



 



 
3. **What is `React.lazy`, and how to use in apps?**  
  - Answer: 
    - `React.lazy` enables code-splitting by loading components lazily when needed, reducing the initial bundle size and improving performance.
  ```
    import React from "react";
    import { Suspense, lazy } from "react";
    const Component1 = lazy(() => 
        import("../src/LazyContent/myComponent1"));
    const Component2 = lazy(() => 
        import("../src/LazyContent/myComponent2"));
    function App() {
        return (
            <>
                <h1> Lazy Load</h1>
                <Suspense
                    fallback={<div>Component1 are loading please wait...</div>}
                >
                    <Component1 />
                </Suspense>
                <Suspense
                    fallback={<div>Component2 are loading please wait...</div>}
                >
                    <Component2 />
                </Suspense>
            </>
        );
    }

    export default App;
  ```

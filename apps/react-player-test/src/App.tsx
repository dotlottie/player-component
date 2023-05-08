/**
 * Copyright 2023 Design Barn Inc.
 */

import { Route } from 'wouter';

import Home from './pages/home';
import Test from './pages/test';

const App: React.FC = () => {
  return (
    <div>
      <Route path="/" component={Home}></Route>
      <Route path="/test" component={Test} />
    </div>
  );
};

export default App;

/**
 * Copyright 2023 Design Barn Inc.
 */

import { Route } from 'wouter';

import Home from './pages/Home';
import Test from './pages/Test';

const App: React.FC = () => {
  return (
    <div>
      <Route path="/" component={Home}></Route>
      <Route path="/test" component={Test} />
    </div>
  );
};

export default App;

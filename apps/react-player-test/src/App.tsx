import { Route } from 'wouter';
import Home from './pages/Home';
import Test from './pages/Test';

function App() {
  return (
    <div>
      <Route path="/" component={Home}></Route>
      <Route path="/test" component={Test} />
    </div>
  );
}

export default App;

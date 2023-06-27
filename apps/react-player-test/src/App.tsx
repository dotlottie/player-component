/**
 * Copyright 2023 Design Barn Inc.
 */
import { createContext, useState } from 'react';
import { Route } from 'wouter';

import Home from './pages/Home';
import Test from './pages/Test';

export const ThemeContext = createContext('light');

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleThemeChange = () => {
    setIsDarkMode(!isDarkMode);
  };

  const styles: Record<string, React.CSSProperties> = {
    app: {
      position: 'relative',
      width: '100%',
      height: '100%',
      backgroundColor: isDarkMode ? 'black' : 'white',
      color: isDarkMode ? 'white' : 'black',
    },
    button: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: isDarkMode ? 'white' : 'black',
      color: isDarkMode ? 'black' : 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '5px',
      cursor: 'pointer',
      transition: 'all 0.5s',
    },
  };

  return (
    <ThemeContext.Provider value={isDarkMode ? 'dark' : 'light'}>
      <div style={styles.app}>
        <button style={styles.button} onClick={handleThemeChange}>
          {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
        <Route path="/" component={Home}></Route>
        <Route path="/test" component={Test} />
      </div>
    </ThemeContext.Provider>
  );
};

export default App;

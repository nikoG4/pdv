import React from 'react';
import { AuthProvider } from './services/Auth/AuthContext';
import Home from './components/Home/Home';

const App = () => {
  return (
    <AuthProvider>
      <Home />
    </AuthProvider>
  );
};

export default App;

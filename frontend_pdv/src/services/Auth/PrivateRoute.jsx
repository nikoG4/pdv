import React, { useContext } from 'react';
import { Route } from 'wouter';
import { AuthContext } from './AuthContext';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Route
      {...rest}
      component={(props) =>
        isAuthenticated ? <Component {...props} /> : null
      }
    />
  );
};

export default PrivateRoute;

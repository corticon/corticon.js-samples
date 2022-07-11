import React from 'react';
export const AppContext = React.createContext({
  appEvents: [], 
  sendAppEvent: () => {},
  backend: ''
});
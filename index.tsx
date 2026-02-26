import { inject } from '@vercel/analytics';
import App from './App.js';

// Initialize Vercel Web Analytics
inject();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Initialize the application
App(rootElement);

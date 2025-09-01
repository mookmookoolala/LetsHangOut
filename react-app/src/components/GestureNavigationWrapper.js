import React from 'react';
import { useLocation } from 'react-router-dom';
import GestureNavigation from './GestureNavigation';

// Wrapper component that configures gesture navigation based on current route
const GestureNavigationWrapper = ({ children }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Define route mappings based on current path
  const getRouteConfig = () => {
    // Dashboard routes
    if (currentPath === '/dashboard') {
      return {
        left: '/tasks',      // Swipe left to go to tasks
        right: '/dates',     // Swipe right to go to dates
        up: null,            // No action
        down: '/budget'      // Swipe down to go to budget
      };
    }
    
    // Tasks routes
    else if (currentPath === '/tasks') {
      return {
        left: '/budget',     // Swipe left to go to budget
        right: '/dashboard', // Swipe right to go to dashboard
        up: null,            // No action
        down: null           // No action
      };
    }
    
    // Dates routes
    else if (currentPath === '/dates') {
      return {
        left: '/dashboard',  // Swipe left to go to dashboard
        right: '/chat',      // Swipe right to go to chat
        up: null,            // No action
        down: null           // No action
      };
    }
    
    // Budget routes
    else if (currentPath === '/budget') {
      return {
        left: '/chat',       // Swipe left to go to chat
        right: '/tasks',     // Swipe right to go to tasks
        up: '/dashboard',    // Swipe up to go to dashboard
        down: null           // No action
      };
    }
    
    // Chat routes
    else if (currentPath === '/chat') {
      return {
        left: '/dates',      // Swipe left to go to dates
        right: '/budget',    // Swipe right to go to budget
        up: null,            // No action
        down: null           // No action
      };
    }
    
    // Default - minimal navigation for other screens
    return {
      left: '/dashboard',   // Swipe left to go to dashboard
      right: null,           // No action
      up: null,              // No action
      down: null             // No action
    };
  };
  
  // Only enable gesture navigation on mobile-specific routes
  const shouldEnableGestures = () => {
    const mobileRoutes = [
      '/dashboard',
      '/tasks',
      '/dates',
      '/budget',
      '/chat'
    ];
    
    return mobileRoutes.some(route => currentPath === route);
  };
  
  // If gestures should be enabled, wrap with GestureNavigation
  if (shouldEnableGestures()) {
    return (
      <GestureNavigation routes={getRouteConfig()}>
        {children}
      </GestureNavigation>
    );
  }
  
  // Otherwise just render children
  return children;
};

export default GestureNavigationWrapper;
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Gesture directions
const DIRECTION = {
  LEFT: 'left',
  RIGHT: 'right',
  UP: 'up',
  DOWN: 'down'
};

// Gesture navigation component that adds swipe gesture support
const GestureNavigation = ({ children, routes = {} }) => {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  
  // Default routes configuration if not provided
  const defaultRoutes = {
    [DIRECTION.LEFT]: '/dashboard',  // Swipe left to go to dashboard
    [DIRECTION.RIGHT]: null,         // No default action
    [DIRECTION.UP]: null,            // No default action
    [DIRECTION.DOWN]: null           // No default action
  };
  
  // Merge provided routes with defaults and memoize to prevent unnecessary re-renders
  const navigationRoutes = React.useMemo(() => {
    return { ...defaultRoutes, ...routes };
  }, [routes]);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Variables to track touch
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    // Minimum distance for a swipe to be recognized
    const minSwipeDistance = 80;
    
    // Handle touch start
    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };
    
    // Handle touch end
    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].clientX;
      touchEndY = e.changedTouches[0].clientY;
      
      // Calculate distances
      const distanceX = touchEndX - touchStartX;
      const distanceY = touchEndY - touchStartY;
      
      // Determine if horizontal or vertical swipe based on which has greater distance
      if (Math.abs(distanceX) > Math.abs(distanceY)) {
        // Horizontal swipe
        if (Math.abs(distanceX) >= minSwipeDistance) {
          const direction = distanceX > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT;
          handleSwipe(direction);
        }
      } else {
        // Vertical swipe
        if (Math.abs(distanceY) >= minSwipeDistance) {
          const direction = distanceY > 0 ? DIRECTION.DOWN : DIRECTION.UP;
          handleSwipe(direction);
        }
      }
    };
    
    // Handle swipe based on direction
    const handleSwipe = (direction) => {
      const route = navigationRoutes[direction];
      if (route) {
        // Add visual feedback for the swipe
        addSwipeFeedback(direction);
        // Navigate to the route
        setTimeout(() => navigate(route), 300);
      }
    };
    
    // Add visual feedback for swipe
    const addSwipeFeedback = (direction) => {
      // Create a visual indicator element
      const indicator = document.createElement('div');
      indicator.className = `swipe-indicator swipe-${direction}`;
      indicator.style.position = 'fixed';
      indicator.style.zIndex = '9999';
      indicator.style.backgroundColor = 'rgba(44, 100, 255, 0.2)';
      indicator.style.transition = 'all 0.3s ease-out';
      
      // Position and animate based on direction
      switch (direction) {
        case DIRECTION.LEFT:
          indicator.style.top = '0';
          indicator.style.right = '0';
          indicator.style.width = '30%';
          indicator.style.height = '100%';
          break;
        case DIRECTION.RIGHT:
          indicator.style.top = '0';
          indicator.style.left = '0';
          indicator.style.width = '30%';
          indicator.style.height = '100%';
          break;
        case DIRECTION.UP:
          indicator.style.bottom = '0';
          indicator.style.left = '0';
          indicator.style.width = '100%';
          indicator.style.height = '30%';
          break;
        case DIRECTION.DOWN:
          indicator.style.top = '0';
          indicator.style.left = '0';
          indicator.style.width = '100%';
          indicator.style.height = '30%';
          break;
        default:
          break;
      }
      
      // Add to DOM
      document.body.appendChild(indicator);
      
      // Animate and remove
      setTimeout(() => {
        indicator.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(indicator);
        }, 300);
      }, 50);
    };
    
    // Add event listeners
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Cleanup
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigate, navigationRoutes]);
  
  return (
    <div ref={containerRef} style={{ height: '100%', width: '100%' }}>
      {children}
    </div>
  );
};

export default GestureNavigation;
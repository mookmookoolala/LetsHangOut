import React, { useState, useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { keyframes } from '@emotion/react';

// Animation keyframes for future use if needed
// const pullDownAnimation = keyframes`
//   0% { transform: translateY(0); }
//   100% { transform: translateY(70px); }
// `;

const releaseAnimation = keyframes`
  0% { transform: translateY(70px); }
  100% { transform: translateY(0); }
`;

const PullToRefresh = ({ onRefresh, children }) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef(null);
  const startYRef = useRef(0);
  const thresholdToRefresh = 70; // pixels

  useEffect(() => {
    // Only add touch events on mobile devices
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return;

    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e) => {
      // Only enable pull-to-refresh when at the top of the page
      if (window.scrollY > 5) return;
      
      startYRef.current = e.touches[0].clientY;
      setIsPulling(true);
    };

    const handleTouchMove = (e) => {
      if (!isPulling) return;
      
      const currentY = e.touches[0].clientY;
      const diff = currentY - startYRef.current;
      
      // Only allow pulling down, not up
      if (diff > 0 && window.scrollY <= 0) {
        // Apply resistance to make the pull feel natural
        const resistance = 0.4;
        const newDistance = Math.min(diff * resistance, thresholdToRefresh * 1.5);
        setPullDistance(newDistance);
        
        // Prevent default scrolling behavior when pulling
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      if (!isPulling) return;
      
      if (pullDistance >= thresholdToRefresh) {
        // Trigger refresh
        setIsRefreshing(true);
        setPullDistance(0);
        
        // Call the onRefresh callback
        if (onRefresh) {
          Promise.resolve(onRefresh())
            .finally(() => {
              setTimeout(() => {
                setIsRefreshing(false);
              }, 1000); // Minimum refresh time for better UX
            });
        } else {
          // If no onRefresh callback, just simulate a refresh
          setTimeout(() => {
            setIsRefreshing(false);
          }, 1500);
        }
      } else {
        // Not enough pull, reset
        setPullDistance(0);
      }
      
      setIsPulling(false);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, pullDistance, onRefresh]);

  return (
    <Box ref={containerRef} sx={{ position: 'relative', height: '100%', overflow: 'visible' }}>
      {/* Pull indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '70px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transform: `translateY(${isPulling ? -70 + pullDistance : -70}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease',
          zIndex: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderBottomLeftRadius: '16px',
          borderBottomRightRadius: '16px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        {isRefreshing ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={24} thickness={4} sx={{ mr: 1 }} />
            <Typography variant="body2">Refreshing...</Typography>
          </Box>
        ) : (
          <Typography variant="body2">
            {pullDistance >= thresholdToRefresh ? 'Release to refresh' : 'Pull down to refresh'}
          </Typography>
        )}
      </Box>

      {/* Content container */}
      <Box
        sx={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease',
          height: '100%',
          animation: isRefreshing 
            ? 'none'
            : isPulling 
              ? 'none'
              : pullDistance > 0 
                ? `${releaseAnimation} 0.3s ease forwards`
                : 'none',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default PullToRefresh;
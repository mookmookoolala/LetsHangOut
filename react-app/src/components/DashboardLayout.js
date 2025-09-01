import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupsIcon from '@mui/icons-material/Groups';
import TaskIcon from '@mui/icons-material/Task';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PersonIcon from '@mui/icons-material/Person';
import Avatar from '@mui/material/Avatar';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

const drawerWidth = 240;

const navLinks = [
  { name: 'Dashboard', icon: <DashboardIcon />, to: '/' },
  { name: 'Calendar', icon: <CalendarMonthIcon />, to: '/calendar' },
  { name: 'Groups', icon: <GroupsIcon />, to: '/groups' },
  { name: 'Tasks', icon: <TaskIcon />, to: '/tasks' },
  { name: 'Budget', icon: <AccountBalanceWalletIcon />, to: '/budget' },
  { name: 'Profile', icon: <PersonIcon />, to: '/profile' },
];

export default function DashboardLayout({ children, members, onLogout }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar sx={{ justifyContent: 'center', mb: 3 }}>
        <Box
          component="img"
          src="https://letshangout.s3.us-east-1.amazonaws.com/icons/LHO8-removebg-preview+(1).png"
          alt="Letshangout Logo"
          sx={{ 
            width: 64, 
            height: 64, 
            borderRadius: '50%', 
            boxShadow: '0 8px 24px rgba(44, 100, 255, 0.15)', 
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 12px 30px rgba(44, 100, 255, 0.2)',
            } 
          }}
          onClick={() => navigate('/')}
        />
      </Toolbar>
      <Divider />
      <List sx={{ px: 1 }}>
        {navLinks.map((link) => {
          const isActive = location.pathname === link.to || 
            (link.to !== '/' && location.pathname.startsWith(link.to));
          return (
            <ListItem key={link.name} disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                component={Link} 
                to={link.to}
                selected={isActive}
                sx={{ 
                  borderRadius: 2,
                  py: 1.2,
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon sx={{ 
                  color: isActive ? 'primary.main' : 'text.secondary',
                  minWidth: 40 
                }}>
                  {link.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={link.name} 
                  primaryTypographyProps={{ 
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.95rem'
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      {/* Group Members Section */}
      {Array.isArray(members) && members.length > 0 && (
        <Box sx={{ px: 2, py: 2, textAlign: 'center', mt: 2 }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 700, 
              color: 'primary.main', 
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              '&::before, &::after': {
                content: '""',
                height: '1px',
                flex: 1,
                background: 'rgba(44, 100, 255, 0.1)',
              }
            }}
          >
            GROUP MEMBERS
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 1.5, 
            alignItems: 'center',
            mt: 1,
          }}>
            {members.map((m) => (
              <Box 
                key={m.id} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5, 
                  mb: 0.5,
                  width: '100%',
                  p: 1,
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(44, 100, 255, 0.04)',
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 36, 
                    height: 36, 
                    fontSize: 16, 
                    bgcolor: 'primary.main', 
                    boxShadow: '0 2px 8px rgba(44, 100, 255, 0.2)' 
                  }} 
                  src={m.picture || undefined}
                >
                  {m.username ? m.username[0].toUpperCase() : '?'}
                </Avatar>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600,
                    color: 'text.primary',
                    flex: 1,
                    textAlign: 'left',
                  }}
                >
                  {m.username}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={onLogout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: { sm: 'none' },
              background: 'none',
              borderRadius: 8,
              boxShadow: 'none',
              p: 1.2,
              minWidth: 40,
              minHeight: 40,
              width: 'auto',
              height: 'auto',
              '&:hover': {
                background: 'rgba(44,108,255,0.08)',
                boxShadow: '0 2px 8px rgba(44,100,255,0.08)',
              },
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h5"
            noWrap
            component="div"
            sx={{
              fontWeight: 800,
              letterSpacing: 1,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              background: 'linear-gradient(90deg, #2a6cff 0%, #6c47ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 1px 8px #f5f7fa',
            }}
          >
            Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          pb: { xs: isMobile ? 8 : 2, sm: 3 }, // Add bottom padding for mobile navigation
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: 'grey.100',
          minHeight: '100vh',
          overflowX: 'hidden',
        }}
      >
        <Toolbar />
        <Box 
          className={isMobile ? 'mobile-fade-in' : ''}
          sx={{
            maxWidth: '100%',
            mx: 'auto',
            '& > *': {
              mb: { xs: 2, sm: 3 }
            }
          }}
        >
          {children}
        </Box>
      </Box>
      
      {/* Mobile Floating Action Button */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            zIndex: 1000,
            width: 56,
            height: 56,
            boxShadow: '0 4px 20px rgba(42, 108, 255, 0.3)',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0 6px 25px rgba(42, 108, 255, 0.4)',
            },
            transition: 'all 0.2s ease',
          }}
          onClick={() => {
            // Quick action menu - can be customized based on current page
            const currentPath = location.pathname;
            if (currentPath === '/tasks') {
              navigate('/add-task');
            } else if (currentPath === '/budget') {
              navigate('/add-expense');
            } else if (currentPath === '/calendar') {
              navigate('/propose-date');
            } else {
              // Default action
              navigate('/create-group');
            }
          }}
        >
          <AddIcon />
        </Fab>
      )}
      
      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            bgcolor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          }}
        >
          <BottomNavigation
            value={location.pathname}
            onChange={(event, newValue) => {
              navigate(newValue);
            }}
            showLabels
            sx={{
              '& .MuiBottomNavigationAction-root': {
                minWidth: 'auto',
                py: 1,
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              },
            }}
          >
            <BottomNavigationAction
              label="Dashboard"
              value="/"
              icon={<DashboardIcon />}
            />
            <BottomNavigationAction
              label="Calendar"
              value="/calendar"
              icon={<CalendarMonthIcon />}
            />
            <BottomNavigationAction
              label="Tasks"
              value="/tasks"
              icon={<TaskIcon />}
            />
            <BottomNavigationAction
              label="Budget"
              value="/budget"
              icon={<AccountBalanceWalletIcon />}
            />
            <BottomNavigationAction
              label="Profile"
              value="/profile"
              icon={<PersonIcon />}
            />
          </BottomNavigation>
        </Box>
      )}
    </Box>
  );
}
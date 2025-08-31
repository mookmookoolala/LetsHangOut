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
import { Link, useNavigate } from 'react-router-dom';

const drawerWidth = 220;

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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar sx={{ justifyContent: 'center', mb: 2 }}>
        <Box
          component="img"
          src="https://letshangout.s3.us-east-1.amazonaws.com/icons/LHO8-removebg-preview+(1).png"
          alt="Letshangout Logo"
          sx={{ width: 56, height: 56, borderRadius: '50%', boxShadow: 2, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        />
      </Toolbar>
      <Divider />
      <List>
        {navLinks.map((link) => (
          <ListItem key={link.name} disablePadding>
            <ListItemButton component={Link} to={link.to}>
              <ListItemIcon>{link.icon}</ListItemIcon>
              <ListItemText primary={link.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      {/* Group Members Section */}
      {Array.isArray(members) && members.length > 0 && (
        <Box sx={{ px: 2, py: 1, textAlign: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1 }}>
            Group Members
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
            {members.map((m) => (
              <Box key={m.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Avatar sx={{ width: 28, height: 28, fontSize: 15, bgcolor: '#1976d2', mr: 1 }} src={m.picture || undefined}>
                  {m.username ? m.username[0].toUpperCase() : '?'}
                </Avatar>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
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
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: 'grey.100',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
} 
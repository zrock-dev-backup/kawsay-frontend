import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  AppBar,
  Box,
  Container,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import ErrorBoundary from "./common/ErrorBoundary.tsx";
import {
  StyledDrawer,
  StyledListItemButton,
  StyledListItemIcon,
} from "./Layout.styles";

const globalNavItems = [
  {
    text: "Dashboard",
    icon: <DashboardIcon />,
    path: "/selection",
  },
  {
    text: "Faculty Directory",
    icon: <GroupIcon />,
    path: "/faculty",
  },
  {
    text: "Student Enrollment",
    icon: <HowToRegIcon />,
    path: "/enrollment/1",
  },
];

const Layout: React.FC = () => {
  return (
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        {/* Persistent Sidebar */}
        <StyledDrawer variant="permanent" anchor="left">
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              Kawsay
            </Typography>
          </Toolbar>
          <List>
            {globalNavItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <StyledListItemButton
                      component={NavLink}
                      to={item.path}
                      end={item.path === "/selection"}
                  >
                    <StyledListItemIcon>{item.icon}</StyledListItemIcon>
                    <ListItemText primary={item.text} />
                  </StyledListItemButton>
                </ListItem>
            ))}
          </List>
        </StyledDrawer>

        <Box component="main" sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <AppBar position="static" sx={{ backgroundColor: "background.paper", boxShadow: 'none', borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'text.primary' }}>
              </Typography>
            </Toolbar>
          </AppBar>

          <Container maxWidth={false} sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </Container>

          <Box
              component="footer"
              sx={{
                p: 2,
                mt: "auto",
                backgroundColor: "background.default",
                borderTop: (theme) => `1px solid ${theme.palette.divider}`
              }}
          >
            <Typography variant="body2" color="text.secondary" align="center">
              {new Date().getFullYear()}
              {"."}
            </Typography>
          </Box>
        </Box>
      </Box>
  );
};

export default Layout;
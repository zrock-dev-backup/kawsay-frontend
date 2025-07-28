import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ErrorBoundary from "./common/ErrorBoundary.tsx";
import {
  StyledDrawer,
  StyledListItemButton,
  StyledListItemIcon,
} from "./Layout.styles";
import { DetailsDrawer } from "./common/DetailsDrawer.tsx";
import { useDetailsDrawerStore } from "../stores/useDetailsDrawerStore.ts";
import { useThemeContext } from "../contexts/ThemeContext.tsx";
import UserMenu from "./common/UserMenu.tsx";

const globalNavItems = [
  {
    text: "Dashboard",
    icon: <DashboardIcon />,
    path: "/selection",
  },
  {
    text: "Faculty Roster",
    icon: <GroupIcon />,
    path: "/faculty",
  },
  {
    text: "Student Enrollment",
    icon: <HowToRegIcon />,
    path: "/enrollment/1", // TODO: be dynamic
  },
];

const Layout: React.FC = () => {
  const { isOpen, title, content, closeDrawer } = useDetailsDrawerStore();
  const location = useLocation();
  const { mode, toggleColorMode } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [open, setOpen] = useState(() => {
    const storedValue = localStorage.getItem("drawerOpen");
    return storedValue ? JSON.parse(storedValue) : true;
  });

  const handleDrawerClose = () => setOpen(false);
  const handleDrawerToggle = () => setOpen(!open);

  useEffect(() => {
    localStorage.setItem("drawerOpen", JSON.stringify(open));
  }, [open]);

  useEffect(() => {
    if (isMobile) {
      handleDrawerClose();
    }
  }, [location.pathname, isMobile]);

  useEffect(() => {
    closeDrawer();
  }, [location.pathname, closeDrawer]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "background.paper",
          boxShadow: "none",
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, color: "text.primary" }}
          >
            Kawsay
          </Typography>
          <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
            {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <UserMenu/>
        </Toolbar>
      </AppBar>

      <StyledDrawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={handleDrawerClose}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Toolbar sx={{ justifyContent: open ? "flex-start" : "center" }}>
            <Typography variant="h6" noWrap component="div">
              {open ? "Kawsay" : "K"}
            </Typography>
          </Toolbar>

          <Box sx={{ flexGrow: 1, overflowY: "auto", overflowX: "hidden" }}>
            <List>
              {globalNavItems.map((item) => (
                <ListItem
                  key={item.text}
                  disablePadding
                  sx={{ display: "block" }}
                >
                  <StyledListItemButton
                    component={NavLink}
                    to={item.path}
                    end={item.path === "/selection"}
                    open={open}
                    title={item.text}
                  >
                    <StyledListItemIcon open={open}>
                      {item.icon}
                    </StyledListItemIcon>
                    {open && <ListItemText primary={item.text} />}
                  </StyledListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>

          <Box>
            <Divider />
            <List>
              <ListItem disablePadding sx={{ display: "block" }}>
                <StyledListItemButton onClick={handleDrawerToggle} open={open}>
                  <StyledListItemIcon open={open}>
                    {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                  </StyledListItemIcon>
                  {open && <ListItemText primary="Collapse" />}
                </StyledListItemButton>
              </ListItem>
            </List>
          </Box>
        </Box>
      </StyledDrawer>

      <Box
        component="main"
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        <Toolbar />
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
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            {new Date().getFullYear()}
            {"."}
          </Typography>
        </Box>
      </Box>

      <DetailsDrawer open={isOpen} onClose={closeDrawer} title={title}>
        {content}
      </DetailsDrawer>
    </Box>
  );
};

export default Layout;

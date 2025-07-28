import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useAuth } from "../../contexts/AuthContext";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";

const UserMenu: React.FC = () => {
  // Destructure all relevant values from the context
  const { userProfile, currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    handleClose();
    try {
      await signOut(auth);
      navigate("/sign-in");
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  // 1. While the auth state is being resolved, show a loading indicator.
  if (loading) {
    return <CircularProgress size={24} color="inherit" sx={{ mx: 1 }} />;
  }

  // 2. If not loading and there is no user, show the Sign In button.
  if (!currentUser) {
    return (
      <Button color="inherit" onClick={() => navigate("/sign-in")}>
        Sign In
      </Button>
    );
  }

  // 3. If we have a user and their profile, show the full menu.
  if (userProfile) {
    return (
      <>
        <Tooltip title="Account settings">
          <IconButton onClick={handleClick} size="small" sx={{ ml: 2 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
              {userProfile.name.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          // ... (rest of the Menu props are unchanged)
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography fontWeight="bold">{userProfile.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {userProfile.email}
            </Typography>
          </Box>
          <MenuItem onClick={handleProfile}>
            <PersonIcon sx={{ mr: 1 }} />
            Profile
          </MenuItem>
          <MenuItem onClick={handleSignOut}>
            <LogoutIcon sx={{ mr: 1 }} />
            Sign Out
          </MenuItem>
        </Menu>
      </>
    );
  }

  // 4. Fallback: User is authenticated, but profile doesn't exist.
  // This is a graceful way to handle the data inconsistency.
  return (
    <Tooltip title="Profile not found. Click to sign out.">
      <IconButton onClick={handleSignOut} size="small" sx={{ ml: 2 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: "error.main" }}>
          <PersonIcon fontSize="small" />
        </Avatar>
      </IconButton>
    </Tooltip>
  );
};

export default UserMenu;

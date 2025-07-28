import React from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import LogoutIcon from "@mui/icons-material/Logout";

const ProfilePage: React.FC = () => {
  const { userProfile, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/sign-in");
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  if (!userProfile || !currentUser) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">
          Could not load user profile. Please try signing in again.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        <Box sx={{ p: { xs: 2, sm: 4 } }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                fontSize: "2rem",
                bgcolor: "primary.main",
              }}
            >
              {userProfile.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                {userProfile.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {userProfile.email}
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ mb: 2, color: "text.primary" }}>
            Account Information
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>User ID:</strong> {userProfile.uid}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Authentication Providers:</strong>
          </Typography>
          <Stack spacing={1} sx={{ pl: 2 }}>
            {currentUser.providerData.map((provider) => (
              <Typography
                key={provider.providerId}
                sx={{
                  py: 0.5,
                  px: 1.5,
                  bgcolor: "action.hover",
                  borderRadius: 1,
                  display: "inline-block",
                  width: "fit-content",
                }}
              >
                {provider.providerId === 'password' ? 'Email & Password' : provider.providerId}
              </Typography>
            ))}
          </Stack>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-start' }}>
            <Button
              color="error"
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage;

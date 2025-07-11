import { styled, Box, IconButton } from "@mui/material";

export const DrawerHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(1, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

export const DrawerContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  overflowY: "auto",
}));

export const CloseButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

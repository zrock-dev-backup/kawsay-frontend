// src/components/Layout.styles.ts
import {
  styled,
  Drawer as MuiDrawer,
  ListItemButton as MuiListItemButton,
  ListItemIcon as MuiListItemIcon,
  alpha,
} from "@mui/material";

const drawerWidth = 240;

export const StyledDrawer = styled(MuiDrawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: drawerWidth,
    boxSizing: "border-box",
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

export const StyledListItemButton = styled(MuiListItemButton)(({ theme }) => ({
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(1.5),
  paddingLeft: theme.spacing(3),
  color: theme.palette.text.secondary,
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
  // Styles for the active NavLink
  "&.Mui-selected": {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    borderLeft: `3px solid ${theme.palette.primary.main}`,
    color: theme.palette.primary.main,
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.main,
    },
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.15),
    },
  },
}));

export const StyledListItemIcon = styled(MuiListItemIcon)({
  minWidth: "40px",
  color: "inherit", // Inherits color from the parent ListItemButton
});

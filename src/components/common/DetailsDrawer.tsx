import React from "react";
import { Drawer, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  CloseButton,
  DrawerContent,
  DrawerHeader,
} from "./DetailsDrawer.styles";

interface DetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const DetailsDrawer: React.FC<DetailsDrawerProps> = ({
  open,
  onClose,
  title,
  children,
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 400, md: 450 },
          boxShadow: 3,
        },
      }}
    >
      <DrawerHeader>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        <CloseButton onClick={onClose} aria-label="close details panel">
          <CloseIcon />
        </CloseButton>
      </DrawerHeader>
      <DrawerContent>{children}</DrawerContent>
    </Drawer>
  );
};

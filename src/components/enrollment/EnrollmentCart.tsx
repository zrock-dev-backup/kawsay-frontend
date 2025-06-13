import React from "react";
import {
  Box,
  Button,
  List,
  ListItem,
  IconButton,
  ListItemText,
  Typography,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import type { CartItem } from "../../hooks/enrollment/useStudentEnrollment";

interface Props {
  cartItems: CartItem[];
  onRemove: (classId: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const EnrollmentCart: React.FC<Props> = ({
  cartItems,
  onRemove,
  onSubmit,
  isSubmitting,
}) => {

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <List sx={{ flexGrow: 1, overflowY: "auto" }}>
        {cartItems.map((item) => (
          <ListItem
            key={item.id}
            secondaryAction={
              <IconButton edge="end" onClick={() => onRemove(item.id)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={item.courseCode}
              secondary={item.teacherName || "N/A"}
            />
          </ListItem>
        ))}
      </List>
      {cartItems.length === 0 && (
        <Typography color="text.secondary" align="center">
          Cart is empty.
        </Typography>
      )}
      <Box sx={{ mt: "auto", p: 1 }}>
        <Typography
          variant="caption"
          gutterBottom
        >
          {` Enrolled (${cartItems.length}/3)`}
        </Typography>
        <Button
          variant="contained"
          fullWidth
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <CircularProgress size={24} />
          ) : (
            "Confirm Enrollments"
          )}
        </Button>
      </Box>
    </Box>
  );
};
export default EnrollmentCart;

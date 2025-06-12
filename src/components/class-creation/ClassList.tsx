import React from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import type { Class } from "../../interfaces/classDtos";

interface ClassListProps {
  classes: Class[];
  isLoading: boolean;
  error: string | null;
  selectedClassId: number | null;
  onSelectClass: (id: number | null) => void;
  onDeleteClass: (id: number) => void;
}

export const ClassList: React.FC<ClassListProps> = ({
  classes,
  isLoading,
  error,
  selectedClassId,
  onSelectClass,
  onDeleteClass,
}) => {
  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => onSelectClass(null)}
        fullWidth
        sx={{ mb: 2 }}
      >
        New Class
      </Button>
      <Divider />
      <List dense sx={{ maxHeight: "60vh", overflowY: "auto" }}>
        {classes.map((cls) => (
          <ListItem
            key={cls.id}
            secondaryAction={
              <>
                <Tooltip title="Edit">
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => onSelectClass(cls.id)}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => onDeleteClass(cls.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            }
            disablePadding
          >
            <ListItemButton
              selected={selectedClassId === cls.id}
              onClick={() => onSelectClass(cls.id)}
            >
              <ListItemText
                primary={`${cls.courseName} (${cls.courseCode})`}
                secondary={`Teacher: ${cls.teacherName || "N/A"}`}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ClassList;

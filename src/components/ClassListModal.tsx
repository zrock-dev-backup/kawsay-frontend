import React from "react";
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Modal,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { Class as ApiClass } from "../interfaces/classDtos";

interface ClassListModalProps {
  open: boolean;
  onClose: () => void;
  classes: ApiClass[];
  onClassSelect: (classId: number) => void;
  timetableName?: string;
}

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "95%", sm: 600, md: 700 },
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  maxHeight: "90vh",
  display: "flex",
  flexDirection: "column",
};

const ClassListModal: React.FC<ClassListModalProps> = ({
  open,
  onClose,
  classes,
  onClassSelect,
  timetableName,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="class-list-modal-title"
    >
      <Box sx={modalStyle}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            flexShrink: 0,
          }}
        >
          <Typography id="class-list-modal-title" variant="h6" component="h2">
            Classes List {timetableName ? `for ${timetableName}` : ""}
          </Typography>
          <IconButton onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2, flexShrink: 0 }} />
        <Box sx={{ overflowY: "auto", flexGrow: 1 }}>
          <List dense>
            {classes.map((cls) => (
              <ListItem key={cls.id} disablePadding>
                <ListItemButton onClick={() => onClassSelect(cls.id)}>
                  <ListItemText
                    primary={`${cls.courseName} (${cls.courseCode})`}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          display="block"
                        >
                          Teacher: {cls.teacherName || "Not Assigned"}
                        </Typography>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          display="block"
                        >
                          Length: {cls.length} period
                          {cls.length !== 1 ? "s" : ""} | Frequency:{" "}
                          {cls.frequency}
                        </Typography>
                      </>
                    }
                    secondaryTypographyProps={{ component: "div" }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Modal>
  );
};

export default ClassListModal;

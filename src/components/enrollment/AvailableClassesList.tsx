// src/components/enrollment/AvailableClassesList.tsx
import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import type { AvailableClassDto } from "../../interfaces/classDtos.ts";

interface Props {
  classes: AvailableClassDto[];
  onAddToCart: (cls: AvailableClassDto) => void;
  cartIds: Set<number>;
}

const AvailableClassesList: React.FC<Props> = ({
  classes,
  onAddToCart,
  cartIds,
}) => {
  return (
    <List dense>
      {classes.map((cls) => (
        <ListItem
          key={cls.id}
          secondaryAction={
            <Tooltip
              title={cls.isEligible ? "Add to cart" : cls.ineligibilityReason}
            >
              <span>
                <IconButton
                  edge="end"
                  disabled={!cls.isEligible || cartIds.has(cls.id)}
                  onClick={() => onAddToCart(cls)}
                >
                  <AddShoppingCartIcon />
                </IconButton>
              </span>
            </Tooltip>
          }
        >
          <ListItemText
            primary={`${cls.courseName} (${cls.courseCode})`}
            secondary={`Teacher: ${cls.teacherName || "N/A"} | Capacity: ${cls.currentEnrollment}/${cls.capacity}`}
          />
          {cls.isRetake && <Chip label="Retake" color="warning" size="small" />}
        </ListItem>
      ))}
    </List>
  );
};
export default AvailableClassesList;

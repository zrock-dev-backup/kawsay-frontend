import { Box, Chip, Paper, styled } from "@mui/material";

export const GridContainer = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "60px repeat(7, 1fr)",
  border: "1px solid",
  borderColor: theme.palette.divider,
  backgroundColor: theme.palette.background.paper,
  minWidth: "800px",
  overflow: "hidden",
  position: "relative",
}));

const GridCell = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  borderLeft: `1px solid ${theme.palette.divider}`,
  "&:nth-of-type(8n + 2)": {
    borderLeft: "none",
  },
}));

export const DayHeaderCell = styled(GridCell)<{ isactive: "true" | "false" }>(
  ({ theme, isactive }) => ({
    textAlign: "center",
    backgroundColor:
      isactive === "true" ? theme.palette.grey[100] : theme.palette.grey[50],
    color:
      isactive === "true"
        ? theme.palette.text.primary
        : theme.palette.text.disabled,
    "&:first-of-type": {
      borderLeft: `1px solid ${theme.palette.divider}`,
    },
  }),
);

export const TimeLabelCell = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  textAlign: "right",
  borderRight: `1px solid ${theme.palette.divider}`,
  borderTop: `1px solid ${theme.palette.divider}`,
  position: "relative",
}));

export const BackgroundCell = styled(Box)(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.divider}`,
  borderLeft: `1px solid ${theme.palette.divider}`,
}));

export const SingleEventPaper = styled(Paper)(({ theme }) => ({
  margin: "2px",
  padding: theme.spacing(0.5, 1),
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  cursor: "pointer",
  overflow: "hidden",
  zIndex: 1,
  display: "flex",
  flexDirection: "column",
  height: "calc(100% - 4px)",
  transition: theme.transitions.create(["background-color", "box-shadow"], {
    duration: theme.transitions.duration.short,
  }),
  "&:hover": {
    backgroundColor: theme.palette.primary.main,
    boxShadow: theme.shadows[3],
  },
}));

export const EventStack = styled(Box)(({ theme }) => ({
  zIndex: 1,
  padding: "2px",
  display: "flex",
  flexDirection: "column",
  gap: "2px",
  overflowY: "auto",
  height: "100%",
}));

export const EventChip = styled(Chip)(({ theme }) => ({
  width: "calc(100% - 2px)",
  cursor: "pointer",
  backgroundColor: theme.palette.secondary.light,
  color: theme.palette.secondary.contrastText,
  justifyContent: "flex-start",
  "& .MuiChip-label": {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  "&:hover": {
    backgroundColor: theme.palette.secondary.main,
  },
}));

export const TopLeftCell = styled(Box)(({ theme }) => ({
  borderRight: `1px solid ${theme.palette.divider}`,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

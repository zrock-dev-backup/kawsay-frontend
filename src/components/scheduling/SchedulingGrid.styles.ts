import { Box, Paper, styled } from "@mui/material";

export const GridContainer = styled(Box)({
  display: "grid",
  border: "1px solid",
  borderColor: "divider",
  backgroundColor: "background.paper",
  minWidth: "800px",
  position: "relative",
});

export const SlotOverlay = styled(Box, {
  shouldForwardProp: (prop) => prop !== "status",
})<{ status: "ideal" | "viable" }>(({ theme, status }) => ({
  position: "absolute",
  top: 2,
  left: 2,
  right: 2,
  bottom: 2,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "2px",
  cursor: "pointer",
  backgroundColor:
    status === "ideal" ? "rgba(76, 175, 80, 0.2)" : "rgba(255, 193, 7, 0.2)",
  border: "1px dashed",
  borderColor:
    status === "ideal"
      ? theme.palette.success.main
      : theme.palette.warning.main,
  "&:hover": {
    backgroundColor:
      status === "ideal" ? "rgba(76, 175, 80, 0.4)" : "rgba(255, 193, 7, 0.4)",
  },
  color:
    status === "ideal"
      ? theme.palette.success.dark
      : theme.palette.warning.dark,
}));

export const StagedPlacementItem = styled(Paper)(({ theme }) => ({
  position: "absolute",
  padding: theme.spacing(0.5),
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  overflow: "hidden",
  zIndex: 2,
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
}));

import { Box, Paper, styled } from "@mui/material";

export const GridContainer = styled(Box)({
  display: "grid",
  border: "1px solid",
  borderColor: "divider",
  backgroundColor: "background.paper",
  width: "100%",
  position: "relative",
});

export const SlotOverlay = styled(Box, {
  shouldForwardProp: (prop) => prop !== "status",
})<{ status: "ideal" | "viable" }>(({ theme, status }) => ({
  position: "absolute",
  top: 1,
  left: 1,
  right: 1,
  bottom: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  borderRadius: `calc(${theme.shape.borderRadius}px - 2px)`,
  transition: `background-color ${theme.transitions.duration.shorter}ms ease-in-out`,
  ...(status === "ideal" && {
    backgroundColor: alpha(theme.palette.success.light, 0.4),
    color: theme.palette.success.dark,
    "&:hover": {
      backgroundColor: alpha(theme.palette.success.light, 0.6),
    },
  }),
  ...(status === "viable" && {
    backgroundColor: alpha(theme.palette.warning.light, 0.5),
    color: theme.palette.warning.dark,
    "&:hover": {
      backgroundColor: alpha(theme.palette.warning.light, 0.7),
    },
  }),
}));

export const StagedPlacementItem = styled(Paper)(({ theme }) => ({
  cursor: "pointer",
  padding: theme.spacing(0.5, 1),
  margin: "1px",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  transition: theme.transitions.create(["box-shadow", "transform"], {
    duration: theme.transitions.duration.short,
  }),
  "&:hover": {
    boxShadow: theme.shadows[4],
    transform: "translateY(-2px)",
  },
}));

function alpha(color: string, value: number) {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${value})`;
}

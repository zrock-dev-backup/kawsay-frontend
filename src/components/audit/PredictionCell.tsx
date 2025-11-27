import React from "react";
import { Box, Chip, Tooltip, Typography, LinearProgress } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import type { StudentPredictionDto } from "../../interfaces/predictionDtos";

interface Props {
  prediction?: StudentPredictionDto;
  isLoading: boolean;
}

export const PredictionCell: React.FC<Props> = ({ prediction, isLoading }) => {
  if (isLoading) {
    return <LinearProgress sx={{ width: "80px", borderRadius: 1 }} />;
  }

  if (!prediction) {
    return (
      <Typography variant="caption" color="text.disabled">
        Not Analyzed
      </Typography>
    );
  }

  const percentage = Math.round(prediction.confidence * 100);
  const isPass = prediction.predictedOutcome === "PASS";
  
  // Determinar color
  let color: "success" | "warning" | "error" = "success";
  if (!isPass) color = "error";
  else if (percentage < 70) color = "warning";

  const tooltipText = (
    <Box>
      <Typography variant="subtitle2" fontWeight="bold">
        Key Drivers (ML Generated):
      </Typography>
      <ul style={{ margin: "4px 0", paddingLeft: "16px" }}>
        {prediction.drivers.map((d, i) => (
          <li key={i}>{d}</li>
        ))}
      </ul>
    </Box>
  );

  return (
    <Tooltip title={tooltipText} arrow placement="top">
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Chip 
            icon={<AutoAwesomeIcon style={{fontSize: 12}} />} 
            label="ML" 
            size="small" 
            variant="outlined" 
            sx={{ height: 20, fontSize: '0.65rem', px: 0, '.MuiChip-label': { px: 1 } }} 
        />
        <Typography 
            variant="body2" 
            fontWeight="bold" 
            color={`${color}.main`}
        >
          {percentage}% {isPass ? 'Success' : 'Risk'}
        </Typography>
      </Box>
    </Tooltip>
  );
};
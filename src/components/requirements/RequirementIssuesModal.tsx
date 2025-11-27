import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useRequirementIssues } from "../../hooks/useRequirementIssues";
import { fetchBatchPredictions } from "../../services/predictionApi";
import type { StudentPredictionDto } from "../../interfaces/predictionDtos";
import { PredictionCell } from "../audit/PredictionCell";

interface Props {
  open: boolean;
  onClose: () => void;
  requirementId: number | null;
  requirementName?: string;
}

export const RequirementIssuesModal: React.FC<Props> = ({
  open,
  onClose,
  requirementId,
  requirementName,
}) => {
  const { issues, isLoading, error } = useRequirementIssues(requirementId);

  // 2. Estado local para manejar las predicciones dentro del modal
  const [predictions, setPredictions] = useState<Record<number, StudentPredictionDto>>({});
  const [isPredicting, setIsPredicting] = useState(false);

  // 3. Efecto para ejecutar la predicción automáticamente cuando llegan los issues
  useEffect(() => {
    const loadPredictions = async () => {
      if (issues.length === 0) return;

      setIsPredicting(true);
      
      // MOCK DATA GENERATOR: 
      // Como el endpoint requiere notas y el endpoint de issues no las trae,
      // generamos datos simulados igual que en useStudentAudit para que funcione la demo.
      const inputs = issues.map((issue) => ({
        studentId: issue.studentId,
        courseId: requirementId || 0, 
        semester: 5,
        gradeLab: Math.floor(Math.random() * 40) + 60, 
        gradeMasterclass: Math.floor(Math.random() * 40) + 60
      }));

      try {
        const results = await fetchBatchPredictions(inputs);
        const predictionMap: Record<number, StudentPredictionDto> = {};
        results.forEach((p) => {
          predictionMap[p.studentId] = p;
        });
        setPredictions(predictionMap);
      } catch (err) {
        console.error("Failed to load predictions in modal", err);
      } finally {
        setIsPredicting(false);
      }
    };

    if (!isLoading && issues.length > 0) {
      loadPredictions();
    }
  }, [issues, isLoading, requirementId]);

  // Limpiar estado al cerrar/cambiar
  useEffect(() => {
    if (!open) {
        setPredictions({});
    }
  }, [open]);

return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Eligibility Issues for: {requirementName || "Requirement"}
      </DialogTitle>
      <DialogContent>
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {!isLoading && !error && (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Issue Type</TableCell>
                  <TableCell>Details</TableCell>
                  {/* 4. Nueva cabecera */}
                  <TableCell sx={{ width: 180 }}>ML Prediction</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {issues.map((issue) => (
                  <TableRow key={issue.studentId}>
                    <TableCell>{issue.studentName}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="error">
                        {issue.issueType}
                      </Typography>
                    </TableCell>
                    <TableCell>{issue.details}</TableCell>
                    {/* 5. Renderizado de la celda de predicción */}
                    <TableCell>
                        <PredictionCell 
                            prediction={predictions[issue.studentId]} 
                            isLoading={isPredicting} 
                        />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

import React, { useState } from "react";
import { Button, Paper, Stack, Typography, Box } from "@mui/material";
import { useCsvImporter } from "../../hooks/useCsvImporter";
import { CsvImportDialog } from "../common/CsvImportDialog";
import { bulkImportStructure } from "../../services/academicStructureApi";
import type {
  BulkStructureRequestItem,
  StructureBulkImportResultDto,
} from "../../interfaces/bulkImportDtos";

interface Props {
  timetableId: string;
  onImportComplete: () => void;
}

export const AcademicStructureImporter: React.FC<Props> = ({
  timetableId,
  onImportComplete,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importResult, setImportResult] =
    useState<StructureBulkImportResultDto | null>(null);

  const importer = useCsvImporter<BulkStructureRequestItem>();

  const handleImport = () => {
    importer.actions.processImport(async (parsedData) => {
      setIsSubmitting(true);
      setImportResult(null);
      try {
        const result = await bulkImportStructure(timetableId, parsedData);
        setImportResult(result);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  const handleCloseDialog = () => {
    if (importResult && importResult.failedCount === 0) {
      onImportComplete();
    }
    setIsDialogOpen(false);
    importer.actions.reset();
    setImportResult(null);
  };

  return (
    <>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography variant="h6">Bulk Import Roster</Typography>
            <Typography variant="body2" color="text.secondary">
              Define all cohorts, groups, and students from a single CSV file.
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => setIsDialogOpen(true)}
            sx={{ minWidth: "200px" }}
          >
            Import Roster
          </Button>
        </Stack>
      </Paper>
      <CsvImportDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        entityName="Academic Roster"
        templatePath="/templates/roster_template.csv"
        file={importer.state.file}
        isParsing={importer.state.isParsing}
        isSubmitting={isSubmitting}
        result={importResult}
        error={importer.state.error}
        onFileSelect={importer.actions.handleFileSelect}
        onProcessImport={handleImport}
      />
    </>
  );
};

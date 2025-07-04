import React, { useState } from "react";
import { Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import { CsvImportDialog } from "../../components/common/CsvImportDialog";
import { useCsvImporter } from "../../hooks/useCsvImporter";
import CourseRequirementsTab from "../CourseRequirementsTab";
import { useCourseRequirementStore } from "../../stores/useCourseRequirementStore";
import type {
  BulkRequirementRequestItem,
  CourseBulkImportResultDto,
} from "../../interfaces/bulkImportDtos";

interface Props {
  timetableId: string;
}

const CourseRequirementsWizardStep: React.FC<Props> = ({ timetableId }) => {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importResult, setImportResult] =
    useState<CourseBulkImportResultDto | null>(null);

  const bulkAddRequirements = useCourseRequirementStore(
    (state) => state.bulkAddRequirements,
  );

  const importer = useCsvImporter<BulkRequirementRequestItem>();

  const handleImport = () => {
    importer.actions.processImport(async (parsedData) => {
      setIsSubmitting(true);
      setImportResult(null);
      try {

        const result = await bulkAddRequirements(parsedData);
        if (result) {

          setImportResult(result as unknown as CourseBulkImportResultDto);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  const handleCloseDialog = () => {
    setIsImportOpen(false);
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
            <Typography variant="h6">Bulk Import</Typography>
            <Typography variant="body2" color="text.secondary">
              Quickly add all module requirements by uploading a CSV file.
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => setIsImportOpen(true)}
            sx={{ minWidth: "200px" }}
          >
            Import from CSV
          </Button>
        </Stack>
      </Paper>

      <Divider sx={{ my: 3 }}>
        <Typography variant="overline">OR</Typography>
      </Divider>

      <CourseRequirementsTab timetableId={timetableId} />

      {/* --- Pass all props explicitly as required by the new contract --- */}
      <CsvImportDialog
        open={isImportOpen}
        onClose={handleCloseDialog}
        entityName="Course Requirements"
        templatePath="/templates/requirements_template.csv"
        file={importer.state.file}
        isParsing={importer.state.isParsing}
        isSubmitting={isSubmitting}
        result={importResult as any}
        error={importer.state.error}
        onFileSelect={importer.actions.handleFileSelect}
        onProcessImport={handleImport}
      />
    </>
  );
};

export default CourseRequirementsWizardStep;

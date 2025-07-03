import React, { useState } from "react";
import { Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import { CsvImportDialog } from "../../components/common/CsvImportDialog";
import { useCsvImporter } from "../../hooks/useCsvImporter";
import CourseRequirementsTab from "../CourseRequirementsTab";

interface Props {
  timetableId: string;
}

const CourseRequirementsWizardStep: React.FC<Props> = ({ timetableId }) => {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const importer = useCsvImporter();

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
      <CsvImportDialog
        open={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        importer={importer}
        entityName="Course Requirements"
        templatePath="/templates/requirements_template.csv"
      />
    </>
  );
};

export default CourseRequirementsWizardStep;

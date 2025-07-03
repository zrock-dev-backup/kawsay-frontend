import { useState } from "react";
import Papa from "papaparse";
import type {
  BulkImportResultDto,
  BulkRequirementRequestItem,
} from "../interfaces/bulkImportDtos";
import { useCourseRequirementStore } from "../stores/useCourseRequirementStore";

interface ProgressState {
  processed: number;
  total: number;
}

export function useCsvImporter() {
  const { bulkAddRequirements, isBulkImporting } = useCourseRequirementStore();

  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [result, setResult] = useState<BulkImportResultDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    setResult(null);
    setError(null);
    setProgress(null);
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(null);
  };

  const processImport = () => {
    if (!file) {
      setError("Please select a file to import.");
      return;
    }

    setIsParsing(true);
    setResult(null);
    setError(null);

    Papa.parse(file, {
      worker: true,
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true, // Automatically convert numbers
      complete: async (results) => {
        setIsParsing(false);
        const parsedData = results.data as BulkRequirementRequestItem[];

        if (!parsedData || parsedData.length === 0) {
          setError("CSV file is empty or could not be parsed.");
          return;
        }

        const importResult = await bulkAddRequirements(parsedData);
        if (importResult) {
          setResult(importResult);
        } else {
          setError("An unexpected error occurred during the import process.");
        }
      },
      error: (err) => {
        setIsParsing(false);
        setError(`CSV Parsing Error: ${err.message}`);
      },
    });
  };

  return {
    state: {
      file,
      isParsing,
      isSubmitting: isBulkImporting,
      progress,
      result,
      error,
    },
    actions: {
      handleFileSelect,
      processImport,
      reset,
    },
  };
}

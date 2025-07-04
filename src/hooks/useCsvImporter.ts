import { useState } from "react";
import Papa from "papaparse";

interface ProgressState {
  processed: number;
  total: number;
}

export function useCsvImporter<TRequestItem>() {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    setError(null);
    setProgress(null);
  };

  const reset = () => {
    setFile(null);
    setError(null);
    setProgress(null);
  };

  const processImport = (onComplete: (data: TRequestItem[]) => void): void => {
    if (!file) {
      setError("Please select a file to import.");
      return;
    }

    setIsParsing(true);
    setError(null);

    Papa.parse(file, {
      worker: true,
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        setIsParsing(false);
        const parsedData = results.data as TRequestItem[];

        if (!parsedData || parsedData.length === 0) {
          setError("CSV file is empty or could not be parsed.");
          return;
        }
        onComplete(parsedData);
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
      progress,
      error,
    },
    actions: {
      handleFileSelect,
      processImport,
      reset,
    },
  };
}

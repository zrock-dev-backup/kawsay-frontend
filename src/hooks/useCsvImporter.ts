import { useState } from "react";
import Papa from "papaparse";

interface ImportConfig {
  endpoint: string;
}

interface ImportResult {
  processedCount: number;
  failedCount: number;
  errors: { csvRow: number; studentId?: number; error: string }[];
}

interface ProgressState {
  processed: number;
  total: number;
}

export function useCsvImporter(config: ImportConfig) {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
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

    const data: Record<string, unknown>[] = [];
    Papa.parse(file, {
      worker: true,
      header: true,
      skipEmptyLines: true,
      chunk: (results, parser) => {
        setProgress({ processed: results.meta.cursor, total: file.size });
        data.push(...(results.data as Record<string, unknown>[]));
      },
      complete: async () => {
        setIsParsing(false);
        setIsSubmitting(true);
        try {
          const response = await fetch(config.endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error("A network error occurred during the import.");
          }

          const responseData = (await response.json()) as ImportResult;
          setResult(responseData);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "An unknown error occurred.",
          );
        } finally {
          setIsSubmitting(false);
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
      isSubmitting,
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

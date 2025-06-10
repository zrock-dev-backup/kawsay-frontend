import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ingestGrades, getModuleCohorts } from '../../services/apiService';
import type { StudentCohortDto, GradeIngestionDto } from '../../interfaces/apiDataTypes';

// A simple utility to parse CSV data from the textarea
const parseCsvData = (csvText: string): GradeIngestionDto[] => {
    return csvText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .map(line => {
            const [studentId, courseId, gradeValue] = line.split(',');
            return {
                studentId: parseInt(studentId, 10),
                courseId: parseInt(courseId, 10),
                gradeValue: parseFloat(gradeValue),
            };
        })
        .filter(dto => !isNaN(dto.studentId) && !isNaN(dto.courseId) && !isNaN(dto.gradeValue));
};

export function useEndofModule() {
    const { timetableId } = useParams<{ timetableId: string }>();

    // State for the grade ingestion form
    const [csvData, setCsvData] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ingestionError, setIngestionError] = useState<string | null>(null);
    const [ingestionSuccess, setIngestionSuccess] = useState<string | null>(null);

    // State for the cohort display
    const [cohorts, setCohorts] = useState<StudentCohortDto | null>(null);
    const [isLoadingCohorts, setIsLoadingCohorts] = useState(false);

    // Callback for handling the grade ingestion submission
    const handleIngestGrades = useCallback(async () => {
        if (!timetableId) {
            setIngestionError('Timetable ID is missing from the URL.');
            return;
        }

        const parsedData = parseCsvData(csvData);
        if (parsedData.length === 0) {
            setIngestionError('No valid grade data could be parsed from the input.');
            return;
        }

        setIsSubmitting(true);
        setIngestionError(null);
        setIngestionSuccess(null);

        try {
            const result = await ingestGrades(timetableId, parsedData);
            setIngestionSuccess(result.message);
            setCsvData(''); // Clear the form on success

            // After successful ingestion, automatically fetch the cohorts
            setIsLoadingCohorts(true);
            const cohortData = await getModuleCohorts(timetableId);
            setCohorts(cohortData);
            setIsLoadingCohorts(false);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setIngestionError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }, [csvData, timetableId]);

    // Return all the state and callbacks needed by the UI
    return {
        // Properties for GradeIngestionForm
        csvData,
        onCsvDataChange: setCsvData,
        handleIngestGrades,
        isSubmitting,
        ingestionError,
        ingestionSuccess,

        // Properties for CohortDisplay
        cohorts,
        isLoadingCohorts,
    };
}

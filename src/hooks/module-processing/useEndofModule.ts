import {useState, useCallback} from 'react';
import {useParams} from 'react-router-dom';
import {ingestGrades, getModuleCohorts} from '../../services/apiService';
import type {StudentCohortDto, GradeIngestionDto} from '../../interfaces/apiDataTypes';

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
    const {timetableId} = useParams<{ timetableId: string }>();

    // grade ingestion
    const [csvData, setCsvData] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ingestionError, setIngestionError] = useState<string | null>(null);
    const [ingestionSuccess, setIngestionSuccess] = useState<string | null>(null);

    // Cohort display
    const [cohorts, setCohorts] = useState<StudentCohortDto | null>(null);
    const [isLoadingCohorts, setIsLoadingCohorts] = useState(false);

    // Bulk actions
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStatus, setProcessingStatus] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    // Dialog
    const [dialogConfig, setDialogConfig] = useState<{
        open: boolean;
        title: string;
        description: string;
        onConfirm: () => void;
    } | null>(null);

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

    const closeDialog = () => setDialogConfig(null);

    const handleBulkAdvance = useCallback(() => {
        if (!cohorts?.advancingStudents || cohorts.advancingStudents.length === 0) return;

        setDialogConfig({
            open: true,
            title: 'Confirm Bulk Advancement',
            description: `Are you sure you want to advance ${cohorts.advancingStudents.length} students to their next courses? This action cannot be easily undone.`,
            onConfirm: async () => {
                setIsProcessing(true);
                setProcessingStatus(null);
                try {
                    const studentIds = cohorts.advancingStudents.map(s => s.id);
                    await bulkAdvanceStudents({timetableId: Number(timetableId), studentIds});
                    setProcessingStatus({ type: 'success', message: response.message });
                } catch (err) {
                    setProcessingStatus({ type: 'error', message: err instanceof Error ? err.message : 'An unknown error occurred.' });
                } finally {
                    setIsProcessing(false);
                    closeDialog();
                }
            }
        });
    }, [cohorts, timetableId]);

    const handleBulkRetake = useCallback(() => {
        if (!cohorts?.retakeStudents || cohorts.retakeStudents.length === 0) return;

        setDialogConfig({
            open: true,
            title: 'Confirm Retake Enrollment',
            description: `Are you sure you want to process the retake enrollment for ${cohorts.retakeStudents.length} students?`,
            onConfirm: async () => {
                setIsProcessing(true);
                setProcessingError(null);
                try {
                    const studentIds = cohorts.retakeStudents.map(s => s.id);
                    await bulkEnrollRetakes({timetableId: Number(timetableId), studentIds});
                } catch (err) {
                    setProcessingError(err instanceof Error ? err.message : 'An unknown error occurred.');
                } finally {
                    setIsProcessing(false);
                    closeDialog();
                }
            }
        });
    }, [cohorts, timetableId]);

    return {
        // GradeIngestionForm
        csvData,
        onCsvDataChange: setCsvData,
        handleIngestGrades,
        isSubmitting,
        ingestionError,
        ingestionSuccess,

        // CohortDisplay
        cohorts,
        isLoadingCohorts,
        handleBulkAdvance,
        handleBulkRetake,
        processingStatus,

        // ConfirmationDialog
        dialogConfig,
        isProcessing,
        closeDialog,
    };
}

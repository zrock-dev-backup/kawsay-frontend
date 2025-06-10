import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { CreateClassRequest } from '../../interfaces/apiDataTypes.ts';
import { createClass } from '../../services/apiService.ts';
import { useClassFormData } from './useClassFormData.ts';

const periodPreferenceSchema = yup.object().shape({
    dayId: yup.number().required(),
    startPeriodId: yup.number().required(),
});

type CreateClassRequestInternal = Omit<CreateClassRequest, 'timetableId'>;

const schema: yup.ObjectSchema<CreateClassRequestInternal> = yup.object().shape({
    courseId: yup.number().required('Course is required').typeError('Course is required'),
    teacherId: yup.number().required('Teacher is required').typeError('Teacher must be a number'),
    length: yup.number().required('Length is required').positive('Length must be positive').typeError('Length must be a number'),
    frequency: yup.number().required('Frequency is required').positive('Frequency must be positive').typeError('Frequency must be a number'),
    periodPreferences: yup.array().of(periodPreferenceSchema)
        .min(1, 'At least one Period preference is required')
        .required('Period preferences are required'),
});

export function useClassCreationForm(timetableId: string | undefined) {
    const { timetableStructure, courses, teachers, sortedPeriods, loading, fetchError } = useClassFormData(timetableId);

    const {
        control,
        register,
        handleSubmit,
        watch,
        formState: { errors },
        reset,
    } = useForm<CreateClassRequestInternal>({
        resolver: yupResolver(schema),
        defaultValues: {
            courseId: -1,
            teacherId: -1,
            length: 1,
            frequency: 1,
            periodPreferences: [],
        },
        mode: 'onBlur',
    });

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const onSubmit: SubmitHandler<CreateClassRequestInternal> = async (data) => {
        if (!timetableId) {
            setSubmitStatus({ type: 'error', message: 'Timetable ID is missing.' });
            return;
        }
        setSubmitStatus(null);
        setIsSubmitting(true);
        try {
            const payload: CreateClassRequest = { ...data, timetableId: Number(timetableId) };
            const result = await createClass(payload);
            setSubmitStatus({
                type: 'success',
                message: `Class "${result.courseDto.name}" created successfully! (ID: ${result.id})`
            });
            reset();
        } catch (err) {
            const apiErrorMessage = err instanceof Error ? err.message : 'Failed to create class.';
            setSubmitStatus({ type: 'error', message: `Submission Error: ${apiErrorMessage}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        // Form methods and state
        control,
        register,
        handleSubmit,
        watch,
        errors,
        isSubmitting,

        // Data and loading states from the consumed hook
        timetableStructure,
        courses,
        teachers,
        sortedPeriods,
        loading,
        fetchError,

        // Submission state and handler
        submitStatus,
        onSubmit,
    };
}

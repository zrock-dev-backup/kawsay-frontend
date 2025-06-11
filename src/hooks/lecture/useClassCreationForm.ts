import {useEffect, useState} from 'react';
import {SubmitHandler, useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type {ClassType, CreateClassRequest} from '../../interfaces/classDtos';
import {createClass} from '../../services/apiService';

const periodPreferenceSchema = yup.object().shape({
    dayId: yup.number().required(),
    startPeriodId: yup.number().required(),
});

const schema = yup.object().shape({
    courseId: yup.number().min(1, 'Course is required').required('Course is required'),
    teacherId: yup.number().min(1, 'A teacher is required').required('A teacher is required'),
    length: yup.number().required('Length is required').positive('Length must be positive').integer(),
    frequency: yup.number().required('Frequency is required').positive('Frequency must be positive').integer(),
    classType: yup.string<ClassType>().oneOf(['Masterclass', 'Lab']).required('Class Type is required'),
    studentGroupId: yup.number().when('classType', {
        is: 'Masterclass',
        then: (schema) => schema.min(1, 'A Student Group must be selected for a Masterclass.'),
        otherwise: (schema) => schema.notRequired(),
    }),
    sectionId: yup.number().when('classType', {
        is: 'Lab',
        then: (schema) => schema.min(1, 'A Section must be selected for a Lab.'),
        otherwise: (schema) => schema.notRequired(),
    }),
    periodPreferences: yup.array().of(periodPreferenceSchema)
        .min(1, 'At least one Period preference is required')
        .required('Period preferences are required'),
});

export function useClassCreationForm(timetableId: string | undefined) {
    const {
        control,
        register,
        handleSubmit,
        watch,
        setValue,
        formState: {errors},
        reset,
    } = useForm<CreateClassRequest>({
        resolver: yupResolver(schema),
        defaultValues: {
            courseId: -1,
            teacherId: -1,
            length: 1,
            frequency: 1,
            classType: 'Masterclass',
            studentGroupId: -1,
            sectionId: -1,
            periodPreferences: [],
        },
        mode: 'onBlur',
    });

    const classType = watch('classType');

    useEffect(() => {
        if (classType === 'Masterclass') {
            setValue('sectionId', -1);
        } else if (classType === 'Lab') {
            setValue('studentGroupId', -1);
        }
    }, [classType, setValue]);


    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const onSubmit: SubmitHandler<CreateClassRequest> = async (data) => {
        if (!timetableId) {
            setSubmitStatus({type: 'error', message: 'Timetable ID is missing.'});
            return;
        }
        setSubmitStatus(null);
        setIsSubmitting(true);

        const payload: CreateClassRequest = {
            ...data,
            timetableId: Number(timetableId),
            studentGroupId: data.classType === 'Masterclass' ? data.studentGroupId : undefined,
            sectionId: data.classType === 'Lab' ? data.sectionId : undefined,
        };

        try {
            const result = await createClass(payload);
            setSubmitStatus({
                type: 'success',
                message: `Class "${result.courseDto.name}" created successfully! (ID: ${result.id})`
            });
            reset();
        } catch (err) {
            const apiErrorMessage = err instanceof Error ? err.message : 'Failed to create class.';
            setSubmitStatus({type: 'error', message: `Submission Error: ${apiErrorMessage}`});
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        control,
        register,
        handleSubmit,
        watch,
        errors,
        isSubmitting,
        submitStatus,
        onSubmit,
    };
}

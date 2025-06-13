// src/hooks/enrollment/useStudentEnrollment.ts
import { useState, useCallback, useEffect, useMemo } from "react";
import type { StudentDto } from "../../interfaces/apiDataTypes.ts";
import type { AvailableClassDto } from "../../interfaces/classDtos.ts";
import {
  fetchStudents,
  fetchAvailableClassesForStudent,
} from "../../services/studentApi.ts";
import { enrollStudent } from "../../services/enrollmentApi.ts";

export interface CartItem extends AvailableClassDto {
  // May add more properties later, e.g., validation status
}

export function useStudentEnrollment(timetableId: number) {
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentDto | null>(
    null,
  );
  const [availableClasses, setAvailableClasses] = useState<AvailableClassDto[]>(
    [],
  );
  const [cart, setCart] = useState<CartItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const studentData = await fetchStudents();
        setStudents(studentData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load students.",
        );
      } finally {
        setIsLoading(false);
      }
    };
    loadStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      const loadClasses = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const classData = await fetchAvailableClassesForStudent(
            selectedStudent.id,
            timetableId,
          );
          setAvailableClasses(classData);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load classes for student.",
          );
        } finally {
          setIsLoading(false);
        }
      };
      loadClasses();
      setCart([]); // Clear cart when student changes
    } else {
      setAvailableClasses([]);
      setCart([]);
    }
  }, [selectedStudent, timetableId]);

  const handleSelectStudent = useCallback((student: StudentDto | null) => {
    setSelectedStudent(student);
  }, []);

  const addToCart = useCallback((classToAdd: AvailableClassDto) => {
    setCart((prev) => [...prev, classToAdd]);
  }, []);

  const removeFromCart = useCallback((classId: number) => {
    setCart((prev) => prev.filter((item) => item.id !== classId));
  }, []);

  const sortedAvailableClasses = useMemo(() => {
    return [...availableClasses].sort((a, b) => {
      if (a.isRetake && !b.isRetake) return -1;
      if (!a.isRetake && b.isRetake) return 1;
      return a.courseName.localeCompare(b.courseName);
    });
  }, [availableClasses]);

  const handleSubmitEnrollments = async () => {
    if (!selectedStudent || cart.length === 0) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    const promises = cart.map((item) =>
      enrollStudent({
        studentId: selectedStudent.id,
        classId: item.id,
        force: false,
      }),
    );

    try {
      await Promise.all(promises);
      setSubmitStatus({
        type: "success",
        message: `Successfully enrolled ${selectedStudent.name} in ${cart.length} classes.`,
      });
      setCart([]);
      // Optionally re-fetch available classes to update their status
      const classData = await fetchAvailableClassesForStudent(
        selectedStudent.id,
        timetableId,
      );
      setAvailableClasses(classData);
    } catch (err) {
      setSubmitStatus({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "An error occurred during enrollment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    state: {
      students,
      selectedStudent,
      availableClasses: sortedAvailableClasses,
      cart,
      isLoading,
      isSubmitting,
      error,
      submitStatus,
    },
    actions: {
      handleSelectStudent,
      addToCart,
      removeFromCart,
      handleSubmitEnrollments,
      setSubmitStatus,
    },
  };
}

import { useState, useCallback, useEffect } from "react";
import type { StudentDto } from "../../interfaces/studentDtos.ts";
import type { AvailableClassDto } from "../../interfaces/classDtos.ts";
import {
  fetchStudents,
  fetchAvailableClassesForStudent,
  fetchProposedEnrollmentsForStudent,
} from "../../services/studentApi.ts";
import { enrollStudent } from "../../services/enrollmentApi.ts";

export interface CartItem {
  id: number; // classId
  courseCode: string;
  courseName: string;
  teacherName: string | null;
  isProposal: boolean;
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
        const studentData = await fetchStudents(timetableId);
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
  }, [timetableId]);

  useEffect(() => {
    if (!selectedStudent) {
      setAvailableClasses([]);
      setCart([]);
      return;
    }

    const loadStudentData = async () => {
      setIsLoading(true);
      setError(null);
      setCart([]);

      const [classesResult, proposalsResult] = await Promise.allSettled([
        fetchAvailableClassesForStudent(selectedStudent.id, timetableId),
        fetchProposedEnrollmentsForStudent(selectedStudent.id),
      ]);

      if (classesResult.status === "fulfilled") {
        setAvailableClasses(classesResult.value);
      } else {
        console.error(
          "Failed to load available classes:",
          classesResult.reason,
        );
        setError("Failed to load available classes for the student.");
      }

      if (proposalsResult.status === "fulfilled") {
        const proposedCartItems: CartItem[] = proposalsResult.value.map(
          (p) => ({
            id: p.classId,
            courseCode: p.courseCode,
            courseName: p.courseName,
            teacherName: p.teacherName,
            isProposal: true,
          }),
        );
        setCart(proposedCartItems);
      } else {
        console.error(
          "Failed to load proposed enrollments:",
          proposalsResult.reason,
        );
      }

      setIsLoading(false);
    };

    loadStudentData();
  }, [selectedStudent, timetableId]);

  const handleSelectStudent = useCallback((student: StudentDto | null) => {
    setSelectedStudent(student);
  }, []);

  const addToCart = useCallback((classToAdd: AvailableClassDto) => {
    const newCartItem: CartItem = {
      id: classToAdd.id,
      courseCode: classToAdd.courseCode,
      courseName: classToAdd.courseName,
      teacherName: classToAdd.teacherName,
      isProposal: false,
    };
    setCart((prev) => [...prev, newCartItem]);
  }, []);

  const removeFromCart = useCallback((classId: number) => {
    setCart((prev) => prev.filter((item) => item.id !== classId));
  }, []);

  const handleSubmitCart = async () => {
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
      const [studentData, classData] = await Promise.all([
        fetchStudents(timetableId),
        fetchAvailableClassesForStudent(selectedStudent.id, timetableId),
      ]);
      setStudents(studentData);
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
      availableClasses,
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
      handleSubmitCart,
      setSubmitStatus,
    },
  };
}

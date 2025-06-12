import { useState, useCallback } from "react";
import { useTimetableData } from "./useTimetableData";
import { generateScheduleForTimetable } from "../../services/apiService";

export function useTimetableGridPage(timetableId: string | undefined) {
  const {
    structure,
    classes,
    loading,
    error,
    scheduleMap,
    sortedPeriods,
    refreshData,
  } = useTimetableData(timetableId);

  // State managed by the hook
  const [activeTab, setActiveTab] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateStatus, setGenerateStatus] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: number) => {
      setActiveTab(newValue);
    },
    [],
  );

  const handleGenerateClick = useCallback(async () => {
    if (!timetableId) return;
    setIsGenerating(true);
    setGenerateStatus(null);
    try {
      const result = await generateScheduleForTimetable(timetableId);
      setGenerateStatus({ type: "success", message: result.message });
      refreshData();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setGenerateStatus({
        type: "error",
        message: `Generation Error: ${errorMessage}`,
      });
    } finally {
      setIsGenerating(false);
    }
  }, [timetableId, refreshData]);

  const handleLessonClick = useCallback((classId: number) => {
    setSelectedClassId(classId);
    setIsDetailsModalOpen(true);
  }, []);

  const handleCloseDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false);
    setSelectedClassId(null);
  }, []);

  return {
    // Data from underlying hook
    structure,
    classes,
    loading,
    error,
    scheduleMap,
    sortedPeriods,

    // State managed by this hook
    pageState: {
      activeTab,
      isGenerating,
      generateStatus,
      isDetailsModalOpen,
      selectedClassId,
    },

    // Handlers exposed to the component
    handleTabChange,
    handleGenerateClick,
    handleLessonClick,
    handleCloseDetailsModal,
    setGenerateStatus, // Expose setter to allow clearing the alert
  };
}

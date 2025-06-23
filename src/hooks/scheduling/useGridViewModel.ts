import { useMemo } from "react";
import { useTimetableStore } from "../../stores/useTimetableStore";
import { useSchedulingStore } from "../../stores/useSchedulingStore";

export interface GridCellViewModel {
  key: string;
  type: "EMPTY" | "VALID_SLOT" | "STAGED_PLACEMENT";
  gridRow: number;
  gridColumn: number;
  rowSpan?: number;

  // Data for 'VALID_SLOT'
  status?: "ideal" | "viable";
  tooltip?: string;

  // Data for 'STAGED_PLACEMENT'
  courseCode?: string;
  courseName?: string;
  placementId?: number;

  onClick?: () => void;
}

export function useGridViewModel() {
  const { structure } = useTimetableStore();
  const { validSlots, stagedPlacements, stagePlacement, unstagePlacement } =
    useSchedulingStore();

  const dayIdToColIndex = useMemo(
    () => new Map(structure?.days.map((day, i) => [day.id, i + 2])),
    [structure?.days],
  );
  const periodIdToRowIndex = useMemo(() => {
    const sortedPeriods = [...(structure?.periods ?? [])].sort((a, b) =>
      a.start.localeCompare(b.start),
    );
    return new Map(sortedPeriods.map((p, i) => [p.id, i + 2]));
  }, [structure?.periods]);

  const gridCells = useMemo((): GridCellViewModel[] => {
    if (!structure) return [];

    const cells: GridCellViewModel[] = [];
    const placedSlots = new Set<string>();

    // Process and mark slots occupied by staged placements first
    stagedPlacements.forEach((placement) => {
      const startRow = periodIdToRowIndex.get(placement.startPeriodId);
      const col = dayIdToColIndex.get(placement.dayId);
      if (!startRow || !col) return;

      for (let i = 0; i < placement.length; i++) {
        placedSlots.add(`${col}_${startRow + i}`);
      }

      cells.push({
        key: `placement-${placement.id}`,
        type: "STAGED_PLACEMENT",
        gridColumn: col,
        gridRow: startRow,
        rowSpan: placement.length,
        courseCode: placement.courseCode,
        courseName: placement.courseName,
        placementId: placement.id,
        onClick: () => unstagePlacement(placement.id),
      });
    });

    // Process valid slots, but only if the cell is not already occupied
    validSlots.forEach((slot) => {
      const row = periodIdToRowIndex.get(slot.startPeriodId);
      const col = dayIdToColIndex.get(slot.dayId);
      if (!row || !col || placedSlots.has(`${col}_${row}`)) return;

      cells.push({
        key: `valid-${col}-${row}`,
        type: "VALID_SLOT",
        gridColumn: col,
        gridRow: row,
        status: slot.satisfaction.score === 100 ? "ideal" : "viable",
        tooltip: slot.satisfaction.details.map((d) => d.message).join(", "),
        onClick: () => stagePlacement(slot.dayId, slot.startPeriodId),
      });
    });

    return cells;
  }, [
    structure,
    validSlots,
    stagedPlacements,
    dayIdToColIndex,
    periodIdToRowIndex,
    stagePlacement,
    unstagePlacement,
  ]);

  return {
    gridCells,
    structure,
    sortedPeriods: useMemo(
      () =>
        [...(structure?.periods ?? [])].sort((a, b) =>
          a.start.localeCompare(b.start),
        ),
      [structure?.periods],
    ),
  };
}

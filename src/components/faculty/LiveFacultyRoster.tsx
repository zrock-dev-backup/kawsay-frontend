import React, { useMemo, useRef } from "react";
import { Box } from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridOptions, ModuleRegistry } from "ag-grid-community";
import { ClientSideRowModelModule } from "ag-grid-community";
import { themeQuartz } from "ag-grid-community";

import type { TeacherDto } from "../../interfaces/teacherDtos";
import { AvailabilitySparklineCellRenderer } from "./renderers/AvailabilitySparklineCellRenderer";
import { FacultyActionsCellRenderer } from "./renderers/FacultyActionsCellRenderer";
import { useRosterState } from "../../hooks/faculty/useRosterState";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface LiveFacultyRosterProps {
  teachers: TeacherDto[];
  isLoading: boolean;
  onEditProfile: (teacher: TeacherDto) => void;
}

export const LiveFacultyRoster: React.FC<LiveFacultyRosterProps> = ({
  teachers,
  isLoading,
  onEditProfile,
}) => {
  const gridRef = useRef<AgGridReact<TeacherDto>>(null);
  const { masterTimetable, allTimetables } = useRosterState();

  const columnDefs = useMemo((): ColDef<TeacherDto>[] => {
    const timetableColumns = allTimetables.map((tt) => ({
      headerName: `${tt.name} Availability`,
      flex: 1,
      minWidth: 140,
      cellRenderer: AvailabilitySparklineCellRenderer,
      cellRendererParams: {
        masterTimetable,
        activeTimetable: tt,
      },
    }));

    return [
      {
        field: "fullName",
        headerName: "Teacher",
        flex: 2,
        minWidth: 220,
        filter: true,
        floatingFilter: true,
        sortable: true,
      },
      {
        field: "employmentType",
        headerName: "Type",
        flex: 1,
        minWidth: 150,
        filter: true,
      },
      {
        headerName: "Default Availability",
        flex: 1,
        minWidth: 140,
        cellRenderer: AvailabilitySparklineCellRenderer,
        cellRendererParams: { masterTimetable },
      },
      ...timetableColumns,
      {
        headerName: "Actions",
        width: 100,
        pinned: "right",
        cellRenderer: FacultyActionsCellRenderer,
        cellRendererParams: { onEditProfile },
      },
    ];
  }, [masterTimetable, allTimetables, onEditProfile]);

  const gridOptions: GridOptions<TeacherDto> = {
    getRowId: (params) => params.data.id.toString(),
    rowHeight: 50,
    suppressCellFocus: true,
  };

  return (
    <Box sx={{ height: "65vh", width: "100%" }}>
      <AgGridReact<TeacherDto>
        ref={gridRef}
        theme={themeQuartz}
        rowData={teachers}
        columnDefs={columnDefs}
        gridOptions={gridOptions}
        onGridReady={(params) => {
          if (isLoading) params.api.showLoadingOverlay();
          else params.api.hideOverlay();
        }}
        loadingOverlayComponent={() => "Loading Faculty..."}
        noRowsOverlayComponent={() => "No faculty members found."}
      />
    </Box>
  );
};

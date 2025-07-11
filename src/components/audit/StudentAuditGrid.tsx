import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";

import {
  Box,
  Button,
  Chip,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { AgGridReact } from "ag-grid-react";

import {
  ColDef,
  IRowNode,
  SelectionChangedEvent,
  ModuleRegistry,
  ClientSideRowModelModule,
  RowClassRules,
  ValidationModule,
  RowSelectionModule,
  DateFilterModule,
  TextFilterModule,
  CellStyleModule,
  RowStyleModule,
} from "ag-grid-community";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ValidationModule,
  RowSelectionModule,
  DateFilterModule,
  TextFilterModule,
  CellStyleModule,
  RowStyleModule,
]);

import type { StudentAuditDto } from "../../interfaces/auditDtos";
import {
  AUDIT_STATUS_CONFIG,
  validateBulkEnrollment,
} from "../../utils/auditConfig";
import { StudentActionButton } from "./StudentActionButton";

interface Props {
  students: StudentAuditDto[];
  isLoading: boolean;
  isBulkActionLoading: boolean;
  resolvingStudentId: number | null;
  error?: string | null;
  density: "comfortable" | "compact";
  onResolveIssues: (studentId: number) => Promise<void>;
  onBulkConfirm: (studentIds: number[]) => Promise<void>;
  onClearError: () => void;
}

export const StudentAuditGrid: React.FC<Props> = ({
  students,
  isLoading,
  isBulkActionLoading,
  resolvingStudentId,
  error,
  density,
  onResolveIssues,
  onBulkConfirm,
  onClearError,
}) => {
  const gridRef = useRef<AgGridReact<StudentAuditDto>>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const theme = useTheme();

  const handleRowAction = useCallback(
    async (studentId: number) => {
      await onResolveIssues(studentId);
    },
    [onResolveIssues],
  );

  const rowClassRules: RowClassRules<StudentAuditDto> = useMemo(() => {
    return {
      "custom-row-even": (params) => (params.node.rowIndex ?? 0) % 2 === 0,
      "custom-row-odd": (params) => (params.node.rowIndex ?? 0) % 2 !== 0,
      "custom-row-selected": (params) => params.node.isSelected(),
    };
  }, []);

  const colDefs = useMemo(
    (): ColDef<StudentAuditDto>[] => [
      {
        headerName: "",
        checkboxSelection: true,
        headerCheckboxSelection: true,
        width: 60,
        pinned: "left",
      },
      {
        field: "studentName",
        headerName: "Student Name",
        flex: 1,
        minWidth: 200,
        filter: "agTextColumnFilter",
        cellStyle: {
          fontWeight: 500,
          color: theme.palette.text.primary,
        },
      },
      {
        field: "studentId",
        headerName: "Student ID",
        width: 120,
        cellStyle: {
          color: theme.palette.text.secondary,
          fontWeight: 400,
        },
      },
      {
        field: "studentGroupName",
        headerName: "Group",
        flex: 1,
        minWidth: 150,
        filter: "agTextColumnFilter",
        cellStyle: {
          color: theme.palette.text.secondary,
          fontWeight: 400,
        },
      },
      {
        field: "status",
        headerName: "Status",
        width: 180,
        cellRenderer: (params: { value: keyof typeof AUDIT_STATUS_CONFIG }) => {
          if (!params.value) return null;
          const config = AUDIT_STATUS_CONFIG[params.value];
          const IconComponent = config.icon;
          return (
            <Chip
              icon={<IconComponent fontSize="small" />}
              label={config.label}
              color={config.color}
              size="small"
              variant="outlined"
            />
          );
        },
      },
      {
        field: "lastUpdated",
        headerName: "Last Updated",
        width: 180,
        filter: "agDateColumnFilter",
        valueGetter: (params) =>
          params.data ? new Date(params.data.lastUpdated) : null,
        valueFormatter: (params) =>
          params.value ? params.value.toLocaleString() : "",
      },
      {
        headerName: "Actions",
        width: 150,
        sortable: false,
        filter: false,
        cellRenderer: (params: { data?: StudentAuditDto }) => {
          if (!params.data) return null;
          return (
            <StudentActionButton
              student={params.data}
              isLoading={resolvingStudentId === params.data.studentId}
              onAction={handleRowAction}
            />
          );
        },
      },
    ],
    [resolvingStudentId, handleRowAction, theme],
  );

  const onSelectionChanged = useCallback(
    (event: SelectionChangedEvent<StudentAuditDto>) => {
      const selectedNodes = event.api.getSelectedNodes();
      const ids = selectedNodes
        .map((node) => node.data?.studentId)
        .filter((id): id is number => !!id);
      setSelectedIds(ids);
    },
    [],
  );

  const handleBulkConfirmClick = useCallback(() => {
    const validationErrors = validateBulkEnrollment(selectedIds, students);
    if (validationErrors.length > 0) {
      console.error("Validation Errors:", validationErrors);
      return;
    }
    setConfirmDialogOpen(true);
  }, [selectedIds, students]);

  const handleConfirmBulkEnrollment = useCallback(async () => {
    try {
      await onBulkConfirm(selectedIds);
      gridRef.current?.api.deselectAll();
      setConfirmDialogOpen(false);
      setActionSuccess(
        `${selectedIds.length} student(s) successfully enrolled.`,
      );
    } catch (err) {
      console.error(err);
      setConfirmDialogOpen(false);
    }
  }, [selectedIds, onBulkConfirm]);

  useEffect(() => {
    if (gridRef.current?.api) {
      if (isLoading) {
        gridRef.current.api.showLoadingOverlay();
      } else if (students.length === 0) {
        gridRef.current.api.showNoRowsOverlay();
      } else {
        gridRef.current.api.hideOverlay();
      }
    }
  }, [isLoading, students]);

  const gridClassName =
    density === "compact" ? "ag-theme-quartz-compact" : "ag-theme-quartz";

  const gridStyles = useMemo(
    () => ({
      "& .ag-theme-quartz": {
        "--ag-row-height": density === "compact" ? "32px" : "40px",
      },
      "& .ag-theme-quartz-compact": {
        "--ag-row-height": "32px",
      },
      "& .custom-row-even": {
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.02)"
            : "rgba(0, 0, 0, 0.01)",
      },
      "& .custom-row-odd": {
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(0, 0, 0, 0.03)",
      },
      "& .custom-row-selected": {
        backgroundColor: `${theme.palette.primary.main}15 !important`,
        transition: "background-color 0.2s ease-in-out",
      },
      "& .ag-row:hover": {
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.08)"
            : "rgba(0, 0, 0, 0.04)",
      },
      "& .ag-row-selected:hover": {
        backgroundColor: `${theme.palette.primary.main}20 !important`,
      },
    }),
    [theme, density],
  );

  return (
    <Box
      sx={{
        height: "70vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        ...gridStyles,
      }}
    >
      {error && (
        <Alert severity="error" onClose={onClearError} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {students.filter((s) => s.status === "ReadyToEnroll").length} students
          ready to enroll
        </Typography>

        <Button
          variant="contained"
          onClick={handleBulkConfirmClick}
          disabled={selectedIds.length === 0 || isBulkActionLoading}
        >
          {isBulkActionLoading
            ? "Enrolling..."
            : `Confirm Enrollment (${selectedIds.length})`}
        </Button>
      </Box>

      <div className={gridClassName} style={{ flex: 1 }}>
        <AgGridReact<StudentAuditDto>
          ref={gridRef}
          rowData={students}
          columnDefs={colDefs}
          rowSelection="multiple"
          suppressRowClickSelection={true}
          onSelectionChanged={onSelectionChanged}
          getRowId={(params) => params.data.studentId.toString()}
          isRowSelectable={(node: IRowNode<StudentAuditDto>) =>
            node.data ? AUDIT_STATUS_CONFIG[node.data.status].selectable : false
          }
          rowClassRules={rowClassRules}
          suppressRowHoverHighlight={false}
        />
      </div>

      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirm Bulk Enrollment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to enroll {selectedIds.length} selected
            student(s)? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmBulkEnrollment}
            variant="contained"
            disabled={isBulkActionLoading}
          >
            Confirm Enrollment
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!actionSuccess}
        autoHideDuration={4000}
        onClose={() => setActionSuccess(null)}
        message={actionSuccess}
      />
    </Box>
  );
};

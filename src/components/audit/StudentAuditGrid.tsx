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

import { AgGridReact } from "ag-grid-react";

import {
  ColDef,
  IRowNode,
  SelectionChangedEvent,
  ModuleRegistry,
  ClientSideRowModelModule,
  ValidationModule,
  RowSelectionModule,
  DateFilterModule,
  TextFilterModule,
} from "ag-grid-community";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ValidationModule,
  RowSelectionModule,
  DateFilterModule,
  TextFilterModule,
]);

import { themeBalham } from "ag-grid-community";
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
  isResolveActionLoading: Record<number, boolean>;
  error: string | null;
  onResolveIssues: (studentId: number) => Promise<void>;
  onBulkConfirm: (studentIds: number[]) => Promise<void>;
  onClearError: () => void;
}

export const StudentAuditGrid: React.FC<Props> = ({
  students,
  isLoading,
  isBulkActionLoading,
  isResolveActionLoading,
  error,
  onResolveIssues,
  onBulkConfirm,
  onClearError,
}) => {
  const gridRef = useRef<AgGridReact<StudentAuditDto>>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleRowAction = useCallback(
    async (studentId: number) => {
      try {
        await onResolveIssues(studentId);
        setActionSuccess("Action completed successfully.");
      } catch (err) {
        console.error(err);
      }
    },
    [onResolveIssues],
  );

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
      },
      { field: "studentId", headerName: "Student ID", width: 120 },
      {
        field: "studentGroupName",
        headerName: "Group",
        flex: 1,
        minWidth: 150,
        filter: "agTextColumnFilter",
      },
      {
        field: "status",
        headerName: "Status",
        width: 180,
        cellRenderer: (params: { value: keyof typeof AUDIT_STATUS_CONFIG }) => {
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
              isLoading={isResolveActionLoading[params.data.studentId] || false}
              onAction={handleRowAction}
            />
          );
        },
      },
    ],
    [isResolveActionLoading, handleRowAction],
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

  return (
    <Box
      sx={{
        height: "70vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
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

      <div className="ag-theme-quartz" style={{ flex: 1 }}>
        <AgGridReact<StudentAuditDto>
          ref={gridRef}
          theme={themeBalham}
          rowData={students}
          columnDefs={colDefs}
          rowSelection="multiple"
          suppressRowClickSelection={true}
          onSelectionChanged={onSelectionChanged}
          getRowId={(params) => params.data.studentId.toString()}
          isRowSelectable={(node: IRowNode<StudentAuditDto>) =>
            node.data ? AUDIT_STATUS_CONFIG[node.data.status].selectable : false
          }
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

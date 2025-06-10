import { Box, Paper, styled } from '@mui/material';

export const GridContainer = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '60px repeat(7, 1fr)',
    // Dynamically set rows in the component itself if periodCount varies
    border: '1px solid',
    borderColor: theme.palette.divider,
    backgroundColor: theme.palette.background.paper,
    minWidth: '800px',
    overflow: 'hidden',
}));

// A generic styled box for grid cells (headers, time labels)
const GridCell = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderLeft: `1px solid ${theme.palette.divider}`,
    // Ensure the first column of cells has no left border
    '&:nth-of-type(8n + 2)': {
        borderLeft: 'none',
    }
}));

// day header cells styling
export const DayHeaderCell = styled(GridCell)<{ isactive: 'true' | 'false' }>(({ theme, isactive }) => ({
    textAlign: 'center',
    backgroundColor: isactive === 'true' ? theme.palette.grey[100] : theme.palette.grey[50],
    color: isactive === 'true' ? theme.palette.text.primary : theme.palette.text.disabled,
    // The first day header needs a left border
    '&:first-of-type': {
        borderLeft: `1px solid ${theme.palette.divider}`,
    }
}));

// first column time label cells styling
export const TimeLabelCell = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1),
    textAlign: 'right',
    borderRight: `1px solid ${theme.palette.divider}`,
    borderTop: `1px solid ${theme.palette.divider}`,
    position: 'relative',
}));

export const BackgroundCell = styled(Box)(({ theme }) => ({
    borderTop: `1px solid ${theme.palette.divider}`,
    borderLeft: `1px solid ${theme.palette.divider}`,
}));

// Styling for the event blocks themselves
export const EventPaper = styled(Paper)(({ theme }) => ({
    margin: '2px',
    padding: theme.spacing(1),
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    cursor: 'pointer',
    overflow: 'hidden',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    transition: theme.transitions.create(['background-color', 'box-shadow'], {
        duration: theme.transitions.duration.short,
    }),
    '&:hover': {
        backgroundColor: theme.palette.primary.main,
        boxShadow: theme.shadows[3],
    },
}));

// A small utility component for the top-left empty cell
export const TopLeftCell = styled(Box)(({ theme }) => ({
    borderRight: `1px solid ${theme.palette.divider}`,
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

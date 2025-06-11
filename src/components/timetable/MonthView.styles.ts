import {Box, Stack, styled, Typography} from '@mui/material';

// The main grid container for the month view
export const MonthGridContainer = styled(Box)(({theme}) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
}));

// Styling for the header cells (e.g., "Sun", "Mon")
export const MonthDayHeader = styled(Box)(({theme}) => ({
    padding: theme.spacing(1),
    textAlign: 'center',
    fontWeight: 'bold',
    backgroundColor: theme.palette.grey[100],
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderLeft: `1px solid ${theme.palette.divider}`,
    // Remove border for the very first header cell
    '&:first-of-type': {
        borderLeft: 'none',
    },
}));

// Styling for each individual day cell in the grid
export const DayCell = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'iscurrentmonth',
})<{ iscurrentmonth: 'true' | 'false' }>(({theme, iscurrentmonth}) => ({
    minHeight: '120px',
    padding: theme.spacing(0.5),
    borderTop: `1px solid ${theme.palette.divider}`,
    borderLeft: `1px solid ${theme.palette.divider}`,
    backgroundColor: iscurrentmonth === 'true' ? 'inherit' : theme.palette.grey[50],
    // Remove border for the first cell in each row
    '&:nth-of-type(7n + 1)': {
        borderLeft: 'none',
    },
}));

// Styling for the date number inside a day cell
export const DayNumber = styled(Typography, {
    shouldForwardProp: (prop) => prop !== 'iscurrentmonth',
})<{ iscurrentmonth: 'true' | 'false' }>(({theme, iscurrentmonth}) => ({
    fontWeight: 'bold',
    color: iscurrentmonth === 'true' ? theme.palette.text.primary : theme.palette.text.disabled,
    paddingLeft: theme.spacing(0.5),
}));

// Container for the event chips to manage overflow
export const ChipContainer = styled(Stack)({
    overflowY: 'auto',
    maxHeight: '85px',
    paddingRight: '4px',
});

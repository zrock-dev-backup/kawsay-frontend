import { Box, ButtonBase, ToggleButtonGroup, styled } from '@mui/material';

export const SlotPickerContainer = styled(Box)({
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: '4px',
    padding: '16px',
    backgroundColor: 'background.paper',
});

export const FilterContainer = styled(Box)({
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'center',
});

export const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
}));

export const Grid = styled(Box)({
    display: 'grid',
    gap: '4px',
    // gridTemplateColumns will be set dynamically
});

const CellBase = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(0.5),
    minHeight: '36px',
    textAlign: 'center',
}));

export const HeaderCell = styled(CellBase)(({ theme }) => ({
    fontWeight: 'bold',
    backgroundColor: theme.palette.grey[100],
    borderRadius: '2px',
}));

export const TimeLabelCell = styled(CellBase)(({ theme }) => ({
    fontWeight: 'bold',
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.grey[50],
    borderRadius: '2px',
}));

export const SlotButton = styled(ButtonBase, {
    shouldForwardProp: (prop) => prop !== 'isSelected',
})<{ isSelected: boolean }>(({ theme, isSelected }) => ({
    width: '100%',
    height: '100%',
    borderRadius: '2px',
    border: '1px solid',
    borderColor: isSelected ? theme.palette.primary.main : theme.palette.divider,
    backgroundColor: isSelected ? theme.palette.primary.light : 'transparent',
    color: isSelected ? theme.palette.primary.contrastText : theme.palette.text.primary,
    transition: theme.transitions.create(['background-color', 'border-color']),
    '&:hover': {
        backgroundColor: isSelected ? theme.palette.primary.main : theme.palette.action.hover,
    },
    '&:disabled': {
        backgroundColor: theme.palette.action.disabledBackground,
        color: theme.palette.action.disabled,
        borderColor: 'transparent',
        cursor: 'not-allowed',
    },
}));

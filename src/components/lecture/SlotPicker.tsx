import React, {useMemo, useState} from 'react';
import {Box, ToggleButton, Typography} from '@mui/material';
import dayjs from 'dayjs';
import type {TimetableDay, TimetablePeriod} from '../../interfaces/apiDataTypes.ts';
import {
    FilterContainer,
    Grid,
    HeaderCell,
    SlotButton,
    SlotPickerContainer,
    StyledToggleButtonGroup,
    TimeLabelCell,
} from './SlotPicker.styles.ts';

type TimeBlock = 'all' | 'morning' | 'afternoon' | 'evening';

interface SlotPickerProps {
    days: TimetableDay[];
    periods: TimetablePeriod[];
    value: { dayId: number; startPeriodId: number }[];
    onChange: (value: { dayId: number; startPeriodId: number }[]) => void;
    length: number;
}

const SlotPicker: React.FC<SlotPickerProps> = ({days, periods, value, onChange, length}) => {
    const [activeFilter, setActiveFilter] = useState<TimeBlock>('all');

    const handleFilterChange = (event: React.MouseEvent<HTMLElement>, newFilter: TimeBlock | null) => {
        if (newFilter !== null) {
            setActiveFilter(newFilter);
        }
    };

    const filteredPeriods = useMemo(() => {
        if (activeFilter === 'all') return periods;
        return periods.filter(p => {
            const startHour = dayjs(p.start, 'HH:mm').hour();
            if (activeFilter === 'morning') return startHour < 12;
            if (activeFilter === 'afternoon') return startHour >= 12 && startHour < 17;
            if (activeFilter === 'evening') return startHour >= 17;
            return true;
        });
    }, [periods, activeFilter]);

    const handleSlotClick = (dayId: number, periodId: number) => {
        const isSelected = value.some(slot => slot.dayId === dayId && slot.startPeriodId === periodId);
        let newValue;
        if (isSelected) {
            newValue = value.filter(slot => !(slot.dayId === dayId && slot.startPeriodId === periodId));
        } else {
            newValue = [...value, {dayId, startPeriodId: periodId}];
        }
        onChange(newValue);
    };

    const periodIdToIndexMap = useMemo(() => new Map(periods.map((p, i) => [p.id, i])), [periods]);

    return (
        <SlotPickerContainer>
            <FilterContainer>
                <StyledToggleButtonGroup
                    value={activeFilter}
                    exclusive
                    onChange={handleFilterChange}
                    aria-label="time block filter"
                >
                    <ToggleButton value="all" aria-label="all day">All</ToggleButton>
                    <ToggleButton value="morning" aria-label="morning">Morning</ToggleButton>
                    <ToggleButton value="afternoon" aria-label="afternoon">Afternoon</ToggleButton>
                    <ToggleButton value="evening" aria-label="evening">Evening</ToggleButton>
                </StyledToggleButtonGroup>
            </FilterContainer>

            <Grid sx={{gridTemplateColumns: `60px repeat(${days.length}, 1fr)`}}>
                {/* Top-left empty cell */}
                <Box/>
                {/* Day Headers */}
                {days.map(day => (
                    <HeaderCell key={day.id}>{day.name.substring(0, 3)}</HeaderCell>
                ))}

                {/* Time Labels and Slot Buttons */}
                {filteredPeriods.map(period => {
                    const periodIndex = periodIdToIndexMap.get(period.id) ?? -1;
                    const isSelectionDisabled = periodIndex + length > periods.length;

                    return (
                        <React.Fragment key={period.id}>
                            <TimeLabelCell>{period.start}</TimeLabelCell>
                            {days.map(day => {
                                const isSelected = value.some(
                                    slot => slot.dayId === day.id && slot.startPeriodId === period.id
                                );
                                return (
                                    <SlotButton
                                        key={`${day.id}-${period.id}`}
                                        isSelected={isSelected}
                                        disabled={isSelectionDisabled}
                                        onClick={() => handleSlotClick(day.id, period.id)}
                                        title={isSelectionDisabled ? `Cannot start a ${length}-period class here.` : `${day.name} at ${period.start}`}
                                    />
                                );
                            })}
                        </React.Fragment>
                    );
                })}
            </Grid>
            {filteredPeriods.length === 0 && (
                <Typography align="center" color="text.secondary" sx={{mt: 2}}>
                    No periods available in this time block.
                </Typography>
            )}
        </SlotPickerContainer>
    );
};

export default SlotPicker;

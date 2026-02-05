
const { parse, addMinutes, isBefore, isAfter, format, addHours } = require('date-fns');

function generateAvailableSlots(params) {
    const {
        date,
        timezone,
        startTime,
        endTime,
        breakStart,
        breakEnd,
        slotMinutes,
        durationMinutes,
        minNoticeHours = 12,
        existingBookings,
    } = params;

    console.log('--- Testing Parameters ---');
    console.log('Date:', date);
    console.log('Start:', startTime, 'End:', endTime);
    console.log('Duration:', durationMinutes, 'Slot:', slotMinutes);
    console.log('Notice Hours:', minNoticeHours);

    const availableSlots = [];

    const parseTime = (timeStr) => {
        return parse(`${date} ${timeStr}`, 'yyyy-MM-dd h:mm a', new Date());
    };

    const startOfDay = parseTime(startTime);
    const endOfDay = parseTime(endTime);
    const breakStartBtn = breakStart ? parseTime(breakStart) : null;
    const breakEndBtn = breakEnd ? parseTime(breakEnd) : null;

    const nowInNY = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
    const noticeLimit = addHours(nowInNY, minNoticeHours);

    console.log('Current Time (NY):', format(nowInNY, 'yyyy-MM-dd h:mm a'));
    console.log('Notice Limit:', format(noticeLimit, 'yyyy-MM-dd h:mm a'));

    let currentSlotStart = startOfDay;

    while (isBefore(currentSlotStart, endOfDay)) {
        const currentSlotEnd = addMinutes(currentSlotStart, durationMinutes);

        if (isAfter(currentSlotEnd, endOfDay)) {
            console.log(`Slot ${format(currentSlotStart, 'h:mm a')} rejected: Exceeds end of day`);
            break;
        }

        const isTooSoon = isBefore(currentSlotStart, noticeLimit);
        if (isTooSoon) {
            console.log(`Slot ${format(currentSlotStart, 'h:mm a')} rejected: Too soon (before notice limit)`);
        }

        let overlapsBreak = false;
        if (breakStartBtn && breakEndBtn) {
            overlapsBreak = isBefore(currentSlotStart, breakEndBtn) && isAfter(currentSlotEnd, breakStartBtn);
            if (overlapsBreak) console.log(`Slot ${format(currentSlotStart, 'h:mm a')} rejected: Overlaps break`);
        }

        let overlapsBooking = false;
        for (const booking of existingBookings) {
            const bStart = new Date(booking.start);
            const bEnd = new Date(booking.end);
            if (isBefore(currentSlotStart, bEnd) && isAfter(currentSlotEnd, bStart)) {
                overlapsBooking = true;
                console.log(`Slot ${format(currentSlotStart, 'h:mm a')} rejected: Overlaps booking`);
                break;
            }
        }

        if (!isTooSoon && !overlapsBreak && !overlapsBooking) {
            availableSlots.push(format(currentSlotStart, 'h:mm a'));
        }

        currentSlotStart = addMinutes(currentSlotStart, slotMinutes);
    }

    return availableSlots;
}

// SIMULATE TODAY
const today = '2026-02-05';
const slotsToday = generateAvailableSlots({
    date: today,
    timezone: 'America/New_York',
    startTime: '9:00 AM',
    endTime: '7:00 PM',
    slotMinutes: 120,
    durationMinutes: 120,
    minNoticeHours: 12,
    existingBookings: []
});
console.log('Available slots today:', slotsToday);

// SIMULATE TOMORROW
const tomorrow = '2026-02-06';
const slotsTomorrow = generateAvailableSlots({
    date: tomorrow,
    timezone: 'America/New_York',
    startTime: '9:00 AM',
    endTime: '7:00 PM',
    slotMinutes: 120,
    durationMinutes: 120,
    minNoticeHours: 12,
    existingBookings: []
});
console.log('Available slots tomorrow:', slotsTomorrow);

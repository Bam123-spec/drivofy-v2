
const { parse, addMinutes, isBefore, isAfter, format, addHours, parseISO } = require('date-fns');

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
        working_days
    } = params;

    const dayOfWeek = parseISO(date).getDay();
    if (!working_days.includes(dayOfWeek)) {
        return { error: 'Not a working day', dayOfWeek };
    }

    const availableSlots = [];
    const parseTime = (timeStr) => parse(`${date} ${timeStr}`, 'yyyy-MM-dd h:mm a', new Date());
    const startOfDay = parseTime(startTime);
    const endOfDay = parseTime(endTime);
    const noticeLimit = addHours(new Date(), minNoticeHours);

    let currentSlotStart = startOfDay;
    while (isBefore(currentSlotStart, endOfDay)) {
        const currentSlotEnd = addMinutes(currentSlotStart, durationMinutes);
        if (isAfter(currentSlotEnd, endOfDay)) break;
        if (!isBefore(currentSlotStart, noticeLimit)) {
            availableSlots.push(format(currentSlotStart, 'h:mm a'));
        }
        currentSlotStart = addMinutes(currentSlotStart, slotMinutes);
    }
    return { slots: availableSlots };
}

// TEST FOR FEB 10, 2026
const date = '2026-02-10';
const res = generateAvailableSlots({
    date,
    timezone: 'America/New_York',
    startTime: '8:00 AM',
    endTime: '4:00 PM',
    slotMinutes: 60,
    durationMinutes: 60,
    minNoticeHours: 0,
    existingBookings: [],
    working_days: [1, 2, 3, 4, 5]
});
console.log('Result for Feb 10:', res);

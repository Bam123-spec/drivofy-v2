-- Instructor Availability Slot Locking
-- Prevents double booking by tracking booked time slots

CREATE TABLE instructor_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('booked', 'blocked')),
    booking_id UUID REFERENCES driving_sessions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_instructor_availability_lookup 
ON instructor_availability(instructor_id, start_time, status);

COMMENT ON TABLE instructor_availability IS 'Tracks booked and blocked time slots for instructors';
COMMENT ON COLUMN instructor_availability.status IS 'booked = locked by a booking, blocked = manually blocked by admin';

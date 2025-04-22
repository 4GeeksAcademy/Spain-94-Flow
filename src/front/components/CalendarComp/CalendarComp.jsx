import React, { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import useGlobalReducer from "../../hooks/useGlobalReducer";

import "./CalendarComp.css"

const EventTooltip = ({ position, eventData, onClose }) => {
    const tooltipRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    if (!eventData) return null;

    const formatDateTime = (date) => {
        if (!date) return "No disponible";
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(date).toLocaleString(undefined, options);
    };

    const extractDetailsFields = () => {
        if (!eventData.description) return {};

        const fields = {};
        const lines = eventData.description.split('\n');

        lines.forEach(line => {
            if (line.trim() === '') return;

            const parts = line.split(':');
            if (parts.length > 1) {
                const key = parts[0].trim();
                const value = parts.slice(1).join(':').trim();
                fields[key.toLowerCase()] = { key, value };
            }
        });

        return fields;
    };

    const detailsFields = extractDetailsFields();

    const status = detailsFields.status?.value.toLowerCase() || 'default';

    const style = {
        left: `${position.x}px`,
        top: `${position.y}px`,
    };

    return (
        <div className={`event-tooltip status-${status}`} style={style} ref={tooltipRef}>
            <div className="event-tooltip-header">
                <h3>{eventData.title}</h3>
                <button className="tooltip-close-button" onClick={onClose}>×</button>
            </div>
            <div className="event-tooltip-content">
                <div className="event-time-info">
                    <div className="time-slot">
                        <i className="fas fa-clock"></i>
                        <span>{formatDateTime(eventData.start)}</span>
                    </div>
                    <div className="time-separator">-</div>
                    <div className="time-slot">
                        <span>{formatDateTime(eventData.end)}</span>
                    </div>
                </div>

                <div className="event-details-card">
                    {detailsFields.client && (
                        <div className="detail-item">
                            <div className="detail-icon">
                                <i className="fas fa-user"></i>
                            </div>
                            <div className="detail-content">
                                <label>Client:</label>
                                <span>{detailsFields.client.value}</span>
                            </div>
                        </div>
                    )}

                    {detailsFields.email && (
                        <div className="detail-item">
                            <div className="detail-icon">
                                <i className="fas fa-envelope"></i>
                            </div>
                            <div className="detail-content">
                                <label>Email:</label>
                                <span>{detailsFields.email.value}</span>
                            </div>
                        </div>
                    )}

                    {detailsFields.service && (
                        <div className="detail-item">
                            <div className="detail-icon">
                                <i className="fas fa-concierge-bell"></i>
                            </div>
                            <div className="detail-content">
                                <label>Service:</label>
                                <span>{detailsFields.service.value}</span>
                            </div>
                        </div>
                    )}

                    {detailsFields['attended by'] && (
                        <div className="detail-item">
                            <div className="detail-icon">
                                <i className="fas fa-user-md"></i>
                            </div>
                            <div className="detail-content">
                                <label>Attended by:</label>
                                <span>{detailsFields['attended by'].value}</span>
                            </div>
                        </div>
                    )}

                    {detailsFields.status && (
                        <div className={`detail-item status-item status-${status}`}>
                            <div className="detail-icon">
                                <i className="fas fa-info-circle"></i>
                            </div>
                            <div className="detail-content">
                                <label>Status:</label>
                                <span className="status-badge">{detailsFields.status.value}</span>
                            </div>
                        </div>
                    )}
                </div>

                {eventData.location && (
                    <div className="event-location">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{eventData.location}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export const CalendarComp = () => {
    const { store, dispatch } = useGlobalReducer();
    const {
        selectedBusiness,
        calendarEvents,
        calendarLoading,
        calendarError,
        syncStatus,
        token
    } = store;

    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [businesses, setBusinesses] = useState([]);
    const [selectedBusinessId, setSelectedBusinessId] = useState(selectedBusiness?.id || '');
    const [isBusinessLoading, setIsBusinessLoading] = useState(false);
    const [localSyncMessage, setLocalSyncMessage] = useState(null);

    const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

    useEffect(() => {

        if (syncStatus && syncStatus.message) {
            setLocalSyncMessage({
                message: syncStatus.message,
                success: syncStatus.success,
                count: syncStatus.count
            });

            const timer = setTimeout(() => {
                setLocalSyncMessage(null);
                // Also clear from global state
                dispatch({ type: "clear_sync_status" });
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [syncStatus, dispatch]);

    useEffect(() => {
        const fetchBusinesses = async () => {
            if (!token) return;

            setIsBusinessLoading(true);
            try {
                const response = await fetch(`${backendUrl}api/businesses`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Error loading businesses');
                }

                const data = await response.json();
                setBusinesses(data);

                // If no business is selected and we have businesses
                if (!selectedBusinessId && data.length > 0) {
                    setSelectedBusinessId(data[0].id.toString());
                    // Update global state if needed
                    if (!selectedBusiness) {
                        dispatch({
                            type: "selectBusiness",
                            payload: data[0]
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching businesses:', error);
            } finally {
                setIsBusinessLoading(false);
            }
        };

        fetchBusinesses();
    }, [token, backendUrl]);

    useEffect(() => {
        if (selectedBusiness && selectedBusiness.id) {
            setSelectedBusinessId(selectedBusiness.id.toString());
        }
    }, [selectedBusiness]);

    const fetchCalendarEvents = async (businessId = selectedBusinessId) => {
        try {
            dispatch({ type: "load_calendar_events_start" });

            const options = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };

            const businessFilter = businessId ? `?business_id=${businessId}` : '';
            const response = await fetch(`${backendUrl}calendar_api/calendar/events${businessFilter}`, options);

            if (!response.ok) {
                throw new Error('Error loading calendar events');
            }

            const data = await response.json();

            const formattedEvents = data.map(event => {
                let title = event.summary;
                if (title && title.startsWith("Appointment:")) {
                    title = title.substring("Appointment:".length).trim();
                }

                return {
                    id: event.id,
                    title: title,
                    start: event.start.dateTime || event.start.date,
                    end: event.end.dateTime || event.end.date,
                    description: event.description,
                    location: event.location,
                    extendedProps: {
                        googleEventId: event.id,
                        htmlLink: event.htmlLink,
                        businessId: event.extendedProperties?.private?.businessId || null,
                        serviceType: event.extendedProperties?.private?.serviceType || 'default'
                    }
                };
            });

            dispatch({
                type: "load_calendar_events_success",
                payload: formattedEvents
            });

        } catch (error) {
            console.error('Error fetching events:', error);
            dispatch({
                type: "load_calendar_event_error",
                payload: error.message
            });
        }
    };

    const syncGoogleCalendar = async () => {
        try {
            dispatch({ type: "sync_calendar_start" });
            setLocalSyncMessage(null);

            const options = {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            if (selectedBusinessId) {
                options.body = JSON.stringify({
                    business_id: parseInt(selectedBusinessId)
                });
            }

            const response = await fetch(`${backendUrl}calendar_api/calendar/sync`, options);

            if (!response.ok) {
                throw new Error("Error syncing with Google Calendar");
            }

            const data = await response.json();

            dispatch({
                type: "sync_calendar_success",
                payload: data
            });

            fetchCalendarEvents(selectedBusinessId);

        } catch (error) {
            console.error("Error syncing calendar:", error);
            dispatch({
                type: "sync_calendar_error",
                payload: error.message
            });
        }
    };

    useEffect(() => {
        if (selectedBusinessId) {
            fetchCalendarEvents(selectedBusinessId);
        }
    }, [selectedBusinessId]);

    const handleBusinessChange = (e) => {
        const newBusinessId = e.target.value;
        setSelectedBusinessId(newBusinessId);

        // Update global state
        if (newBusinessId) {
            const selectedBusiness = businesses.find(b => b.id.toString() === newBusinessId);
            if (selectedBusiness) {
                dispatch({
                    type: "selectBusiness",
                    payload: selectedBusiness
                });
            }
        }
    };

    const handleDateClick = (arg) => {
        console.log("Selected date:", arg.dateStr);
        setTooltipVisible(false);
    };

    const handleEventClick = (clickInfo) => {
        clickInfo.jsEvent.preventDefault();

        const x = clickInfo.jsEvent.pageX;
        const y = clickInfo.jsEvent.pageY;

        setSelectedEvent({
            id: clickInfo.event.id,
            title: clickInfo.event.title,
            start: clickInfo.event.start,
            end: clickInfo.event.end,
            description: clickInfo.event.extendedProps.description,
            location: clickInfo.event.extendedProps.location,
            extendedProps: clickInfo.event.extendedProps
        });

        setTooltipPosition({ x, y });
        setTooltipVisible(true);
    };

    const closeTooltip = () => {
        setTooltipVisible(false);
    };

    const eventDidMount = (info) => {
        const { event } = info;

        let status = 'default';
        if (event.extendedProps.description) {
            const lines = event.extendedProps.description.split('\n');
            for (const line of lines) {
                if (line.toLowerCase().startsWith('status:')) {
                    const statusValue = line.split(':')[1]?.trim().toLowerCase();
                    if (statusValue) {
                        status = statusValue;
                    }
                    break;
                }
            }
        }

        info.el.classList.add('modern-event');
        info.el.classList.add(`status-${status}`);
    };

    const renderEventContent = (eventInfo) => {
        let status = 'default';
        if (eventInfo.event.extendedProps.description) {
            const lines = eventInfo.event.extendedProps.description.split('\n');
            for (const line of lines) {
                if (line.toLowerCase().startsWith('status:')) {
                    const statusValue = line.split(':')[1]?.trim().toLowerCase();
                    if (statusValue) {
                        status = statusValue;
                    }
                    break;
                }
            }
        }

        return (
            <div className={`custom-event-content status-${status}`}>
                <div className="event-time">{eventInfo.timeText}</div>
                <div className="event-title-wrapper">
                    <div className="event-title">{eventInfo.event.title}</div>
                </div>
            </div>
        );
    };

    const selectedBusinessName = businesses.find(b => b.id.toString() === selectedBusinessId)?.name || "All Businesses";

    const dismissSyncMessage = () => {
        setLocalSyncMessage(null);
        dispatch({ type: "clear_sync_status" });
    };

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <div className="calendar-title-section">
                    <h1>Calendar</h1>

                    <div className="business-filter">
                        <label htmlFor="business-select">Business:</label>
                        <select
                            id="business-select"
                            value={selectedBusinessId}
                            onChange={handleBusinessChange}
                            disabled={isBusinessLoading || calendarLoading}
                            className="business-select"
                        >
                            <option value="">All Businesses</option>
                            {businesses.map(business => (
                                <option key={business.id} value={business.id.toString()}>
                                    {business.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="calendar-actions">
                    <button
                        className="sync-button"
                        onClick={syncGoogleCalendar}
                        disabled={syncStatus?.loading}
                    >
                        {syncStatus?.loading ? 'Synchronizing...' : 'Sync with Google Calendar'}
                    </button>

                    <button
                        className="refresh-button"
                        onClick={() => fetchCalendarEvents(selectedBusinessId)}
                        disabled={calendarLoading}
                    >
                        Update
                    </button>
                </div>
            </div>

            {calendarLoading && <div className="loading-indicator">Loading events...</div>}
            {calendarError && <div className="error-message">{calendarError}</div>}

            {localSyncMessage && (
                <div className={`sync-status ${localSyncMessage.success ? 'success' : 'error'}`}>
                    {localSyncMessage.message}
                    {localSyncMessage.count && ` (${localSyncMessage.count} synchronized appointments)`}
                    <button className="dismiss-sync-message" onClick={dismissSyncMessage}>×</button>
                </div>
            )}

            <div className="calendar-business-info">
                Currently viewing: <span className="business-name">{selectedBusinessName}</span>
            </div>

            <div className="calendar-wrapper">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    events={calendarEvents}
                    eventClick={handleEventClick}
                    eventDidMount={eventDidMount}
                    dateClick={handleDateClick}
                    editable={false}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    weekends={true}
                    height="auto"
                    locale="en"
                    eventContent={renderEventContent}
                    slotDuration="00:30:00"
                    slotMinTime="07:00:00"
                    slotMaxTime="20:00:00"
                    slotLabelInterval="01:00:00"
                    slotEventOverlap={false}
                    allDaySlot={false}
                    eventTimeFormat={{
                        hour: '2-digit',
                        minute: '2-digit',
                        meridiem: false
                    }}
                />
            </div>

            {tooltipVisible && (
                <EventTooltip
                    position={tooltipPosition}
                    eventData={selectedEvent}
                    onClose={closeTooltip}
                />
            )}
        </div>
    );
};
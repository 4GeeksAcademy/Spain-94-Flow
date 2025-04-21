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

    const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

    const fetchCalendarEvents = async () => {
        try {
            dispatch({ type: "load_calendar_events_start" });

            const options = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };

            const businessFilter = selectedBusiness ? `?business_id=${selectedBusiness.id}` : '';
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

            const options = {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            if (selectedBusiness) {
                options.body = JSON.stringify({
                    business_id: selectedBusiness.id
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

            fetchCalendarEvents();

        } catch (error) {
            console.error("Error syncing calendar:", error);
            dispatch({
                type: "sync_calendar_error",
                payload: error.message
            });
        }
    };

    useEffect(() => {
        fetchCalendarEvents();
    }, [selectedBusiness]);

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

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <h1>
                    {selectedBusiness
                        ? `Calendar for ${selectedBusiness.name}`
                        : "All Appointments Calendar"}
                </h1>

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
                        onClick={fetchCalendarEvents}
                        disabled={calendarLoading}
                    >
                        Update
                    </button>
                </div>
            </div>

            {calendarLoading && <div className="loading-indicator">Loading events...</div>}
            {calendarError && <div className="error-message">{calendarError}</div>}

            {syncStatus && syncStatus.message && (
                <div className={`sync-status ${syncStatus.success ? 'success' : 'error'}`}>
                    {syncStatus.message}
                    {syncStatus.count && ` (${syncStatus.count} synchronized appointments)`}
                </div>
            )}
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
window.pageModules = window.pageModules || {};

window.pageModules.schedule = (() => {
    const MONTH_NAMES = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];

    const WEEKDAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const EVENT_TYPES = [
        "Holiday / Annual leave",
        "Sick day",
        "B&G Contractors",
        "Harmony",
        "John Nelson",
        "Dave (Field)"
    ];
    const PEOPLE_OPTIONS = [
        "Harmony",
        "John Nelson",
        "Dave (Field)",
        "B&G Contractors"
    ];
    const EVENT_TYPE_STYLES = {
        "B&G Contractors": "schedule-chip--contractor",
        "Harmony": "schedule-chip--harmony",
        "John Nelson": "schedule-chip--john",
        "Dave (Field)": "schedule-chip--dave",
        "Holiday / Annual leave": "schedule-chip--holiday",
        "Sick day": "schedule-chip--sick"
    };
    const LEGEND_TYPES = [
        "B&G Contractors",
        "Harmony",
        "John Nelson",
        "Dave (Field)",
        "Holiday / Annual leave",
        "Sick day"
    ];

    const scheduleEvents = [
        { id: 1, title: "22 Birch", type: "B&G Contractors", person: "B&G Contractors", start: "2026-04-01", end: "2026-04-03" },
        { id: 2, title: "14 Birchwood", type: "B&G Contractors", person: "B&G Contractors", start: "2026-04-07", end: "2026-04-17" },
        { id: 3, title: "7 Maple", type: "Harmony", person: "Harmony", start: "2026-04-08", end: "2026-04-22" },
        { id: 4, title: "55 Cedar Annual leave", type: "Holiday / Annual leave", person: "John Nelson", start: "2026-04-15", end: "2026-04-17" },
        { id: 5, title: "Sick day", type: "Sick day", person: "Dave (Field)", start: "2026-04-13", end: "2026-04-13" },
        { id: 6, title: "22 Birch", type: "John Nelson", person: "John Nelson", start: "2026-04-08", end: "2026-04-10" }
    ];

    const state = {
        viewDate: new Date(2026, 3, 1),
        isAddEventOpen: false,
        eventDraft: null
    };

    function escapeAttribute(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    function padNumber(value) {
        return String(value).padStart(2, "0");
    }

    function toIsoDate(date) {
        return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
    }

    function getMonthLabel(date) {
        return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
    }

    function getMonthBounds(date) {
        return {
            firstDay: new Date(date.getFullYear(), date.getMonth(), 1),
            lastDay: new Date(date.getFullYear(), date.getMonth() + 1, 0)
        };
    }

    function getCalendarStart(firstDay) {
        const mondayIndex = (firstDay.getDay() + 6) % 7;
        const start = new Date(firstDay);
        start.setDate(firstDay.getDate() - mondayIndex);
        return start;
    }

    function buildCalendarCells() {
        const { firstDay } = getMonthBounds(state.viewDate);
        const startDate = getCalendarStart(firstDay);
        const cells = [];

        for (let index = 0; index < 42; index += 1) {
            const cellDate = new Date(startDate);
            cellDate.setDate(startDate.getDate() + index);
            cells.push({
                isoDate: toIsoDate(cellDate),
                dayNumber: cellDate.getDate(),
                isCurrentMonth: cellDate.getMonth() === state.viewDate.getMonth()
            });
        }

        return cells;
    }

    function getEventsForDate(isoDate) {
        return scheduleEvents.filter((event) => event.start <= isoDate && event.end >= isoDate);
    }

    function getEventDraft() {
        const currentDate = state.viewDate;
        const defaultDate = `${currentDate.getFullYear()}-${padNumber(currentDate.getMonth() + 1)}-01`;

        return {
            title: "",
            type: "Holiday / Annual leave",
            person: "",
            startDate: defaultDate,
            endDate: defaultDate
        };
    }

    function renderLegend() {
        return `
            <div class="schedule-legend">
                ${LEGEND_TYPES.map((type) => `
                    <div class="schedule-legend__item">
                        <span class="schedule-legend__swatch ${EVENT_TYPE_STYLES[type]}"></span>
                        <span>${type}</span>
                    </div>
                `).join("")}
            </div>
        `;
    }

    function renderCalendarGrid() {
        const cells = buildCalendarCells();

        return `
            <div class="schedule-calendar">
                <div class="schedule-calendar__head">
                    ${WEEKDAY_NAMES.map((day) => `<span>${day}</span>`).join("")}
                </div>
                <div class="schedule-calendar__body">
                    ${cells.map((cell) => `
                        <div class="schedule-calendar__cell${cell.isCurrentMonth ? "" : " is-muted"}">
                            <div class="schedule-calendar__cell-top">
                                <span class="schedule-calendar__day">${cell.dayNumber}</span>
                                <button class="schedule-calendar__add" type="button" data-open-add-event="${cell.isoDate}">+</button>
                            </div>
                            <div class="schedule-calendar__chips">
                                ${getEventsForDate(cell.isoDate).slice(0, 3).map((event) => `
                                    <div class="schedule-chip ${EVENT_TYPE_STYLES[event.type] || ""}">${event.title}</div>
                                `).join("")}
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
        `;
    }

    function renderEventModal() {
        if (!state.isAddEventOpen || !state.eventDraft) {
            return "";
        }

        return `
            <div class="schedule-modal-backdrop" data-event-modal-backdrop>
                <section class="schedule-modal" role="dialog" aria-modal="true" aria-label="Calendar event">
                    <div class="schedule-modal__header">
                        <h3>Calendar event</h3>
                    </div>
                    <div class="schedule-modal__body">
                        <label>
                            <span>Event title *</span>
                            <input type="text" placeholder="e.g. Harmony - Annual leave" value="${escapeAttribute(state.eventDraft.title)}" data-event-field="title">
                        </label>
                        <div class="schedule-modal__grid">
                            <label>
                                <span>Event type</span>
                                <select data-event-field="type">
                                    ${EVENT_TYPES.map((option) => `
                                        <option value="${option}" ${state.eventDraft.type === option ? "selected" : ""}>${option}</option>
                                    `).join("")}
                                </select>
                            </label>
                            <label>
                                <span>Person</span>
                                <select data-event-field="person">
                                    <option value="" ${state.eventDraft.person ? "" : "selected"}>-- Select person --</option>
                                    ${PEOPLE_OPTIONS.map((option) => `
                                        <option value="${option}" ${state.eventDraft.person === option ? "selected" : ""}>${option}</option>
                                    `).join("")}
                                </select>
                            </label>
                            <label>
                                <span>Start date *</span>
                                <input type="date" value="${escapeAttribute(state.eventDraft.startDate)}" data-event-field="startDate">
                            </label>
                            <label>
                                <span>End date</span>
                                <input type="date" value="${escapeAttribute(state.eventDraft.endDate)}" data-event-field="endDate">
                            </label>
                        </div>
                    </div>
                    <div class="schedule-modal__footer">
                        <button class="schedule-button schedule-button--secondary" type="button" data-close-event-modal>Cancel</button>
                        <button class="schedule-button schedule-button--primary" type="button" data-save-event>Save event</button>
                    </div>
                </section>
            </div>
        `;
    }

    return {
        title: "Schedule",
        search: "Search schedule...",
        style: `
            .schedule-shell {
                display: flex;
                flex-direction: column;
                gap: 18px;
                padding-top: 12px;
            }

            .schedule-toolbar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                flex-wrap: wrap;
            }

            .schedule-month-nav {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .schedule-month-nav h3 {
                margin: 0;
                min-width: 172px;
                text-align: center;
                color: #18243d;
                font-size: 1.55rem;
                font-weight: 700;
            }

            .schedule-nav-button,
            .schedule-button,
            .schedule-calendar__add {
                font: inherit;
                cursor: pointer;
            }

            .schedule-nav-button {
                width: 46px;
                height: 46px;
                border: 1px solid #d5dce8;
                border-radius: 12px;
                background: #ffffff;
                color: #2b364b;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                transition: border-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
            }

            .schedule-nav-button svg {
                width: 18px;
                height: 18px;
                fill: none;
                stroke: currentColor;
                stroke-width: 2.2;
                stroke-linecap: round;
                stroke-linejoin: round;
            }

            .schedule-nav-button:hover {
                border-color: #c2cddd;
                box-shadow: 0 8px 16px rgba(24, 36, 61, 0.08);
                transform: translateY(-1px);
            }

            .schedule-button {
                border-radius: 12px;
                padding: 11px 18px;
                font-size: 0.9rem;
                font-weight: 600;
            }

            .schedule-button--secondary {
                border: 1px solid #d7dde8;
                background: #ffffff;
                color: #5b6578;
            }

            .schedule-button--primary {
                border: 1px solid #1d1c19;
                background: #1d1c19;
                color: #ffffff;
            }

            .schedule-button--accent {
                border: 1px solid #d0ad79;
                background: #fff7ef;
                color: #8c5922;
            }

            .schedule-legend {
                display: flex;
                flex-wrap: wrap;
                gap: 12px 18px;
            }

            .schedule-legend__item {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                color: #5a667b;
                font-size: 0.9rem;
            }

            .schedule-legend__swatch {
                width: 10px;
                height: 10px;
                border-radius: 3px;
                border: 1px solid rgba(24, 36, 61, 0.12);
            }

            .schedule-calendar {
                border: 1px solid #d8deea;
                border-radius: 20px;
                overflow: hidden;
                background: #ffffff;
                box-shadow: 0 12px 30px rgba(24, 36, 61, 0.05);
            }

            .schedule-calendar__head,
            .schedule-calendar__body {
                display: grid;
                grid-template-columns: repeat(7, minmax(0, 1fr));
            }

            .schedule-calendar__head span {
                padding: 14px 10px;
                border-right: 1px solid #e8edf4;
                border-bottom: 1px solid #e8edf4;
                color: #56667f;
                font-size: 0.88rem;
                font-weight: 700;
                text-align: center;
            }

            .schedule-calendar__head span:last-child {
                border-right: none;
            }

            .schedule-calendar__cell {
                min-height: 118px;
                padding: 10px 10px 12px;
                border-right: 1px solid #e8edf4;
                border-bottom: 1px solid #e8edf4;
                background: #ffffff;
            }

            .schedule-calendar__cell:nth-child(7n) {
                border-right: none;
            }

            .schedule-calendar__cell-top {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 8px;
            }

            .schedule-calendar__day {
                color: #3d4a60;
                font-size: 0.92rem;
            }

            .schedule-calendar__cell.is-muted .schedule-calendar__day {
                color: #a4afc0;
            }

            .schedule-calendar__add {
                width: 22px;
                height: 22px;
                border: none;
                border-radius: 6px;
                background: transparent;
                color: #77849a;
                font-size: 1rem;
            }

            .schedule-calendar__chips {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .schedule-chip {
                padding: 6px 8px;
                border-radius: 7px;
                font-size: 0.78rem;
                line-height: 1.2;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                border: 1px solid transparent;
            }

            .schedule-chip--contractor {
                background: #efe3cf;
                border-color: #dfc7a4;
                color: #6e522a;
            }

            .schedule-chip--harmony {
                background: #d9e9e5;
                border-color: #bdd5cf;
                color: #2d5f56;
            }

            .schedule-chip--john {
                background: #ece3d6;
                border-color: #d9cbb7;
                color: #6f5836;
            }

            .schedule-chip--dave {
                background: #efefef;
                border-color: #dddddd;
                color: #5e626a;
            }

            .schedule-chip--holiday {
                background: #ead9e4;
                border-color: #d5bccb;
                color: #70445d;
            }

            .schedule-chip--sick {
                background: #eadfcf;
                border-color: #dbc7a5;
                color: #73572f;
            }

            .schedule-note {
                margin: 0;
                color: #5f6d83;
                font-size: 0.92rem;
            }

            .schedule-modal-backdrop {
                position: fixed;
                inset: 0;
                display: grid;
                place-items: center;
                padding: 20px;
                background: rgba(20, 27, 38, 0.42);
                z-index: 80;
            }

            .schedule-modal {
                width: min(100%, 600px);
                background: #ffffff;
                border-radius: 22px;
                box-shadow: 0 24px 56px rgba(15, 23, 42, 0.24);
                overflow: hidden;
            }

            .schedule-modal__header,
            .schedule-modal__footer {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                padding: 22px 30px;
            }

            .schedule-modal__header {
                border-bottom: 1px solid #edf1f6;
            }

            .schedule-modal__header h3 {
                margin: 0;
                color: #222c3d;
                font-size: 1.05rem;
                font-weight: 700;
            }

            .schedule-modal__body {
                display: flex;
                flex-direction: column;
                gap: 18px;
                padding: 24px 30px;
            }

            .schedule-modal__grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 18px 14px;
            }

            .schedule-modal label {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .schedule-modal label span {
                color: #68768a;
                font-size: 0.86rem;
                font-weight: 600;
            }

            .schedule-modal input,
            .schedule-modal select {
                min-height: 52px;
                padding: 12px 14px;
                border: 1px solid #cfd7e3;
                border-radius: 14px;
                font: inherit;
                font-size: 0.95rem;
                color: #263245;
                background: #ffffff;
            }

            .schedule-modal__footer {
                justify-content: flex-end;
                border-top: 1px solid #edf1f6;
            }

            @media (max-width: 900px) {
                .schedule-toolbar {
                    align-items: flex-start;
                }

                .schedule-month-nav {
                    width: 100%;
                    justify-content: space-between;
                }

                .schedule-month-nav h3 {
                    min-width: 0;
                    flex: 1;
                }

                .schedule-calendar {
                    overflow-x: auto;
                }

                .schedule-calendar__head,
                .schedule-calendar__body {
                    min-width: 760px;
                }

                .schedule-modal__grid {
                    grid-template-columns: 1fr;
                }
            }
        `,
        render: () => `
            <section class="schedule-shell">
                <div class="schedule-toolbar">
                    <div class="schedule-month-nav">
                        <button class="schedule-nav-button" type="button" data-schedule-nav="prev" aria-label="Previous month">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"></path></svg>
                        </button>
                        <h3>${getMonthLabel(state.viewDate)}</h3>
                        <button class="schedule-nav-button" type="button" data-schedule-nav="next" aria-label="Next month">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18l6-6-6-6"></path></svg>
                        </button>
                    </div>
                    <button class="schedule-button schedule-button--accent" type="button" data-open-add-event>+ Add event</button>
                </div>
                ${renderLegend()}
                ${renderCalendarGrid()}
                <p class="schedule-note">Click any day plus button to prefill the event date, or use Add event to create one manually.</p>
                ${renderEventModal()}
            </section>
        `,
        onClick: (event, { rerender }) => {
            const navButton = event.target.closest("[data-schedule-nav]");
            const openAddEventButton = event.target.closest("[data-open-add-event]");
            const closeEventModalButton = event.target.closest("[data-close-event-modal]");
            const saveEventButton = event.target.closest("[data-save-event]");
            const modalBackdrop = event.target.closest("[data-event-modal-backdrop]");

            if (navButton) {
                const direction = navButton.getAttribute("data-schedule-nav");
                state.viewDate = new Date(
                    state.viewDate.getFullYear(),
                    state.viewDate.getMonth() + (direction === "next" ? 1 : -1),
                    1
                );
                rerender();
                return true;
            }

            if (openAddEventButton) {
                const selectedDate = openAddEventButton.getAttribute("data-open-add-event");
                state.isAddEventOpen = true;
                state.eventDraft = getEventDraft();

                if (selectedDate) {
                    state.eventDraft.startDate = selectedDate;
                    state.eventDraft.endDate = selectedDate;
                }

                rerender();
                return true;
            }

            if (closeEventModalButton || (modalBackdrop && event.target === modalBackdrop)) {
                state.isAddEventOpen = false;
                state.eventDraft = null;
                rerender();
                return true;
            }

            if (saveEventButton && state.eventDraft?.title && state.eventDraft.startDate) {
                scheduleEvents.push({
                    id: Date.now(),
                    title: state.eventDraft.title,
                    type: state.eventDraft.type,
                    person: state.eventDraft.person,
                    start: state.eventDraft.startDate,
                    end: state.eventDraft.endDate || state.eventDraft.startDate
                });
                state.isAddEventOpen = false;
                state.eventDraft = null;
                rerender();
                return true;
            }

            return false;
        },
        onChange: (event) => {
            const eventField = event.target.closest("[data-event-field]");

            if (!eventField || !state.eventDraft) {
                return false;
            }

            const fieldName = eventField.getAttribute("data-event-field");
            state.eventDraft[fieldName] = eventField.value;

            if (fieldName === "startDate" && (!state.eventDraft.endDate || state.eventDraft.endDate < eventField.value)) {
                state.eventDraft.endDate = eventField.value;
            }

            return true;
        }
    };
})();

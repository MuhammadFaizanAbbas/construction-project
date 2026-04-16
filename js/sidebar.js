window.sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: "layout" },
    { id: "schedule", label: "Schedule", icon: "calendar" },
    { id: "scope", label: "Scope of Works", icon: "file" },
    { id: "team", label: "Team", icon: "users" },
    { id: "finance", label: "Finance", icon: "wallet" },
    { id: "notifications", label: "Notifications", icon: "bell" },
    { id: "clients", label: "Clients", icon: "building" },
    { id: "forms", label: "Forms", icon: "edit" },
    { id: "archive", label: "Archive", icon: "archive" },
    { id: "reporting", label: "Reporting", icon: "barChart" },
    { id: "messages", label: "Messages", icon: "message", badge: "0" },
    { id: "access", label: "Users & Access", icon: "key" }
];

window.sidebarIcons = {
    layout: `
        <svg viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
        </svg>
    `,
    calendar: `
        <svg viewBox="0 0 24 24">
            <rect x="3" y="5" width="18" height="16" rx="2"></rect>
            <path d="M16 3v4M8 3v4M3 10h18"></path>
        </svg>
    `,
    file: `
        <svg viewBox="0 0 24 24">
            <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z"></path>
            <path d="M14 2v5h5"></path>
        </svg>
    `,
    users: `
        <svg viewBox="0 0 24 24">
            <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path>
            <circle cx="9.5" cy="7" r="3"></circle>
            <path d="M20 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 4.13a3 3 0 0 1 0 5.74"></path>
        </svg>
    `,
    wallet: `
        <svg viewBox="0 0 24 24">
            <path d="M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <path d="M16 12h5"></path>
            <circle cx="16" cy="12" r="1"></circle>
        </svg>
    `,
    bell: `
        <svg viewBox="0 0 24 24">
            <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
            <path d="M10 21a2 2 0 0 0 4 0"></path>
        </svg>
    `,
    building: `
        <svg viewBox="0 0 24 24">
            <path d="M3 21h18"></path>
            <path d="M5 21V7l7-4 7 4v14"></path>
            <path d="M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01"></path>
        </svg>
    `,
    edit: `
        <svg viewBox="0 0 24 24">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4z"></path>
        </svg>
    `,
    archive: `
        <svg viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="4" rx="1"></rect>
            <path d="M5 8h14v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"></path>
            <path d="M10 12h4"></path>
        </svg>
    `,
    barChart: `
        <svg viewBox="0 0 24 24">
            <path d="M12 20V10"></path>
            <path d="M18 20V4"></path>
            <path d="M6 20v-6"></path>
        </svg>
    `,
    message: `
        <svg viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
    `,
    key: `
        <svg viewBox="0 0 24 24">
            <circle cx="7.5" cy="15.5" r="4.5"></circle>
            <path d="M21 2l-9.6 9.6"></path>
            <path d="M15 8l3 3"></path>
            <path d="M18 5l3 3"></path>
        </svg>
    `
};

window.renderSidebar = function renderSidebar(activeId) {
    const nav = document.getElementById("sidebarNav");

    if (!nav) {
        return;
    }

    nav.innerHTML = window.sidebarItems.map((item) => {
        const isActive = item.id === activeId;
        const badge = item.badge !== undefined
            ? `<span class="nav-item__badge">${item.badge}</span>`
            : "";

        return `
            <button class="nav-item ${isActive ? "is-active" : ""}" type="button" data-page="${item.id}">
                <span class="menu-icon" aria-hidden="true">${window.sidebarIcons[item.icon] || ""}</span>
                <span class="nav-item__label">${item.label}</span>
                ${badge}
            </button>
        `;
    }).join("");
};

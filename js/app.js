document.addEventListener("DOMContentLoaded", () => {
    const pageContent = document.getElementById("pageContent");
    const contentHeaderTitle = document.getElementById("contentHeaderTitle");
    const searchInput = document.querySelector("#globalSearch, .search-box input");
    const notificationToggle = document.getElementById("notificationToggle");
    const notificationCard = document.getElementById("notificationCard");
    const notificationList = document.getElementById("notificationList");
    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const sidebarClose = document.getElementById("sidebarClose");
    const sidebarBackdrop = document.getElementById("sidebarBackdrop");
    const appShell = document.querySelector(".app-shell");
    const ACTIVE_PAGE_STORAGE_KEY = "job-management-active-page";
    let pageStyleTag = document.getElementById("pageStyleTag");
    let activePage = localStorage.getItem(ACTIVE_PAGE_STORAGE_KEY) || "dashboard";
    const notifications = [
        {
            title: "New invoice received",
            message: "Finance team uploaded invoice INV-203 for review.",
            time: "5 min ago"
        },
        {
            title: "Site meeting reminder",
            message: "Project coordination meeting starts at 3:00 PM today.",
            time: "20 min ago"
        },
        {
            title: "Task completed",
            message: "Foundation checklist has been marked complete.",
            time: "1 hour ago"
        }
    ];

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function applyPageStyle(cssText) {
        if (!pageStyleTag) {
            pageStyleTag = document.createElement("style");
            pageStyleTag.id = "pageStyleTag";
            document.head.appendChild(pageStyleTag);
        }

        pageStyleTag.textContent = cssText || "";
    }

    function getPage(pageId) {
        return window.pageModules?.[pageId] || window.pageModules?.dashboard;
    }

    function setActivePage(pageId) {
        activePage = pageId;
        localStorage.setItem(ACTIVE_PAGE_STORAGE_KEY, pageId);
    }

    function navigateToPage(pageId) {
        setActivePage(pageId);
        window.renderSidebar(activePage);
        renderPage(activePage);
    }

    function renderNotifications() {
        if (!notificationList) {
            return;
        }

        notificationList.innerHTML = notifications.map((item) => `
            <article class="notification-item">
                <div class="notification-item__dot"></div>
                <div class="notification-item__content">
                    <h3>${escapeHtml(item.title)}</h3>
                    <p>${escapeHtml(item.message)}</p>
                    <span>${escapeHtml(item.time)}</span>
                </div>
            </article>
        `).join("");
    }

    function setNotificationOpen(isOpen) {
        if (!notificationCard || !notificationToggle) {
            return;
        }

        notificationCard.hidden = !isOpen;
        notificationToggle.setAttribute("aria-expanded", String(isOpen));
        notificationToggle.classList.toggle("is-active", isOpen);
    }

    function isMobileSidebarMode() {
        return window.innerWidth <= 768;
    }

    function setSidebarOpen(isOpen) {
        if (!appShell || !sidebarToggle || !sidebarBackdrop || !sidebar) {
            return;
        }

        appShell.classList.toggle("sidebar-open", isOpen);
        sidebarBackdrop.hidden = !isOpen;
        sidebarToggle.setAttribute("aria-expanded", String(isOpen));
    }

    function renderPage(pageId) {
        const page = getPage(pageId);

        if (!pageContent || !page) {
            return;
        }

        if (contentHeaderTitle) {
            contentHeaderTitle.textContent = page.title;
        }

        if (searchInput) {
            searchInput.placeholder = page.search || "Search...";
        }

        applyPageStyle(page.style);

        pageContent.innerHTML = typeof page.render === "function"
            ? page.render({
                escapeHtml,
                rerender: () => renderPage(activePage)
            })
            : `
                <section class="page-welcome">
                    <h3>Welcome to ${escapeHtml(page.title)}</h3>
                    <p>This page is ready.</p>
                </section>
            `;
    }

    window.__jobManagementRenderActivePage = () => renderPage(activePage);
    window.__jobManagementNavigateToPage = navigateToPage;

    if (!window.sidebarItems?.some((item) => item.id === activePage)) {
        setActivePage("dashboard");
    }

    window.renderSidebar(activePage);
    renderPage(activePage);
    renderNotifications();
    setNotificationOpen(false);

    document.getElementById("sidebarNav")?.addEventListener("click", (event) => {
        const button = event.target.closest("[data-page]");

        if (!button) {
            return;
        }

        setActivePage(button.dataset.page);
        navigateToPage(button.dataset.page);

        if (isMobileSidebarMode()) {
            setSidebarOpen(false);
        }
    });

    pageContent?.addEventListener("click", (event) => {
        const page = getPage(activePage);

        if (typeof page?.onClick === "function") {
            page.onClick(event, {
                escapeHtml,
                rerender: () => renderPage(activePage)
            });
        }
    });

    pageContent?.addEventListener("change", (event) => {
        const page = getPage(activePage);

        if (typeof page?.onChange === "function") {
            page.onChange(event, {
                escapeHtml,
                rerender: () => renderPage(activePage)
            });
        }
    });

    notificationToggle?.addEventListener("click", (event) => {
        event.stopPropagation();
        const isOpen = notificationToggle.getAttribute("aria-expanded") === "true";
        setNotificationOpen(!isOpen);
    });

    notificationCard?.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    document.addEventListener("click", () => {
        setNotificationOpen(false);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            setNotificationOpen(false);
            setSidebarOpen(false);
        }
    });

    sidebarToggle?.addEventListener("click", (event) => {
        event.stopPropagation();
        const isOpen = sidebarToggle.getAttribute("aria-expanded") === "true";
        setSidebarOpen(!isOpen);
    });

    sidebarClose?.addEventListener("click", () => {
        setSidebarOpen(false);
    });

    sidebarBackdrop?.addEventListener("click", () => {
        setSidebarOpen(false);
    });

    window.addEventListener("resize", () => {
        if (!isMobileSidebarMode()) {
            setSidebarOpen(false);
        }
    });
});

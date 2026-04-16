document.addEventListener("DOMContentLoaded", () => {
    const pageContent = document.getElementById("pageContent");
    const contentHeaderTitle = document.getElementById("contentHeaderTitle");
    const searchInput = document.querySelector("#globalSearch, .search-box input");
    const notificationToggle = document.getElementById("notificationToggle");
    const notificationCard = document.getElementById("notificationCard");
    const notificationList = document.getElementById("notificationList");
    const notificationBadge = document.getElementById("notificationBadge");
    const notificationMarkAll = document.getElementById("notificationMarkAll");
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
            title: "Complete but not billed",
            message: "42 Dorac Avenue SK8 3NZ",
            time: "5 min ago",
            tone: "amber",
            isRead: false
        },
        {
            title: "No operative assigned",
            message: "33 Oak Lane WA15 9GH",
            time: "20 min ago",
            tone: "blue",
            isRead: false
        },
        {
            title: "Snagging required",
            message: "22 Birch Grove WA16 7QT — Plaster finish to hallway walls not to required standard. Sk...",
            time: "1 hour ago",
            tone: "red",
            isRead: false
        },
        {
            title: "Job not issued to a contractor",
            message: "62 Sycamore Drive WA14 2BV",
            time: "2 hours ago",
            tone: "red",
            isRead: false
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

        const unreadCount = notifications.filter((item) => !item.isRead).length;

        if (notificationBadge) {
            notificationBadge.textContent = String(unreadCount);
            notificationBadge.hidden = unreadCount === 0;
        }

        if (notificationMarkAll) {
            notificationMarkAll.hidden = unreadCount === 0;
        }

        notificationList.innerHTML = notifications.map((item) => `
            <article class="notification-item ${item.isRead ? "is-read" : ""}">
                <div class="notification-item__dot notification-item__dot--${escapeHtml(item.tone || "blue")}"></div>
                <div class="notification-item__content">
                    <h3>${escapeHtml(item.title)}</h3>
                    <p>${escapeHtml(item.message)}</p>
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

    notificationMarkAll?.addEventListener("click", (event) => {
        event.stopPropagation();
        notifications.forEach((item) => {
            item.isRead = true;
        });
        renderNotifications();
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

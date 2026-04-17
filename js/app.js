document.addEventListener("DOMContentLoaded", () => {
    const pageContent = document.getElementById("pageContent");
    const contentHeaderTitle = document.getElementById("contentHeaderTitle");
    const appHeader = document.getElementById("appHeader");
    const sidebarBrandMeta = document.getElementById("sidebarBrandMeta");
    const sidebarProfileAvatar = document.getElementById("sidebarProfileAvatar");
    const sidebarProfileName = document.getElementById("sidebarProfileName");
    const sidebarProfileEmail = document.getElementById("sidebarProfileEmail");
    const searchInput = document.querySelector("#globalSearch, .search-box input");
    const notificationToggle = document.getElementById("notificationToggle");
    const notificationCard = document.getElementById("notificationCard");
    const notificationList = document.getElementById("notificationList");
    const notificationBadge = document.getElementById("notificationBadge");
    const notificationMarkAll = document.getElementById("notificationMarkAll");
    const newJobButton = document.getElementById("newJobButton");
    const logoutButton = document.getElementById("logoutButton");
    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const sidebarClose = document.getElementById("sidebarClose");
    const sidebarBackdrop = document.getElementById("sidebarBackdrop");
    const appShell = document.querySelector(".app-shell");
    const ACTIVE_PAGE_STORAGE_KEY = "job-management-active-page";
    const AUTH_SESSION_STORAGE_KEY = "job-management-auth-session";
    const USE_HASH_ROUTING = window.location.port === "5501";
    const API_BASE_URL = window.location.port === "5501"
        ? "http://127.0.0.1:8000"
        : "";
    const toastStack = document.getElementById("toastStack");
    let pageStyleTag = document.getElementById("pageStyleTag");
    let activePage = "login";
    const AUTH_PAGES = new Set(["login", "signup"]);
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

    function showToast(message, type = "success") {
        if (!toastStack) {
            return;
        }

        const toast = document.createElement("div");
        toast.className = `toast toast--${type}`;
        toast.textContent = message;
        toastStack.appendChild(toast);

        window.setTimeout(() => {
            toast.remove();
        }, 3200);
    }

    function getStoredSession() {
        try {
            const rawValue = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
            return rawValue ? JSON.parse(rawValue) : null;
        } catch (error) {
            return null;
        }
    }

    function updateSidebarUser(user) {
        const fallbackName = user?.name || "Guest User";
        const fallbackEmail = user?.email || "Not signed in";
        const fallbackRole = user?.role || "Signed out";
        const initials = fallbackName
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() || "")
            .join("") || "GU";

        if (sidebarProfileAvatar) {
            sidebarProfileAvatar.textContent = initials;
        }

        if (sidebarProfileName) {
            sidebarProfileName.textContent = fallbackName;
        }

        if (sidebarProfileEmail) {
            sidebarProfileEmail.textContent = fallbackEmail;
        }

        if (sidebarBrandMeta) {
            sidebarBrandMeta.textContent = user ? `${fallbackEmail} | ${fallbackRole}` : "Signed out";
        }
    }

    function setStoredSession(user) {
        localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(user));
        updateSidebarUser(user);
    }

    function clearStoredSession() {
        localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
        localStorage.removeItem(ACTIVE_PAGE_STORAGE_KEY);
        updateSidebarUser(null);
    }

    async function postJson(url, payload) {
        const requestUrl = API_BASE_URL ? `${API_BASE_URL}${url}` : url;
        const response = await fetch(requestUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(result.error || "Request failed.");
        }

        return result;
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
        return window.pageModules?.[pageId] || window.pageModules?.login || window.pageModules?.dashboard;
    }

    function getPathForPage(pageId) {
        if (USE_HASH_ROUTING) {
            return `/#${pageId}`;
        }
        return `/${pageId}`;
    }

    function getPageIdFromLocation() {
        const knownPages = new Set([
            "login",
            "signup",
            ...(window.sidebarItems || []).map((item) => item.id)
        ]);
        const hashPageId = String(window.location.hash || "").replace(/^#\/?/, "").trim();
        if (hashPageId && knownPages.has(hashPageId)) {
            return hashPageId;
        }

        const pathname = window.location.pathname;
        const normalizedPath = String(pathname || "/").replace(/\/+$/, "") || "/";

        if (normalizedPath === "/") {
            return "login";
        }

        const pageId = normalizedPath.replace(/^\//, "");
        return knownPages.has(pageId) ? pageId : "login";
    }

    function syncUrlWithPage(pageId, replace = false) {
        const statePayload = { pageId };
        const nextPath = getPathForPage(pageId);

        if (USE_HASH_ROUTING) {
            if (`/${window.location.hash}` === nextPath || window.location.hash === `#${pageId}`) {
                return;
            }

            if (replace) {
                window.history.replaceState(statePayload, "", nextPath);
            } else {
                window.history.pushState(statePayload, "", nextPath);
            }
            return;
        }

        if (window.location.pathname === nextPath) {
            return;
        }

        if (replace) {
            window.history.replaceState(statePayload, "", nextPath);
        } else {
            window.history.pushState(statePayload, "", nextPath);
        }
    }

    function updateLayoutForPage(pageId) {
        const isAuthPage = AUTH_PAGES.has(pageId);

        if (appShell) {
            appShell.classList.toggle("app-shell--auth", isAuthPage);
        }

        if (sidebar) {
            sidebar.hidden = isAuthPage;
        }

        if (appHeader) {
            appHeader.hidden = isAuthPage;
        }

        if (sidebarBackdrop) {
            sidebarBackdrop.hidden = true;
        }

        if (!isAuthPage) {
            return;
        }

        setSidebarOpen(false);
        setNotificationOpen(false);
    }

    function hasAuthenticatedSession() {
        return Boolean(getStoredSession());
    }

    function setActivePage(pageId) {
        activePage = pageId;
        localStorage.setItem(ACTIVE_PAGE_STORAGE_KEY, pageId);
    }

    function navigateToPage(pageId, options = {}) {
        const { replace = false } = options;
        setActivePage(pageId);
        syncUrlWithPage(activePage, replace);
        if (!AUTH_PAGES.has(activePage)) {
            window.renderSidebar(activePage);
        }
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

        updateLayoutForPage(pageId);

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
    window.__jobManagementShowToast = showToast;
    window.__jobManagementAuth = {
        login: async (payload) => {
            const result = await postJson("/api/login", payload);
            setStoredSession(result.user);
            return result.user;
        },
        signup: async (payload) => {
            const result = await postJson("/api/signup", payload);
            setStoredSession(result.user);
            return result.user;
        },
        logout: () => {
            clearStoredSession();
        }
    };
    updateSidebarUser(getStoredSession());
    activePage = getPageIdFromLocation();

    if (!hasAuthenticatedSession() && !AUTH_PAGES.has(activePage)) {
        navigateToPage("login", { replace: true });
    } else if (hasAuthenticatedSession() && AUTH_PAGES.has(activePage)) {
        navigateToPage("dashboard", { replace: true });
    } else if ((USE_HASH_ROUTING && !window.location.hash) || (!USE_HASH_ROUTING && window.location.pathname === "/")) {
        navigateToPage("login", { replace: true });
    } else {
        setActivePage(activePage);
        if (!AUTH_PAGES.has(activePage)) {
            window.renderSidebar(activePage);
        }
        renderPage(activePage);
    }
    renderNotifications();
    setNotificationOpen(false);

    document.getElementById("sidebarNav")?.addEventListener("click", (event) => {
        const button = event.target.closest("[data-page]");

        if (!button) {
            return;
        }

        navigateToPage(button.dataset.page);

        if (isMobileSidebarMode()) {
            setSidebarOpen(false);
        }
    });

    pageContent?.addEventListener("click", (event) => {
        const page = getPage(activePage);

        if (typeof page?.onClick === "function") {
            const handled = page.onClick(event, {
                escapeHtml,
                rerender: () => renderPage(activePage)
            });

            if (handled) {
                event.preventDefault();
            }
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

    newJobButton?.addEventListener("click", (event) => {
        event.stopPropagation();
        navigateToPage("dashboard");
        if (typeof window.pageModules?.dashboard?.openCreateJob === "function") {
            window.pageModules.dashboard.openCreateJob();
        }
    });

    logoutButton?.addEventListener("click", () => {
        clearStoredSession();
        navigateToPage("login");
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

    window.addEventListener("popstate", () => {
        const pageId = getPageIdFromLocation();
        if (!hasAuthenticatedSession() && !AUTH_PAGES.has(pageId)) {
            navigateToPage("login", { replace: true });
            return;
        }
        if (hasAuthenticatedSession() && AUTH_PAGES.has(pageId)) {
            navigateToPage("dashboard", { replace: true });
            return;
        }
        setActivePage(pageId);
        if (!AUTH_PAGES.has(pageId)) {
            window.renderSidebar(pageId);
        }
        renderPage(pageId);
    });

    window.addEventListener("hashchange", () => {
        if (!USE_HASH_ROUTING) {
            return;
        }

        const pageId = getPageIdFromLocation();
        if (!hasAuthenticatedSession() && !AUTH_PAGES.has(pageId)) {
            navigateToPage("login", { replace: true });
            return;
        }
        if (hasAuthenticatedSession() && AUTH_PAGES.has(pageId)) {
            navigateToPage("dashboard", { replace: true });
            return;
        }
        setActivePage(pageId);
        if (!AUTH_PAGES.has(pageId)) {
            window.renderSidebar(pageId);
        }
        renderPage(pageId);
    });
});

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
    const LOCAL_AUTH_USERS_STORAGE_KEY = "job-management-local-auth-users";
    const USE_HASH_ROUTING = window.location.port === "5501";
    const IS_LOCAL_HOST = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    const API_BASE_URL = String(window.__JOB_MANAGEMENT_API_BASE_URL__ || "").trim().replace(/\/+$/, "");
    const SUPABASE_AUTH_CONFIG = window.__SUPABASE_AUTH_CONFIG__ || {};
    const toastStack = document.getElementById("toastStack");
    let pageStyleTag = document.getElementById("pageStyleTag");
    let activePage = "login";
    const AUTH_PAGES = new Set(["login", "signup"]);
    const DEFAULT_LOCAL_AUTH_USER = {
        id: "local-demo-admin",
        name: "Demo Admin",
        email: "admin@cejconstruction.com",
        password: "admin123",
        role: "admin"
    };
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

    function getCurrentUserRole() {
        return String(getStoredSession()?.role || "").trim().toLowerCase();
    }

    function userHasPageAccess(pageId) {
        const role = getCurrentUserRole();
        const allowedPageIds = typeof window.getSidebarItemsForRole === "function"
            ? window.getSidebarItemsForRole(role).map((item) => item.id)
            : (window.sidebarItems || []).map((item) => item.id);

        if (AUTH_PAGES.has(pageId)) {
            return true;
        }

        return allowedPageIds.includes(pageId);
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

    function getSupabaseConfig() {
        const url = String(SUPABASE_AUTH_CONFIG.url || "").trim().replace(/\/+$/, "");
        const publishableKey = String(
            SUPABASE_AUTH_CONFIG.publishableKey
            || SUPABASE_AUTH_CONFIG.anonKey
            || ""
        ).trim();

        return {
            url,
            publishableKey
        };
    }

    function hasSupabaseAuthConfig() {
        const { url, publishableKey } = getSupabaseConfig();
        return Boolean(url && publishableKey);
    }

    function getAuthMode() {
        if (hasSupabaseAuthConfig()) {
            return "supabase";
        }

        if (API_BASE_URL) {
            return "api";
        }

        return IS_LOCAL_HOST ? "local" : "unconfigured";
    }

    function createAppUserFromSupabase(user) {
        const metadata = user?.user_metadata || {};
        const appMetadata = user?.app_metadata || {};
        const email = user?.email || "";
        const fallbackName = email ? email.split("@")[0] : "User";

        return {
            id: user?.id || "",
            email: email || "Not signed in",
            name: metadata.name || metadata.full_name || appMetadata.name || fallbackName,
            role: metadata.role || appMetadata.role || "Team Member"
        };
    }

    function getLocalAuthUsers() {
        try {
            const rawValue = localStorage.getItem(LOCAL_AUTH_USERS_STORAGE_KEY);
            const parsedValue = rawValue ? JSON.parse(rawValue) : [];
            return Array.isArray(parsedValue) ? parsedValue : [];
        } catch (error) {
            return [];
        }
    }

    function setLocalAuthUsers(users) {
        localStorage.setItem(LOCAL_AUTH_USERS_STORAGE_KEY, JSON.stringify(users));
    }

    function ensureLocalAuthBootstrap() {
        if (getAuthMode() !== "local") {
            return;
        }

        const users = getLocalAuthUsers();

        if (users.length > 0) {
            return;
        }

        setLocalAuthUsers([DEFAULT_LOCAL_AUTH_USER]);
    }

    function createLocalAppUser(user) {
        const fallbackName = user?.email ? String(user.email).split("@")[0] : "User";

        return {
            id: user?.id || `local-${Date.now()}`,
            email: user?.email || "Not signed in",
            name: user?.name || fallbackName,
            role: user?.role || "Team Member"
        };
    }

    function isNetworkAuthError(error) {
        const message = String(error?.message || "").toLowerCase();
        return !message
            || message.includes("failed to fetch")
            || message.includes("networkerror")
            || message.includes("network error")
            || message.includes("load failed")
            || message.includes("connection refused")
            || message.includes("err_connection_refused")
            || message.includes("fetch failed");
    }

    function signUpLocally(payload) {
        const users = getLocalAuthUsers();
        const normalizedEmail = String(payload.email || "").trim().toLowerCase();
        const existingUser = users.find((user) => String(user.email || "").trim().toLowerCase() === normalizedEmail);

        if (existingUser) {
            throw new Error("An account with this email already exists.");
        }

        const nextUser = {
            id: `local-${Date.now()}`,
            name: payload.name,
            email: normalizedEmail,
            password: payload.password,
            role: payload.role
        };

        users.push(nextUser);
        setLocalAuthUsers(users);

        const appUser = createLocalAppUser(nextUser);
        setStoredSession(appUser);
        return { user: appUser, requiresEmailConfirmation: false };
    }

    function signInLocally(payload) {
        const users = getLocalAuthUsers();
        const normalizedEmail = String(payload.email || "").trim().toLowerCase();
        const existingUser = users.find((user) => (
            String(user.email || "").trim().toLowerCase() === normalizedEmail
            && String(user.password || "") === String(payload.password || "")
        ));

        if (!existingUser) {
            throw new Error("Invalid email or password.");
        }

        const appUser = createLocalAppUser(existingUser);
        setStoredSession(appUser);
        return { user: appUser, session: null };
    }

    async function postSupabaseAuth(path, payload) {
        const { url, publishableKey } = getSupabaseConfig();

        if (!url || !publishableKey) {
            throw new Error("Supabase auth is not configured. Add your project URL and publishable/anon key to window.__SUPABASE_AUTH_CONFIG__.");
        }

        const response = await fetch(`${url}${path}`, {
            method: "POST",
            headers: {
                "apikey": publishableKey,
                "Authorization": `Bearer ${publishableKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            const message = result.msg || result.error_description || result.error || "Request failed.";
            throw new Error(message);
        }

        return result;
    }

    async function signInWithSupabase(payload) {
        const result = await postSupabaseAuth("/auth/v1/token?grant_type=password", {
            email: payload.email,
            password: payload.password
        });

        const appUser = createAppUserFromSupabase(result.user);
        setStoredSession(appUser);
        return {
            user: appUser,
            session: result
        };
    }

    async function signUpWithSupabase(payload) {
        const result = await postSupabaseAuth("/auth/v1/signup", {
            email: payload.email,
            password: payload.password,
            data: {
                name: payload.name,
                role: payload.role
            }
        });

        const appUser = result.user ? createAppUserFromSupabase(result.user) : null;
        const hasSession = Boolean(result.access_token || result.session);

        if (appUser && hasSession) {
            setStoredSession(appUser);
        }

        return {
            user: appUser,
            requiresEmailConfirmation: !hasSession
        };
    }

    async function postJson(url, payload) {
        if (!API_BASE_URL) {
            throw new Error("No API backend is configured for auth.");
        }

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
        const nextPageId = userHasPageAccess(pageId) ? pageId : "dashboard";
        setActivePage(nextPageId);
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

        const resolvedTitle = typeof page.title === "function" ? page.title() : page.title;
        const resolvedSearch = typeof page.search === "function" ? page.search() : page.search;

        updateLayoutForPage(pageId);

        if (contentHeaderTitle) {
            contentHeaderTitle.textContent = resolvedTitle;
        }

        if (searchInput) {
            searchInput.placeholder = resolvedSearch || "Search...";
        }

        applyPageStyle(page.style);

        pageContent.innerHTML = typeof page.render === "function"
            ? page.render({
                escapeHtml,
                rerender: () => renderPage(activePage)
            })
            : `
                <section class="page-welcome">
                    <h3>Welcome to ${escapeHtml(resolvedTitle)}</h3>
                    <p>This page is ready.</p>
                </section>
            `;
    }

    window.__jobManagementRenderActivePage = () => renderPage(activePage);
    window.__jobManagementNavigateToPage = navigateToPage;
    window.__jobManagementShowToast = showToast;
    window.__jobManagementGetStoredSession = getStoredSession;
    window.__jobManagementGetCurrentUserRole = getCurrentUserRole;
    window.__jobManagementUserHasPageAccess = userHasPageAccess;
    window.__jobManagementGetAuthMode = getAuthMode;
    window.__jobManagementGetDefaultLocalCredentials = () => ({
        email: DEFAULT_LOCAL_AUTH_USER.email,
        password: DEFAULT_LOCAL_AUTH_USER.password
    });
    window.__jobManagementAuth = {
        login: async (payload) => {
            if (hasSupabaseAuthConfig()) {
                const result = await signInWithSupabase(payload);
                return result.user;
            }

            if (API_BASE_URL) {
                try {
                    const result = await postJson("/api/login", payload);
                    setStoredSession(result.user);
                    return result.user;
                } catch (error) {
                    if (!isNetworkAuthError(error)) {
                        throw error;
                    }
                }
            }

            if (!IS_LOCAL_HOST) {
                throw new Error("Auth is not configured for this deployment. Set a live API base URL or Supabase public config.");
            }

            const result = signInLocally(payload);
            return result.user;
        },
        signup: async (payload) => {
            if (hasSupabaseAuthConfig()) {
                return signUpWithSupabase(payload);
            }

            if (API_BASE_URL) {
                try {
                    const result = await postJson("/api/signup", payload);
                    setStoredSession(result.user);
                    return { user: result.user, requiresEmailConfirmation: false };
                } catch (error) {
                    if (!isNetworkAuthError(error)) {
                        throw error;
                    }
                }
            }

            if (!IS_LOCAL_HOST) {
                throw new Error("Auth is not configured for this deployment. Set a live API base URL or Supabase public config.");
            }

            return signUpLocally(payload);
        },
        logout: () => {
            clearStoredSession();
        }
    };
    ensureLocalAuthBootstrap();
    updateSidebarUser(getStoredSession());
    activePage = getPageIdFromLocation();

    if (!hasAuthenticatedSession() && !AUTH_PAGES.has(activePage)) {
        navigateToPage("login", { replace: true });
    } else if (hasAuthenticatedSession() && AUTH_PAGES.has(activePage)) {
        navigateToPage("dashboard", { replace: true });
    } else if (hasAuthenticatedSession() && !AUTH_PAGES.has(activePage) && !userHasPageAccess(activePage)) {
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

    pageContent?.addEventListener("submit", (event) => {
        const page = getPage(activePage);

        if (typeof page?.onSubmit === "function") {
            const handled = page.onSubmit(event, {
                escapeHtml,
                rerender: () => renderPage(activePage)
            });

            if (handled) {
                event.preventDefault();
            }
        }
    });

    pageContent?.addEventListener("input", (event) => {
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
        if (hasAuthenticatedSession() && !AUTH_PAGES.has(pageId) && !userHasPageAccess(pageId)) {
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
        if (hasAuthenticatedSession() && !AUTH_PAGES.has(pageId) && !userHasPageAccess(pageId)) {
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

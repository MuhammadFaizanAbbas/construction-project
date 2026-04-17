window.pageModules = window.pageModules || {};

window.pageModules.login = (() => {
    const state = {
        email: "",
        password: "",
        showPassword: false,
        isSubmitting: false,
        errors: {},
        successMessage: ""
    };

    function rerenderLoginPage() {
        if (typeof window.__jobManagementRenderActivePage === "function") {
            window.__jobManagementRenderActivePage();
        }
    }

    function validate() {
        const errors = {};
        const email = state.email.trim();
        const password = state.password;

        if (!email) {
            errors.email = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = "Enter a valid email address.";
        }

        if (!password) {
            errors.password = "Password is required.";
        } else if (password.length < 6) {
            errors.password = "Password must be at least 6 characters.";
        }

        return errors;
    }

    return {
        title: "Login",
        search: "Search...",
        style: `
            .login-page {
                min-height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background:
                    radial-gradient(circle at top left, rgba(213, 227, 255, 0.75), transparent 34%),
                    linear-gradient(180deg, #f8fafc 0%, #eef3f7 100%);
                padding: 32px;
            }

            .login-page__panel {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
            }

            .login-card {
                width: min(100%, 520px);
                background: #ffffff;
                border: 1px solid #d8e0ea;
                border-radius: 28px;
                padding: 34px;
            }

            .login-card__brand {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 14px;
                margin-bottom: 28px;
            }

            .login-card__brand-wrap {
                display: flex;
                align-items: center;
                gap: 14px;
            }

            .login-card__logo {
                width: 48px;
                height: 48px;
                border-radius: 16px;
                display: grid;
                place-items: center;
                background: #162033;
                color: #ffffff;
            }

            .login-card__logo svg {
                width: 24px;
                height: 24px;
                fill: none;
                stroke: currentColor;
                stroke-width: 2;
            }

            .login-card__meta span {
                display: block;
                margin-bottom: 4px;
                color: #6f7d91;
                font-size: 0.74rem;
                font-weight: 700;
                letter-spacing: 0.08em;
                text-transform: uppercase;
            }

            .login-card__meta strong {
                color: #162033;
                font-size: 1rem;
                font-weight: 800;
            }

            .login-card h1 {
                margin: 0 0 8px;
                color: #111827;
                font-size: 1.9rem;
                letter-spacing: -0.03em;
            }

            .login-card__intro {
                margin: 0 0 28px;
                color: #677489;
                font-size: 0.95rem;
                line-height: 1.6;
            }

            .login-form {
                display: grid;
                gap: 16px;
            }

            .login-form__field {
                display: grid;
                gap: 8px;
            }

            .login-form__field label {
                color: #344154;
                font-size: 0.84rem;
                font-weight: 700;
            }

            .login-form__field input {
                width: 100%;
                min-height: 52px;
                border: 1px solid #cfd8e3;
                border-radius: 16px;
                background: #ffffff;
                padding: 0 16px;
                color: #162033;
                font: inherit;
                font-size: 0.95rem;
                outline: none;
                box-shadow: none;
                transition: border-color 0.2s ease, background-color 0.2s ease;
            }

            .login-form__password-wrap {
                position: relative;
            }

            .login-form__password-wrap input {
                padding-right: 48px;
            }

            .login-form__toggle {
                position: absolute;
                top: 50%;
                right: 12px;
                transform: translateY(-50%);
                width: 32px;
                height: 32px;
                border: none;
                border-radius: 10px;
                background: transparent;
                color: #677489;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
            }

            .login-form__toggle svg {
                width: 18px;
                height: 18px;
                fill: none;
                stroke: currentColor;
                stroke-width: 1.9;
                stroke-linecap: round;
                stroke-linejoin: round;
            }

            .login-form__field input:focus {
                border-color: #162033;
                background: #fcfdff;
            }

            .login-form__field input.is-invalid {
                border-color: #c94f4f;
                background: #fff9f9;
            }

            .login-form__error {
                color: #c94f4f;
                font-size: 0.78rem;
                line-height: 1.35;
            }

            .login-form__success {
                border: 1px solid #b9e3d2;
                border-radius: 14px;
                background: #eefbf5;
                color: #176447;
                padding: 12px 14px;
                font-size: 0.82rem;
                line-height: 1.4;
            }

            .login-form__row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 14px;
                flex-wrap: wrap;
                margin-top: 2px;
            }

            .login-form__check {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                color: #556274;
                font-size: 0.84rem;
            }

            .login-form__check input {
                width: 16px;
                height: 16px;
                margin: 0;
                accent-color: #162033;
            }

            .login-form__link {
                color: #162033;
                font-size: 0.84rem;
                font-weight: 700;
                text-decoration: none;
            }

            .login-form__submit {
                min-height: 54px;
                border: none;
                border-radius: 16px;
                background: #162033;
                color: #ffffff;
                font: inherit;
                font-size: 0.95rem;
                font-weight: 700;
                cursor: pointer;
            }

            .login-form__submit:disabled {
                opacity: 0.72;
                cursor: wait;
            }

            .login-form__footer {
                margin: 6px 0 0;
                color: #677489;
                font-size: 0.86rem;
                text-align: center;
            }

            .login-form__footer a {
                color: #162033;
                font-weight: 700;
                text-decoration: none;
            }

            @media (max-width: 980px) {
                .login-page { padding: 24px; }

                .login-card {
                    padding: 24px;
                    border-radius: 22px;
                }
            }
        `,
        render: ({ escapeHtml }) => `
            <section class="login-page">
                <div class="login-page__panel">
                    <section class="login-card">
                        <div class="login-card__brand">
                            <div class="login-card__brand-wrap">
                                <div class="login-card__logo" aria-hidden="true">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M4 18V9l4-3 4 3v9"></path>
                                        <path d="M12 18V6l4-3 4 3v12"></path>
                                    </svg>
                                </div>
                                <div class="login-card__meta">
                                    <span>Welcome Back</span>
                                    <strong>Login to your account</strong>
                                </div>
                            </div>
                        </div>
                        <h1>Sign in</h1>
                        <p class="login-card__intro">Use your work email and password to access the construction dashboard.</p>
                        <form class="login-form" novalidate>
                            ${state.successMessage ? `<div class="login-form__success">${escapeHtml(state.successMessage)}</div>` : ""}
                            <div class="login-form__field">
                                <label for="loginEmail">Email address</label>
                                <input id="loginEmail" data-login-email type="email" placeholder="name@company.com" value="${escapeHtml(state.email)}" class="${state.errors.email ? "is-invalid" : ""}">
                                ${state.errors.email ? `<div class="login-form__error">${escapeHtml(state.errors.email)}</div>` : ""}
                            </div>
                            <div class="login-form__field">
                                <label for="loginPassword">Password</label>
                                <div class="login-form__password-wrap">
                                    <input id="loginPassword" data-login-password type="${state.showPassword ? "text" : "password"}" placeholder="Enter your password" value="${escapeHtml(state.password)}" class="${state.errors.password ? "is-invalid" : ""}">
                                    <button class="login-form__toggle" data-login-toggle-password type="button" aria-label="${state.showPassword ? "Hide password" : "Show password"}">
                                        <svg viewBox="0 0 24 24" aria-hidden="true">
                                            ${state.showPassword
                                                ? `<path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"></path><circle cx="12" cy="12" r="2.5"></circle>`
                                                : `<path d="M3 3 21 21"></path><path d="M10.6 10.7A3 3 0 0 0 14 13.4"></path><path d="M9.9 5.1A10.4 10.4 0 0 1 12 5c5.5 0 9 7 9 7a17.6 17.6 0 0 1-3.2 3.8"></path><path d="M6.2 6.2A17.2 17.2 0 0 0 3 12s3.5 7 9 7a9.7 9.7 0 0 0 4.2-.9"></path>`
                                            }
                                        </svg>
                                    </button>
                                </div>
                                ${state.errors.password ? `<div class="login-form__error">${escapeHtml(state.errors.password)}</div>` : ""}
                            </div>
                            <div class="login-form__row">
                                <label class="login-form__check">
                                    <input type="checkbox">
                                    <span>Keep me signed in</span>
                                </label>
                                <a class="login-form__link" href="#">Forgot password?</a>
                            </div>
                            <button class="login-form__submit" data-login-submit type="button" ${state.isSubmitting ? "disabled" : ""}>${state.isSubmitting ? "Signing in..." : "Login"}</button>
                        <p class="login-form__footer">Need an account? <a href="/#signup" data-auth-route="signup">Sign up</a></p>
                        </form>
                    </section>
                </div>
            </section>
        `,
        onClick: (event) => {
            const clickTarget = event.target instanceof Element ? event.target : event.target?.parentElement;
            if (!clickTarget) {
                return false;
            }

            const togglePasswordButton = clickTarget.closest("[data-login-toggle-password]");
            if (togglePasswordButton) {
                state.showPassword = !state.showPassword;
                rerenderLoginPage();
                return true;
            }

            const submitButton = clickTarget.closest("[data-login-submit]");
            const authRouteLink = clickTarget.closest("[data-auth-route]");
            if (authRouteLink) {
                const targetRoute = authRouteLink.getAttribute("data-auth-route");
                if (typeof window.__jobManagementNavigateToPage === "function" && targetRoute) {
                    window.__jobManagementNavigateToPage(targetRoute);
                }
                return true;
            }

            if (!submitButton) {
                return false;
            }

            state.errors = validate();
            state.successMessage = "";

            if (Object.keys(state.errors).length) {
                rerenderLoginPage();
                return true;
            }

            state.isSubmitting = true;
            rerenderLoginPage();

            window.__jobManagementAuth?.login({
                email: state.email.trim(),
                password: state.password
            }).then(() => {
                state.isSubmitting = false;
                state.password = "";
                state.errors = {};
                window.__jobManagementShowToast?.("Login successful.", "success");
                window.__jobManagementNavigateToPage?.("dashboard");
            }).catch((error) => {
                state.isSubmitting = false;
                window.__jobManagementShowToast?.(error.message || "Login failed.", "error");
                rerenderLoginPage();
            });

            return true;
        },
        onChange: (event) => {
            const changeTarget = event.target instanceof HTMLInputElement ? event.target : null;
            if (!changeTarget) {
                return false;
            }

            if (changeTarget.matches("[data-login-email]")) {
                state.email = changeTarget.value;
                delete state.errors.email;
                state.successMessage = "";
                rerenderLoginPage();
                return true;
            }

            if (changeTarget.matches("[data-login-password]")) {
                state.password = changeTarget.value;
                delete state.errors.password;
                state.successMessage = "";
                rerenderLoginPage();
                return true;
            }

            return false;
        }
    };
})();

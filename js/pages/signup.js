window.pageModules = window.pageModules || {};

window.pageModules.signup = (() => {
    const roles = ["admin", "office", "contractor", "field"];

    const state = {
        name: "",
        email: "",
        role: "admin",
        password: "",
        showPassword: false,
        isSubmitting: false,
        errors: {},
        successMessage: ""
    };

    function rerenderSignupPage() {
        if (typeof window.__jobManagementRenderActivePage === "function") {
            window.__jobManagementRenderActivePage();
        }
    }

    function validate() {
        const errors = {};
        const email = state.email.trim();

        if (!state.name.trim()) {
            errors.name = "Full name is required.";
        }

        if (!email) {
            errors.email = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = "Enter a valid email address.";
        }

        if (!state.role) {
            errors.role = "Role is required.";
        }

        if (!state.password) {
            errors.password = "Password is required.";
        } else if (state.password.length < 6) {
            errors.password = "Password must be at least 6 characters.";
        }

        return errors;
    }

    return {
        title: "Sign Up",
        search: "Search...",
        style: `
            .signup-page {
                min-height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background:
                    radial-gradient(circle at top left, rgba(221, 231, 248, 0.78), transparent 36%),
                    linear-gradient(180deg, #f8fafc 0%, #eff3f7 100%);
                padding: 32px;
            }

            .signup-page__panel {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
            }

            .signup-card {
                width: min(100%, 560px);
                background: #ffffff;
                border: 1px solid #d8e0ea;
                border-radius: 28px;
                padding: 34px;
            }

            .signup-card__brand {
                display: flex;
                align-items: center;
                gap: 14px;
                margin-bottom: 26px;
            }

            .signup-card__logo {
                width: 48px;
                height: 48px;
                border-radius: 16px;
                display: grid;
                place-items: center;
                background: #162033;
                color: #ffffff;
            }

            .signup-card__logo svg {
                width: 24px;
                height: 24px;
                fill: none;
                stroke: currentColor;
                stroke-width: 2;
            }

            .signup-card__meta span {
                display: block;
                margin-bottom: 4px;
                color: #6f7d91;
                font-size: 0.74rem;
                font-weight: 700;
                letter-spacing: 0.08em;
                text-transform: uppercase;
            }

            .signup-card__meta strong {
                color: #162033;
                font-size: 1rem;
                font-weight: 800;
            }

            .signup-card h1 {
                margin: 0 0 8px;
                color: #111827;
                font-size: 1.85rem;
                letter-spacing: -0.03em;
            }

            .signup-card__intro {
                margin: 0 0 28px;
                color: #677489;
                font-size: 0.95rem;
                line-height: 1.6;
            }

            .signup-form {
                display: grid;
                gap: 16px;
            }

            .signup-form__split {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 14px;
            }

            .signup-form__field {
                display: grid;
                gap: 8px;
            }

            .signup-form__field label {
                color: #344154;
                font-size: 0.84rem;
                font-weight: 700;
            }

            .signup-form__field input,
            .signup-form__field select {
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

            .signup-form__password-wrap {
                position: relative;
            }

            .signup-form__password-wrap input {
                padding-right: 48px;
            }

            .signup-form__toggle {
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

            .signup-form__toggle svg {
                width: 18px;
                height: 18px;
                fill: none;
                stroke: currentColor;
                stroke-width: 1.9;
                stroke-linecap: round;
                stroke-linejoin: round;
            }

            .signup-form__field input:focus,
            .signup-form__field select:focus {
                border-color: #162033;
                background: #fcfdff;
            }

            .signup-form__field input.is-invalid,
            .signup-form__field select.is-invalid {
                border-color: #c94f4f;
                background: #fff9f9;
            }

            .signup-form__error {
                color: #c94f4f;
                font-size: 0.78rem;
                line-height: 1.35;
            }

            .signup-form__success {
                border: 1px solid #b9e3d2;
                border-radius: 14px;
                background: #eefbf5;
                color: #176447;
                padding: 12px 14px;
                font-size: 0.82rem;
                line-height: 1.4;
            }

            .signup-form__submit {
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

            .signup-form__submit:disabled {
                opacity: 0.72;
                cursor: wait;
            }

            .signup-form__footer {
                margin: 6px 0 0;
                color: #677489;
                font-size: 0.86rem;
                text-align: center;
            }

            .signup-form__footer a {
                color: #162033;
                font-weight: 700;
                text-decoration: none;
            }

            @media (max-width: 980px) {
                .signup-page { padding: 24px; }
                .signup-form__split { grid-template-columns: 1fr; }

                .signup-card {
                    padding: 24px;
                    border-radius: 22px;
                }
            }
        `,
        render: ({ escapeHtml }) => `
            <section class="signup-page">
                <div class="signup-page__panel">
                    <section class="signup-card">
                        <div class="signup-card__brand">
                            <div class="signup-card__logo" aria-hidden="true">
                                <svg viewBox="0 0 24 24">
                                    <path d="M4 18V9l4-3 4 3v9"></path>
                                    <path d="M12 18V6l4-3 4 3v12"></path>
                                </svg>
                            </div>
                            <div class="signup-card__meta">
                                <span>New Account</span>
                                <strong>Create portal access</strong>
                            </div>
                        </div>
                        <h1>Sign up</h1>
                        <p class="signup-card__intro">Create a new account with the right role and access level for your workflow.</p>
                        <form class="signup-form" novalidate>
                            ${state.successMessage ? `<div class="signup-form__success">${escapeHtml(state.successMessage)}</div>` : ""}
                            <div class="signup-form__field">
                                <label for="signupName">Full name</label>
                                <input id="signupName" data-signup-name type="text" placeholder="Enter full name" value="${escapeHtml(state.name)}" class="${state.errors.name ? "is-invalid" : ""}">
                                ${state.errors.name ? `<div class="signup-form__error">${escapeHtml(state.errors.name)}</div>` : ""}
                            </div>
                            <div class="signup-form__field">
                                <label for="signupEmail">Email address</label>
                                <input id="signupEmail" data-signup-email type="email" placeholder="name@company.com" value="${escapeHtml(state.email)}" class="${state.errors.email ? "is-invalid" : ""}">
                                ${state.errors.email ? `<div class="signup-form__error">${escapeHtml(state.errors.email)}</div>` : ""}
                            </div>
                            <div class="signup-form__field">
                                <label for="signupRole">Role</label>
                                <select id="signupRole" data-signup-role class="${state.errors.role ? "is-invalid" : ""}">
                                    ${roles.map((role) => `<option value="${role}" ${state.role === role ? "selected" : ""}>${role}</option>`).join("")}
                                </select>
                                ${state.errors.role ? `<div class="signup-form__error">${escapeHtml(state.errors.role)}</div>` : ""}
                            </div>
                            <div class="signup-form__field">
                                <label for="signupPassword">Password</label>
                                <div class="signup-form__password-wrap">
                                    <input id="signupPassword" data-signup-password type="${state.showPassword ? "text" : "password"}" placeholder="Create password" value="${escapeHtml(state.password)}" class="${state.errors.password ? "is-invalid" : ""}">
                                    <button class="signup-form__toggle" data-signup-toggle-password type="button" aria-label="${state.showPassword ? "Hide password" : "Show password"}">
                                        <svg viewBox="0 0 24 24" aria-hidden="true">
                                            ${state.showPassword
                                                ? `<path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"></path><circle cx="12" cy="12" r="2.5"></circle>`
                                                : `<path d="M3 3 21 21"></path><path d="M10.6 10.7A3 3 0 0 0 14 13.4"></path><path d="M9.9 5.1A10.4 10.4 0 0 1 12 5c5.5 0 9 7 9 7a17.6 17.6 0 0 1-3.2 3.8"></path><path d="M6.2 6.2A17.2 17.2 0 0 0 3 12s3.5 7 9 7a9.7 9.7 0 0 0 4.2-.9"></path>`
                                            }
                                        </svg>
                                    </button>
                                </div>
                                ${state.errors.password ? `<div class="signup-form__error">${escapeHtml(state.errors.password)}</div>` : ""}
                            </div>
                            <button class="signup-form__submit" data-signup-submit type="button" ${state.isSubmitting ? "disabled" : ""}>${state.isSubmitting ? "Creating..." : "Create account"}</button>
                            <p class="signup-form__footer">Already have an account? <a href="/#login" data-auth-route="login">Login</a></p>
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

            const togglePasswordButton = clickTarget.closest("[data-signup-toggle-password]");
            if (togglePasswordButton) {
                state.showPassword = !state.showPassword;
                rerenderSignupPage();
                return true;
            }

            const submitButton = clickTarget.closest("[data-signup-submit]");
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
                rerenderSignupPage();
                return true;
            }

            state.isSubmitting = true;
            rerenderSignupPage();

            window.__jobManagementAuth?.signup({
                name: state.name.trim(),
                email: state.email.trim(),
                password: state.password,
                role: state.role
            }).then(() => {
                state.isSubmitting = false;
                state.errors = {};
                state.password = "";
                window.__jobManagementShowToast?.("Account created successfully.", "success");
                window.__jobManagementNavigateToPage?.("dashboard");
            }).catch((error) => {
                state.isSubmitting = false;
                window.__jobManagementShowToast?.(error.message || "Signup failed.", "error");
                rerenderSignupPage();
            });

            return true;
        },
        onChange: (event) => {
            const target = event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement
                ? event.target
                : null;

            if (!target) {
                return false;
            }

            if (target.matches("[data-signup-name]")) {
                state.name = target.value;
                delete state.errors.name;
            } else if (target.matches("[data-signup-email]")) {
                state.email = target.value;
                delete state.errors.email;
            } else if (target.matches("[data-signup-role]")) {
                state.role = target.value;
                delete state.errors.role;
            } else if (target.matches("[data-signup-password]")) {
                state.password = target.value;
                delete state.errors.password;
            } else {
                return false;
            }

            state.successMessage = "";
            rerenderSignupPage();
            return true;
        }
    };
})();

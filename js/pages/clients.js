window.pageModules = window.pageModules || {};

window.pageModules.clients = (() => {
    const state = {
        expandedClientId: null,
        isCreateModalOpen: false,
        modalMode: "create",
        editingClientId: null,
        isModalClosing: false,
        draft: {
            name: "",
            phone: "",
            email: "",
            address: "",
            notes: ""
        }
    };

    const clients = [
        {
            id: 1,
            code: "MS",
            codeClass: "clients-card__avatar--blue",
            name: "MSV",
            phone: "0161 254 3100",
            email: "works@msv.org.uk",
            address: "Parsonage House, Wythenshawe, M22 9GA",
            note: "Main housing association client. Priority response required on all disrepair.",
            totalJobs: 6,
            active: 4,
            snagging: 1,
            pipeline: 19200,
            jobs: [
                {
                    address: "7 Maple Street SK1 2EF",
                    type: "Planned Works",
                    contractor: "B&G Contractors",
                    status: "In Progress",
                    value: 3900
                },
                {
                    address: "8 Willow Court M20 6NP",
                    type: "Disrepair",
                    contractor: "B&G Contractors",
                    status: "Complete",
                    value: 1400
                }
            ]
        },
        {
            id: 2,
            code: "WY",
            codeClass: "clients-card__avatar--green",
            name: "Wythenshawe Community",
            phone: "0161 498 6500",
            email: "maintenance@wchg.org.uk",
            address: "Simonsway, Wythenshawe, M22 2JR",
            note: "Large volume of planned works. Quarterly review meetings.",
            totalJobs: 2,
            active: 1,
            snagging: 0,
            pipeline: 5300,
            jobs: [
                {
                    address: "14 Birchwood Close M22 4PR",
                    type: "Disrepair",
                    contractor: "B&G Contractors",
                    status: "In Progress",
                    value: 2850
                }
            ]
        },
        {
            id: 3,
            code: "ST",
            codeClass: "clients-card__avatar--purple",
            name: "Stockport Homes",
            phone: "0161 217 6016",
            email: "repairs@stockporthomes.org",
            address: "1 Wellington Street, Stockport, SK1 3AB",
            note: "Emergency callouts within 24hrs. Portal login required for all jobs.",
            totalJobs: 0,
            active: 0,
            snagging: 0,
            pipeline: 0,
            jobs: []
        }
    ];

    function getInitialDraft() {
        return {
            name: "",
            phone: "",
            email: "",
            address: "",
            notes: ""
        };
    }

    function getClientCode(name) {
        const cleaned = String(name || "")
            .trim()
            .split(/\s+/)
            .map((part) => part[0] || "")
            .join("")
            .slice(0, 2)
            .toUpperCase();

        return cleaned || "NC";
    }

    function getAvatarClass(index) {
        const avatarClasses = [
            "clients-card__avatar--blue",
            "clients-card__avatar--green",
            "clients-card__avatar--purple"
        ];

        return avatarClasses[index % avatarClasses.length];
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: "GBP",
            maximumFractionDigits: 0
        }).format(value);
    }

    function escapeAttribute(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    function getTypeClass(type) {
        return `clients-pill--type-${String(type).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    }

    function getStatusClass(status) {
        return `clients-pill--status-${String(status).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    }

    function renderJobs(client, escapeHtml) {
        if (!client.jobs.length) {
            return `<p class="clients-empty">No jobs for this client yet.</p>`;
        }

        return `
            <div class="clients-jobs__title">Active jobs (${client.totalJobs})</div>
            <div class="clients-jobs__table-wrap">
                <table class="clients-jobs__table">
                    <thead>
                        <tr>
                            <th>Address</th>
                            <th>Type</th>
                            <th>Contractor</th>
                            <th>Status</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${client.jobs.map((job) => `
                            <tr>
                                <td data-label="Address">${escapeHtml(job.address)}</td>
                                <td data-label="Type"><span class="clients-pill ${getTypeClass(job.type)}">${escapeHtml(job.type)}</span></td>
                                <td data-label="Contractor"><span class="clients-pill clients-pill--contractor">${escapeHtml(job.contractor)}</span></td>
                                <td data-label="Status"><span class="clients-pill ${getStatusClass(job.status)}">${escapeHtml(job.status)}</span></td>
                                <td data-label="Value" class="clients-jobs__value">${escapeHtml(formatCurrency(job.value))}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
    }

    function renderCreateModal(escapeHtml) {
        if (!state.isCreateModalOpen) {
            return "";
        }

        const isEditMode = state.modalMode === "edit";

        return `
            <div class="clients-modal" role="dialog" aria-modal="true" aria-labelledby="newClientTitle">
                <div class="clients-modal__backdrop${state.isModalClosing ? " is-closing" : ""}" data-close-client-modal="true"></div>
                <div class="clients-modal__panel${state.isModalClosing ? " is-closing" : ""}">
                    <div class="clients-modal__header">
                        <h3 id="newClientTitle" class="clients-modal__title">${isEditMode ? "Edit client" : "New client"}</h3>
                    </div>
                    <div class="clients-modal__body">
                        <label class="clients-field">
                            <span class="clients-field__label">Client name *</span>
                            <input
                                class="clients-field__input"
                                type="text"
                                placeholder="e.g. MSV"
                                data-client-field="name"
                                value="${escapeAttribute(state.draft.name)}"
                            >
                        </label>
                        <div class="clients-modal__grid">
                            <label class="clients-field">
                                <span class="clients-field__label">Phone</span>
                                <input
                                    class="clients-field__input"
                                    type="text"
                                    placeholder="0161 xxx xxxx"
                                    data-client-field="phone"
                                    value="${escapeAttribute(state.draft.phone)}"
                                >
                            </label>
                            <label class="clients-field">
                                <span class="clients-field__label">Email</span>
                                <input
                                    class="clients-field__input"
                                    type="email"
                                    placeholder="contact@client.co.uk"
                                    data-client-field="email"
                                    value="${escapeAttribute(state.draft.email)}"
                                >
                            </label>
                        </div>
                        <label class="clients-field">
                            <span class="clients-field__label">Address</span>
                            <input
                                class="clients-field__input"
                                type="text"
                                placeholder="Head office address"
                                data-client-field="address"
                                value="${escapeAttribute(state.draft.address)}"
                            >
                        </label>
                        <label class="clients-field">
                            <span class="clients-field__label">Notes</span>
                            <textarea
                                class="clients-field__input clients-field__input--textarea"
                                placeholder="Internal notes about this client..."
                                data-client-field="notes"
                            >${escapeHtml(state.draft.notes)}</textarea>
                        </label>
                    </div>
                    <div class="clients-modal__footer">
                        <button class="clients-modal__button clients-modal__button--ghost" type="button" data-close-client-modal="true">Cancel</button>
                        <button class="clients-modal__button clients-modal__button--solid" type="button" data-save-client="true">Save client</button>
                    </div>
                </div>
            </div>
        `;
    }

    function closeModal(rerender) {
        state.isModalClosing = true;
        rerender();

        window.setTimeout(() => {
            state.isCreateModalOpen = false;
            state.isModalClosing = false;
            state.modalMode = "create";
            state.editingClientId = null;
            rerender();
        }, 180);
    }

    return {
        title: "Clients",
        search: "Search clients...",
        style: `
            .clients-page {
                display: flex;
                flex-direction: column;
                gap: 16px;
                padding: 0;
            }

            .page-layout.clients-page-layout {
                padding-top: 30px;
            }

            .clients-page__toolbar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
            }

            .clients-page__title {
                margin: 0;
                font-size: 1.6rem;
                color: #18243d;
                font-weight: 700;
            }

            .clients-page__action {
                border: 0;
                border-radius: 8px;
                padding: 11px 16px;
                background: #161616;
                color: #ffffff;
                font: inherit;
                font-weight: 700;
                cursor: pointer;
                box-shadow: 0 10px 22px rgba(24, 36, 61, 0.12);
            }

            .clients-page__action:hover,
            .clients-card__button--solid:hover,
            .clients-modal__button--solid:hover {
                opacity: 0.92;
            }

            .clients-page__action,
            .clients-card__button,
            .clients-modal__button {
                transition:
                    background-color 0.2s ease,
                    color 0.2s ease,
                    border-color 0.2s ease,
                    box-shadow 0.2s ease,
                    transform 0.18s ease,
                    opacity 0.2s ease;
            }

            .clients-page__action:hover,
            .clients-card__button:hover,
            .clients-modal__button:hover {
                transform: translateY(-1px);
            }

            .clients-page__action:hover,
            .clients-card__button--solid:hover,
            .clients-modal__button--solid:hover {
                background: #2a2a2a;
                border-color: #2a2a2a;
                box-shadow: 0 12px 24px rgba(24, 36, 61, 0.18);
            }

            .clients-card__button--ghost:hover,
            .clients-modal__button--ghost:hover {
                background: #fff0e1;
                border-color: #cbb8a3;
                color: #18243d;
                box-shadow: 0 8px 18px rgba(24, 36, 61, 0.08);
            }

            .clients-page__action:active,
            .clients-card__button:active,
            .clients-modal__button:active {
                transform: translateY(0);
            }

            .clients-list {
                display: flex;
                flex-direction: column;
                gap: 14px;
            }

            .clients-card {
                background: #ffffff;
                border: 1px solid #d9dfec;
                border-left: 3px solid #2f6df6;
                border-radius: 14px;
                padding: 14px 14px 12px;
                box-shadow: 0 10px 28px rgba(24, 36, 61, 0.08);
            }

            .clients-card.is-expanded {
                padding-bottom: 16px;
            }

            .clients-card__top {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 14px;
            }

            .clients-card__identity {
                display: flex;
                gap: 12px;
                min-width: 0;
                flex: 1;
            }

            .clients-card__avatar {
                width: 30px;
                height: 30px;
                border-radius: 9px;
                display: grid;
                place-items: center;
                font-size: 0.8rem;
                font-weight: 700;
                flex-shrink: 0;
            }

            .clients-card__avatar--blue {
                background: #edf4ff;
                color: #3b6be0;
            }

            .clients-card__avatar--green {
                background: #e7f7ee;
                color: #297a4a;
            }

            .clients-card__avatar--purple {
                background: #f2edff;
                color: #6c57c7;
            }

            .clients-card__details {
                min-width: 0;
            }

            .clients-card__name {
                margin: 0;
                color: #18243d;
                font-size: 1rem;
                font-weight: 700;
            }

            .clients-card__meta,
            .clients-card__address {
                margin: 2px 0 0;
                color: #6f7a8f;
                font-size: 0.76rem;
                line-height: 1.45;
                word-break: break-word;
            }

            .clients-card__actions {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-shrink: 0;
            }

            .clients-card__button {
                border-radius: 7px;
                padding: 8px 12px;
                font: inherit;
                font-size: 0.78rem;
                font-weight: 700;
                cursor: pointer;
            }

            .clients-card__button--ghost {
                border: 1px solid #d6dbe7;
                background: #fff8f2;
                color: #18243d;
            }

            .clients-card__button--solid {
                border: 1px solid #161616;
                background: #161616;
                color: #ffffff;
            }

            .clients-card__note {
                margin: 12px 0 0;
                padding: 10px 12px;
                border-radius: 8px;
                background: #f4f5f7;
                color: #6f7a8f;
                font-size: 0.78rem;
                line-height: 1.45;
            }

            .clients-card__stats {
                margin-top: 12px;
                display: grid;
                grid-template-columns: repeat(4, minmax(0, 1fr));
                gap: 10px;
            }

            .clients-stat {
                border-radius: 8px;
                background: #f5f5f5;
                padding: 10px 12px;
                min-height: 66px;
                border: 1px solid transparent;
            }

            .clients-stat--highlight {
                background: #fff4e7;
                border-color: #f0c17d;
            }

            .clients-stat__label {
                display: block;
                color: #8b94a8;
                font-size: 0.7rem;
                text-transform: lowercase;
                margin-bottom: 8px;
            }

            .clients-stat__value {
                display: block;
                color: #1a8a66;
                font-size: 1.2rem;
                font-weight: 700;
                line-height: 1;
            }

            .clients-stat__value--warning {
                color: #d17f1a;
            }

            .clients-stat__value--money {
                color: #628500;
            }

            .clients-jobs {
                margin-top: 14px;
                padding-top: 12px;
                padding-bottom: 10px;
                border-top: 1px solid #e4e7ef;
                max-height: 520px;
                opacity: 1;
                overflow: hidden;
                transform: translateY(0);
                transition:
                    max-height 0.34s ease,
                    opacity 0.24s ease,
                    transform 0.28s ease,
                    margin-top 0.28s ease,
                    padding-top 0.28s ease,
                    border-top-color 0.2s ease;
            }

            .clients-jobs.is-collapsed {
                max-height: 0;
                opacity: 0;
                transform: translateY(-8px);
                margin-top: 0;
                padding-top: 0;
                border-top-color: transparent;
            }

            .clients-jobs__title {
                margin-bottom: 10px;
                color: #18243d;
                font-size: 0.76rem;
                font-weight: 700;
            }

            .clients-jobs__table-wrap {
                overflow-x: auto;
            }

            .clients-jobs__table {
                width: 100%;
                border-collapse: collapse;
                min-width: 620px;
            }

            .clients-jobs__table th {
                padding: 0 0 8px;
                color: #8b94a8;
                font-size: 0.62rem;
                font-weight: 700;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                text-align: left;
            }

            .clients-jobs__table td {
                padding: 10px 0;
                border-top: 1px solid #edf0f5;
                color: #18243d;
                font-size: 0.78rem;
                font-weight: 600;
                vertical-align: middle;
            }

            .clients-jobs__table tbody tr:last-child td {
                padding-bottom: 4px;
            }

            .clients-jobs__value {
                white-space: nowrap;
            }

            .clients-pill {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border-radius: 999px;
                min-height: 24px;
                padding: 4px 10px;
                font-size: 0.72rem;
                font-weight: 700;
                line-height: 1;
                white-space: nowrap;
            }

            .clients-pill--contractor {
                background: #ffe9c8;
                color: #8a5a00;
            }

            .clients-pill--type-planned-works {
                background: #efe8d1;
                color: #7b6322;
            }

            .clients-pill--type-disrepair {
                background: #f7dce7;
                color: #94456b;
            }

            .clients-pill--status-in-progress {
                background: #dff5ea;
                color: #1f7b54;
            }

            .clients-pill--status-complete {
                background: #eef5d8;
                color: #648200;
            }

            .clients-empty {
                margin: 12px 0 0;
                padding-top: 12px;
                border-top: 1px solid #e4e7ef;
                color: #7a8397;
                font-size: 0.8rem;
            }

            .clients-modal {
                position: fixed;
                inset: 0;
                z-index: 40;
                display: grid;
                place-items: center;
                padding: 24px;
            }

            .clients-modal__backdrop {
                position: absolute;
                inset: 0;
                background: rgba(30, 36, 46, 0.42);
                animation: clients-modal-fade-in 0.18s ease forwards;
            }

            .clients-modal__panel {
                position: relative;
                width: min(100%, 560px);
                background: #ffffff;
                border: 1px solid #e2e6ef;
                border-radius: 14px;
                padding: 22px 22px 20px;
                box-shadow: 0 28px 70px rgba(24, 36, 61, 0.22);
                transform-origin: top center;
                animation: clients-modal-panel-in 0.22s ease forwards;
            }

            .clients-modal__backdrop.is-closing {
                animation: clients-modal-fade-out 0.18s ease forwards;
            }

            .clients-modal__panel.is-closing {
                animation: clients-modal-panel-out 0.18s ease forwards;
            }

            .clients-modal__title {
                margin: 0;
                color: #18243d;
                font-size: 1.65rem;
                font-weight: 700;
            }

            .clients-modal__body {
                display: flex;
                flex-direction: column;
                gap: 14px;
                margin-top: 18px;
            }

            .clients-modal__grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 12px;
            }

            .clients-field {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .clients-field__label {
                color: #4d5669;
                font-size: 0.95rem;
                font-weight: 500;
            }

            .clients-field__input {
                width: 100%;
                border: 1px solid #cdd4e2;
                border-radius: 10px;
                padding: 13px 14px;
                color: #18243d;
                background: #ffffff;
                font: inherit;
                outline: none;
            }

            .clients-field__input::placeholder {
                color: #8e96a8;
            }

            .clients-field__input:focus {
                border-color: #2f6df6;
                box-shadow: 0 0 0 3px rgba(47, 109, 246, 0.12);
            }

            .clients-field__input--textarea {
                min-height: 110px;
                resize: vertical;
            }

            .clients-modal__footer {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                margin-top: 16px;
                padding-top: 14px;
                border-top: 1px solid #e7ebf2;
            }

            .clients-modal__button {
                border-radius: 10px;
                padding: 11px 16px;
                font: inherit;
                font-weight: 700;
                cursor: pointer;
            }

            .clients-modal__button--ghost {
                border: 1px solid #cfd5e2;
                background: #ffffff;
                color: #6f7a8f;
            }

            .clients-modal__button--solid {
                border: 1px solid #161616;
                background: #161616;
                color: #ffffff;
            }

            @keyframes clients-modal-fade-in {
                from {
                    opacity: 0;
                }

                to {
                    opacity: 1;
                }
            }

            @keyframes clients-modal-fade-out {
                from {
                    opacity: 1;
                }

                to {
                    opacity: 0;
                }
            }

            @keyframes clients-modal-panel-in {
                from {
                    opacity: 0;
                    transform: translateY(-18px) scale(0.98);
                }

                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            @keyframes clients-modal-panel-out {
                from {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }

                to {
                    opacity: 0;
                    transform: translateY(-12px) scale(0.985);
                }
            }

            @media (max-width: 900px) {
                .clients-card__stats {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                }
            }

            @media (max-width: 700px) {
                .clients-page {
                    padding: 16px;
                }

                .clients-page__toolbar,
                .clients-card__top {
                    flex-direction: column;
                    align-items: stretch;
                }

                .clients-modal__grid {
                    grid-template-columns: 1fr;
                }

                .clients-card__actions {
                    justify-content: flex-end;
                }

                .clients-jobs__table,
                .clients-jobs__table thead,
                .clients-jobs__table tbody,
                .clients-jobs__table tr,
                .clients-jobs__table th,
                .clients-jobs__table td {
                    display: block;
                }

                .clients-jobs__table {
                    min-width: 0;
                }

                .clients-jobs__table thead {
                    display: none;
                }

                .clients-jobs__table tr {
                    padding: 10px 0;
                    border-top: 1px solid #edf0f5;
                }

                .clients-jobs__table td {
                    border-top: 0;
                    padding: 4px 0;
                }

                .clients-jobs__table td::before {
                    content: attr(data-label);
                    display: block;
                    margin-bottom: 3px;
                    color: #8b94a8;
                    font-size: 0.65rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }
            }

            @media (max-width: 480px) {
                .clients-card__stats {
                    grid-template-columns: 1fr;
                }

                .clients-card__actions {
                    justify-content: stretch;
                }

                .clients-card__button,
                .clients-page__action,
                .clients-modal__button {
                    width: 100%;
                    text-align: center;
                }

                .clients-modal {
                    padding: 16px;
                }

                .clients-modal__footer {
                    flex-direction: column-reverse;
                }
            }
        `,
        render: ({ escapeHtml }) => `
            <section class="clients-page page-layout clients-page-layout">
                <div class="clients-page__toolbar">
                    <h2 class="clients-page__title">Clients</h2>
                    <button class="clients-page__action" type="button" data-open-client-modal="true">+ New Client</button>
                </div>
                <div class="clients-list">
                    ${clients.map((client) => {
                        const isExpanded = state.expandedClientId === client.id;

                        return `
                        <article class="clients-card${isExpanded ? " is-expanded" : ""}" data-client-id="${escapeAttribute(client.id)}">
                            <div class="clients-card__top">
                                <div class="clients-card__identity">
                                    <div class="clients-card__avatar ${client.codeClass}">${escapeHtml(client.code)}</div>
                                    <div class="clients-card__details">
                                        <h3 class="clients-card__name">${escapeHtml(client.name)}</h3>
                                        <p class="clients-card__meta">${escapeHtml(client.phone)} &nbsp;&nbsp; ${escapeHtml(client.email)}</p>
                                        <p class="clients-card__address">${escapeHtml(client.address)}</p>
                                    </div>
                                </div>
                                <div class="clients-card__actions">
                                    <button
                                        class="clients-card__button clients-card__button--ghost"
                                        type="button"
                                        data-edit-client="${escapeAttribute(client.id)}"
                                    >Edit</button>
                                    <button
                                        class="clients-card__button clients-card__button--solid"
                                        type="button"
                                        data-toggle-client-jobs="${escapeAttribute(client.id)}"
                                    >${isExpanded ? "Hide job" : "View job"}</button>
                                </div>
                            </div>
                            <div class="clients-card__note">${escapeHtml(client.note)}</div>
                            <div class="clients-card__stats">
                                <div class="clients-stat">
                                    <span class="clients-stat__label">total jobs</span>
                                    <span class="clients-stat__value">${escapeHtml(client.totalJobs)}</span>
                                </div>
                                <div class="clients-stat">
                                    <span class="clients-stat__label">active</span>
                                    <span class="clients-stat__value">${escapeHtml(client.active)}</span>
                                </div>
                                <div class="clients-stat clients-stat--highlight">
                                    <span class="clients-stat__label">snagging</span>
                                    <span class="clients-stat__value clients-stat__value--warning">${escapeHtml(client.snagging)}</span>
                                </div>
                                <div class="clients-stat">
                                    <span class="clients-stat__label">pipeline</span>
                                    <span class="clients-stat__value clients-stat__value--money">${escapeHtml(formatCurrency(client.pipeline))}</span>
                                </div>
                            </div>
                            <div class="clients-jobs${isExpanded ? "" : " is-collapsed"}" aria-hidden="${isExpanded ? "false" : "true"}">
                                ${renderJobs(client, escapeHtml)}
                            </div>
                        </article>
                    `;
                    }).join("")}
                </div>
                ${renderCreateModal(escapeHtml)}
            </section>
        `,
        onClick: (event, { rerender }) => {
            const openModalButton = event.target.closest("[data-open-client-modal]");
            const closeModalButton = event.target.closest("[data-close-client-modal]");
            const saveClientButton = event.target.closest("[data-save-client]");
            const editClientButton = event.target.closest("[data-edit-client]");
            const toggleButton = event.target.closest("[data-toggle-client-jobs]");

            if (openModalButton) {
                state.isCreateModalOpen = true;
                state.isModalClosing = false;
                state.modalMode = "create";
                state.editingClientId = null;
                state.draft = getInitialDraft();
                rerender();
                return;
            }

            if (editClientButton) {
                const clientId = Number(editClientButton.dataset.editClient);
                const client = clients.find((item) => item.id === clientId);

                if (!client) {
                    return;
                }

                state.isCreateModalOpen = true;
                state.isModalClosing = false;
                state.modalMode = "edit";
                state.editingClientId = clientId;
                state.draft = {
                    name: client.name,
                    phone: client.phone === "Not provided" ? "" : client.phone,
                    email: client.email === "Not provided" ? "" : client.email,
                    address: client.address === "Address not provided" ? "" : client.address,
                    notes: client.note === "No internal notes for this client yet." ? "" : client.note
                };
                rerender();
                return;
            }

            if (closeModalButton) {
                closeModal(rerender);
                return;
            }

            if (saveClientButton) {
                const name = state.draft.name.trim();

                if (!name) {
                    return;
                }

                if (state.modalMode === "edit" && state.editingClientId !== null) {
                    const client = clients.find((item) => item.id === state.editingClientId);

                    if (client) {
                        client.name = name;
                        client.code = getClientCode(name);
                        client.phone = state.draft.phone.trim() || "Not provided";
                        client.email = state.draft.email.trim() || "Not provided";
                        client.address = state.draft.address.trim() || "Address not provided";
                        client.note = state.draft.notes.trim() || "No internal notes for this client yet.";
                    }
                } else {
                    clients.unshift({
                        id: Date.now(),
                        code: getClientCode(name),
                        codeClass: getAvatarClass(clients.length),
                        name,
                        phone: state.draft.phone.trim() || "Not provided",
                        email: state.draft.email.trim() || "Not provided",
                        address: state.draft.address.trim() || "Address not provided",
                        note: state.draft.notes.trim() || "No internal notes for this client yet.",
                        totalJobs: 0,
                        active: 0,
                        snagging: 0,
                        pipeline: 0,
                        jobs: []
                    });
                }

                state.isCreateModalOpen = false;
                state.isModalClosing = false;
                state.modalMode = "create";
                state.editingClientId = null;
                state.draft = getInitialDraft();
                rerender();
                return;
            }

            if (!toggleButton) {
                return;
            }

            const clientId = Number(toggleButton.dataset.toggleClientJobs);
            const currentCard = toggleButton.closest(".clients-card");
            const currentJobs = currentCard?.querySelector(".clients-jobs");

            if (!currentCard || !currentJobs) {
                return;
            }

            const isCurrentlyExpanded = state.expandedClientId === clientId;
            const previousExpandedId = state.expandedClientId;
            state.expandedClientId = isCurrentlyExpanded ? null : clientId;

            document.querySelectorAll(".clients-card").forEach((card) => {
                const button = card.querySelector("[data-toggle-client-jobs]");
                const jobs = card.querySelector(".clients-jobs");
                const cardId = Number(card.dataset.clientId);

                if (!button || !jobs) {
                    return;
                }

                const shouldExpand = !isCurrentlyExpanded && cardId === clientId;
                const shouldCollapse = cardId === previousExpandedId || cardId === clientId;

                if (shouldExpand) {
                    card.classList.add("is-expanded");
                    jobs.classList.remove("is-collapsed");
                    jobs.setAttribute("aria-hidden", "false");
                    button.textContent = "Hide job";
                    jobs.style.maxHeight = `${jobs.scrollHeight + 20}px`;

                    window.setTimeout(() => {
                        jobs.style.maxHeight = `${jobs.scrollHeight + 20}px`;
                    }, 10);
                    return;
                }

                if (shouldCollapse || (previousExpandedId !== null && cardId === previousExpandedId)) {
                    card.classList.remove("is-expanded");
                    jobs.style.maxHeight = `${jobs.scrollHeight}px`;

                    window.requestAnimationFrame(() => {
                        jobs.classList.add("is-collapsed");
                        jobs.setAttribute("aria-hidden", "true");
                        jobs.style.maxHeight = "0px";
                    });

                    button.textContent = "View job";
                }
            });
        },
        onChange: (event) => {
            const field = event.target.closest("[data-client-field]");

            if (!field) {
                return;
            }

            state.draft[field.dataset.clientField] = field.value;
        }
    };
})();

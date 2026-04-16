window.pageModules = window.pageModules || {};

window.pageModules.reporting = (() => {
    const state = {
        performancePage: 1,
        performanceRowsPerPage: 10
    };

    const summaryCards = [
        { label: "Avg completion", value: "67%", tone: "green" },
        { label: "Started this month", value: "4", tone: "dark" },
        { label: "Overdue jobs", value: "0", tone: "red" },
        { label: "Unsigned completions", value: "0", tone: "amber" }
    ];

    const statusRows = [
        { label: "Needs Survey", count: 1, percent: 18, pillClass: "reporting-pill--blue" },
        { label: "Quoted", count: 1, percent: 22, pillClass: "reporting-pill--amber" },
        { label: "In Progress", count: 2, percent: 36, pillClass: "reporting-pill--green" },
        { label: "Needs Snagging", count: 1, percent: 22, pillClass: "reporting-pill--warn" },
        { label: "Contractor Review", count: 0, percent: 0, pillClass: "reporting-pill--sand" },
        { label: "Complete", count: 2, percent: 34, pillClass: "reporting-pill--lime" },
        { label: "Billed", count: 1, percent: 14, pillClass: "reporting-pill--violet" }
    ];

    const typeRows = [
        { label: "Disrepair", count: 5, percent: 62, pillClass: "reporting-pill--rose" },
        { label: "Planned Works", count: 3, percent: 41, pillClass: "reporting-pill--sand" }
    ];

    const performanceRows = [
        { initials: "HA", name: "Harmony", total: 7, inProgress: 2, complete: 2, progress: 61, photos: "None yet", avatarClass: "reporting-avatar--mint" },
        { initials: "JN", name: "John Nelson", total: 7, inProgress: 2, complete: 2, progress: 61, photos: "None yet", avatarClass: "reporting-avatar--amber" },
        { initials: "DF", name: "Dave (Field)", total: 7, inProgress: 2, complete: 2, progress: 61, photos: "None yet", avatarClass: "reporting-avatar--slate" }
    ];

    function getPerformancePagination() {
        const totalRows = performanceRows.length;
        const totalPages = Math.max(1, Math.ceil(totalRows / state.performanceRowsPerPage));
        const currentPage = Math.min(state.performancePage, totalPages);
        const startIndex = (currentPage - 1) * state.performanceRowsPerPage;
        const endIndex = startIndex + state.performanceRowsPerPage;

        return {
            totalRows,
            totalPages,
            currentPage,
            startIndex,
            endIndex,
            rows: performanceRows.slice(startIndex, endIndex)
        };
    }

    function rerenderReportingPage() {
        if (typeof window.__jobManagementRenderActivePage === "function") {
            window.__jobManagementRenderActivePage();
        }
    }

    return {
        title: "Reporting",
        search: "Search reporting...",
        style: `
            .reporting-page {
                display: flex;
                flex-direction: column;
                gap: 20px;
                padding-top: 30px;
            }

            .reporting-page__title {
                margin: 0;
                color: #121a26;
                font-size: 1.35rem;
                font-weight: 800;
            }

            .reporting-summary {
                display: grid;
                grid-template-columns: repeat(4, minmax(0, 1fr));
                gap: 12px;
            }

            .reporting-summary__card {
                position: relative;
                background: #ffffff;
                border: 1px solid #dde5f0;
                border-radius: 18px;
                padding: 16px 16px 18px;
                overflow: hidden;
                box-shadow: 0 14px 28px rgba(24, 36, 61, 0.05);
                transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
            }

            .reporting-summary__card::before {
                content: "";
                position: absolute;
                inset: 0 auto 0 0;
                width: 4px;
                border-radius: 18px 0 0 18px;
                background: #0f9f6e;
            }

            .reporting-summary__card--dark::before { background: #172033; }
            .reporting-summary__card--red::before { background: #ef5757; }
            .reporting-summary__card--amber::before { background: #f59e0b; }

            .reporting-summary__card span {
                display: block;
                margin-bottom: 8px;
                color: #6d7a8d;
                font-size: 0.82rem;
            }

            .reporting-summary__card strong {
                color: #101827;
                font-size: 1.1rem;
                font-weight: 800;
            }

            .reporting-summary__card--green strong { color: #159367; }
            .reporting-summary__card--red strong { color: #ef5757; }
            .reporting-summary__card--amber strong { color: #f59e0b; }

            .reporting-summary__card:hover {
                transform: translateY(-3px);
                border-color: #cfdbe8;
                box-shadow: 0 18px 32px rgba(24, 36, 61, 0.09);
            }

            .reporting-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 14px;
            }

            .reporting-card {
                background: #ffffff;
                border: 1px solid #dce5f0;
                border-radius: 18px;
                padding: 18px 18px 16px;
                box-shadow: 0 14px 28px rgba(24, 36, 61, 0.05);
            }

            .reporting-card__title {
                margin: 0 0 16px;
                color: #101827;
                font-size: 0.98rem;
                font-weight: 800;
            }

            .reporting-stat-list {
                display: flex;
                flex-direction: column;
                gap: 14px;
            }

            .reporting-stat-row {
                display: grid;
                grid-template-columns: auto minmax(0, 1fr) auto;
                align-items: center;
                gap: 12px;
            }

            .reporting-stat-row__track {
                height: 7px;
                border-radius: 999px;
                background: #eef2f7;
                overflow: hidden;
            }

            .reporting-stat-row__fill {
                display: block;
                height: 100%;
                border-radius: 999px;
                background: linear-gradient(90deg, #1ba276 0%, #2aa38f 100%);
            }

            .reporting-stat-row__fill--blue { background: linear-gradient(90deg, #4f96e7 0%, #3d83d8 100%); }
            .reporting-stat-row__fill--muted { background: #dbe4ee; }

            .reporting-pill {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-height: 26px;
                padding: 4px 10px;
                border-radius: 999px;
                font-size: 0.72rem;
                font-weight: 700;
                white-space: nowrap;
            }

            .reporting-pill--blue { background: #e7f2ff; color: #2f78d2; }
            .reporting-pill--amber { background: #fff1dc; color: #a76709; }
            .reporting-pill--green { background: #e6f8ef; color: #0e8a61; }
            .reporting-pill--warn { background: #fff2e3; color: #b56600; border: 1px solid #efc485; }
            .reporting-pill--sand { background: #f4ede2; color: #8d6a34; }
            .reporting-pill--lime { background: #eef8de; color: #658c18; }
            .reporting-pill--violet { background: #eee9ff; color: #6c57d2; }
            .reporting-pill--rose { background: #fdeaf0; color: #c15072; }

            .reporting-card__divider {
                height: 1px;
                background: #e7ebf1;
                margin: 16px 0 14px;
            }

            .reporting-contractor {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                color: #69778c;
                font-size: 0.86rem;
            }

            .reporting-contractor strong {
                color: #172033;
                font-weight: 800;
            }

            .reporting-empty {
                color: #8a96a8;
                font-size: 0.9rem;
            }

            .reporting-table {
                width: 100%;
                border-collapse: collapse;
            }

            .reporting-table th,
            .reporting-table td {
                padding: 12px 8px;
                border-bottom: 1px solid #edf1f6;
                text-align: left;
                vertical-align: middle;
            }

            .reporting-table tbody tr:last-child td {
                border-bottom: none;
            }

            .reporting-table th {
                color: #7b8798;
                font-size: 0.72rem;
                font-weight: 700;
                letter-spacing: 0.06em;
                text-transform: uppercase;
            }

            .reporting-table td {
                color: #162234;
                font-size: 0.84rem;
            }

            .reporting-button {
                border: 1px solid #cad2de;
                background: #ffffff;
                color: #182233;
                border-radius: 12px;
                min-height: 38px;
                padding: 0 14px;
                font: inherit;
                font-size: 0.84rem;
                font-weight: 700;
                cursor: pointer;
            }

            .reporting-performance {
                background: linear-gradient(180deg, #ffffff 0%, #fbfcfe 100%);
            }

            .reporting-performance-section {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .reporting-avatar {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 28px;
                height: 28px;
                border-radius: 999px;
                font-size: 0.7rem;
                font-weight: 800;
            }

            .reporting-avatar--mint { background: #d9f3ea; color: #0f7d5d; }
            .reporting-avatar--amber { background: #f9ecd1; color: #9b6712; }
            .reporting-avatar--slate { background: #ece8df; color: #5e6673; }

            .reporting-operator {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .reporting-progress-inline {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .reporting-progress-inline__track {
                width: 92px;
                height: 6px;
                border-radius: 999px;
                background: #edf1f6;
                overflow: hidden;
            }

            .reporting-progress-inline__fill {
                display: block;
                height: 100%;
                border-radius: 999px;
                background: linear-gradient(90deg, #1ca377 0%, #25a28d 100%);
            }

            .reporting-muted {
                color: #90a0b5;
            }

            .reporting-pagination {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                padding: 0 4px;
                flex-wrap: wrap;
            }

            .reporting-pagination__meta {
                color: #6f7d90;
                font-size: 0.8rem;
            }

            .reporting-pagination__controls {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
            }

            .reporting-pagination__button {
                border: 1px solid #cfd8e4;
                background: #ffffff;
                color: #28415f;
                border-radius: 10px;
                padding: 8px 12px;
                font: inherit;
                font-size: 0.8rem;
                cursor: pointer;
            }

            .reporting-pagination__button[disabled] {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .reporting-pagination__page {
                color: #475569;
                font-size: 0.8rem;
                font-weight: 700;
                padding: 0 4px;
            }

            @media (max-width: 980px) {
                .reporting-summary,
                .reporting-grid {
                    grid-template-columns: 1fr;
                }
            }
        `,
        render: () => {
            const pagination = getPerformancePagination();
            return `
            <section class="reporting-page">
                <h2 class="reporting-page__title">Reporting</h2>

                <div class="reporting-summary">
                    ${summaryCards.map((card) => `
                        <article class="reporting-summary__card reporting-summary__card--${card.tone}">
                            <span>${card.label}</span>
                            <strong>${card.value}</strong>
                        </article>
                    `).join("")}
                </div>

                <div class="reporting-grid">
                    <article class="reporting-card">
                        <h3 class="reporting-card__title">Jobs by status</h3>
                        <div class="reporting-stat-list">
                            ${statusRows.map((row) => `
                                <div class="reporting-stat-row">
                                    <span class="reporting-pill ${row.pillClass}">${row.label === "Needs Snagging" ? "⚠ Needs Snagging" : row.label === "Contractor Review" ? "⏳ Contractor Review" : row.label}</span>
                                    <div class="reporting-stat-row__track">
                                        <span class="reporting-stat-row__fill" style="width:${row.percent}%;"></span>
                                    </div>
                                    <strong>${row.count}</strong>
                                </div>
                            `).join("")}
                        </div>
                    </article>

                    <article class="reporting-card">
                        <h3 class="reporting-card__title">Jobs by type</h3>
                        <div class="reporting-stat-list">
                            ${typeRows.map((row) => `
                                <div class="reporting-stat-row">
                                    <span class="reporting-pill ${row.pillClass}">${row.label}</span>
                                    <div class="reporting-stat-row__track">
                                        <span class="reporting-stat-row__fill reporting-stat-row__fill--blue" style="width:${row.percent}%;"></span>
                                    </div>
                                    <strong>${row.count}</strong>
                                </div>
                            `).join("")}
                        </div>
                        <div class="reporting-card__divider"></div>
                        <h3 class="reporting-card__title">By contractor</h3>
                        <div class="reporting-contractor">
                            <span class="reporting-pill reporting-pill--sand">B&G Contractors</span>
                            <span>7 jobs · 2 done · <strong>£10,130</strong></span>
                        </div>
                    </article>
                </div>

                <div class="reporting-grid">
                    <article class="reporting-card">
                        <h3 class="reporting-card__title">Awaiting tenant sign-off (0)</h3>
                        <p class="reporting-empty">All complete jobs signed off ✓</p>
                    </article>

                    <article class="reporting-card">
                        <h3 class="reporting-card__title">Complete — not yet billed (1)</h3>
                        <table class="reporting-table">
                            <thead>
                                <tr>
                                    <th>Address</th>
                                    <th>Value</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>42 Dorac Avenue SK8 3NZ</td>
                                    <td><strong>£3,200</strong></td>
                                    <td><button class="reporting-button" type="button" data-reporting-view-scope="42 Dorac Avenue SK8 3NZ">View</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </article>
                </div>

                <section class="reporting-performance-section">
                    <article class="reporting-card reporting-performance">
                        <h3 class="reporting-card__title">Operative performance</h3>
                        <table class="reporting-table">
                            <thead>
                                <tr>
                                    <th>Operative</th>
                                    <th>Total jobs</th>
                                    <th>In progress</th>
                                    <th>Complete</th>
                                    <th>Avg progress</th>
                                    <th>Photos uploaded</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pagination.rows.map((row) => `
                                    <tr>
                                        <td>
                                            <div class="reporting-operator">
                                                <span class="reporting-avatar ${row.avatarClass}">${row.initials}</span>
                                                <strong>${row.name}</strong>
                                            </div>
                                        </td>
                                        <td>${row.total}</td>
                                        <td>${row.inProgress}</td>
                                        <td>${row.complete}</td>
                                        <td>
                                            <div class="reporting-progress-inline">
                                                <span class="reporting-progress-inline__track">
                                                    <span class="reporting-progress-inline__fill" style="width:${row.progress}%;"></span>
                                                </span>
                                                <span>${row.progress}%</span>
                                            </div>
                                        </td>
                                        <td class="reporting-muted">${row.photos}</td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    </article>
                    <div class="reporting-pagination">
                        <div class="reporting-pagination__meta">
                            Showing ${pagination.totalRows ? pagination.startIndex + 1 : 0}-${Math.min(pagination.endIndex, pagination.totalRows)} of ${pagination.totalRows}
                        </div>
                        <div class="reporting-pagination__controls">
                            <button class="reporting-pagination__button" type="button" data-reporting-page="prev" ${pagination.currentPage <= 1 ? "disabled" : ""}>Previous</button>
                            <span class="reporting-pagination__page">Page ${pagination.currentPage} of ${pagination.totalPages}</span>
                            <button class="reporting-pagination__button" type="button" data-reporting-page="next" ${pagination.currentPage >= pagination.totalPages ? "disabled" : ""}>Next</button>
                        </div>
                    </div>
                </section>
            </section>
        `;
        },
        onClick: (event) => {
            const clickTarget = event.target instanceof Element ? event.target : event.target?.parentElement;
            if (!clickTarget) {
                return false;
            }

            const viewScopeButton = clickTarget.closest("[data-reporting-view-scope]");
            if (viewScopeButton) {
                const address = viewScopeButton.getAttribute("data-reporting-view-scope");
                if (address && typeof window.__jobManagementNavigateToPage === "function") {
                    window.__jobManagementNavigateToPage("scope");
                    window.pageModules?.scope?.openJobByAddress?.(address);
                }
                return true;
            }

            const pageButton = clickTarget.closest("[data-reporting-page]");
            if (!pageButton) {
                return false;
            }

            const direction = pageButton.getAttribute("data-reporting-page");
            const { totalPages } = getPerformancePagination();
            if (direction === "prev" && state.performancePage > 1) {
                state.performancePage -= 1;
            }
            if (direction === "next" && state.performancePage < totalPages) {
                state.performancePage += 1;
            }
            rerenderReportingPage();
            return true;
        }
    };
})();

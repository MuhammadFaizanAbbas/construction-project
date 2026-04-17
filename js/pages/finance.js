window.pageModules = window.pageModules || {};

window.pageModules.finance = (() => {
    const financeRows = [
        { address: "42 Dorac Avenue SK8 3NZ", client: "MSV", contractor: "B&G Contractors", status: "Complete", worksValue: 3200, jobPrice: 1850, materials: 0, billed: "Pending" },
        { address: "14 Birchwood Close M22 4PR", client: "MSV", contractor: "B&G Contractors", status: "In Progress", worksValue: 1800, jobPrice: 920, materials: 0, billed: "Pending" },
        { address: "7 Maple Street SK1 2EF", client: "Wythenshawe Community", contractor: "B&G Contractors", status: "In Progress", worksValue: 3900, jobPrice: 2100, materials: 0, billed: "Pending" },
        { address: "33 Oak Lane WA15 9GH", client: "MSV", contractor: "B&G Contractors", status: "Needs Survey", worksValue: 0, jobPrice: 0, materials: 0, billed: "Pending" },
        { address: "55 Cedar Avenue SK4 1LM", client: "MSV", contractor: "B&G Contractors", status: "Quoted", worksValue: 5800, jobPrice: 3400, materials: 0, billed: "Pending" },
        { address: "8 Willow Court M20 6NP", client: "Wythenshawe Community", contractor: "B&G Contractors", status: "Complete", worksValue: 1400, jobPrice: 760, materials: 0, billed: "Signed" },
        { address: "22 Birch Grove WA16 7QT", client: "MSV", contractor: "B&G Contractors", status: "Needs Snagging", worksValue: 2200, jobPrice: 1100, materials: 0, billed: "Pending" },
        { address: "62 Sycamore Drive WA14 2BV", client: "MSV", contractor: "—", status: "Billed", worksValue: 6200, jobPrice: 0, materials: 0, billed: "Signed" }
    ];

    const state = {
        currentPage: 1,
        rowsPerPage: 20,
        exportModal: {
            isOpen: false,
            fromDate: "2025-03-31",
            toDate: "2026-04-16",
            client: "All clients",
            includeActive: true,
            includeArchived: true
        }
    };

    function formatCurrency(value) {
        return `£${Number(value || 0).toLocaleString("en-GB")}`;
    }

    function getStatusClass(status) {
        return `finance-pill finance-pill--${String(status).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    }

    function getPagination() {
        const totalRows = financeRows.length;
        const totalPages = Math.max(1, Math.ceil(totalRows / state.rowsPerPage));
        const currentPage = Math.min(state.currentPage, totalPages);
        const startIndex = (currentPage - 1) * state.rowsPerPage;
        const endIndex = startIndex + state.rowsPerPage;

        return {
            totalRows,
            totalPages,
            currentPage,
            startIndex,
            endIndex,
            rows: financeRows.slice(startIndex, endIndex)
        };
    }

    function getFinanceSummaryTotals() {
        const worksTotal = financeRows.reduce((sum, row) => sum + row.worksValue, 0);
        const jobTotal = financeRows.reduce((sum, row) => sum + row.jobPrice, 0);
        const materialsTotal = financeRows.reduce((sum, row) => sum + row.materials, 0);
        const billedSigned = financeRows
            .filter((row) => row.billed === "Signed")
            .reduce((sum, row) => sum + row.worksValue, 0);
        const completeUnbilled = financeRows
            .filter((row) => row.status === "Complete" && row.billed !== "Signed")
            .reduce((sum, row) => sum + row.worksValue, 0);

        return {
            worksTotal,
            jobTotal,
            grossMargin: worksTotal - jobTotal - materialsTotal,
            materialsTotal,
            billedSigned,
            completeUnbilled
        };
    }

    function rerenderFinancePage() {
        if (typeof window.__jobManagementRenderActivePage === "function") {
            window.__jobManagementRenderActivePage();
        }
    }

    function isArchivedRow(row) {
        return row.status === "Billed";
    }

    function getFilteredExportRows() {
        return financeRows.filter((row) => {
            const matchesClient = state.exportModal.client === "All clients" || row.client === state.exportModal.client;
            const isArchived = isArchivedRow(row);
            const matchesArchive =
                (state.exportModal.includeActive && !isArchived) ||
                (state.exportModal.includeArchived && isArchived);

            return matchesClient && matchesArchive;
        });
    }

    function getExportSummary() {
        const rows = getFilteredExportRows();
        const sales = rows.reduce((sum, row) => sum + row.worksValue, 0);
        const purchase = rows.reduce((sum, row) => sum + row.jobPrice + row.materials, 0);
        return { count: rows.length, sales, purchase };
    }

    function downloadCsvFile() {
        const rows = getFilteredExportRows();
        const headers = ["Address", "Client", "Contractor", "Status", "Works Value", "Job Price", "Materials", "Net Works", "Net Job Price", "Billed"];
        const csvLines = [
            headers.join(","),
            ...rows.map((row) => [
                row.address,
                row.client,
                row.contractor,
                row.status,
                row.worksValue,
                row.jobPrice,
                row.materials,
                row.worksValue - row.materials,
                row.jobPrice - row.materials,
                row.billed
            ].map((value) => `"${String(value).replace(/"/g, "\"\"")}"`).join(","))
        ];
        const blob = new Blob([csvLines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "sage-50-export.csv";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }

    function renderExportModal() {
        if (!state.exportModal.isOpen) {
            return "";
        }

        const summary = getExportSummary();

        return `
            <div class="finance-modal-backdrop" data-close-export-modal-backdrop>
                <section class="finance-export-modal" role="dialog" aria-modal="true" aria-label="Export to Sage 50">
                    <div class="finance-export-modal__header">
                        <h3>📤 Export to Sage 50</h3>
                    </div>
                    <div class="finance-export-modal__notice">
                        Filter which jobs to include. Both active billed/complete jobs and archived jobs can be exported.
                    </div>
                    <div class="finance-export-modal__dates">
                        <label class="finance-export-modal__field">
                            <span>From date</span>
                            <input type="date" value="${state.exportModal.fromDate}" data-export-from-date>
                        </label>
                        <label class="finance-export-modal__field">
                            <span>To date</span>
                            <input type="date" value="${state.exportModal.toDate}" data-export-to-date>
                        </label>
                    </div>
                    <label class="finance-export-modal__field">
                        <span>Client</span>
                        <select data-export-client>
                            ${["All clients", "MSV", "Wythenshawe Community"].map((option) => `
                                <option value="${option}" ${state.exportModal.client === option ? "selected" : ""}>${option}</option>
                            `).join("")}
                        </select>
                    </label>
                    <div class="finance-export-modal__checkboxes">
                        <label class="finance-export-modal__check">
                            <input type="checkbox" ${state.exportModal.includeActive ? "checked" : ""} data-export-active>
                            <span>Active jobs</span>
                        </label>
                        <label class="finance-export-modal__check">
                            <input type="checkbox" ${state.exportModal.includeArchived ? "checked" : ""} data-export-archived>
                            <span>Archived jobs</span>
                        </label>
                    </div>
                    <div class="finance-export-modal__summary">
                        <strong>${summary.count} jobs matched</strong> ·
                        Sales invoices: <strong>${formatCurrency(summary.sales)}</strong> excl VAT ·
                        Purchase invoices: <strong>${formatCurrency(summary.purchase)}</strong> excl VAT
                    </div>
                    <div class="finance-export-modal__footer">
                        <button class="finance-export-modal__cancel" type="button" data-close-export-modal>Cancel</button>
                        <button class="finance-export-modal__download" type="button" data-download-export-csv>📤 Download CSV</button>
                    </div>
                </section>
            </div>
        `;
    }

    return {
        title: "Finance",
        search: "Search finance...",
        style: `
            .finance-shell { display: flex; flex-direction: column; gap: 20px; padding-top: 30px; }
            .finance-topbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
            .finance-topbar h2 { margin: 0; color: #101b2d; font-size: 1.1rem; font-weight: 800; }
            .finance-export { border: 1px solid #9fddd0; background: #e8faf5; color: #0b7157; border-radius: 12px; padding: 10px 16px; font: inherit; font-size: 0.88rem; font-weight: 700; cursor: pointer; }
            .finance-summary { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
            .finance-summary__hero { border: 1px solid #dce5f1; border-radius: 14px; padding: 14px 16px; }
            .finance-summary__hero--works { background: linear-gradient(90deg, #eef8d9 0%, #edf7df 100%); border-color: #9edca6; }
            .finance-summary__hero--job { background: linear-gradient(90deg, #e4f0ff 0%, #dcebfb 100%); border-color: #a8cdf7; }
            .finance-summary__hero span { display: block; margin-bottom: 8px; color: #0d4f5a; font-size: 0.76rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; }
            .finance-summary__hero strong { display: block; margin-bottom: 4px; color: #0b4f44; font-size: 1.05rem; font-weight: 800; }
            .finance-summary__hero--job strong { color: #0e4b8c; }
            .finance-summary__hero p { margin: 0; color: #24645f; font-size: 0.78rem; }
            .finance-summary__hero--job p { color: #2f5f93; }
            .finance-kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
            .finance-kpi { background: #fff; border: 1px solid #eef1f6; border-radius: 14px; padding: 14px 16px; box-shadow: 0 8px 18px rgba(24, 36, 61, 0.03); }
            .finance-kpi span { display: block; margin-bottom: 8px; color: #6f7d90; font-size: 0.8rem; }
            .finance-kpi strong { color: #1d3557; font-size: 1rem; font-weight: 800; }
            .finance-kpi strong.finance-kpi__green { color: #3c7f16; }
            .finance-kpi strong.finance-kpi__violet { color: #5342c6; }
            .finance-kpi strong.finance-kpi__amber { color: #a85f00; }
            .finance-table-card { background: #fff; border: 1px solid #dde5f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 22px rgba(24, 36, 61, 0.04); }
            .finance-table-wrap { width: 100%; overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch; border-radius: 16px; }
            .finance-table-wrap::-webkit-scrollbar { height: 10px; }
            .finance-table-wrap::-webkit-scrollbar-track { background: #eef2f7; border-radius: 999px; }
            .finance-table-wrap::-webkit-scrollbar-thumb { background: #c8d4e3; border-radius: 999px; }
            .finance-table { width: max(100%, 1400px); border-collapse: collapse; }
            .finance-table th, .finance-table td { padding: 12px 12px; border-bottom: 1px solid #edf1f6; text-align: left; vertical-align: middle; }
            .finance-table tbody tr:last-child td { border-bottom: none; }
            .finance-table th { color: #667487; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; background: #fff; white-space: nowrap; }
            .finance-table td { color: #13243d; font-size: 0.82rem; }
            .finance-table__money { font-weight: 700; }
            .finance-table__muted { color: #8a97aa; }
            .finance-pill { display: inline-flex; align-items: center; justify-content: center; min-height: 26px; padding: 4px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; white-space: nowrap; }
            .finance-pill--complete { background: #e6f4d8; color: #4d7f18; }
            .finance-pill--in-progress { background: #dff4ec; color: #087160; }
            .finance-pill--needs-survey { background: #e4efff; color: #2766bf; }
            .finance-pill--quoted { background: #fff1dd; color: #a96506; }
            .finance-pill--needs-snagging { background: #fff2e3; color: #b36500; border: 1px solid #efc485; }
            .finance-pill--billed { background: #ece8ff; color: #6553cc; }
            .finance-pill--pending { background: #edf4ff; color: #2c68b4; }
            .finance-pill--signed { background: #edf8dd; color: #5b8314; }
            .finance-table__head-pill { display: inline-flex; align-items: center; justify-content: center; min-height: 24px; padding: 3px 10px; border-radius: 999px; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; white-space: nowrap; }
            .finance-table__head-pill--works { background: #ebf7d5; color: #537e16; }
            .finance-table__head-pill--job { background: #e4f0ff; color: #2c68b4; }
            .finance-table__head-pill--materials { color: #9b6a08; }
            .finance-table td.finance-table__materials { color: #9aa5b5; text-align: center; }
            .finance-pagination { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 0 4px; background: transparent; flex-wrap: wrap; }
            .finance-pagination__meta { color: #6f7d90; font-size: 0.8rem; }
            .finance-pagination__controls { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
            .finance-pagination__button { border: 1px solid #cfd8e4; background: #fff; color: #28415f; border-radius: 10px; padding: 8px 12px; font: inherit; font-size: 0.8rem; cursor: pointer; }
            .finance-pagination__button[disabled] { opacity: 0.5; cursor: not-allowed; }
            .finance-pagination__page { color: #475569; font-size: 0.8rem; font-weight: 700; padding: 0 4px; }
            .finance-table-section { display: flex; flex-direction: column; gap: 12px; }
            .finance-modal-backdrop { position: fixed; inset: 0; display: grid; place-items: center; padding: 20px; background: rgba(18, 26, 38, 0.45); z-index: 95; }
            .finance-export-modal { width: min(100%, 520px); background: #fff; border: 1px solid #dbe4ee; border-radius: 20px; padding: 22px 24px; box-shadow: 0 18px 36px rgba(24, 36, 61, 0.18); }
            .finance-export-modal__header h3 { margin: 0 0 16px; color: #20242b; font-size: 1.35rem; font-weight: 800; }
            .finance-export-modal__notice { margin-bottom: 16px; padding: 14px 16px; border-radius: 12px; background: #f3f4f6; color: #70757e; font-size: 0.9rem; line-height: 1.55; }
            .finance-export-modal__dates { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-bottom: 14px; }
            .finance-export-modal__field { display: grid; gap: 8px; margin-bottom: 14px; }
            .finance-export-modal__field span { color: #5f6672; font-size: 0.88rem; font-weight: 700; }
            .finance-export-modal__field input, .finance-export-modal__field select { width: 100%; min-height: 44px; border: 1px solid #c7d0db; border-radius: 12px; padding: 10px 12px; color: #222; background: #fff; font: inherit; font-size: 0.92rem; }
            .finance-export-modal__checkboxes { display: flex; align-items: center; gap: 24px; margin-bottom: 16px; padding: 12px 14px; border-radius: 12px; background: #f5f6f8; }
            .finance-export-modal__check { display: inline-flex; align-items: center; gap: 10px; color: #2d3748; font-size: 0.92rem; cursor: pointer; }
            .finance-export-modal__check input { width: 20px; height: 20px; accent-color: #0f7ae5; }
            .finance-export-modal__summary { margin-bottom: 18px; padding: 14px 16px; border: 1px solid #afd1f7; border-radius: 12px; background: #e8f2ff; color: #174a84; font-size: 0.92rem; line-height: 1.5; }
            .finance-export-modal__footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 18px; border-top: 1px solid #e5e9ef; }
            .finance-export-modal__cancel { border: 1px solid #c8d0da; background: #fff; color: #6b7280; border-radius: 12px; padding: 11px 16px; font: inherit; font-size: 0.92rem; cursor: pointer; }
            .finance-export-modal__download { border: 1px solid #99decb; background: #e7faf4; color: #0c6f55; border-radius: 12px; padding: 11px 16px; font: inherit; font-size: 0.92rem; font-weight: 700; cursor: pointer; }
            @media (max-width: 980px) {
                .finance-summary, .finance-kpis { grid-template-columns: 1fr; }
            }
            @media (max-width: 720px) {
                .finance-export-modal__dates { grid-template-columns: 1fr; }
                .finance-export-modal__checkboxes, .finance-export-modal__footer { flex-direction: column; align-items: stretch; }
            }
        `,
        render: () => `
            ${(() => {
                const pagination = getPagination();
                const summaryTotals = getFinanceSummaryTotals();
                return `
            <section class="finance-shell">
                <div class="finance-topbar">
                    <h2>Finance</h2>
                    <button class="finance-export" type="button" data-open-export-modal>📤 Export to Sage 50</button>
                </div>

                <div class="finance-summary">
                    <article class="finance-summary__hero finance-summary__hero--works">
                        <span>Complete Works (Total Pipeline)</span>
                        <strong>${formatCurrency(summaryTotals.worksTotal)}</strong>
                        <p>Full value charged to clients</p>
                    </article>
                    <article class="finance-summary__hero finance-summary__hero--job">
                        <span>Job Prices (Contractor Payouts)</span>
                        <strong>${formatCurrency(summaryTotals.jobTotal)}</strong>
                        <p>Total paid out to contractors</p>
                    </article>
                </div>

                <div class="finance-kpis">
                    <article class="finance-kpi">
                        <span>Gross margin</span>
                        <strong class="finance-kpi__green">${formatCurrency(summaryTotals.grossMargin)}</strong>
                    </article>
                    <article class="finance-kpi">
                        <span>Materials logged</span>
                        <strong>${formatCurrency(summaryTotals.materialsTotal)}</strong>
                    </article>
                    <article class="finance-kpi">
                        <span>Billed & signed</span>
                        <strong class="finance-kpi__violet">${formatCurrency(summaryTotals.billedSigned)}</strong>
                    </article>
                    <article class="finance-kpi">
                        <span>Complete — unbilled</span>
                        <strong class="finance-kpi__amber">${formatCurrency(summaryTotals.completeUnbilled)}</strong>
                    </article>
                </div>

                <section class="finance-table-section">
                    <div class="finance-table-card">
                        <div class="finance-table-wrap">
                            <table class="finance-table">
                                <thead>
                                    <tr>
                                        <th>Address</th>
                                        <th>Client</th>
                                        <th>Contractor</th>
                                        <th>Status</th>
                                    <th><span class="finance-table__head-pill finance-table__head-pill--works">Works Value</span></th>
                                    <th><span class="finance-table__head-pill finance-table__head-pill--job">Job Price</span></th>
                                    <th><span class="finance-table__head-pill finance-table__head-pill--materials">Materials</span></th>
                                        <th>Net Works</th>
                                        <th>Net Job Price</th>
                                        <th>Billed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${pagination.rows.map((row) => `
                                        <tr>
                                            <td>${row.address}</td>
                                            <td>${row.client}</td>
                                            <td>${row.contractor}</td>
                                            <td><span class="${getStatusClass(row.status)}">${row.status === "Needs Snagging" ? "⚠ Needs Snagging" : row.status}</span></td>
                                            <td class="finance-table__money">${formatCurrency(row.worksValue)}</td>
                                            <td>${formatCurrency(row.jobPrice)}</td>
                                            <td class="finance-table__materials">—</td>
                                            <td class="finance-table__muted">${formatCurrency(row.worksValue - row.materials)}</td>
                                            <td class="finance-table__muted">${formatCurrency(row.jobPrice - row.materials)}</td>
                                            <td><span class="${getStatusClass(row.billed)}">${row.billed === "Signed" ? "✓ Signed" : row.billed}</span></td>
                                        </tr>
                                    `).join("")}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="finance-pagination">
                        <div class="finance-pagination__meta">
                            Showing ${pagination.totalRows ? pagination.startIndex + 1 : 0}-${Math.min(pagination.endIndex, pagination.totalRows)} of ${pagination.totalRows}
                        </div>
                        <div class="finance-pagination__controls">
                            <button class="finance-pagination__button" type="button" data-finance-page="prev" ${pagination.currentPage <= 1 ? "disabled" : ""}>Previous</button>
                            <span class="finance-pagination__page">Page ${pagination.currentPage} of ${pagination.totalPages}</span>
                            <button class="finance-pagination__button" type="button" data-finance-page="next" ${pagination.currentPage >= pagination.totalPages ? "disabled" : ""}>Next</button>
                        </div>
                    </div>
                </section>
                ${renderExportModal()}
            </section>
        `;
            })()}
        `,
        onClick: (event, { rerender }) => {
            const clickTarget = event.target instanceof Element ? event.target : event.target?.parentElement;
            if (!clickTarget) {
                return false;
            }

            const openExportModalButton = clickTarget.closest("[data-open-export-modal]");
            const closeExportModalButton = clickTarget.closest("[data-close-export-modal]");
            const exportModalBackdrop = clickTarget.closest("[data-close-export-modal-backdrop]");
            const downloadExportButton = clickTarget.closest("[data-download-export-csv]");
            const financePageButton = clickTarget.closest("[data-finance-page]");

            if (openExportModalButton) {
                state.exportModal.isOpen = true;
                rerender();
                return true;
            }

            if (closeExportModalButton || (exportModalBackdrop && clickTarget === exportModalBackdrop)) {
                state.exportModal.isOpen = false;
                rerender();
                return true;
            }

            if (downloadExportButton) {
                downloadCsvFile();
                state.exportModal.isOpen = false;
                rerender();
                return true;
            }

            if (financePageButton) {
                const direction = financePageButton.getAttribute("data-finance-page");
                const { totalPages } = getPagination();
                if (direction === "prev" && state.currentPage > 1) {
                    state.currentPage -= 1;
                }
                if (direction === "next" && state.currentPage < totalPages) {
                    state.currentPage += 1;
                }
                rerender();
                return true;
            }

            return false;
        },
        addOrUpdateJob: (job) => {
            if (!job?.address) {
                return false;
            }

            const nextValues = {
                address: job.address,
                client: job.client || "-",
                contractor: job.contractor || "—",
                status: job.status || "Needs Survey",
                worksValue: Number(job.pipeline) || 0,
                jobPrice: Number(job.jobPrice) || 0,
                materials: 0,
                billed: job.status === "Billed" ? "Signed" : "Pending"
            };
            const existingRow = financeRows.find((row) => row.address === job.address);

            if (existingRow) {
                Object.assign(existingRow, nextValues);
            } else {
                financeRows.unshift(nextValues);
            }

            rerenderFinancePage();
            return true;
        },
        removeJobByAddress: (address) => {
            const rowIndex = financeRows.findIndex((row) => row.address === address);
            if (rowIndex === -1) {
                return false;
            }

            financeRows.splice(rowIndex, 1);
            rerenderFinancePage();
            return true;
        },
        onChange: (event) => {
            const fromDateInput = event.target.closest("[data-export-from-date]");
            const toDateInput = event.target.closest("[data-export-to-date]");
            const clientSelect = event.target.closest("[data-export-client]");
            const activeCheckbox = event.target.closest("[data-export-active]");
            const archivedCheckbox = event.target.closest("[data-export-archived]");

            if (fromDateInput) {
                state.exportModal.fromDate = fromDateInput.value;
                rerenderFinancePage();
                return true;
            }

            if (toDateInput) {
                state.exportModal.toDate = toDateInput.value;
                rerenderFinancePage();
                return true;
            }

            if (clientSelect) {
                state.exportModal.client = clientSelect.value;
                rerenderFinancePage();
                return true;
            }

            if (activeCheckbox) {
                state.exportModal.includeActive = activeCheckbox.checked;
                rerenderFinancePage();
                return true;
            }

            if (archivedCheckbox) {
                state.exportModal.includeArchived = archivedCheckbox.checked;
                rerenderFinancePage();
                return true;
            }

            return false;
        }
    };
})();

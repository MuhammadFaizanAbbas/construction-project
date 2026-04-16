window.pageModules = window.pageModules || {};

window.pageModules.scope = (() => {
    const scopeJobs = [
        { id: 1, address: "42 Dorac Avenue SK8 3NZ", client: "MSV", tenant: "Mrs Grice", type: "Disrepair", contractor: "B&G Contractors", assigned: "Harmony", status: "Complete" },
        { id: 2, address: "14 Birchwood Close M22 4PR", client: "MSV", tenant: "Mr & Mrs Patel", type: "Disrepair", contractor: "B&G Contractors", assigned: "John Nelson", status: "In Progress" },
        { id: 3, address: "7 Maple Street SK1 2EF", client: "Wythenshawe Community", tenant: "Ms Thompson", type: "Planned Works", contractor: "B&G Contractors", assigned: "Harmony", status: "In Progress" },
        { id: 4, address: "33 Oak Lane WA15 9GH", client: "MSV", tenant: "Mr Yusuf", type: "Disrepair", contractor: "B&G Contractors", assigned: "-", status: "Needs Survey" },
        { id: 5, address: "55 Cedar Avenue SK4 1LM", client: "MSV", tenant: "Mr Singh", type: "Planned Works", contractor: "B&G Contractors", assigned: "Dave", status: "Quoted" },
        { id: 6, address: "8 Willow Court M20 6NP", client: "Wythenshawe Community", tenant: "Mrs Davies", type: "Disrepair", contractor: "B&G Contractors", assigned: "Harmony", status: "Complete" }
    ];

    const defaultDetailRows = [
        { id: 1, location: "Hallway", assign: "Assign", scope: "Hack off damp plaster and re-plaster right and left wall in entrance hall", qty: "3", unit: "SM", price: "—", markDone: false },
        { id: 2, location: "Hallway", assign: "Assign", scope: "Install passive vent in store cupboard", qty: "1", unit: "NO", price: "—", markDone: true },
        { id: 3, location: "Hallway", assign: "Assign", scope: "Remove and renew decaying skirting boards", qty: "3", unit: "LM", price: "—", markDone: true },
        { id: 4, location: "Bedroom 1", assign: "Assign", scope: "Mould wash window seals — first floor", qty: "14", unit: "SM", price: "—", markDone: true }
    ];

    const PHOTO_TABS = {
        survey: { label: "Survey Images", uploadClass: "scope-photo-modal__drop--neutral", cameraClass: "scope-photo-modal__drop--survey" },
        completed: { label: "Completed Images", uploadClass: "scope-photo-modal__drop--neutral", cameraClass: "scope-photo-modal__drop--completed" },
        snagging: { label: "Snagging Images", uploadClass: "scope-photo-modal__drop--neutral", cameraClass: "scope-photo-modal__drop--snagging" }
    };

    const state = {
        selectedJobId: null,
        detailRows: defaultDetailRows.map((row) => ({ ...row })),
        photoModal: { rowId: null, activeTab: "survey" }
    };

    function getTypeClass(type) {
        return `scope-type-pill scope-type-pill--${String(type).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    }

    function getStatusClass(status) {
        return `scope-status-pill scope-status-pill--${String(status).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    }

    function getSelectedJob() {
        return scopeJobs.find((job) => job.id === state.selectedJobId) || null;
    }

    function getRowById(rowId) {
        return state.detailRows.find((row) => row.id === rowId) || null;
    }

    function getSummary() {
        const total = state.detailRows.length || 1;
        const done = state.detailRows.filter((row) => row.markDone).length;
        const percent = Math.round((done / total) * 100);
        return { done, total, percent };
    }

    function renderListView() {
        return `
            <section class="scope-shell" data-scope-list-view ${state.selectedJobId ? "hidden" : ""}>
                <h2>Scope of Works</h2>
                <div class="scope-table-card">
                    <div class="scope-table-wrap">
                        <table class="scope-table">
                            <thead>
                                <tr>
                                    <th>Address</th>
                                    <th>Client</th>
                                    <th>Tenant</th>
                                    <th>Type</th>
                                    <th>Contractor</th>
                                    <th>Assigned</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                ${scopeJobs.map((job) => `
                                    <tr class="scope-table__row" onclick="window.pageModules.scope.openJob(${job.id})">
                                        <td class="scope-table__address">${job.address}</td>
                                        <td>${job.client}</td>
                                        <td>${job.tenant}</td>
                                        <td><span class="${getTypeClass(job.type)}">${job.type}</span></td>
                                        <td>${job.contractor === "-" ? "-" : `<span class="scope-contractor-pill">${job.contractor}</span>`}</td>
                                        <td>${job.assigned}</td>
                                        <td><span class="${getStatusClass(job.status)}">${job.status}</span></td>
                                        <td class="scope-table__arrow-cell">
                                            <button class="scope-arrow-button" type="button" onclick="window.pageModules.scope.openJob(${job.id}); event.stopPropagation(); return false;">
                                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg>
                                            </button>
                                        </td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        `;
    }

    function renderPhotoModal() {
        const row = getRowById(state.photoModal.rowId);

        if (!row) {
            return "";
        }

        return `
            <div class="scope-photo-modal__backdrop" data-close-photo-modal>
                <section class="scope-photo-modal" role="dialog" aria-modal="true" aria-label="Scope photos">
                    <div class="scope-photo-modal__header">
                        <h3>Photos — ${row.scope}</h3>
                    </div>
                    <div class="scope-photo-modal__tabs">
                        ${Object.entries(PHOTO_TABS).map(([key, config]) => `
                            <button class="scope-photo-modal__tab${state.photoModal.activeTab === key ? " is-active" : ""}" type="button" data-photo-tab="${key}">${config.label}</button>
                        `).join("")}
                    </div>
                    <div class="scope-photo-modal__drops">
                        <button class="scope-photo-modal__drop ${PHOTO_TABS[state.photoModal.activeTab].uploadClass}" type="button" data-photo-upload>
                            <span class="scope-photo-modal__drop-icon">??</span>
                            <span>Upload</span>
                        </button>
                        <button class="scope-photo-modal__drop ${PHOTO_TABS[state.photoModal.activeTab].cameraClass}" type="button" data-photo-camera>
                            <span class="scope-photo-modal__drop-icon">??</span>
                            <span>Take photo</span>
                        </button>
                    </div>
                    <div class="scope-photo-modal__footer">
                        <button class="scope-photo-modal__done" type="button" data-close-photo-modal>Done</button>
                    </div>
                    <input class="scope-hidden-input" type="file" accept="image/*" multiple data-photo-upload-input>
                    <input class="scope-hidden-input" type="file" accept="image/*" capture="environment" data-photo-camera-input>
                </section>
            </div>
        `;
    }

    function renderDetailView(job) {
        if (!job) {
            return `<section class="scope-shell scope-shell--detail" data-scope-detail-view hidden></section>`;
        }

        const summary = getSummary();

        return `
            <section class="scope-shell scope-shell--detail" data-scope-detail-view ${state.selectedJobId ? "" : "hidden"}>
                <div class="scope-detail__toolbar">
                    <button class="scope-detail__back" type="button" onclick="window.pageModules.scope.handleBackClick(); return false;">&larr; Back</button>
                    <div class="scope-detail__actions">
                        <button class="scope-detail__ghost" type="button">Export PDF</button>
                        <button class="scope-detail__ghost" type="button">Edit job</button>
                    </div>
                </div>
                <div class="scope-detail__header">
                    <div>
                        <h2>${job.address}</h2>
                        <p>${job.client} / ${job.type} / ${job.assigned}</p>
                    </div>
                    <span class="${getStatusClass(job.status)}">${job.status}</span>
                </div>
                <div class="scope-detail__summary">
                    <article class="scope-detail__card scope-detail__card--green">
                        <span>Complete works value</span>
                        <strong>GBP 3,200</strong>
                        <p>Full value aligned to client office schedule.</p>
                    </article>
                    <article class="scope-detail__card scope-detail__card--blue">
                        <span>Job price</span>
                        <strong>GBP 1,850</strong>
                        <p>Amount payable to ${job.contractor === "-" ? "contractor" : job.contractor}.</p>
                    </article>
                </div>
                <div class="scope-detail__grid">
                    <div class="scope-detail__panel">
                        <h3>Job details</h3>
                        <div class="scope-detail__rows">
                            <div><span>Tenant</span><strong>${job.tenant}</strong></div>
                            <div><span>Contact</span><strong>07584 913 873</strong></div>
                            <div><span>Address</span><strong>${job.address}</strong></div>
                        </div>
                    </div>
                    <div class="scope-detail__panel">
                        <h3>Schedule</h3>
                        <div class="scope-detail__rows">
                            <div><span>Client</span><strong>${job.client}</strong></div>
                            <div><span>Start date</span><strong>16/03/2026</strong></div>
                            <div><span>End date</span><strong>21/03/2026</strong></div>
                        </div>
                    </div>
                </div>
                <div class="scope-detail__panel">
                    <div class="scope-detail__panel-head">
                        <h3>Scope of works</h3>
                        <span>${summary.done}/${summary.total} - ${summary.percent}%</span>
                    </div>
                    <div class="scope-progress"><span class="scope-progress__fill" style="width: ${summary.percent}%;"></span></div>
                    <table class="scope-detail__table">
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Location</th>
                                <th>Assign</th>
                                <th>Scope</th>
                                <th>Qty</th>
                                <th>Unit</th>
                                <th>Price</th>
                                <th>Survey</th>
                                <th>Completed</th>
                                <th>Snagging</th>
                                <th>Snag</th>
                                <th>Mark</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${state.detailRows.map((row) => `
                                <tr>
                                    <td><span class="scope-status-pill ${row.markDone ? "scope-status-pill--complete" : "scope-status-pill--pending"}">${row.markDone ? "Complete" : "Pending"}</span></td>
                                    <td><span class="scope-type-pill scope-type-pill--planned-works">${row.location.toUpperCase()}</span></td>
                                    <td><button class="scope-mini-button" type="button">?? ${row.assign}</button></td>
                                    <td>${row.scope}</td>
                                    <td>${row.qty}</td>
                                    <td>${row.unit}</td>
                                    <td>${row.price}</td>
                                    <td><button class="scope-action-button" type="button" onclick="window.pageModules.scope.openPhotoModal(${row.id}, 'survey'); return false;">Survey</button></td>
                                    <td><button class="scope-action-button" type="button" onclick="window.pageModules.scope.openPhotoModal(${row.id}, 'completed'); return false;">Completed</button></td>
                                    <td><button class="scope-action-button" type="button" onclick="window.pageModules.scope.openPhotoModal(${row.id}, 'snagging'); return false;">Snagging</button></td>
                                    <td><button class="scope-action-button scope-action-button--warn" type="button">? Snag</button></td>
                                    <td><button class="scope-action-button${row.markDone ? " scope-action-button--done" : ""}" type="button" onclick="window.pageModules.scope.toggleMark(${row.id}); return false;">${row.markDone ? "Undo" : "? Done"}</button></td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
                ${renderPhotoModal()}
            </section>
        `;
    }

    function rerenderScopePage() {
        if (typeof window.__jobManagementRenderActivePage === "function") {
            window.__jobManagementRenderActivePage();
        }
    }

    return {
        title: "Scope of Works",
        search: "Search scope of works...",
        style: `
            .scope-shell { display: flex; flex-direction: column; gap: 18px; padding-top: 12px; }
            .scope-shell h2 { margin: 0; color: #18243d; font-size: 1.1rem; font-weight: 800; }
            .scope-table-card, .scope-detail__panel, .scope-photo-modal { background: #ffffff; border: 1px solid #e4e8f0; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 24px rgba(24, 36, 61, 0.04); }
            .scope-table-wrap { overflow-x: auto; }
            .scope-table { width: 100%; border-collapse: collapse; min-width: 1080px; }
            .scope-table th, .scope-table td { padding: 15px 14px; border-bottom: 1px solid #edf1f7; text-align: left; vertical-align: middle; }
            .scope-table tbody tr:last-child td { border-bottom: none; }
            .scope-table th, .scope-detail__table th { color: #596986; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; background: #ffffff; }
            .scope-table td { color: #15253c; font-size: 0.82rem; line-height: 1.35; }
            .scope-table__row { cursor: pointer; }
            .scope-table__row:hover { background: #fbfcff; }
            .scope-table__address { min-width: 220px; font-size: 0.97rem; font-weight: 500; }
            .scope-type-pill, .scope-contractor-pill, .scope-status-pill { display: inline-flex; align-items: center; justify-content: center; min-height: 26px; padding: 4px 12px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; white-space: nowrap; }
            .scope-type-pill--disrepair { background: #fdebf0; color: #a53b5f; }
            .scope-type-pill--planned-works { background: #f2ede2; color: #6f5a2c; }
            .scope-contractor-pill { background: #f6e7ca; color: #8b5a03; }
            .scope-status-pill--complete { background: #e7f4d7; color: #447b18; }
            .scope-status-pill--pending, .scope-status-pill--needs-survey { background: #e2efff; color: #1d66c0; }
            .scope-status-pill--in-progress { background: #dff3ec; color: #087160; }
            .scope-status-pill--quoted { background: #fff1dc; color: #a15f00; }
            .scope-status-pill--needs-snagging { background: #fff5e8; color: #b86500; border: 1px solid #e8b56e; }
            .scope-status-pill__warn { margin-right: 5px; font-size: 0.8rem; line-height: 1; }
            .scope-table__arrow-cell { width: 74px; text-align: center; }
            .scope-arrow-button { display: inline-flex; align-items: center; justify-content: center; border: none; background: transparent; color: #41556f; cursor: pointer; }
            .scope-arrow-button svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
            .scope-detail__toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
            .scope-detail__actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
            .scope-detail__back, .scope-detail__ghost { border: 1px solid #d7deea; background: #ffffff; color: #495a73; border-radius: 12px; padding: 10px 14px; font: inherit; font-size: 0.86rem; cursor: pointer; }
            .scope-detail__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
            .scope-detail__header h2 { margin: 0 0 4px; font-size: 1rem; }
            .scope-detail__header p { margin: 0; color: #6d7a8f; font-size: 0.78rem; }
            .scope-detail__summary, .scope-detail__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
            .scope-detail__card { border: 1px solid #dfe7f1; border-radius: 12px; padding: 18px; }
            .scope-detail__card--green { background: #edf9dd; border-color: #9fddb7; }
            .scope-detail__card--blue { background: #e9f4ff; border-color: #aed5ff; }
            .scope-detail__card span, .scope-detail__panel h3 { display: block; margin: 0 0 8px; color: #5f6f89; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }
            .scope-detail__card strong { display: block; color: #1a3556; font-size: 1.1rem; font-weight: 800; }
            .scope-detail__card p { margin: 6px 0 0; color: #5f7087; font-size: 0.74rem; }
            .scope-detail__panel { padding: 14px; }
            .scope-detail__rows { display: flex; flex-direction: column; gap: 10px; }
            .scope-detail__rows div { display: grid; grid-template-columns: 110px minmax(0, 1fr); gap: 10px; padding-bottom: 8px; border-bottom: 1px solid #edf1f7; }
            .scope-detail__rows div:last-child { border-bottom: none; padding-bottom: 0; }
            .scope-detail__rows span { color: #6f7d90; font-size: 0.76rem; }
            .scope-detail__rows strong { color: #1a2c45; font-size: 0.77rem; font-weight: 500; }
            .scope-detail__panel-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
            .scope-detail__panel-head span { color: #75839a; font-size: 0.92rem; }
            .scope-progress { height: 7px; margin-bottom: 16px; border-radius: 999px; background: #eef2f7; overflow: hidden; }
            .scope-progress__fill { display: block; height: 100%; border-radius: 999px; background: #1aa06f; }
            .scope-detail__table { width: 100%; border-collapse: collapse; }
            .scope-detail__table th, .scope-detail__table td { padding: 12px 8px; border-bottom: 1px solid #edf1f7; text-align: left; font-size: 0.72rem; vertical-align: middle; }
            .scope-mini-button, .scope-action-button { border: 1px solid #bcc5d2; background: #ffffff; color: #121a26; border-radius: 12px; padding: 8px 12px; font: inherit; font-size: 0.72rem; cursor: pointer; white-space: nowrap; }
            .scope-action-button--warn { color: #8c5200; }
            .scope-action-button--done { color: #0f4e30; }
            .scope-photo-modal__backdrop { position: fixed; inset: 0; display: grid; place-items: center; padding: 20px; background: rgba(18, 26, 38, 0.38); z-index: 90; }
            .scope-photo-modal { width: min(100%, 600px); padding: 22px; }
            .scope-photo-modal__header h3 { margin: 0 0 18px; color: #272727; font-size: 1rem; font-weight: 800; }
            .scope-photo-modal__tabs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); margin-bottom: 18px; border: 1px solid #dce3ec; border-radius: 12px; overflow: hidden; }
            .scope-photo-modal__tab { border: none; background: #ffffff; color: #5d6a7f; padding: 12px 10px; font: inherit; font-size: 0.78rem; cursor: pointer; }
            .scope-photo-modal__tab.is-active { font-weight: 700; }
            .scope-photo-modal__tab[data-photo-tab="survey"].is-active { background: #dcecff; color: #0f4d8a; }
            .scope-photo-modal__tab[data-photo-tab="completed"].is-active { background: #dff3ec; color: #0f6b5e; }
            .scope-photo-modal__tab[data-photo-tab="snagging"].is-active { background: #fff1dc; color: #9a5700; }
            .scope-photo-modal__drops { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; padding-bottom: 18px; border-bottom: 1px solid #e6ebf2; }
            .scope-photo-modal__drop { min-height: 68px; border: 1px dashed #cfd8e4; border-radius: 12px; background: #ffffff; color: #5d6879; display: flex; align-items: center; justify-content: center; gap: 10px; font: inherit; font-size: 0.78rem; cursor: pointer; }
            .scope-photo-modal__drop--survey { background: #dcecff; color: #0f4d8a; border-color: #a8cbfb; }
            .scope-photo-modal__drop--completed { background: #dff3ec; color: #0f6b5e; border-color: #a4e2d1; }
            .scope-photo-modal__drop--snagging { background: #fff1dc; color: #9a5700; border-color: #f0c98e; }
            .scope-photo-modal__footer { display: flex; justify-content: flex-end; padding-top: 18px; }
            .scope-photo-modal__done { border: none; border-radius: 12px; background: #1f1f1f; color: #ffffff; padding: 14px 24px; font: inherit; font-size: 0.88rem; font-weight: 700; cursor: pointer; }
            .scope-hidden-input { display: none; }
            @media (max-width: 900px) { .scope-shell { gap: 14px; } .scope-detail__summary, .scope-detail__grid, .scope-photo-modal__drops { grid-template-columns: 1fr; } }
        `,
        render: () => {
            const selectedJob = getSelectedJob();
            return `${renderListView()}${renderDetailView(selectedJob)}`;
        },
        openJob: (jobId) => {
            state.selectedJobId = Number(jobId);
            rerenderScopePage();
        },
        handleBackClick: () => {
            state.selectedJobId = null;
            state.photoModal.rowId = null;
            rerenderScopePage();
        },
        openPhotoModal: (rowId, tabKey) => {
            state.photoModal.rowId = Number(rowId);
            state.photoModal.activeTab = tabKey;
            rerenderScopePage();
        },
        toggleMark: (rowId) => {
            const row = getRowById(Number(rowId));
            if (!row) { return; }
            row.markDone = !row.markDone;
            rerenderScopePage();
        },
        onClick: (event, { rerender }) => {
            const clickTarget = event.target instanceof Element ? event.target : event.target?.parentElement;
            if (!clickTarget) { return false; }
            const closePhotoModalButton = clickTarget.closest("[data-close-photo-modal]");
            const photoModalBackdrop = clickTarget.closest(".scope-photo-modal__backdrop");
            const photoTabButton = clickTarget.closest("[data-photo-tab]");
            const uploadButton = clickTarget.closest("[data-photo-upload]");
            const cameraButton = clickTarget.closest("[data-photo-camera]");
            if (closePhotoModalButton || (photoModalBackdrop && clickTarget === photoModalBackdrop)) {
                state.photoModal.rowId = null;
                rerender();
                return true;
            }
            if (photoTabButton) {
                state.photoModal.activeTab = photoTabButton.getAttribute("data-photo-tab");
                rerender();
                return true;
            }
            if (uploadButton) {
                document.querySelector("[data-photo-upload-input]")?.click();
                return true;
            }
            if (cameraButton) {
                document.querySelector("[data-photo-camera-input]")?.click();
                return true;
            }
            return false;
        },
        onChange: (event, { rerender }) => {
            const uploadInput = event.target.closest("[data-photo-upload-input]");
            const cameraInput = event.target.closest("[data-photo-camera-input]");
            if ((!uploadInput && !cameraInput) || !state.photoModal.rowId) {
                return false;
            }
            const files = Array.from((uploadInput || cameraInput).files || []);
            if (!files.length) {
                return true;
            }
            rerender();
            return true;
        }
    };
})();

window.pageModules = window.pageModules || {};

window.pageModules.scope = (() => {
    const scopeJobs = [
        { id: 1, address: "42 Dorac Avenue SK8 3NZ", client: "MSV", tenant: "Mrs Grice", type: "Disrepair", contractor: "B&G Contractors", assigned: "Harmony", status: "Complete" },
        { id: 2, address: "14 Birchwood Close M22 4PR", client: "MSV", tenant: "Mr & Mrs Patel", type: "Disrepair", contractor: "B&G Contractors", assigned: "John Nelson", status: "In Progress" },
        { id: 3, address: "7 Maple Street SK1 2EF", client: "Wythenshawe Community", tenant: "Ms Thompson", type: "Planned Works", contractor: "B&G Contractors", assigned: "Harmony", status: "In Progress" },
        { id: 4, address: "33 Oak Lane WA15 9GH", client: "MSV", tenant: "Mr Yusuf", type: "Disrepair", contractor: "B&G Contractors", assigned: "-", status: "Needs Survey" },
        { id: 5, address: "55 Cedar Avenue SK4 1LM", client: "MSV", tenant: "Mr Singh", type: "Planned Works", contractor: "B&G Contractors", assigned: "Dave", status: "Quoted" },
        { id: 6, address: "8 Willow Court M20 6NP", client: "Wythenshawe Community", tenant: "Mrs Davies", type: "Disrepair", contractor: "B&G Contractors", assigned: "Harmony", status: "Complete" },
        { id: 7, address: "22 Birch Grove WA14 7QT", client: "MSV", tenant: "Mrs Walton", type: "Disrepair", contractor: "B&G Contractors", assigned: "Dave", status: "Needs Snagging" }
    ];

    const defaultDetailRows = [
        { id: 1, location: "Hallway", assign: "Assign", scope: "Hack off damp plaster and re-plaster right and left wall in entrance hall", qty: "3", unit: "SM", price: "—", markDone: false, snagNote: "", rectifiedNote: "", isSnagged: false, isRectified: false, snagAssignedTo: "Harmony" },
        { id: 2, location: "Hallway", assign: "Assign", scope: "Install passive vent in store cupboard", qty: "1", unit: "NO", price: "—", markDone: true, snagNote: "", rectifiedNote: "", isSnagged: false, isRectified: false, snagAssignedTo: "Harmony" },
        { id: 3, location: "Hallway", assign: "Assign", scope: "Remove and renew decaying skirting boards", qty: "3", unit: "LM", price: "—", markDone: true, snagNote: "", rectifiedNote: "", isSnagged: false, isRectified: false, snagAssignedTo: "Harmony" },
        { id: 4, location: "Bedroom 1", assign: "Assign", scope: "Mould wash window seals — first floor", qty: "14", unit: "SM", price: "—", markDone: true, snagNote: "", rectifiedNote: "", isSnagged: false, isRectified: false, snagAssignedTo: "Harmony" }
    ];

    const PHOTO_TABS = {
        survey: { label: "Survey Images", uploadClass: "scope-photo-modal__drop--neutral", cameraClass: "scope-photo-modal__drop--survey" },
        completed: { label: "Completed Images", uploadClass: "scope-photo-modal__drop--neutral", cameraClass: "scope-photo-modal__drop--completed" },
        snagging: { label: "Snagging Images", uploadClass: "scope-photo-modal__drop--neutral", cameraClass: "scope-photo-modal__drop--snagging" }
    };

    const MATERIAL_TABS = {
        works: {
            label: "Works value materials",
            caption: "Deducted from complete works value (client invoice)",
            empty: "No works value materials logged yet.",
            accentClass: "scope-materials-card__column--works"
        },
        job: {
            label: "Job price materials",
            caption: "Deducted from contractor job price (contractor payment)",
            empty: "No job price materials logged yet.",
            accentClass: "scope-materials-card__column--job"
        }
    };

    const state = {
        selectedJobId: null,
        detailRows: defaultDetailRows.map((row) => ({ ...row })),
        photoModal: { rowId: null, activeTab: "survey" },
        snagModal: { rowId: null, note: "" },
        reallocateModal: { rowId: null, operative: "Harmony" },
        rectifyModal: { rowId: null, note: "" },
        materialsModal: {
            isOpen: false,
            activeTab: "works",
            description: "",
            qty: "1",
            unitCost: "0.00"
        },
        materialsByJob: {}
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

    function findJobByAddress(address) {
        return scopeJobs.find((job) => job.address === address) || null;
    }

    function getRowById(rowId) {
        return state.detailRows.find((row) => row.id === rowId) || null;
    }

    function getJobFinancials(job) {
        if (!job) {
            return { worksValue: 0, jobPrice: 0 };
        }

        return {
            worksValue: 3200,
            jobPrice: 1850
        };
    }

    function formatCurrency(value) {
        return `£${Number(value || 0).toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }

    function formatCurrencyInput(value) {
        return Number(value || 0).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function getJobMaterials(jobId) {
        if (!state.materialsByJob[jobId]) {
            state.materialsByJob[jobId] = {
                works: [],
                job: []
            };
        }

        return state.materialsByJob[jobId];
    }

    function getMaterialItems(jobId, tabKey) {
        const materials = getJobMaterials(jobId);
        return materials[tabKey] || [];
    }

    function getMaterialTotal(jobId, tabKey) {
        return getMaterialItems(jobId, tabKey).reduce((sum, item) => sum + item.total, 0);
    }

    function getSummary() {
        const total = state.detailRows.length || 1;
        const done = state.detailRows.filter((row) => row.markDone).length;
        const percent = Math.round((done / total) * 100);
        return { done, total, percent };
    }

    function getOutstandingSnagRows() {
        return state.detailRows.filter((row) => row.isSnagged && !row.isRectified);
    }

    function isRowComplete(row) {
        return row.isRectified || row.markDone;
    }

    function getRowStatus(row) {
        if (row.isRectified) {
            return row.markDone
                ? { label: "Complete", className: "scope-status-pill--complete" }
                : { label: "✓ Rectified", className: "scope-status-pill--rectified" };
        }

        return row.markDone
            ? { label: "Complete", className: "scope-status-pill--complete" }
            : { label: "Pending", className: "scope-status-pill--pending" };
    }

    function renderSnagActions(row) {
        if (row.isRectified) {
            return `
                <div class="scope-snag-actions">
                    <button class="scope-action-button scope-action-button--done" type="button" onclick="window.pageModules.scope.openRectifyModal(${row.id}); return false;">&#10003; Rectified</button>
                </div>
            `;
        }

        if (row.isSnagged) {
            return `
                <div class="scope-snag-actions">
                    <button class="scope-action-button scope-action-button--warn" type="button" onclick="window.pageModules.scope.openSnagModal(${row.id}); return false;">&#9888; Snagged</button>
                    <button class="scope-action-button scope-action-button--done" type="button" onclick="window.pageModules.scope.openRectifyModal(${row.id}); return false;">&#10003; Rectified</button>
                </div>
            `;
        }

        return `
            <div class="scope-snag-actions">
                <button class="scope-action-button scope-action-button--warn" type="button" onclick="window.pageModules.scope.openSnagModal(${row.id}); return false;">&#9888; Snag</button>
            </div>
        `;
    }

    function renderMarkButton(row) {
        return `<button class="scope-action-button${row.markDone ? " scope-action-button--done" : ""}" type="button" onclick="window.pageModules.scope.toggleMark(${row.id}); return false;">${row.markDone ? "Undo" : "&#10003; Done"}</button>`;
    }

    function renderScopeNote(row) {
        const notes = [];

        if (row.isSnagged && row.snagNote) {
            notes.push(`<div class="scope-inline-note scope-inline-note--snag">&#9888; ${row.snagNote}</div>`);
        }

        if (row.isRectified && row.rectifiedNote) {
            notes.push(`<div class="scope-inline-note scope-inline-note--rectified">&#10003; ${row.rectifiedNote}</div>`);
        }

        return notes.join("");
    }

    function renderSnagModal() {
        const row = getRowById(state.snagModal.rowId);

        if (!row) {
            return "";
        }

        const isEdit = row.isSnagged;

        return `
            <div class="scope-snag-modal__backdrop" data-snag-modal-backdrop>
                <section class="scope-snag-modal" role="dialog" aria-modal="true" aria-label="Snag item">
                    <div class="scope-snag-modal__header">
                        <h3>&#9888; ${isEdit ? "Edit snag" : "Snag this item"} — ${row.location.toUpperCase()}</h3>
                        <p>${row.scope}</p>
                    </div>
                    <div class="scope-snag-modal__notice">
                        Flagging this item will highlight it for the assigned operative and appear in the snagging section of the scope of works.
                    </div>
                    <label class="scope-snag-modal__field">
                        <span>Snag note for this item *</span>
                        <textarea rows="4" placeholder="e.g. Plaster finish not smooth enough — needs reworking..." data-snag-note>${state.snagModal.note}</textarea>
                    </label>
                    ${isEdit ? `<button class="scope-snag-modal__clear" type="button" data-clear-snag>✓ Clear snag flag on this item</button>` : ""}
                    <div class="scope-snag-modal__footer">
                        <button class="scope-snag-modal__secondary" type="button" data-close-snag-modal>Cancel</button>
                        <button class="scope-snag-modal__primary" type="button" data-save-snag>${isEdit ? "&#9888; Update snag" : "&#9888; Flag as snagged"}</button>
                    </div>
                </section>
            </div>
        `;
    }

    function renderReallocateModal(job) {
        const row = getRowById(state.reallocateModal.rowId);

        if (!row || !job) {
            return "";
        }

        return `
            <div class="scope-snag-modal__backdrop" data-reallocate-modal-backdrop>
                <section class="scope-snag-modal scope-snag-modal--compact" role="dialog" aria-modal="true" aria-label="Re-allocate for snagging">
                    <div class="scope-snag-modal__header">
                        <h3>&#128119; Re-allocate for snagging</h3>
                        <p>${job.address} — ${job.tenant}</p>
                    </div>
                    <div class="scope-snag-modal__notice">Snag: Item snagged: ${row.location.toUpperCase()} — ${row.snagNote}</div>
                    <div class="scope-snag-modal__muted">All field operatives linked to this contractor can already see snagging jobs. Assigning a specific operative here marks one person as the lead for the remedial visit.</div>
                    <label class="scope-snag-modal__field">
                        <span>Assign operative for snagging visit</span>
                        <select data-reallocate-operative>
                            ${["Harmony", "John Nelson", "Dave"].map((option) => `<option value="${option}" ${state.reallocateModal.operative === option ? "selected" : ""}>${option}</option>`).join("")}
                        </select>
                    </label>
                    <div class="scope-snag-modal__footer">
                        <button class="scope-snag-modal__secondary" type="button" data-close-reallocate-modal>Cancel</button>
                        <button class="scope-snag-modal__dark" type="button" data-save-reallocate>Confirm re-allocation</button>
                    </div>
                </section>
            </div>
        `;
    }

    function renderRectifyModal() {
        const row = getRowById(state.rectifyModal.rowId);

        if (!row) {
            return "";
        }

        return `
            <div class="scope-snag-modal__backdrop" data-rectify-modal-backdrop>
                <section class="scope-snag-modal scope-snag-modal--compact" role="dialog" aria-modal="true" aria-label="Mark snag as rectified">
                    <div class="scope-snag-modal__header">
                        <h3>&#10003; Mark snag as rectified</h3>
                    </div>
                    <div class="scope-snag-modal__notice">
                        <strong>${row.location.toUpperCase()}</strong><br>
                        ${row.scope}<br>
                        &#9888; Snag: ${row.snagNote}
                    </div>
                    <label class="scope-snag-modal__field">
                        <span>Describe the rectification work carried out *</span>
                        <textarea rows="4" placeholder="e.g. Re-plastered and sanded down — finish now meets required standard..." data-rectify-note>${state.rectifyModal.note}</textarea>
                    </label>
                    <div class="scope-snag-modal__footer">
                        <button class="scope-snag-modal__secondary" type="button" data-close-rectify-modal>Cancel</button>
                        <button class="scope-snag-modal__success" type="button" data-save-rectify>&#10003; Confirm rectified</button>
                    </div>
                </section>
            </div>
        `;
    }

    function renderSnagCards() {
        const rows = getOutstandingSnagRows();

        if (!rows.length) {
            return "";
        }

        return `
            <section class="scope-snag-card scope-snag-card--warning">
                <h3>&#9888; Snagging required</h3>
                <div class="scope-snag-card__note">Item snagged: ${rows[0].location.toUpperCase()} — ${rows[0].snagNote}</div>
                <p>Raised by Miles Jackson on 16 Apr 2026</p>
                <button class="scope-action-button scope-action-button--warn" type="button" onclick="window.pageModules.scope.openReallocateModal(${rows[0].id}); return false;">&#128119; Re-allocate to operative</button>
            </section>
            <section class="scope-snag-card scope-snag-card--info">
                <div class="scope-snag-card__top">
                    <div>
                        <h3>&#128295; Snagging rectification progress</h3>
                        <div class="scope-snag-card__pill-row">
                            <span class="scope-type-pill scope-type-pill--planned-works">${rows[0].location.toUpperCase()}</span>
                            <span class="scope-snag-card__badge">&#9888; Outstanding</span>
                        </div>
                        <p>${rows[0].scope}</p>
                        <small>Snag: ${rows[0].snagNote}</small>
                    </div>
                    <button class="scope-action-button scope-action-button--done" type="button" onclick="window.pageModules.scope.openRectifyModal(${rows[0].id}); return false;">&#10003; Mark rectified</button>
                </div>
            </section>
        `;
    }

    function renderMaterialsSummaryColumn(job, tabKey) {
        const config = MATERIAL_TABS[tabKey];
        const financials = getJobFinancials(job);
        const baseValue = tabKey === "works" ? financials.worksValue : financials.jobPrice;
        const totalDeducted = getMaterialTotal(job.id, tabKey);
        const netValue = baseValue - totalDeducted;
        const items = getMaterialItems(job.id, tabKey);

        return `
            <article class="scope-materials-card__column ${config.accentClass}">
                <h4>${config.label.toUpperCase()}</h4>
                <p>${tabKey === "works" ? "Deducted from client invoice" : "Deducted from contractor payment"}</p>
                ${items.length ? `
                    <div class="scope-materials-card__list">
                        ${items.map((item) => `
                            <div class="scope-materials-card__line">
                                <span>${item.description}</span>
                                <span>${item.qty} x ${formatCurrency(item.unitCost)} <strong>${formatCurrency(item.total)}</strong></span>
                            </div>
                        `).join("")}
                    </div>
                    <div class="scope-materials-card__total">
                        <span>Total deducted</span>
                        <strong>${formatCurrency(totalDeducted)}</strong>
                    </div>
                ` : `
                    <div class="scope-materials-card__empty">${config.empty}</div>
                `}
                <div class="scope-materials-card__net ${tabKey === "works" ? "scope-materials-card__net--works" : "scope-materials-card__net--job"}">
                    <small>${tabKey === "works" ? `Works value: ${formatCurrency(baseValue)}` : `Job price: ${formatCurrency(baseValue)}`}</small>
                    <strong>Net: ${formatCurrency(netValue)}</strong>
                </div>
            </article>
        `;
    }

    function renderMaterialsSection(job) {
        const worksCount = getMaterialItems(job.id, "works").length;
        const jobCount = getMaterialItems(job.id, "job").length;
        const hasItems = worksCount || jobCount;

        return `
            <section class="scope-detail__panel scope-materials-card">
                <div class="scope-materials-card__header">
                    <div>
                        <h3>Materials costs</h3>
                        <p>${hasItems ? "Two separate columns — deducted independently from works value and job price" : "Deducted from both job price and complete works value"}</p>
                    </div>
                    <button class="scope-action-button scope-materials-card__add" type="button" data-open-materials-modal>+ Add material</button>
                </div>
                ${hasItems ? `
                    <div class="scope-materials-card__columns">
                        ${renderMaterialsSummaryColumn(job, "works")}
                        ${renderMaterialsSummaryColumn(job, "job")}
                    </div>
                ` : `
                    <div class="scope-materials-card__empty-state">No materials logged yet. Click + Add material to begin.</div>
                `}
            </section>
        `;
    }

    function renderMaterialsModal(job) {
        if (!state.materialsModal.isOpen || !job) {
            return "";
        }

        const activeTab = state.materialsModal.activeTab;
        const config = MATERIAL_TABS[activeTab];
        const financials = getJobFinancials(job);
        const baseValue = activeTab === "works" ? financials.worksValue : financials.jobPrice;
        const items = getMaterialItems(job.id, activeTab);
        const totalDeducted = getMaterialTotal(job.id, activeTab);
        const netValue = baseValue - totalDeducted;

        return `
            <div class="scope-snag-modal__backdrop" data-materials-modal-backdrop>
                <section class="scope-snag-modal scope-materials-modal" role="dialog" aria-modal="true" aria-label="Materials costs">
                    <div class="scope-materials-modal__header">
                        <h3>Materials costs</h3>
                        <p>${job.address} — ${job.client}</p>
                    </div>
                    <div class="scope-materials-modal__tabs">
                        ${Object.entries(MATERIAL_TABS).map(([key, tab]) => `
                            <button class="scope-materials-modal__tab${activeTab === key ? " is-active" : ""}" type="button" data-materials-tab="${key}">${tab.label}</button>
                        `).join("")}
                    </div>
                    <div class="scope-materials-modal__caption">${config.caption}</div>
                    <div class="scope-materials-modal__form">
                        <h4>Add material line item</h4>
                        <div class="scope-materials-modal__fields">
                            <label class="scope-materials-modal__field scope-materials-modal__field--description">
                                <span>Description *</span>
                                <input type="text" value="${state.materialsModal.description}" placeholder="e.g. Multi-finish plaster 25kg" data-material-description>
                            </label>
                            <label class="scope-materials-modal__field">
                                <span>Qty</span>
                                <input type="number" min="1" step="1" value="${state.materialsModal.qty}" data-material-qty>
                            </label>
                            <label class="scope-materials-modal__field">
                                <span>Unit cost (£)</span>
                                <input type="number" min="0" step="0.01" value="${state.materialsModal.unitCost}" data-material-cost>
                            </label>
                            <button class="scope-materials-modal__add" type="button" data-add-material-item>+ Add</button>
                        </div>
                    </div>
                    ${items.length ? `
                        <table class="scope-materials-modal__table">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Qty</th>
                                    <th>Unit cost</th>
                                    <th>Total</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                ${items.map((item) => `
                                    <tr>
                                        <td>${item.description}</td>
                                        <td>${item.qty}</td>
                                        <td>${formatCurrency(item.unitCost)}</td>
                                        <td><strong>${formatCurrency(item.total)}</strong></td>
                                        <td><button class="scope-materials-modal__remove" type="button" data-remove-material-item="${item.id}">x</button></td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                        <div class="scope-materials-modal__total-row">
                            <span>Total deducted</span>
                            <strong>${formatCurrency(totalDeducted)}</strong>
                        </div>
                    ` : `
                        <div class="scope-materials-modal__empty">${config.empty}</div>
                    `}
                    <div class="scope-materials-modal__net ${activeTab === "works" ? "scope-materials-modal__net--works" : "scope-materials-modal__net--job"}">
                        <div>
                            <small>${activeTab === "works" ? `Works value: ${formatCurrency(baseValue)}` : `Job price: ${formatCurrency(baseValue)}`}</small>
                            <small>Materials: -${formatCurrency(totalDeducted)}</small>
                        </div>
                        <div>
                            <small>${activeTab === "works" ? "Net works value" : "Net job price"}</small>
                            <strong>${formatCurrency(netValue)}</strong>
                        </div>
                    </div>
                    <div class="scope-snag-modal__footer">
                        <button class="scope-snag-modal__dark" type="button" data-close-materials-modal>Done</button>
                    </div>
                </section>
            </div>
        `;
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
                            ${state.detailRows.map((row) => {
                                const rowStatus = getRowStatus(row);
                                return `
                                <tr>
                                    <td><span class="scope-status-pill ${rowStatus.className}">${rowStatus.label}</span></td>
                                    <td><span class="scope-type-pill scope-type-pill--planned-works">${row.location.toUpperCase()}</span></td>
                                    <td><button class="scope-mini-button" type="button">${row.assign}</button></td>
                                    <td>${row.scope}${renderScopeNote(row)}</td>
                                    <td>${row.qty}</td>
                                    <td>${row.unit}</td>
                                    <td>${row.price}</td>
                                    <td><button class="scope-action-button" type="button" onclick="window.pageModules.scope.openPhotoModal(${row.id}, 'survey'); return false;">Survey</button></td>
                                    <td><button class="scope-action-button" type="button" onclick="window.pageModules.scope.openPhotoModal(${row.id}, 'completed'); return false;">Completed</button></td>
                                    <td><button class="scope-action-button" type="button" onclick="window.pageModules.scope.openPhotoModal(${row.id}, 'snagging'); return false;">Snagging</button></td>
                                    <td>${renderSnagActions(row)}</td>
                                    <td>${renderMarkButton(row)}</td>
                                </tr>
                            `;
                            }).join("")}
                        </tbody>
                    </table>
                </div>
                ${renderMaterialsSection(job)}
                ${renderSnagCards()}
                ${renderPhotoModal()}
                ${renderSnagModal()}
                ${renderReallocateModal(job)}
                ${renderRectifyModal()}
                ${renderMaterialsModal(job)}
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
            .scope-status-pill--rectified { background: #ddf7ef; color: #0f7357; border: 1px solid #97dbc7; }
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
            .scope-snag-actions { display: flex; flex-direction: column; gap: 6px; align-items: flex-start; }
            .scope-inline-note { margin-top: 8px; padding: 4px 8px; border-radius: 8px; font-size: 0.72rem; }
            .scope-inline-note--snag { background: #fef2dc; color: #9a5c0b; }
            .scope-inline-note--rectified { background: #dff6ef; color: #0f7357; }
            .scope-snag-card { border: 1px solid #e4e8f0; border-radius: 18px; padding: 18px; }
            .scope-snag-card--warning { background: #fff8ef; border-color: #f1c48f; }
            .scope-snag-card--info { background: #f1fcf8; border-color: #b6e6d8; }
            .scope-snag-card h3 { margin: 0 0 14px; color: #1f2a3a; font-size: 1rem; font-weight: 800; }
            .scope-snag-card__note { margin-bottom: 12px; padding: 12px 14px; border-radius: 10px; background: rgba(248, 215, 160, 0.24); color: #92590d; }
            .scope-snag-card p, .scope-snag-card small { margin: 0; color: #64707f; }
            .scope-snag-card__top { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; }
            .scope-snag-card__pill-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
            .scope-snag-card__badge { display: inline-flex; align-items: center; justify-content: center; min-height: 26px; padding: 4px 12px; border-radius: 999px; background: #fff0da; color: #a56610; border: 1px solid #f0c98b; font-size: 0.72rem; font-weight: 700; }
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
            .scope-snag-modal__backdrop { position: fixed; inset: 0; display: grid; place-items: center; padding: 20px; background: rgba(18, 26, 38, 0.45); z-index: 95; }
            .scope-snag-modal { width: min(100%, 620px); background: #ffffff; border: 1px solid #e4e8f0; border-radius: 22px; padding: 28px; box-shadow: 0 18px 36px rgba(24, 36, 61, 0.18); }
            .scope-snag-modal__header h3 { margin: 0 0 16px; color: #242424; font-size: 1.05rem; font-weight: 800; }
            .scope-snag-modal__header p { margin: 0 0 20px; color: #6c6c6c; font-size: 0.9rem; line-height: 1.55; }
            .scope-snag-modal__notice { margin-bottom: 22px; padding: 16px 18px; border: 1px solid #f4c38f; border-radius: 14px; background: #fff3e2; color: #9b5a12; font-size: 0.92rem; line-height: 1.5; }
            .scope-snag-modal__field { display: grid; gap: 10px; }
            .scope-snag-modal__field span { color: #707070; font-size: 0.92rem; font-weight: 700; }
            .scope-snag-modal__field textarea { width: 100%; resize: vertical; min-height: 108px; border: 1px solid #cfd3db; border-radius: 14px; padding: 16px; color: #4e4e4e; font: inherit; font-size: 0.95rem; line-height: 1.5; }
            .scope-snag-modal__field select { width: 100%; min-height: 54px; border: 1px solid #cfd3db; border-radius: 14px; padding: 12px 16px; color: #4e4e4e; font: inherit; font-size: 0.95rem; background: #ffffff; }
            .scope-snag-modal__clear { margin-top: 18px; border: 1px solid #94dcc8; background: #e7fbf3; color: #0d7154; border-radius: 14px; padding: 14px 18px; font: inherit; font-size: 0.95rem; font-weight: 700; cursor: pointer; }
            .scope-snag-modal__muted { margin-top: 14px; margin-bottom: 18px; padding: 14px 16px; border-radius: 12px; background: #f3f3f3; color: #707070; line-height: 1.55; }
            .scope-snag-modal__footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e6e6e6; }
            .scope-snag-modal__secondary, .scope-snag-modal__primary { border-radius: 14px; padding: 14px 20px; font: inherit; font-size: 0.95rem; cursor: pointer; }
            .scope-snag-modal__secondary { border: 1px solid #d0d5dd; background: #ffffff; color: #6d6d6d; }
            .scope-snag-modal__primary { border: 1px solid #f0b06f; background: #fff4e8; color: #a3550a; font-weight: 700; }
            .scope-snag-modal__dark { border: none; border-radius: 14px; background: #1f1f1f; color: #ffffff; padding: 14px 20px; font: inherit; font-size: 0.95rem; font-weight: 700; cursor: pointer; }
            .scope-snag-modal__success { border: none; border-radius: 14px; background: #1faa83; color: #ffffff; padding: 14px 20px; font: inherit; font-size: 0.95rem; font-weight: 700; cursor: pointer; }
            .scope-snag-modal--compact { width: min(100%, 520px); }
            .scope-materials-card { border-color: #b8e3d6; padding: 12px; }
            .scope-materials-card__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; margin-bottom: 8px; }
            .scope-materials-card__header h3 { margin: 0 0 4px; font-size: 0.92rem; }
            .scope-materials-card__header p { margin: 0; color: #5f7087; font-size: 0.74rem; line-height: 1.4; }
            .scope-materials-card__add { background: #e6faf3; border-color: #9ddac8; color: #0c6d52; padding: 7px 11px; font-size: 0.7rem; }
            .scope-materials-card__empty-state { display: grid; place-items: center; min-height: 58px; color: #6f7d90; text-align: center; font-size: 0.76rem; }
            .scope-materials-card__columns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
            .scope-materials-card__column { border-radius: 12px; padding: 12px; }
            .scope-materials-card__column--works { background: #eff8de; }
            .scope-materials-card__column--job { background: #e6f1ff; }
            .scope-materials-card__column h4 { margin: 0 0 4px; color: #16314f; font-size: 0.7rem; letter-spacing: 0.05em; }
            .scope-materials-card__column p { margin: 0 0 8px; color: #33506d; font-size: 0.72rem; }
            .scope-materials-card__list { display: flex; flex-direction: column; gap: 7px; margin-bottom: 8px; }
            .scope-materials-card__line { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding-bottom: 6px; border-bottom: 1px solid rgba(51, 80, 109, 0.14); font-size: 0.72rem; }
            .scope-materials-card__line strong { color: #18243d; }
            .scope-materials-card__total { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 0 10px; font-size: 0.75rem; font-weight: 700; color: #9a5700; }
            .scope-materials-card__empty { min-height: 48px; display: grid; place-items: center; text-align: center; color: #64707f; font-size: 0.74rem; }
            .scope-materials-card__net { border-radius: 10px; background: rgba(255, 255, 255, 0.78); padding: 10px 12px; }
            .scope-materials-card__net small { display: block; color: #5f7087; font-size: 0.68rem; }
            .scope-materials-card__net strong { display: block; margin-top: 3px; color: #0f4d8a; font-size: 0.84rem; }
            .scope-materials-card__net--works strong { color: #2f6411; }
            .scope-materials-modal { width: min(100%, 700px); padding: 22px; }
            .scope-materials-modal__header h3 { margin: 0 0 12px; color: #242424; font-size: 1.18rem; font-weight: 800; }
            .scope-materials-modal__header p { margin: 0 0 14px; color: #7a7a7a; font-size: 0.86rem; }
            .scope-materials-modal__tabs { display: flex; gap: 4px; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #dde4ee; }
            .scope-materials-modal__tab { border: none; background: transparent; color: #6f7783; padding: 7px 8px; font: inherit; font-size: 0.84rem; cursor: pointer; }
            .scope-materials-modal__tab.is-active { color: #222222; font-weight: 800; box-shadow: inset 0 -2px 0 #3388ff; }
            .scope-materials-modal__caption { margin-bottom: 10px; color: #6c727e; font-size: 0.82rem; }
            .scope-materials-modal__form { border-radius: 14px; background: #f7f7f7; padding: 14px; margin-bottom: 14px; }
            .scope-materials-modal__form h4 { margin: 0 0 10px; color: #222; font-size: 0.92rem; }
            .scope-materials-modal__fields { display: grid; grid-template-columns: minmax(0, 2fr) 0.6fr 0.8fr auto; gap: 10px; align-items: end; }
            .scope-materials-modal__field { display: grid; gap: 8px; }
            .scope-materials-modal__field span { color: #6e6e6e; font-size: 0.76rem; font-weight: 700; }
            .scope-materials-modal__field input { width: 100%; min-height: 40px; border: 1px solid #c9ced8; border-radius: 10px; padding: 9px 11px; font: inherit; font-size: 0.86rem; }
            .scope-materials-modal__add { min-height: 40px; border: none; border-radius: 10px; background: #1f1f1f; color: #fff; padding: 0 16px; font: inherit; font-size: 0.86rem; font-weight: 700; cursor: pointer; }
            .scope-materials-modal__empty { margin: 6px 0 14px; color: #6c727e; font-size: 0.84rem; }
            .scope-materials-modal__table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
            .scope-materials-modal__table th, .scope-materials-modal__table td { padding: 10px 8px; border-bottom: 1px solid #dde4ee; text-align: left; font-size: 0.8rem; }
            .scope-materials-modal__table th { color: #727d8f; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
            .scope-materials-modal__remove { border: none; background: transparent; color: #e26161; font: inherit; font-size: 0.9rem; cursor: pointer; }
            .scope-materials-modal__total-row { display: flex; align-items: center; justify-content: flex-end; gap: 18px; padding: 10px 8px 12px; color: #222; font-weight: 700; font-size: 0.82rem; }
            .scope-materials-modal__total-row strong { color: #9a5700; }
            .scope-materials-modal__net { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-top: 8px; border-radius: 12px; padding: 12px 14px; }
            .scope-materials-modal__net--works { background: #eff8de; }
            .scope-materials-modal__net--job { background: #e6f1ff; }
            .scope-materials-modal__net small { display: block; color: #5f7087; font-size: 0.72rem; }
            .scope-materials-modal__net strong { display: block; margin-top: 4px; color: #18498a; font-size: 1.35rem; font-weight: 800; }
            .scope-materials-modal__net--works strong { color: #2e6410; }
            .scope-hidden-input { display: none; }
            @media (max-width: 900px) { .scope-shell { gap: 14px; } .scope-detail__summary, .scope-detail__grid, .scope-photo-modal__drops, .scope-materials-card__columns { grid-template-columns: 1fr; } .scope-snag-modal { padding: 22px; } .scope-snag-card__top, .scope-materials-card__header, .scope-materials-modal__net { flex-direction: column; } .scope-materials-modal__fields { grid-template-columns: 1fr; } }
        `,
        render: () => {
            const selectedJob = getSelectedJob();
            return `${renderListView()}${renderDetailView(selectedJob)}`;
        },
        findJobByAddress,
        addOrUpdateJob: (job) => {
            if (!job?.address) {
                return false;
            }

            const existingJob = findJobByAddress(job.address);
            const nextValues = {
                address: job.address,
                client: job.client || "-",
                tenant: job.tenant || "-",
                type: job.type || "Disrepair",
                contractor: job.contractor === "— None —" ? "-" : (job.contractor || "-"),
                assigned: job.assigned === "Unassigned" ? "-" : (job.assigned || "-"),
                status: job.status || "Needs Survey"
            };

            if (existingJob) {
                Object.assign(existingJob, nextValues);
            } else {
                const nextId = scopeJobs.reduce((max, item) => Math.max(max, item.id), 0) + 1;
                scopeJobs.unshift({
                    id: nextId,
                    ...nextValues
                });
            }

            rerenderScopePage();
            return true;
        },
        removeJobByAddress: (address) => {
            const jobIndex = scopeJobs.findIndex((job) => job.address === address);
            if (jobIndex === -1) {
                return false;
            }

            scopeJobs.splice(jobIndex, 1);
            if (state.selectedJobId && !scopeJobs.some((job) => job.id === state.selectedJobId)) {
                state.selectedJobId = null;
            }
            rerenderScopePage();
            return true;
        },
        openJob: (jobId) => {
            state.selectedJobId = Number(jobId);
            rerenderScopePage();
        },
        openJobByAddress: (address) => {
            const job = findJobByAddress(address);
            if (!job) {
                return false;
            }
            state.selectedJobId = job.id;
            state.photoModal.rowId = null;
            rerenderScopePage();
            return true;
        },
        handleBackClick: () => {
            state.selectedJobId = null;
            state.photoModal.rowId = null;
            rerenderScopePage();
        },
        openMaterialsModal: (tabKey = "works") => {
            state.materialsModal.isOpen = true;
            state.materialsModal.activeTab = tabKey;
            rerenderScopePage();
        },
        openPhotoModal: (rowId, tabKey) => {
            state.photoModal.rowId = Number(rowId);
            state.photoModal.activeTab = tabKey;
            rerenderScopePage();
        },
        openSnagModal: (rowId) => {
            const row = getRowById(Number(rowId));
            if (!row) { return; }
            state.snagModal.rowId = row.id;
            state.snagModal.note = row.snagNote || "";
            rerenderScopePage();
        },
        openReallocateModal: (rowId) => {
            const row = getRowById(Number(rowId));
            if (!row) { return; }
            state.reallocateModal.rowId = row.id;
            state.reallocateModal.operative = row.snagAssignedTo || "Harmony";
            rerenderScopePage();
        },
        openRectifyModal: (rowId) => {
            const row = getRowById(Number(rowId));
            if (!row) { return; }
            state.rectifyModal.rowId = row.id;
            state.rectifyModal.note = row.rectifiedNote || "";
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
            const closeSnagModalButton = clickTarget.closest("[data-close-snag-modal]");
            const snagModalBackdrop = clickTarget.closest("[data-snag-modal-backdrop]");
            const saveSnagButton = clickTarget.closest("[data-save-snag]");
            const clearSnagButton = clickTarget.closest("[data-clear-snag]");
            const closeReallocateButton = clickTarget.closest("[data-close-reallocate-modal]");
            const reallocateBackdrop = clickTarget.closest("[data-reallocate-modal-backdrop]");
            const saveReallocateButton = clickTarget.closest("[data-save-reallocate]");
            const closeRectifyButton = clickTarget.closest("[data-close-rectify-modal]");
            const rectifyBackdrop = clickTarget.closest("[data-rectify-modal-backdrop]");
            const saveRectifyButton = clickTarget.closest("[data-save-rectify]");
            const openMaterialsModalButton = clickTarget.closest("[data-open-materials-modal]");
            const closeMaterialsModalButton = clickTarget.closest("[data-close-materials-modal]");
            const materialsModalBackdrop = clickTarget.closest("[data-materials-modal-backdrop]");
            const materialsTabButton = clickTarget.closest("[data-materials-tab]");
            const addMaterialItemButton = clickTarget.closest("[data-add-material-item]");
            const removeMaterialItemButton = clickTarget.closest("[data-remove-material-item]");
            if (closePhotoModalButton || (photoModalBackdrop && clickTarget === photoModalBackdrop)) {
                state.photoModal.rowId = null;
                rerender();
                return true;
            }
            if (closeSnagModalButton || (snagModalBackdrop && clickTarget === snagModalBackdrop)) {
                state.snagModal.rowId = null;
                state.snagModal.note = "";
                rerender();
                return true;
            }
            if (saveSnagButton) {
                const row = getRowById(state.snagModal.rowId);
                if (!row || !state.snagModal.note.trim()) {
                    return true;
                }
                row.isSnagged = true;
                row.isRectified = false;
                row.snagNote = state.snagModal.note.trim();
                row.rectifiedNote = "";
                state.snagModal.rowId = null;
                state.snagModal.note = "";
                rerender();
                return true;
            }
            if (clearSnagButton) {
                const row = getRowById(state.snagModal.rowId);
                if (!row) {
                    return true;
                }
                row.isSnagged = false;
                row.isRectified = false;
                row.snagNote = "";
                row.rectifiedNote = "";
                state.snagModal.rowId = null;
                state.snagModal.note = "";
                state.reallocateModal.rowId = null;
                state.rectifyModal.rowId = null;
                state.rectifyModal.note = "";
                rerender();
                return true;
            }
            if (closeReallocateButton || (reallocateBackdrop && clickTarget === reallocateBackdrop)) {
                state.reallocateModal.rowId = null;
                rerender();
                return true;
            }
            if (saveReallocateButton) {
                const row = getRowById(state.reallocateModal.rowId);
                if (row) {
                    row.snagAssignedTo = state.reallocateModal.operative;
                }
                state.reallocateModal.rowId = null;
                rerender();
                return true;
            }
            if (closeRectifyButton || (rectifyBackdrop && clickTarget === rectifyBackdrop)) {
                state.rectifyModal.rowId = null;
                state.rectifyModal.note = "";
                rerender();
                return true;
            }
            if (saveRectifyButton) {
                const row = getRowById(state.rectifyModal.rowId);
                if (!row || !state.rectifyModal.note.trim()) {
                    return true;
                }
                row.isSnagged = true;
                row.isRectified = true;
                row.markDone = true;
                row.rectifiedNote = state.rectifyModal.note.trim();
                state.rectifyModal.rowId = null;
                state.rectifyModal.note = "";
                rerender();
                return true;
            }
            if (openMaterialsModalButton) {
                state.materialsModal.isOpen = true;
                rerender();
                return true;
            }
            if (closeMaterialsModalButton || (materialsModalBackdrop && clickTarget === materialsModalBackdrop)) {
                state.materialsModal.isOpen = false;
                rerender();
                return true;
            }
            if (materialsTabButton) {
                state.materialsModal.activeTab = materialsTabButton.getAttribute("data-materials-tab");
                rerender();
                return true;
            }
            if (addMaterialItemButton) {
                const job = getSelectedJob();
                const description = state.materialsModal.description.trim();
                const qty = Math.max(1, Number(state.materialsModal.qty) || 1);
                const unitCost = Math.max(0, Number(state.materialsModal.unitCost) || 0);

                if (!job || !description) {
                    return true;
                }

                getMaterialItems(job.id, state.materialsModal.activeTab).push({
                    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                    description,
                    qty,
                    unitCost,
                    total: qty * unitCost
                });
                state.materialsModal.description = "";
                state.materialsModal.qty = "1";
                state.materialsModal.unitCost = "0.00";
                rerender();
                return true;
            }
            if (removeMaterialItemButton) {
                const job = getSelectedJob();
                const itemId = removeMaterialItemButton.getAttribute("data-remove-material-item");

                if (!job || !itemId) {
                    return true;
                }

                const items = getMaterialItems(job.id, state.materialsModal.activeTab);
                const itemIndex = items.findIndex((item) => item.id === itemId);
                if (itemIndex >= 0) {
                    items.splice(itemIndex, 1);
                }
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
            const snagNoteInput = event.target.closest("[data-snag-note]");
            const reallocateOperative = event.target.closest("[data-reallocate-operative]");
            const rectifyNoteInput = event.target.closest("[data-rectify-note]");
            const materialDescriptionInput = event.target.closest("[data-material-description]");
            const materialQtyInput = event.target.closest("[data-material-qty]");
            const materialCostInput = event.target.closest("[data-material-cost]");
            if (snagNoteInput) {
                state.snagModal.note = snagNoteInput.value;
                return false;
            }
            if (reallocateOperative) {
                state.reallocateModal.operative = reallocateOperative.value;
                return false;
            }
            if (rectifyNoteInput) {
                state.rectifyModal.note = rectifyNoteInput.value;
                return false;
            }
            if (materialDescriptionInput) {
                state.materialsModal.description = materialDescriptionInput.value;
                return false;
            }
            if (materialQtyInput) {
                state.materialsModal.qty = materialQtyInput.value;
                return false;
            }
            if (materialCostInput) {
                state.materialsModal.unitCost = materialCostInput.value;
                return false;
            }
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

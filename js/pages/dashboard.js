window.pageModules = window.pageModules || {};

window.pageModules.dashboard = (() => {
    let jobTypeOptions = [
        "Disrepair",
        "Planned Works",
        "Void",
        "Emergency",
        "Damp & Mould",
        "External Works",
        "Kitchen Fit",
        "Bathroom Fit"
    ];

    const CLIENT_OPTIONS = [
        "MSV",
        "Wythenshawe Community",
        "Stockport Homes"
    ];

    const CLIENT_CUSTOM_OPTION = "__custom_client__";
    const ASSIGNED_OPERATIVE_OPTIONS = [
        "Unassigned",
        "Harmony",
        "John Nelson",
        "Dave (Field)"
    ];
    let statusOptions = [
        "Needs Survey",
        "Quoted",
        "In Progress",
        "Awaiting Contractor Review",
        "Complete",
        "Billed"
    ];
    const CONTRACTOR_OPTIONS = [
        "B&G Contractors",
        "Contractor Review"
    ];
    const SCOPE_LOCATION_OPTIONS = [
        "BATHROOM",
        "BEDROOM 1",
        "BEDROOM 2",
        "BEDROOM 3",
        "BEDROOM 4",
        "BEDROOM 5",
        "CELLAR",
        "CONSERVATORY",
        "DECORATION",
        "DINING ROOM",
        "EXTERNAL",
        "GENERAL",
        "HALLWAY",
        "KITCHEN",
        "LOUNGE",
        "ROOF/CHIMNEY",
        "PORCH",
        "STAIRS/LANDING",
        "EN-SUITE",
        "LOBBY",
        "EXTERNAL DECS",
        "GARDEN",
        "WC",
        "OFFICE",
        "UTILITY"
    ];
    const SCOPE_UNIT_OPTIONS = ["SM", "LM", "NO", "IT", "HR", "---"];
    const dashboardJobs = [
        { id: 1, address: "42 Dorac Avenue SK8 3NZ", client: "MSV", tenant: "Mrs Grice", type: "Disrepair", contractor: "B&G Contractors", assigned: "Harmony", status: "Complete", start: "16/03/2026", pipeline: 3200 },
        { id: 2, address: "14 Birchwood Close M22 4PR", client: "MSV", tenant: "Mr & Mrs Patel", type: "Disrepair", contractor: "B&G Contractors", assigned: "John Nelson", status: "In Progress", start: "07/04/2026", pipeline: 2850 },
        { id: 3, address: "7 Maple Street SK1 2EF", client: "Wythenshawe Community", tenant: "Ms Thompson", type: "Planned Works", contractor: "B&G Contractors", assigned: "Harmony", status: "In Progress", start: "08/04/2026", pipeline: 4100 },
        { id: 4, address: "33 Oak Lane WA15 9GH", client: "MSV", tenant: "Mr Yusuf", type: "Disrepair", contractor: "B&G Contractors", assigned: "Unassigned", status: "Needs Survey", start: "-", pipeline: 1500 },
        { id: 5, address: "55 Cedar Avenue SK4 1LM", client: "MSV", tenant: "Mr Singh", type: "Planned Works", contractor: "B&G Contractors", assigned: "Dave", status: "Quoted", start: "14/04/2026", pipeline: 3700 },
        { id: 6, address: "8 Willow Court M20 6NP", client: "Wythenshawe Community", tenant: "Mrs Davies", type: "Disrepair", contractor: "B&G Contractors", assigned: "Harmony", status: "Complete", start: "24/03/2026", pipeline: 4600 },
        { id: 7, address: "91 Ashton Road M14 5TL", client: "MSV", tenant: "Mr Khan", type: "Disrepair", contractor: "Contractor Review", assigned: "Pending", status: "Contractor Review", start: "18/04/2026", pipeline: 2150 },
        { id: 8, address: "12 Fairway Drive SK5 9TR", client: "MSV", tenant: "Mrs Begum", type: "Disrepair", contractor: "B&G Contractors", assigned: "Unassigned", status: "Needs Snagging", start: "21/04/2026", pipeline: 2400 }
    ];

    const state = {
        filter: "all",
        currentPage: 1,
        perPage: 5,
        selectedJobId: null,
        editForm: null,
        isTemplateModalOpen: false,
        templateDraft: null
    };

    function escapeAttribute(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    function getDashboardFilters() {
        return [
            { id: "all", label: "All" },
            { id: "needs survey", label: "Needs Survey" },
            { id: "in progress", label: "In Progress" },
            { id: "needs snagging", label: "Needs Snagging" },
            { id: "contractor review", label: "Contractor Review" },
            { id: "complete", label: "Complete" },
            { id: "billed", label: "Billed" }
        ];
    }

    function getFilteredJobs() {
        if (state.filter === "all") {
            return dashboardJobs;
        }

        return dashboardJobs.filter((job) => job.status.toLowerCase() === state.filter);
    }

    function getStatusClass(status) {
        return `status-pill status-pill--${String(status).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    }

    function getTypeClass(type) {
        return `type-pill type-pill--${String(type).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    }

    function createImageEntry(file) {
        const uploadedAt = new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }).format(new Date()).replace(",", "");

        return {
            id: `image-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: file.name,
            previewUrl: URL.createObjectURL(file),
            uploadedAt
        };
    }

    function getDefaultScopeImport(fileName) {
        return {
            fileName,
            rowsReady: 58,
            availableColumns: [],
            mappings: {
                location: "",
                work: "",
                qty: "",
                unit: ""
            }
        };
    }

    function getImportedScopeRows() {
        return [
            { location: "Hallway", work: "Hack off damp plaster and re-plaster", qty: "3", unit: "SM" },
            { location: "Kitchen", work: "Mould wash and anti-fungal treatment", qty: "8", unit: "SM" },
            { location: "Bathroom", work: "Renew silicone sealant to bath edge", qty: "1", unit: "NO" },
            { location: "Bedroom 1", work: "Scrape back and redecorate affected ceiling", qty: "12", unit: "SM" }
        ];
    }

    function getEmptyScopeRow() {
        return {
            location: "",
            work: "",
            qty: "",
            unit: ""
        };
    }

    function normaliseColumns(columns) {
        return columns
            .map((column, index) => String(column || "").trim() || `Column ${index + 1}`)
            .filter((column, index, list) => list.indexOf(column) === index);
    }

    function guessScopeColumnsFromFileName(fileName) {
        const lowerName = String(fileName).toLowerCase();

        if (lowerName.endsWith(".csv")) {
            return ["Location", "Scope of works", "Quantity", "Unit"];
        }

        return ["Location", "Scope of works", "Quantity", "Unit", "Trade", "Notes"];
    }

    async function getScopeColumnsFromFile(file) {
        const fallbackColumns = guessScopeColumnsFromFileName(file.name);

        if (!/\.csv$/i.test(file.name)) {
            return fallbackColumns;
        }

        try {
            const text = await file.text();
            const firstRow = text.split(/\r?\n/).find((line) => line.trim());

            if (!firstRow) {
                return fallbackColumns;
            }

            const delimiter = firstRow.includes("\t") ? "\t" : ",";
            const columns = firstRow.split(delimiter).map((part) => part.replace(/^"|"$/g, "").trim());
            const normalised = normaliseColumns(columns);

            return normalised.length ? normalised : fallbackColumns;
        } catch (error) {
            return fallbackColumns;
        }
    }

    function toDateInputValue(value) {
        if (!value || value === "-") {
            return "";
        }

        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return value;
        }

        const parts = String(value).split("/");

        if (parts.length !== 3) {
            return "";
        }

        const [first, second, year] = parts;
        const firstNumber = Number(first);
        const secondNumber = Number(second);

        if (!year || !firstNumber || !secondNumber) {
            return "";
        }

        const isDayFirst = firstNumber > 12;
        const day = String(isDayFirst ? firstNumber : secondNumber).padStart(2, "0");
        const month = String(isDayFirst ? secondNumber : firstNumber).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function getJobFormData(job) {
        const hasPresetClient = CLIENT_OPTIONS.includes(job.client);

        return {
            address: job.address,
            client: job.client,
            customClientName: hasPresetClient ? "" : (job.client || ""),
            showCustomClientInput: !hasPresetClient,
            jobType: job.type,
            tenantName: job.tenant,
            tenantContact: job.tenantContact || "07584 913 873",
            issuedTo: job.contractor || "B&G Contractors",
            assignedOperative: job.assigned,
            status: job.status,
            startDate: toDateInputValue(job.start),
            endDate: toDateInputValue(job.end || "03/23/2026"),
            notes: job.notes || "",
            images: [],
            scopeImport: null,
            worksValue: String(job.pipeline),
            jobPrice: String(Math.max(1850, Math.round(job.pipeline * 0.58))),
            locationRows: job.locationRows || [
                { location: "Hallway", work: "Hack off damp plaster and re-plaster", qty: "3", unit: "SM" },
                { location: "Hallway", work: "Install passive vent in store cupboard", qty: "1", unit: "NO" },
                { location: "Hallway", work: "Remove and renew decaying skirting", qty: "3", unit: "LM" },
                { location: "Bedroom 1", work: "Mould wash window seals - first fit", qty: "14", unit: "SM" }
            ]
        };
    }

    function clearEditFormState() {
        if (state.editForm?.images?.length) {
            state.editForm.images.forEach((image) => {
                if (image.previewUrl) {
                    URL.revokeObjectURL(image.previewUrl);
                }
            });
        }

        state.editForm = null;
        state.isTemplateModalOpen = false;
        state.templateDraft = null;
    }

    function formatDateForDisplay(value) {
        if (!value) {
            return "-";
        }

        const [year, month, day] = String(value).split("-");

        if (!year || !month || !day) {
            return "-";
        }

        return `${day}/${month}/${year}`;
    }

    function getTemplateDraft() {
        return {
            jobTypes: jobTypeOptions.join("\n"),
            jobStatuses: statusOptions.join("\n")
        };
    }

    function parseTemplateLines(value) {
        return String(value)
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);
    }

    function ensureFormState(selectedJob) {
        if (!selectedJob) {
            clearEditFormState();
            return null;
        }

        if (state.selectedJobId !== selectedJob.id || !state.editForm) {
            state.editForm = getJobFormData(selectedJob);
        }

        return state.editForm;
    }

    function renderOptions(options, selectedValue, { includePlaceholder, placeholderLabel } = {}) {
        const items = [];

        if (includePlaceholder) {
            items.push(`
                <option value="${CLIENT_CUSTOM_OPTION}" ${selectedValue === CLIENT_CUSTOM_OPTION ? "selected" : ""}>
                    ${placeholderLabel}
                </option>
            `);
        }

        options.forEach((option) => {
            items.push(`
                <option value="${escapeAttribute(option)}" ${selectedValue === option ? "selected" : ""}>
                    ${option}
                </option>
            `);
        });

        return items.join("");
    }

    function renderScopeMappingSelect(options, fieldKey, selectedValue) {
        const safeOptions = options?.length ? options : ["Location", "Scope of works", "Quantity", "Unit"];

        return `
            <select data-scope-mapping="${fieldKey}">
                <option value="" ${selectedValue ? "" : "selected"}>-- Skip --</option>
                ${safeOptions.map((option) => `
                    <option value="${escapeAttribute(option)}" ${selectedValue === option ? "selected" : ""}>${option}</option>
                `).join("")}
            </select>
        `;
    }

    function renderSelectOptions(options, selectedValue, placeholderLabel) {
        return `
            ${placeholderLabel ? `<option value="" ${selectedValue ? "" : "selected"}>-- ${placeholderLabel} --</option>` : ""}
            ${options.map((option) => `
                <option value="${escapeAttribute(option)}" ${selectedValue === option ? "selected" : ""}>${option}</option>
            `).join("")}
        `;
    }

    function renderTemplateModal() {
        if (!state.isTemplateModalOpen || !state.templateDraft) {
            return "";
        }

        return `
            <div class="template-modal-backdrop" data-template-backdrop>
                <section class="template-modal" role="dialog" aria-modal="true" aria-label="Edit job template">
                    <div class="template-modal__header">
                        <h3>Edit job template</h3>
                        <button class="template-modal__close" type="button" data-close-template aria-label="Close template editor">&times;</button>
                    </div>
                    <div class="template-modal__body">
                        <div class="template-modal__notice">
                            Customise the dropdown options that appear when creating or editing a job. Enter one option per line.
                        </div>
                        <div class="template-modal__grid">
                            <label>
                                <span>Job types (one per line)</span>
                                <textarea rows="8" data-template-field="jobTypes">${escapeAttribute(state.templateDraft.jobTypes)}</textarea>
                            </label>
                            <label>
                                <span>Job statuses (one per line)</span>
                                <textarea rows="8" data-template-field="jobStatuses">${escapeAttribute(state.templateDraft.jobStatuses)}</textarea>
                            </label>
                        </div>
                    </div>
                    <div class="template-modal__footer">
                        <button class="modal-button modal-button--secondary modal-button--medium" type="button" data-close-template>Cancel</button>
                        <button class="modal-button modal-button--primary" type="button" data-save-template>Save template</button>
                    </div>
                </section>
            </div>
        `;
    }

    function renderModal(selectedJob) {
        const formData = ensureFormState(selectedJob);

        return `
            <div class="modal-backdrop${selectedJob ? " is-visible" : ""}" ${selectedJob ? "" : "hidden"}>
                <section class="edit-modal" role="dialog" aria-modal="true" aria-label="Edit job">
                    ${formData ? `
                        <div class="edit-modal__header">
                            <div>
                                <p>Edit</p>
                                <h3>${formData.address}</h3>
                            </div>
                            <button class="edit-modal__close" type="button" data-close-edit>&times;</button>
                        </div>
                        <div class="edit-modal__body">
                            <label><span>Address *</span><input type="text" value="${escapeAttribute(formData.address)}" data-edit-field="address"></label>
                            <div class="edit-modal__grid">
                                <div class="edit-modal__field edit-modal__field--client">
                                    <span>Client</span>
                                    <div class="edit-modal__client-row">
                                        <select data-edit-client-select>
                                            ${renderOptions(CLIENT_OPTIONS, formData.showCustomClientInput ? CLIENT_CUSTOM_OPTION : formData.client, {
                                                includePlaceholder: true,
                                                placeholderLabel: "+ Type a different client..."
                                            })}
                                        </select>
                                        <button class="edit-modal__add-client-button" type="button" data-add-client-input>+ New</button>
                                    </div>
                                    ${formData.showCustomClientInput ? `
                                        <input
                                            type="text"
                                            value="${escapeAttribute(formData.customClientName || "")}"
                                            placeholder="Enter client name..."
                                            data-edit-field="customClientName"
                                        >
                                        <p class="edit-modal__helper">This client will be saved to your Clients list automatically when the job is saved.</p>
                                    ` : ""}
                                </div>
                                <label><span>Job type</span><select data-edit-field="jobType">${renderOptions(jobTypeOptions, formData.jobType)}</select></label>
                                <label><span>Tenant name</span><input type="text" value="${escapeAttribute(formData.tenantName)}" data-edit-field="tenantName"></label>
                                <label><span>Tenant contact</span><input type="text" value="${escapeAttribute(formData.tenantContact)}" data-edit-field="tenantContact"></label>
                                <label><span>Issued to (Contractor)</span><select data-edit-field="issuedTo">${renderOptions(CONTRACTOR_OPTIONS, formData.issuedTo)}</select></label>
                                <label><span>Assigned operative</span><select data-edit-field="assignedOperative">${renderOptions(ASSIGNED_OPERATIVE_OPTIONS, formData.assignedOperative)}</select></label>
                            </div>
                            <p class="edit-modal__helper">Save the job first, then allocate to notify the contractor.</p>
                            <div class="edit-modal__grid">
                                <label><span>Status</span><select data-edit-field="status">${renderOptions(statusOptions, formData.status)}</select></label>
                                <label><span>Start date</span><input type="date" value="${escapeAttribute(formData.startDate)}" data-edit-date-field="startDate"></label>
                                <label><span>End date</span><input type="date" value="${escapeAttribute(formData.endDate)}" data-edit-date-field="endDate"></label>
                            </div>
                            <label><span>Job note: (Internal - visible to admin & office only)</span><textarea rows="4" placeholder="Pre-allocation notes, instructions, access details..." data-edit-field="notes">${formData.notes}</textarea></label>
                            <div class="edit-modal__media">
                                <div class="edit-modal__section-title">Pre-allocation images (internal)</div>
                                <div class="edit-modal__media-row">
                                    <button class="media-button" type="button" data-trigger-image-upload>Upload images</button>
                                    <button class="media-button media-button--ghost" type="button" data-trigger-camera-upload>Take photo</button>
                                </div>
                                <input class="edit-modal__hidden-input" type="file" accept="image/*" multiple data-image-upload-input>
                                <input class="edit-modal__hidden-input" type="file" accept="image/*" capture="environment" data-camera-upload-input>
                                ${formData.images.length ? `
                                    <div class="edit-modal__image-list">
                                        ${formData.images.map((image) => `
                                            <article class="edit-modal__image-card">
                                                <button class="edit-modal__image-remove" type="button" data-remove-image="${image.id}" aria-label="Remove image">&times;</button>
                                                <img src="${image.previewUrl}" alt="${escapeAttribute(image.name)}">
                                                <span>${image.uploadedAt}</span>
                                            </article>
                                        `).join("")}
                                    </div>
                                ` : ""}
                            </div>
                            <div class="edit-modal__price-grid">
                                <label><span>Complete works value</span><input type="text" value="${escapeAttribute(formData.worksValue)}" data-edit-field="worksValue"></label>
                                <label><span>Job price</span><input type="text" value="${escapeAttribute(formData.jobPrice)}" data-edit-field="jobPrice"></label>
                            </div>
                            <div class="edit-modal__scope">
                                <div class="edit-modal__section-title">Scope of works items</div>
                                <div class="edit-modal__scope-upload-card">
                                    <div class="edit-modal__scope-header">
                                        <div>
                                            <strong>Import from spreadsheet</strong>
                                            <p>Upload a .csv or .xlsx file to populate works items automatically.</p>
                                        </div>
                                        <button class="scope-upload-button" type="button" data-trigger-scope-upload>Choose file</button>
                                    </div>
                                    <input class="edit-modal__hidden-input" type="file" accept=".csv,.xlsx,.xls" data-scope-upload-input>
                                    ${formData.scopeImport ? `
                                        <div class="edit-modal__scope-import">
                                            <div class="edit-modal__scope-import-header">MAP YOUR COLUMNS TO FIELDS</div>
                                            <div class="edit-modal__scope-mapping-grid">
                                                <label>
                                                    <span>Location</span>
                                                    ${renderScopeMappingSelect(formData.scopeImport.availableColumns, "location", formData.scopeImport.mappings.location)}
                                                    <small>e.g. Hallway, Kitchen</small>
                                                </label>
                                                <label>
                                                    <span>Scope of works</span>
                                                    ${renderScopeMappingSelect(formData.scopeImport.availableColumns, "work", formData.scopeImport.mappings.work)}
                                                    <small>e.g. description of task</small>
                                                </label>
                                                <label>
                                                    <span>Quantity</span>
                                                    ${renderScopeMappingSelect(formData.scopeImport.availableColumns, "qty", formData.scopeImport.mappings.qty)}
                                                    <small>e.g. 3</small>
                                                </label>
                                                <label>
                                                    <span>Unit</span>
                                                    ${renderScopeMappingSelect(formData.scopeImport.availableColumns, "unit", formData.scopeImport.mappings.unit)}
                                                    <small>e.g. SM, LM, NO</small>
                                                </label>
                                            </div>
                                            <div class="edit-modal__scope-actions">
                                                <button class="scope-import-button" type="button" data-import-scope-rows>Import rows</button>
                                                <button class="scope-cancel-button" type="button" data-cancel-scope-import>Cancel</button>
                                                <span>${formData.scopeImport.rowsReady} rows ready</span>
                                            </div>
                                            <div class="edit-modal__scope-notice">
                                                Found ${formData.scopeImport.rowsReady} rows in "${formData.scopeImport.fileName}". Map the columns below then click Import.
                                            </div>
                                        </div>
                                    ` : ""}
                                </div>
                                <p class="edit-modal__scope-copy">Don't have a spreadsheet? <a href="#">Download template</a> - or add items manually below.</p>
                                <div class="edit-modal__scope-table">
                                    <div class="edit-modal__scope-row edit-modal__scope-row--head">
                                        <span>Location</span>
                                        <span>Scope of works</span>
                                        <span>Qty</span>
                                        <span>Unit</span>
                                        <span></span>
                                    </div>
                                    ${formData.locationRows.map((row, index) => `
                                        <div class="edit-modal__scope-row">
                                            <select data-scope-row-field="location" data-scope-row-index="${index}">${renderSelectOptions(SCOPE_LOCATION_OPTIONS, row.location, "Select")}</select>
                                            <input type="text" value="${escapeAttribute(row.work)}" data-scope-row-field="work" data-scope-row-index="${index}">
                                            <input type="text" value="${escapeAttribute(row.qty)}" data-scope-row-field="qty" data-scope-row-index="${index}">
                                            <select data-scope-row-field="unit" data-scope-row-index="${index}">${renderSelectOptions(SCOPE_UNIT_OPTIONS, row.unit, "Select")}</select>
                                            <button class="scope-delete-button" type="button" data-delete-scope-row="${index}" aria-label="Remove item">&times;</button>
                                        </div>
                                    `).join("")}
                                </div>
                                <button class="scope-add-button" type="button" data-add-scope-row>+ Add item manually</button>
                            </div>
                        </div>
                        <div class="edit-modal__footer">
                            <div class="edit-modal__footer-actions">
                                <button class="modal-button modal-button--secondary modal-button--medium" type="button" data-close-edit>Cancel</button>
                                <button class="modal-button modal-button--secondary modal-button--medium" type="button" data-open-template>Edit template</button>
                            </div>
                            <button class="modal-button modal-button--primary" type="button" data-save-edit>Save Job</button>
                        </div>
                        ${renderTemplateModal()}
                    ` : ""}
                </section>
            </div>
        `;
    }

    return {
        title: "Dashboard",
        search: "Search dashboard...",
        style: `
            .dashboard-shell {
                display: flex;
                flex-direction: column;
                gap: 22px;
                min-width: 0;
                padding-top: 12px;
            }

            .dashboard-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 12px;
            }

            .dashboard-stat-card {
                padding: 14px 16px;
                background: #ffffff;
                border: 1px solid #e7ebf3;
                border-radius: 16px;
                min-height: 86px;
                box-shadow: 0 8px 22px rgba(24, 36, 61, 0.04);
                transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
            }

            .dashboard-stat-card.is-accent {
                background: #fff8ed;
                border-color: #f1d2a0;
            }

            .dashboard-stat-card:hover {
                transform: translateY(-3px);
                border-color: #cfdbe8;
                box-shadow: 0 18px 32px rgba(24, 36, 61, 0.09);
            }

            .dashboard-stat-card p {
                margin: 0 0 8px;
                color: #5f708c;
                font-size: 0.82rem;
            }

            .dashboard-stat-card strong {
                font-size: 1.08rem;
                font-weight: 700;
            }

            .tone-neutral { color: #18243d; }
            .tone-blue { color: #1f5fbf; }
            .tone-green { color: #0f8a70; }
            .tone-amber { color: #b66a00; }
            .tone-purple { color: #5a59c8; }
            .tone-money { color: #3d7a12; }

            .dashboard-filters {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }

            .dashboard-filter {
                border: 1px solid #d6dce8;
                border-radius: 999px;
                background: #ffffff;
                color: #506079;
                padding: 11px 18px;
                font: inherit;
                cursor: pointer;
            }

            .dashboard-filter.is-active {
                background: #1f1f1f;
                border-color: #1f1f1f;
                color: #ffffff;
            }

            .jobs-table-card {
                background: #ffffff;
                border: 1px solid #e4e8f0;
                border-radius: 18px;
                overflow: hidden;
                box-shadow: 0 10px 24px rgba(24, 36, 61, 0.04);
                min-width: 0;
            }

            .jobs-table-wrap {
                overflow-x: auto;
                max-width: 100%;
            }

            .jobs-table {
                width: 100%;
                border-collapse: collapse;
                min-width: 1100px;
            }

            .jobs-table th,
            .jobs-table td {
                padding: 12px 14px;
                border-bottom: 1px solid #edf1f7;
                text-align: left;
            }

            .jobs-table th {
                color: #54647d;
                font-size: 0.72rem;
                font-weight: 700;
                letter-spacing: 0.06em;
                text-transform: uppercase;
            }

            .jobs-table td {
                color: #1b2940;
                font-size: 0.82rem;
                line-height: 1.45;
            }

            .jobs-table__address {
                min-width: 250px;
                font-weight: 600;
            }

            .type-pill,
            .contractor-pill,
            .status-pill {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-height: 24px;
                padding: 4px 10px;
                border-radius: 999px;
                font-size: 0.72rem;
                font-weight: 700;
                white-space: nowrap;
            }

            .type-pill--disrepair {
                background: #fdebf0;
                color: #a53b5f;
            }

            .type-pill--planned-works {
                background: #f2ede2;
                color: #6f5a2c;
            }

            .contractor-pill {
                background: #f6e7ca;
                color: #8b5a03;
            }

            .status-pill--complete {
                background: #e7f4d7;
                color: #447b18;
            }

            .status-pill--in-progress {
                background: #dff3ec;
                color: #087160;
            }

            .status-pill--needs-survey {
                background: #e2efff;
                color: #1d66c0;
            }

            .status-pill--quoted,
            .status-pill--needs-snagging,
            .status-pill--contractor-review,
            .status-pill--billed {
                background: #fff1dc;
                color: #a15f00;
            }

            .jobs-table__actions {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .table-action {
                border-radius: 14px;
                font: inherit;
                cursor: pointer;
            }

            .table-action--edit,
            .table-action--delete {
                width: 36px;
                height: 36px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border-radius: 8px;
            }

            .table-action--edit {
                border: 1px solid #d5def0;
                background: #f3f7ff;
                color: #2f5da8;
            }

            .table-action--edit svg,
            .table-action--delete svg {
                width: 16px;
                height: 16px;
                fill: none;
                stroke: currentColor;
                stroke-width: 1.8;
                stroke-linecap: round;
                stroke-linejoin: round;
            }

            .table-action--delete {
                border: 1px solid #ffd2d2;
                background: #fff5f5;
                color: #f04f4f;
            }

            .table-pagination {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 14px;
                margin-top: 14px;
                padding: 0 4px;
            }

            .table-pagination p {
                margin: 0;
                color: #63738c;
                font-size: 0.9rem;
            }

            .table-pagination__actions {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
            }

            .pagination-button {
                min-width: 40px;
                height: 40px;
                border: 1px solid #d6dce8;
                border-radius: 12px;
                background: #ffffff;
                color: #4b5d79;
                font: inherit;
                cursor: pointer;
            }

            .pagination-button.is-active {
                background: #1f5fbf;
                border-color: #1f5fbf;
                color: #ffffff;
            }

            .pagination-button:disabled {
                opacity: 0.45;
                cursor: not-allowed;
            }

            .modal-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(23, 31, 45, 0.42);
                display: grid;
                place-items: center;
                padding: 20px;
                z-index: 60;
            }

            .edit-modal {
                width: min(100%, 760px);
                max-height: calc(100vh - 40px);
                overflow: auto;
                background: #ffffff;
                border-radius: 24px;
                box-shadow: 0 25px 60px rgba(15, 23, 42, 0.22);
            }

            .edit-modal__header,
            .edit-modal__footer {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                padding: 20px 22px;
            }

            .edit-modal__header {
                border-bottom: 1px solid #e8edf5;
            }

            .edit-modal__header p {
                margin: 0 0 4px;
                color: #69788f;
                font-size: 0.82rem;
                font-weight: 700;
                text-transform: uppercase;
            }

            .edit-modal__header h3 {
                margin: 0;
                color: #15233c;
                font-size: 1.15rem;
            }

            .edit-modal__close {
                width: 40px;
                height: 40px;
                border: 1px solid #d5dce8;
                border-radius: 12px;
                background: #ffffff;
                color: #4a5a73;
                font-size: 1.4rem;
                cursor: pointer;
            }

            .edit-modal__body {
                display: flex;
                flex-direction: column;
                gap: 16px;
                padding: 20px 22px;
            }

            .edit-modal__grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 14px;
            }

            .edit-modal label,
            .edit-modal__field {
                display: flex;
                flex-direction: column;
                gap: 7px;
            }

            .edit-modal label span,
            .edit-modal__field > span {
                color: #63738c;
                font-size: 0.82rem;
                font-weight: 500;
            }

            .edit-modal__field--client {
                gap: 6px;
            }

            .edit-modal__client-row {
                display: grid;
                grid-template-columns: minmax(0, 1fr) auto;
                gap: 8px;
                align-items: center;
            }

            .edit-modal input,
            .edit-modal select,
            .edit-modal textarea {
                width: 100%;
                border: 1px solid #d6dce8;
                border-radius: 8px;
                min-height: 45px;
                padding: 6px 10px;
                font: 14px;
                color: #18243d;
                background: #ffffff;
            }

            .edit-modal__add-client-button {
                border: 1px solid #d6dce8;
                border-radius: 8px;
                background: #ffffff;
                color: #18243d;
                min-height: 45px;
                padding: 6px 10px;
                font: 12px;
                white-space: nowrap;
                cursor: pointer;
            }

            .edit-modal textarea {
                resize: vertical;
                min-height: 110px;
            }

            .edit-modal__helper {
                margin: -4px 0 0;
                color: #8a96ad;
                font-size: 0.74rem;
            }

            .edit-modal__media-row,
            .edit-modal__price-grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 14px;
            }

            .edit-modal__media,
            .edit-modal__scope {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .edit-modal__section-title {
                color: #15233c;
                font-size: 0.88rem;
                font-weight: 700;
            }

            .media-button,
            .scope-upload-button,
            .scope-add-button {
                border: 1px dashed #bfd2f5;
                border-radius: 7px;
                background: #f8fbff;
                color: #42618b;
                padding: 9px 12px;
                font: inherit;
                font-size: 0.76rem;
                line-height: 1.2;
                cursor: pointer;
            }

            .media-button--ghost {
                background: #eef5ff;
            }

            .edit-modal__hidden-input {
                display: none;
            }

            .edit-modal__image-list {
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
            }

            .edit-modal__image-card {
                position: relative;
                width: 100px;
                border-radius: 14px;
                overflow: hidden;
                background: #f3f7ff;
                box-shadow: 0 10px 20px rgba(24, 36, 61, 0.08);
            }

            .edit-modal__image-card img {
                display: block;
                width: 100%;
                height: 88px;
                object-fit: cover;
            }

            .edit-modal__image-card span {
                display: block;
                padding: 5px 7px 6px;
                color: #ffffff;
                background: rgba(16, 24, 40, 0.72);
                font-size: 0.58rem;
                font-weight: 600;
                line-height: 1.2;
                white-space: nowrap;
            }

            .edit-modal__image-remove {
                position: absolute;
                top: 6px;
                right: 6px;
                width: 24px;
                height: 24px;
                border: none;
                border-radius: 999px;
                background: #ef5350;
                color: #ffffff;
                font-size: 1rem;
                line-height: 1;
                cursor: pointer;
            }

            .edit-modal__scope-upload-card {
                display: flex;
                flex-direction: column;
                gap: 16px;
                padding: 18px;
                border: 1px dashed #c9d5e8;
                border-radius: 18px;
                background: #fffdf9;
            }

            .edit-modal__scope-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
            }

            .edit-modal__scope-header strong {
                display: block;
                margin-bottom: 4px;
                color: #15233c;
                font-size: 0.9rem;
            }

            .edit-modal__scope-header p {
                margin: 0;
                color: #7d8aa0;
                font-size: 0.76rem;
                line-height: 1.5;
            }

            .edit-modal__scope-import {
                display: flex;
                flex-direction: column;
                gap: 14px;
                padding-top: 14px;
                border-top: 1px solid #e5ebf5;
            }

            .edit-modal__scope-import-header {
                color: #55657e;
                font-size: 0.76rem;
                font-weight: 500;
                letter-spacing: 0.06em;
                text-transform: uppercase;
            }

            .edit-modal__scope-mapping-grid {
                display: grid;
                grid-template-columns: repeat(4, minmax(0, 1fr));
                gap: 12px;
            }

            .edit-modal__scope-mapping-grid label {
                gap: 6px;
            }

            .edit-modal__scope-mapping-grid small {
                color: #8b98ad;
                font-size: 0.72rem;
            }

            .edit-modal__scope-actions {
                display: flex;
                align-items: center;
                gap: 10px;
                flex-wrap: wrap;
            }

            .edit-modal__scope-actions span {
                color: #6b7a92;
                font-size: 0.78rem;
            }

            .scope-import-button,
            .scope-cancel-button {
                border-radius: 7px;
                padding: 7px 12px;
                font: inherit;
                font-size: 0.74rem;
                line-height: 1.1;
                cursor: pointer;
            }

            .scope-import-button {
                border: 1px solid #111827;
                background: #111827;
                color: #ffffff;
                font-weight: 700;
            }

            .scope-cancel-button {
                border: 1px solid #d5dce8;
                background: #ffffff;
                color: #4a5a73;
            }

            .edit-modal__scope-notice {
                padding: 10px 12px;
                border: 1px solid #a7cdf8;
                border-radius: 12px;
                background: #eaf4ff;
                color: #205a9d;
                font-size: 0.76rem;
                line-height: 1.35;
            }

            .edit-modal__scope-copy {
                margin: 0;
                color: #63738c;
                font-size: 0.86rem;
            }

            .edit-modal__scope-copy a {
                color: #2866cc;
            }

            .edit-modal__scope-table {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .edit-modal__scope-row {
                display: grid;
                grid-template-columns: 120px minmax(0, 1fr) 64px 74px 42px;
                gap: 8px;
                align-items: center;
            }

            .edit-modal__scope-row--head {
                color: #6c7b92;
                font-size: 0.72rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.04em;
            }

            .edit-modal__scope-row input,
            .edit-modal__scope-row select {
                padding: 10px 12px;
                font-size: 0.8rem;
            }

            .scope-delete-button {
                width: 32px;
                height: 32px;
                border: 1px solid #ffc8c8;
                border-radius: 8px;
                background: #fff5f5;
                color: #ef4444;
                font-size: 0.95rem;
                cursor: pointer;
            }

            .edit-modal__footer {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                border-top: 1px solid #e8edf5;
            }

            .edit-modal__footer-actions {
                display: flex;
                align-items: center;
                gap: 20px;
            }

            .modal-button {
                border-radius: 10px;
                padding: 10px 15px;
                font: inherit;
                font-weight: 700;
                font-size: 0.84rem;
                line-height: 1.2;
                cursor: pointer;
            }

            .modal-button--medium {
                font-weight: 500;
            }

            .modal-button--secondary {
                border: 1px solid #d5dce8;
                background: #ffffff;
                color: #4a5a73;
            }

            .modal-button--primary {
                border: 1px solid #101828;
                background: #101828;
                color: #ffffff;
            }

            .template-modal-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(15, 23, 42, 0.45);
                display: grid;
                place-items: center;
                padding: 20px;
                z-index: 80;
            }

            .template-modal {
                width: min(100%, 620px);
                background: #ffffff;
                border-radius: 20px;
                box-shadow: 0 24px 60px rgba(15, 23, 42, 0.22);
                overflow: hidden;
            }

            .template-modal__header,
            .template-modal__footer {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                padding: 20px 28px;
            }

            .template-modal__header {
                border-bottom: 1px solid #eceff5;
            }

            .template-modal__header h3 {
                margin: 0;
                color: #202737;
                font-size: 1.05rem;
                font-weight: 700;
            }

            .template-modal__close {
                width: 38px;
                height: 38px;
                border: 1px solid #d7deea;
                border-radius: 12px;
                background: #ffffff;
                color: #516177;
                font-size: 1.3rem;
                cursor: pointer;
            }

            .template-modal__body {
                display: flex;
                flex-direction: column;
                gap: 22px;
                padding: 24px 28px;
            }

            .template-modal__notice {
                padding: 12px 14px;
                border-radius: 14px;
                background: #f4f4f4;
                color: #6e7077;
                font-size: 0.86rem;
                line-height: 1.5;
            }

            .template-modal__grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 14px;
            }

            .template-modal__grid label {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .template-modal__grid span {
                color: #66615d;
                font-size: 0.82rem;
                font-weight: 600;
            }

            .template-modal__grid textarea {
                min-height: 230px;
                padding: 14px 12px;
                border: 1px solid #c9ced8;
                border-radius: 14px;
                resize: vertical;
                font: inherit;
                color: #2d3340;
            }

            .template-modal__footer {
                border-top: 1px solid #eceff5;
                justify-content: flex-end;
            }

            @media (max-width: 900px) {
                .dashboard-stats {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                }

                .table-pagination {
                    flex-direction: column;
                    align-items: flex-start;
                }

                .edit-modal__grid,
                .edit-modal__media-row,
                .edit-modal__price-grid,
                .edit-modal__scope-row,
                .edit-modal__scope-mapping-grid {
                    grid-template-columns: 1fr;
                }

                .edit-modal__scope-header {
                    flex-direction: column;
                    align-items: flex-start;
                }

                .edit-modal__footer {
                    flex-direction: column;
                    align-items: stretch;
                }

                .edit-modal__footer-actions {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 12px;
                }

                .template-modal__grid {
                    grid-template-columns: 1fr;
                }
            }
        `,
        render: () => {
            const filters = getDashboardFilters();
            const filteredJobs = getFilteredJobs();
            const totalPages = Math.max(1, Math.ceil(filteredJobs.length / state.perPage));
            state.currentPage = Math.min(state.currentPage, totalPages);

            const startIndex = (state.currentPage - 1) * state.perPage;
            const visibleJobs = filteredJobs.slice(startIndex, startIndex + state.perPage);
            const selectedJob = dashboardJobs.find((job) => job.id === state.selectedJobId);
            const pipelineTotal = dashboardJobs.reduce((sum, job) => sum + job.pipeline, 0);
            const stats = [
                { label: "Total jobs", value: dashboardJobs.length, tone: "neutral" },
                { label: "Needs survey", value: dashboardJobs.filter((job) => job.status === "Needs Survey").length, tone: "blue" },
                { label: "In progress", value: dashboardJobs.filter((job) => job.status === "In Progress").length, tone: "green" },
                { label: "Needs snagging", value: dashboardJobs.filter((job) => job.status === "Needs Snagging").length, tone: "amber", accent: true },
                { label: "Complete", value: dashboardJobs.filter((job) => job.status === "Complete").length, tone: "green" },
                { label: "Billed", value: dashboardJobs.filter((job) => job.status === "Billed").length, tone: "purple" },
                { label: "Pipeline (complete works)", value: `GBP ${pipelineTotal.toLocaleString()}`, tone: "money" }
            ];

            return `
                <section class="dashboard-shell">
                    <div class="dashboard-stats">
                        ${stats.map((item) => `
                            <article class="dashboard-stat-card${item.accent ? " is-accent" : ""}">
                                <p>${item.label}</p>
                                <strong class="tone-${item.tone}">${item.value}</strong>
                            </article>
                        `).join("")}
                    </div>

                    <div class="dashboard-filters">
                        ${filters.map((filter) => `
                            <button class="dashboard-filter${state.filter === filter.id ? " is-active" : ""}" type="button" data-dashboard-filter="${filter.id}">
                                ${filter.label}
                            </button>
                        `).join("")}
                    </div>

                    <div class="jobs-table-card">
                        <div class="jobs-table-wrap">
                            <table class="jobs-table">
                                <thead>
                                    <tr>
                                        <th>Address</th>
                                        <th>Client</th>
                                        <th>Tenant</th>
                                        <th>Type</th>
                                        <th>Contractor</th>
                                        <th>Assigned</th>
                                        <th>Status</th>
                                        <th>Start</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${visibleJobs.map((job) => `
                                        <tr>
                                            <td class="jobs-table__address">${job.address}</td>
                                            <td>${job.client}</td>
                                            <td>${job.tenant}</td>
                                            <td><span class="${getTypeClass(job.type)}">${job.type}</span></td>
                                            <td><span class="contractor-pill">${job.contractor}</span></td>
                                            <td>${job.assigned}</td>
                                            <td><span class="${getStatusClass(job.status)}">${job.status}</span></td>
                                            <td>${job.start}</td>
                                            <td>
                                                <div class="jobs-table__actions">
                                                    <button class="table-action table-action--edit" type="button" data-edit-job="${job.id}" aria-label="Edit ${job.address}">
                                                        <svg viewBox="0 0 24 24"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4z"></path></svg>
                                                    </button>
                                                    <button class="table-action table-action--delete" type="button" data-delete-job="${job.id}" aria-label="Delete ${job.address}">
                                                        <svg viewBox="0 0 24 24"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join("")}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="table-pagination">
                        <p>Showing ${filteredJobs.length ? startIndex + 1 : 0}-${Math.min(startIndex + state.perPage, filteredJobs.length)} of ${filteredJobs.length} jobs</p>
                        <div class="table-pagination__actions">
                            <button class="pagination-button" type="button" data-page-nav="prev" ${state.currentPage === 1 ? "disabled" : ""}>Prev</button>
                            ${Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => `
                                <button class="pagination-button${state.currentPage === page ? " is-active" : ""}" type="button" data-page-number="${page}">${page}</button>
                            `).join("")}
                            <button class="pagination-button" type="button" data-page-nav="next" ${state.currentPage === totalPages ? "disabled" : ""}>Next</button>
                        </div>
                    </div>
                </section>
                ${renderModal(selectedJob)}
            `;
        },
        onClick: (event, { rerender }) => {
            const filterButton = event.target.closest("[data-dashboard-filter]");
            const pageButton = event.target.closest("[data-page-number]");
            const pageNavButton = event.target.closest("[data-page-nav]");
            const editButton = event.target.closest("[data-edit-job]");
            const deleteButton = event.target.closest("[data-delete-job]");
            const closeEditButton = event.target.closest("[data-close-edit]");
            const addClientButton = event.target.closest("[data-add-client-input]");
            const imageUploadButton = event.target.closest("[data-trigger-image-upload]");
            const cameraUploadButton = event.target.closest("[data-trigger-camera-upload]");
            const removeImageButton = event.target.closest("[data-remove-image]");
            const scopeUploadButton = event.target.closest("[data-trigger-scope-upload]");
            const cancelScopeImportButton = event.target.closest("[data-cancel-scope-import]");
            const importScopeRowsButton = event.target.closest("[data-import-scope-rows]");
            const addScopeRowButton = event.target.closest("[data-add-scope-row]");
            const deleteScopeRowButton = event.target.closest("[data-delete-scope-row]");
            const openTemplateButton = event.target.closest("[data-open-template]");
            const closeTemplateButton = event.target.closest("[data-close-template]");
            const saveTemplateButton = event.target.closest("[data-save-template]");
            const templateBackdrop = event.target.closest("[data-template-backdrop]");

            if (filterButton) {
                state.filter = filterButton.getAttribute("data-dashboard-filter");
                state.currentPage = 1;
                rerender();
                return true;
            }

            if (pageButton) {
                state.currentPage = Number(pageButton.getAttribute("data-page-number"));
                rerender();
                return true;
            }

            if (pageNavButton) {
                const direction = pageNavButton.getAttribute("data-page-nav");
                state.currentPage += direction === "next" ? 1 : -1;
                rerender();
                return true;
            }

            if (editButton) {
                clearEditFormState();
                state.selectedJobId = Number(editButton.getAttribute("data-edit-job"));
                rerender();
                return true;
            }

            if (addClientButton && state.editForm) {
                state.editForm.showCustomClientInput = true;
                state.editForm.client = CLIENT_CUSTOM_OPTION;
                rerender();
                return true;
            }

            if (imageUploadButton) {
                document.querySelector("[data-image-upload-input]")?.click();
                return true;
            }

            if (cameraUploadButton) {
                document.querySelector("[data-camera-upload-input]")?.click();
                return true;
            }

            if (scopeUploadButton) {
                document.querySelector("[data-scope-upload-input]")?.click();
                return true;
            }

            if (removeImageButton && state.editForm) {
                const imageId = removeImageButton.getAttribute("data-remove-image");
                const image = state.editForm.images.find((item) => item.id === imageId);

                if (image?.previewUrl) {
                    URL.revokeObjectURL(image.previewUrl);
                }

                state.editForm.images = state.editForm.images.filter((item) => item.id !== imageId);
                rerender();
                return true;
            }

            if (cancelScopeImportButton && state.editForm) {
                state.editForm.scopeImport = null;
                rerender();
                return true;
            }

            if (importScopeRowsButton && state.editForm?.scopeImport) {
                state.editForm.locationRows = getImportedScopeRows();
                rerender();
                return true;
            }

            if (addScopeRowButton && state.editForm) {
                state.editForm.locationRows = [
                    ...state.editForm.locationRows,
                    getEmptyScopeRow()
                ];
                rerender();
                return true;
            }

            if (deleteScopeRowButton && state.editForm) {
                const rowIndex = Number(deleteScopeRowButton.getAttribute("data-delete-scope-row"));
                state.editForm.locationRows = state.editForm.locationRows.filter((_, index) => index !== rowIndex);
                rerender();
                return true;
            }

            if (openTemplateButton) {
                state.isTemplateModalOpen = true;
                state.templateDraft = getTemplateDraft();
                rerender();
                return true;
            }

            if (closeTemplateButton || (templateBackdrop && event.target === templateBackdrop)) {
                state.isTemplateModalOpen = false;
                state.templateDraft = null;
                rerender();
                return true;
            }

            if (saveTemplateButton && state.templateDraft && state.editForm) {
                const nextJobTypes = parseTemplateLines(state.templateDraft.jobTypes);
                const nextStatuses = parseTemplateLines(state.templateDraft.jobStatuses);

                jobTypeOptions = nextJobTypes.length ? nextJobTypes : jobTypeOptions;
                statusOptions = nextStatuses.length ? nextStatuses : statusOptions;

                if (!jobTypeOptions.includes(state.editForm.jobType)) {
                    state.editForm.jobType = jobTypeOptions[0] || "";
                }

                if (!statusOptions.includes(state.editForm.status)) {
                    state.editForm.status = statusOptions[0] || "";
                }

                state.isTemplateModalOpen = false;
                state.templateDraft = null;
                rerender();
                return true;
            }

            if (deleteButton) {
                const jobId = Number(deleteButton.getAttribute("data-delete-job"));
                const jobIndex = dashboardJobs.findIndex((job) => job.id === jobId);

                if (jobIndex >= 0) {
                    dashboardJobs.splice(jobIndex, 1);
                    state.selectedJobId = null;
                    rerender();
                }

                return true;
            }

            if (event.target.hasAttribute("data-save-edit") && state.editForm && state.selectedJobId !== null) {
                const job = dashboardJobs.find((item) => item.id === state.selectedJobId);

                if (job) {
                    job.address = state.editForm.address;
                    job.client = state.editForm.showCustomClientInput && state.editForm.customClientName
                        ? state.editForm.customClientName
                        : state.editForm.client;
                    job.tenant = state.editForm.tenantName;
                    job.tenantContact = state.editForm.tenantContact;
                    job.type = state.editForm.jobType;
                    job.contractor = state.editForm.issuedTo;
                    job.assigned = state.editForm.assignedOperative;
                    job.status = state.editForm.status;
                    job.start = formatDateForDisplay(state.editForm.startDate);
                    job.end = formatDateForDisplay(state.editForm.endDate);
                    job.notes = state.editForm.notes;
                    job.pipeline = Number(state.editForm.worksValue) || 0;
                    job.jobPrice = state.editForm.jobPrice;
                    job.locationRows = state.editForm.locationRows.map((row) => ({ ...row }));
                }

                state.selectedJobId = null;
                clearEditFormState();
                rerender();
                return true;
            }

            if (closeEditButton || event.target.classList.contains("modal-backdrop")) {
                state.selectedJobId = null;
                clearEditFormState();
                rerender();
                return true;
            }

            return false;
        },
        onChange: (event, { rerender }) => {
            const clientSelect = event.target.closest("[data-edit-client-select]");
            const dateInput = event.target.closest("[data-edit-date-field]");
            const imageInput = event.target.closest("[data-image-upload-input]");
            const cameraInput = event.target.closest("[data-camera-upload-input]");
            const scopeUploadInput = event.target.closest("[data-scope-upload-input]");
            const scopeMappingSelect = event.target.closest("[data-scope-mapping]");
            const scopeRowField = event.target.closest("[data-scope-row-field]");
            const editField = event.target.closest("[data-edit-field]");
            const templateField = event.target.closest("[data-template-field]");

            if (dateInput && state.editForm) {
                state.editForm[dateInput.getAttribute("data-edit-date-field")] = dateInput.value;
                return true;
            }

            if ((imageInput || cameraInput) && state.editForm) {
                const files = Array.from((imageInput || cameraInput).files || []);

                if (!files.length) {
                    return true;
                }

                state.editForm.images = [
                    ...state.editForm.images,
                    ...files.map(createImageEntry)
                ];
                rerender();
                return true;
            }

            if (scopeUploadInput && state.editForm) {
                const file = scopeUploadInput.files?.[0];

                if (!file) {
                    return true;
                }

                getScopeColumnsFromFile(file).then((columns) => {
                    if (!state.editForm) {
                        return;
                    }

                    state.editForm.scopeImport = {
                        ...getDefaultScopeImport(file.name),
                        availableColumns: columns
                    };
                    rerender();
                });
                return true;
            }

            if (scopeMappingSelect && state.editForm?.scopeImport) {
                const fieldKey = scopeMappingSelect.getAttribute("data-scope-mapping");
                state.editForm.scopeImport.mappings[fieldKey] = scopeMappingSelect.value;
                return true;
            }

            if (scopeRowField && state.editForm) {
                const fieldKey = scopeRowField.getAttribute("data-scope-row-field");
                const rowIndex = Number(scopeRowField.getAttribute("data-scope-row-index"));
                const targetRow = state.editForm.locationRows[rowIndex];

                if (!targetRow) {
                    return true;
                }

                targetRow[fieldKey] = scopeRowField.value;
                return true;
            }

            if (editField && state.editForm) {
                state.editForm[editField.getAttribute("data-edit-field")] = editField.value;
                return true;
            }

            if (templateField && state.templateDraft) {
                state.templateDraft[templateField.getAttribute("data-template-field")] = templateField.value;
                return true;
            }

            if (!clientSelect || !state.editForm) {
                return false;
            }

            const selectedValue = clientSelect.value;

            if (selectedValue === CLIENT_CUSTOM_OPTION) {
                state.editForm.showCustomClientInput = true;
                state.editForm.client = CLIENT_CUSTOM_OPTION;
                rerender();
                return true;
            }

            state.editForm.client = selectedValue;
            state.editForm.showCustomClientInput = false;
            state.editForm.customClientName = "";
            rerender();
            return true;
        }
    };
})();

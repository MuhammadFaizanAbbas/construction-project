window.pageModules = window.pageModules || {};

window.pageModules.forms = (() => {
    const FIELD_TYPES = [
        { type: "text", label: "T Text input", shortLabel: "text", defaultName: "Text input" },
        { type: "longText", label: "¶ Long text", shortLabel: "long text", defaultName: "Long text" },
        { type: "number", label: "# Number", shortLabel: "number", defaultName: "Number" },
        { type: "date", label: "🗓 Date", shortLabel: "date", defaultName: "Date" },
        { type: "checkbox", label: "☑ Checkbox", shortLabel: "checkbox", defaultName: "Checkbox" },
        { type: "dropdown", label: "▼ Dropdown", shortLabel: "dropdown", defaultName: "Dropdown", defaultOptions: "Option 1\nOption 2" },
        { type: "photo", label: "🖼 Photo upload", shortLabel: "photo", defaultName: "Photo upload" },
        { type: "signature", label: "✍ Signature", shortLabel: "signature", defaultName: "Signature" }
    ];

    const initialForms = [
        {
            id: 1,
            title: "Risk Assessment",
            description: "Pre-works health and safety risk assessment",
            fieldCount: 9,
            fields: ["T Text input", "🗓 Date", "▼ Dropdown", "☑ Checkbox", "🖼 Photo upload", "✍ Signature"],
            builderFields: [
                { type: "text", label: "Job Address", required: true, options: "", sampleDate: "" },
                { type: "text", label: "Operative name", required: true, options: "", sampleDate: "" },
                { type: "date", label: "Assessment date", required: true, options: "", sampleDate: "2026-04-16" },
                { type: "dropdown", label: "Risk level", required: true, options: "Low\nMedium\nHigh\nCritical", sampleDate: "" },
                { type: "checkbox", label: "PPE worn and checked", required: false, options: "", sampleDate: "" },
                { type: "checkbox", label: "Area made safe for works", required: false, options: "", sampleDate: "" },
                { type: "checkbox", label: "Tenant notified of works", required: false, options: "", sampleDate: "" },
                { type: "photo", label: "Site photo", required: false, options: "", sampleDate: "" },
                { type: "signature", label: "Operative signature", required: true, options: "", sampleDate: "" }
            ]
        },
        {
            id: 2,
            title: "Completion Certificate",
            description: "Sign-off form confirming all works completed",
            fieldCount: 7,
            fields: ["T Text input", "🗓 Date", "☑ Checkbox", "✍ Signature"],
            builderFields: [
                { type: "text", label: "Job Address", required: true, options: "", sampleDate: "" },
                { type: "text", label: "Operative name", required: true, options: "", sampleDate: "" },
                { type: "date", label: "Completion date", required: true, options: "", sampleDate: "2026-04-16" },
                { type: "checkbox", label: "All works completed", required: true, options: "", sampleDate: "" },
                { type: "checkbox", label: "Tenant satisfied", required: false, options: "", sampleDate: "" },
                { type: "photo", label: "Completion photo", required: false, options: "", sampleDate: "" },
                { type: "signature", label: "Tenant signature", required: true, options: "", sampleDate: "" }
            ]
        }
    ];

    const state = {
        forms: initialForms.map((form) => ({ ...form, fields: [...form.fields] })),
        isBuilderOpen: false,
        editingFormId: null,
        fillFormId: null,
        draft: {
            name: "",
            description: "",
            fields: []
        },
        fillDraft: {
            values: {},
            photos: [],
            signature: "",
            signatureDataUrls: {}
        }
    };

    let activeSignaturePad = null;

    function getFieldConfig(type) {
        return FIELD_TYPES.find((field) => field.type === type) || FIELD_TYPES[0];
    }

    function createDraftField(type) {
        const config = getFieldConfig(type);
        return {
            id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            type,
            label: config.defaultName,
            required: false,
            options: config.defaultOptions || "",
            sampleDate: ""
        };
    }

    function closeBuilder(rerender) {
        state.isBuilderOpen = false;
        state.editingFormId = null;
        state.draft = {
            name: "",
            description: "",
            fields: []
        };
        rerender();
    }

    function resetFillDraft() {
        state.fillDraft = {
            values: {},
            photos: [],
            signature: "",
            signatureDataUrls: {}
        };
    }

    function initializeSignaturePads() {
        document.querySelectorAll("[data-fill-signature-pad]").forEach((canvas) => {
            const fieldId = canvas.getAttribute("data-fill-signature-pad");
            if (!fieldId) {
                return;
            }

            const width = Math.max(320, Math.floor(canvas.getBoundingClientRect().width));
            const height = 150;
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
            }

            const context = canvas.getContext("2d");
            if (!context) {
                return;
            }

            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.lineCap = "round";
            context.lineJoin = "round";
            context.lineWidth = 2.4;
            context.strokeStyle = "#1f1f1f";

            const signatureDataUrl = state.fillDraft.signatureDataUrls[fieldId];
            if (signatureDataUrl) {
                const image = new Image();
                image.onload = () => {
                    context.fillStyle = "#ffffff";
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    context.drawImage(image, 0, 0, canvas.width, canvas.height);
                };
                image.src = signatureDataUrl;
            }
        });
    }

    function queueSignaturePadInit() {
        window.requestAnimationFrame(() => {
            initializeSignaturePads();
        });
    }

    function getFieldChipLabel(field) {
        return getFieldConfig(field.type).label;
    }

    function getUniqueFieldChips(fields) {
        const seen = new Set();
        return fields.filter((field) => {
            if (seen.has(field)) {
                return false;
            }
            seen.add(field);
            return true;
        });
    }

    function normalizeTemplateField(field, index) {
        const sourceType = String(
            field?.type ||
            field?.fieldType ||
            field?.kind ||
            field?.inputType ||
            "text"
        ).toLowerCase();

        const normalizedTypeMap = {
            text: "text",
            shorttext: "text",
            input: "text",
            textarea: "longText",
            longtext: "longText",
            number: "number",
            numeric: "number",
            date: "date",
            checkbox: "checkbox",
            boolean: "checkbox",
            dropdown: "dropdown",
            select: "dropdown",
            photo: "photo",
            image: "photo",
            photoupload: "photo",
            upload: "photo",
            signature: "signature",
            sign: "signature"
        };

        const type = normalizedTypeMap[sourceType.replace(/[^a-z]/g, "")] || "text";
        const config = getFieldConfig(type);
        const label = String(field?.label || field?.name || field?.title || `${config.defaultName} ${index + 1}`);
        const optionsSource = field?.options || field?.choices || field?.items || [];
        const options = Array.isArray(optionsSource)
            ? optionsSource.map((item) => String(item?.label || item?.value || item)).join("\n")
            : String(optionsSource || "");

        return {
            type,
            label,
            required: Boolean(field?.required),
            options,
            sampleDate: ""
        };
    }

    function createFormFromTemplate(template) {
        const fieldsSource =
            template?.fields ||
            template?.formFields ||
            template?.schema?.fields ||
            template?.questions ||
            [];

        const builderFields = Array.isArray(fieldsSource)
            ? fieldsSource.map((field, index) => normalizeTemplateField(field, index))
            : [];

        const title = String(
            template?.title ||
            template?.name ||
            template?.formName ||
            "Imported Template"
        );

        const description = String(
            template?.description ||
            template?.summary ||
            template?.details ||
            "Form imported from template"
        );

        return {
            id: Date.now(),
            title,
            description,
            fieldCount: builderFields.length,
            fields: builderFields.map((field) => getFieldChipLabel(field)),
            builderFields
        };
    }

    function cloneBuilderField(field) {
        return {
            id: `${field.type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            type: field.type,
            label: field.label,
            required: Boolean(field.required),
            options: field.options || "",
            sampleDate: field.sampleDate || ""
        };
    }

    function renderBuilderModal(escapeHtml) {
        if (!state.isBuilderOpen) {
            return "";
        }

        return `
            <div class="forms-builder__backdrop" data-close-form-builder-backdrop>
                <section class="forms-builder" role="dialog" aria-modal="true" aria-label="Form Builder">
                    <div class="forms-builder__header">
                        <h3>📝 Form Builder</h3>
                    </div>
                    <div class="forms-builder__grid">
                        <label class="forms-builder__field">
                            <span>Form name *</span>
                            <input type="text" value="${escapeHtml(state.draft.name)}" placeholder="e.g. Risk Assessment" data-form-name>
                        </label>
                        <label class="forms-builder__field">
                            <span>Description</span>
                            <input type="text" value="${escapeHtml(state.draft.description)}" placeholder="What is this form for?" data-form-description>
                        </label>
                    </div>
                    <div class="forms-builder__section-label">Add a field</div>
                    <div class="forms-builder__type-list">
                        ${FIELD_TYPES.map((field) => `
                            <button class="forms-builder__type-button" type="button" data-add-form-field="${field.type}">${escapeHtml(field.label)}</button>
                        `).join("")}
                    </div>
                    <div class="forms-builder__section-label">Form fields <small>(drag to reorder)</small></div>
                    <div class="forms-builder__fields">
                        ${state.draft.fields.length ? state.draft.fields.map((field) => {
                            const config = getFieldConfig(field.type);
                            return `
                                <article class="forms-builder__field-card">
                                    <div class="forms-builder__field-row">
                                        <div class="forms-builder__field-meta">
                                            <span class="forms-builder__drag">⠿</span>
                                            <span class="forms-builder__type-pill">${escapeHtml(config.shortLabel)}</span>
                                        </div>
                                        <input class="forms-builder__field-input" type="text" value="${escapeHtml(field.label)}" data-builder-field-label="${field.id}">
                                        <label class="forms-builder__required">
                                            <input type="checkbox" ${field.required ? "checked" : ""} data-builder-field-required="${field.id}">
                                            <span>Required</span>
                                        </label>
                                        <button class="forms-builder__remove" type="button" data-remove-form-field="${field.id}">×</button>
                                    </div>
                                    ${field.type === "dropdown" ? `
                                        <label class="forms-builder__options">
                                            <span>Options (one per line)</span>
                                            <textarea rows="4" data-builder-field-options="${field.id}">${escapeHtml(field.options)}</textarea>
                                        </label>
                                    ` : ""}
                                    ${field.type === "date" ? `
                                        <label class="forms-builder__options">
                                            <span>Select a date</span>
                                            <input type="date" value="${escapeHtml(field.sampleDate || "")}" data-builder-field-date="${field.id}">
                                        </label>
                                    ` : ""}
                                </article>
                            `;
                        }).join("") : `
                            <div class="forms-builder__empty">Click a field type below to add it to your form</div>
                        `}
                    </div>
                    <div class="forms-builder__footer">
                        <button class="forms-builder__button forms-builder__button--ghost" type="button" data-close-form-builder>Cancel</button>
                        <button class="forms-builder__button forms-builder__button--solid" type="button" data-save-form-builder>Save form</button>
                    </div>
                </section>
            </div>
        `;
    }

    function renderFillField(field, escapeHtml) {
        const value = state.fillDraft.values[field.id] || "";
        const requiredMark = field.required ? " *" : "";

        if (field.type === "text" || field.type === "number" || field.type === "longText") {
            return `
                <label class="forms-fill__field">
                    <span>${escapeHtml(field.label)}${requiredMark}</span>
                    ${field.type === "longText"
                        ? `<textarea rows="4" placeholder="${escapeHtml(field.label)}" data-fill-field="${field.id}">${escapeHtml(value)}</textarea>`
                        : `<input type="${field.type === "number" ? "number" : "text"}" value="${escapeHtml(value)}" placeholder="${escapeHtml(field.label)}" data-fill-field="${field.id}">`}
                </label>
            `;
        }

        if (field.type === "date") {
            return `
                <label class="forms-fill__field">
                    <span>${escapeHtml(field.label)}${requiredMark}</span>
                    <input type="date" value="${escapeHtml(value)}" data-fill-field="${field.id}">
                </label>
            `;
        }

        if (field.type === "dropdown") {
            const options = (field.options || "").split("\n").map((option) => option.trim()).filter(Boolean);
            return `
                <label class="forms-fill__field">
                    <span>${escapeHtml(field.label)}${requiredMark}</span>
                    <select data-fill-field="${field.id}">
                        <option value="">— Select —</option>
                        ${options.map((option) => `<option value="${escapeHtml(option)}" ${value === option ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
                    </select>
                </label>
            `;
        }

        if (field.type === "checkbox") {
            return `
                <label class="forms-fill__check">
                    <span>${escapeHtml(field.label)}</span>
                    <div class="forms-fill__check-box">
                        <input type="checkbox" ${value ? "checked" : ""} data-fill-checkbox="${field.id}">
                        <span>${escapeHtml(field.label)}</span>
                    </div>
                </label>
            `;
        }

        if (field.type === "photo") {
            return `
                <div class="forms-fill__field forms-fill__field--photo">
                    <span>${escapeHtml(field.label)}</span>
                    <div class="forms-fill__photo-actions">
                        <button class="forms-fill__photo-button forms-fill__photo-button--upload" type="button" data-fill-photo-upload>
                            <span class="forms-fill__photo-button-label">Upload</span>
                        </button>
                        <button class="forms-fill__photo-button forms-fill__photo-button--camera" type="button" data-fill-photo-camera>
                            <span class="forms-fill__photo-button-label">Take photo</span>
                        </button>
                    </div>
                    ${state.fillDraft.photos.length ? `
                        <div class="forms-fill__photo-grid">
                            ${state.fillDraft.photos.map((photo) => `
                                <div class="forms-fill__photo-card">
                                    <img src="${photo.url}" alt="Uploaded site photo">
                                    <span>${escapeHtml(photo.timestamp)}</span>
                                </div>
                            `).join("")}
                        </div>
                    ` : ""}
                    <input class="forms-hidden-input" type="file" accept="image/*" multiple data-fill-photo-upload-input>
                    <input class="forms-hidden-input" type="file" accept="image/*" capture="environment" data-fill-photo-camera-input>
                </div>
            `;
        }

        if (field.type === "signature") {
            return `
                <div class="forms-fill__field forms-fill__field--signature">
                    <span>${escapeHtml(field.label)}${requiredMark}</span>
                    <div class="forms-fill__signature-pad">
                        <canvas data-fill-signature-pad="${field.id}"></canvas>
                    </div>
                    <button class="forms-fill__clear-signature" type="button" data-clear-fill-signature="${field.id}">Clear signature</button>
                </div>
            `;
        }

        return "";
    }

    function renderFillModal(escapeHtml) {
        if (state.fillFormId === null) {
            return "";
        }

        const form = state.forms.find((item) => item.id === state.fillFormId);
        if (!form) {
            return "";
        }

        return `
            <div class="forms-builder__backdrop" data-close-fill-form-backdrop>
                <section class="forms-fill" role="dialog" aria-modal="true" aria-label="Fill form">
                    <div class="forms-fill__header">
                        <h3>${escapeHtml(form.title)}</h3>
                        <p>${escapeHtml(form.description)}</p>
                    </div>
                    <div class="forms-fill__body">
                        ${(form.builderFields || []).map((field) => renderFillField(field, escapeHtml)).join("")}
                    </div>
                    <div class="forms-fill__footer">
                        <button class="forms-builder__button forms-builder__button--ghost" type="button" data-close-fill-form>Cancel</button>
                        <button class="forms-builder__button forms-builder__button--solid" type="button" data-submit-fill-form>Submit form</button>
                    </div>
                </section>
            </div>
        `;
    }

    return {
        title: "Forms",
        search: "Search forms...",
        __setSignatureData: (dataUrl) => {
            if (!activeSignaturePad?.fieldId) {
                return;
            }
            state.fillDraft.signatureDataUrls[activeSignaturePad.fieldId] = dataUrl;
        },
        style: `
            .forms-page {
                display: flex;
                flex-direction: column;
                gap: 18px;
                padding-top: 30px;
            }

            .forms-page__toolbar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                flex-wrap: wrap;
            }

            .forms-page__title {
                margin: 0;
                color: #121a26;
                font-size: 1.35rem;
                font-weight: 800;
            }

            .forms-page__actions {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
            }

            .forms-page__button {
                border-radius: 12px;
                padding: 10px 16px;
                font: inherit;
                font-size: 0.9rem;
                font-weight: 700;
                cursor: pointer;
                transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
            }

            .forms-page__button:hover {
                transform: translateY(-1px);
            }

            .forms-page__button--ghost {
                border: 1px solid #cfd6e2;
                background: #ffffff;
                color: #162234;
                box-shadow: 0 8px 18px rgba(24, 36, 61, 0.05);
            }

            .forms-page__button--solid {
                border: 1px solid #1f1f1f;
                background: #1f1f1f;
                color: #ffffff;
                box-shadow: 0 10px 22px rgba(24, 36, 61, 0.12);
            }

            .forms-list {
                display: flex;
                flex-direction: column;
                gap: 14px;
            }

            .forms-card {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 18px;
                background: #ffffff;
                border: 1px solid #dce5f0;
                border-radius: 18px;
                padding: 18px 20px;
                box-shadow: 0 12px 26px rgba(24, 36, 61, 0.05);
            }

            .forms-card__main {
                min-width: 0;
                flex: 1;
            }

            .forms-card__title {
                margin: 0 0 4px;
                color: #121a26;
                font-size: 0.95rem;
                font-weight: 800;
            }

            .forms-card__description {
                margin: 0 0 8px;
                color: #66758c;
                font-size: 0.86rem;
                line-height: 1.45;
            }

            .forms-card__count {
                margin: 0 0 10px;
                color: #7a8799;
                font-size: 0.78rem;
                font-weight: 600;
            }

            .forms-card__chips {
                display: flex;
                align-items: center;
                gap: 6px;
                flex-wrap: wrap;
            }

            .forms-card__chip {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-height: 24px;
                padding: 4px 9px;
                border-radius: 8px;
                background: #f4f6fa;
                color: #6a7688;
                font-size: 0.72rem;
                white-space: nowrap;
            }

            .forms-card__actions {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
                justify-content: flex-end;
            }

            .forms-card__button {
                border-radius: 12px;
                min-height: 38px;
                padding: 0 14px;
                font: inherit;
                font-size: 0.84rem;
                font-weight: 700;
                cursor: pointer;
            }

            .forms-card__button--ghost {
                border: 1px solid #cad2de;
                background: #ffffff;
                color: #1b2432;
            }

            .forms-card__button--primary {
                border: 1px solid #9ec8ff;
                background: #eaf4ff;
                color: #1758ac;
            }

            .forms-card__button--icon {
                width: 38px;
                min-width: 38px;
                border: 1px solid #cad2de;
                background: #ffffff;
                color: #1b2432;
                padding: 0;
            }

            .forms-builder__backdrop {
                position: fixed;
                inset: 0;
                display: grid;
                place-items: center;
                padding: 20px;
                background: rgba(18, 26, 38, 0.45);
                z-index: 95;
            }

            .forms-builder {
                width: min(100%, 800px);
                max-height: min(92vh, 980px);
                overflow: auto;
                background: #ffffff;
                border: 1px solid #dce5f0;
                border-radius: 18px;
                padding: 20px;
                box-shadow: 0 18px 36px rgba(24, 36, 61, 0.18);
            }

            .forms-builder__header h3 {
                margin: 0 0 18px;
                color: #1a2232;
                font-size: 1.05rem;
                font-weight: 800;
            }

            .forms-builder__grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 12px;
                margin-bottom: 14px;
            }

            .forms-builder__field {
                display: grid;
                gap: 8px;
            }

            .forms-builder__field span,
            .forms-builder__section-label {
                color: #667387;
                font-size: 0.8rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .forms-builder__section-label {
                margin: 14px 0 10px;
            }

            .forms-builder__section-label small {
                text-transform: none;
                letter-spacing: 0;
                font-size: 0.82rem;
                color: #7c8899;
            }

            .forms-builder__field input,
            .forms-builder__field textarea,
            .forms-builder__field-input,
            .forms-builder__options textarea {
                width: 100%;
                border: 1px solid #c7d1dc;
                border-radius: 10px;
                padding: 11px 12px;
                color: #1b2432;
                background: #ffffff;
                font: inherit;
                font-size: 0.94rem;
            }

            .forms-builder__type-list {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
                margin-bottom: 12px;
            }

            .forms-builder__type-button {
                border: 1px solid #c8d0da;
                background: #ffffff;
                color: #1a2232;
                border-radius: 8px;
                padding: 9px 12px;
                font: inherit;
                font-size: 0.84rem;
                cursor: pointer;
            }

            .forms-builder__fields {
                display: flex;
                flex-direction: column;
                gap: 10px;
                min-height: 88px;
                padding: 12px 0 4px;
                border-top: 1px solid #e6ebf2;
                border-bottom: 1px solid #e6ebf2;
            }

            .forms-builder__empty {
                display: grid;
                place-items: center;
                min-height: 86px;
                border: 2px dashed #d5dde7;
                border-radius: 12px;
                color: #727f92;
                font-size: 0.9rem;
                text-align: center;
            }

            .forms-builder__field-card {
                border: 1px solid #dce5f0;
                border-radius: 12px;
                background: #fafbfd;
                padding: 10px;
            }

            .forms-builder__field-row {
                display: grid;
                grid-template-columns: auto minmax(0, 1fr) auto auto;
                gap: 10px;
                align-items: center;
            }

            .forms-builder__field-meta {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .forms-builder__drag {
                color: #9aa6b8;
                font-size: 1rem;
            }

            .forms-builder__type-pill {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-height: 26px;
                padding: 4px 10px;
                border-radius: 8px;
                background: #ffffff;
                border: 1px solid #d9e2ec;
                color: #5d6879;
                font-size: 0.78rem;
            }

            .forms-builder__required {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                color: #6e7783;
                font-size: 0.84rem;
                white-space: nowrap;
            }

            .forms-builder__remove {
                border: none;
                background: transparent;
                color: #ef5757;
                font-size: 1.3rem;
                cursor: pointer;
            }

            .forms-builder__options {
                display: grid;
                gap: 8px;
                margin-top: 10px;
            }

            .forms-builder__options span {
                color: #667387;
                font-size: 0.78rem;
            }

            .forms-builder__footer {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                padding-top: 16px;
            }

            .forms-builder__button {
                border-radius: 12px;
                min-height: 42px;
                padding: 0 18px;
                font: inherit;
                font-size: 0.9rem;
                font-weight: 700;
                cursor: pointer;
            }

            .forms-builder__button--ghost {
                border: 1px solid #c8d0da;
                background: #ffffff;
                color: #616a76;
            }

            .forms-builder__button--solid {
                border: 1px solid #1f1f1f;
                background: #1f1f1f;
                color: #ffffff;
            }

            .forms-fill {
                width: min(100%, 560px);
                max-height: min(92vh, 980px);
                overflow: auto;
                background: #ffffff;
                border: 1px solid #dce5f0;
                border-radius: 18px;
                padding: 18px;
                box-shadow: 0 18px 36px rgba(24, 36, 61, 0.18);
            }

            .forms-fill__header h3 {
                margin: 0 0 10px;
                color: #162132;
                font-size: 1rem;
                font-weight: 800;
            }

            .forms-fill__header p {
                margin: 0 0 16px;
                color: #748094;
                font-size: 0.82rem;
            }

            .forms-fill__body {
                display: flex;
                flex-direction: column;
                gap: 14px;
            }

            .forms-fill__field {
                display: grid;
                gap: 8px;
            }

            .forms-fill__field--photo {
                gap: 10px;
            }

            .forms-fill__field--signature {
                gap: 10px;
            }

            .forms-fill__field span,
            .forms-fill__check > span {
                color: #5f6b7b;
                font-size: 0.9rem;
                font-weight: 700;
            }

            .forms-fill__field input,
            .forms-fill__field textarea,
            .forms-fill__field select {
                width: 100%;
                border: 1px solid #cad2dc;
                border-radius: 12px;
                padding: 12px 13px;
                background: #ffffff;
                color: #1b2432;
                font: inherit;
                font-size: 0.92rem;
                box-shadow: inset 0 1px 2px rgba(24, 36, 61, 0.03);
            }

            .forms-fill__signature-pad {
                border: 1px solid #c7d0da;
                border-radius: 14px;
                background: #ffffff;
                min-height: 150px;
                overflow: hidden;
            }

            .forms-fill__signature-pad canvas {
                display: block;
                width: 100%;
                height: 150px;
                background: #ffffff;
                cursor: crosshair;
            }

            .forms-fill__check {
                display: grid;
                gap: 8px;
            }

            .forms-fill__check-box {
                display: flex;
                align-items: center;
                gap: 10px;
                min-height: 42px;
                padding: 10px 12px;
                border-radius: 10px;
                background: #f7f7f8;
                color: #1e293b;
                font-size: 0.88rem;
            }

            .forms-fill__photo-actions {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 12px;
            }

            .forms-fill__photo-button {
                min-height: 70px;
                border-radius: 12px;
                font: inherit;
                font-size: 0.94rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 10px 14px;
                text-align: center;
            }

            .forms-fill__photo-button--upload {
                border: 1px dashed #c7d0db;
                background: #ffffff;
                color: #8b6d22;
            }

            .forms-fill__photo-button--camera {
                border: 1px dashed #9fc9ff;
                background: #eaf4ff;
                color: #1d5cae;
            }

            .forms-fill__photo-button-label {
                font-size: 0.92rem;
                font-weight: 500;
            }

            .forms-fill__photo-grid {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                padding-top: 4px;
            }

            .forms-fill__photo-card {
                position: relative;
                width: 102px;
                height: 102px;
                border-radius: 12px;
                overflow: hidden;
                background: #eef2f7;
                box-shadow: 0 8px 16px rgba(24, 36, 61, 0.08);
            }

            .forms-fill__photo-card img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            }

            .forms-fill__photo-card span {
                position: absolute;
                left: -3px;
                right: 0px;
                bottom: -1px;
                padding: 4px 6px;
                background: rgba(18, 26, 38, 0.72);
                color: #ffffff;
                font-size: 0.65rem;
                font-weight: 600;
                text-align: center;
            }

            .forms-fill__clear-signature {
                justify-self: start;
                border: none;
                background: transparent;
                color: #758195;
                padding: 0;
                font: inherit;
                font-size: 0.8rem;
                text-decoration: underline;
                cursor: pointer;
                margin-top: -2px;
            }

            .forms-fill__footer {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                padding-top: 16px;
                margin-top: 16px;
                border-top: 1px solid #e6ebf2;
            }

            .forms-hidden-input {
                display: none;
            }

            @media (max-width: 780px) {
                .forms-card {
                    flex-direction: column;
                }

                .forms-card__actions {
                    width: 100%;
                    justify-content: flex-start;
                }

                .forms-builder__grid,
                .forms-builder__field-row {
                    grid-template-columns: 1fr;
                }

                .forms-fill__photo-actions,
                .forms-fill__footer {
                    grid-template-columns: 1fr;
                    flex-direction: column;
                }
            }
        `,
        render: ({ escapeHtml }) => `
            <section class="forms-page">
                <div class="forms-page__toolbar">
                    <h2 class="forms-page__title">Forms</h2>
                    <div class="forms-page__actions">
                        <button class="forms-page__button forms-page__button--ghost" type="button" data-upload-template>📂 Upload template</button>
                        <button class="forms-page__button forms-page__button--solid" type="button" data-open-form-builder>+ New form</button>
                    </div>
                </div>

                <div class="forms-list">
                    ${state.forms.map((form) => `
                        <article class="forms-card">
                            <div class="forms-card__main">
                                <h3 class="forms-card__title">${escapeHtml(form.title)}</h3>
                                <p class="forms-card__description">${escapeHtml(form.description)}</p>
                                <p class="forms-card__count">${escapeHtml(form.fieldCount)} fields</p>
                                <div class="forms-card__chips">
                                    ${getUniqueFieldChips(form.fields).map((field) => `<span class="forms-card__chip">${escapeHtml(field)}</span>`).join("")}
                                </div>
                            </div>
                            <div class="forms-card__actions">
                                <button class="forms-card__button forms-card__button--ghost" type="button" data-edit-form="${form.id}">Edit</button>
                                <button class="forms-card__button forms-card__button--primary" type="button" data-fill-form="${form.id}">▶ Fill in</button>
                                <button class="forms-card__button forms-card__button--icon" type="button">🧍</button>
                            </div>
                        </article>
                    `).join("")}
                </div>
                <input class="forms-hidden-input" type="file" accept=".json,application/json" data-template-upload-input>
                ${renderBuilderModal(escapeHtml)}
                ${renderFillModal(escapeHtml)}
            </section>
        `,
        onClick: (event, { rerender }) => {
            const clickTarget = event.target instanceof Element ? event.target : event.target?.parentElement;
            if (!clickTarget) {
                return false;
            }

            const openBuilderButton = clickTarget.closest("[data-open-form-builder]");
            const closeBuilderButton = clickTarget.closest("[data-close-form-builder]");
            const closeBuilderBackdrop = clickTarget.closest("[data-close-form-builder-backdrop]");
            const addFieldButton = clickTarget.closest("[data-add-form-field]");
            const removeFieldButton = clickTarget.closest("[data-remove-form-field]");
            const saveBuilderButton = clickTarget.closest("[data-save-form-builder]");
            const editFormButton = clickTarget.closest("[data-edit-form]");
            const fillFormButton = clickTarget.closest("[data-fill-form]");
            const closeFillFormButton = clickTarget.closest("[data-close-fill-form]");
            const closeFillFormBackdrop = clickTarget.closest("[data-close-fill-form-backdrop]");
            const fillPhotoUploadButton = clickTarget.closest("[data-fill-photo-upload]");
            const fillPhotoCameraButton = clickTarget.closest("[data-fill-photo-camera]");
            const clearSignatureButton = clickTarget.closest("[data-clear-fill-signature]");
            const submitFillFormButton = clickTarget.closest("[data-submit-fill-form]");
            const uploadTemplateButton = clickTarget.closest("[data-upload-template]");

            if (openBuilderButton) {
                state.isBuilderOpen = true;
                state.editingFormId = null;
                rerender();
                return true;
            }

            if (uploadTemplateButton) {
                document.querySelector("[data-template-upload-input]")?.click();
                return true;
            }

            if (editFormButton) {
                const formId = Number(editFormButton.getAttribute("data-edit-form"));
                const form = state.forms.find((item) => item.id === formId);
                if (!form) {
                    return true;
                }

                state.isBuilderOpen = true;
                state.editingFormId = formId;
                state.draft = {
                    name: form.title,
                    description: form.description,
                    fields: (form.builderFields || []).map((field) => cloneBuilderField(field))
                };
                rerender();
                return true;
            }

            if (closeBuilderButton || (closeBuilderBackdrop && clickTarget === closeBuilderBackdrop)) {
                closeBuilder(rerender);
                return true;
            }

            if (addFieldButton) {
                const fieldType = addFieldButton.getAttribute("data-add-form-field");
                if (!fieldType) {
                    return true;
                }
                state.draft.fields.push(createDraftField(fieldType));
                rerender();
                return true;
            }

            if (removeFieldButton) {
                const fieldId = removeFieldButton.getAttribute("data-remove-form-field");
                state.draft.fields = state.draft.fields.filter((field) => field.id !== fieldId);
                rerender();
                return true;
            }

            if (fillFormButton) {
                state.fillFormId = Number(fillFormButton.getAttribute("data-fill-form"));
                resetFillDraft();
                rerender();
                queueSignaturePadInit();
                return true;
            }

            if (closeFillFormButton || (closeFillFormBackdrop && clickTarget === closeFillFormBackdrop)) {
                state.fillFormId = null;
                resetFillDraft();
                rerender();
                return true;
            }

            if (fillPhotoUploadButton) {
                document.querySelector("[data-fill-photo-upload-input]")?.click();
                return true;
            }

            if (fillPhotoCameraButton) {
                document.querySelector("[data-fill-photo-camera-input]")?.click();
                return true;
            }

            if (clearSignatureButton) {
                const fieldId = clearSignatureButton.getAttribute("data-clear-fill-signature");
                if (fieldId) {
                    delete state.fillDraft.signatureDataUrls[fieldId];
                }
                rerender();
                queueSignaturePadInit();
                return true;
            }

            if (submitFillFormButton) {
                state.fillFormId = null;
                resetFillDraft();
                rerender();
                return true;
            }

            if (saveBuilderButton) {
                const formName = state.draft.name.trim();
                if (!formName) {
                    return true;
                }

                if (state.editingFormId !== null) {
                    const form = state.forms.find((item) => item.id === state.editingFormId);
                    if (form) {
                        form.title = formName;
                        form.description = state.draft.description.trim() || "Custom form created from builder";
                        form.fieldCount = state.draft.fields.length;
                        form.fields = state.draft.fields.map((field) => getFieldChipLabel(field));
                        form.builderFields = state.draft.fields.map((field) => ({
                            type: field.type,
                            label: field.label,
                            required: field.required,
                            options: field.options || "",
                            sampleDate: field.sampleDate || ""
                        }));
                    }
                } else {
                    state.forms.unshift({
                        id: Date.now(),
                        title: formName,
                        description: state.draft.description.trim() || "Custom form created from builder",
                        fieldCount: state.draft.fields.length,
                        fields: state.draft.fields.map((field) => getFieldChipLabel(field)),
                        builderFields: state.draft.fields.map((field) => ({
                            type: field.type,
                            label: field.label,
                            required: field.required,
                            options: field.options || "",
                            sampleDate: field.sampleDate || ""
                        }))
                    });
                }
                closeBuilder(rerender);
                return true;
            }

            return false;
        },
        onChange: (event, { rerender }) => {
            const formNameInput = event.target.closest("[data-form-name]");
            const formDescriptionInput = event.target.closest("[data-form-description]");
            const fieldLabelInput = event.target.closest("[data-builder-field-label]");
            const fieldRequiredInput = event.target.closest("[data-builder-field-required]");
            const fieldOptionsInput = event.target.closest("[data-builder-field-options]");
            const fieldDateInput = event.target.closest("[data-builder-field-date]");
            const fillFieldInput = event.target.closest("[data-fill-field]");
            const fillCheckboxInput = event.target.closest("[data-fill-checkbox]");
            const fillPhotoUploadInput = event.target.closest("[data-fill-photo-upload-input]");
            const fillPhotoCameraInput = event.target.closest("[data-fill-photo-camera-input]");
            const templateUploadInput = event.target.closest("[data-template-upload-input]");

            if (formNameInput) {
                state.draft.name = formNameInput.value;
                return false;
            }

            if (formDescriptionInput) {
                state.draft.description = formDescriptionInput.value;
                return false;
            }

            if (fieldLabelInput) {
                const fieldId = fieldLabelInput.getAttribute("data-builder-field-label");
                const field = state.draft.fields.find((item) => item.id === fieldId);
                if (field) {
                    field.label = fieldLabelInput.value;
                }
                return false;
            }

            if (fieldRequiredInput) {
                const fieldId = fieldRequiredInput.getAttribute("data-builder-field-required");
                const field = state.draft.fields.find((item) => item.id === fieldId);
                if (field) {
                    field.required = fieldRequiredInput.checked;
                }
                rerender();
                return true;
            }

            if (fieldOptionsInput) {
                const fieldId = fieldOptionsInput.getAttribute("data-builder-field-options");
                const field = state.draft.fields.find((item) => item.id === fieldId);
                if (field) {
                    field.options = fieldOptionsInput.value;
                }
                return false;
            }

            if (fieldDateInput) {
                const fieldId = fieldDateInput.getAttribute("data-builder-field-date");
                const field = state.draft.fields.find((item) => item.id === fieldId);
                if (field) {
                    field.sampleDate = fieldDateInput.value;
                }
                return false;
            }

            if (fillFieldInput) {
                const fieldId = fillFieldInput.getAttribute("data-fill-field");
                state.fillDraft.values[fieldId] = fillFieldInput.value;
                return false;
            }

            if (fillCheckboxInput) {
                const fieldId = fillCheckboxInput.getAttribute("data-fill-checkbox");
                state.fillDraft.values[fieldId] = fillCheckboxInput.checked;
                return false;
            }

            if (fillPhotoUploadInput || fillPhotoCameraInput) {
                const input = fillPhotoUploadInput || fillPhotoCameraInput;
                const files = Array.from(input.files || []);
                files.forEach((file) => {
                    const url = URL.createObjectURL(file);
                    const timestamp = new Date().toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    }).replace(",", "");
                    state.fillDraft.photos.push({ url, timestamp });
                });
                rerender();
                return true;
            }

            if (templateUploadInput) {
                const file = templateUploadInput.files?.[0];
                if (!file) {
                    return true;
                }

                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const template = JSON.parse(String(reader.result || "{}"));
                        const importedForm = createFormFromTemplate(template);
                        state.forms.unshift(importedForm);
                        rerender();
                    } catch (_error) {
                        window.alert("Template file could not be read. Please upload a valid JSON template.");
                    } finally {
                        templateUploadInput.value = "";
                    }
                };
                reader.onerror = () => {
                    window.alert("Template file could not be read.");
                    templateUploadInput.value = "";
                };
                reader.readAsText(file);
                return true;
            }

            return false;
        }
    };
})();

document.addEventListener("pointerdown", (event) => {
    const canvas = event.target instanceof HTMLCanvasElement && event.target.matches("[data-fill-signature-pad]")
        ? event.target
        : null;
    if (!canvas) {
        return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    activeSignaturePad = {
        canvas,
        context,
        fieldId: canvas.getAttribute("data-fill-signature-pad")
    };
    canvas.setPointerCapture?.(event.pointerId);
    context.beginPath();
    context.moveTo(x, y);
});

document.addEventListener("pointermove", (event) => {
    if (!activeSignaturePad) {
        return;
    }

    const { canvas, context } = activeSignaturePad;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    context.lineTo(x, y);
    context.stroke();
});

function finishSignatureDraw() {
    if (!activeSignaturePad) {
        return;
    }

    const { canvas } = activeSignaturePad;
    if (window.pageModules?.forms) {
        window.pageModules.forms.__setSignatureData?.(canvas.toDataURL("image/png"));
    }
    activeSignaturePad = null;
}

document.addEventListener("pointerup", finishSignatureDraw);
document.addEventListener("pointercancel", finishSignatureDraw);

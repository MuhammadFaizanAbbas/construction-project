window.pageModules = window.pageModules || {};

window.pageModules.team = (() => {
    const teamMembers = [
        {
            id: 1,
            name: "B&G Contractors",
            role: "",
            initials: "BG",
            accentClass: "team-member__avatar--gold",
            summary: { active: 2, done: 2 },
            jobs: [
                { address: "42 Dorac Avenue SK8 3NZ", type: "Disrepair", status: "Complete", start: "16/03/2026" },
                { address: "14 Birchwood Close M22 4PR", type: "Disrepair", status: "In Progress", start: "07/04/2026" },
                { address: "7 Maple Street SK1 2EF", type: "Planned Works", status: "In Progress", start: "08/04/2026" },
                { address: "33 Oak Lane WA15 9GH", type: "Disrepair", status: "Needs Survey", start: "-" },
                { address: "55 Cedar Avenue SK4 1LM", type: "Planned Works", status: "Quoted", start: "14/04/2026" },
                { address: "8 Willow Court M20 6NP", type: "Disrepair", status: "Complete", start: "24/03/2026" },
                { address: "22 Birch Grove WA14 7QT", type: "Disrepair", status: "Needs Snagging", start: "01/04/2026" }
            ]
        },
        {
            id: 2,
            name: "Harmony",
            role: "field",
            initials: "HA",
            accentClass: "team-member__avatar--mint",
            summary: { active: 2, done: 2 },
            jobs: [
                { address: "42 Dorac Avenue SK8 3NZ", type: "Disrepair", status: "Complete", start: "16/03/2026" },
                { address: "14 Birchwood Close M22 4PR", type: "Disrepair", status: "In Progress", start: "07/04/2026" },
                { address: "7 Maple Street SK1 2EF", type: "Planned Works", status: "In Progress", start: "08/04/2026" },
                { address: "33 Oak Lane WA15 9GH", type: "Disrepair", status: "Needs Survey", start: "-" },
                { address: "55 Cedar Avenue SK4 1LM", type: "Planned Works", status: "Quoted", start: "14/04/2026" },
                { address: "8 Willow Court M20 6NP", type: "Disrepair", status: "Complete", start: "24/03/2026" },
                { address: "22 Birch Grove WA14 7QT", type: "Disrepair", status: "Needs Snagging", start: "01/04/2026" }
            ]
        },
        {
            id: 3,
            name: "John Nelson",
            role: "field",
            initials: "JN",
            accentClass: "team-member__avatar--peach",
            summary: { active: 2, done: 2 },
            jobs: [
                { address: "42 Dorac Avenue SK8 3NZ", type: "Disrepair", status: "Complete", start: "16/03/2026" },
                { address: "14 Birchwood Close M22 4PR", type: "Disrepair", status: "In Progress", start: "07/04/2026" },
                { address: "7 Maple Street SK1 2EF", type: "Planned Works", status: "In Progress", start: "08/04/2026" },
                { address: "33 Oak Lane WA15 9GH", type: "Disrepair", status: "Needs Survey", start: "-" },
                { address: "55 Cedar Avenue SK4 1LM", type: "Planned Works", status: "Quoted", start: "14/04/2026" },
                { address: "8 Willow Court M20 6NP", type: "Disrepair", status: "Complete", start: "24/03/2026" },
                { address: "22 Birch Grove WA14 7QT", type: "Disrepair", status: "Needs Snagging", start: "01/04/2026" }
            ]
        },
        {
            id: 4,
            name: "Dave",
            role: "(field)",
            initials: "DF",
            accentClass: "team-member__avatar--sand",
            summary: { active: 2, done: 2 },
            jobs: [
                { address: "42 Dorac Avenue SK8 3NZ", type: "Disrepair", status: "Complete", start: "16/03/2026" },
                { address: "14 Birchwood Close M22 4PR", type: "Disrepair", status: "In Progress", start: "07/04/2026" },
                { address: "7 Maple Street SK1 2EF", type: "Planned Works", status: "In Progress", start: "08/04/2026" },
                { address: "33 Oak Lane WA15 9GH", type: "Disrepair", status: "Needs Survey", start: "-" },
                { address: "55 Cedar Avenue SK4 1LM", type: "Planned Works", status: "Quoted", start: "14/04/2026" },
                { address: "8 Willow Court M20 6NP", type: "Disrepair", status: "Complete", start: "24/03/2026" },
                { address: "22 Birch Grove WA14 7QT", type: "Disrepair", status: "Needs Snagging", start: "01/04/2026" }
            ]
        }
    ];

    function getTypeClass(type) {
        return `team-pill team-pill--type team-pill--${String(type).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    }

    function getStatusClass(status) {
        return `team-pill team-pill--status team-pill--${String(status).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    }

    function openScopeJob(address) {
        if (typeof window.__jobManagementNavigateToPage === "function") {
            window.__jobManagementNavigateToPage("scope");
        }

        return window.pageModules?.scope?.openJobByAddress?.(address) || false;
    }

    function renderMemberCard(member, escapeHtml) {
        return `
            <article class="team-member">
                <div class="team-member__head">
                    <div class="team-member__identity">
                        <span class="team-member__avatar ${member.accentClass}">${escapeHtml(member.initials)}</span>
                        <div class="team-member__copy">
                            <h3>${escapeHtml(member.name)}</h3>
                            ${member.role ? `<p>${escapeHtml(member.role)}</p>` : ""}
                        </div>
                    </div>
                    <div class="team-member__stats">
                        <span class="team-count team-count--active">${member.summary.active} active</span>
                        <span class="team-count team-count--done">${member.summary.done} done</span>
                    </div>
                </div>

                <div class="team-table">
                    <div class="team-table__head">
                        <span>Address</span>
                        <span>Type</span>
                        <span>Status</span>
                        <span>Start</span>
                    </div>
                    <div class="team-table__body">
                        ${member.jobs.map((job) => `
                            <div class="team-row team-row--interactive" data-scope-address="${escapeHtml(job.address)}">
                                <div class="team-row__address">${escapeHtml(job.address)}</div>
                                <div><span class="${getTypeClass(job.type)}">${escapeHtml(job.type)}</span></div>
                                <div><span class="${getStatusClass(job.status)}">${escapeHtml(job.status)}</span></div>
                                <div class="team-row__start">${escapeHtml(job.start)}</div>
                            </div>
                        `).join("")}
                    </div>
                </div>
            </article>
        `;
    }

    return {
        title: "Team",
        search: "Search team...",
        style: `
            .team-page {
                display: grid;
                gap: 18px;
            }

            .team-page__title {
                margin: 0;
                color: #172033;
                font-size: 1.2rem;
                font-weight: 700;
            }

            .team-member {
                background: #ffffff;
                border: 1px solid #dce3f4;
                border-radius: 16px;
                padding: 14px 14px 10px;
                box-shadow: 0 10px 24px rgba(24, 36, 61, 0.06);
            }

            .team-member__head {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 12px;
                margin-bottom: 12px;
            }

            .team-member__identity {
                display: flex;
                align-items: center;
                gap: 10px;
                min-width: 0;
            }

            .team-member__avatar {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 28px;
                height: 28px;
                border-radius: 999px;
                flex: 0 0 auto;
                color: #695423;
                font-size: 0.67rem;
                font-weight: 800;
                letter-spacing: 0.04em;
            }

            .team-member__avatar--gold { background: #f5e9c7; color: #8a6512; }
            .team-member__avatar--mint { background: #d8f4ea; color: #13725b; }
            .team-member__avatar--peach { background: #f8e6d5; color: #99653a; }
            .team-member__avatar--sand { background: #efe7d7; color: #6f5b33; }

            .team-member__copy {
                min-width: 0;
            }

            .team-member__copy h3 {
                margin: 0;
                color: #172033;
                font-size: 0.86rem;
                font-weight: 700;
                line-height: 1.2;
            }

            .team-member__copy p {
                margin: 2px 0 0;
                color: #5c6b83;
                font-size: 0.73rem;
                line-height: 1.2;
            }

            .team-member__stats {
                display: flex;
                align-items: center;
                gap: 6px;
                flex-wrap: wrap;
                justify-content: flex-end;
            }

            .team-count {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-height: 24px;
                padding: 0 10px;
                border-radius: 999px;
                font-size: 0.66rem;
                font-weight: 700;
                white-space: nowrap;
            }

            .team-count--active {
                background: #eef9f2;
                border: 1px solid #cde9d4;
                color: #236c47;
            }

            .team-count--done {
                background: #edf6ed;
                border: 1px solid #d4e5cf;
                color: #4a6e39;
            }

            .team-table__head,
            .team-row {
                display: grid;
                grid-template-columns: minmax(0, 2.2fr) minmax(90px, 1.1fr) minmax(96px, 1.15fr) minmax(72px, 0.8fr);
                gap: 12px;
                align-items: center;
            }

            .team-table__head {
                padding: 0 2px 8px;
                border-bottom: 1px solid #edf1f7;
                color: #657289;
                font-size: 0.58rem;
                font-weight: 700;
                letter-spacing: 0.08em;
                text-transform: uppercase;
            }

            .team-table__body {
                display: grid;
            }

            .team-row {
                padding: 8px 2px;
                border-bottom: 1px solid #f1f4fa;
            }

            .team-row--interactive {
                cursor: pointer;
                transition: background-color 0.2s ease, transform 0.2s ease;
            }

            .team-row--interactive:hover,
            .team-row--interactive:focus-visible {
                background: #f8fbff;
                outline: none;
            }

            .team-row:last-child {
                border-bottom: none;
            }

            .team-row__address,
            .team-row__start {
                color: #1b2437;
                font-size: 0.69rem;
                line-height: 1.35;
            }

            .team-pill {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-height: 22px;
                padding: 0 8px;
                border-radius: 999px;
                border: 1px solid transparent;
                font-size: 0.62rem;
                font-weight: 700;
                line-height: 1;
                white-space: nowrap;
            }

            .team-pill--disrepair {
                background: #ffe4ec;
                border-color: #f6c4d3;
                color: #b14b72;
            }

            .team-pill--planned-works {
                background: #f8e8dc;
                border-color: #ead2bb;
                color: #9b683c;
            }

            .team-pill--complete {
                background: #eef9e9;
                border-color: #cfe5c4;
                color: #4f7b38;
            }

            .team-pill--in-progress {
                background: #e4f5ec;
                border-color: #c6e4d5;
                color: #2b7f60;
            }

            .team-pill--needs-survey {
                background: #e8eefb;
                border-color: #d2dcf5;
                color: #506fb2;
            }

            .team-pill--quoted {
                background: #f2eee8;
                border-color: #e1d8ca;
                color: #756554;
            }

            .team-pill--needs-snagging {
                background: #fff0da;
                border-color: #f2d4a6;
                color: #ac6c0f;
            }

            @media (max-width: 900px) {
                .team-row,
                .team-table__head {
                    grid-template-columns: minmax(0, 2fr) minmax(80px, 1fr) minmax(90px, 1fr) minmax(68px, 0.8fr);
                    gap: 10px;
                }
            }

            @media (max-width: 640px) {
                .team-member {
                    padding: 14px 12px 8px;
                }

                .team-member__head {
                    flex-direction: column;
                    align-items: stretch;
                }

                .team-member__stats {
                    justify-content: flex-start;
                }

                .team-table {
                    overflow-x: auto;
                }

                .team-table__head,
                .team-row {
                    min-width: 560px;
                }
            }
        `,
        render: ({ escapeHtml }) => `
            <section class="team-page">
                <h2 class="team-page__title">Team Overview</h2>
                ${teamMembers.map((member) => renderMemberCard(member, escapeHtml)).join("")}
            </section>
        `,
        onClick: (event) => {
            const clickTarget = event.target instanceof Element ? event.target : event.target?.parentElement;
            const row = clickTarget?.closest("[data-scope-address]");

            if (!row) {
                return false;
            }

            return openScopeJob(row.getAttribute("data-scope-address"));
        },
        openScopeJob
    };
})();

window.pageModules = window.pageModules || {};

window.pageModules.access = (() => {
    const users = [
        { initials: "MJ", name: "Miles Jackson", role: "admin", group: "Office / admin", completeWorks: "Yes", jobPrice: "Yes", canEdit: "Yes", canDelete: "Yes", avatarClass: "access-avatar--blue", roleClass: "access-role--admin" },
        { initials: "SO", name: "Sarah (Office)", role: "office", group: "Office / admin", completeWorks: "Yes", jobPrice: "Yes", canEdit: "Yes", canDelete: "No", avatarClass: "access-avatar--violet", roleClass: "access-role--office" },
        { initials: "BG", name: "B&G Contractors", role: "contractor", group: "Independent contractor", completeWorks: "No", jobPrice: "Yes", canEdit: "Assign only", canDelete: "No", avatarClass: "access-avatar--amber", roleClass: "access-role--contractor" },
        { initials: "HA", name: "Harmony", role: "field", group: "B&G Contractors", completeWorks: "No", jobPrice: "No", canEdit: "Photos & complete", canDelete: "No", avatarClass: "access-avatar--mint", roleClass: "access-role--field" },
        { initials: "JN", name: "John Nelson", role: "field", group: "B&G Contractors", completeWorks: "No", jobPrice: "No", canEdit: "Photos & complete", canDelete: "No", avatarClass: "access-avatar--sand", roleClass: "access-role--field" },
        { initials: "DF", name: "Dave (Field)", role: "field", group: "B&G Contractors", completeWorks: "No", jobPrice: "No", canEdit: "Photos & complete", canDelete: "No", avatarClass: "access-avatar--slate", roleClass: "access-role--field" }
    ];

    function getPermissionClass(value) {
        return value === "Yes" ? "access-permission--yes" : "access-permission--no";
    }

    return {
        title: "Users & Access",
        search: "Search users and access...",
        style: `
            .access-page {
                display: flex;
                flex-direction: column;
                gap: 18px;
                padding-top: 30px;
            }

            .access-page__title {
                margin: 0;
                color: #121a26;
                font-size: 1.35rem;
                font-weight: 800;
            }

            .access-table-card {
                background: #ffffff;
                border: 1px solid #dce5f0;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 14px 28px rgba(24, 36, 61, 0.05);
            }

            .access-table-wrap {
                overflow-x: auto;
            }

            .access-table {
                width: 100%;
                border-collapse: collapse;
                min-width: 1080px;
            }

            .access-table th,
            .access-table td {
                padding: 14px 12px;
                border-bottom: 1px solid #edf1f6;
                text-align: left;
                vertical-align: middle;
            }

            .access-table tbody tr:last-child td {
                border-bottom: none;
            }

            .access-table th {
                color: #6f7d90;
                font-size: 0.72rem;
                font-weight: 700;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                background: #ffffff;
                white-space: nowrap;
            }

            .access-table td {
                color: #172033;
                font-size: 0.84rem;
                font-weight: 400;
            }

            .access-user {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .access-user__name {
                font-weight: 500;
            }

            .access-avatar {
                width: 34px;
                height: 34px;
                border-radius: 999px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: 0.72rem;
                font-weight: 800;
                flex: 0 0 auto;
            }

            .access-avatar--blue { background: #e6f0ff; color: #2f6dc8; }
            .access-avatar--violet { background: #f1e9ff; color: #7d56d8; }
            .access-avatar--amber { background: #faecd7; color: #a66a0b; }
            .access-avatar--mint { background: #ddf5ec; color: #11795d; }
            .access-avatar--sand { background: #f5ead9; color: #9b6a24; }
            .access-avatar--slate { background: #efede8; color: #5e6673; }

            .access-role,
            .access-permission {
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

            .access-role--admin { background: #ece9ff; color: #6d59d5; }
            .access-role--office { background: #e6f1ff; color: #2f78d2; }
            .access-role--contractor { background: #faecd7; color: #a66a0b; }
            .access-role--field { background: #dbf4ea; color: #13755a; }

            .access-permission--yes {
                background: #eef8de;
                color: #698d1f;
            }

            .access-permission--no {
                background: #e8f1ff;
                color: #2d73ca;
            }

            .access-muted {
                color: #5d6a7b;
            }
        `,
        render: ({ escapeHtml }) => `
            <section class="access-page">
                <h2 class="access-page__title">Users & Access</h2>

                <section class="access-table-card">
                    <div class="access-table-wrap">
                        <table class="access-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Role</th>
                                    <th>Contractor / Group</th>
                                    <th>Sees complete works</th>
                                    <th>Sees job price</th>
                                    <th>Can edit jobs</th>
                                    <th>Can delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${users.map((user) => `
                                    <tr>
                                        <td>
                                            <div class="access-user">
                                                <span class="access-avatar ${user.avatarClass}">${escapeHtml(user.initials)}</span>
                                                <span class="access-user__name">${escapeHtml(user.name)}</span>
                                            </div>
                                        </td>
                                        <td><span class="access-role ${user.roleClass}">${escapeHtml(user.role)}</span></td>
                                        <td class="access-muted">${escapeHtml(user.group)}</td>
                                        <td><span class="access-permission ${getPermissionClass(user.completeWorks)}">${escapeHtml(user.completeWorks)}</span></td>
                                        <td><span class="access-permission ${getPermissionClass(user.jobPrice)}">${escapeHtml(user.jobPrice)}</span></td>
                                        <td class="access-muted">${user.canEdit === "Yes" ? `<span class="access-permission access-permission--yes">Yes</span>` : escapeHtml(user.canEdit)}</td>
                                        <td><span class="access-permission ${getPermissionClass(user.canDelete)}">${escapeHtml(user.canDelete)}</span></td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    </div>
                </section>
            </section>
        `
    };
})();

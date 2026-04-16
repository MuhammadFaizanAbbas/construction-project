window.pageModules = window.pageModules || {};

window.pageModules.notifications = (() => {
    const state = {
        items: [
            {
                id: 1,
                group: "Action Required",
                title: "Snagging required",
                message: "22 Birch Grove WA16 7QT — Plaster finish to hallway walls not to required standard. Sk...",
                tone: "red",
                isRead: false
            },
            {
                id: 2,
                group: "Action Required",
                title: "Job not issued to a contractor",
                message: "62 Sycamore Drive WA14 2BV",
                tone: "red",
                isRead: false
            },
            {
                id: 3,
                group: "Needs Attention",
                title: "Complete but not billed",
                message: "42 Dorac Avenue SK8 3NZ",
                tone: "amber",
                isRead: false
            },
            {
                id: 4,
                group: "For Information",
                title: "No operative assigned",
                message: "33 Oak Lane WA15 9GH",
                tone: "blue",
                isRead: false
            }
        ]
    };

    function groupItems() {
        return [
            { title: "Action Required", items: state.items.filter((item) => item.group === "Action Required") },
            { title: "Needs Attention", items: state.items.filter((item) => item.group === "Needs Attention") },
            { title: "For Information", items: state.items.filter((item) => item.group === "For Information") }
        ];
    }

    return {
        title: "Notifications",
        search: "Search notifications...",
        style: `
            .notifications-page {
                display: flex;
                flex-direction: column;
                gap: 22px;
                padding-top: 30px;
            }

            .notifications-page__toolbar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                flex-wrap: wrap;
                padding: 0 2px;
            }

            .notifications-page__title {
                margin: 0;
                color: #142033;
                font-size: 1.35rem;
                font-weight: 800;
                letter-spacing: -0.02em;
            }

            .notifications-page__mark-all {
                border: 1px solid #cad6e3;
                background: linear-gradient(180deg, #ffffff 0%, #f7fafc 100%);
                color: #142033;
                border-radius: 14px;
                padding: 10px 18px;
                font: inherit;
                font-size: 0.88rem;
                font-weight: 700;
                cursor: pointer;
                box-shadow: 0 10px 20px rgba(24, 36, 61, 0.05);
                transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
            }

            .notifications-page__mark-all:hover {
                transform: translateY(-1px);
                border-color: #b6c6d8;
                box-shadow: 0 12px 24px rgba(24, 36, 61, 0.08);
            }

            .notifications-group {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .notifications-group__title {
                margin: 0;
                color: #687588;
                font-size: 0.75rem;
                font-weight: 700;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                padding-left: 4px;
            }

            .notifications-group__card {
                background: #ffffff;
                border: 1px solid #d9e3ef;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 16px 34px rgba(24, 36, 61, 0.06);
            }

            .notifications-item {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 16px;
                padding: 16px 16px;
                background: #ffffff;
                border-bottom: 1px solid rgba(190, 209, 230, 0.85);
                transition: background-color 0.18s ease;
            }

            .notifications-item:last-child {
                border-bottom: none;
            }

            .notifications-item.is-read {
                background: #ffffff;
            }

            .notifications-item:hover {
                background: #fafbfd;
            }

            .notifications-item.is-read:hover {
                background: #f9fbfd;
            }

            .notifications-item__main {
                min-width: 0;
                display: flex;
                align-items: flex-start;
                gap: 12px;
                flex: 1;
            }

            .notifications-item__dot {
                width: 9px;
                height: 9px;
                border-radius: 50%;
                margin-top: 8px;
                flex: 0 0 auto;
                box-shadow: 0 0 0 5px rgba(255, 255, 255, 0.75);
            }

            .notifications-item__dot--red { background: #ef5757; }
            .notifications-item__dot--amber { background: #f2a228; }
            .notifications-item__dot--blue { background: #4690e8; }

            .notifications-item__content h3 {
                margin: 0 0 5px;
                color: #101827;
                font-size: 0.94rem;
                font-weight: 700;
                letter-spacing: -0.01em;
            }

            .notifications-item__content p {
                margin: 0;
                color: #63748c;
                font-size: 0.83rem;
                line-height: 1.45;
            }

            .notifications-item__pill {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-height: 30px;
                padding: 5px 11px;
                border-radius: 999px;
                font-size: 0.74rem;
                font-weight: 700;
                white-space: nowrap;
                box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.55);
            }

            .notifications-item__pill--new.notifications-item__pill--red,
            .notifications-item__pill--read.notifications-item__pill--red { background: #fdecef; color: #c04463; }
            .notifications-item__pill--new.notifications-item__pill--amber,
            .notifications-item__pill--read.notifications-item__pill--amber { background: #fff2dc; color: #a76709; }
            .notifications-item__pill--new.notifications-item__pill--blue,
            .notifications-item__pill--read.notifications-item__pill--blue { background: #e8f1ff; color: #2a6cca; }

            .notifications-item.is-read .notifications-item__content h3 {
                color: #1d2532;
            }

            .notifications-item.is-read .notifications-item__content p {
                color: #708093;
            }

            @media (max-width: 720px) {
                .notifications-item {
                    flex-direction: column;
                    align-items: stretch;
                }

                .notifications-item__pill {
                    align-self: flex-end;
                }
            }
        `,
        render: ({ escapeHtml }) => `
            <section class="notifications-page">
                <div class="notifications-page__toolbar">
                    <h2 class="notifications-page__title">Notifications</h2>
                    <button class="notifications-page__mark-all" type="button" data-mark-all-notifications-read>Mark all read</button>
                </div>
                ${groupItems().map((group) => `
                    <section class="notifications-group">
                        <h3 class="notifications-group__title">${escapeHtml(group.title)}</h3>
                        <div class="notifications-group__card">
                            ${group.items.map((item) => `
                                <article class="notifications-item ${item.isRead ? "is-read" : ""}">
                                    <div class="notifications-item__main">
                                        <span class="notifications-item__dot notifications-item__dot--${escapeHtml(item.tone)}"></span>
                                        <div class="notifications-item__content">
                                            <h3>${escapeHtml(item.title)}</h3>
                                            <p>${escapeHtml(item.message)}</p>
                                        </div>
                                    </div>
                                    <span class="notifications-item__pill notifications-item__pill--${item.isRead ? "read" : "new"} notifications-item__pill--${escapeHtml(item.tone)}">${item.isRead ? "Read" : "New"}</span>
                                </article>
                            `).join("")}
                        </div>
                    </section>
                `).join("")}
            </section>
        `,
        onClick: (event, { rerender }) => {
            const clickTarget = event.target instanceof Element ? event.target : event.target?.parentElement;
            if (!clickTarget) {
                return false;
            }

            const markAllButton = clickTarget.closest("[data-mark-all-notifications-read]");
            if (!markAllButton) {
                return false;
            }

            state.items.forEach((item) => {
                item.isRead = true;
            });
            rerender();
            return true;
        }
    };
})();

window.pageModules = window.pageModules || {};

window.pageModules.messages = (() => {
    const conversations = [
        { title: "42 Dorac Avenue SK8 3NZ", subtitle: "Group · B&G Contractors + field", preview: "", badge: "🏠", badgeClass: "messages-badge--job", active: false },
        { title: "14 Birchwood Close M22 4PR", subtitle: "Group · B&G Contractors + field", preview: "Miles Jackson: Great, please upl...", badge: "🏠", badgeClass: "messages-badge--job", active: false },
        { title: "7 Maple Street SK1 2EF", subtitle: "Group · B&G Contractors + field", preview: "Miles Jackson: Brilliant, thanks f...", badge: "🏠", badgeClass: "messages-badge--job", active: false },
        { title: "33 Oak Lane WA15 9GH", subtitle: "Group · B&G Contractors + field", preview: "", badge: "🏠", badgeClass: "messages-badge--job", active: true },
        { title: "55 Cedar Avenue SK4 1LM", subtitle: "Group · B&G Contractors + field", preview: "", badge: "🏠", badgeClass: "messages-badge--job", active: false },
        { title: "8 Willow Court M20 6NP", subtitle: "Group · B&G Contractors + field", preview: "", badge: "🏠", badgeClass: "messages-badge--job", active: false },
        { title: "22 Birch Grove WA16 7QT", subtitle: "Group · B&G Contractors + field", preview: "", badge: "🏠", badgeClass: "messages-badge--job", active: false },
        { title: "Sarah (Office)", subtitle: "office", preview: "", badge: "SO", badgeClass: "messages-badge--office", active: false },
        { title: "B&G Contractors", subtitle: "contractor", preview: "Miles Jackson: Of course — I'll c...", badge: "BG", badgeClass: "messages-badge--contractor", active: false },
        { title: "Harmony", subtitle: "field", preview: "", badge: "HA", badgeClass: "messages-badge--field", active: false },
        { title: "John Nelson", subtitle: "field", preview: "", badge: "JN", badgeClass: "messages-badge--field", active: false },
        { title: "Dave (Field)", subtitle: "field", preview: "", badge: "DF", badgeClass: "messages-badge--field", active: false }
    ];

    const activeConversation = conversations.find((item) => item.active) || conversations[0];

    return {
        title: "Messages",
        search: "Search messages...",
        style: `
            .messages-page {
                display: flex;
                flex-direction: column;
                gap: 18px;
                padding-top: 30px;
            }

            .messages-page__title {
                margin: 0;
                color: #121a26;
                font-size: 1.35rem;
                font-weight: 800;
            }

            .messages-shell {
                display: grid;
                grid-template-columns: 245px minmax(0, 1fr);
                min-height: 740px;
                background: #ffffff;
                border: 1px solid #dce5f0;
                border-radius: 18px;
                overflow: hidden;
                box-shadow: 0 14px 28px rgba(24, 36, 61, 0.05);
            }

            .messages-sidebar {
                border-right: 1px solid #dce5f0;
                display: flex;
                flex-direction: column;
                min-height: 0;
            }

            .messages-sidebar__title {
                padding: 14px 14px 12px;
                color: #6d7a8d;
                font-size: 0.78rem;
                font-weight: 700;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                border-bottom: 1px solid #e7ecf3;
            }

            .messages-sidebar__list {
                overflow-y: auto;
                min-height: 0;
            }

            .messages-sidebar__item {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                width: 100%;
                padding: 14px 12px;
                border: none;
                border-bottom: 1px solid #e8edf4;
                background: #ffffff;
                text-align: left;
                cursor: pointer;
            }

            .messages-sidebar__item.is-active {
                background: #f7fafc;
            }

            .messages-badge {
                width: 38px;
                height: 38px;
                border-radius: 999px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex: 0 0 auto;
                font-size: 0.8rem;
                font-weight: 800;
            }

            .messages-badge--job { background: #dff5eb; color: #168366; }
            .messages-badge--office { background: #ece7ff; color: #6958d8; }
            .messages-badge--contractor { background: #e8f1ff; color: #2f78d2; }
            .messages-badge--field { background: #e8f1ff; color: #2f78d2; }

            .messages-sidebar__copy {
                min-width: 0;
                flex: 1;
            }

            .messages-sidebar__copy h3 {
                margin: 0 0 4px;
                color: #13233a;
                font-size: 0.9rem;
                font-weight: 700;
                line-height: 1.25;
            }

            .messages-sidebar__copy p {
                margin: 0 0 3px;
                color: #57677f;
                font-size: 0.74rem;
                line-height: 1.35;
            }

            .messages-sidebar__copy span {
                color: #8a96aa;
                font-size: 0.72rem;
                line-height: 1.3;
            }

            .messages-main {
                display: flex;
                flex-direction: column;
                min-width: 0;
            }

            .messages-main__header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                padding: 10px 14px;
                border-bottom: 1px solid #e7ecf3;
            }

            .messages-main__identity {
                display: flex;
                align-items: center;
                gap: 10px;
                min-width: 0;
            }

            .messages-main__identity h3 {
                margin: 0 0 4px;
                color: #111b2b;
                font-size: 1rem;
                font-weight: 800;
            }

            .messages-main__identity p {
                margin: 0;
                color: #57677f;
                font-size: 0.76rem;
                line-height: 1.35;
            }

            .messages-main__job-button {
                border: 1px solid #cfd6e2;
                background: #ffffff;
                color: #162234;
                border-radius: 12px;
                min-height: 38px;
                padding: 0 14px;
                font: inherit;
                font-size: 0.84rem;
                font-weight: 700;
                cursor: pointer;
                white-space: nowrap;
            }

            .messages-main__body {
                flex: 1;
                display: grid;
                place-items: center;
                color: #8c5f2b;
                font-size: 0.92rem;
                text-align: center;
                padding: 18px;
            }

            .messages-main__footer {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 14px;
                border-top: 1px solid #e7ecf3;
            }

            .messages-main__footer input {
                flex: 1;
                min-width: 0;
                min-height: 44px;
                border: 1px solid #cfd6e2;
                border-radius: 999px;
                padding: 0 16px;
                font: inherit;
                font-size: 0.9rem;
                color: #1b2432;
            }

            .messages-main__send {
                width: 38px;
                height: 38px;
                border: 1px solid #1f1f1f;
                border-radius: 999px;
                background: #1f1f1f;
                color: #ffffff;
                font: inherit;
                font-size: 1rem;
                cursor: pointer;
            }

            @media (max-width: 900px) {
                .messages-shell {
                    grid-template-columns: 1fr;
                }

                .messages-sidebar {
                    border-right: none;
                    border-bottom: 1px solid #dce5f0;
                    max-height: 320px;
                }
            }
        `,
        render: ({ escapeHtml }) => `
            <section class="messages-page">
                <h2 class="messages-page__title">Messages</h2>

                <section class="messages-shell">
                    <aside class="messages-sidebar">
                        <div class="messages-sidebar__title">Conversations</div>
                        <div class="messages-sidebar__list">
                            ${conversations.map((item) => `
                                <button class="messages-sidebar__item${item.active ? " is-active" : ""}" type="button">
                                    <span class="messages-badge ${item.badgeClass}">${escapeHtml(item.badge)}</span>
                                    <div class="messages-sidebar__copy">
                                        <h3>${escapeHtml(item.title)}</h3>
                                        <p>${escapeHtml(item.subtitle)}</p>
                                        ${item.preview ? `<span>${escapeHtml(item.preview)}</span>` : ""}
                                    </div>
                                </button>
                            `).join("")}
                        </div>
                    </aside>

                    <section class="messages-main">
                        <div class="messages-main__header">
                            <div class="messages-main__identity">
                                <span class="messages-badge ${activeConversation.badgeClass}">${escapeHtml(activeConversation.badge)}</span>
                                <div>
                                    <h3>${escapeHtml(activeConversation.title)}</h3>
                                    <p>Group · Miles Jackson, Sarah (Office), B&G Contractors, Harmony, John Nelson, Dave (Field)</p>
                                </div>
                            </div>
                            <button class="messages-main__job-button" type="button">View job →</button>
                        </div>

                        <div class="messages-main__body">
                            <p>No messages yet — say hello!</p>
                        </div>

                        <div class="messages-main__footer">
                            <input type="text" placeholder="Type a message...">
                            <button class="messages-main__send" type="button">↑</button>
                        </div>
                    </section>
                </section>
            </section>
        `
    };
})();

window.pageModules = window.pageModules || {};

window.pageModules.messages = (() => {
    const conversations = [
        { id: 1, title: "42 Dorac Avenue SK8 3NZ", subtitle: "Group - B&G Contractors + field", preview: "", badge: "H", badgeClass: "messages-badge--job", headerParticipants: "Group - B&G Contractors + field", messages: [] },
        { id: 2, title: "14 Birchwood Close M22 4PR", subtitle: "Group - B&G Contractors + field", preview: "Miles Jackson: Great, please upl...", badge: "H", badgeClass: "messages-badge--job", headerParticipants: "Group - Miles Jackson, Sarah (Office), B&G Contractors, Harmony, John Nelson, Dave (Field)", messages: [
            { sender: "Miles Jackson", body: "Morning - can you confirm what time you're starting at Birchwood Close today?", time: "08:15", mine: true },
            { sender: "John Nelson", body: "Hi Miles, starting at 9am. Should have the kitchen ceiling done by lunch.", time: "08:22", mine: false },
            { sender: "Miles Jackson", body: "Great, please upload photos once the ceiling is replaced.", time: "08:25", mine: true }
        ]},
        { id: 3, title: "7 Maple Street SK1 2EF", subtitle: "Group - B&G Contractors + field", preview: "Miles Jackson: Brilliant, thanks f...", badge: "H", badgeClass: "messages-badge--job", headerParticipants: "Group - B&G Contractors + field", messages: [
            { sender: "Miles Jackson", body: "Brilliant, thanks for the fast update.", time: "11:02", mine: true }
        ]},
        { id: 4, title: "33 Oak Lane WA15 9GH", subtitle: "Group - B&G Contractors + field", preview: "", badge: "H", badgeClass: "messages-badge--job", headerParticipants: "Group - Miles Jackson, Sarah (Office), B&G Contractors, Harmony, John Nelson, Dave (Field)", messages: [] },
        { id: 5, title: "55 Cedar Avenue SK4 1LM", subtitle: "Group - B&G Contractors + field", preview: "", badge: "H", badgeClass: "messages-badge--job", headerParticipants: "Group - B&G Contractors + field", messages: [] },
        { id: 6, title: "8 Willow Court M20 6NP", subtitle: "Group - B&G Contractors + field", preview: "", badge: "H", badgeClass: "messages-badge--job", headerParticipants: "Group - B&G Contractors + field", messages: [] },
        { id: 7, title: "22 Birch Grove WA14 7QT", subtitle: "Group - B&G Contractors + field", preview: "", badge: "H", badgeClass: "messages-badge--job", headerParticipants: "Group - B&G Contractors + field", messages: [] },
        { id: 8, title: "Sarah (Office)", subtitle: "office", preview: "", badge: "SO", badgeClass: "messages-badge--office", headerParticipants: "office", messages: [] },
        { id: 9, title: "B&G Contractors", subtitle: "contractor", preview: "Miles Jackson: Of course - I'll c...", badge: "BG", badgeClass: "messages-badge--contractor", headerParticipants: "contractor", messages: [
            { sender: "Miles Jackson", body: "Of course - I'll confirm the revised start dates this afternoon.", time: "16:40", mine: true }
        ]},
        { id: 10, title: "Harmony", subtitle: "field", preview: "", badge: "HA", badgeClass: "messages-badge--field", headerParticipants: "field", messages: [] },
        { id: 11, title: "John Nelson", subtitle: "field", preview: "", badge: "JN", badgeClass: "messages-badge--field", headerParticipants: "field", messages: [] },
        { id: 12, title: "Dave (Field)", subtitle: "field", preview: "", badge: "DF", badgeClass: "messages-badge--field", headerParticipants: "field", messages: [] }
    ];

    const state = {
        selectedId: 2
    };

    function rerenderMessagesPage() {
        if (typeof window.__jobManagementRenderActivePage === "function") {
            window.__jobManagementRenderActivePage();
        }
    }

    function getSelectedConversation() {
        return conversations.find((item) => item.id === state.selectedId) || conversations[0];
    }

    function getScopeJobForConversation(conversation) {
        if (!conversation || typeof window.pageModules?.scope?.openJobByAddress !== "function") {
            return null;
        }

        return typeof window.pageModules.scope.findJobByAddress === "function"
            ? window.pageModules.scope.findJobByAddress(conversation.title)
            : null;
    }

    function renderMessages(selected, escapeHtml) {
        if (!selected.messages.length) {
            return `<div class="messages-main__empty"><p>No messages yet - say hello!</p></div>`;
        }

        return `<div class="messages-chat">
            ${selected.messages.map((message) => `
                <article class="messages-chat__item ${message.mine ? "is-mine" : ""}">
                    ${message.mine ? "" : `<div class="messages-chat__sender">${escapeHtml(message.sender)}</div>`}
                    <div class="messages-chat__bubble">${escapeHtml(message.body)}</div>
                    <div class="messages-chat__time">${escapeHtml(message.time)}</div>
                </article>
            `).join("")}
        </div>`;
    }

    return {
        title: "Messages",
        search: "Search messages...",
        style: `
            .page-layout { height: 100%; }
            .messages-page { display: flex; flex-direction: column; gap: 18px; height: 100%; padding-top: 30px; overflow: hidden; box-sizing: border-box; }
            .messages-page__title { margin: 0; color: #121a26; font-size: 1.35rem; font-weight: 800; }
            .messages-shell { display: grid; grid-template-columns: 245px minmax(0, 1fr); flex: 1; min-height: 0; background: #ffffff; border: 1px solid #dce5f0; border-radius: 18px; overflow: hidden; box-shadow: 0 14px 28px rgba(24, 36, 61, 0.05); }
            .messages-sidebar { border-right: 1px solid #dce5f0; display: flex; flex-direction: column; min-height: 0; height: 100%; }
            .messages-sidebar__title { padding: 14px 14px 12px; color: #6d7a8d; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; border-bottom: 1px solid #e7ecf3; }
            .messages-sidebar__list { flex: 1; overflow-y: auto; min-height: 0; scrollbar-width: auto; scrollbar-color: #98a4b5 #edf1f6; }
            .messages-sidebar__list::-webkit-scrollbar { width: 12px; }
            .messages-sidebar__list::-webkit-scrollbar-track { background: #edf1f6; }
            .messages-sidebar__list::-webkit-scrollbar-thumb { background: #98a4b5; border-radius: 999px; border: 2px solid #edf1f6; }
            .messages-sidebar__item { display: flex; align-items: flex-start; gap: 10px; width: 100%; padding: 12px; border: none; border-bottom: 1px solid #e8edf4; background: #ffffff; text-align: left; cursor: pointer; }
            .messages-sidebar__item.is-active { background: #f7fafc; }
            .messages-badge { width: 34px; height: 34px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; flex: 0 0 auto; font-size: 0.74rem; font-weight: 800; }
            .messages-badge--job { background: #dff5eb; color: #168366; }
            .messages-badge--office { background: #ece7ff; color: #6958d8; }
            .messages-badge--contractor { background: #e8f1ff; color: #2f78d2; }
            .messages-badge--field { background: #e8f1ff; color: #2f78d2; }
            .messages-sidebar__copy { min-width: 0; flex: 1; }
            .messages-sidebar__copy h3 { margin: 0 0 3px; color: #13233a; font-size: 0.78rem; font-weight: 700; line-height: 1.28; }
            .messages-sidebar__copy p { margin: 0 0 2px; color: #57677f; font-size: 0.66rem; line-height: 1.3; }
            .messages-sidebar__copy span { display: -webkit-box; color: #8a96aa; font-size: 0.66rem; line-height: 1.25; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
            .messages-main { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
            .messages-main__header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 10px 14px; border-bottom: 1px solid #e7ecf3; }
            .messages-main__identity { display: flex; align-items: center; gap: 10px; min-width: 0; }
            .messages-main__identity h3 { margin: 0 0 4px; color: #111b2b; font-size: 1rem; font-weight: 800; }
            .messages-main__identity p { margin: 0; color: #57677f; font-size: 0.76rem; line-height: 1.35; }
            .messages-main__job-button { display: inline-flex; align-items: center; gap: 8px; border: 1px solid #cfd6e2; background: #ffffff; color: #162234; border-radius: 12px; min-height: 38px; padding: 0 14px; font: inherit; font-size: 0.84rem; font-weight: 700; cursor: pointer; white-space: nowrap; }
            .messages-main__job-button svg { width: 14px; height: 14px; stroke: currentColor; stroke-width: 2.2; fill: none; stroke-linecap: round; stroke-linejoin: round; }
            .messages-main__body { flex: 1; color: #8c5f2b; font-size: 0.92rem; padding: 18px; overflow: auto; display: flex; flex-direction: column; justify-content: center; }
            .messages-chat { display: flex; flex-direction: column; gap: 10px; }
            .messages-chat__item { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; max-width: 100%; }
            .messages-chat__item.is-mine { align-items: flex-end; }
            .messages-chat__sender { color: #8a5c24; font-size: 0.78rem; }
            .messages-chat__bubble { max-width: min(76%, 560px); padding: 14px 16px; border-radius: 16px; background: #f4f5f7; color: #111827; font-size: 0.9rem; line-height: 1.45; }
            .messages-chat__item.is-mine .messages-chat__bubble { background: #1f1f1f; color: #ffffff; }
            .messages-chat__time { color: #9aa4b2; font-size: 0.72rem; padding: 0 4px; }
            .messages-main__empty { text-align: center; }
            .messages-main__footer { display: flex; align-items: center; gap: 10px; padding: 14px; border-top: 1px solid #e7ecf3; }
            .messages-main__footer input { flex: 1; min-width: 0; min-height: 44px; border: 1px solid #1f1f1f; border-radius: 999px; padding: 0 16px; font: inherit; font-size: 0.9rem; color: #1b2432; }
            .messages-main__send { width: 38px; height: 38px; border: 1px solid #1f1f1f; border-radius: 999px; background: #1f1f1f; color: #ffffff; font: inherit; font-size: 1rem; cursor: pointer; }
            @media (max-width: 900px) { .messages-shell { grid-template-columns: 1fr; height: auto; } .messages-sidebar { border-right: none; border-bottom: 1px solid #dce5f0; max-height: 320px; } .messages-chat__bubble { max-width: 100%; } }
        `,
        render: ({ escapeHtml }) => {
            const selected = getSelectedConversation();
            const linkedScopeJob = getScopeJobForConversation(selected);
            return `
                <section class="messages-page">
                    <h2 class="messages-page__title">Messages</h2>
                    <section class="messages-shell">
                        <aside class="messages-sidebar">
                            <div class="messages-sidebar__title">Conversations</div>
                            <div class="messages-sidebar__list">
                                ${conversations.map((item) => `
                                    <button class="messages-sidebar__item${item.id === selected.id ? " is-active" : ""}" type="button" data-message-conversation="${item.id}">
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
                                    <span class="messages-badge ${selected.badgeClass}">${escapeHtml(selected.badge)}</span>
                                    <div>
                                        <h3>${escapeHtml(selected.title)}</h3>
                                        <p>${escapeHtml(selected.headerParticipants)}</p>
                                    </div>
                                </div>
                                ${linkedScopeJob ? `
                                    <button class="messages-main__job-button" type="button" data-open-scope-job="${linkedScopeJob.id}">
                                        <span>View job</span>
                                        <svg viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="m9 6 6 6-6 6"></path>
                                        </svg>
                                    </button>
                                ` : ""}
                            </div>
                            <div class="messages-main__body">
                                ${renderMessages(selected, escapeHtml)}
                            </div>
                            <div class="messages-main__footer">
                                <input type="text" placeholder="Type a message...">
                                <button class="messages-main__send" type="button">?</button>
                            </div>
                        </section>
                    </section>
                </section>
            `;
        },
        onClick: (event) => {
            const clickTarget = event.target instanceof Element ? event.target : event.target?.parentElement;
            if (!clickTarget) {
                return false;
            }

            const scopeJobButton = clickTarget.closest("[data-open-scope-job]");
            if (scopeJobButton) {
                const conversation = getSelectedConversation();
                if (!conversation) {
                    return true;
                }

                if (typeof window.__jobManagementNavigateToPage === "function") {
                    window.__jobManagementNavigateToPage("scope");
                }

                if (typeof window.pageModules?.scope?.openJobByAddress === "function") {
                    window.pageModules.scope.openJobByAddress(conversation.title);
                }

                return true;
            }

            const conversationButton = clickTarget.closest("[data-message-conversation]");
            if (!conversationButton) {
                return false;
            }

            state.selectedId = Number(conversationButton.getAttribute("data-message-conversation"));
            rerenderMessagesPage();
            return true;
        }
    };
})();

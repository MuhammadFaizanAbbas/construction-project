window.pageModules = window.pageModules || {};

function isArchiveContractorRole() {
    return typeof window.__jobManagementGetCurrentUserRole === "function"
        && window.__jobManagementGetCurrentUserRole() === "contractor";
}

window.pageModules.archive = {
    title: () => isArchiveContractorRole() ? "Billed Jobs" : "Archive",
    search: () => isArchiveContractorRole() ? "Search billed jobs..." : "Search archive...",
    style: `
        .archive-page {
            display: flex;
            flex-direction: column;
            gap: 18px;
            padding-top: 26px;
        }

        .archive-page__heading {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .archive-page__title {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0;
            color: #121a26;
            font-size: 1.1rem;
            font-weight: 800;
        }

        .archive-page__title svg {
            width: 18px;
            height: 18px;
            fill: #121a26;
            flex: 0 0 auto;
        }

        .archive-page__meta {
            margin: 0;
            color: #7a664f;
            font-size: 0.82rem;
            line-height: 1.4;
        }

        .archive-empty {
            display: grid;
            place-items: center;
            min-height: 194px;
            background: #ffffff;
            border: 1px solid #d9dee7;
            border-radius: 18px;
            padding: 30px 24px;
            box-shadow: 0 12px 24px rgba(24, 36, 61, 0.04);
            text-align: center;
        }

        .archive-empty__inner {
            max-width: 420px;
        }

        .archive-empty__icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            margin-bottom: 10px;
            color: #6d6459;
        }

        .archive-empty__icon svg {
            width: 28px;
            height: 28px;
            fill: currentColor;
        }

        .archive-empty h3 {
            margin: 0 0 8px;
            color: #111827;
            font-size: 0.98rem;
            font-weight: 800;
        }

        .archive-empty p {
            margin: 0;
            color: #7a664f;
            font-size: 0.84rem;
            line-height: 1.5;
        }
    `,
    render: () => `
        <section class="archive-page">
            <div class="archive-page__heading">
                <h2 class="archive-page__title">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h4.2l1.4 1.8H18.5A2.5 2.5 0 0 1 21 9.3v7.2A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z"></path>
                    </svg>
                    <span>${isArchiveContractorRole() ? "Billed Jobs" : "Archive"}</span>
                </h2>
                <p class="archive-page__meta">${isArchiveContractorRole() ? "0 billed jobs - Total value GBP 0" : "0 archived jobs - Total value GBP 0"}</p>
            </div>
            <section class="archive-empty">
                <div class="archive-empty__inner">
                    <div class="archive-empty__icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                            <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h4.1l1.5 1.8H17A3 3 0 0 1 20 9.8v5.7A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5z"></path>
                            <path d="M17.7 13.2c.6-.1 1.2.4 1.2 1 0 .4-.2.7-.5.9l-2.6 2.2a1 1 0 0 1-1.6-.8v-1.2h-1.1a1 1 0 1 1 0-2h1.1v-1.2a1 1 0 0 1 1.6-.8z"></path>
                        </svg>
                    </div>
                    <h3>${isArchiveContractorRole() ? "No billed jobs yet" : "Archive is empty"}</h3>
                    <p>${isArchiveContractorRole() ? "Jobs marked as billed will appear here for the contractor view." : "Jobs marked as billed will appear here, grouped by client."}</p>
                </div>
            </section>
        </section>
    `
};

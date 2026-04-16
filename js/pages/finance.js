window.pageModules = window.pageModules || {};

window.pageModules.finance = {
    title: "Finance",
    search: "Search finance...",
    style: `
        .page-welcome {
            background: #ffffff;
            border: 1px solid #dce3f4;
            border-radius: 28px;
            padding: 36px;
            box-shadow: 0 20px 45px rgba(24, 36, 61, 0.08);
        }

        .page-welcome__eyebrow {
            margin: 0 0 10px;
            color: #2f6df6;
            font-size: 0.82rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }

        .page-welcome h3 {
            margin: 0 0 12px;
            color: #18243d;
            font-size: 2rem;
        }

        .page-welcome p {
            margin: 0;
            color: #6f7a8f;
            font-size: 1rem;
            line-height: 1.7;
        }
    `,
    render: ({ escapeHtml }) => `
        <section class="page-welcome">
            <p class="page-welcome__eyebrow">Finance Page</p>
            <h3>Welcome to ${escapeHtml("Finance")}</h3>
            <p>This is the finance page. You can now manage its layout only from this page file.</p>
        </section>
    `
};

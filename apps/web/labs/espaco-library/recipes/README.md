# App-owned recipes

These are editable catalog examples, not `beds` exports. Their layout, assets,
breakpoints and hierarchy belong to the app. They import only public BEDS
components and read inherited tokens. They are not compiled into the package's
runtime JavaScript or stylesheet.

Extracted families include landing, footer, benefits, onboarding, checkout,
results, processing, pricing comparison, payment confirmation, app shell, guided
chat thread and chat workspace.
`ChatThread` owns the example's page heading, next-step focus and viewport layout;
chat messages, choices and composer remain individually reusable in the package.
`PageContentHeader` preserves the MCP example's page insets and measure; use the
public `PageHeader` for a reusable heading without those app-specific margins.
`HomeHeader` preserves the former home greeting hierarchy outside the package;
its top inset and22/20px title are example decisions, not a public `purpose` prop.
`AppShell` owns catalog page widths and mobile orchestration; public `Sidebar`
owns only reusable navigation presentation and controlled compact state.
`PricingCard` remains a public individual component; comparison layout does not.
Application cards and their vacancy board also belong here: their ATS/FIT,
company, salary and lifecycle vocabulary is domain-specific. They share public
menus and meters without reaching into the controls' private CSS.
Workspace is an optional source example, not yet a rendered catalog route.
Its utilities are compiled by catalog styles,
never by the portable library build.
Existing pages still demonstrate them so the extraction does not discard work.
Do not copy the example's business copy or promote its dimensions into universal
rules. Before creating UI, read the skills linked in
[Interface quality](../../../../../docs/design/espaco-library/INTERFACE-QUALITY.md).

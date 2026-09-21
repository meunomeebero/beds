export type SandboxedHtmlPreviewProps = {
  /** Accessible name of the rendered document. */
  title: string;
  /** Complete server-produced HTML document to render. */
  html: string;
};

/**
 * Read-only HTML frame for a BEDS Dialog or Drawer. No fetch, parsing,
 * navigation, editing, clipboard action or business state belongs here.
 */
export function SandboxedHtmlPreview({ title, html }: SandboxedHtmlPreviewProps) {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-[var(--es-shadow-xs)] focus-within:outline-2 focus-within:outline-ring focus-within:outline-offset-2">
      <iframe
        title={title}
        sandbox=""
        referrerPolicy="no-referrer"
        srcDoc={html}
        className="block h-[min(560px,52dvh)] min-h-40 w-full border-0 bg-white"
      />
    </div>
  );
}

import { requireSection } from "@/lib/admin-auth";
import { hasSupabaseEnv } from "@/lib/jobs";
import { getSignature, approvalsSignedUrl } from "@/lib/approvals";
import SignatureForm from "./SignatureForm";

export const dynamic = "force-dynamic";

export default async function SignaturePage() {
  await requireSection("signature");

  if (!hasSupabaseEnv()) {
    return (
      <div className="admin-page">
        <div className="admin-head">
          <h1>Signature</h1>
        </div>
        <div className="alert alert--error">
          The database isn&apos;t connected yet. Set <code>SUPABASE_URL</code> and{" "}
          <code>SUPABASE_SERVICE_ROLE_KEY</code> first.
        </div>
      </div>
    );
  }

  const signature = await getSignature();
  const url = signature ? await approvalsSignedUrl(signature.path) : null;

  return (
    <div className="admin-page">
      <div className="admin-head">
        <h1>CEO signature</h1>
        <p className="muted">
          This signature is stamped into the PDF whenever the CEO approves a request, and shown on
          the approval record.
        </p>
      </div>

      <div className="admin-detail">
        <div className="admin-card">
          <h2>Current signature</h2>
          {url ? (
            <>
              <div className="signature-preview">
                {/* Signed URL into the private bucket; next/image only allows the public bucket. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="CEO signature" />
              </div>
              <p className="muted">
                Updated{" "}
                {new Date(signature!.updatedAt).toLocaleString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                by {signature!.updatedByUsername || "unknown"}
              </p>
            </>
          ) : (
            <p className="muted">
              No signature on file yet. Requests can&apos;t be approved until one is uploaded.
            </p>
          )}
        </div>

        <aside className="admin-card">
          <h2>{signature ? "Replace signature" : "Upload signature"}</h2>
          <SignatureForm hasSignature={!!signature} />
        </aside>
      </div>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSection, canDecideApprovals } from "@/lib/admin-auth";
import {
  getRequest,
  getDocuments,
  getEvents,
  getSignature,
  approvalsSignedUrl,
} from "@/lib/approvals";
import {
  companyBySlug,
  EVENT_LABEL,
  SECTION_LABEL,
  STATUS_LABEL,
} from "@/lib/approvals-meta";
import DecisionPanel from "./DecisionPanel";
import UploadVersionForm from "./UploadVersionForm";
import DeleteRequestButton from "./DeleteRequestButton";

export const dynamic = "force-dynamic";
// Approving downloads the PDF, runs signature-placement detection (optionally
// a Claude vision call) and re-uploads the stamped copy - give it headroom
// beyond the default serverless duration.
export const maxDuration = 60;

function fmt(dateIso: string): string {
  return new Date(dateIso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await requireSection("approvals");
  const { id } = await params;
  const request = await getRequest(id);
  if (!request) notFound();

  const company = companyBySlug(request.companySlug);
  const [docs, events] = await Promise.all([getDocuments(id), getEvents(id)]);
  const current = docs.find((d) => d.version === request.currentVersion) ?? docs[0];

  const [docLinks, eventLinks, currentUrl, signedCopyUrl, signatureUrl] = await Promise.all([
    Promise.all(
      docs.map(async (d) => ({
        ...d,
        openUrl: await approvalsSignedUrl(d.path),
        downloadUrl: await approvalsSignedUrl(d.path, { download: d.filename }),
      })),
    ),
    Promise.all(
      events.map(async (e) => ({
        ...e,
        signedUrl: e.signedPath ? await approvalsSignedUrl(e.signedPath, { download: true }) : null,
      })),
    ),
    current ? approvalsSignedUrl(current.path) : null,
    request.signedPath
      ? approvalsSignedUrl(request.signedPath, {
          download: `${request.refNo || "request"}-signed.pdf`,
        })
      : null,
    // The snapshot taken at approval time, not the live signature pointer.
    request.signaturePath ? approvalsSignedUrl(request.signaturePath) : null,
  ]);
  const currentLinks = docLinks.find((d) => d.version === request.currentVersion);

  const decider = canDecideApprovals(me);
  // The CEO's current signature, for the manual placement editor (deciders only).
  let placerSignatureUrl: string | null = null;
  if (decider && request.status !== "approved") {
    const sig = await getSignature();
    placerSignatureUrl = sig ? await approvalsSignedUrl(sig.path) : null;
  }

  return (
    <div className="admin-page">
      <div className="crumbs">
        <Link href={`/admin/approvals/${request.companySlug}`}>
          ← {company?.name ?? "Company"}
        </Link>
      </div>
      <div className="admin-head admin-head--row">
        <div>
          <h1>{request.title}</h1>
          <p className="muted">
            {company?.name ?? request.companySlug} ({company?.country}) ·{" "}
            {SECTION_LABEL[request.section]} · Ref {request.refNo} · created {fmt(request.createdAt)} by{" "}
            {request.createdByUsername || "unknown"}
          </p>
        </div>
        <span className={`stage-badge stage-badge--${request.status}`}>
          {STATUS_LABEL[request.status]}
        </span>
      </div>

      {request.status === "rejected" && (
        <div className="alert alert--error">
          Rejected by <b>{request.decidedByUsername}</b>
          {request.decidedAt ? ` on ${fmt(request.decidedAt)}` : ""}.
          {request.decisionNote ? (
            <>
              {" "}
              Reason: <b>{request.decisionNote}</b>
            </>
          ) : null}{" "}
          Upload an updated document below to send it back for approval.
        </div>
      )}
      {request.status === "hold" && (
        <div className="alert alert--info">
          On hold by <b>{request.decidedByUsername}</b>
          {request.decidedAt ? ` since ${fmt(request.decidedAt)}` : ""}.
          {request.decisionNote ? <> Note: {request.decisionNote}</> : null}
        </div>
      )}

      <div className="admin-detail">
        <div className="admin-card">
          <h2>Details</h2>
          <dl className="kv">
            <div>
              <dt>Company</dt>
              <dd>
                {company?.name ?? request.companySlug}
                {company ? ` (${company.country})` : ""}
              </dd>
            </div>
            <div>
              <dt>Section</dt>
              <dd>{SECTION_LABEL[request.section]}</dd>
            </div>
            <div>
              <dt>Type</dt>
              <dd>{request.type || "Not set"}</dd>
            </div>
            <div>
              <dt>Ref number</dt>
              <dd>{request.refNo}</dd>
            </div>
            <div>
              <dt>Current version</dt>
              <dd>
                v{request.currentVersion}
                {current ? ` · ${current.filename}` : ""}
              </dd>
            </div>
            <div>
              <dt>Created by</dt>
              <dd>{request.createdByUsername || "unknown"}</dd>
            </div>
          </dl>

          {request.status === "approved" && (
            <div className="approval-record">
              <h3>Approved</h3>
              {signatureUrl ? (
                // Signed URL into the private bucket; next/image only allows
                // the public site-media host.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={signatureUrl} alt="CEO signature" />
              ) : (
                <p className="muted">Signature image unavailable.</p>
              )}
              <p>
                <b>{request.decidedByUsername}</b>
                {request.decidedAt ? ` · ${fmt(request.decidedAt)}` : ""}
              </p>
              {request.decisionNote && <p className="muted">{request.decisionNote}</p>}
              {signedCopyUrl ? (
                <a className="btn btn--primary" href={signedCopyUrl}>
                  Download signed copy
                </a>
              ) : (
                <p className="muted">
                  The PDF could not be stamped automatically; the approval above is the record.
                </p>
              )}
            </div>
          )}
        </div>

        <aside className="admin-card">
          {decider ? (
            <DecisionPanel
              requestId={request.id}
              status={request.status}
              pdfUrl={currentUrl}
              signatureUrl={placerSignatureUrl}
            />
          ) : (
            <>
              <h2>Decision</h2>
              <p className="muted">
                Current status: <b>{STATUS_LABEL[request.status]}</b>. Only the CEO can approve,
                hold or reject this request.
              </p>
            </>
          )}

          {!me.isCeo && (
            <div className="upload-version">
              <h2>Upload updated document</h2>
              <UploadVersionForm requestId={request.id} nextVersion={request.currentVersion + 1} />
            </div>
          )}
        </aside>
      </div>

      {current && (
        <div className="admin-card cv-card">
          <div className="cv-card__head">
            <h2>Document (v{request.currentVersion})</h2>
            <div className="cv-card__actions">
              {currentUrl && (
                <a className="btn btn--ghost" href={currentUrl} target="_blank" rel="noopener noreferrer">
                  Open in new tab
                </a>
              )}
              {currentLinks?.downloadUrl && (
                <a className="btn btn--primary" href={currentLinks.downloadUrl}>
                  Download ({currentLinks.filename})
                </a>
              )}
            </div>
          </div>
          {currentUrl ? (
            <iframe className="cv-preview" src={currentUrl} title={`Document - ${request.title}`} />
          ) : (
            <p className="muted cv-card__note">Preview unavailable.</p>
          )}
        </div>
      )}

      <div className="admin-detail">
        <div className="admin-card">
          <h2>Document versions</h2>
          <div className="version-list">
            {docLinks.map((d) => (
              <div className="version-list__row" key={d.id}>
                <span>
                  <b>v{d.version}</b>
                  {d.version === request.currentVersion ? " (current)" : ""}
                </span>
                <span className="version-list__file">{d.filename}</span>
                <span className="muted">
                  {d.uploadedByUsername || "unknown"} · {fmt(d.uploadedAt)}
                </span>
                <span className="version-list__links">
                  {d.openUrl && (
                    <a href={d.openUrl} target="_blank" rel="noopener noreferrer">
                      Open
                    </a>
                  )}
                  {d.downloadUrl && <a href={d.downloadUrl}>Download</a>}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <h2>History</h2>
          <ol className="approval-timeline">
            {eventLinks.map((e) => (
              <li className={`approval-timeline__item approval-timeline__item--${e.kind}`} key={e.id}>
                <span className="approval-timeline__dot" aria-hidden="true" />
                <div>
                  <p>
                    <b>{EVENT_LABEL[e.kind]}</b>
                    {e.version ? ` (v${e.version})` : ""}
                  </p>
                  <p className="muted">
                    {e.actorUsername || "unknown"} · {fmt(e.createdAt)}
                  </p>
                  {e.note && <p className="approval-timeline__note">{e.note}</p>}
                  {e.signedUrl && (
                    <p>
                      <a href={e.signedUrl}>Signed copy of v{e.version}</a>
                      {(e.version !== request.currentVersion || request.status !== "approved") && (
                        <span className="muted"> (superseded)</span>
                      )}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {me.isSuperAdmin && (
        <div className="approval-danger">
          <DeleteRequestButton requestId={request.id} title={request.title} />
        </div>
      )}
    </div>
  );
}

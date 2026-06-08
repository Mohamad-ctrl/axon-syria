import type { Job } from "@/lib/jobs";

function Field({
  label,
  name,
  required,
  textarea,
  hint,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  textarea?: boolean;
  hint?: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div className="field">
      <label htmlFor={name}>
        {label}
        {required && <span className="req"> *</span>}
      </label>
      {textarea ? (
        <textarea id={name} name={name} required={required} placeholder={placeholder} defaultValue={defaultValue} />
      ) : (
        <input id={name} name={name} required={required} placeholder={placeholder} defaultValue={defaultValue} />
      )}
      {hint && <span className="field__hint">{hint}</span>}
    </div>
  );
}

/**
 * Shared English-only job form for both creating and editing.
 * `action` is the server action (createJob / updateJob); when `job` is given,
 * fields are pre-filled and a hidden slug identifies the row being edited.
 */
export default function JobForm({
  action,
  job,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  job?: Job;
  submitLabel: string;
}) {
  return (
    <form className="form" action={action}>
      {job && <input type="hidden" name="slug" value={job.slug} />}

      <Field label="Title" name="title" required defaultValue={job?.title.en} placeholder="e.g. Marketing Manager" />
      <Field label="Company" name="company" required defaultValue={job?.company.en} placeholder="e.g. Axon Contracting" />
      <Field label="Location" name="location" required defaultValue={job?.location.en} placeholder="e.g. Aleppo, Syria" />

      <div className="field">
        <label htmlFor="type">Type<span className="req"> *</span></label>
        <select id="type" name="type" required defaultValue={job?.type.en ?? "Full-time"}>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
        </select>
      </div>

      <Field
        label="Description"
        name="description"
        textarea
        hint="One paragraph per line."
        defaultValue={job?.description.en.join("\n")}
      />
      <Field
        label="Requirements"
        name="requirements"
        textarea
        hint="One item per line."
        defaultValue={job?.requirements.en.join("\n")}
      />

      <button className="btn btn--primary btn--lg" type="submit">{submitLabel}</button>
    </form>
  );
}

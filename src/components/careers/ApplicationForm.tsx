"use client";

import { useState } from "react";
import { Check } from "@/components/icons";
import type { Dictionary } from "@/i18n/dictionaries";

type Status = "idle" | "submitting" | "success" | "error";

export default function ApplicationForm({
  dict,
  jobSlug,
  jobTitle,
}: {
  dict: Dictionary["form"];
  jobSlug: string;
  jobTitle: string;
}) {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");

    const form = e.currentTarget;
    const data = new FormData(form);
    data.append("jobSlug", jobSlug);
    data.append("jobTitle", jobTitle);

    try {
      const res = await fetch("/api/applications", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error("failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="form__success">
        <div className="form__success-icon">
          <Check />
        </div>
        <h3>{dict.successTitle}</h3>
        <p className="muted">{dict.successText.replace("{title}", jobTitle)}</p>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      {status === "error" && <div className="alert alert--error">{dict.errorGeneric}</div>}

      <div className="form__row">
        <div className="field">
          <label htmlFor="firstName">{dict.firstName} <span className="req">*</span></label>
          <input id="firstName" name="firstName" autoComplete="given-name" required />
        </div>
        <div className="field">
          <label htmlFor="lastName">{dict.lastName} <span className="req">*</span></label>
          <input id="lastName" name="lastName" autoComplete="family-name" required />
        </div>
      </div>

      <div className="form__row">
        <div className="field">
          <label htmlFor="email">{dict.email} <span className="req">*</span></label>
          <input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="field">
          <label htmlFor="phone">{dict.phone} <span className="req">*</span></label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" required />
        </div>
      </div>

      <div className="field">
        <label htmlFor="coverLetter">{dict.coverNote}</label>
        <textarea id="coverLetter" name="coverLetter" placeholder={dict.coverPlaceholder} />
      </div>

      <div className="field">
        <label htmlFor="cv">{dict.cv} <span className="req">*</span></label>
        <input id="cv" name="cv" type="file" accept=".pdf,.doc,.docx" required />
        <span className="field__hint">{dict.cvHint}</span>
      </div>

      <button
        className="btn btn--primary btn--lg btn--block"
        type="submit"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? dict.submitting : dict.submit}
      </button>
    </form>
  );
}

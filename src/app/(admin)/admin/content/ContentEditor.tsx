"use client";

import { useActionState, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Field, Shape } from "@/lib/content-schema";
import { saveContentSection, resetContentSection, type ActionState } from "../content-actions";
import ImageField from "./ImageField";

type Path = (string | number)[];
const LOCALES = [
  { code: "en", label: "EN", rtl: false },
  { code: "ar", label: "ع", rtl: true },
  { code: "tr", label: "TR", rtl: false },
] as const;

const asStr = (v: unknown): string => (typeof v === "string" ? v : "");

function getIn(root: unknown, path: Path): unknown {
  let cur: unknown = root;
  for (const key of path) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string | number, unknown>)[key];
  }
  return cur;
}

function setIn(root: unknown, path: Path, val: unknown): unknown {
  if (path.length === 0) return val;
  const [head, ...rest] = path;
  if (typeof head === "number") {
    const arr = Array.isArray(root) ? [...root] : [];
    arr[head] = setIn(arr[head], rest, val);
    return arr;
  }
  const obj =
    root && typeof root === "object" && !Array.isArray(root)
      ? { ...(root as Record<string, unknown>) }
      : {};
  obj[head] = setIn(obj[head], rest, val);
  return obj;
}

function blankValue(field: Field): unknown {
  if (field.type === "list") return [];
  if ((field.type === "text" || field.type === "textarea") && field.i18n) return { en: "", ar: "", tr: "" };
  if (field.type === "select") return field.options[0]?.value ?? "";
  return "";
}
function blankItem(fields: Field[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) out[f.key] = blankValue(f);
  return out;
}

export default function ContentEditor({
  sectionId,
  label,
  description,
  shape,
  value,
}: {
  sectionId: string;
  label: string;
  description: string;
  shape: Shape;
  value: unknown;
}) {
  const [root, setRoot] = useState<unknown>(value);
  const [saveState, saveAction, saving] = useActionState<ActionState, FormData>(saveContentSection, {
    ok: false,
    message: "",
  });
  const [resetState, resetAction, resetting] = useActionState<ActionState, FormData>(resetContentSection, {
    ok: false,
    message: "",
  });

  // After a reset succeeds the override is gone; reload so the editor shows the
  // built-in defaults again.
  useEffect(() => {
    if (resetState.ok) window.location.reload();
  }, [resetState]);

  const update = (path: Path, val: unknown) => setRoot((r: unknown) => setIn(r, path, val));

  function renderScalar(field: Field, path: Path): ReactNode {
    const val = asStr(getIn(root, path));
    if (field.type === "image") {
      return <ImageField value={val} folder={field.folder} onChange={(url) => update(path, url)} />;
    }
    if (field.type === "select") {
      return (
        <select value={val} onChange={(e) => update(path, e.target.value)}>
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    }
    if (field.type === "color") {
      return (
        <div className="ce-color">
          <input type="color" value={val || "#3D55E0"} onChange={(e) => update(path, e.target.value)} />
          <input type="text" value={val} onChange={(e) => update(path, e.target.value)} />
        </div>
      );
    }
    const inputType = field.type === "tel" ? "tel" : field.type === "email" ? "email" : field.type === "url" ? "url" : "text";
    return <input type={inputType} value={val} onChange={(e) => update(path, e.target.value)} />;
  }

  function renderField(field: Field, path: Path): ReactNode {
    if (field.type === "list") {
      return renderList(field.itemLabel, field.itemFields, !!field.locked, path, field.label, field.hint);
    }

    return (
      <div className="ce-field" key={path.join(".")}>
        <label className="ce-field__label">{field.label}</label>
        {field.hint && <span className="field__hint">{field.hint}</span>}
        {(field.type === "text" || field.type === "textarea") && field.i18n ? (
          <div className="ce-langs">
            {LOCALES.map((loc) => {
              const lp = [...path, loc.code];
              const v = asStr(getIn(root, lp));
              return (
                <div className="ce-lang" key={loc.code}>
                  <span className="ce-lang__tag">{loc.label}</span>
                  {field.type === "textarea" ? (
                    <textarea dir={loc.rtl ? "rtl" : "ltr"} value={v} onChange={(e) => update(lp, e.target.value)} />
                  ) : (
                    <input dir={loc.rtl ? "rtl" : "ltr"} value={v} onChange={(e) => update(lp, e.target.value)} />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          renderScalar(field, path)
        )}
      </div>
    );
  }

  function renderList(
    itemLabel: string,
    itemFields: Field[],
    locked: boolean,
    path: Path,
    label?: string,
    hint?: string,
  ): ReactNode {
    const arr = (getIn(root, path) as unknown[]) ?? [];
    return (
      <div className="ce-list" key={path.join(".") || "root"}>
        {label && <label className="ce-field__label ce-list__label">{label}</label>}
        {hint && <span className="field__hint">{hint}</span>}
        {arr.map((_, i) => (
          <div className="ce-item" key={i}>
            <div className="ce-item__head">
              <span className="ce-item__title">
                {itemLabel} {i + 1}
              </span>
              <div className="ce-item__tools">
                <button
                  type="button"
                  className="ce-iconbtn"
                  disabled={i === 0}
                  title="Move up"
                  onClick={() => {
                    const next = [...arr];
                    [next[i - 1], next[i]] = [next[i], next[i - 1]];
                    update(path, next);
                  }}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="ce-iconbtn"
                  disabled={i === arr.length - 1}
                  title="Move down"
                  onClick={() => {
                    const next = [...arr];
                    [next[i + 1], next[i]] = [next[i], next[i + 1]];
                    update(path, next);
                  }}
                >
                  ↓
                </button>
                {!locked && (
                  <button
                    type="button"
                    className="ce-iconbtn ce-iconbtn--danger"
                    title="Remove"
                    onClick={() => {
                      const next = [...arr];
                      next.splice(i, 1);
                      update(path, next);
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            {itemFields.map((f) => renderField(f, [...path, i, f.key]))}
          </div>
        ))}
        {!locked && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => update(path, [...arr, blankItem(itemFields)])}>
            + Add {itemLabel.toLowerCase()}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="ce">
      <div className="admin-head">
        <p className="crumbs">
          <a href="/admin/content">Content</a> <span aria-hidden="true">/</span> {label}
        </p>
        <h1>{label}</h1>
        <p className="muted">{description}</p>
      </div>

      <form action={saveAction} className="ce-form">
        <input type="hidden" name="sectionId" value={sectionId} />
        <input type="hidden" name="value" value={JSON.stringify(root)} readOnly />

        {shape.kind === "object"
          ? shape.fields.map((f) => renderField(f, [f.key]))
          : renderList(shape.itemLabel, shape.itemFields, !!shape.locked, [])}

        <div className="ce-bar">
          <button className="btn btn--primary btn--lg" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
          {(saveState.message || resetState.message) && (
            <span className={`ce-msg ${(saveState.ok || resetState.ok) ? "ce-msg--ok" : "ce-msg--error"}`}>
              {saveState.message || resetState.message}
            </span>
          )}
        </div>
      </form>

      <form
        action={resetAction}
        className="ce-reset"
        onSubmit={(e) => {
          if (!window.confirm("Revert this section to the built-in default content? Your edits to it will be removed.")) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="sectionId" value={sectionId} />
        <button className="btn btn--ghost" type="submit" disabled={resetting}>
          {resetting ? "Reverting…" : "Reset to default"}
        </button>
      </form>
    </div>
  );
}

import type { Dictionary } from "@/i18n/dictionaries";

export default function Stats({ dict }: { dict: Dictionary["stats"] }) {
  return (
    <div className="container">
      <div className="stats stats--float reveal" aria-label="Key figures">
        {dict.map((s) => {
          const num = parseInt(s.value, 10);
          const suffix = s.value.replace(/[0-9]/g, "");
          return (
            <div className="stat" key={s.label}>
              <div className="stat__num">
                <span data-count={num} data-suffix={suffix}>
                  {s.value}
                </span>
              </div>
              <div className="stat__label">{s.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

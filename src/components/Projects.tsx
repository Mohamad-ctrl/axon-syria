import Image from "next/image";
import { featuredProjects, PROJECT_CAT } from "@/data/projects";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export default function Projects({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary["projects"];
}) {
  if (featuredProjects.length === 0) return null;
  return (
    <section className="section" id="projects">
      <div className="container">
        <div className="section-head reveal">
          <p className="eyebrow eyebrow--center">{dict.eyebrow}</p>
          <h2>{dict.title}</h2>
          <p className="lead">{dict.lead}</p>
        </div>
        <div className="grid grid-3">
          {featuredProjects.map((p) => (
            <article className="project-card reveal" key={p.img}>
              <Image
                className="project-card__img"
                src={p.img}
                alt={p[lang]}
                width={600}
                height={450}
              />
              <div className="project-card__meta">
                <span className="project-card__cat">
                  {PROJECT_CAT[p.kind][lang]}
                </span>
                <h3>{p[lang]}</h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Integrated, Shield, MapPin, Users } from "@/components/icons";
import type { Dictionary } from "@/i18n/dictionaries";

const icons = [Integrated, Shield, MapPin, Users];

export default function WhyAxon({ dict }: { dict: Dictionary["why"] }) {
  return (
    <section className="section section--dark" id="why">
      <div className="container">
        <div className="section-head reveal">
          <p className="eyebrow eyebrow--center eyebrow--light">{dict.eyebrow}</p>
          <h2>{dict.title}</h2>
        </div>
        <div className="grid grid-4">
          {dict.features.map((f, i) => {
            const Icon = icons[i] ?? Integrated;
            return (
              <div className="feature reveal" key={f.title}>
                <div className="feature__icon">
                  <Icon />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

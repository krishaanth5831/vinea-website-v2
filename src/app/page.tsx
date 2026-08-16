import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import WhoItsFor from "@/components/sections/WhoItsFor";
import Robot from "@/components/sections/Robot";
import BuildReel from "@/components/sections/BuildReel";
import Numbers from "@/components/sections/Numbers";
import Pilot from "@/components/sections/Pilot";
import Footer from "@/components/Footer";
import { CONTACT, GAP, MEASURED } from "@/lib/data";

const throughput = MEASURED.find((f) => f.id === "throughput")!;

/**
 * Structured data. Deliberately conservative: the only claims made to a search
 * engine are the ones the page itself makes, with the same hedges attached.
 */
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Vinea",
  url: "https://www.getvinea.nl",
  email: CONTACT.email,
  founder: { "@type": "Person", name: CONTACT.founder },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Westland",
    addressCountry: "NL",
  },
  description:
    `A pre-prototype modular robot for harvesting truss tomatoes in existing ` +
    `Dutch high-wire glasshouses, running on the pipe rail already in every ` +
    `aisle. Measured in simulation at ~${throughput.value} kg/hr on one arm ` +
    `against a target of ${GAP.targetWeekly} per robot per week; no hardware ` +
    `exists and no robot has run in a greenhouse.`,
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <main id="main">
        <Hero />
        <Problem />
        <WhoItsFor />
        <Robot />
        <BuildReel />
        <Numbers />
        <Pilot />
      </main>
      <Footer />
    </>
  );
}

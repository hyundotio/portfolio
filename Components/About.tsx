import styles from "./About.module.scss";

const aboutParagraphs = [
  "I make hard technical systems visible, testable, explainable, and usable enough for people to make decisions with them.",
  "At Kayhan Space, I lead hands-on product systems work across orbital-operations workflows, UX, data visualization, frontend architecture, AI-native tooling, and technical product strategy.",
  "Previously, I was the first product designer at HawkEye 360 and spent six years at IBM, including three years with IBM Research. Across space, RF intelligence, AI, quantum, cybersecurity, robotics, and emerging interfaces, my work has focused on turning technically novel systems into products, prototypes, and explanations people can understand and act on.",
  "My research and patent portfolio across HCI, cybersecurity, cryptography, robotics, quantum, and emerging interfaces has been cited 220+ times.",
];

const legalText =
  "© 2026 Hyun Seo. All rights reserved. Company names, product names, trademarks, and logos mentioned on this site are the property of their respective owners and are used for identification purposes only. This site is not affiliated with or endorsed by those companies unless stated otherwise.";

export default function About() {
  return (
    <section className={styles.about} aria-labelledby="about-title">
      <h2 id="about-title">About</h2>
      <div className={styles.body}>
        {aboutParagraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <p className={styles.legal}>{legalText}</p>
    </section>
  );
}

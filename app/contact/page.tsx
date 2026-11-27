import type { Metadata } from "next";
import { links } from "@/content/site";
import { buildSocialMetadata } from "@/utils/metadata";
import ContactForm from "./ContactForm";

const description = "Get in touch with Hyun Seo.";

export const metadata: Metadata = {
  title: "Contact",
  description,
  ...buildSocialMetadata({ title: "Contact", description, path: "/contact" }),
};

export default function ContactPage() {
  return (
    <>
      <header className="page-head grid">
        <h1 className="display col-display">Get in touch</h1>
      </header>

      <section className="section grid" aria-label="Contact form">
        <p className="col-label muted">
          Or find me on{" "}
          <a href={links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>{" "}
          or{" "}
          <a href={links.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          .
        </p>
        <div className="col-text">
          <ContactForm />
        </div>
      </section>
    </>
  );
}

"use client";

import { useState } from "react";
import styles from "./Contact.module.scss";

export default function ContactForm() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (res.ok) setStatus("success");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Get in touch</h2>
      <div className={styles.field}>
        <label htmlFor="name">NAME</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          placeholder="Your name..."
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="email">EMAIL</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          placeholder="hi@example.com"
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="message">MESSAGE</label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Tell me about your project..."
        />
      </div>
      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "DISPATCHING..." : "SEND MESSAGE"}
      </button>
      {status === "success" && (
        <p className={styles.success}>Message sent successfully.</p>
      )}
      {status === "error" && (
        <p className={styles.error}>Something went wrong.</p>
      )}
    </form>
  );
}

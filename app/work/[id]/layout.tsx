import styles from "@/app/layout.module.scss";

export default function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={styles["wrapper"]}>{children}</div>;
}

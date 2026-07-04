import styles from "@/Views/Footer.module.scss";

const Footer = () => {
  return (
    <footer className={styles["container"]}>
      {new Date().getUTCFullYear()}
      {` Copyright Hyun.io`}
    </footer>
  );
};

Footer.displayName = "Footer";
export default Footer;

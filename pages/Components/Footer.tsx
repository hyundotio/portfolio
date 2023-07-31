import styles from './Footer.module.scss';
import List from './List';
import TextLink from './TextLink';

const Footer = () => {
    return (
        <footer className={styles["footer-container"]}>
            <div className={`content-container ${styles["footer-contents"]}`}>
                <div className={styles["footer-reserved"]}>
                    <TextLink isInternalLink kind="white" href="" text="hyun.io" />
                    <span>it's {new Date().getFullYear()}</span>
                </div>
                <div />
                <List  
                    id="footer-list-1"
                    title="hyun.io"
                    type="plain"
                    header={6}
                    content={[
                        <TextLink isInternalLink kind="white" href="/" text="/ Homepage" />,
                        <TextLink isInternalLink kind="white" href="/me" text="/ Me" />,
                        <TextLink isInternalLink kind="white" href="/workroom" text="/ Workroom" />,
                        <TextLink isInternalLink kind="white" href="/privacy" text="/ Privacy policy" />
                    ]}
                />
                <List  
                    id="footer-list-2"
                    title="Workroom"
                    type="plain"
                    header={6}
                    content={[
                        <TextLink isInternalLink kind="white" href="/workroom/kayhan-space" text="/ Kayhan Space" />,
                        <TextLink isInternalLink kind="white" href="/workroom/hawkeye-360" text="/ HawkEye 360" />,
                        <TextLink isInternalLink kind="white" href="/workroom/ibm" text="/ IBM" />,
                        <TextLink isInternalLink kind="white" href="/workroom/odds-and-ends" text="/ Odds & Ends" />
                    ]}
                />
            </div>
        </footer>
    )
}

export default Footer;
import styles from './404.module.scss';

const Page = () => {
    return (
        <div className={styles['missing-page-container']}>
            <h1 className={styles['glitch']}>
                <span aria-hidden="true">Page not found</span>
                Page not found
                <span aria-hidden="true">Page not found</span>
            </h1>
        </div>
    )
}

export default Page
import React from 'react';
import styles from './404.module.scss';
import { UrlStateContext, UrlStateContextType } from './_app';

const Page = () => {

    const { setUrls, baseUrl } = React.useContext(UrlStateContext) as UrlStateContextType;
  
    React.useEffect(() => {
        setUrls([baseUrl,'404']);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
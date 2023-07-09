import React from 'react';
import styles from './Breadcrumbs.module.scss';
import { UrlStateContext, UrlStateContextType } from '../_app';
import TextLink from './TextLink';

const Breadcrumbs = () => {
    const { urls, baseUrl } = React.useContext(UrlStateContext) as UrlStateContextType;

    return (
        <nav className={styles['breadcrumbs-container']}>
            <div className={styles['breadcrumbs']}>
                <ul>
                    {
                        urls.map((url, i) => {
                            if ((urls.length === 1 && i === 0) || urls.length - 1 === i) {
                                return <li key={`breadcrumb-${i}`}>{url}</li>
                            }
                            let localUrl = urls.slice(0,i+1).join('/').toLowerCase().replace(baseUrl.toLowerCase(), '').replace(/ /g,"-");
                            localUrl = localUrl ? localUrl : '/';
                            return <li key={`breadcrumb-${i}`}><TextLink isInternalLink href={localUrl} text={url}></TextLink></li>
                        })
                    }
                </ul>
                <aside>
                    v1.0 
                </aside>
            </div>
      </nav>
    )
}

export default Breadcrumbs


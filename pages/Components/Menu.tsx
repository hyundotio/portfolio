import React from 'react';
import List from './List';
import styles from './Menu.module.scss';
import TextLink from './TextLink';
import { useRouter } from 'next/router'

interface Props {
    active?: boolean;
    setActive: (value: boolean) => void;
}

const Menu = React.forwardRef<HTMLDivElement, Props>((props, ref) => {
    const router = useRouter();
    const pathname = router.pathname.toLowerCase();

    return (
        <div className={`${styles['menu-container']}${props.active ? ` ${styles['active']}` : ''}`} ref={ref}>
            <div className={`${styles['menu-contents']}`}>
                <div className={`${styles['padded-container']}`}>
                    <div className={`text_l sections-container`}>
                        <List  
                            id="nav-list-1"
                            type="plain"
                        >
                            <TextLink
                                className={'/' === pathname ? styles['active-link'] : ''}
                                isInternalLink
                                href="/"
                                text="Landing page"
                                onClick={() => props.setActive(false)}
                            />
                            <TextLink
                                className={pathname.indexOf('workroom') > -1 ? styles['active-link'] : ''}
                                isInternalLink
                                href="/workroom"
                                text="Workroom"
                                onClick={() => props.setActive(false)}
                            />
                            <List
                                id="nav-list-2"
                                type="plain"
                                isNested
                            >
                                <TextLink
                                    className={'/workroom/kayhan-space' === pathname ? styles['active-link'] : ''}
                                    isInternalLink
                                    href="/workroom/kayhan-space"
                                    text="Kayhan Space"
                                    onClick={() => props.setActive(false)}
                                />
                                <TextLink
                                    className={'/workroom/hawkeye-360' === pathname ? styles['active-link'] : ''}
                                    isInternalLink
                                    href="/workroom/hawkeye-360"
                                    text="HawkEye 360"
                                    disabled
                                    onClick={() => props.setActive(false)}
                                />
                                <TextLink
                                    className={'/workroom/ibm' === pathname ? styles['active-link'] : ''}
                                    isInternalLink
                                    href="/workroom/ibm"
                                    text="IBM"
                                    disabled
                                    onClick={() => props.setActive(false)}
                                />
                                <TextLink
                                    className={'/workroom/odds-and-ends' === pathname ? styles['active-link'] : ''}
                                    isInternalLink
                                    href="/workroom/odds-and-ends"
                                    text="Odds & Ends"
                                    disabled
                                    onClick={() => props.setActive(false)}
                                />
                            </List>
                            <TextLink
                                isInternalLink
                                href="/me"
                                text="Me"
                                disabled
                                onClick={() => props.setActive(false)}
                            />
                        </List>
                        
                    </div>
                </div>
            </div>
        </div>
        
    )
});
Menu.displayName = 'Menu';

export default Menu;
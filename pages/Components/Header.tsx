import ArrowLeftIcon from '../Assets/Arrow--Left.svg'
import MenuIcon from '../Assets/Menu.svg'
import EmailIcon from '../Assets/Email.svg'
import PopupIcon from '../Assets/Popup.svg'
import LightModeIcon from '../Assets/LightMode.svg'
import DarkModeIcon from '../Assets/DarkMode.svg'
import ExitIcon from '../Assets/Exit.svg'
import React from 'react'
import { MenuStateContext, MenuStateContextType, ThemeContext, ThemeContextType, UrlStateContext, UrlStateContextType } from '../_app'
import { useRouter } from 'next/router'
import styles from './Header.module.scss';
import List from './List'
import TextLink from './TextLink'
import IconButton from './IconButton'
import { parseUrls } from '../../utils/parseUtil'
import Menu from './Menu'
import useOutsideClick from './Utilities/UseOutsideClick'

const Header = () => {
    const { urls, baseUrl } = React.useContext(UrlStateContext) as UrlStateContextType;
    const { themeClassName, setThemeClassName } = React.useContext(ThemeContext) as ThemeContextType;
    const { menuOpened, setMenuOpened } = React.useContext(MenuStateContext) as MenuStateContextType;

    const [menuOpenedCount, setMenuOpenedCount] = React.useState(-1);
    const router = useRouter();
    const menuRef = React.useRef<HTMLDivElement>(null);

    const isHome = urls.length === 1;

    React.useEffect(() => {
        if (menuOpened === true) {
            setMenuOpenedCount((val) => val + 1);
        }
        if (menuOpened === false) {
            setMenuOpenedCount(-1);
        }
    }, [menuOpened])
    
    useOutsideClick(menuRef, () => {
        if (menuOpened) {
            setMenuOpenedCount((val) => val + 1);
            if (menuOpenedCount > 0) {
                setMenuOpened(false);
            }
        }
    });
    
    return (
        <header className={styles["header-container"]}>
            <div className={styles["header-menu"]}>
                {
                    isHome ? <div /> :
                    //Empty div to keep menu button on the right (because of space-between)
                    <IconButton
                        icon={<ArrowLeftIcon />}
                        kind="header-back"
                        onClick={() => { router.push(parseUrls(urls, baseUrl)) }}
                    />
                }
                
                <div className={styles["header-actions"]}>
                    <IconButton
                        icon={themeClassName === 'light' ? <LightModeIcon /> : <DarkModeIcon />}
                        onClick={() => setThemeClassName(themeClassName === 'light' ? 'dark' : 'light')}
                        kind="header"
                    />
                    <IconButton
                        icon={menuOpened ? <ExitIcon /> : <MenuIcon />}
                        onClick={() => setMenuOpened(!menuOpened)}
                        kind="header"
                    />
                </div>
            </div>
            <Menu ref={menuRef} active={menuOpened} setActive={setMenuOpened} />
            <div className={`${styles['content-header']}${isHome ? ` ${styles['home']}` : ''}`}>
                <h1>
                    {
                        isHome ? 
                        <span>
                            {urls[0]}
                        </span> :
                        <>
                            <span>{urls[urls.length - 2]}/</span>
                            <br />
                            <span>{urls[urls.length - 1]}</span>
                        </>
                    }
                </h1>
                <aside>
                    <List
                        type="plain"
                        id="header-1"
                        content={[
                            <span>Hyun Seo</span>,
                            <TextLink href="mailto:hi@hyun.io" text="hi@hyun.io" icon={<EmailIcon />} />,
                            <TextLink href="#" text="4096R/33121E42" icon={<PopupIcon />} />
                        ]}
                    />
                    <List
                        type="plain"
                        id="header-2"
                        content={[
                            <span>UTC/Z +5 EST</span>,
                            <span>S.E. Pennsylvania, USA</span>
                        ]}
                    />
                </aside>
            </div>
        </header>
    )
}

export default Header


import './reset.css';
import './globals.scss';
import { AppProps } from 'next/app';
import Head from 'next/head';
import React from 'react';
import Breadcrumbs from './Components/Breadcrumbs';
import Header from './Components/Header';
import Footer from './Components/Footer';
import RealFooter from './Components/RealFooter';
import ZoomedImage from './Components/ZoomedImage';

type ZoomedImage = {
    src: string,
    alt: string
}

export type ThemeContextType = {
    themeClassName: string,
    setThemeClassName: (val: string) => void;
    setLockScroll: (val: boolean) => void;
    setBlurred: (val: boolean) => void;
}

export type UrlStateContextType = {
    baseUrl: string,
    urls: string[],
    setUrls: (val: string[]) => void;
}

export type MenuStateContextType = {
    menuOpened: boolean,
    setMenuOpened: (val: boolean) => void;
}

export type ZoomedImageContextType = {
    setZoomedImage: (val: ZoomedImage) => void;
}

export const ThemeContext = React.createContext<ThemeContextType | null>(null);
export const MenuStateContext = React.createContext<MenuStateContextType | null>(null);
export const UrlStateContext = React.createContext<UrlStateContextType | null>(null);
export const ZoomedImageContext = React.createContext<ZoomedImageContextType | null>(null);

const baseUrl = `hyun.io`;

const websiteInfo = {
    title: `Hyun's Portfolio`,
    description: `Hyun's website.`,
    url: `https://${baseUrl}`
}

function Hyun({ Component, pageProps }: AppProps) {
    const [menuOpened, setMenuOpened] = React.useState(false);
    const [themeClassName, setThemeClassName] = React.useState('light');
    const [blurred, setBlurred] = React.useState(false);
    const [lockScroll, setLockScroll] = React.useState(false);
    const [urls, setUrls] = React.useState(['hyun.io']);
    const [zoomedImage, setZoomedImage] = React.useState<ZoomedImage | null>(null);

    React.useEffect(() => {
        let bodyClassName = '';
        if (themeClassName === 'light') {
            bodyClassName += 'light';
        } else {
            bodyClassName += 'dark';
        }
        if (lockScroll) {
            bodyClassName += ' scroll-locked';
        }
        document.getElementsByTagName('body')[0].className = bodyClassName;
    }, [themeClassName, lockScroll]);

    function closeZoomedImage() {
        setBlurred(false);
        setLockScroll(false);
        setZoomedImage(null);
    }

    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" key="viewport" />
                <meta property="og:type" content="website" key="ogtype" />
                <title key="title">{websiteInfo.title}</title>
                <link rel="canonical" href={websiteInfo.url} key="canonical" />
                <meta name="twitter:title" content={websiteInfo.title} key="twname" />
                <meta property="og:title" content={websiteInfo.title} key="ogtitle" />
                <meta name="description" content={websiteInfo.description} key="desc" />
                <meta name="og:description" content={websiteInfo.description} key="ogdesc" />
                <meta name="twitter:description" content={websiteInfo.description} key="twdesc" />
                <meta property="og:url" content={websiteInfo.url} key="ogurl" />
                <meta property="og:image" content={`${websiteInfo.url}/og.png`} key="ogimg" />
                <meta name="twitter:image" content={`${websiteInfo.url}/og.png`} key="twimg" />
                <meta name="twitter:card" content="summary_large_image" key="twlrgimg" />
                {
                    themeClassName !== 'dark' ?
                        <link rel="icon" href="/favicon.ico" key="favicon" /> :
                        <link rel="icon" href="/dark_favicon.ico" key="favicon" />
                }
                {
                    themeClassName !== 'dark' ?
                        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" /> :
                        <link rel="apple-touch-icon" sizes="180x180" href="/dark_apple-touch-icon.png" />
                }
                {
                    themeClassName !== 'dark' ?
                        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" /> :
                        <link rel="icon" type="image/png" sizes="32x32" href="/dark_favicon-32x32.png" />
                }
                {
                    themeClassName !== 'dark' ?
                        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" /> :
                        <link rel="icon" type="image/png" sizes="16x16" href="/dark_favicon-16x16.png" />
                }
                {
                    themeClassName !== 'dark' ?
                        <link rel="manifest" href="/site.webmanifest" /> :
                        <link rel="manifest" href="/dark_site.webmanifest" />
                }
                {
                    themeClassName !== 'dark' ?
                        <meta name="theme-color" content="#F4F4F4" key="themecolor" /> :
                        <meta name="theme-color" content="#262626" key="themecolor" />
                }
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            </Head>
            <UrlStateContext.Provider value={{ baseUrl, urls, setUrls }}>
                <MenuStateContext.Provider value={{ menuOpened, setMenuOpened }}>
                    <ThemeContext.Provider value={{ themeClassName, setThemeClassName, setLockScroll, setBlurred }}>
                        <ZoomedImageContext.Provider value={{ setZoomedImage }}>
                            <div className={`b${blurred ? ' blurred' : ''}`}>
                                <Breadcrumbs />
                                <div className="master-container">
                                    <main className="content-container">
                                        <Header />
                                        <Component {...pageProps} />
                                    </main>
                                    <Footer />
                                    <RealFooter />
                                </div>
                            </div>
                            {
                                blurred && zoomedImage ? 
                                <ZoomedImage
                                    src={zoomedImage.src}
                                    alt={zoomedImage.alt}
                                    closeFunction={closeZoomedImage}
                                /> : null
                            }
                        </ZoomedImageContext.Provider>
                    </ThemeContext.Provider>
                </MenuStateContext.Provider>
            </UrlStateContext.Provider>
        </>  
    )
}

export default Hyun;
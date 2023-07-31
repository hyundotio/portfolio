import React from 'react'
import { UrlStateContext, UrlStateContextType } from '../_app'
import Description from '../Components/Description';
import TwoColSection from '../Sections/TwoColSection';
import Separator from '../Components/Separator';
import TwoColTextSection from '../Sections/TwoColTextSection';
import List from '../Components/List';
import Media from '../Components/Media';
import LayeredButton from '../Components/LayeredButton';
import PopupIcon from '../Assets/Popup.svg'
import NextImageBlurred from '../Components/BlurImage';
import Head from 'next/head';

export default function Workroom() {
  
  const { setUrls, baseUrl } = React.useContext(UrlStateContext) as UrlStateContextType;

  const websiteInfo = {
    title: `Hyun's involvement at Kayhan Space`,
    url: `https://${baseUrl}/workroom/kayhan-space`,
    description: 'This is where Hyun talks about stuff he did at Kayhan Space from 2021 to 2023.'
  }
  
  React.useEffect(() => {
    setUrls([baseUrl,'Workroom','Kayhan Space']);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
        <Head>
            <title key="title">{websiteInfo.title}</title>
            <link rel="canonical" href={websiteInfo.url} key="canonical" />
            <meta name="twitter:title" content={websiteInfo.title} key="twname" />
            <meta property="og:title" content={websiteInfo.title} key="ogtitle" />
            <meta name="description" content={websiteInfo.description} key="desc" />
            <meta name="og:description" content={websiteInfo.description} key="ogdesc" />
            <meta name="twitter:description" content={websiteInfo.description} key="twdesc" />
        </Head>
        <div className="sections-container">
            <TwoColSection
                colLeft={
                    <div className="image-col logo">
                        <NextImageBlurred
                            src="/assets/kayhan-space/logo.png"
                            alt="Logo for Kayhan Space"
                            fill
                        />
                    </div>
                }
                colRight={
                    <>
                        <div className="row">
                            <Description
                                title="What is Kayhan Space?"
                                content={
                                    <>
                                        <p>
                                            The company exists to alert satellite operators of impending conjunctions and recommendations to mitigate them. As of July 2023, Kayhan Space is a company focused on spaceflight safety. More specifically, satellite collisions.
                                        </p>
                                        <p>
                                            There are a lot of satellites (that are both maneuverable and non-manevuerable) and debris oribitng our planet really fast. 
                                        </p>
                                    </>
                                }
                            />
                        </div>
                        <div className="row">
                            <Description
                                title="Why Kayhan Space?"
                                content={`Greenfield everything in a space company that is focused on capability and scaleability. Pretty cool stuff.`}
                            />
                        </div>
                        <div className="row">
                            <Description
                                title="When did I join Kayhan Space?"
                                content={`November 2021 - Current`}
                            />
                        </div>
                    </>
                }
            />
            <Separator />
            <TwoColTextSection
                title={`What did I do at Kayhan Space?`}
                content={
                    <>
                        <p>
                            {`As the first design talent, I got to not only design interfaces, but be part of the product strategy and development. From verbal ideation to implementing Amazon's PRFAQ product development process to make the idea a reality and of course, designing the product and developing it.`}
                            <br />
                            <br />
                            {`On top of all this, I rebranded the entire visual identity of the company that follows the look and feel of the product.`}
                        </p>
                    </>
                }
            />
            <List
                title='Tools used'
                id={'ks-tools-list'}
            >
                <>{`TypeScript and SASS`}</>
                <>{`Strapi, NextJS, and React`}</>
                <>{`Figma, Illustrator`}</>
                <>{`After Effects`}</>
                <>{`Photoshop`}</>
            </List>
            <Media
                title={'Artifacts'}
                bgColor='#7D48ED'
                content={[
                    {
                        title: 'Screenshot',
                        caption: 'This is a screenshot of Pathfinder. I have used IBM Carbon as the primary component library and have created extensive custom components to suit Pathfinder.',
                        src: '/images/kayhan.png'
                    },
                    {
                        title: 'Screenshot',
                        caption: 'This is a screenshot of Mission Space, a geospatial intelligence tool to allow intelligence analysts to gather insights from proprietary data collected from HawkEye 360 satellites.',
                        src: '/images/hawkeye360.png'
                    },
                    {
                        title: 'Screenshot',
                        caption: 'This is a photo of an event space installation for Project Debater. It is an AI that humans can debate with. I designed the app that allow users to submit and track their pro or con comment for a given prompt. Complete with the tracker event display for the live event.',
                        src: '/images/ibm.jpg'
                    }
                ]}
            />
            <TwoColSection
                  colLeft={
                    <List
                        title='Links'
                        type="buttons"
                        id="kayhan-links"
                    >
                        <LayeredButton
                            text="Corporate website"
                            icon={<PopupIcon />}
                            href={'https://kayhan.space'}
                            openNewTab
                        />
                        <LayeredButton
                            text="Corporate LinkedIn"
                            icon={<PopupIcon />}
                            href={'https://www.linkedin.com/company/kayhan-space'}
                            openNewTab
                        />
                    </List>
                  }
            />
        </div>
    </>
  )
}

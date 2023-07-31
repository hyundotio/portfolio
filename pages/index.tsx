import TwoColSection from './Sections/TwoColSection'
import LayeredButton from './Components/LayeredButton'
import ArrowRightIcon from './Assets/Arrow--Right.svg'
import DownloadIcon from './Assets/Download.svg'
import SingleColSection from './Sections/SingleColSection'
import Description from './Components/Description'
import List from './Components/List'
import React from 'react'
import { UrlStateContext, UrlStateContextType } from './_app'
import styles from './index.module.scss';
import { useRouter } from 'next/router'

export default function Home() {
  
  const router = useRouter();
  const { setUrls, baseUrl } = React.useContext(UrlStateContext) as UrlStateContextType;
  
  React.useEffect(() => {
    setUrls([baseUrl]);
  }, [])
  
  return (
    <>
      <div className="sections-container">
        <TwoColSection
          colLeft={
            <Description
              title={`TL;DR`}
              content={`Hello I'm Hyun. I am a product designer and a "creative developer". At the moment, I think and make things at Kayhan Space.`}
            />
          }
        />
        <SingleColSection
          content={
            <div className="spread-v">
              <div className={`row ${styles['home-message']}`}>
                <Description
                  isLarge
                  title="Self"
                  content={`Okay, this website is not finished right now. Only one page works (Kayhan Space), it is not mobile friendly, and it's exists to test out all the components I am making. Will you read this before you judge? Only you'll know.`}
                />
              </div>
              <div className="row">
                <TwoColSection
                  colLeft={
                    <List
                      type="buttons"
                      id="home-cta"
                      content={[
                        <LayeredButton
                          text="More about me (Disabled test)"
                          icon={<ArrowRightIcon />}
                          disabled
                        />,
                        <LayeredButton
                          text="Download Resume (.pdf)"
                          icon={<DownloadIcon />}
                          href={'./dl/resume.pdf'}
                          openNewTab
                        />
                      ]}
                    />
                  }
                />
              </div>
            </div>
          }
        />
      </div>
    </>
  )
}

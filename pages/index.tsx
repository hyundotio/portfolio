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

export default function Home() {
  
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
              content={`Qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam.`}
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
                  content={`At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.`}
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
                          text="More about me"
                          icon={<ArrowRightIcon />}
                        />,
                        <LayeredButton
                          text="Download Resume (.pdf)"
                          icon={<DownloadIcon />}
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

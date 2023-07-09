import React from 'react'
import { UrlStateContext, UrlStateContextType } from '../_app'
import Description from '../Components/Description';
import TwoColSection from '../Sections/TwoColSection';
import Separator from '../Components/Separator';
import TwoColTextSection from '../Sections/TwoColTextSection';
import List from '../Components/List';

export default function Workroom() {
  
  const { setUrls, baseUrl } = React.useContext(UrlStateContext) as UrlStateContextType;
  
  React.useEffect(() => {
    setUrls([baseUrl,'Workroom','Kayhan Space']);
  }, [])

  return (
    <>
        <div className="sections-container">
            <TwoColSection
                colLeft={
                    <div className="image-col" style={{backgroundColor: '#7D48ED'}} />
                }
                colRight={
                    <>
                        <div className="row">
                            <Description
                                title="What is Kayhan Space?"
                                content={`Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates.`}
                            />
                        </div>
                        <div className="row">
                            <Description
                                title="Why Kayhan Space?"
                                content={`Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates.`}
                            />
                        </div>
                        <div className="row">
                            <Description
                                title="When did I join Kayhan Space?"
                                content={`Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates.`}
                            />
                        </div>
                    </>
                }
            />
            <Separator />
            <TwoColTextSection
                title={`What did I do at Kayhan Space?`}
                content={`
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui of.
                `}
            />
            <Separator />
            <List
                title='Tools used'
                content={[
                    'VSCode (TypeScript, SASS, NodeJS, Python)',
                    'Strapi, NextJS, React',
                    'Figma',
                    'After Effects',
                    'Photoshop',
                    'VMWare'
                ]}
                id={'ks-tools-list'}
            />
        </div>
    </>
  )
}

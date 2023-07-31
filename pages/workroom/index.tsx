import React from 'react'
import CountdownImageList from '../Sections/CountdownImageList'
import { UrlStateContext, UrlStateContextType } from '../_app'

export default function Workroom() {
  
  const { setUrls, baseUrl } = React.useContext(UrlStateContext) as UrlStateContextType;
  
  React.useEffect(() => {
    setUrls([baseUrl,'Workroom']);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div className="sections-container">
        <CountdownImageList
          projects={[
            {
              backgroundColor: '#7D48ED',
              imageSrc: '/images/kayhan.png',
              imageCaption: 'Lorem ipsum',
              title: 'Kayhan Space (Space)',
              timeRange: '2022 Nov - Current',
              tldr: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti.',
              summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore eh dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit en voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui of.',
              href: '/workroom/kayhan-space'
            },
            {
              href: '/workroom/hawkeye-360',
              backgroundColor: '#FF8717',
              imageSrc: '/images/hawkeye360.png',
              imageCaption: 'Lorem ipsum',
              title: 'HawkEye 360 (Defense)',
              timeRange: '2020 Jan - 2022 Nov',
              tldr: 'Literally JOMO bespoke af vaporware chillwave big mood chia shaman gochujang ea. Artisan cillum fingerstache austin listicle excepteur pop-up.',
              summary: 'Kickstarter echo park letterpress, thundercats fixie banh mi heirloom. Lomo PBR&B 3 wolf moon cardigan iceland, la croix single-origin coffee heirloom. Slow-carb waistcoat aesthetic, kinfolk dreamcatcher hell of affogato gastropub freegan cronut. Ramps heirloom small batch, seitan pinterest flexitarian yr offal sartorial butcher austin poutine try-hard mlkshk JOMO. Copper mug disrupt vice mumblecore paleo. Leggings farm-to-table plaid chartreuse hexagon subway tile fixie activated charcoal typewriter slow-carb kogi godard gluten-free.'
            },
            {
              href: '/workroom/ibm',
              backgroundColor: '#1F70C1',
              imageSrc: '/images/ibm.jpg',
              imageCaption: 'Lorem ipsum',
              title: 'IBM (Cybersecurity + R&D)',
              timeRange: '2013 Jun - 2019 Dec',
              tldr: 'Hexagon chicharrones cliche beard deep v tousled, post-ironic enamel pin direct trade listicle enim. Gluten-free tousled magna mlkshk literally.',
              summary: `90's occupy mlkshk yuccie small batch polaroid squid taiyaki, fashion axe actually meh heirloom health goth yes plz etsy. Venmo sustainable intelligentsia chambray bruh cornhole XOXO. Pour-over meh offal hoodie taxidermy tousled franzen pickled praxis taiyaki cardigan. Lumbersexual godard cred blog. Shabby chic actually pitchfork kickstarter retro. Yes plz fanny pack celiac hell of, unicorn before they sold out lomo messenger bag.`
            },
            {
              href: '/workroom/odds-and-ends/',
              backgroundColor: '#0028B6',
              imageSrc: '/images/oddsandends.jpg',
              imageCaption: 'Lorem ipsum',
              title: 'Odds & Ends (Stuff)',
              timeRange: 'Timeless',
              tldr: ' Bicycle rights dolor helvetica ugh, farm-to-table praxis quis cred raw denim sriracha asymmetrical.',
              summary: `YOLO umami man braid dreamcatcher fanny pack hella enamel pin scenester master cleanse tumblr air plant la croix raw denim. Neutral milk hotel cred banjo, bicycle rights sus migas DIY disrupt vinyl chicharrones gentrify paleo. Narwhal coloring book hella hammock, yes plz squid bruh yr tumeric man braid health goth food truck la croix green juice. Ascot pickled waistcoat, activated charcoal tousled sartorial distillery kale chips.`
            }
          ]}
        />
      </div>
    </>
  )
}

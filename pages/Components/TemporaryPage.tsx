import List from './List';
import styles from './RealFooter.module.scss';
import TextLink from './TextLink';

interface Props {
    fullscreen?: boolean;
}

const TemporaryPage = (props: Props) => {
    return (
        <div className={`${styles['real-footer-container']} ${props.fullscreen ? styles['fullscreen'] : ''}`}>
            <div className={`${styles['real-footer-contents']} content-container`}>
                <div className="text_l">
                    <List
                        id="real-footer-id"
                        type='plain'
                    >
                        <div>
                            {`Page under construction`}<br />
                            {`Contact Hyun for a .pdf Portfolio`}<br /><br />
                        </div>
                        <TextLink
                            kind='white'
                            text="[Portfolio] Contact for .pdf portfolio"
                            href="#"
                            disabled
                        />
                        <TextLink
                            kind='white'
                            href="/dl/resume.pdf"
                            text="[Resume] Download .pdf"
                        />
                        <TextLink
                            kind='white'
                            href="mailto:hi@hyun.io"
                            text="[Email] hi@hyun.io"
                        />
                        <TextLink
                            kind='white'
                            href="https://www.linkedin.com/in/hyunseo"
                            text="[Social] LinkedIn"
                        />
                        <TextLink
                            kind='white'
                            href="https://github.com/hyundotio/portfolio"
                            text="[Source] GitHub"
                        />
                    </List>
                </div>
            </div>
        </div>
    )
}

export default TemporaryPage;
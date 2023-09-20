import List from './List';
import styles from './RealFooter.module.scss';
import TextLink from './TextLink';

interface Props {
    fullscreen?: boolean;
}

const RealFooter = (props: Props) => {
    return (
        <div className={`${styles['real-footer-container']} ${props.fullscreen ? styles['fullscreen'] : ''}`}>
            <div className={`${styles['real-footer-contents']} content-container`}>
                <div className="text_l">
                    <List
                        id="real-footer-id"
                        type='plain'
                    >
                        {`In case you missed it...`}
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

export default RealFooter;
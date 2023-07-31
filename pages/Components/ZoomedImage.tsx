import NextImageBlurred from "./BlurImage";
import IconButton from "./IconButton";
import ExitIcon from '../Assets/Exit.svg'
import styles from './ZoomedImage.module.scss';

interface Props {
    src: string,
    alt: string,
    closeFunction: () => void;
}

const ZoomedImage = (props: Props) => {
    return (
        <div className={styles['blur-shield']}>
            <NextImageBlurred
                fill
                src={props.src}
                alt={props.alt}
            />
            <IconButton
                icon={<ExitIcon />}
                onClick={() => props.closeFunction()}
                classNames={styles['close-button']}
            />
        </div>
    )
}

export default ZoomedImage;
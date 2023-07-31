import styles from './LayeredButton.module.scss';
import NotAllowedIcon from '../Assets/NotAllowed.svg'

interface Props {
    text: string
    icon: JSX.Element
    active?: boolean
    fastForward?: boolean
    onClick?: React.MouseEventHandler
    href?: string
    download?: boolean
    openNewTab?: boolean
    disabled?: boolean
}

const LayeredButton = (props: Props) => {
    return (
        props.href ? 
            <a 
                href={props.href}
                onClick={props.onClick}
                download={props.download}
                target={props.openNewTab ? '_blank' : undefined}
                rel={props.openNewTab ? "noopener noreferrer" : ''}
                className={`${styles["layered-button"]}${props.disabled ? ` ${styles['disabled']}` : ''}${props.active ? ` ${styles["active"]} active`: ''}${props.fastForward ? ` fast-forward` : ''}`}
            >
                <span className={`${styles["layer-1"]} layer-1`}>
                    {props.text}
                    {props.disabled ? <NotAllowedIcon /> : props.icon}
                </span>
                <span className={`${styles["layer-2"]} layer-2`}>
                    {props.text}
                    {props.disabled ? <NotAllowedIcon /> : props.icon}
                </span>
            </a>
        : 
        <button onClick={props.onClick} className={`${styles["layered-button"]}${props.disabled ? ` ${styles['disabled']}` : ''}${props.active ? ` ${styles["active"]} active`: ''}${props.fastForward ? ` fast-forward` : ''}`}>
            <span className={`${styles["layer-1"]} layer-1`}>
                {props.text}
                {props.disabled ? <NotAllowedIcon /> : props.icon}
            </span>
            <span className={`${styles["layer-2"]} layer-2`}>
                {props.text}
                {props.disabled ? <NotAllowedIcon /> : props.icon}
            </span>
        </button>
    )
}

export default LayeredButton
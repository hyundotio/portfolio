import styles from './LayeredButton.module.scss';

interface Props {
    text: string
    icon: JSX.Element
    active?: boolean
    fastForward?: boolean
    onClick?: React.MouseEventHandler
}

const LayeredButton = (props: Props) => {
    return (
        <button onClick={props.onClick} className={`${styles["layered-button"]}${props.active ? ` ${styles["active"]} active`: ''}${props.fastForward ? ` fast-forward` : ''}`}>
            <span className={`${styles["layer-1"]} layer-1`}>
                {props.text}
                {props.icon}
            </span>
            <span className={`${styles["layer-2"]} layer-2`}>
                {props.text}
                {props.icon}
            </span>
        </button>
    )
}

export default LayeredButton
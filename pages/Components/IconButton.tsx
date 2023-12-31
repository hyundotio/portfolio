import React from 'react';
import styles from './IconButton.module.scss';

interface Props {
    icon: JSX.Element
    kind?: 'header' | 'header-back' | 'normal'
    onClick?: React.MouseEventHandler
    classNames?: string
}

const IconButton = React.forwardRef<HTMLButtonElement, Props>((props, ref) => {
    let classNameStr = '';
    if (props.kind === 'header') classNameStr = styles['header-icon-button'];
    if (props.kind === 'header-back') classNameStr = `${styles['header-icon-button']} ${styles['back-button']}`;
    if (props.kind === 'normal' || props.kind === undefined) classNameStr = styles['icon-button'];
    if (props.classNames) classNameStr += ` ${props.classNames}`;
    
    return (
        <button ref={ref} className={classNameStr} onClick={props.onClick}>{props.icon}</button>
    )
})
IconButton.displayName = 'IconButton';

export default IconButton;
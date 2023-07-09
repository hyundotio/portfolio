import React from 'react';
import styles from './IconButton.module.scss';

interface Props {
    icon: JSX.Element
    kind?: 'header' | 'header-back' | 'normal'
    onClick?: React.MouseEventHandler
}

const IconButton = React.forwardRef<HTMLButtonElement, Props>((props, ref) => {
    let classNameStr = '';
    if (props.kind === 'header') classNameStr = styles['header-icon-button'];
    if (props.kind === 'header-back') classNameStr = `${styles['header-icon-button']} ${styles['back-button']}`;
    if (props.kind === 'normal' || props.kind === undefined) classNameStr = styles['icon-button'];
    
    return (
        <button ref={ref} className={classNameStr} onClick={props.onClick}>{props.icon}</button>
    )
})

export default IconButton;
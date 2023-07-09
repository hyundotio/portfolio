import Link from "next/link";
import styles from "./TextLink.module.scss";

interface Props {
    isInternalLink?: boolean;
    href: string;
    text?: string;
    kind?: "plain" | "white";
    icon?: JSX.Element;
    onClick?: React.MouseEventHandler;
    className?: string;
}

const TextLink = (props: Props) => {
    return (
        props.isInternalLink ? 
        <Link onClick={props.onClick} href={props.href} className={`${props.kind === "white" ? styles["text-link-white"] : styles["text-link"]} ${props.className ? props.className : ''}`}>
            {props.text ? props.text : props.href}
            {props.icon ? props.icon : null}
        </Link> :
        <a onClick={props.onClick} href={props.href} className={`${props.kind === "white" ? styles["text-link-white"] : styles["text-link"]} ${props.className ? props.className : ''}`}>
            {props.text ? props.text : props.href}
            {props.icon ? props.icon : null}
        </a>
    )
}

export default TextLink
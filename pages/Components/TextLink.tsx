import Link from "next/link";
import styles from "./TextLink.module.scss";

interface Props {
    isInternalLink?: boolean;
    isDownload?: boolean;
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
        <Link
            download={props.isDownload}
            onClick={props.onClick}
            href={props.href}
            className={`${props.kind === "white" ? styles["text-link-white"] : styles["text-link"]} ${props.className ? props.className : ''}`}
        >
            {props.text ? props.text : props.href}
            {props.icon ? props.icon : null}
        </Link> :
        <a
            download={props.isDownload}
            rel="noopener noreferrer"
            target="_blank"
            onClick={props.onClick}
            href={props.href}
            className={`${props.kind === "white" ? styles["text-link-white"] : styles["text-link"]} ${props.className ? props.className : ''}`}
        >
            {props.text ? props.text : props.href}
            {props.icon ? props.icon : null}
        </a>
    )
}

export default TextLink
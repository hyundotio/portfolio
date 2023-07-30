import { ReactElement } from 'react';
import styles from './List.common.module.scss';

interface Props {
    title?: string;
    type?: "buttons" | "text" | "plain";
    content: (JSX.Element | string | ReactElement)[];
    id: string;
    header?: 5 | 6;
    isNested?: boolean
}

const List = (props: Props) => {
    return (
        <section className="content">
            <div className="description-container">
                {
                    props.title ? 
                    props.header === 6 ? <h6>{props.title}</h6> : <h5>{props.title}</h5> : null
                }
                <ul className={`${styles["list"]} ${props.type === "buttons" ? styles["links-button-list"] : props.type !== "plain" ? styles["disc-list"] : ''} ${props.isNested ? styles["nested"] : ''}`}>
                    {props.content.map((l, i) => <li key={`${props.id}-${i}`}>{l}</li>)}
                </ul>
            </div>
        </section>
    )
}

export default List
import styles from './List.common.module.scss';
import React from 'react';

interface Props {
    title?: string;
    type?: "buttons" | "text" | "plain";
    children?: React.ReactNode,
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
                    {React.Children.map(props.children, (child, i) => <li key={`${props.id}-${i}`}>{child}</li>)}
                </ul>
            </div>
        </section>
    )
}

export default List
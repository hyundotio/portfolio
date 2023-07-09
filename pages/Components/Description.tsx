interface Props {
    title?: string;
    content: string;
    isLarge?: boolean
}

const Description = (props: Props) => {
    return (
        <div className="description-container">
            {
                props.title ? 
                <h5>{props.title}</h5> : null
            }
            <p className={props.isLarge ? 'text_l' : ''}>{props.content}</p>
        </div>
    )
}

export default Description


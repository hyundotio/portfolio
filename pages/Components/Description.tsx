interface Props {
    title?: string;
    content: JSX.Element | string;
    isLarge?: boolean
}

const Description = (props: Props) => {
    return (
        <div className="description-container">
            {
                props.title ? 
                <h5>{props.title}</h5> : null
            }
            <div className={props.isLarge ? 'paragraphs text_l' : 'paragraphs'}>
                {
                    typeof props.content === 'string' ? 
                    <p>{props.content}</p> : 
                    props.content
                }
            </div>
            
        </div>
    )
}

export default Description


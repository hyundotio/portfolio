interface Props {
    title?: string;
    content: JSX.Element | string;
}

const TwoColTextSection = (props: Props) => {
    return (
        <section className="content">
            <div className="row">
                <div className="description-container two-col-text">
                    {
                        props.title ? 
                        <h5>
                            {props.title}
                        </h5> : null
                    }
                    <div className={'paragraphs'}>
                        {
                            typeof props.content === 'string' ? 
                            <p>{props.content}</p> : 
                            props.content
                        }
                    </div>
                </div>
            </div>
        </section>
    )
}

export default TwoColTextSection


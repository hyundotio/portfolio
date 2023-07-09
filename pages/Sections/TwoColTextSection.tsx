interface Props {
    title?: string;
    content: string;
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
                    <p>
                        {props.content}
                    </p>
                </div>
            </div>
        </section>
    )
}

export default TwoColTextSection


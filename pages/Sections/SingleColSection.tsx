interface Props {
    content: JSX.Element;
}

const SingleColSection = (props: Props) => {
    return (
        <section className="content">
            <div className="row">
                {props.content}
            </div>
        </section>
    )
}

export default SingleColSection
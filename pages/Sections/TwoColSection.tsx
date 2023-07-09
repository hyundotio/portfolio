interface Props {
    colLeft?: JSX.Element;
    colRight?: JSX.Element;
}

const TwoColSection = (props: Props) => {
    return (
        <section className="content">
            <div className="two-col row">
                <div className="col">
                    {
                        props.colLeft ? props.colLeft :
                        props.colRight ? <div className="col-ornament" /> : null
                    }
                </div>
                <div className="col">
                    {
                        props.colRight ? props.colRight :
                        props.colLeft ? <div className="col-ornament" /> : null
                    }
                </div>
            </div>
        </section>
    )
}

export default TwoColSection
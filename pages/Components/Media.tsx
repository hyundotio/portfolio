import styles from './Media.module.scss';
import React from 'react';
import NextImageBlurred from './BlurImage';
import IconButton from './IconButton';
import ArrowRightIcon from '../Assets/Arrow--Right.svg'
import ArrowLeftIcon from '../Assets/Arrow--Left.svg'


interface Props {
    title: string;
    bgColor?: string;
    content: {
        title: string,
        caption: string,
        src: string,
        active?: boolean
    }[]
}

const Media = (props: Props) => {
    const [activeIdx, setActiveIdx] = React.useState(() => {
        const activeItem = props.content.findIndex(c => c.active);
        return activeItem === -1 ? 0 : activeItem
    });

    function nextImage() {
        const maxIdx = props.content.length - 1;
        setActiveIdx(idx => idx + 1 > maxIdx ? 0 : idx + 1);
    }

    function prevImage() {
        setActiveIdx(idx => idx - 1 < 0 ? props.content.length - 1 : idx - 1);
    }

    return (
        <section className="content">
            <div className="row">
                <div className="description-container">
                    <div className={styles['media-header']}>
                        <div className={styles['media-title']}>
                            <h5>
                                {props.title} {
                                    props.content.length > 1 ?
                                    `(${activeIdx + 1}/${props.content.length})` : null
                                }
                            </h5>
                        </div>
                    </div>
                    {
                        props.content.map((c, i) =>
                            activeIdx === i ?  
                            <div className={styles['media-container']} key={`${props.title.replace(/ /g,"_")}-${i}`}>
                                <div className={styles['image-container']} style={{backgroundColor: props.bgColor ? props.bgColor : '#0028B6'}}>
                                    <NextImageBlurred
                                        alt={c.caption}
                                        src={c.src}
                                        fill
                                    />
                                </div>
                                <div className={styles['caption-container']}>
                                    <div className="paragraphs">
                                        <p>{ c.caption }</p>
                                    </div>
                                    <div className={styles['actions-container']}>
                                        {
                                            props.content.length > 1 ?
                                            <>
                                                <IconButton
                                                    icon={<ArrowLeftIcon />}
                                                    classNames={styles['action']}
                                                    onClick={() => prevImage()}
                                                />
                                                <IconButton
                                                    icon={<ArrowRightIcon />}
                                                    classNames={styles['action']}
                                                    onClick={() => nextImage()}
                                                />
                                            </> : null
                                        }
                                    </div>
                                </div>
                            </div> : null
                        )
                    }
                </div>
            </div>
        </section>
    )
}

export default Media
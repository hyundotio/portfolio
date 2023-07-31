import LayeredButton from "../Components/LayeredButton";
import TwoColSection from "./TwoColSection";
import ArrowRightIcon from '../Assets/Arrow--Right.svg'
import ArrowDownIcon from '../Assets/Arrow--Down.svg'
import React from "react";
import Description from "../Components/Description";
import styles from "./CountdownImageList.module.scss";
import commonListStyles from "../Components/List.common.module.scss";
import IconButton from "../Components/IconButton";
import NextImageBlurred from "../Components/BlurImage";
import { useRouter } from "next/router";

interface Project {
    backgroundColor: string,
    imageSrc: string,
    title: string,
    imageCaption: string,
    timeRange: string,
    summary: string,
    tldr: string,
    href: string
}

interface Props {
    projects: Project[]
}

const blankProject: Project = {
    backgroundColor: '',
    imageSrc: '',
    title: '',
    imageCaption: '',
    timeRange: '',
    summary: '',
    tldr: '',
    href: ''
}

const CountdownImageList = (props: Props) => {
    const [idx, setIdx] = React.useState(-1);
    const [overrideIdx, setOverrideIdx] = React.useState<number | undefined>();
    const [isHovered, setIsHovered] = React.useState(false);
    const [hoverIdx, setHoverIdx] = React.useState<number | undefined>();
    const [fastForward, setFastForward] = React.useState(false);
    const [renderIdx, setRenderIdx] = React.useState(0);
    const router = useRouter();

    const timer = React.useRef(() => {
        if (props.projects) {
            setFastForward(false);
            setIdx(i => i === (props.projects.length - 1) ? 0 : i + 1);
            timerId.current = setTimeout(timer.current, 10000);
        }
    });
    const timerId = React.useRef<NodeJS.Timeout>();

    const longestStrProject = props.projects ? props.projects.reduce((max, project) => project.summary.length > max.summary.length ? project : max) : blankProject;

    React.useEffect(() => {
        timerId.current = setTimeout(timer.current, 1);
        return () => {
            clearTimeout(timerId.current);
        }
    }, []);

    React.useEffect(() => {
        if(isHovered) {
            if (hoverIdx !== undefined && hoverIdx > -1) {
                //User has hovered in. Clear the rolling counter timeout.
                clearTimeout(timerId.current);
            }
        } else {
            if (hoverIdx !== undefined && hoverIdx > -1) {
                //User has hovered out. Restart the counter, set new idx (hoverIdx), and let current button know to fast-forward animation.
                timerId.current = setTimeout(timer.current, 3000);
                setFastForward(true);
                setIdx(hoverIdx);
            }
        }
    }, [isHovered, hoverIdx])

    React.useEffect(() => {
        if (overrideIdx !== undefined) {
            if (overrideIdx > -1) {
                setRenderIdx(overrideIdx);
            }
        }
        if (overrideIdx === undefined) {
            if (idx > -1) {
                setRenderIdx(idx);
            }
        }
    }, [idx, overrideIdx])
    
    return (
        props.projects ?
        <>
            <TwoColSection
                colLeft={
                    <div className="image-col" style={{
                        //Is there a hovered item? If so, what is it? If not, is idx valid? If so, what is the bgcolor? If not, transparent fallback.
                        backgroundColor: props.projects[renderIdx].backgroundColor
                    }}>
                        {
                            props.projects[renderIdx].imageSrc ?
                                <NextImageBlurred
                                    key={props.projects[renderIdx].title}
                                    src={props.projects[renderIdx].imageSrc}
                                    alt={props.projects[renderIdx].imageCaption}
                                    fill
                                /> : null
                        }
                    </div>
                }
                colRight={
                    <div className="spread-v">
                        <div className="row">
                            <ul className={`${commonListStyles["links-button-list"]} ${styles["links-button-countdown-list"]}`}>
                                {
                                    props.projects.map((project, i) => {
                                        return (
                                            <li
                                                key={`projects-list-item-${i}`}
                                                onMouseEnter={() => {
                                                    setOverrideIdx(i);
                                                    setHoverIdx(i);
                                                    setIsHovered(true);
                                                }}
                                                onMouseLeave={() => {
                                                    setOverrideIdx(undefined);
                                                    setIsHovered(false);
                                                }}
                                            >
                                                <LayeredButton
                                                    active={!isHovered && i === idx}
                                                    fastForward={fastForward && i === idx}
                                                    text={project.title}
                                                    icon={<ArrowRightIcon />}
                                                    onClick={() => router.push(project.href)}
                                                />
                                            </li>
                                        )
                                    })
                                }
                            </ul>
                        </div>
                        <div className="row">
                            <ArrowDownIcon />
                        </div>
                    </div>
                }
            />
            <TwoColSection
            colLeft={
                <div className={styles['ghost-text-container']}>
                    <div className={styles['ghost-text']}>
                        <Description
                            title={longestStrProject.timeRange}
                            content={longestStrProject.summary}
                        />
                    </div>
                    <div className={styles['real-text']}>
                        <Description
                            title={props.projects[renderIdx].timeRange}
                            content={props.projects[renderIdx].summary}
                        />
                    </div>
                </div>
            }
            colRight={
                <div className="spread-v">
                <div className="row">
                    <Description
                        title="TL;DR"
                        content={props.projects[renderIdx].tldr}
                    />
                </div>
                <div className="row">
                    <IconButton
                        icon={<ArrowRightIcon />}
                        onClick={() => router.push(props.projects[renderIdx].href)}
                    />
                </div>
                </div>
                
            }
            />
        </> : null
    )
}

export default CountdownImageList


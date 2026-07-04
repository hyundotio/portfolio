import styles from "@/Components/Home.module.scss";
import TypewriterText from "@/Components/TypewriterText";
import { WORK_DATA, WorkEntry } from "@/content/work";
import WorkOverlayClient from "@/Components/WorkOverlayClient";
import WorkViewMoreButton from "@/Components/WorkViewMoreButton";

interface WorkProps {
  activeWork: WorkEntry;
  isVisible: boolean;
}

const WorkOverlay = ({ activeWork, isVisible }: WorkProps) => {
  const currentIndex = WORK_DATA.findIndex((w) => w.id === activeWork.id);
  const nextId = WORK_DATA[(currentIndex + 1) % WORK_DATA.length].id;
  const prevId =
    WORK_DATA[(currentIndex - 1 + WORK_DATA.length) % WORK_DATA.length].id;

  return (
    <WorkOverlayClient nextId={nextId} prevId={prevId}>
      <div className={styles["big-title"]}>
        <TypewriterText
          as="h3"
          text={activeWork.company}
          shouldType={isVisible}
        />
      </div>
      <div className={styles["preview-cards"]}>
        <div className={styles["preview-card"]} data-work-preview-scroll>
          <div
            className={styles["preview-card-scroll"]}
            data-work-preview-scroll
          >
            <TypewriterText text={activeWork.period} shouldType={isVisible} />
            <div
              key={`${activeWork.id}-content`}
              className={styles["preview-card-content"]}
            >
              <TypewriterText
                as="h4"
                className="typewriter-text-typed"
                text={activeWork.heading}
                shouldType={isVisible}
              />
              <TypewriterText
                as="p"
                className="typewriter-text-typed"
                text={activeWork.description}
                shouldType={isVisible}
              />
            </div>
            <div
              key={`${activeWork.id}-content-2`}
              className={styles["preview-card-content"]}
            >
              <div className={styles["preview-card-text"]}>
                <TypewriterText
                  as="h5"
                  className="typewriter-text-typed"
                  text={`Notable mentions`}
                  shouldType={isVisible}
                />
                <ul>
                  {activeWork.highlights.map((highlight, idx) => (
                    <li key={idx}>
                      <TypewriterText
                        listMode
                        className="typewriter-text-typed"
                        as="span"
                        text={highlight}
                        shouldType={isVisible}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className={styles["preview-card-footer"]}>
            <WorkViewMoreButton activeWorkId={activeWork.id} />
          </div>
        </div>
      </div>
    </WorkOverlayClient>
  );
};

export default WorkOverlay;

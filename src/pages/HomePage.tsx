import type { CSSProperties } from "react";
import { EventsCalendarSection } from "@/components/EventsCalendarSection";
import { useReveal } from "@/hooks/useReveal";
import styles from "./HomePage.module.css";

const HERO_BG = encodeURI("/ETHETA Fa _22 Wisconsin Ques-02.JPEG");

const carouselImages = [
  "/IMG_5742.jpeg",
  "/IMG_5672.jpeg",
  "/IMG_2638.jpeg",
  "/IMG_0007.jpeg",
  "/E-Theta Graduation 21.24-16.jpeg",
  "/DSC06200.jpeg",
  "/23_Homecoming_MCHC_Yard_Show_Stremikis_173.jpeg",
  "/ETHETA Fa _22 Wisconsin Ques-02.JPEG",
].map((p) => encodeURI(p));

export function HomePage() {
  const historyReveal = useReveal<HTMLDivElement>();
  const track = [...carouselImages, ...carouselImages];

  return (
    <>
      <section
        className={styles.hero}
        style={
          {
            "--hero-bg": `linear-gradient(120deg, rgba(45, 10, 66, 0.88) 0%, rgba(75, 0, 110, 0.55) 45%, rgba(29, 8, 42, 0.75) 100%), url(${HERO_BG})`,
          } as CSSProperties
        }
      >
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Omega Psi Phi Fraternity, Inc.</p>
          <h1 className={styles.heroTitle}>Epsilon Theta</h1>
          <p className={styles.heroSub}>Chartered 1969 · University of Wisconsin–Madison</p>
          <a className={styles.cta} href="#history">
            Our story
          </a>
        </div>
      </section>

      <section
        id="history"
        className={`${styles.section} ${styles.history} ${historyReveal.visible ? styles.revealed : ""}`}
        ref={historyReveal.ref}
      >
        <h2 className={styles.sectionTitle}>Epsilon Theta history</h2>
        <div className={styles.prose}>
          <p>
            The Epsilon Theta Chapter of Omega Psi Phi Fraternity, Inc. was chartered on September
            15, 1969 at the University of Wisconsin–Madison in Madison, Wisconsin. Brothers Charles
            C. Peevy, David Ford, and Kenneth Irvin sought to enlighten young men in the capital city
            of Wisconsin, with the state’s second largest Black population, to the Cardinal
            Principles of our beloved fraternity. Since its charter, the Epsilon Theta Chapter has
            remained a strong influencer on the university’s campus and in the Greater Madison Area
            community. At a predominantly white institution where Black enrollment lies below 0.5%,
            the undergraduate brothers of this chapter have unequivocally demonstrated Black
            excellence and the ideals of Omega.
          </p>
          <p>
            Epsilon Theta has served its community for nearly six decades. In that time, the chapter
            has become known for hosting various signature events in the area including, but not
            limited to, Charles Drew Memorial Blood Drive, Dinner on the Ques, Christmas 4 Kids,
            Achievement Week, Book Scholarship and Voter Registration Drive.
          </p>
          <p>
            Brothers of Epsilon Theta have committed highly to and value service. Historically
            partnering with UW Children’s Hospital, Dane County Boys and Girls Club, and various
            middle and high schools has allowed brothers to provide youth enrichment opportunities to
            their community. The brothers of Epsilon Theta chapter hold scholarship in high regard,
            boasting a nearly perfect graduation rate and the expectation for current chapter members
            remains the same. Brothers who are on campus are required to actively search for
            internship opportunities to enrich their matriculation into the workforce post graduation.
            After graduation, brothers from this chapter have excelled in business, medicine,
            education, entrepreneurship, law enforcement, military, engineering, law, philanthropy,
            ministry, and professional athletics across the United States and abroad. Brothers have
            also gone on to hold various positions at the state and district level in our fraternity.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Events calendar</h2>
        <p className={styles.lead}>Chapter events and flyers — times are always shown in Central Time.</p>
        <EventsCalendarSection />
      </section>

      <section className={styles.sectionMuted} aria-labelledby="gallery-heading">
        <h2 id="gallery-heading" className={styles.galleryTitle}>
          Chapter moments
        </h2>
        <div className={styles.marquee} role="presentation">
          <div className={`${styles.marqueeTrack} marquee-track-animate`}>
            {track.map((src, i) => (
              <figure key={`${src}-${i}`} className={styles.marqueeFigure}>
                <img src={src} alt="" className={styles.marqueeImg} loading="lazy" decoding="async" />
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

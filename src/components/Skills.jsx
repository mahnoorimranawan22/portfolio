import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';

/* Shared real skills data (data/skills.json) — the same file the backend API
   serves. Rendered instantly, upgraded from the API when reachable. */
import SKILLS_DATA from '../../data/skills.json';

export default function Skills() {
    const sectionRef = useRef(null);
    const [animate, setAnimate] = useState(false);
    const [skillsData, setSkillsData] = useState(SKILLS_DATA);

    // Prefer live API data; fall back silently to bundled data when offline.
    useEffect(() => {
        let cancelled = false;
        api.getSkills()
            .then((data) => {
                if (!cancelled && data && typeof data === 'object') {
                    setSkillsData(data);
                }
            })
            .catch(() => {
                /* Backend offline — bundled data already rendered. */
            });
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setAnimate(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) observer.observe(sectionRef.current);

        return () => observer.disconnect();
    }, []);

    return (
        <section className="skills" id="skills" ref={sectionRef}>
            <div className="container">
                <div className="section-head reveal">
                    <p className="eyebrow">Skills</p>
                    <h2 className="section-title">
                        ⚡ My <span className="gradient-text">Skills</span>
                    </h2>
                    <p className="section-subtitle">Technologies and methodologies I work with</p>
                </div>

                <div className="skills-categories">
                    {Object.entries(skillsData).map(([category, skills], catIndex) => (
                        <div
                            className="skills-cat-card glass-panel reveal"
                            key={category}
                            style={{ '--reveal-delay': `${catIndex * 0.05}s` }}
                        >
                            <h3 className="cat-title">
                                <span className="cat-bullet"></span> {category}
                            </h3>
                            <div className="cat-skills-list">
                                {skills.map((skill) => (
                                    <div className="skill-item" key={skill.name}>
                                        <div className="skill-meta">
                                            <span className="skill-name">
                                                <i className={`${skill.icon} skill-meta-icon`} aria-hidden="true"></i> {skill.name}
                                            </span>
                                            <span className="skill-percentage">{skill.level}</span>
                                        </div>
                                        <div className="skill-bar">
                                            <div
                                                className="skill-progress"
                                                style={{ width: animate ? skill.level : '0%' }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

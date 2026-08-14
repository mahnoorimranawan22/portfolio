import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';

/* Shared real skills data (data/skills.json) — the same file the backend API
   serves. Rendered instantly, upgraded from the API when reachable. */
import SKILLS_DATA from '../../data/skills.json';

/* Decorative marquee strip (duplicated for a seamless loop) */
const TECH_MARQUEE = [
    'React', 'Node.js', 'Express', 'MongoDB', 'SQLite', 'Vite',
    'JavaScript (ES6+)', 'Tailwind CSS', 'Bootstrap', 'REST APIs',
    'JWT Auth', 'PWA', 'Git & GitHub', 'Groq / OpenAI APIs',
];

export default function Skills() {
    const sectionRef = useRef(null);
    const [animate, setAnimate] = useState(false);
    const [skillsData, setSkillsData] = useState(SKILLS_DATA);
    const [skillQuery, setSkillQuery] = useState('');

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

    const queryLower = skillQuery.toLowerCase().trim();

    return (
        <section className="skills" id="skills" ref={sectionRef}>
            <div className="container">
                <div className="section-head reveal">
                    <p className="eyebrow">Skills & Proficiency</p>
                    <h2 className="section-title">
                        ⚡ Technical <span className="gradient-text">Competencies</span>
                    </h2>
                    <p className="section-subtitle">Core frameworks, engineering tools, and system architectures I work with</p>
                </div>

                <div className="skills-search-wrapper reveal">
                    <div className="skills-search-box">
                        <i className="fas fa-search search-icon" aria-hidden="true"></i>
                        <input
                            type="text"
                            className="field search-field"
                            placeholder="Filter skills (e.g., React, Express, SQLite, Git)..."
                            value={skillQuery}
                            onChange={(e) => setSkillQuery(e.target.value)}
                            aria-label="Filter skills"
                        />
                        {skillQuery && (
                            <button
                                type="button"
                                className="clear-search-btn"
                                onClick={() => setSkillQuery('')}
                                aria-label="Clear skill search"
                            >
                                <i className="fas fa-times" aria-hidden="true"></i>
                            </button>
                        )}
                    </div>
                </div>

                <div className="tech-marquee reveal" aria-hidden="true">
                    <div className="tech-marquee-track">
                        <div className="tech-marquee-group">
                            {TECH_MARQUEE.map((t) => (
                                <span className="tech-marquee-chip" key={t}>
                                    <i className="fas fa-code" aria-hidden="true"></i> {t}
                                </span>
                            ))}
                        </div>
                        <div className="tech-marquee-group">
                            {TECH_MARQUEE.map((t) => (
                                <span className="tech-marquee-chip" key={`${t}-dup`}>
                                    <i className="fas fa-code" aria-hidden="true"></i> {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="skills-categories">
                    {Object.entries(skillsData).map(([category, skills], catIndex) => {
                        const matchingSkills = skills.filter(
                            (s) =>
                                !queryLower ||
                                s.name.toLowerCase().includes(queryLower) ||
                                category.toLowerCase().includes(queryLower)
                        );

                        if (matchingSkills.length === 0) return null;

                        return (
                            <div
                                className="skills-cat-card glass-panel reveal"
                                key={category}
                                style={{ '--reveal-delay': `${catIndex * 0.05}s` }}
                            >
                                <h3 className="cat-title">
                                    <span className="cat-bullet"></span> {category}
                                </h3>
                                <div className="cat-skills-list">
                                    {matchingSkills.map((skill) => (
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
                        );
                    })}
                </div>
            </div>
        </section>
    );
}


import { useState } from 'react';

const ENDPOINTS_DATA = {
    'POST/api/auth/login': {
        status: 200,
        statusText: 'OK',
        latency: '34ms',
        data: {
            success: true,
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibWFobm9vcmltcmFuYXdhbjIyQGdtYWlsLmNvbSJ9...',
            user: {
                id: 1,
                name: 'Mahnoor Imran',
                email: 'mahnoorimranawan22@gmail.com',
            },
        },
    },
    'POST/api/interviews/start': {
        status: 201,
        statusText: 'Created',
        latency: '115ms',
        data: {
            sessionId: 42,
            topic: 'React 19 & State Management',
            currentQuestion: {
                id: 1,
                text: 'What are the main performance benefits of Server Actions in React 19, and how does the useActionState hook optimize mutations compared to useEffect?',
            },
        },
    },
    'POST/api/interviews/42/answer': {
        status: 200,
        statusText: 'OK',
        latency: '1420ms',
        data: {
            evaluation: {
                score: '8.5/10',
                technicalAccuracy: 'High',
                feedback: 'Great overview of client-server boundary optimization. Your description of action queues correctly identifies hydration state benefits, but you could expand on transition rollback states.',
            },
            nextQuestion: {
                id: 2,
                text: 'Explain the runtime characteristics of concurrent rendering in React 19, specifically focusing on how useTransition handles high-priority UI updates vs non-blocking states.',
            },
        },
    },
};

const DB_DIAGRAM = `┌──────────────────┐          ┌──────────────────┐
│      users       │          │   evaluations    │
├──────────────────┤          ├──────────────────┤
│ id         INTEGER ◄──┐     │ id         INTEGER
│ name       TEXT       │     │ userId     INTEGER (FK)
│ email      TEXT       └─────┼─ sessionId  INTEGER (FK)
│ password   TEXT             │ question   TEXT
│ createdAt  TEXT             │ answer     TEXT
└──────────────────┘          │ feedback   TEXT
                              │ rating     INTEGER
                              │ createdAt  TEXT
                              └──────────────────┘`;

const API_DIAGRAM = `Client ──► [ HTTP Logger ] ──► [ Auth Guard ] ──► [ Body Validation ]
                                                       │
                                                 400 Bad Request ◄──┘
                                                       │ valid
                                                       ▼
                                               [ Route Handler ]
                                                       │
                                                       ▼
Client ◄── [ JSON Serializer ] ◄── [ Controller ] ◄────┤ (Groq LLM)
                                                       ▼
                                                 [ SQLite DB ] (Local File)`;

const AI_DIAGRAM = `Client (UI Answer Text)
       │
       ▼
Express API Router Middleware
       │
       ▼
Controller (Format Groq Chat Completion System Payload)
       │
       ▼
Groq LLM Client Inference ("llama-3.3-70b-versatile")
       │
       ▼
Stream Callback -> Structured JSON (Score / Feedback / Next Question)
       │
       ▼
SQLite Database Sync & Client Payload return`;

const TABS = [
    { id: 'arch-db', icon: 'fa-database', label: 'SQLite Schema' },
    { id: 'arch-api', icon: 'fa-network-wired', label: 'System Architecture' },
    { id: 'arch-ai', icon: 'fa-wand-magic-sparkles', label: 'AI Completion pipeline' },
];

const TAB_PANELS = {
    'arch-db': {
        title: 'SQLite DB Tables Relational Layout',
        desc: 'Relational SQLite design syncing users authentication hashes and practice evaluations locally without database overhead.',
        diagram: DB_DIAGRAM,
    },
    'arch-api': {
        title: 'Full-Stack Server Pipeline Flow',
        desc: 'React front-end actions target Node/Express endpoints secured by JWT session authentication, writing responses to local SQLite and calling AI completions.',
        diagram: API_DIAGRAM,
    },
    'arch-ai': {
        title: 'Groq LLM Inference & Feedback Engine',
        desc: 'System instructions dictate prompt boundaries to stream evaluation logs, scoring metrics, and adaptively scaled subsequent interview questions.',
        diagram: AI_DIAGRAM,
    },
};

export default function FullStackShowcase() {
    const [activeTab, setActiveTab] = useState('arch-db');
    const [endpoint, setEndpoint] = useState('POST/api/auth/login');
    const [log, setLog] = useState('');
    const [status, setStatus] = useState('');
    const [body, setBody] = useState(
        '> Select an endpoint below and click Execute Query to test the Express + Groq API integration...'
    );
    const [loading, setLoading] = useState(false);

    const handleExecute = () => {
        setLoading(true);
        setLog(`> Sending request: ${endpoint.replace('/', ' ')}...`);
        setStatus('');

        setTimeout(() => {
            const res = ENDPOINTS_DATA[endpoint];
            if (res) {
                setStatus(`${res.status} ${res.statusText}  (${res.latency})`);
                setBody(JSON.stringify(res.data, null, 2));
            } else {
                setBody('> Error: Endpoint not configured.');
            }
            setLoading(false);
        }, 800);
    };

    return (
        <section className="showcase" id="showcase">
            <div className="container">
                <div className="section-head reveal">
                    <p className="eyebrow">Featured Architecture</p>
                    <h2 className="section-title">
                        🛡️ Featured: <span className="gradient-text">AI Interview Coach</span>
                    </h2>
                    <p className="section-subtitle">Exhibiting the server schema, pipelines, and prompt loops powering the coach app</p>
                </div>

                {/* Left: Info Card, Right: Layout Blueprints */}
                <div className="featured-showcase-card glass-panel reveal">
                    <div className="featured-info">
                        <div className="featured-badge">
                            <i className="fas fa-star" aria-hidden="true"></i> FEATURED SYSTEM
                        </div>
                        <h3>AI Interview Coach System Diagram</h3>
                        <p className="featured-intro-desc">
                            A local system utility designed to simulate board technical examinations. Connects real-time inference completions through public endpoints and locks metrics safely inside SQLite instances.
                        </p>

                        <ul className="featured-bullets-list">
                            <li>
                                <i className="fas fa-circle-check text-brand" aria-hidden="true"></i>
                                <span><strong>Adaptive Questioning:</strong> Dynamic difficulty scaling driven by LLM prompts.</span>
                            </li>
                            <li>
                                <i className="fas fa-circle-check text-brand" aria-hidden="true"></i>
                                <span><strong>SQLite DB Persistence:</strong> Zero external configuration database layer for user sessions.</span>
                            </li>
                            <li>
                                <i className="fas fa-circle-check text-brand" aria-hidden="true"></i>
                                <span><strong>Secure JWT Handshakes:</strong> Encrypting account tokens through verification guards.</span>
                            </li>
                        </ul>

                        <div className="featured-actions">
                            <a
                                href="https://github.com/mahnoorimranawan22/ai-interview-coach"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-accent btn-md"
                            >
                                <i className="fab fa-github" aria-hidden="true"></i> View Code
                            </a>
                            <a
                                href="#terminal"
                                className="btn btn-secondary btn-md"
                            >
                                <i className="fas fa-terminal" aria-hidden="true"></i> Live Demo (Sandbox)
                            </a>
                        </div>
                    </div>

                    <div className="featured-explorer">
                        {/* Tab navigator */}
                        <div className="featured-tabs">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`featured-tab-btn${activeTab === tab.id ? ' active' : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                    aria-controls={tab.id}
                                    aria-selected={activeTab === tab.id}
                                >
                                    <i className={`fas ${tab.icon}`} aria-hidden="true"></i> {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Diagram panel */}
                        <div className="featured-stage">
                            <h4>{TAB_PANELS[activeTab].title}</h4>
                            <p>{TAB_PANELS[activeTab].desc}</p>
                            <pre className="featured-diagram-flow">{TAB_PANELS[activeTab].diagram}</pre>
                        </div>
                    </div>
                </div>

                {/* API terminal sandbox */}
                <div className="terminal reveal" id="terminal">
                    <div className="terminal-bar">
                        <div className="terminal-dots" aria-hidden="true">
                            <span className="dot-red"></span>
                            <span className="dot-yellow"></span>
                            <span className="dot-green"></span>
                        </div>
                        <div className="terminal-title">coach_sandbox_curl.sh</div>
                    </div>
                    <div className="terminal-body">
                        <div className="terminal-row">
                            <span className="terminal-prompt">$ curl -X</span>
                            <select
                                className="terminal-select"
                                id="terminal-endpoint"
                                aria-label="Select API endpoint"
                                value={endpoint}
                                onChange={(e) => setEndpoint(e.target.value)}
                            >
                                <option value="POST/api/auth/login">POST https://coach.dev/api/auth/login</option>
                                <option value="POST/api/interviews/start">POST https://coach.dev/api/interviews/start</option>
                                <option value="POST/api/interviews/42/answer">POST https://coach.dev/api/interviews/42/answer</option>
                            </select>
                            <button
                                className="btn btn-accent btn-sm"
                                id="terminal-send"
                                onClick={handleExecute}
                                disabled={loading}
                            >
                                {loading ? 'Running...' : 'Execute Request'}
                            </button>
                        </div>
                        <pre className="terminal-output" id="terminal-result" aria-live="polite">
                            {log && (
                                <>
                                    <span className="network-info">{log}</span>
                                    {'\n\n'}
                                </>
                            )}
                            {status && (
                                <>
                                    <span className="network-info">&gt; Response Status:</span>{' '}
                                    <span className="status-success">{status}</span>
                                    {'\n\n'}
                                </>
                            )}
                            {body}
                        </pre>
                    </div>
                </div>
            </div>
        </section>
    );
}

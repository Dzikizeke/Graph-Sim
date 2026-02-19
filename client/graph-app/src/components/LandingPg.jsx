import React from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../simulationAPI';
import { useEffect } from 'react';

const LandingPg = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated()) {
            navigate('/', { replace: true });
        }
    }, [navigate]);


    return (
        <div className="landing-page">
            {/* Navigation Header */}
            <nav className="landing-nav">
                <div className="nav-container">
                    <div className="nav-brand">
                        <span className="brand-icon">📊</span>
                        <h1>MathVisualizer</h1>
                    </div>
                    <div className="nav-actions">
                        <button
                            className="nav-btn secondary"
                            onClick={() => navigate('/login')}
                        >
                            Login
                        </button>
                        <button
                            className="nav-btn primary"
                            onClick={() => navigate('/register')}
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1>Visualize Mathematics Like Never Before</h1>
                        <p className="hero-subtitle">
                            Interactive 2D/3D graphing, calculus tools, ODE solvers, and statistical analysis
                            in one powerful platform. Make complex math intuitive and beautiful.
                        </p>
                        <div className="hero-actions">
                            <button
                                className="cta-btn primary"
                                onClick={() => navigate('/register')}
                            >
                                Start Exploring Free
                            </button>
                            <button
                                className="cta-btn secondary"
                                onClick={() => navigate('/login')}
                            >
                                Sign In
                            </button>
                        </div>
                        <div className="hero-stats">
                            <div className="stat">
                                <span className="stat-number">10+</span>
                                <span className="stat-label">Math Tools</span>
                            </div>
                            <div className="stat">
                                <span className="stat-number">2D/3D</span>
                                <span className="stat-label">Visualization</span>
                            </div>
                            <div className="stat">
                                <span className="stat-number">∞</span>
                                <span className="stat-label">Possibilities</span>
                            </div>
                        </div>
                    </div>
                    {/* Hero Visual */}
                    <div className="hero-visual">
                        <div className="visual-container">
                            {/* Animated Sine Wave */}
                            <div className="graph-demo trig-demo">
                                <div className="graph-title">Trigonometry</div>
                                <svg className="sine-wave" viewBox="0 0 400 100">
                                    <path
                                        className="sine-path"
                                        d="M0,50 Q100,0 200,50 T400,50"
                                        fill="none"
                                        stroke="url(#gradient1)"
                                        strokeWidth="3"
                                    />
                                    <defs>
                                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#667eea" />
                                            <stop offset="100%" stopColor="#764ba2" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>

                            {/* Calculus Derivative Demo */}
                            <div className="graph-demo calc-demo">
                                <div className="graph-title">Calculus</div>
                                <svg className="calc-graph" viewBox="0 0 200 120">
                                    {/* Function curve */}
                                    <path
                                        className="function-curve"
                                        d="M0,100 C50,20 150,20 200,100"
                                        fill="none"
                                        stroke="#22c55e"
                                        strokeWidth="2"
                                    />
                                    {/* Tangent line */}
                                    <line
                                        className="tangent-line"
                                        x1="80" y1="40" x2="120" y2="40"
                                        stroke="#dc2626"
                                        strokeWidth="2"
                                        strokeDasharray="4"
                                    />
                                    {/* Point */}
                                    <circle cx="100" cy="40" r="3" fill="#dc2626" />
                                </svg>
                            </div>

                            {/* 3D Custom Function Demo */}
                            <div className="graph-demo custom-demo">
                                <div className="graph-title">3D Functions</div>
                                <div className="three-d-container">
                                    <div className="cube">
                                        <div className="face front"></div>
                                        <div className="face back"></div>
                                        <div className="face left"></div>
                                        <div className="face right"></div>
                                        <div className="face top"></div>
                                        <div className="face bottom"></div>
                                    </div>
                                    <div className="wave-surface"></div>
                                </div>
                            </div>

                            {/* Statistics Chart Demo */}
                            <div className="graph-demo stats-demo">
                                <div className="graph-title">Statistics</div>
                                <svg className="stats-chart" viewBox="0 0 200 100">
                                    {/* Grid lines */}
                                    <line x1="20" y1="20" x2="20" y2="80" stroke="#444" strokeWidth="1" />
                                    <line x1="20" y1="80" x2="180" y2="80" stroke="#444" strokeWidth="1" />

                                    {/* Data points and line */}
                                    <polyline
                                        points="40,60 60,40 80,70 100,30 120,50 140,20 160,60"
                                        fill="none"
                                        stroke="#667eea"
                                        strokeWidth="2"
                                    />

                                    {/* Data points */}
                                    <circle cx="40" cy="60" r="2" fill="#667eea" />
                                    <circle cx="60" cy="40" r="2" fill="#667eea" />
                                    <circle cx="80" cy="70" r="2" fill="#667eea" />
                                    <circle cx="100" cy="30" r="2" fill="#667eea" />
                                    <circle cx="120" cy="50" r="2" fill="#667eea" />
                                    <circle cx="140" cy="20" r="2" fill="#667eea" />
                                    <circle cx="160" cy="60" r="2" fill="#667eea" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <h2>Powerful Mathematical Tools</h2>
                    <p className="section-subtitle">
                        Everything you need for mathematical exploration and learning
                    </p>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">📈</div>
                            <h3>Trigonometry Visualizer</h3>
                            <p>Plot sine, cosine, and tangent functions with real-time parameter adjustments and beautiful animations.</p>
                            <ul>
                                <li>Multiple function plotting</li>
                                <li>Amplitude, frequency, phase control</li>
                                <li>Interactive graphs</li>
                            </ul>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🎯</div>
                            <h3>Custom Functions</h3>
                            <p>Create and visualize any mathematical expression in 2D or 3D with custom parameters and variables.</p>
                            <ul>
                                <li>2D & 3D plotting</li>
                                <li>Custom expressions</li>
                                <li>Parameter sliders</li>
                            </ul>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">∫</div>
                            <h3>Calculus Tools</h3>
                            <p>Explore derivatives, integrals, and limits with step-by-step solutions and visual representations.</p>
                            <ul>
                                <li>Derivatives & integrals</li>
                                <li>Limit calculations</li>
                                <li>Area under curves</li>
                            </ul>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">📊</div>
                            <h3>Statistics & Data</h3>
                            <p>Analyze datasets with various statistical methods and create stunning visualizations.</p>
                            <ul>
                                <li>Descriptive statistics</li>
                                <li>Probability distributions</li>
                                <li>Data visualization</li>
                            </ul>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">⚡</div>
                            <h3>ODE Solver</h3>
                            <p>Solve ordinary differential equations with multiple numerical methods and visual solutions.</p>
                            <ul>
                                <li>Multiple solving methods</li>
                                <li>Phase portraits</li>
                                <li>Initial value problems</li>
                            </ul>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🔬</div>
                            <h3>PDE Tools</h3>
                            <p>Coming soon - Partial differential equation solver with finite difference methods.</p>
                            <ul>
                                <li>Heat equation</li>
                                <li>Wave equation</li>
                                <li>Laplace's equation</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works">
                <div className="container">
                    <h2>How It Works</h2>
                    <div className="steps-grid">
                        <div className="step">
                            <div className="step-number">1</div>
                            <h3>Sign Up Free</h3>
                            <p>Create your account in seconds. No credit card required.</p>
                        </div>
                        <div className="step">
                            <div className="step-number">2</div>
                            <h3>Choose Your Tool</h3>
                            <p>Select from trigonometry, calculus, statistics, or custom functions.</p>
                        </div>
                        <div className="step">
                            <div className="step-number">3</div>
                            <h3>Visualize & Learn</h3>
                            <p>Adjust parameters in real-time and watch the graphs update instantly.</p>
                        </div>
                        <div className="step">
                            <div className="step-number">4</div>
                            <h3>Save & Share</h3>
                            <p>Save your configurations and share your discoveries with others.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <h2>Ready to Transform Your Math Experience?</h2>
                    <p>Join thousands of students, educators, and math enthusiasts who are already exploring mathematics in a whole new way.</p>
                    <div className="cta-actions">
                        <button
                            className="cta-btn large primary"
                            onClick={() => navigate('/register')}
                        >
                            Create Free Account
                        </button>
                        <button
                            className="cta-btn large secondary"
                            onClick={() => navigate('/login')}
                        >
                            I Have an Account
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <span className="brand-icon">📊</span>
                            <h3>MathVisualizer</h3>
                            <p>Making mathematics beautiful and accessible for everyone.</p>
                        </div>
                        <div className="footer-links">
                            <div className="link-group">
                                <h4>Tools</h4>
                                <a href="#trigonometry">Trigonometry</a>
                                <a href="#calculus">Calculus</a>
                                <a href="#statistics">Statistics</a>
                                <a href="#ode">ODE Solver</a>
                            </div>
                            <div className="link-group">
                                <h4>Support</h4>
                                <a href="#help">Help Center</a>
                                <a href="#tutorials">Tutorials</a>
                                <a href="#contact">Contact Us</a>
                                <a href="#docs">Documentation</a>
                            </div>
                            <div className="link-group">
                                <h4>Company</h4>
                                <a href="#about">About</a>
                                <a href="#privacy">Privacy</a>
                                <a href="#terms">Terms</a>
                                <a href="#blog">Blog</a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2024 MathVisualizer. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPg;
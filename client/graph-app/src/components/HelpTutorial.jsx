import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HelpTutorials = () => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('getting-started');

    const tutorials = {
        'getting-started': [
            {
                id: 1,
                title: 'Welcome to Math Visualization Studio',
                content: 'Learn how to navigate and use our platform effectively.',
                video: 'https://example.com/video1',
                steps: [
                    'Explore different graph types from the home page',
                    'Click on any available graph type to start plotting',
                    'Use the sidebar to access recent simulations and favorites',
                    'Customize your plots with interactive parameters'
                ]
            },
            {
                id: 2,
                title: 'Creating Your First Plot',
                content: 'Step-by-step guide to plotting basic functions.',
                steps: [
                    'Go to Custom Functions page',
                    'Enter a mathematical expression like "sin(x)"',
                    'Adjust the range and number of points',
                    'Click "Add" to see multiple functions',
                    'Use the color picker to differentiate functions'
                ]
            }
        ],
        'trigonometry': [
            {
                id: 1,
                title: 'Trigonometric Functions Guide',
                content: 'How to plot and analyze trigonometric functions.',
                steps: [
                    'Select amplitude, frequency, and phase parameters',
                    'Combine multiple trig functions for interference patterns',
                    'Use parameters like A*sin(f*x + p) for customization',
                    'Explore phase shifts and amplitude modulation'
                ]
            },
            {
                id: 2,
                title: 'Wave Interference Patterns',
                content: 'Create beautiful wave interference visualizations.',
                steps: [
                    'Add multiple sine waves with different frequencies',
                    'Adjust amplitudes to see constructive/destructive interference',
                    'Use the real-time parameter sliders',
                    'Export your patterns as images'
                ]
            }
        ],
        'statistics': [
            {
                id: 1,
                title: 'Statistical Distributions',
                content: 'Plot and analyze probability distributions.',
                steps: [
                    'Choose from normal, binomial, Poisson distributions',
                    'Adjust mean and standard deviation parameters',
                    'Overlay multiple distributions for comparison',
                    'Calculate probabilities and percentiles'
                ]
            },
            {
                id: 2,
                title: 'Data Analysis Tools',
                content: 'Import and analyze your own datasets.',
                steps: [
                    'Upload CSV files with your data',
                    'Generate histograms and box plots',
                    'Calculate descriptive statistics',
                    'Perform hypothesis testing'
                ]
            }
        ],
        'custom-functions': [
            {
                id: 1,
                title: 'Writing Mathematical Expressions',
                content: 'Complete guide to supported syntax and functions.',
                steps: [
                    'Use x for 2D plots, x and y for 3D surfaces',
                    'Supported operations: +, -, *, /, ^ (power)',
                    'Math functions: sin, cos, tan, exp, log, sqrt, abs',
                    'Constants: pi, e',
                    'Custom parameters: a, b, k, etc. with slider controls'
                ]
            },
            {
                id: 2,
                title: '3D Function Plotting',
                content: 'Create stunning 3D surface plots.',
                steps: [
                    'Switch to 3D mode in Custom Functions',
                    'Use expressions with x and y variables',
                    'Examples: sin(sqrt(x^2 + y^2)), x^2 + y^2',
                    'Adjust grid size for performance vs detail',
                    'Rotate and zoom in 3D view'
                ]
            }
        ],
        'ode-solver': [
            {
                id: 1,
                title: 'Solving Ordinary Differential Equations',
                content: 'Numerical methods for ODE solutions.',
                steps: [
                    'Choose between 1st and 2nd order ODEs',
                    'Select numerical method (Euler or RK4)',
                    'Enter initial conditions and parameters',
                    'View both time-domain and phase-space plots',
                    'Compare different solver methods'
                ]
            },
            {
                id: 2,
                title: 'Common ODE Examples',
                content: 'Pre-built examples for quick start.',
                steps: [
                    'Harmonic oscillators (undamped and damped)',
                    'Population growth models',
                    'Radioactive decay',
                    'Forced oscillations with external driving'
                ]
            }
        ],
        'troubleshooting': [
            {
                id: 1,
                title: 'Common Error Messages',
                content: 'Solutions for frequently encountered issues.',
                steps: [
                    '"Invalid expression": Check your mathematical syntax',
                    '"No valid points": Adjust your function range',
                    '3D plot not rendering: Reduce grid size for performance',
                    'Slow performance: Close other browser tabs'
                ]
            },
            {
                id: 2,
                title: 'Performance Tips',
                content: 'Optimize your experience with large computations.',
                steps: [
                    'Use smaller grid sizes for 3D plots',
                    'Close unused function plots',
                    'Clear browser cache regularly',
                    'Use simpler expressions for real-time manipulation'
                ]
            }
        ]
    };

    const quickLinks = [
        { title: 'Mathematical Syntax Reference', path: '/syntax' },
        { title: 'Video Tutorial Library', path: '/videos' },
        { title: 'Keyboard Shortcuts', path: '/shortcuts' },
        { title: 'FAQ', path: '/faq' },
        { title: 'Contact Support', path: '/contact' }
    ];

    return (
        <div className="help-tutorials-page">
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate('/')}>
                    ← Back to Home
                </button>
                <h1>Help & Tutorials</h1>
                <p>Learn how to make the most of Math Visualization Studio</p>
            </header>

            <div className="help-content">
                {/* Sidebar Navigation */}
                <aside className="help-sidebar">
                    <div className="sidebar-section">
                        <h3>Categories</h3>
                        <nav className="category-nav">
                            <button 
                                className={`category-btn ${activeCategory === 'getting-started' ? 'active' : ''}`}
                                onClick={() => setActiveCategory('getting-started')}
                            >
                                🚀 Getting Started
                            </button>
                            <button 
                                className={`category-btn ${activeCategory === 'trigonometry' ? 'active' : ''}`}
                                onClick={() => setActiveCategory('trigonometry')}
                            >
                📊 Trigonometry
                            </button>
                            <button 
                                className={`category-btn ${activeCategory === 'statistics' ? 'active' : ''}`}
                                onClick={() => setActiveCategory('statistics')}
                            >
                                📈 Statistics
                            </button>
                            <button 
                                className={`category-btn ${activeCategory === 'custom-functions' ? 'active' : ''}`}
                                onClick={() => setActiveCategory('custom-functions')}
                            >
                                🔧 Custom Functions
                            </button>
                            <button 
                                className={`category-btn ${activeCategory === 'ode-solver' ? 'active' : ''}`}
                                onClick={() => setActiveCategory('ode-solver')}
                            >
                                ⚡ ODE Solver
                            </button>
                            <button 
                                className={`category-btn ${activeCategory === 'troubleshooting' ? 'active' : ''}`}
                                onClick={() => setActiveCategory('troubleshooting')}
                            >
                                🔧 Troubleshooting
                            </button>
                        </nav>
                    </div>

                    <div className="sidebar-section">
                        <h3>Quick Links</h3>
                        <div className="quick-links">
                            {quickLinks.map((link, index) => (
                                <a key={index} href={link.path} className="quick-link">
                                    {link.title}
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h3>Need Help?</h3>
                        <div className="support-options">
                            <button className="support-btn">
                                💬 Live Chat
                            </button>
                            <button className="support-btn">
                                📧 Email Support
                            </button>
                            <button className="support-btn">
                                📚 Documentation
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="tutorials-main">
                    <div className="search-section">
                        <div className="search-box">
                            <input 
                                type="text" 
                                placeholder="Search tutorials and help articles..."
                            />
                            <span className="search-icon">🔍</span>
                        </div>
                    </div>

                    <div className="tutorials-section">
                        <h2>{activeCategory.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</h2>
                        
                        <div className="tutorials-grid">
                            {tutorials[activeCategory].map(tutorial => (
                                <div key={tutorial.id} className="tutorial-card">
                                    <div className="tutorial-header">
                                        <h3>{tutorial.title}</h3>
                                        {tutorial.video && (
                                            <button className="video-btn">🎥 Watch Video</button>
                                        )}
                                    </div>
                                    <p className="tutorial-description">{tutorial.content}</p>
                                    
                                    <div className="tutorial-steps">
                                        <h4>Steps:</h4>
                                        <ol>
                                            {tutorial.steps.map((step, index) => (
                                                <li key={index}>{step}</li>
                                            ))}
                                        </ol>
                                    </div>

                                    <div className="tutorial-actions">
                                        <button className="action-btn">Mark as Read</button>
                                        <button className="action-btn">Save for Later</button>
                                        <button className="action-btn">Share</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Featured Resources */}
                    <div className="resources-section">
                        <h3>Featured Resources</h3>
                        <div className="resources-grid">
                            <div className="resource-card">
                                <div className="resource-icon">📖</div>
                                <h4>User Guide PDF</h4>
                                <p>Complete reference manual</p>
                                <button className="download-btn">Download</button>
                            </div>
                            <div className="resource-card">
                                <div className="resource-icon">🎬</div>
                                <h4>Video Tutorials</h4>
                                <p>Step-by-step video guides</p>
                                <button className="watch-btn">Watch Now</button>
                            </div>
                            <div className="resource-card">
                                <div className="resource-icon">📝</div>
                                <h4>Cheat Sheets</h4>
                                <p>Quick reference cards</p>
                                <button className="download-btn">Download</button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default HelpTutorials;
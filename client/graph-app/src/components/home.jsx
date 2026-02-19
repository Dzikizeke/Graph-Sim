import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, getUserData, logout } from "../simulationAPI";

// Enhanced graph options with icons and colors
const graphOptions = [
  {
    id: "trigonometry",
    name: "Trigonometry",
    description: "Plot sin, cos, tan, and other trig functions with interactive parameters",
    icon: "📊",
    color: "#4f46e5",
    comingSoon: false
  },
  {
    id: "statistics",
    name: "Statistics",
    description: "Plot histograms, distributions, and analyze datasets with statistical tools",
    icon: "📈",
    color: "#059669",
    comingSoon: false
  },
  {
    id: "ode",
    name: "ODE Solver",
    description: "Solve and visualize ordinary differential equations with multiple methods",
    icon: "⚡",
    color: "#dc2626",
    comingSoon: true
  },
  {
    id: "calculus",
    name: "Calculus",
    description: "Derivatives, integrals, limits, and tangent lines with step-by-step visualization",
    icon: "∫",
    color: "#9333ea",
    comingSoon: false
  },
  {
    id: "custom",
    name: "Custom Functions",
    description: "Plot any mathematical function with custom expressions",
    icon: "🔧",
    color: "#ea580c",
    comingSoon: false
  },
  {
    id: "pde",
    name: "PDE Visualizer",
    description: "Visualize solutions to partial differential equations in 2D/3D",
    icon: "🌊",
    color: "#7c3aed",
    comingSoon: true
  },
  {
    id: "fourier",
    name: "Fourier Analysis",
    description: "Explore Fourier series and transforms with interactive components",
    icon: "🌀",
    color: "#0891b2",
    comingSoon: true
  }
];

// Sample recent simulations data
const recentSimulations = [
  { id: 1, name: "Sine Wave", type: "trigonometry", date: "2024-01-15" },
  { id: 2, name: "Normal Distribution", type: "statistics", date: "2024-01-14" },
  { id: 3, name: "Simple Harmonic Motion", type: "ode", date: "2024-01-13" }
];

const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeNav, setActiveNav] = useState("dashboard");
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Authentication check
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsAuth(authenticated);

      if (authenticated) {
        const userData = getUserData();
        setUser(userData);
      } else {
        // Redirect to landing page if not authenticated
        navigate('/landing-page', { replace: true });
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/landing-page', { replace: true });
  };

  const handleGraphSelect = (graphId) => {
    if (!isAuth) return;
    navigate(`/graph/${graphId}`);
  };

  const handleNavClick = (navItem) => {
    if (!isAuth) return;

    setActiveNav(navItem);

    switch (navItem) {
      case 'dashboard':
        // Already on home page
        break;
      case 'favorites':
        navigate('/favorites');
        break;
      case 'simulations':
        navigate('/my-simulations');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'help':
        navigate('/help-tutorials');
        break;
      default:
        break;
    }
  };

  const handleQuickAction = (action) => {
    if (!isAuth) return;

    switch (action) {
      case 'new-plot':
        navigate('/graph/custom');
        break;
      case 'import-data':
        // Handle import data functionality
        console.log('Import data clicked');
        break;
      case 'examples':
        // Show examples modal or navigate to examples page
        console.log('Examples clicked');
        break;
      default:
        break;
    }
  };

  const handleRecentSimulationClick = (simulation) => {
    if (!isAuth) return;
    // Navigate to the simulation type with pre-loaded data
    navigate(`/graph/${simulation.type}`);
  };

  const filteredOptions = graphOptions.filter(option => {
    const matchesSearch = option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" ||
      (activeTab === "available" && !option.comingSoon) ||
      (activeTab === "coming-soon" && option.comingSoon);

    return matchesSearch && matchesTab;
  });

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="spinner-large"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show nothing if not authenticated (will redirect due to useEffect)
  if (!isAuth) {
    return null;
  }

  return (
    <div className="home-container">
      {/* Enhanced Side Panel */}
      <aside className="side-panel">
        <div className="user-section">
          <div className="user-avatar">
            {user?.username?.charAt(0).toUpperCase() || '👤'}
          </div>

          <div className="user-status">
            <div className="status-dot"></div>
            <span className="status-text">Online</span>
          </div>

          <h2>{user?.username || 'User'}</h2>
          
          <p>Start visualizing mathematics</p>

          {/* Logout Button */}
          <button
            className="logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            🚪 Logout
          </button>
        </div>

        <nav className="side-nav">
          <ul>
            <li
              className={`nav-item ${activeNav === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleNavClick('dashboard')}
            >
              <span>🏠</span>
              Dashboard
            </li>
            <li
              className={`nav-item ${activeNav === 'favorites' ? 'active' : ''}`}
              onClick={() => handleNavClick('favorites')}
            >
              <span>⭐</span>
              Favorites
            </li>
            <li
              className={`nav-item ${activeNav === 'simulations' ? 'active' : ''}`}
              onClick={() => handleNavClick('simulations')}
            >
              <span>📚</span>
              My Simulations
            </li>
            <li
              className={`nav-item ${activeNav === 'settings' ? 'active' : ''}`}
              onClick={() => handleNavClick('settings')}
            >
              <span>⚙️</span>
              Settings
            </li>
            <li
              className={`nav-item ${activeNav === 'help' ? 'active' : ''}`}
              onClick={() => handleNavClick('help')}
            >
              <span>❓</span>
              Help & Tutorials
            </li>
          </ul>
        </nav>

        {/* Recent Simulations */}
        <div className="recent-section">
          <h4>Recent Simulations</h4>
          {recentSimulations.map(sim => (
            <div
              key={sim.id}
              className="recent-item"
              onClick={() => handleRecentSimulationClick(sim)}
            >
              <span className="recent-icon">📊</span>
              <div className="recent-info">
                <span className="recent-name">{sim.name}</span>
                <span className="recent-date">{sim.date}</span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Enhanced Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="main-header">
          <h1>Math Visualization Studio</h1>
          <p>Welcome back, {user?.first_name ? user?.first_name : user?.username}! Explore, simulate, and visualize mathematical concepts interactively</p>
        </header>

        {/* Search and Filter Bar */}
        <div className="controls-bar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search graph types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="filter-tabs">
            <button
              className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All
            </button>
            <button
              className={`tab-btn ${activeTab === "available" ? "active" : ""}`}
              onClick={() => setActiveTab("available")}
            >
              Available
            </button>
            <button
              className={`tab-btn ${activeTab === "coming-soon" ? "active" : ""}`}
              onClick={() => setActiveTab("coming-soon")}
            >
              Coming Soon
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button
              className="action-btn"
              onClick={() => handleQuickAction('new-plot')}
            >
              <span>✨</span>
              New Plot
            </button>
            <button
              className="action-btn"
              onClick={() => handleQuickAction('import-data')}
            >
              <span>📁</span>
              Import Data
            </button>
            <button
              className="action-btn"
              onClick={() => handleQuickAction('examples')}
            >
              <span>🎯</span>
              Examples
            </button>
          </div>
        </div>

        {/* Graph Options Grid */}
        <section className="graph-section">
          <h2>Choose a Graph Type</h2>
          <div className="options-grid">
            {filteredOptions.map((option) => (
              <div
                key={option.id}
                className={`graph-card ${option.comingSoon ? "coming-soon" : ""}`}
                onClick={() => !option.comingSoon && handleGraphSelect(option.id)}
              >
                <div
                  className="card-header"
                  style={{ backgroundColor: option.color }}
                >
                  <span className="card-icon">{option.icon}</span>
                </div>
                <div className="card-content">
                  <h3>{option.name}</h3>
                  <p>{option.description}</p>
                  {option.comingSoon && (
                    <div className="coming-soon-badge">Coming Soon</div>
                  )}
                </div>
                <div className="card-footer">
                  {!option.comingSoon ? (
                    <button className="go-btn">Explore →</button>
                  ) : (
                    <button className="disabled-btn" disabled>Not Available</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Examples Section */}
        <section className="featured-section">
          <h2>Featured Examples</h2>
          <div className="examples-grid">
            <div
              className="example-card"
              onClick={() => navigate('/graph/trigonometry')}
            >
              <div className="example-preview" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}></div>
              <h4>Sine Wave Interference</h4>
              <p>Visualize wave superposition</p>
            </div>
            <div
              className="example-card"
              onClick={() => navigate('/graph/statistics')}
            >
              <div className="example-preview" style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}></div>
              <h4>Population Growth Model</h4>
              <p>Logistic growth simulation</p>
            </div>
            <div
              className="example-card"
              onClick={() => navigate('/graph/ode')}
            >
              <div className="example-preview" style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" }}></div>
              <h4>Heat Equation</h4>
              <p>2D heat distribution over time</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
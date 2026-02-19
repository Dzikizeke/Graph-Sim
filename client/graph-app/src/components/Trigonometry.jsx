import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Plot from 'react-plotly.js';
import { isAuthenticated, getUserData, logout, simulationAPI } from '../simulationAPI';

const Trigonometry = () => {
  const navigate = useNavigate();
  // Add this state variable
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Enhanced fullscreen toggle
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      // Enter fullscreen
      setIsFullscreen(true);
      document.body.style.overflow = 'hidden';
    } else {
      // Exit fullscreen
      setIsFullscreen(false);
      document.body.style.overflow = 'auto';
    }
  };

  // Authentication state
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
        loadSavedSimulations();
        setIsLoading(false);
      } else {
        // Redirect to landing page if not authenticated
        navigate('/landing-page', { replace: true });
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/landing-page', { replace: true });
  };

  // State for function parameters
  const [functions, setFunctions] = useState([
    { id: 1, type: 'sin', amplitude: 1, frequency: 1, phase: 0, visible: true, color: '#4f46e5' }
  ]);

  // Enhanced plot config for better interaction
  const plotConfig = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToAdd: [
      'zoom2d',
      'pan2d',
      'zoomIn2d',
      'zoomOut2d',
      'autoScale2d',
      'resetScale2d',
      'toggleSpikelines'
    ],
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    scrollZoom: true,
    responsive: true,
    doubleClick: 'reset+autosize',
    showTips: true,
    showAxisDragHandles: true,
    showAxisRangeEntryBoxes: true
  };

  // Enhanced layout for better studying
  const getPlotLayout = () => ({
    title: {
      text: `Trigonometric Functions - ${simulationName}`,
      font: { size: 16, color: '#fff' }
    },
    xaxis: {
      title: {
        text: 'x (radians)',
        font: { size: 12, color: '#fff' }
      },
      gridcolor: 'rgba(255, 255, 255, 0.1)',
      zerolinecolor: 'rgba(255, 255, 255, 0.3)',
      zerolinewidth: 2,
      showgrid: true,
      showline: true,
      mirror: true,
      ticks: 'outside',
      tickcolor: 'rgba(255, 255, 255, 0.5)',
      fixedrange: false,
      rangeslider: { visible: false }
    },
    yaxis: {
      title: {
        text: 'f(x)',
        font: { size: 12, color: '#fff' }
      },
      gridcolor: 'rgba(255, 255, 255, 0.1)',
      zerolinecolor: 'rgba(255, 255, 255, 0.3)',
      zerolinewidth: 2,
      showgrid: true,
      showline: true,
      mirror: true,
      ticks: 'outside',
      tickcolor: 'rgba(255, 255, 255, 0.5)',
      fixedrange: false
    },
    plot_bgcolor: 'rgba(0, 0, 0, 0)',
    paper_bgcolor: 'rgba(0, 0, 0, 0)',
    font: { color: '#fff', family: 'Arial' },
    showlegend: true,
    legend: {
      x: 0,
      y: 1,
      bgcolor: 'rgba(30, 30, 30, 0.8)',
      bordercolor: 'rgba(255, 255, 255, 0.2)',
      borderwidth: 1,
      font: { size: 11 }
    },
    hovermode: 'closest',
    dragmode: 'pan', // Changed to pan for better navigation
    margin: { l: 60, r: 40, t: 60, b: 50 },
    autosize: true,
    // Add mathematical notations
    annotations: [
      {
        x: 2.5,
        y: 0,
        xref: 'x',
        yref: 'y',
        text: 'π ≈ 3.14',
        showarrow: true,
        arrowhead: 7,
        ax: 0,
        ay: -40,
        bgcolor: 'rgba(102, 126, 234, 0.8)',
        bordercolor: 'rgba(102, 126, 234, 1)',
        borderwidth: 1,
        font: { color: 'white', size: 10 }
      }
    ]
  });


  // Enhanced educational info with mathematical formulas
  const educationalInfo = [
    {
      title: "Sine Function",
      formula: "f(x) = A·sin(ωx + φ)",
      description: "Represents periodic oscillations",
      properties: [
        "A = Amplitude (peak displacement)",
        "ω = Angular frequency (radians/unit)",
        "φ = Phase shift (horizontal displacement)",
        "Period = 2π/ω",
        "Range = [-A, A]"
      ]
    },
    {
      title: "Cosine Function",
      formula: "f(x) = A·cos(ωx + φ)",
      description: "Sine function shifted by π/2 radians",
      properties: [
        "cos(x) = sin(x + π/2)",
        "Even function: cos(-x) = cos(x)",
        "Period = 2π/ω",
        "Range = [-A, A]",
        "Zeros at x = π/2 + nπ"
      ]
    },
    {
      title: "Tangent Function",
      formula: "f(x) = A·tan(ωx + φ)",
      description: "Ratio of sine to cosine functions",
      properties: [
        "tan(x) = sin(x)/cos(x)",
        "Period = π/ω",
        "Asymptotes where cos(ωx + φ) = 0",
        "Range = (-∞, ∞)",
        "Odd function: tan(-x) = -tan(x)"
      ]
    }
  ];

  const [xRange, setXRange] = useState({ min: -2 * Math.PI, max: 2 * Math.PI });
  const [points, setPoints] = useState(500);
  const [graphData, setGraphData] = useState([]);
  const [activeTab, setActiveTab] = useState('plot');
  const [savedSimulations, setSavedSimulations] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [simulationName, setSimulationName] = useState('My Trigonometry Graph');

  // Predefined function templates
  const functionTemplates = [
    { name: 'Simple Sine', type: 'sin', amplitude: 1, frequency: 1, phase: 0 },
    { name: 'Cosine Wave', type: 'cos', amplitude: 1, frequency: 1, phase: 0 },
    { name: 'Tangent', type: 'tan', amplitude: 1, frequency: 1, phase: 0 },
    { name: 'Double Frequency Sine', type: 'sin', amplitude: 1, frequency: 2, phase: 0 },
    { name: 'Phase Shifted Cosine', type: 'cos', amplitude: 1, frequency: 1, phase: Math.PI / 2 },
    { name: 'Amplitude Modulated', type: 'sin', amplitude: 2, frequency: 1, phase: 0 }
  ];

  // Default configuration that loads when no saved graphs exist
  const defaultConfiguration = {
    name: 'Default Sine Wave',
    x_min: -2 * Math.PI,
    x_max: 2 * Math.PI,
    points: 500,
    functions: [
      {
        type: 'sin',
        amplitude: 1,
        frequency: 1,
        phase: 0,
        color: '#4f46e5',
        visible: true
      }
    ]
  };

  // Updated loadSavedSimulations
  const loadSavedSimulations = async () => {
    try {
      const response = await simulationAPI.getSimulationsByType('trigonometry');
      if (response.status === 'success') {
        setSavedSimulations(response.data);

        if (response.data.length > 0) {
          // Sort by updated_at descending and load the most recent one
          const sortedSimulations = [...response.data].sort((a, b) =>
            new Date(b.updated_at) - new Date(a.updated_at)
          );
          const latestSimulation = sortedSimulations[0];
          await loadConfiguration(latestSimulation.id, true); // true indicates initial load
        } else {
          // If no saved simulations exist, load the default configuration
          loadDefaultConfiguration();
        }
      }
      setIsInitialLoad(false);
    } catch (error) {
      console.error('Error loading simulations:', error);
      // If there's an error loading, load the default
      loadDefaultConfiguration();
      setIsInitialLoad(false);
    }
  };

  // Load default configuration
  const loadDefaultConfiguration = () => {
    setSimulationName(defaultConfiguration.name);
    setXRange({
      min: defaultConfiguration.x_min,
      max: defaultConfiguration.x_max
    });
    setPoints(defaultConfiguration.points);

    const defaultFunctions = defaultConfiguration.functions.map((func, index) => ({
      id: Date.now() + index,
      ...func
    }));
    setFunctions(defaultFunctions);
  };

  // Save current configuration
  const saveConfiguration = async () => {
    if (!isAuth) return;

    setIsSaving(true);
    setSaveMessage('');

    try {
      const configData = {
        name: simulationName,
        x_min: xRange.min,
        x_max: xRange.max,
        points: points,
        functions: functions.map(func => ({
          type: func.type,
          amplitude: func.amplitude,
          frequency: func.frequency,
          phase: func.phase,
          color: func.color,
          visible: func.visible
        }))
      };

      const response = await simulationAPI.saveTrigonometryConfig(configData);

      if (response.status === 'success') {
        setSaveMessage('Configuration saved successfully!');
        await loadSavedSimulations(); // Reload the list
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('Error saving configuration');
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveMessage('Error saving configuration');
    } finally {
      setIsSaving(false);
    }
  };


  // Updated loadConfiguration with initialLoad parameter
  const loadConfiguration = async (simulationId, isInitialLoad = false) => {
    try {
      const response = await simulationAPI.getSimulation(simulationId);
      if (response.status === 'success') {
        const sim = response.data;
        setSimulationName(sim.name);

        if (sim.config_data) {
          setXRange({
            min: sim.config_data.x_min || -2 * Math.PI,
            max: sim.config_data.x_max || 2 * Math.PI
          });
          setPoints(sim.config_data.points || 500);

          if (sim.config_data.functions && sim.config_data.functions.length > 0) {
            const loadedFunctions = sim.config_data.functions.map((func, index) => ({
              id: Date.now() + index,
              type: func.type,
              amplitude: func.amplitude,
              frequency: func.frequency,
              phase: func.phase,
              color: func.color,
              visible: func.visible !== false
            }));
            setFunctions(loadedFunctions);
          } else {
            setFunctions([]);
          }
        }

        // Only show message if manually triggered, not on initial load
        if (!isInitialLoad) {
          setSaveMessage('Configuration loaded!');
          setTimeout(() => setSaveMessage(''), 2000);
        }
      }
    } catch (error) {
      console.error('Load error:', error);
      if (!isInitialLoad) {
        setSaveMessage('Error loading configuration');
      }
    }
  };

  // Delete a saved configuration
  const deleteConfiguration = async (simulationId) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      try {
        await simulationAPI.deleteSimulation(simulationId);
        setSaveMessage('Configuration deleted!');

        // This will automatically handle loading the next latest or default
        await loadSavedSimulations();

        setTimeout(() => setSaveMessage(''), 2000);
      } catch (error) {
        console.error('Delete error:', error);
        setSaveMessage('Error deleting configuration');
      }
    }
  };

  // Toggle favorite
  const toggleFavorite = async (simulationId) => {
    try {
      await simulationAPI.toggleFavorite(simulationId);
      await loadSavedSimulations();
    } catch (error) {
      console.error('Favorite toggle error:', error);
    }
  };

  // Calculate function values
  const calculateFunction = (func, x) => {
    const angle = func.frequency * x + func.phase;
    switch (func.type) {
      case 'sin': return func.amplitude * Math.sin(angle);
      case 'cos': return func.amplitude * Math.cos(angle);
      case 'tan': return func.amplitude * Math.tan(angle);
      default: return 0;
    }
  };

  // Enhanced graph data generation with better visuals
  useEffect(() => {
    if (!isAuth) return;

    const newData = functions.filter(f => f.visible).map(func => {
      const xValues = [];
      const yValues = [];

      for (let i = 0; i < points; i++) {
        const x = xRange.min + (i / (points - 1)) * (xRange.max - xRange.min);
        xValues.push(x);

        try {
          const y = calculateFunction(func, x);
          // Better handling of asymptotes for tangent
          if (func.type === 'tan' && (Math.abs(y) > 10 || !isFinite(y))) {
            yValues.push(null);
          } else {
            yValues.push(y);
          }
        } catch {
          yValues.push(null);
        }
      }

      // Enhanced line styling for better visibility
      return {
        x: xValues,
        y: yValues,
        type: 'scatter',
        mode: 'lines',
        name: `${func.type.toUpperCase()} (A=${func.amplitude}, f=${func.frequency}, φ=${func.phase.toFixed(2)})`,
        line: {
          color: func.color,
          width: 3,
          shape: 'spline',
          smoothing: 1.3
        },
        hovertemplate: `
          <b>${func.type}(x)</b><br>
          x: %{x:.3f}<br>
          y: %{y:.3f}<br>
          A=${func.amplitude}, ω=${func.frequency}, φ=${func.phase.toFixed(2)}
          <extra></extra>
        `,
        // Add markers for key points
        marker: {
          size: 0,
          color: func.color
        }
      };
    });

    setGraphData(newData);
  }, [functions, xRange, points, isAuth]);

  // Add new function
  const addFunction = (template = null) => {
    if (!isAuth) return;

    const newFunc = template ? { ...template } : {
      id: Date.now(),
      type: 'sin',
      amplitude: 1,
      frequency: 1,
      phase: 0,
      visible: true,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
    };

    setFunctions(prev => [...prev, { ...newFunc, id: Date.now() }]);
  };

  // Remove function
  const removeFunction = (id) => {
    if (!isAuth) return;
    setFunctions(prev => prev.filter(f => f.id !== id));
  };

  // Update function parameter
  const updateFunction = (id, field, value) => {
    if (!isAuth) return;
    setFunctions(prev => prev.map(func =>
      func.id === id ? { ...func, [field]: parseFloat(value) || value } : func
    ));
  };

  // Toggle function visibility
  const toggleVisibility = (id) => {
    if (!isAuth) return;
    setFunctions(prev => prev.map(func =>
      func.id === id ? { ...func, visible: !func.visible } : func
    ));
  };

  // Reset to default
  const resetFunctions = () => {
    if (!isAuth) return;
    loadDefaultConfiguration();
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="spinner-large"></div>
          <p>Loading trigonometry visualizer...</p>
        </div>
      </div>
    );
  }

  // Show nothing if not authenticated (will redirect due to useEffect)
  if (!isAuth) {
    return null;
  }

  return (
    <div className="trigonometry-page">
      {/* Header */}
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <div className="header-user">
          <span className="welcome-text">Welcome, {user?.username || 'User'}!</span>
          <button className="logout-btn-small" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
        <h1>Trigonometry Visualizer</h1>
        <p>Explore sine, cosine, and tangent functions with interactive parameters</p>
      </header>

      <div className="trig-content">
        {/* Controls Sidebar */}
        <aside className="controls-sidebar">
          {/* Save Configuration Section */}
          <div className="control-section">
            <h3>💾 Save Configuration</h3>
            <div className="control-group">
              <label>Configuration Name:</label>
              <input
                type="text"
                value={simulationName}
                onChange={(e) => setSimulationName(e.target.value)}
                placeholder="Enter configuration name"
              />
            </div>
            <button
              className={`save-btn ${isSaving ? 'saving' : ''}`}
              onClick={saveConfiguration}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : '💾 Save Configuration'}
            </button>
            {saveMessage && (
              <div className={`save-message ${saveMessage.includes('Error') ? 'error' : 'success'}`}>
                {saveMessage}
              </div>
            )}
          </div>

          <div className="control-section">
            <h3>📊 Graph Settings</h3>
            <div className="control-group">
              <label>X Min:</label>
              <input
                type="number"
                value={xRange.min}
                onChange={(e) => setXRange(prev => ({ ...prev, min: parseFloat(e.target.value) }))}
                step="0.1"
              />
            </div>
            <div className="control-group">
              <label>X Max:</label>
              <input
                type="number"
                value={xRange.max}
                onChange={(e) => setXRange(prev => ({ ...prev, max: parseFloat(e.target.value) }))}
                step="0.1"
              />
            </div>
            <div className="control-group">
              <label>Points:</label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value))}
                min="50"
                max="2000"
              />
            </div>
          </div>

          <div className="control-section">
            <h3>🎯 Quick Templates</h3>
            <div className="templates-grid">
              {functionTemplates.map((template, index) => (
                <button
                  key={index}
                  className="template-btn"
                  onClick={() => addFunction(template)}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          <div className="control-section">
            <div className="section-header">
              <h3>📈 Functions</h3>
              <button className="add-btn" onClick={() => addFunction()}>
                + Add
              </button>
            </div>

            <div className="functions-list">
              {functions.map((func, index) => (
                <div key={func.id} className="function-card">
                  <div className="function-header">
                    <span className="function-title">
                      Function {index + 1} ({func.type})
                    </span>
                    <button
                      className="remove-btn"
                      onClick={() => removeFunction(func.id)}
                    >
                      ×
                    </button>
                  </div>

                  <div className="function-controls">
                    <div className="control-row">
                      <label>Type:</label>
                      <select
                        value={func.type}
                        onChange={(e) => updateFunction(func.id, 'type', e.target.value)}
                      >
                        <option value="sin">Sine</option>
                        <option value="cos">Cosine</option>
                        <option value="tan">Tangent</option>
                      </select>
                    </div>

                    <div className="control-row">
                      <label>Amplitude:</label>
                      <input
                        type="range"
                        min="0.1"
                        max="20"
                        step="0.1"
                        value={func.amplitude}
                        onChange={(e) => updateFunction(func.id, 'amplitude', e.target.value)}
                      />
                      <span>{func.amplitude}</span>
                    </div>

                    <div className="control-row">
                      <label>Frequency:</label>
                      <input
                        type="range"
                        min="0.1"
                        max="10"
                        step="0.1"
                        value={func.frequency}
                        onChange={(e) => updateFunction(func.id, 'frequency', e.target.value)}
                      />
                      <span>{func.frequency}</span>
                    </div>

                    <div className="control-row">
                      <label>Phase:</label>
                      <input
                        type="range"
                        min="-2*Math.PI"
                        max="2*Math.PI"
                        step="0.1"
                        value={func.phase}
                        onChange={(e) => updateFunction(func.id, 'phase', e.target.value)}
                      />
                      <span>{func.phase.toFixed(2)}</span>
                    </div>

                    <div className="control-row">
                      <label>Color:</label>
                      <input
                        type="color"
                        value={func.color}
                        onChange={(e) => updateFunction(func.id, 'color', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="function-actions">
                    <button
                      className={`visibility-btn ${func.visible ? 'visible' : 'hidden'}`}
                      onClick={() => toggleVisibility(func.id)}
                    >
                      {func.visible ? '👁️ Visible' : '👁️‍🗨️ Hidden'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Configurations */}
          <div className="control-section">
            <h3>📁 Saved Configurations</h3>
            <div className="saved-configs-list">
              {savedSimulations.length > 0 ? (
                savedSimulations.map((sim) => (
                  <div key={sim.id} className="saved-config-item">
                    <div className="config-header">
                      <span className="config-name">{sim.name}</span>
                      <button
                        className={`favorite-btn ${sim.is_favorite ? 'favorited' : ''}`}
                        onClick={() => toggleFavorite(sim.id)}
                        title={sim.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {sim.is_favorite ? '⭐' : '☆'}
                      </button>
                    </div>
                    <div className="config-actions">
                      <button
                        className="load-btn"
                        onClick={() => loadConfiguration(sim.id)}
                      >
                        📂 Load
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => deleteConfiguration(sim.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                    <div className="config-meta">
                      {new Date(sim.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-configs-message">
                  <p>No saved configurations yet.</p>
                  <p>Create and save your first graph!</p>
                </div>
              )}
            </div>
          </div>

          <button className="reset-btn" onClick={resetFunctions}>
            🔄 Reset to Default
          </button>
        </aside>

        {/* Main Visualization Area */}
        <main className="visualization-area">
          <div className="visualization-tabs">
            <button
              className={`tab ${activeTab === 'plot' ? 'active' : ''}`}
              onClick={() => setActiveTab('plot')}
            >
              📈 Plot
            </button>
            <button
              className={`tab ${activeTab === 'table' ? 'active' : ''}`}
              onClick={() => setActiveTab('table')}
            >
              📊 Data Table
            </button>
          </div>

          {/* Enhanced Plot Container */}
          {activeTab === 'plot' && (
            <div className={`plot-container ${isFullscreen ? 'fullscreen' : ''}`}>
              <div className="plot-controls">
                <button
                  className="plot-control-btn"
                  onClick={toggleFullscreen}
                  title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Enter Fullscreen'}
                >
                  {isFullscreen ? '⤢ Exit Fullscreen' : '⛶ Fullscreen'}
                </button>
              </div>

              <Plot
                data={graphData}
                layout={getPlotLayout()}
                config={plotConfig}
                style={{
                  width: '100%',
                  height: isFullscreen ? 'calc(100vh - 40px)' : '600px',
                  minHeight: '400px'
                }}
                useResizeHandler={true}
              />
            </div>
          )}


          {activeTab === 'table' && (
            <div className="table-container">
              <h3>Function Values - {simulationName}</h3>
              <div className="table-info">
                <p>Showing {Math.min(points, 100)} points (sampled from {points} total points)</p>
              </div>
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Point #</th>
                      <th>x (radians)</th>
                      {functions.filter(f => f.visible).map((func, index) => (
                        <th key={func.id}>
                          {func.type}(x)
                          {func.amplitude !== 1 || func.frequency !== 1 || func.phase !== 0 ? (
                            <div className="function-params">
                              A={func.amplitude}, ω={func.frequency}, φ={func.phase.toFixed(2)}
                            </div>
                          ) : null}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: Math.min(points, 100) }).map((_, i) => {
                      // Calculate the actual x value based on the current point
                      const x = xRange.min + (i / (Math.min(points, 100) - 1)) * (xRange.max - xRange.min);

                      return (
                        <tr key={i}>
                          <td className="point-number">{i + 1}</td>
                          <td className="x-value">{x.toFixed(4)}</td>
                          {functions.filter(f => f.visible).map(func => {
                            const y = calculateFunction(func, x);
                            return (
                              <td key={func.id} className="y-value">
                                {func.type === 'tan' && (Math.abs(y) > 100 || !isFinite(y)) ?
                                  '∞' : y.toFixed(4)
                                }
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {points > 100 && (
                <div className="table-note">
                  <p>Note: Displaying first 100 points out of {points} total points for better performance.</p>
                </div>
              )}
            </div>
          )}

          {/* Educational Info */}
          {/* Enhanced Educational Section */}
          <div className="educational-section">
            <h3>📚 Trigonometric Functions Reference</h3>
            <div className="info-cards">
              {educationalInfo.map((info, index) => (
                <div key={index} className="info-card">
                  <h4>{info.title}</h4>
                  <div className="math-formula">{info.formula}</div>
                  <p className="function-description">{info.description}</p>
                  <ul className="function-properties">
                    {info.properties.map((prop, propIndex) => (
                      <li key={propIndex}>{prop}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Trigonometry;
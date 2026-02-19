// ODESolver.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Plot from 'react-plotly.js';
import { isAuthenticated, getUserData, logout, simulationAPI } from '../simulationAPI';

const ODESolver = () => {
    const navigate = useNavigate();

    // Authentication state
    const [isAuth, setIsAuth] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Enhanced fullscreen toggle
    const toggleFullscreen = () => {
        if (!isFullscreen) {
            setIsFullscreen(true);
            document.body.style.overflow = 'hidden';
        } else {
            setIsFullscreen(false);
            document.body.style.overflow = 'auto';
        }
    };

    // Add this useEffect to load ODE methods
    useEffect(() => {
        const loadODEMethods = async () => {
            try {
                const response = await simulationAPI.getODEMethods();
                if (response.status === 'success') {
                    // You can store methods if needed for dynamic dropdowns
                    console.log('Available ODE methods:', response.data.methods);
                }
            } catch (error) {
                console.error('Error loading ODE methods:', error);
            }
        };

        if (isAuth) {
            loadODEMethods();
        }
    }, [isAuth]);

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
                navigate('/landing-page', { replace: true });
            }
        };

        checkAuth();
    }, [navigate]);

    // Enhanced validation function
    const validateODEEquation = (expression, equationType = 'firstOrder') => {
        if (!expression.trim()) {
            return { isValid: false, error: 'Expression cannot be empty' };
        }

        // Basic character validation
        const allowedChars = /^[a-zA-Z0-9\s+\-*/().^,_]+$/;
        if (!allowedChars.test(expression.replace(/\s/g, ''))) {
            return { isValid: false, error: 'Expression contains invalid characters. Only letters, numbers, + - * / ( ) . ^ , _ are allowed' };
        }

        // Type-specific validations
        if (equationType === 'firstOrder') {
            // Check for derivative usage in RHS
            if (expression.includes('dy_dt') || expression.includes("dy/dt")) {
                return { isValid: false, error: 'First order ODE RHS should not contain derivatives' };
            }
        }

        if (equationType === 'secondOrder') {
            // For second order, we expect dy_dt usage
            if (!expression.includes('dy_dt') && !expression.includes('y') && !expression.includes('t')) {
                return {
                    isValid: false,
                    error: 'Second order ODE should reference y and/or dy_dt'
                };
            }
        }

        if (equationType === 'system') {
            // Check for basic mathematical structure
            const variables = expression.match(/[a-zA-Z]+/g) || [];
            const mathKeywords = ['sin', 'cos', 'tan', 'exp', 'log', 'sqrt', 'abs'];
            const validVars = variables.filter(v =>
                !mathKeywords.includes(v.toLowerCase()) &&
                /^[a-zA-Z]$/.test(v) // Single letter variables only
            );

            if (validVars.length > 3) {
                return {
                    isValid: false,
                    error: 'Too many variables. System ODEs should use simple variables like x, y, z'
                };
            }
        }

        return { isValid: true, error: null };
    };

    const handleLogout = () => {
        logout();
        navigate('/landing-page', { replace: true });
    };

    // Main state management
    const [activeSection, setActiveSection] = useState('firstOrder');
    const [simulationMode, setSimulationMode] = useState('graphing');
    const [graphData, setGraphData] = useState([]);
    const [validationErrors, setValidationErrors] = useState({});
    const [activeTab, setActiveTab] = useState('plot');

    // Save/load state
    const [savedSimulations, setSavedSimulations] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [simulationName, setSimulationName] = useState('My ODE Simulation');

    // Common ODE settings
    const [odeSettings, setOdeSettings] = useState({
        timeRange: { min: 0, max: 10 },
        points: 1000,
        method: 'rk4', // rk4, euler, etc.
        tolerance: 1e-6
    });

    // 1st Order ODE State
    const [firstOrderOdes, setFirstOrderOdes] = useState([
        {
            id: 1,
            equation: "dy/dt = -k*y",
            expression: "-k*y",
            initialCondition: { y0: 1 },
            parameters: { k: 0.5 },
            color: '#4f46e5',
            visible: true,
            variableName: 'y'
        }
    ]);

    // 2nd Order ODE State
    const [secondOrderOdes, setSecondOrderOdes] = useState([
        {
            id: 1,
            equation: "d²y/dt² = -ω²*y - γ*dy/dt",
            expression: "-ω²*y - γ*dy_dt",
            initialConditions: { y0: 1, dy0: 0 },
            parameters: { ω: 1, γ: 0.1 },
            color: '#10b981',
            visible: true,
            variableName: 'y'
        }
    ]);

    // System of ODEs State
    const [systemOdes, setSystemOdes] = useState({
        numberOfEquations: 2,
        physicalInterpretation: 'none', // none, 1d, 2d, 3d
        equations: [
            {
                id: 1,
                equation: "dx/dt = σ*(y - x)",
                expression: "σ*(y - x)",
                variable: 'x',
                color: '#ef4444',
                visible: true
            },
            {
                id: 2,
                equation: "dy/dt = x*(ρ - z) - y",
                expression: "x*(ρ - z) - y",
                variable: 'y',
                color: '#3b82f6',
                visible: true
            },
            {
                id: 3,
                equation: "dz/dt = x*y - β*z",
                expression: "x*y - β*z",
                variable: 'z',
                color: '#10b981',
                visible: true
            }
        ],
        initialConditions: { x0: 1, y0: 1, z0: 1 },
        parameters: { σ: 10, ρ: 28, β: 8 / 3 }
    });

    const updateGraphData = (solutionData) => {
        if (!solutionData || !solutionData.time || !solutionData.solutions) {
            setGraphData([]);
            return;
        }

        const newGraphData = [];
        const time = solutionData.time;

        // Create traces for each solution variable
        Object.entries(solutionData.solutions).forEach(([variable, values]) => {
            newGraphData.push({
                x: time,
                y: values,
                type: 'scatter',
                mode: 'lines',
                name: variable,
                line: {
                    width: 3,
                    shape: 'spline',
                    smoothing: 1.3
                },
                hovertemplate: `
                <b>${variable}</b><br>
                Time: %{x:.3f}<br>
                Value: %{y:.3f}<br>
                <extra></extra>
            `
            });
        });

        setGraphData(newGraphData);
    };

    // Simulation parameters
    const [simulationParams, setSimulationParams] = useState({
        animationSpeed: 1,
        showTrajectory: true,
        showVectorField: false,
        realTimeParameters: {}
    });

    // Plot configuration
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

    // Layout configuration
    const getPlotLayout = () => {
        const baseLayout = {
            title: {
                text: `ODE Solutions - ${simulationName}`,
                font: { size: 16, color: '#fff' }
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
            margin: { l: 60, r: 40, t: 60, b: 50 },
            autosize: true,
        };

        if (systemOdes.physicalInterpretation === '2d') {
            return {
                ...baseLayout,
                xaxis: {
                    title: { text: 'x', font: { size: 12, color: '#fff' } },
                    gridcolor: 'rgba(255, 255, 255, 0.1)',
                    zerolinecolor: 'rgba(255, 255, 255, 0.3)',
                    showgrid: true
                },
                yaxis: {
                    title: { text: 'y', font: { size: 12, color: '#fff' } },
                    gridcolor: 'rgba(255, 255, 255, 0.1)',
                    zerolinecolor: 'rgba(255, 255, 255, 0.3)',
                    showgrid: true,
                    scaleanchor: 'x'
                }
            };
        } else if (systemOdes.physicalInterpretation === '3d') {
            return {
                ...baseLayout,
                scene: {
                    xaxis: { title: 'x', gridcolor: 'rgba(255, 255, 255, 0.1)' },
                    yaxis: { title: 'y', gridcolor: 'rgba(255, 255, 255, 0.1)' },
                    zaxis: { title: 'z', gridcolor: 'rgba(255, 255, 255, 0.1)' },
                    bgcolor: 'rgba(0,0,0,0)'
                },
                margin: { l: 0, r: 0, b: 0, t: 60 }
            };
        } else {
            // Time series layout
            return {
                ...baseLayout,
                xaxis: {
                    title: { text: 'Time (t)', font: { size: 12, color: '#fff' } },
                    gridcolor: 'rgba(255, 255, 255, 0.1)',
                    zerolinecolor: 'rgba(255, 255, 255, 0.3)',
                    showgrid: true
                },
                yaxis: {
                    title: { text: 'Solution', font: { size: 12, color: '#fff' } },
                    gridcolor: 'rgba(255, 255, 255, 0.1)',
                    zerolinecolor: 'rgba(255, 255, 255, 0.3)',
                    showgrid: true
                }
            };
        }
    };

    // Educational information
    const educationalInfo = {
        firstOrder: [
            {
                title: "First Order ODEs",
                description: "Equations involving first derivatives",
                examples: [
                    "Exponential decay: dy/dt = -k*y",
                    "Logistic growth: dy/dt = r*y*(1 - y/K)",
                    "Newton's cooling: dT/dt = -k*(T - T_env)",
                    "Radioactive decay: dN/dt = -λ*N"
                ]
            },
            {
                title: "Common Forms",
                description: "Standard first order ODE types",
                forms: [
                    "Separable: dy/dt = f(t)*g(y)",
                    "Linear: dy/dt + P(t)*y = Q(t)",
                    "Exact: M(t,y) + N(t,y)*dy/dt = 0",
                    "Homogeneous: dy/dt = f(y/t)"
                ]
            }
        ],
        secondOrder: [
            {
                title: "Second Order ODEs",
                description: "Equations involving second derivatives",
                examples: [
                    "Harmonic oscillator: d²y/dt² + ω²*y = 0",
                    "Damped oscillator: d²y/dt² + γ*dy/dt + ω²*y = 0",
                    "Pendulum: d²θ/dt² + (g/L)*sin(θ) = 0",
                    "Driven oscillator: d²y/dt² + γ*dy/dt + ω²*y = F(t)"
                ]
            }
        ],
        systems: [
            {
                title: "Systems of ODEs",
                description: "Multiple coupled differential equations",
                examples: [
                    "Lotka-Volterra: dx/dt = αx - βxy, dy/dt = δxy - γy",
                    "Lorenz system: dx/dt = σ(y-x), dy/dt = x(ρ-z)-y, dz/dt = xy-βz",
                    "Chemical reactions: Multiple species interactions",
                    "Epidemiological models: SIR, SEIR models"
                ]
            }
        ]
    };

    // Predefined ODE examples
    const odeExamples = {
        firstOrder: [
            { name: 'Exponential Decay', equation: 'dy/dt = -k*y', expression: '-k*y', params: { k: 0.5 }, ics: { y0: 1 } },
            { name: 'Logistic Growth', equation: 'dy/dt = r*y*(1 - y/K)', expression: 'r*y*(1 - y/K)', params: { r: 0.8, K: 100 }, ics: { y0: 10 } },
            { name: 'Newton Cooling', equation: 'dT/dt = -k*(T - T_env)', expression: '-k*(T - T_env)', params: { k: 0.1, T_env: 20 }, ics: { T0: 100 } }
        ],
        secondOrder: [
            { name: 'Simple Harmonic', equation: 'd²y/dt² = -ω²*y', expression: '-ω²*y', params: { ω: 1 }, ics: { y0: 1, dy0: 0 } },
            { name: 'Damped Oscillator', equation: 'd²y/dt² = -ω²*y - γ*dy/dt', expression: '-ω²*y - γ*dy_dt', params: { ω: 1, γ: 0.1 }, ics: { y0: 1, dy0: 0 } },
            { name: 'Nonlinear Pendulum', equation: 'd²θ/dt² = -(g/L)*sin(θ)', expression: '-(g/L)*sin(θ)', params: { g: 9.8, L: 1 }, ics: { θ0: 0.5, dθ0: 0 } }
        ],
        systems: [
            {
                name: 'Lorenz Attractor',
                equations: [
                    { equation: 'dx/dt = σ*(y - x)', expression: 'σ*(y - x)', variable: 'x' },
                    { equation: 'dy/dt = x*(ρ - z) - y', expression: 'x*(ρ - z) - y', variable: 'y' },
                    { equation: 'dz/dt = x*y - β*z', expression: 'x*y - β*z', variable: 'z' }
                ],
                params: { σ: 10, ρ: 28, β: 8 / 3 },
                ics: { x0: 1, y0: 1, z0: 1 },
                interpretation: '3d'
            },
            {
                name: 'Lotka-Volterra',
                equations: [
                    { equation: 'dx/dt = α*x - β*x*y', expression: 'α*x - β*x*y', variable: 'x' },
                    { equation: 'dy/dt = δ*x*y - γ*y', expression: 'δ*x*y - γ*y', variable: 'y' }
                ],
                params: { α: 1, β: 0.1, δ: 0.1, γ: 1 },
                ics: { x0: 10, y0: 5 },
                interpretation: '2d'
            }
        ]
    };

    // Load saved simulations
    const loadSavedSimulations = async () => {
        try {
            const response = await simulationAPI.getSimulationsByType('ode_solver');
            if (response.status === 'success') {
                setSavedSimulations(response.data);
            }
        } catch (error) {
            console.error('Error loading simulations:', error);
        }
    };

    // Save configuration
    const saveConfiguration = async () => {
        if (!isAuth) return;

        setIsSaving(true);
        setSaveMessage('');

        try {
            const configData = {
                name: simulationName,
                section: activeSection,
                simulationMode: simulationMode,
                odeSettings: odeSettings,
                firstOrderOdes: firstOrderOdes,
                secondOrderOdes: secondOrderOdes,
                systemOdes: systemOdes,
                simulationParams: simulationParams
            };

            const response = await simulationAPI.saveODESolverConfig(configData);

            if (response.status === 'success') {
                setSaveMessage('Configuration saved successfully!');
                await loadSavedSimulations();
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

    // Load configuration
    const loadConfiguration = async (simulationId) => {
        try {
            const response = await simulationAPI.getSimulation(simulationId);
            if (response.status === 'success') {
                const sim = response.data;
                setSimulationName(sim.name);

                if (sim.config_data) {
                    setActiveSection(sim.config_data.section || 'firstOrder');
                    setSimulationMode(sim.config_data.simulationMode || 'graphing');
                    setOdeSettings(sim.config_data.odeSettings || odeSettings);

                    if (sim.config_data.firstOrderOdes) setFirstOrderOdes(sim.config_data.firstOrderOdes);
                    if (sim.config_data.secondOrderOdes) setSecondOrderOdes(sim.config_data.secondOrderOdes);
                    if (sim.config_data.systemOdes) setSystemOdes(sim.config_data.systemOdes);
                    if (sim.config_data.simulationParams) setSimulationParams(sim.config_data.simulationParams);
                }

                setSaveMessage('Configuration loaded!');
                setTimeout(() => setSaveMessage(''), 2000);
            }
        } catch (error) {
            console.error('Load error:', error);
            setSaveMessage('Error loading configuration');
        }
    };

    // Delete configuration
    const deleteConfiguration = async (simulationId) => {
        if (window.confirm('Are you sure you want to delete this configuration?')) {
            try {
                await simulationAPI.deleteSimulation(simulationId);
                setSaveMessage('Configuration deleted!');
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

    // First Order ODE Functions
    const addFirstOrderOde = (example = null) => {
        const newOde = example ? {
            equation: example.equation,
            expression: example.expression,
            initialCondition: example.ics,
            parameters: example.params,
            color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
            visible: true,
            variableName: 'y'
        } : {
            equation: "dy/dt = -k*y",
            expression: "-k*y",
            initialCondition: { y0: 1 },
            parameters: { k: 0.5 },
            color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
            visible: true,
            variableName: 'y'
        };

        setFirstOrderOdes(prev => [...prev, { ...newOde, id: Date.now() }]);
    };

    const updateFirstOrderOde = (id, field, value) => {
        setFirstOrderOdes(prev => prev.map(ode =>
            ode.id === id ? { ...ode, [field]: value } : ode
        ));
    };

    const removeFirstOrderOde = (id) => {
        setFirstOrderOdes(prev => prev.filter(ode => ode.id !== id));
    };

    // Second Order ODE Functions
    const addSecondOrderOde = (example = null) => {
        const newOde = example ? {
            equation: example.equation,
            expression: example.expression,
            initialConditions: example.ics,
            parameters: example.params,
            color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
            visible: true,
            variableName: 'y'
        } : {
            equation: "d²y/dt² = -ω²*y - γ*dy/dt",
            expression: "-ω²*y - γ*dy_dt",
            initialConditions: { y0: 1, dy0: 0 },
            parameters: { ω: 1, γ: 0.1 },
            color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
            visible: true,
            variableName: 'y'
        };

        setSecondOrderOdes(prev => [...prev, { ...newOde, id: Date.now() }]);
    };

    const updateSecondOrderOde = (id, field, value) => {
        setSecondOrderOdes(prev => prev.map(ode =>
            ode.id === id ? { ...ode, [field]: value } : ode
        ));
    };

    const removeSecondOrderOde = (id) => {
        setSecondOrderOdes(prev => prev.filter(ode => ode.id !== id));
    };

    // System of ODEs Functions
    const updateSystemEquations = (newCount) => {
        const currentCount = systemOdes.equations.length;

        if (newCount > currentCount) {
            // Add new equations
            const newEquations = [...systemOdes.equations];
            for (let i = currentCount; i < newCount; i++) {
                const vars = ['x', 'y', 'z', 'w', 'u', 'v'];
                const varName = vars[Math.min(i, vars.length - 1)];
                newEquations.push({
                    id: Date.now() + i,
                    equation: `d${varName}/dt = 0`,
                    expression: "0",
                    variable: varName,
                    color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
                    visible: true
                });
            }
            setSystemOdes(prev => ({ ...prev, equations: newEquations }));
        } else {
            // Remove equations
            setSystemOdes(prev => ({
                ...prev,
                equations: prev.equations.slice(0, newCount)
            }));
        }
    };

    const updateSystemEquation = (id, field, value) => {
        setSystemOdes(prev => ({
            ...prev,
            equations: prev.equations.map(eq =>
                eq.id === id ? { ...eq, [field]: value } : eq
            )
        }));
    };

    // Enhanced solve function with validation
    const solveODEs = async () => {
        if (!isAuth) return;

        // Validate before solving
        const errors = {};

        if (activeSection === 'firstOrder') {
            firstOrderOdes.forEach((ode, index) => {
                const validation = validateODEEquation(ode.expression, 'firstOrder');
                if (!validation.isValid) {
                    errors[`firstOrder-${ode.id}`] = validation.error;
                }
            });
        } else if (activeSection === 'secondOrder') {
            secondOrderOdes.forEach((ode, index) => {
                const validation = validateODEEquation(ode.expression, 'secondOrder');
                if (!validation.isValid) {
                    errors[`secondOrder-${ode.id}`] = validation.error;
                }
            });
        } else if (activeSection === 'systems') {
            systemOdes.equations.forEach((eq, index) => {
                const validation = validateODEEquation(eq.expression, 'system');
                if (!validation.isValid) {
                    errors[`system-${eq.id}`] = validation.error;
                }
            });
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            setSaveMessage('Please fix validation errors before solving');
            setTimeout(() => setSaveMessage(''), 3000);
            return;
        }

        setValidationErrors({});

        try {
            setSaveMessage('Solving ODEs...');

            // First save the configuration
            const saveResponse = await simulationAPI.saveODESolverConfig({
                name: simulationName,
                section: activeSection,
                simulationMode: simulationMode,
                odeSettings: odeSettings,
                firstOrderOdes: firstOrderOdes,
                secondOrderOdes: secondOrderOdes,
                systemOdes: systemOdes,
                simulationParams: simulationParams
            });

            if (saveResponse.status === 'success') {
                const configId = saveResponse.data.id;

                // Then solve the ODEs
                const solveResponse = await simulationAPI.solveODE(configId);

                if (solveResponse.status === 'success') {
                    setSaveMessage('ODEs solved successfully!');

                    // Update graph data with solution
                    const solutionData = solveResponse.data.solution_data;
                    updateGraphData(solutionData);

                    // Reload saved simulations to include the new solution
                    await loadSavedSimulations();
                } else {
                    setSaveMessage(`Error: ${solveResponse.message}`);
                }
            } else {
                setSaveMessage(`Error saving configuration: ${saveResponse.message}`);
            }
        } catch (error) {
            console.error('Solve error:', error);
            setSaveMessage('Error solving ODEs');
        }

        setTimeout(() => setSaveMessage(''), 5000);
    };

    const simulateODEs = async () => {
        // For now, use the same as solve since simulation mode isn't fully implemented
        setSaveMessage('Simulation mode coming soon! Using graphing mode for now.');
        await solveODEs();
    };

    // Show loading screen while checking authentication
    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-content">
                    <div className="spinner-large"></div>
                    <p>Loading ODE Solver...</p>
                </div>
            </div>
        );
    }

    if (!isAuth) {
        return null;
    }

    return (
        <div className="custom-funct-page">
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
                <h1>ODE Solver & Visualizer</h1>
                <p>Solve and visualize Ordinary Differential Equations and Systems</p>
            </header>

            <div className="custom-funct-content">
                {/* Controls Sidebar */}
                <aside className="controls-sidebar">
                    {/* Save Configuration */}
                    <div className="control-section">
                        <h3>💾 Save Configuration</h3>
                        <div className="control-group">
                            <label>Simulation Name:</label>
                            <input
                                type="text"
                                value={simulationName}
                                onChange={(e) => setSimulationName(e.target.value)}
                                placeholder="Enter simulation name"
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

                    {/* Mode Selection */}
                    <div className="control-section">
                        <h3>🎮 Operation Mode</h3>
                        <div className="dimension-toggle">
                            <button
                                className={`dimension-btn ${simulationMode === 'graphing' ? 'active' : ''}`}
                                onClick={() => setSimulationMode('graphing')}
                            >
                                📈 Solve & Graph
                            </button>
                            <button
                                className={`dimension-btn ${simulationMode === 'simulation' ? 'active' : ''}`}
                                onClick={() => setSimulationMode('simulation')}
                            >
                                🎬 Simulate
                            </button>
                        </div>
                    </div>

                    {/* ODE Type Selection */}
                    <div className="control-section">
                        <h3>📊 ODE Type</h3>
                        <div className="dimension-toggle" style={{ gridTemplateColumns: '1fr' }}>
                            <button
                                className={`dimension-btn ${activeSection === 'firstOrder' ? 'active' : ''}`}
                                onClick={() => setActiveSection('firstOrder')}
                            >
                                1st Order ODEs
                            </button>
                            <button
                                className={`dimension-btn ${activeSection === 'secondOrder' ? 'active' : ''}`}
                                onClick={() => setActiveSection('secondOrder')}
                            >
                                2nd Order ODEs
                            </button>
                            <button
                                className={`dimension-btn ${activeSection === 'systems' ? 'active' : ''}`}
                                onClick={() => setActiveSection('systems')}
                            >
                                Systems of ODEs
                            </button>
                        </div>
                    </div>

                    {/* Common Settings */}
                    <div className="control-section">
                        <h3>⚙️ Solution Settings</h3>
                        <div className="control-group">
                            <label>Time Start:</label>
                            <input
                                type="number"
                                value={odeSettings.timeRange.min}
                                onChange={(e) => setOdeSettings(prev => ({
                                    ...prev,
                                    timeRange: { ...prev.timeRange, min: parseFloat(e.target.value) }
                                }))}
                                step="0.1"
                            />
                        </div>
                        <div className="control-group">
                            <label>Time End:</label>
                            <input
                                type="number"
                                value={odeSettings.timeRange.max}
                                onChange={(e) => setOdeSettings(prev => ({
                                    ...prev,
                                    timeRange: { ...prev.timeRange, max: parseFloat(e.target.value) }
                                }))}
                                step="0.1"
                            />
                        </div>
                        <div className="control-group">
                            <label>Points:</label>
                            <input
                                type="number"
                                value={odeSettings.points}
                                onChange={(e) => setOdeSettings(prev => ({
                                    ...prev,
                                    points: Math.max(100, Math.min(parseInt(e.target.value) || 1000, 10000))
                                }))}
                                min="100"
                                max="10000"
                            />
                        </div>
                        <div className="control-group">
                            <label>Method:</label>
                            <select
                                value={odeSettings.method}
                                onChange={(e) => setOdeSettings(prev => ({ ...prev, method: e.target.value }))}
                            >
                                <option value="rk4">Runge-Kutta 4th Order</option>
                                <option value="rk45">Runge-Kutta-Fehlberg (RK45)</option>
                                <option value="dopri5">Dormand-Prince (DOPRI5)</option>
                                <option value="bdf">Backward Differentiation Formula</option>
                                <option value="radau">Radau IIA (Implicit)</option>
                                <option value="euler">Euler Method</option>
                                <option value="midpoint">Midpoint Method</option>
                                <option value="heun">Heun Method</option>
                                <option value="rk23">Runge-Kutta 2nd/3rd Order</option>
                                <option value="lsoda">LSODA (Adaptive)</option>
                            </select>
                        </div>
                    </div>

                    {/* First Order ODE Controls */}
                    {activeSection === 'firstOrder' && (
                        <div className="control-section">
                            <div className="section-header">
                                <h3>1️⃣ First Order ODEs</h3>
                                <button className="add-btn" onClick={() => addFirstOrderOde()}>
                                    + Add
                                </button>
                            </div>

                            <div className="examples-grid">
                                {odeExamples.firstOrder.map((example, index) => (
                                    <button
                                        key={index}
                                        className="example-btn"
                                        onClick={() => addFirstOrderOde(example)}
                                    >
                                        {example.name}
                                    </button>
                                ))}
                            </div>

                            <div className="functions-list">
                                {firstOrderOdes.map((ode, index) => (
                                    <div key={ode.id} className="function-card">
                                        <div className="function-header">
                                            <span className="function-title">
                                                ODE {index + 1}
                                            </span>
                                            <button
                                                className="remove-btn"
                                                onClick={() => removeFirstOrderOde(ode.id)}
                                            >
                                                ×
                                            </button>
                                        </div>

                                        <div className="function-controls">
                                            <div className="control-row">
                                                <label>Equation:</label>
                                                <input
                                                    type="text"
                                                    value={ode.equation}
                                                    onChange={(e) => updateFirstOrderOde(ode.id, 'equation', e.target.value)}
                                                    placeholder="dy/dt = f(t, y)"
                                                />
                                            </div>
                                            <div className="control-row">
                                                <label>RHS Expression:</label>
                                                <input
                                                    type="text"
                                                    value={ode.expression}
                                                    onChange={(e) => {
                                                        updateFirstOrderOde(ode.id, 'expression', e.target.value);
                                                        // Real-time validation
                                                        const validation = validateODEEquation(e.target.value, 'firstOrder');
                                                        setValidationErrors(prev => ({
                                                            ...prev,
                                                            [`firstOrder-${ode.id}`]: validation.error
                                                        }));
                                                    }}
                                                    onBlur={(e) => {
                                                        // Final validation on blur
                                                        const validation = validateODEEquation(e.target.value, 'firstOrder');
                                                        setValidationErrors(prev => ({
                                                            ...prev,
                                                            [`firstOrder-${ode.id}`]: validation.error
                                                        }));
                                                    }}
                                                    placeholder="f(t, y)"
                                                    className={validationErrors[`firstOrder-${ode.id}`] ? 'error' : ''}
                                                />
                                                {validationErrors[`firstOrder-${ode.id}`] && (
                                                    <div className="error-message">{validationErrors[`firstOrder-${ode.id}`]}</div>
                                                )}
                                            </div>
                                            <div className="control-row">
                                                <label>Initial y(0):</label>
                                                <input
                                                    type="number"
                                                    value={ode.initialCondition.y0}
                                                    onChange={(e) => updateFirstOrderOde(ode.id, 'initialCondition', {
                                                        ...ode.initialCondition,
                                                        y0: parseFloat(e.target.value)
                                                    })}
                                                    step="0.1"
                                                />
                                            </div>
                                            <div className="control-row">
                                                <label>Color:</label>
                                                <input
                                                    type="color"
                                                    value={ode.color}
                                                    onChange={(e) => updateFirstOrderOde(ode.id, 'color', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Second Order ODE Controls */}
                    {activeSection === 'secondOrder' && (
                        <div className="control-section">
                            <div className="section-header">
                                <h3>2️⃣ Second Order ODEs</h3>
                                <button className="add-btn" onClick={() => addSecondOrderOde()}>
                                    + Add
                                </button>
                            </div>

                            <div className="examples-grid">
                                {odeExamples.secondOrder.map((example, index) => (
                                    <button
                                        key={index}
                                        className="example-btn"
                                        onClick={() => addSecondOrderOde(example)}
                                    >
                                        {example.name}
                                    </button>
                                ))}
                            </div>

                            <div className="functions-list">
                                {secondOrderOdes.map((ode, index) => (
                                    <div key={ode.id} className="function-card">
                                        <div className="function-header">
                                            <span className="function-title">
                                                ODE {index + 1}
                                            </span>
                                            <button
                                                className="remove-btn"
                                                onClick={() => removeSecondOrderOde(ode.id)}
                                            >
                                                ×
                                            </button>
                                        </div>

                                        <div className="function-controls">
                                            <div className="control-row">
                                                <label>Equation:</label>
                                                <input
                                                    type="text"
                                                    value={ode.equation}
                                                    onChange={(e) => updateSecondOrderOde(ode.id, 'equation', e.target.value)}
                                                    placeholder="d²y/dt² = f(t, y, dy/dt)"
                                                />
                                            </div>
                                            <div className="control-row">
                                                <label>RHS Expression:</label>
                                                <input
                                                    type="text"
                                                    value={ode.expression}
                                                    onChange={(e) => {
                                                        updateSecondOrderOde(ode.id, 'expression', e.target.value);
                                                        const validation = validateODEEquation(e.target.value, 'secondOrder');
                                                        setValidationErrors(prev => ({
                                                            ...prev,
                                                            [`secondOrder-${ode.id}`]: validation.error
                                                        }));
                                                    }}
                                                    className={validationErrors[`secondOrder-${ode.id}`] ? 'error' : ''}
                                                    placeholder="f(t, y, dy_dt)"
                                                />
                                                {validationErrors[`secondOrder-${ode.id}`] && (
                                                    <div className="error-message">{validationErrors[`secondOrder-${ode.id}`]}</div>
                                                )}
                                            </div>
                                            <div className="control-row">
                                                <label>y(0):</label>
                                                <input
                                                    type="number"
                                                    value={ode.initialConditions.y0}
                                                    onChange={(e) => updateSecondOrderOde(ode.id, 'initialConditions', {
                                                        ...ode.initialConditions,
                                                        y0: parseFloat(e.target.value)
                                                    })}
                                                    step="0.1"
                                                />
                                            </div>
                                            <div className="control-row">
                                                <label>dy/dt(0):</label>
                                                <input
                                                    type="number"
                                                    value={ode.initialConditions.dy0}
                                                    onChange={(e) => updateSecondOrderOde(ode.id, 'initialConditions', {
                                                        ...ode.initialConditions,
                                                        dy0: parseFloat(e.target.value)
                                                    })}
                                                    step="0.1"
                                                />
                                            </div>
                                            <div className="control-row">
                                                <label>Color:</label>
                                                <input
                                                    type="color"
                                                    value={ode.color}
                                                    onChange={(e) => updateSecondOrderOde(ode.id, 'color', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* System of ODEs Controls */}
                    {activeSection === 'systems' && (
                        <div className="control-section">
                            <h3>🔄 System of ODEs</h3>

                            <div className="control-group">
                                <label>Number of Equations:</label>
                                <input
                                    type="number"
                                    value={systemOdes.numberOfEquations}
                                    onChange={(e) => {
                                        const newCount = parseInt(e.target.value) || 2;
                                        setSystemOdes(prev => ({ ...prev, numberOfEquations: newCount }));
                                        updateSystemEquations(newCount);
                                    }}
                                    min="2"
                                    max="6"
                                />
                            </div>

                            <div className="control-group">
                                <label>Physical Interpretation:</label>
                                <select
                                    value={systemOdes.physicalInterpretation}
                                    onChange={(e) => setSystemOdes(prev => ({
                                        ...prev,
                                        physicalInterpretation: e.target.value
                                    }))}
                                >
                                    <option value="none">Purely Mathematical</option>
                                    <option value="1d">1D Physical Motion</option>
                                    <option value="2d">2D Path</option>
                                    <option value="3d">3D Path</option>
                                </select>
                            </div>

                            <div className="examples-grid">
                                {odeExamples.systems.map((example, index) => (
                                    <button
                                        key={index}
                                        className="example-btn"
                                        onClick={() => {
                                            setSystemOdes({
                                                numberOfEquations: example.equations.length,
                                                physicalInterpretation: example.interpretation,
                                                equations: example.equations.map((eq, i) => ({
                                                    ...eq,
                                                    id: Date.now() + i,
                                                    visible: true
                                                })),
                                                initialConditions: example.ics,
                                                parameters: example.params
                                            });
                                        }}
                                    >
                                        {example.name}
                                    </button>
                                ))}
                            </div>

                            <div className="functions-list">
                                {systemOdes.equations.map((equation, index) => (
                                    <div key={equation.id} className="function-card">
                                        <div className="function-header">
                                            <span className="function-title">
                                                Equation {index + 1} (d{equation.variable}/dt)
                                            </span>
                                        </div>

                                        <div className="function-controls">
                                            <div className="control-row">
                                                <label>Equation:</label>
                                                <input
                                                    type="text"
                                                    value={equation.equation}
                                                    onChange={(e) => updateSystemEquation(equation.id, 'equation', e.target.value)}
                                                    placeholder={`d${equation.variable}/dt = ...`}
                                                />
                                            </div>
                                            <div className="control-row">
                                                <label>RHS Expression:</label>
                                                <input
                                                    type="text"
                                                    value={equation.expression}
                                                    onChange={(e) => {
                                                        updateSystemEquation(equation.id, 'expression', e.target.value);
                                                        const validation = validateODEEquation(e.target.value, 'system');
                                                        setValidationErrors(prev => ({
                                                            ...prev,
                                                            [`system-${equation.id}`]: validation.error
                                                        }));
                                                    }}
                                                    className={validationErrors[`system-${equation.id}`] ? 'error' : ''}
                                                    placeholder={`Expression for d${equation.variable}/dt`}
                                                />
                                                {validationErrors[`system-${equation.id}`] && (
                                                    <div className="error-message">{validationErrors[`system-${equation.id}`]}</div>
                                                )}
                                            </div>
                                            <div className="control-row">
                                                <label>Color:</label>
                                                <input
                                                    type="color"
                                                    value={equation.color}
                                                    onChange={(e) => updateSystemEquation(equation.id, 'color', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Initial Conditions for System */}
                            <div className="control-section" style={{ marginTop: '15px' }}>
                                <h4>Initial Conditions</h4>
                                {Object.entries(systemOdes.initialConditions).map(([key, value]) => (
                                    <div key={key} className="control-group">
                                        <label>{key}:</label>
                                        <input
                                            type="number"
                                            value={value}
                                            onChange={(e) => setSystemOdes(prev => ({
                                                ...prev,
                                                initialConditions: {
                                                    ...prev.initialConditions,
                                                    [key]: parseFloat(e.target.value)
                                                }
                                            }))}
                                            step="0.1"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Parameters for System */}
                            <div className="control-section" style={{ marginTop: '15px' }}>
                                <h4>🔧 Parameters</h4>
                                <div className="parameters-grid">
                                    {Object.entries(systemOdes.parameters).map(([param, value]) => (
                                        <div key={param} className="control-group">
                                            <label>{param}:</label>
                                            <input
                                                type="number"
                                                value={value}
                                                onChange={(e) => setSystemOdes(prev => ({
                                                    ...prev,
                                                    parameters: {
                                                        ...prev.parameters,
                                                        [param]: parseFloat(e.target.value) || 0
                                                    }
                                                }))}
                                                step="0.1"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="parameter-actions">
                                    <button
                                        className="add-btn"
                                        onClick={() => {
                                            const paramName = prompt('Enter new parameter name (single letter):');
                                            if (paramName && /^[a-zA-Z]$/.test(paramName)) {
                                                setSystemOdes(prev => ({
                                                    ...prev,
                                                    parameters: {
                                                        ...prev.parameters,
                                                        [paramName]: 0
                                                    }
                                                }));
                                            } else if (paramName) {
                                                alert('Parameter name must be a single letter (a-z, A-Z)');
                                            }
                                        }}
                                    >
                                        + Add Parameter
                                    </button>

                                    {Object.keys(systemOdes.parameters).length > 0 && (
                                        <button
                                            className="remove-btn"
                                            onClick={() => {
                                                const params = Object.keys(systemOdes.parameters);
                                                const paramToRemove = prompt(`Enter parameter to remove: ${params.join(', ')}`);
                                                if (paramToRemove && systemOdes.parameters[paramToRemove] !== undefined) {
                                                    const newParams = { ...systemOdes.parameters };
                                                    delete newParams[paramToRemove];
                                                    setSystemOdes(prev => ({
                                                        ...prev,
                                                        parameters: newParams
                                                    }));
                                                }
                                            }}
                                        >
                                            - Remove Parameter
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Solve/Simulate Button */}
                    <div className="control-section">
                        <button
                            className="save-btn"
                            onClick={simulationMode === 'graphing' ? solveODEs : simulateODEs}
                        >
                            {simulationMode === 'graphing' ? '🧮 Solve ODEs' : '🎬 Start Simulation'}
                        </button>
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
                                    <p>Create and save your first ODE simulation!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Main Visualization Area */}
                <main className="visualization-area">
                    <div className="visualization-tabs">
                        <button
                            className={`tab ${activeTab === 'plot' ? 'active' : ''}`}
                            onClick={() => setActiveTab('plot')}
                        >
                            📈 Solution Plot
                        </button>
                        <button
                            className={`tab ${activeTab === 'table' ? 'active' : ''}`}
                            onClick={() => setActiveTab('table')}
                        >
                            📊 Data Table
                        </button>
                        <button
                            className={`tab ${activeTab === 'phase' ? 'active' : ''}`}
                            onClick={() => setActiveTab('phase')}
                        >
                            🔄 Phase Space
                        </button>
                    </div>

                    {/* Plot Container */}
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

                            {graphData.length > 0 ? (
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
                            ) : (
                                <div className="no-data-message">
                                    <p>Configure your ODEs and click "Solve ODEs" to see the solutions. Make sure your equations are properly formatted and parameters are set</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Data Table */}
                    {activeTab === 'table' && (
                        <div className="table-container">
                            <h3>ODE Solution Data</h3>
                            <div className="table-info">
                                <p>Numerical solution data will appear here after computation</p>
                            </div>
                        </div>
                    )}

                    {/* Phase Space */}
                    {activeTab === 'phase' && (
                        <div className="table-container">
                            <h3>Phase Space Analysis</h3>
                            <div className="table-info">
                                <p>Phase portraits and state-space projections will appear here</p>
                            </div>
                        </div>
                    )}

                    {/* Educational Section */}
                    <div className="educational-section">
                        <h3>📚 ODE Reference Guide</h3>
                        <div className="info-cards">
                            {educationalInfo[activeSection]?.map((info, index) => (
                                <div key={index} className="info-card">
                                    <h4>{info.title}</h4>
                                    <p className="function-description">{info.description}</p>
                                    <ul className="function-properties">
                                        {(info.examples || info.forms || []).map((item, itemIndex) => (
                                            <li key={itemIndex}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Physical Interpretation Guide */}
                        {activeSection === 'systems' && (
                            <div className="info-cards" style={{ marginTop: '20px' }}>
                                <div className="info-card">
                                    <h4>Physical Interpretation Guide</h4>
                                    <ul className="function-properties">
                                        <li><strong>None:</strong> Time series plots for all variables</li>
                                        <li><strong>1D Motion:</strong> Position vs time with velocity</li>
                                        <li><strong>2D Path:</strong> Plot trajectory in 2D space (x vs y)</li>
                                        <li><strong>3D Path:</strong> 3D trajectory plot with time evolution</li>
                                    </ul>
                                </div>
                                <div className="info-card">
                                    <h4>Visualization Types</h4>
                                    <ul className="function-properties">
                                        <li><strong>Time Series:</strong> Variables vs time</li>
                                        <li><strong>Phase Portraits:</strong> Variables against each other</li>
                                        <li><strong>Vector Fields:</strong> Direction fields for 2D systems</li>
                                        <li><strong>3D Trajectories:</strong> For 3-variable systems</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ODESolver;
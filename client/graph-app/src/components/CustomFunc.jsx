import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Plot from 'react-plotly.js';
import * as math from 'mathjs';
import { isAuthenticated, getUserData, logout, simulationAPI } from '../simulationAPI';

const CustomFunct = () => {
    const navigate = useNavigate();

    // Add authentication state
    const [isAuth, setIsAuth] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
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

    const handleLogout = () => {
        logout();
        navigate('/landing-page', { replace: true });
    };

    // State management
    const [functions, setFunctions] = useState([
        {
            id: 1,
            expression: 'sin(sqrt(x^2 + y^2))',
            color: '#4f46e5',
            visible: true,
            parameters: {},
            type: '3d'
        }
    ]);

    const [dimension, setDimension] = useState('3d');
    const [xRange, setXRange] = useState({ min: -5, max: 5 });
    const [yRange, setYRange] = useState({ min: -5, max: 5 });
    const [points, setPoints] = useState(30);
    const [graphData, setGraphData] = useState([]);
    const [errors, setErrors] = useState({});
    const [activeTab, setActiveTab] = useState('plot');

    // NEW: Save/load state
    const [savedSimulations, setSavedSimulations] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [simulationName, setSimulationName] = useState('My Custom Function');

    // Enhanced plot config
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
    const getPlotLayout = () => {
        const baseLayout = {
            title: {
                text: `Custom Functions - ${dimension.toUpperCase()} - ${simulationName}`,
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
            dragmode: 'pan',
            margin: { l: 60, r: 40, t: 60, b: 50 },
            autosize: true,
        };

        if (dimension === '2d') {
            return {
                ...baseLayout,
                xaxis: {
                    title: {
                        text: 'x',
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
                }
            };
        } else {
            return {
                ...baseLayout,
                scene: {
                    xaxis: {
                        title: {
                            text: 'x',
                            font: { color: '#fff' }
                        },
                        gridcolor: 'rgba(255, 255, 255, 0.1)',
                        backgroundcolor: 'rgba(0,0,0,0)',
                        showgrid: true,
                        showline: true,
                        tickcolor: 'rgba(255, 255, 255, 0.5)'
                    },
                    yaxis: {
                        title: {
                            text: 'y',
                            font: { color: '#fff' }
                        },
                        gridcolor: 'rgba(255, 255, 255, 0.1)',
                        backgroundcolor: 'rgba(0,0,0,0)',
                        showgrid: true,
                        showline: true,
                        tickcolor: 'rgba(255, 255, 255, 0.5)'
                    },
                    zaxis: {
                        title: {
                            text: 'f(x, y)',
                            font: { color: '#fff' }
                        },
                        gridcolor: 'rgba(255, 255, 255, 0.1)',
                        backgroundcolor: 'rgba(0,0,0,0)',
                        showgrid: true,
                        showline: true,
                        tickcolor: 'rgba(255, 255, 255, 0.5)'
                    },
                    bgcolor: 'rgba(0,0,0,0)',
                    camera: {
                        eye: { x: 1.5, y: 1.5, z: 1.5 }
                    }
                },
                margin: { l: 0, r: 0, b: 0, t: 60 }
            };
        }
    };

    // Enhanced educational info
    const educationalInfo = [
        {
            title: "2D Functions",
            description: "Functions of a single variable x",
            examples: [
                "Linear: a*x + b",
                "Quadratic: a*x^2 + b*x + c",
                "Trigonometric: A*sin(f*x + p)",
                "Exponential: A*exp(k*x)",
                "Logarithmic: A*log(x)"
            ]
        },
        {
            title: "3D Functions",
            description: "Functions of two variables x and y",
            examples: [
                "Paraboloid: x^2 + y^2",
                "Saddle: x^2 - y^2",
                "Wave: sin(sqrt(x^2 + y^2))",
                "Ripple: sin(x)*cos(y)",
                "Gaussian: exp(-(x^2 + y^2))"
            ]
        },
        {
            title: "Math Operations",
            description: "Supported mathematical operations",
            operations: [
                "Arithmetic: + - * / ^",
                "Functions: sin, cos, tan, exp, log, sqrt",
                "Constants: pi, e",
                "Conditionals: x > 0 ? 1 : 0",
                "Custom parameters: a, b, k, etc."
            ]
        }
    ];

    // Default configuration
    const defaultConfiguration = {
        name: 'Default 3D Function',
        dimension: '3d',
        x_min: -5,
        x_max: 5,
        y_min: -5,
        y_max: 5,
        points: 30,
        functions: [
            {
                expression: 'sin(sqrt(x^2 + y^2))',
                color: '#4f46e5',
                visible: true,
                parameters: {},
                type: 'custom'
            }
        ]
    };

    // Load saved simulations
    const loadSavedSimulations = async () => {
        try {
            const response = await simulationAPI.getSimulationsByType('custom_function');
            if (response.status === 'success') {
                setSavedSimulations(response.data);

                if (response.data.length > 0) {
                    const sortedSimulations = [...response.data].sort((a, b) =>
                        new Date(b.updated_at) - new Date(a.updated_at)
                    );
                    const latestSimulation = sortedSimulations[0];
                    await loadConfiguration(latestSimulation.id, true);
                } else {
                    loadDefaultConfiguration();
                }
            }
            setIsInitialLoad(false);
        } catch (error) {
            console.error('Error loading simulations:', error);
            loadDefaultConfiguration();
            setIsInitialLoad(false);
        }
    };

    // Load default configuration
    const loadDefaultConfiguration = () => {
        setSimulationName(defaultConfiguration.name);
        setDimension(defaultConfiguration.dimension);
        setXRange({
            min: defaultConfiguration.x_min,
            max: defaultConfiguration.x_max
        });
        setYRange({
            min: defaultConfiguration.y_min,
            max: defaultConfiguration.y_max
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
                dimension: dimension,
                x_min: xRange.min,
                x_max: xRange.max,
                y_min: yRange.min,
                y_max: yRange.max,
                points: points,
                functions: functions.map(func => ({
                    expression: func.expression,
                    type: 'custom',
                    color: func.color,
                    visible: func.visible,
                    parameters: func.parameters
                }))
            };

            const response = await simulationAPI.saveCustomFunctionConfig(configData);

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
    const loadConfiguration = async (simulationId, isInitialLoad = false) => {
        try {
            const response = await simulationAPI.getSimulation(simulationId);
            if (response.status === 'success') {
                const sim = response.data;
                setSimulationName(sim.name);

                if (sim.config_data) {
                    setDimension(sim.config_data.dimension || '3d');
                    setXRange({
                        min: sim.config_data.x_min || -5,
                        max: sim.config_data.x_max || 5
                    });
                    setYRange({
                        min: sim.config_data.y_min || -5,
                        max: sim.config_data.y_max || 5
                    });
                    setPoints(sim.config_data.points || 30);

                    if (sim.functions && sim.functions.length > 0) {
                        // Use the functions from the simulation response
                        const loadedFunctions = sim.functions.map((func, index) => ({
                            id: Date.now() + index,
                            expression: func.expression || '',
                            type: func.function_type || 'custom', // Use function_type from backend
                            color: func.color || '#4f46e5',
                            visible: func.visible !== false,
                            parameters: func.parameters || {}
                        }));
                        setFunctions(loadedFunctions);
                    } else if (sim.config_data.functions && sim.config_data.functions.length > 0) {
                        // Fallback to config_data functions
                        const loadedFunctions = sim.config_data.functions.map((func, index) => ({
                            id: Date.now() + index,
                            expression: func.expression,
                            type: 'custom', // Always use 'custom'
                            color: func.color,
                            visible: func.visible !== false,
                            parameters: func.parameters || {}
                        }));
                        setFunctions(loadedFunctions);
                    } else {
                        setFunctions([]);
                    }
                }

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

    // Predefined function examples
    const functionExamples = {
        '2d': [
            { name: 'Quadratic', expression: 'a*x^2 + b*x + c', params: { a: 1, b: 0, c: 0 } },
            { name: 'Sine Wave', expression: 'A*sin(f*x + p)', params: { A: 1, f: 1, p: 0 } },
            { name: 'Exponential Decay', expression: 'A*exp(-k*x)', params: { A: 1, k: 0.5 } },
            { name: 'Gaussian', expression: 'A*exp(-(x-mu)^2/(2*sigma^2))', params: { A: 1, mu: 0, sigma: 1 } },
            { name: 'Absolute Value', expression: 'abs(x)', params: {} },
            { name: 'Step Function', expression: 'x > 0 ? 1 : 0', params: {} },
        ],
        '3d': [
            { name: 'Paraboloid', expression: 'x^2 + y^2', params: {} },
            { name: 'Sine Wave', expression: 'sin(sqrt(x^2 + y^2))', params: {} },
            { name: 'Ripple', expression: 'sin(x) * cos(y)', params: {} },
            { name: 'Saddle', expression: 'x^2 - y^2', params: {} },
            { name: 'Egg Carton', expression: 'sin(x) + cos(y)', params: {} },
            { name: 'Gaussian', expression: 'exp(-(x^2 + y^2))', params: {} },
            { name: 'Plane', expression: 'x + y', params: {} },
            { name: 'Sphere', expression: 'sqrt(1 - x^2 - y^2)', params: {} },
        ]
    };

    // Create math scope
    const createMathScope = (x, y, parameters = {}) => {
        return {
            x: x,
            y: y,
            ...parameters,
            pi: math.pi,
            e: math.e,
            sin: math.sin,
            cos: math.cos,
            tan: math.tan,
            asin: math.asin,
            acos: math.acos,
            atan: math.atan,
            atan2: math.atan2,
            sqrt: math.sqrt,
            exp: math.exp,
            log: math.log,
            log10: math.log10,
            abs: math.abs,
            ceil: math.ceil,
            floor: math.floor,
            round: math.round,
            min: math.min,
            max: math.max,
            pow: math.pow,
            sinh: math.sinh,
            cosh: math.cosh,
            tanh: math.tanh,
            asinh: math.asinh,
            acosh: math.acosh,
            atanh: math.atanh
        };
    };

    // Extract parameters from expression
    const extractParameters = (expression) => {
        try {
            const node = math.parse(expression);
            const params = [];
            const mathProperties = new Set([
                'x', 'y', 'pi', 'e', 'sin', 'cos', 'tan', 'sqrt', 'exp', 'log', 'abs',
                'acos', 'asin', 'atan', 'atan2', 'sinh', 'cosh', 'tanh', 'asinh', 'acosh',
                'atanh', 'ceil', 'floor', 'round', 'min', 'max', 'pow', 'log10'
            ]);

            node.traverse((node) => {
                if (node.isSymbolNode && !mathProperties.has(node.name)) {
                    if (!params.includes(node.name)) {
                        params.push(node.name);
                    }
                }
            });
            return params;
        } catch (error) {
            return [];
        }
    };

    // Evaluate function with parameters
    const evaluateFunction = (func, x, y = 0) => {
        try {
            const scope = {
                x: x,
                y: y,
                ...func.parameters
            };

            const compiled = math.compile(func.expression);
            const result = compiled.evaluate(scope);

            if (typeof result === 'number' && isFinite(result)) {
                return result;
            } else if (math.isComplex(result)) {
                return result.re;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Evaluation error:', error.message, 'for expression:', func.expression);
            return null;
        }
    };

    // Generate 2D plot data
    const generate2DData = () => {
        const newData = [];
        const newErrors = {};

        functions.forEach((func) => {
            if (!func.visible || dimension !== '2d') return;

            const xValues = [];
            const yValues = [];
            let hasValidPoints = false;
            let validPointsCount = 0;

            for (let i = 0; i < points; i++) {
                const x = xRange.min + (i / (points - 1)) * (xRange.max - xRange.min);
                xValues.push(x);

                try {
                    const y = evaluateFunction(func, x);
                    if (y !== null && isFinite(y)) {
                        yValues.push(y);
                        hasValidPoints = true;
                        validPointsCount++;
                    } else {
                        yValues.push(null);
                    }
                } catch (error) {
                    yValues.push(null);
                }
            }

            if (!hasValidPoints) {
                newErrors[func.id] = 'No valid points generated for this function';
            } else if (validPointsCount < points * 0.5) {
                newErrors[func.id] = `Only ${validPointsCount} valid points out of ${points}`;
            }

            // Enhanced styling
            newData.push({
                x: xValues,
                y: yValues,
                type: 'scatter',
                mode: 'lines',
                name: `f(x) = ${func.expression}`,
                line: {
                    color: func.color,
                    width: 3,
                    shape: 'spline',
                    smoothing: 1.3
                },
                hovertemplate: `
                    <b>f(x) = ${func.expression}</b><br>
                    x: %{x:.3f}<br>
                    y: %{y:.3f}<br>
                    <extra></extra>
                `
            });
        });

        setGraphData(newData);
        setErrors(newErrors);
    };

    // Generate 3D plot data
    const generate3DData = () => {
        const newData = [];
        const newErrors = {};

        functions.forEach((func) => {
            if (!func.visible || dimension !== '3d') return;

            const gridSize = Math.min(points, 30);
            const xValues = [];
            const yValues = [];
            const zMatrix = [];

            let hasValidPoints = false;
            let validPointsCount = 0;

            // Generate coordinates
            for (let i = 0; i < gridSize; i++) {
                xValues.push(xRange.min + (i / (gridSize - 1)) * (xRange.max - xRange.min));
            }
            for (let j = 0; j < gridSize; j++) {
                yValues.push(yRange.min + (j / (gridSize - 1)) * (yRange.max - yRange.min));
            }

            // Generate z values
            for (let i = 0; i < gridSize; i++) {
                const zRow = [];
                for (let j = 0; j < gridSize; j++) {
                    try {
                        const z = evaluateFunction(func, xValues[i], yValues[j]);
                        if (z !== null && isFinite(z)) {
                            zRow.push(z);
                            hasValidPoints = true;
                            validPointsCount++;
                        } else {
                            zRow.push(null);
                        }
                    } catch (error) {
                        zRow.push(null);
                    }
                }
                zMatrix.push(zRow);
            }

            if (!hasValidPoints) {
                newErrors[func.id] = 'No valid points generated. Check your expression.';
            } else if (validPointsCount < gridSize * gridSize * 0.5) {
                newErrors[func.id] = `Only ${validPointsCount} valid points out of ${gridSize * gridSize}`;
            }

            // Enhanced 3D styling
            newData.push({
                x: xValues,
                y: yValues,
                z: zMatrix,
                type: 'surface',
                name: `f(x,y) = ${func.expression}`,
                colorscale: 'Viridis',
                opacity: 0.9,
                showscale: true,
                lighting: {
                    ambient: 0.4,
                    diffuse: 0.8,
                    specular: 0.1
                },
                lightposition: {
                    x: 100,
                    y: 200,
                    z: 0
                },
                hovertemplate: `
                    <b>f(x,y) = ${func.expression}</b><br>
                    x: %{x:.3f}<br>
                    y: %{y:.3f}<br>
                    z: %{z:.3f}<br>
                    <extra></extra>
                `
            });
        });

        setGraphData(newData);
        setErrors(newErrors);
    };

    // Generate plot data based on dimension
    useEffect(() => {
        if (!isAuth) return;

        if (dimension === '2d') {
            generate2DData();
        } else {
            generate3DData();
        }
    }, [functions, xRange, yRange, points, dimension, isAuth]);

    // Add new function
    const addFunction = (example = null) => {
        if (!isAuth) return;

        const newFunc = example ? {
            expression: example.expression,
            parameters: { ...example.params },
            color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
            visible: true,
            type: 'custom'
        } : {
            expression: dimension === '2d' ? 'sin(x)' : 'sin(sqrt(x^2 + y^2))',
            color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
            visible: true,
            parameters: {},
            type: 'custom'
        };

        setFunctions(prev => [...prev, { ...newFunc, id: Date.now() }]);
    };

    // Remove function
    const removeFunction = (id) => {
        if (!isAuth) return;
        setFunctions(prev => prev.filter(f => f.id !== id));
    };

    // Update function expression
    const updateFunction = (id, field, value) => {
        if (!isAuth) return;

        setFunctions(prev => prev.map(func => {
            if (func.id === id) {
                const updatedFunc = { ...func, [field]: value };

                if (field === 'expression') {
                    const newParams = extractParameters(value);
                    const currentParams = { ...updatedFunc.parameters };

                    // Remove parameters that are no longer in the expression
                    Object.keys(currentParams).forEach(key => {
                        if (!newParams.includes(key)) {
                            delete currentParams[key];
                        }
                    });

                    // Add new parameters with default value 1
                    newParams.forEach(param => {
                        if (!(param in currentParams)) {
                            currentParams[param] = 1;
                        }
                    });

                    updatedFunc.parameters = currentParams;
                }

                return updatedFunc;
            }
            return func;
        }));
    };

    // Update parameter value
    const updateParameter = (funcId, paramName, value) => {
        if (!isAuth) return;

        setFunctions(prev => prev.map(func => {
            if (func.id === funcId) {
                return {
                    ...func,
                    parameters: {
                        ...func.parameters,
                        [paramName]: parseFloat(value) || 0
                    }
                };
            }
            return func;
        }));
    };

    // Toggle function visibility
    const toggleVisibility = (id) => {
        if (!isAuth) return;
        setFunctions(prev => prev.map(func =>
            func.id === id ? { ...func, visible: !func.visible } : func
        ));
    };

    // Handle dimension change
    const handleDimensionChange = (newDimension) => {
        if (!isAuth) return;

        setDimension(newDimension);
        setFunctions([{
            id: 1,
            expression: newDimension === '2d' ? 'sin(x)' : 'sin(sqrt(x^2 + y^2))',
            color: '#4f46e5',
            visible: true,
            parameters: {},
            type: 'custom'
        }]);
        setPoints(newDimension === '2d' ? 100 : 30);
    };

    // Validate expression
    const validateExpression = (expression, type, parameters = {}) => {
        if (!expression.trim()) return 'Expression cannot be empty';

        try {
            const node = math.compile(expression);
            const testParams = {};
            const extractedParams = extractParameters(expression);

            extractedParams.forEach(param => {
                testParams[param] = parameters[param] !== undefined ? parameters[param] : 1;
            });

            const testScope = type === '2d'
                ? { x: 1, ...testParams }
                : { x: 1, y: 1, ...testParams };

            node.evaluate(testScope);
            return null;
        } catch (error) {
            return `Invalid expression: ${error.message}`;
        }
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
                    <p>Loading custom function visualizer...</p>
                </div>
            </div>
        );
    }

    // Show nothing if not authenticated
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
                <h1>Custom Functions Visualizer</h1>
                <p>Plot any mathematical expression in 2D or 3D with custom parameters</p>
            </header>

            <div className="custom-funct-content">
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
                        <h3>🎮 Dimension Mode</h3>
                        <div className="dimension-toggle">
                            <button
                                className={`dimension-btn ${dimension === '2d' ? 'active' : ''}`}
                                onClick={() => handleDimensionChange('2d')}
                            >
                                2D
                            </button>
                            <button
                                className={`dimension-btn ${dimension === '3d' ? 'active' : ''}`}
                                onClick={() => handleDimensionChange('3d')}
                            >
                                3D
                            </button>
                        </div>
                    </div>

                    <div className="control-section">
                        <h3>📊 Graph Settings</h3>
                        <div className="control-group">
                            <label>X Min:</label>
                            <input
                                type="number"
                                value={xRange.min}
                                onChange={(e) => setXRange(prev => ({ ...prev, min: parseFloat(e.target.value) || 0 }))}
                                step="0.1"
                            />
                        </div>
                        <div className="control-group">
                            <label>X Max:</label>
                            <input
                                type="number"
                                value={xRange.max}
                                onChange={(e) => setXRange(prev => ({ ...prev, max: parseFloat(e.target.value) || 0 }))}
                                step="0.1"
                            />
                        </div>

                        {dimension === '3d' && (
                            <>
                                <div className="control-group">
                                    <label>Y Min:</label>
                                    <input
                                        type="number"
                                        value={yRange.min}
                                        onChange={(e) => setYRange(prev => ({ ...prev, min: parseFloat(e.target.value) || 0 }))}
                                        step="0.1"
                                    />
                                </div>
                                <div className="control-group">
                                    <label>Y Max:</label>
                                    <input
                                        type="number"
                                        value={yRange.max}
                                        onChange={(e) => setYRange(prev => ({ ...prev, max: parseFloat(e.target.value) || 0 }))}
                                        step="0.1"
                                    />
                                </div>
                            </>
                        )}

                        <div className="control-group">
                            <label>Points/Grid Size:</label>
                            <input
                                type="number"
                                value={points}
                                onChange={(e) => setPoints(Math.max(10, Math.min(parseInt(e.target.value) || 30, dimension === '2d' ? 1000 : 50)))}
                                min="10"
                                max={dimension === '2d' ? '1000' : '50'}
                            />
                            <small>{dimension === '3d' ? `Grid size: ${Math.min(points, 30)}×${Math.min(points, 30)}` : 'Number of points'}</small>
                        </div>
                    </div>

                    <div className="control-section">
                        <h3>🎯 Function Examples</h3>
                        <div className="examples-grid">
                            {functionExamples[dimension].map((example, index) => (
                                <button
                                    key={index}
                                    className="example-btn"
                                    onClick={() => addFunction(example)}
                                >
                                    {example.name}
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
                            {functions.map((func, index) => {
                                const validationError = validateExpression(func.expression, func.type, func.parameters);
                                const parameters = extractParameters(func.expression);

                                return (
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
                                                <label>Expression:</label>
                                                <input
                                                    type="text"
                                                    value={func.expression}
                                                    onChange={(e) => updateFunction(func.id, 'expression', e.target.value)}
                                                    placeholder={func.type === '2d' ? "e.g., sin(x) + cos(2*x)" : "e.g., sin(sqrt(x^2 + y^2))"}
                                                    className={validationError ? 'error' : ''}
                                                />
                                            </div>

                                            {validationError && (
                                                <div className="error-message">
                                                    ⚠️ {validationError}
                                                </div>
                                            )}

                                            <div className="control-row">
                                                <label>Color:</label>
                                                <input
                                                    type="color"
                                                    value={func.color}
                                                    onChange={(e) => updateFunction(func.id, 'color', e.target.value)}
                                                />
                                            </div>

                                            {/* Dynamic Parameters */}
                                            {parameters.length > 0 && (
                                                <div className="parameters-section">
                                                    <label>Parameters:</label>
                                                    {parameters.map(param => (
                                                        <div key={param} className="parameter-control">
                                                            <span className="param-label">{param}:</span>
                                                            <input
                                                                type="range"
                                                                min="-10"
                                                                max="10"
                                                                step="0.1"
                                                                value={func.parameters[param] || 1}
                                                                onChange={(e) => updateParameter(func.id, param, e.target.value)}
                                                            />
                                                            <span className="param-value">
                                                                {func.parameters[param] || 1}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="function-actions">
                                            <button
                                                className={`visibility-btn ${func.visible ? 'visible' : 'hidden'}`}
                                                onClick={() => toggleVisibility(func.id)}
                                            >
                                                {func.visible ? '👁️ Visible' : '👁️‍🗨️ Hidden'}
                                            </button>
                                        </div>

                                        {errors[func.id] && (
                                            <div className="function-error">
                                                ⚠️ {errors[func.id]}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
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
                                    <p>Create and save your first function!</p>
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
                                    <p>No functions to display. Add a function or check visibility settings.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'table' && dimension === '2d' && (
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
                                            <th>x</th>
                                            {functions.filter(f => f.visible && dimension === '2d').map((func) => (
                                                <th key={func.id}>
                                                    f(x) = {func.expression}
                                                    {Object.keys(func.parameters).length > 0 && (
                                                        <div className="function-params">
                                                            {Object.entries(func.parameters).map(([key, value]) => (
                                                                <span key={key}>{key}={value.toFixed(2)} </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.from({ length: Math.min(points, 100) }).map((_, i) => {
                                            const x = xRange.min + (i / (Math.min(points, 100) - 1)) * (xRange.max - xRange.min);

                                            return (
                                                <tr key={i}>
                                                    <td className="point-number">{i + 1}</td>
                                                    <td className="x-value">{x.toFixed(4)}</td>
                                                    {functions.filter(f => f.visible && f.type === '2d').map(func => {
                                                        const y = evaluateFunction(func, x);
                                                        return (
                                                            <td key={func.id} className="y-value">
                                                                {y !== null && isFinite(y) ? y.toFixed(6) : 'undefined'}
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

                    {activeTab === 'table' && dimension === '3d' && (
                        <div className="table-container">
                            <h3>3D Data Preview - {simulationName}</h3>
                            <div className="table-info">
                                <p>Showing sample points from the first visible 3D function</p>
                            </div>
                            <div className="data-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Point #</th>
                                            <th>x</th>
                                            <th>y</th>
                                            <th>z</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {functions.filter(f => f.visible && dimension === '3d').slice(0, 1).map(func => (
                                            Array.from({ length: Math.min(50, points) }).map((_, i) => {
                                                const x = xRange.min + (i / (Math.min(50, points) - 1)) * (xRange.max - xRange.min);
                                                const y = yRange.min + (i / (Math.min(50, points) - 1)) * (yRange.max - yRange.min);
                                                const z = evaluateFunction(func, x, y);
                                                return (
                                                    <tr key={i}>
                                                        <td className="point-number">{i + 1}</td>
                                                        <td className="x-value">{x.toFixed(4)}</td>
                                                        <td className="y-value">{y.toFixed(4)}</td>
                                                        <td className="z-value">
                                                            {z !== null && isFinite(z) ? z.toFixed(6) : 'undefined'}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="table-note">
                                <p>For complete 3D data exploration, use the interactive plot above.</p>
                            </div>
                        </div>
                    )}

                    {/* Enhanced Educational Section */}
                    <div className="educational-section">
                        <h3>📚 Custom Functions Reference</h3>
                        <div className="info-cards">
                            {educationalInfo.map((info, index) => (
                                <div key={index} className="info-card">
                                    <h4>{info.title}</h4>
                                    <p className="function-description">{info.description}</p>
                                    <ul className="function-properties">
                                        {(info.examples || info.operations).map((item, itemIndex) => (
                                            <li key={itemIndex}>{item}</li>
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

export default CustomFunct;
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Redirect to login if refresh fails
        logout();
        window.location.href = '/landing-page';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Token management functions
const getAccessToken = () => localStorage.getItem('access_token');
const getRefreshToken = () => localStorage.getItem('refresh_token');
const setAccessToken = (token) => localStorage.setItem('access_token', token);
const setRefreshToken = (token) => localStorage.setItem('refresh_token', token);

const setTokens = (access, refresh) => {
  setAccessToken(access);
  setRefreshToken(refresh);
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_data');
};

// Manual token refresh function
const refreshToken = async () => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');

    const response = await api.post('/auth/token/refresh/', { refresh: refreshToken });
    const { access } = response.data;
    setAccessToken(access);
    return access;
  } catch (error) {
    logout();
    throw error;
  }
};

// Store user data
export const setUserData = (userData) => {
  localStorage.setItem('user_data', JSON.stringify(userData));
};

export const getUserData = () => {
  const userData = localStorage.getItem('user_data');
  return userData ? JSON.parse(userData) : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAccessToken();
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = getAccessToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// 🔐 AUTHENTICATION API
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);

    if (response.data.status === 'success') {
      const { tokens, user } = response.data.data;
      setTokens(tokens.access, tokens.refresh);
      setUserData(user);
    }

    return response.data;
  },

  // Login user
  login: async (loginData) => {
    const response = await api.post('/auth/login/', loginData);

    if (response.data.status === 'success') {
      const { tokens, user } = response.data.data;
      setTokens(tokens.access, tokens.refresh);
      setUserData(user);
    }

    return response.data;
  },

  // Check username availability
  checkUsername: async (username) => {
    const response = await api.post('/auth/check-username/', { username });
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile/', profileData);
    return response.data;
  },

  // Logout
  logout: () => {
    logout();
  }
};


// 📊 SIMULATIONS API
export const simulationAPI = {
  // 🔷 GENERAL SIMULATION OPERATIONS

  // Get all simulations for current user
  getUserSimulations: async () => {
    const response = await api.get('/simulations/simulations/');
    return response.data;
  },

  // Get simulations by type
  getSimulationsByType: async (simType) => {
    const response = await api.get(`/simulations/simulations/type/${simType}/`);
    return response.data;
  },

  // Get favorite simulations
  getFavoriteSimulations: async () => {
    const response = await api.get('/simulations/simulations/favorites/');
    return response.data;
  },

  // Get specific simulation
  getSimulation: async (simulationId) => {
    const response = await api.get(`/simulations/simulations/${simulationId}/`);
    return response.data;
  },

  // Create new simulation
  createSimulation: async (simulationData) => {
    const response = await api.post('/simulations/simulations/', simulationData);
    return response.data;
  },

  // Update simulation
  updateSimulation: async (simulationId, simulationData) => {
    const response = await api.put(`/simulations/simulations/${simulationId}/`, simulationData);
    return response.data;
  },

  // Delete simulation
  deleteSimulation: async (simulationId) => {
    const response = await api.delete(`/simulations/simulations/${simulationId}/`);
    return response.data;
  },

  // Toggle favorite status
  toggleFavorite: async (simulationId) => {
    const response = await api.post(`/simulations/simulations/${simulationId}/toggle-favorite/`);
    return response.data;
  },

  // 🔷 TRIGONOMETRY SPECIFIC
  saveTrigonometryConfig: async (configData) => {
    const response = await api.post('/simulations/save/trigonometry/', configData);
    return response.data;
  },

  // 🔷 CUSTOM FUNCTIONS SPECIFIC
  saveCustomFunctionConfig: async (configData) => {
    // Transform the data to match backend expectations
    const backendData = {
      name: configData.name || `Custom Function ${new Date().toLocaleString()}`,
      dimension: configData.dimension || '3d',
      x_min: configData.x_min || configData.xRange?.min || -5,
      x_max: configData.x_max || configData.xRange?.max || 5,
      y_min: configData.y_min || configData.yRange?.min || -5,
      y_max: configData.y_max || configData.yRange?.max || 5,
      points: configData.points || 30,
      functions: (configData.functions || []).map(func => ({
        expression: func.expression || '',
        type: 'custom', // Always use 'custom' for custom functions
        color: func.color || '#4f46e5',
        visible: func.visible !== false,
        parameters: func.parameters || {}
      }))
    };

    const response = await api.post('/simulations/save/custom-function/', backendData);
    return response.data;
  },

  // 🔷 QUICK SAVE FUNCTIONS

  // Quick save trigonometry with current state
  quickSaveTrigonometry: async (trigState) => {
    const configData = {
      name: trigState.name || `Trigonometry ${new Date().toLocaleString()}`,
      x_min: trigState.xRange?.min || -6.28,
      x_max: trigState.xRange?.max || 6.28,
      points: trigState.points || 500,
      functions: trigState.functions || []
    };

    const response = await api.post('/simulations/save/trigonometry/', configData);
    return response.data;
  },

  // Quick save custom function with current state
  quickSaveCustomFunction: async (customState) => {
    const configData = {
      name: customState.name || `Custom Function ${new Date().toLocaleString()}`,
      dimension: customState.dimension || '3d',
      x_min: customState.xRange?.min || -5,
      x_max: customState.xRange?.max || 5,
      y_min: customState.yRange?.min || -5,
      y_max: customState.yRange?.max || 5,
      points: customState.points || 30,
      functions: (customState.functions || []).map(func => ({
        expression: func.expression || '',
        type: 'custom', // Always use 'custom' for custom functions
        color: func.color || '#4f46e5',
        visible: func.visible !== false,
        parameters: func.parameters || {}
      }))
    };

    const response = await api.post('/simulations/save/custom-function/', configData);
    return response.data;
  },

  // 🔷 ODE SOLVER SPECIFIC

  // Save ODE configuration
  saveODESolverConfig: async (configData) => {
    const response = await api.post('/simulations/api/save-ode-config/', configData);
    return response.data;
  },

  // Solve ODEs
  solveODE: async (configId) => {
    const response = await api.post('/simulations/api/solve-ode/', { config_id: configId });
    return response.data;
  },

  // Get ODE solutions for a configuration
  getODESolutions: async (configId) => {
    const response = await api.get(`/simulations/api/ode-solutions/${configId}/`);
    return response.data;
  },

  // Get specific ODE solution
  getODESolution: async (solutionId) => {
    const response = await api.get(`/simulations/api/ode-solution/${solutionId}/`);
    return response.data;
  },

  // Delete ODE solution
  deleteODESolution: async (solutionId) => {
    const response = await api.delete(`/simulations/api/ode-solution/${solutionId}/delete/`);
    return response.data;
  },

  // Get available ODE methods
  getODEMethods: async () => {
    const response = await api.get('/simulations/api/ode-methods/');
    return response.data;
  },

  // Quick save ODE configuration
  quickSaveODEConfig: async (odeState) => {
    const configData = {
      name: odeState.name || `ODE Configuration ${new Date().toLocaleString()}`,
      section: odeState.activeSection || 'first_order',
      simulationMode: odeState.simulationMode || 'graphing',
      odeSettings: {
        timeRange: odeState.odeSettings?.timeRange || { min: 0, max: 10 },
        points: odeState.odeSettings?.points || 1000,
        method: odeState.odeSettings?.method || 'rk4',
        tolerance: odeState.odeSettings?.tolerance || 1e-6,
        max_step: odeState.odeSettings?.max_step || 0.1,
        min_step: odeState.odeSettings?.min_step || 1e-4,
      },
      firstOrderOdes: odeState.firstOrderOdes || [],
      secondOrderOdes: odeState.secondOrderOdes || [],
      systemOdes: odeState.systemOdes || {
        numberOfEquations: 2,
        physicalInterpretation: 'none',
        equations: [],
        initialConditions: {},
        parameters: {}
      },
      simulationParams: odeState.simulationParams || {
        animationSpeed: 1,
        showTrajectory: true,
        showVectorField: false,
        realTimeParameters: {}
      }
    };

    const response = await api.post('/simulations/api/save-ode-config/', configData);
    return response.data;
  },

  // Load ODE template
  loadODETemplate: async (templateName) => {
    const templates = {
      'exponential_decay': {
        name: 'Exponential Decay',
        section: 'first_order',
        simulationMode: 'graphing',
        odeSettings: {
          timeRange: { min: 0, max: 5 },
          points: 100,
          method: 'rk4',
          tolerance: 1e-6
        },
        firstOrderOdes: [
          {
            expression: '-k * y',
            initialCondition: { y0: 1.0 },
            parameters: { k: 0.5 },
            color: '#4f46e5',
            visible: true,
            variableName: 'y'
          }
        ]
      },
      'harmonic_oscillator': {
        name: 'Harmonic Oscillator',
        section: 'second_order',
        simulationMode: 'graphing',
        odeSettings: {
          timeRange: { min: 0, max: 10 },
          points: 200,
          method: 'rk4',
          tolerance: 1e-6
        },
        secondOrderOdes: [
          {
            expression: '-ω² * y - γ * dy_dt',
            initialConditions: { y0: 1.0, dy0: 0.0 },
            parameters: { ω: 1.0, γ: 0.1 },
            color: '#10b981',
            visible: true,
            variableName: 'y'
          }
        ]
      },
      'lorenz_system': {
        name: 'Lorenz Attractor',
        section: 'systems',
        simulationMode: 'graphing',
        odeSettings: {
          timeRange: { min: 0, max: 25 },
          points: 1000,
          method: 'rk4',
          tolerance: 1e-6
        },
        systemOdes: {
          numberOfEquations: 3,
          physicalInterpretation: '3d',
          equations: [
            {
              equation: 'dx/dt = σ*(y - x)',
              expression: 'σ*(y - x)',
              variable: 'x',
              color: '#ef4444',
              visible: true
            },
            {
              equation: 'dy/dt = x*(ρ - z) - y',
              expression: 'x*(ρ - z) - y',
              variable: 'y',
              color: '#3b82f6',
              visible: true
            },
            {
              equation: 'dz/dt = x*y - β*z',
              expression: 'x*y - β*z',
              variable: 'z',
              color: '#10b981',
              visible: true
            }
          ],
          initialConditions: { x0: 1.0, y0: 1.0, z0: 1.0 },
          parameters: { σ: 10, ρ: 28, β: 8 / 3 }
        }
      },
      'lotka_volterra': {
        name: 'Predator-Prey Model',
        section: 'systems',
        simulationMode: 'graphing',
        odeSettings: {
          timeRange: { min: 0, max: 20 },
          points: 500,
          method: 'rk4',
          tolerance: 1e-6
        },
        systemOdes: {
          numberOfEquations: 2,
          physicalInterpretation: '2d',
          equations: [
            {
              equation: 'dx/dt = α*x - β*x*y',
              expression: 'α*x - β*x*y',
              variable: 'x',
              color: '#ef4444',
              visible: true
            },
            {
              equation: 'dy/dt = δ*x*y - γ*y',
              expression: 'δ*x*y - γ*y',
              variable: 'y',
              color: '#3b82f6',
              visible: true
            }
          ],
          initialConditions: { x0: 10, y0: 5 },
          parameters: { α: 1.0, β: 0.1, δ: 0.1, γ: 1.0 }
        }
      }
    };

    return templates[templateName] || null;
  },

  // Load custom function template
  loadCustomFunctionTemplate: async (templateName) => {
    const templates = {
      '3d_sine': {
        name: '3D Sine Wave',
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
      },
      'paraboloid': {
        name: '3D Paraboloid',
        dimension: '3d',
        x_min: -5,
        x_max: 5,
        y_min: -5,
        y_max: 5,
        points: 30,
        functions: [
          {
            expression: 'x^2 + y^2',
            color: '#059669',
            visible: true,
            parameters: {},
            type: 'custom'
          }
        ]
      },
      '2d_sine': {
        name: '2D Sine Wave',
        dimension: '2d',
        x_min: -6.28,
        x_max: 6.28,
        y_min: -5,
        y_max: 5,
        points: 100,
        functions: [
          {
            expression: 'sin(x)',
            color: '#dc2626',
            visible: true,
            parameters: {},
            type: 'custom'
          }
        ]
      },
      'quadratic': {
        name: '2D Quadratic',
        dimension: '2d',
        x_min: -5,
        x_max: 5,
        y_min: -5,
        y_max: 5,
        points: 100,
        functions: [
          {
            expression: 'x^2',
            color: '#7c3aed',
            visible: true,
            parameters: {},
            type: 'custom'
          }
        ]
      }
    };

    return templates[templateName] || null;
  },

  // Load trigonometry template
  loadTrigonometryTemplate: async (templateName) => {
    const templates = {
      'sine_wave': {
        name: 'Sine Wave',
        x_min: -6.28,
        x_max: 6.28,
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
      },
      'cosine_wave': {
        name: 'Cosine Wave',
        x_min: -6.28,
        x_max: 6.28,
        points: 500,
        functions: [
          {
            type: 'cos',
            amplitude: 1,
            frequency: 1,
            phase: 0,
            color: '#059669',
            visible: true
          }
        ]
      }
    };

    return templates[templateName] || null;
  }
};


// Export individual functions for easier imports
export const {
  // Authentication
  register,
  login,
  checkUsername,
  getProfile,
  updateProfile,

  // Simulations
  getUserSimulations,
  getSimulationsByType,
  getFavoriteSimulations,
  getSimulation,
  createSimulation,
  updateSimulation,
  deleteSimulation,
  toggleFavorite,
  saveTrigonometryConfig,
  saveCustomFunctionConfig,
  quickSaveTrigonometry,
  quickSaveCustomFunction,
  loadTrigonometryTemplate,
  loadCustomFunctionTemplate,
  saveODESolverConfig,
  solveODE,
  getODESolutions,
  getODESolution,
  deleteODESolution,
  getODEMethods,
  quickSaveODEConfig,
  loadODETemplate
} = { ...authAPI, ...simulationAPI };

export default simulationAPI;


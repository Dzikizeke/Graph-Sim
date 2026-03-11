# Graphing and Mathematical Simulation Platform

## Demo
![Demo](media/demo.gif)

A full-stack web application for interactive mathematical visualization and simulation.  
The platform allows users to explore mathematical concepts through real-time graphing, numerical computation, and data visualization.

The project combines modern web technologies with scientific computing tools to create a flexible environment for experimenting with mathematical models.

---

## Features

- Interactive graph plotting
- Real-time visualization of mathematical functions
- Trigonometric function analysis
- Calculus tools (derivatives, integrals, function behavior)
- Ordinary Differential Equation (ODE) simulation
- Framework for Partial Differential Equations (PDE)
- Statistical data visualization
- Fourier analysis and signal decomposition
- Custom user-defined functions

Some modules are currently under development and will be expanded with additional numerical and simulation capabilities.

---

## Architecture

The application follows a **full-stack architecture**:

### Frontend
- Built with **React**
- Interactive plotting using **Plotly.js**
- Performs most mathematical calculations on the client side
- Enables **real-time graph updates and responsive visualization**

### Backend
- Built with **Python and Django**
- Uses **Django REST Framework** for API endpoints
- Handles heavier computations such as **ODE solving**
- Provides authentication and simulation APIs

### Database
- **SQLite** for storing user and application data

### Backend Apps
The backend is structured into two primary applications:

1. **Authentication App**
   - User registration
   - Login and authentication
   - User management

2. **Graphing / Simulation App**
   - Mathematical computation APIs
   - ODE solving
   - Simulation processing
   - Data exchange with frontend for visualization

---

## Technology Stack

**Frontend**
- React
- Plotly.js
- JavaScript
- HTML / CSS

**Backend**
- Python
- Django
- Django REST Framework

**Database**
- SQLite

---

## Goals of the Project

This project aims to provide a flexible environment for:

- Visualizing mathematical concepts
- Experimenting with numerical methods
- Simulating mathematical and physical models
- Exploring signal processing and statistical analysis

The platform is designed to evolve into a broader **mathematical and scientific simulation toolkit**.

---

## Future Improvements

- Expanded PDE solvers
- More numerical methods for ODEs
- Advanced Fourier analysis tools
- Improved simulation capabilities
- Performance optimization
- Support for larger datasets and more complex models

---

## License

This project is open for learning and experimentation.

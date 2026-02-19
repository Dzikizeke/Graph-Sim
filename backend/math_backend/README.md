# GraphSim - Graphing & Simulation Web Application

A modern web-based graphing and simulation application that helps visualize mathematical functions and data in real-time using Plotly.js. Features user authentication, save/load configurations, and multiple mathematical modules.

## 🚀 Features

- **User Authentication**: Register, login, and manage your account
- **Multiple Mathematical Modules**:
  - Trigonometry plotting (sine, cosine, tangent)
  - Custom function visualization (2D/3D)
  - Calculus operations (derivatives, integrals)
  - ODE solver with multiple numerical methods
  - Basic statistics plotting
- **Real-time Visualization**: Interactive graphs with Plotly.js
- **Save/Load Configurations**: Save your graphs and simulations
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Vite
- Plotly.js
- Axios
- React Router

**Backend:**
- Django 4.1
- Django REST Framework
- SQLite (development)
- JWT Authentication

## 📦 Installation

### Prerequisites
- Node.js 18+
- Python 3.10+
- pip (Python package manager)

### Backend Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd graph-app

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install django djangorestframework django-cors-headers djangorestframework-simplejwt

# Run migrations
cd backend
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Run development server
python manage.py runserver
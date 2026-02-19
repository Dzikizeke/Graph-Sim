# simulations/core/ode_solver.py
import numpy as np
import scipy.integrate as spi
from scipy.integrate import solve_ivp
import sympy as sp
import re
import time
from typing import Dict, List, Callable, Optional, Tuple

class ODEParser:
    """Parse and compile ODE expressions"""
    
    @staticmethod
    def parse_expression(expression: str, variables: List[str], parameters: Dict) -> Callable:
        """
        Parse a mathematical expression and return a compiled function
        
        Args:
            expression: Mathematical expression as string
            variables: List of variable names
            parameters: Dictionary of parameter values
            
        Returns:
            Compiled function that can be evaluated
        """
        try:
            # Create symbols for variables and parameters
            symbols = {}
            
            # Add variables
            for var in variables:
                symbols[var] = sp.Symbol(var)
            
            # Add parameters
            for param_name, param_value in parameters.items():
                symbols[param_name] = param_value
            
            # Parse the expression
            expr = sp.sympify(expression, locals=symbols)
            
            # Convert to lambda function
            func = sp.lambdify(variables, expr, modules=['numpy', 'math'])
            
            return func
            
        except Exception as e:
            raise ValueError(f"Error parsing expression '{expression}': {str(e)}")

class FirstOrderODESolver:
    """Solver for first order ODEs"""
    
    def __init__(self):
        self.parser = ODEParser()
    
    def solve_single(self, problem: Dict) -> Dict:
        """
        Solve a single first order ODE
        
        Args:
            problem: Dictionary containing:
                - expression: ODE expression (dy/dt = f(t, y))
                - variable: Variable name (default 'y')
                - initial_condition: Initial value y(t0)
                - parameters: Dictionary of parameters
                - time_range: [t_start, t_end]
                - method: Solving method
                - points: Number of points
                - tolerance: Error tolerance
                
        Returns:
            Dictionary with solution data
        """
        try:
            # Extract problem parameters
            expression = problem['expression']
            variable = problem.get('variable', 'y')
            y0 = problem['initial_condition']
            parameters = problem.get('parameters', {})
            t_range = problem['time_range']
            method = problem.get('method', 'rk4')
            n_points = problem.get('points', 1000)
            tolerance = problem.get('tolerance', 1e-6)
            
            # Create time array
            t_eval = np.linspace(t_range['min'], t_range['max'], n_points)
            
            # Parse and compile the ODE function
            ode_func = self._create_ode_function(expression, variable, parameters)
            
            # Solve based on method
            if method in ['rk4', 'euler', 'midpoint', 'heun']:
                solution = self._solve_fixed_step(ode_func, t_range, y0, n_points, method)
            else:
                solution = self._solve_adaptive(ode_func, t_range, y0, t_eval, method, tolerance)
            
            return {
                'success': True,
                'time': solution['time'].tolist(),
                'solutions': {variable: solution['y'].tolist()},
                'method_used': method,
                'message': f'First order ODE solved successfully using {method}'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Error solving first order ODE: {str(e)}',
                'method_used': problem.get('method', 'unknown')
            }
    
    def _create_ode_function(self, expression: str, variable: str, parameters: Dict) -> Callable:
        """Create ODE function f(t, y)"""
        def ode_func(t, y):
            # Create local namespace with parameters and variables
            namespace = {'t': t, variable: y, 'np': np, 'math': __import__('math')}
            namespace.update(parameters)
            
            try:
                # Safe evaluation of the expression
                return eval(expression, {"__builtins__": {}}, namespace)
            except Exception as e:
                raise ValueError(f"Error evaluating expression at t={t}, {variable}={y}: {str(e)}")
        
        return ode_func
    
    def _solve_fixed_step(self, ode_func: Callable, t_range: Dict, y0: float, 
                         n_points: int, method: str) -> Dict:
        """Solve ODE using fixed-step methods"""
        t_start, t_end = t_range['min'], t_range['max']
        h = (t_end - t_start) / (n_points - 1)  # step size
        
        t = np.linspace(t_start, t_end, n_points)
        y = np.zeros(n_points)
        y[0] = y0
        
        if method == 'euler':
            for i in range(n_points - 1):
                y[i + 1] = y[i] + h * ode_func(t[i], y[i])
                
        elif method == 'midpoint':
            for i in range(n_points - 1):
                k1 = h * ode_func(t[i], y[i])
                k2 = h * ode_func(t[i] + h/2, y[i] + k1/2)
                y[i + 1] = y[i] + k2
                
        elif method == 'heun':
            for i in range(n_points - 1):
                k1 = h * ode_func(t[i], y[i])
                k2 = h * ode_func(t[i] + h, y[i] + k1)
                y[i + 1] = y[i] + (k1 + k2) / 2
                
        elif method == 'rk4':
            for i in range(n_points - 1):
                k1 = h * ode_func(t[i], y[i])
                k2 = h * ode_func(t[i] + h/2, y[i] + k1/2)
                k3 = h * ode_func(t[i] + h/2, y[i] + k2/2)
                k4 = h * ode_func(t[i] + h, y[i] + k3)
                y[i + 1] = y[i] + (k1 + 2*k2 + 2*k3 + k4) / 6
        
        return {'time': t, 'y': y}
    
    def _solve_adaptive(self, ode_func: Callable, t_range: Dict, y0: float, 
                       t_eval: np.ndarray, method: str, tolerance: float) -> Dict:
        """Solve ODE using adaptive methods from scipy"""
        t_span = (t_range['min'], t_range['max'])
        
        # Map method names to scipy methods
        method_map = {
            'rk45': 'RK45',
            'dopri5': 'DOP853',
            'bdf': 'BDF',
            'radau': 'Radau',
            'rk23': 'RK23',
            'lsoda': 'LSODA'
        }
        
        scipy_method = method_map.get(method, 'RK45')
        
        # Solve the ODE
        solution = solve_ivp(
            ode_func, 
            t_span, 
            [y0], 
            method=scipy_method,
            t_eval=t_eval,
            rtol=tolerance,
            atol=tolerance
        )
        
        if not solution.success:
            raise ValueError(f"Scipy solver failed: {solution.message}")
        
        return {'time': solution.t, 'y': solution.y[0]}

class ODESolver:
    """Main ODE solver class that handles all ODE types"""
    
    def __init__(self):
        self.first_order_solver = FirstOrderODESolver()
    
    def solve_ode_problem(self, problem: Dict) -> Dict:
        """
        Main function to solve ODE problems
        
        Args:
            problem: Dictionary containing ODE problem definition
                - ode_type: 'first_order', 'second_order', or 'system'
                - method: Solving method
                - time_range: {'min': t0, 'max': t1}
                - points: Number of points
                - tolerance: Error tolerance
                - equations: List of ODE equations
                - initial_conditions: Dictionary of initial conditions
                - parameters: Dictionary of parameters
                
        Returns:
            Dictionary with solution data
        """
        start_time = time.time()
        
        try:
            ode_type = problem.get('ode_type', 'first_order')
            
            if ode_type == 'first_order':
                result = self._solve_first_order_system(problem)
            elif ode_type == 'second_order':
                result = self._solve_second_order_system(problem)
            elif ode_type == 'system':
                result = self._solve_ode_system(problem)
            else:
                result = {
                    'success': False,
                    'error': f'Unknown ODE type: {ode_type}'
                }
            
            # Add computation time
            if result['success']:
                result['computation_time'] = time.time() - start_time
                result['metadata'] = {
                    'ode_type': ode_type,
                    'method': problem.get('method', 'rk4'),
                    'points': problem.get('points', 1000),
                    'tolerance': problem.get('tolerance', 1e-6)
                }
            
            return result
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Unexpected error in ODE solver: {str(e)}',
                'computation_time': time.time() - start_time
            }
    
    def _solve_first_order_system(self, problem: Dict) -> Dict:
        """Solve system of first order ODEs"""
        equations = problem.get('equations', [])
        
        if not equations:
            return {
                'success': False,
                'error': 'No equations provided for first order ODE system'
            }
        
        # For now, solve each equation independently
        # In a real implementation, you'd handle coupled equations
        all_solutions = {}
        time_array = None
        
        for i, eq in enumerate(equations):
            single_problem = {
                'expression': eq['expression'],
                'variable': eq.get('variable', f'y{i}'),
                'initial_condition': eq['initial_condition'],
                'parameters': eq.get('parameters', {}),
                'time_range': problem['time_range'],
                'method': problem.get('method', 'rk4'),
                'points': problem.get('points', 1000),
                'tolerance': problem.get('tolerance', 1e-6)
            }
            
            result = self.first_order_solver.solve_single(single_problem)
            
            if not result['success']:
                return result
            
            # Store solutions
            var_name = single_problem['variable']
            all_solutions[var_name] = result['solutions'][var_name]
            
            # Use time from first successful solution
            if time_array is None:
                time_array = result['time']
        
        return {
            'success': True,
            'time': time_array,
            'solutions': all_solutions,
            'method_used': problem.get('method', 'rk4'),
            'message': f'Solved {len(equations)} first order ODE(s) successfully'
        }
    
    def _solve_second_order_system(self, problem: Dict) -> Dict:
        """Solve second order ODEs by converting to first order system"""
        # Placeholder - implement second order ODE solving
        return {
            'success': False,
            'error': 'Second order ODE solving not yet implemented'
        }
    
    def _solve_ode_system(self, problem: Dict) -> Dict:
        """Solve system of coupled ODEs"""
        # Placeholder - implement coupled ODE system solving
        return {
            'success': False,
            'error': 'Coupled ODE system solving not yet implemented'
        }

# Global solver instance
_solver_instance = None

def get_solver():
    """Get or create the global ODE solver instance"""
    global _solver_instance
    if _solver_instance is None:
        _solver_instance = ODESolver()
    return _solver_instance

def solve_ode_problem(problem: Dict) -> Dict:
    """
    Main function to solve ODE problems - interface for Django views
    
    Args:
        problem: ODE problem definition dictionary
        
    Returns:
        Solution result dictionary
    """
    solver = get_solver()
    return solver.solve_ode_problem(problem)

# Test function for development
def test_solver():
    """Test the ODE solver with sample problems"""
    solver = get_solver()
    
    # Test 1: Exponential decay
    problem1 = {
        'ode_type': 'first_order',
        'method': 'rk4',
        'time_range': {'min': 0, 'max': 5},
        'points': 100,
        'tolerance': 1e-6,
        'equations': [
            {
                'expression': '-k * y',
                'variable': 'y',
                'initial_condition': 1.0,
                'parameters': {'k': 0.5}
            }
        ]
    }
    
    print("Testing exponential decay...")
    result1 = solver.solve_ode_problem(problem1)
    print(f"Success: {result1['success']}")
    if result1['success']:
        print(f"Method: {result1['method_used']}")
        print(f"Message: {result1['message']}")
        print(f"Time points: {len(result1['time'])}")
        print(f"Final y value: {result1['solutions']['y'][-1]:.6f}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 2: Simple harmonic motion (conceptual)
    problem2 = {
        'ode_type': 'first_order',
        'method': 'rk4',
        'time_range': {'min': 0, 'max': 10},
        'points': 200,
        'equations': [
            {
                'expression': 'x',  # dx/dt = x (simplified)
                'variable': 'x',
                'initial_condition': 1.0,
                'parameters': {}
            }
        ]
    }
    
    print("Testing simple growth...")
    result2 = solver.solve_ode_problem(problem2)
    print(f"Success: {result2['success']}")
    if result2['success']:
        print(f"Final x value: {result2['solutions']['x'][-1]:.6f}")

if __name__ == "__main__":
    test_solver()
from django.shortcuts import render

# Create your views here.
# simulations/views.py
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import SimulationConfiguration, SimulationFunction, ODESolution
from .serializers import (
    SimulationConfigurationSerializer, 
    SimulationCreateSerializer,
    SimulationUpdateSerializer,
    TrigonometryConfigSerializer,
    CustomFunctionConfigSerializer,
    ODEConfigSerializer
)
import time
import sys
import os

# Add the core directory to Python path
core_path = os.path.join(os.path.dirname(__file__), 'core')
if core_path not in sys.path:
    sys.path.append(core_path)

try:
    from simulations.core.ode_solver import solve_ode_problem
    ODE_SOLVER_AVAILABLE = True
except ImportError as e:
    print(f"Warning: ODE solver module not available: {e}")
    ODE_SOLVER_AVAILABLE = False
    

@api_view(['GET', 'POST'])
def simulation_list(request):
    """List all simulations for current user or create new simulation"""
    if request.method == 'GET':
        simulations = SimulationConfiguration.objects.filter(user=request.user)
        serializer = SimulationConfigurationSerializer(simulations, many=True)
        return Response({
            'status': 'success',
            'data': serializer.data
        })
    
    elif request.method == 'POST':
        serializer = SimulationCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            simulation = serializer.save()
            return Response({
                'status': 'success',
                'message': 'Simulation created successfully',
                'data': SimulationConfigurationSerializer(simulation).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'status': 'error',
            'message': 'Creation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def simulation_detail(request, pk):
    """Get, update, or delete a specific simulation"""
    simulation = get_object_or_404(SimulationConfiguration, pk=pk, user=request.user)
    
    if request.method == 'GET':
        serializer = SimulationConfigurationSerializer(simulation)
        return Response({
            'status': 'success',
            'data': serializer.data
        })
    
    elif request.method == 'PUT':
        serializer = SimulationUpdateSerializer(simulation, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'status': 'success',
                'message': 'Simulation updated successfully',
                'data': SimulationConfigurationSerializer(simulation).data
            })
        
        return Response({
            'status': 'error',
            'message': 'Update failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        simulation.delete()
        return Response({
            'status': 'success',
            'message': 'Simulation deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def simulation_by_type(request, sim_type):
    """Get all simulations of a specific type for current user"""
    valid_types = [choice[0] for choice in SimulationConfiguration.SIMULATION_TYPES]
    
    if sim_type not in valid_types:
        return Response({
            'status': 'error',
            'message': f'Invalid simulation type. Must be one of: {", ".join(valid_types)}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    simulations = SimulationConfiguration.objects.filter(
        user=request.user, 
        simulation_type=sim_type
    )
    serializer = SimulationConfigurationSerializer(simulations, many=True)
    
    return Response({
        'status': 'success',
        'data': serializer.data
    })

@api_view(['GET'])
def favorite_simulations(request):
    """Get all favorite simulations for current user"""
    simulations = SimulationConfiguration.objects.filter(
        user=request.user, 
        is_favorite=True
    )
    serializer = SimulationConfigurationSerializer(simulations, many=True)
    
    return Response({
        'status': 'success',
        'data': serializer.data
    })

@api_view(['POST'])
def save_trigonometry_config(request):
    """Save a trigonometry configuration"""
    config_serializer = TrigonometryConfigSerializer(data=request.data)
    
    if config_serializer.is_valid():
        # Create or update simulation configuration
        simulation, created = SimulationConfiguration.objects.get_or_create(
            user=request.user,
            simulation_type='trigonometry',
            name=request.data.get('name', 'Trigonometry Configuration'),
            defaults={'config_data': config_serializer.validated_data}
        )
        
        if not created:
            simulation.config_data = config_serializer.validated_data
            simulation.save()
        
        # Handle functions if provided
        functions_data = request.data.get('functions', [])
        if functions_data:
            # Clear existing functions
            simulation.functions.all().delete()
            
            # Create new functions - MAP FIELD NAMES CORRECTLY
            for index, func_data in enumerate(functions_data):
                # Map frontend field names to model field names
                function_data = {
                    'configuration': simulation,
                    'function_type': func_data.get('type', 'sin'),  # 'type' → 'function_type'
                    'amplitude': func_data.get('amplitude', 1.0),
                    'frequency': func_data.get('frequency', 1.0),
                    'phase': func_data.get('phase', 0.0),
                    'color': func_data.get('color', '#4f46e5'),
                    'visible': func_data.get('visible', True),
                    'order': index,
                    'parameters': {}  # Default empty parameters
                }
                
                SimulationFunction.objects.create(**function_data)
        
        return Response({
            'status': 'success',
            'message': 'Trigonometry configuration saved successfully',
            'data': SimulationConfigurationSerializer(simulation).data
        })
    
    return Response({
        'status': 'error',
        'message': 'Invalid configuration data',
        'errors': config_serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def save_custom_function_config(request):
    """Save a custom function configuration"""
    config_serializer = CustomFunctionConfigSerializer(data=request.data)
    
    if config_serializer.is_valid():
        # Extract name from request data
        name = request.data.get('name', 'Custom Function Configuration')
        
        # Prepare config data for storage
        config_data = config_serializer.validated_data.copy()
        
        # Create or update simulation configuration
        simulation, created = SimulationConfiguration.objects.get_or_create(
            user=request.user,
            simulation_type='custom_function',
            name=name,
            defaults={'config_data': config_data}
        )
        
        if not created:
            simulation.config_data = config_data
            simulation.save()
        
        # Handle functions if provided
        functions_data = request.data.get('functions', [])
        if functions_data:
            # Clear existing functions
            simulation.functions.all().delete()
            
            # Create new functions
            for index, func_data in enumerate(functions_data):
                try:
                    function_data = {
                        'configuration': simulation,
                        'function_type': func_data.get('type', 'custom'),
                        'expression': func_data.get('expression', ''),
                        'color': func_data.get('color', '#4f46e5'),
                        'visible': func_data.get('visible', True),
                        'order': index,
                        'parameters': func_data.get('parameters', {}),
                        # Set default values for trigonometry fields
                        'amplitude': 1.0,
                        'frequency': 1.0,
                        'phase': 0.0
                    }
                    
                    SimulationFunction.objects.create(**function_data)
                except Exception as e:
                    # Log error but continue with other functions
                    print(f"Error creating function {index}: {e}")
                    continue
        
        # Return the complete simulation data
        response_data = SimulationConfigurationSerializer(simulation).data
        return Response({
            'status': 'success',
            'message': 'Custom function configuration saved successfully',
            'data': response_data
        })
    
    return Response({
        'status': 'error',
        'message': 'Invalid configuration data',
        'errors': config_serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['POST'])
def toggle_favorite(request, pk):
    """Toggle favorite status for a simulation"""
    simulation = get_object_or_404(SimulationConfiguration, pk=pk, user=request.user)
    simulation.is_favorite = not simulation.is_favorite
    simulation.save()
    
    return Response({
        'status': 'success',
        'message': f'Simulation {"added to" if simulation.is_favorite else "removed from"} favorites',
        'data': {
            'id': simulation.id,
            'is_favorite': simulation.is_favorite
        }
    })


# NEW: ODE Views
@api_view(['POST'])
def save_ode_config(request):
    """Save ODE solver configuration"""
    config_serializer = ODEConfigSerializer(data=request.data)
    
    if config_serializer.is_valid():
        # Extract data
        data = config_serializer.validated_data
        name = data.get('name', 'ODE Configuration')
        section = data.get('section', 'first_order')
        ode_settings = data.get('odeSettings', {})
        
        # Create or update simulation configuration
        simulation, created = SimulationConfiguration.objects.update_or_create(
            user=request.user,
            simulation_type='ode',
            name=name,
            defaults={
                'ode_type': section,
                'ode_method': ode_settings.get('method', 'rk4'),
                'config_data': {
                    'simulation_mode': data.get('simulationMode', 'graphing'),
                    'ode_settings': ode_settings,
                    'first_order_odes': data.get('firstOrderOdes', []),
                    'second_order_odes': data.get('secondOrderOdes', []),
                    'system_odes': data.get('systemOdes', {}),
                    'simulation_params': data.get('simulationParams', {})
                }
            }
        )
        
        # Clear existing functions and create new ones
        simulation.functions.all().delete()
        
        # Create functions based on ODE type
        if section == 'first_order':
            for ode in data.get('firstOrderOdes', []):
                SimulationFunction.objects.create(
                    configuration=simulation,
                    function_type='first_order_ode',
                    expression=ode.get('expression', ''),
                    color=ode.get('color', '#4f46e5'),
                    visible=ode.get('visible', True),
                    parameters=ode.get('parameters', {}),
                    variable_name=ode.get('variableName', 'y'),
                    initial_conditions=ode.get('initialCondition', {})
                )
                
        elif section == 'second_order':
            for ode in data.get('secondOrderOdes', []):
                SimulationFunction.objects.create(
                    configuration=simulation,
                    function_type='second_order_ode',
                    expression=ode.get('expression', ''),
                    color=ode.get('color', '#10b981'),
                    visible=ode.get('visible', True),
                    parameters=ode.get('parameters', {}),
                    variable_name=ode.get('variableName', 'y'),
                    initial_conditions=ode.get('initialConditions', {})
                )
                
        elif section == 'systems':
            system_odes = data.get('systemOdes', {})
            for equation in system_odes.get('equations', []):
                SimulationFunction.objects.create(
                    configuration=simulation,
                    function_type='system_ode',
                    expression=equation.get('expression', ''),
                    color=equation.get('color', '#3b82f6'),
                    visible=equation.get('visible', True),
                    parameters=system_odes.get('parameters', {}),
                    variable_name=equation.get('variable', 'x'),
                    initial_conditions=system_odes.get('initialConditions', {})
                )
        
        # Return the complete simulation data
        response_data = SimulationConfigurationSerializer(simulation).data
        return Response({
            'status': 'success',
            'message': 'ODE configuration saved successfully',
            'data': response_data
        })
    
    return Response({
        'status': 'error',
        'message': 'Invalid ODE configuration data',
        'errors': config_serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def solve_ode(request):
    """Solve ODEs using the core solver module"""
    try:
        config_id = request.data.get('config_id')
        
        if not config_id:
            return Response({
                'status': 'error',
                'message': 'Configuration ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if ODE solver is available
        if not ODE_SOLVER_AVAILABLE:
            return Response({
                'status': 'error',
                'message': 'ODE solver module is not available. Please check server configuration.'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        # Get configuration
        simulation = get_object_or_404(SimulationConfiguration, pk=config_id, user=request.user)
        
        # Create a pending solution record
        ode_solution = ODESolution.objects.create(
            configuration=simulation,
            method_used=simulation.ode_method or 'rk4',
            status='pending'
        )
        
        try:
            # Prepare ODE problem data for the solver
            ode_problem = prepare_ode_problem(simulation)
            
            # Call the ODE solver
            start_time = time.time()
            solution_result = solve_ode_problem(ode_problem)
            computation_time = time.time() - start_time
            
            # Validate the solution result
            if not solution_result or 'success' not in solution_result:
                raise Exception("ODE solver returned invalid result")
            
            if not solution_result['success']:
                error_msg = solution_result.get('error', 'Unknown error occurred during ODE solving')
                raise Exception(error_msg)
            
            # Extract solution data
            solution_data = {
                'time': solution_result.get('time', []),
                'solutions': solution_result.get('solutions', {}),
                'method_used': simulation.ode_method or 'rk4',
                'computation_time': computation_time,
                'message': solution_result.get('message', 'ODE solved successfully'),
                'metadata': solution_result.get('metadata', {})
            }
            
            # Update solution with actual data
            ode_solution.solution_data = solution_data
            ode_solution.computation_time = computation_time
            ode_solution.status = 'success'
            ode_solution.save()
            
            return Response({
                'status': 'success',
                'message': 'ODE solved successfully',
                'data': {
                    'solution_id': ode_solution.id,
                    'solution_data': solution_data,
                    'configuration': SimulationConfigurationSerializer(simulation).data
                }
            })
            
        except Exception as solver_error:
            # Update solution with solver error
            ode_solution.status = 'error'
            ode_solution.error_message = str(solver_error)
            ode_solution.save()
            
            return Response({
                'status': 'error',
                'message': f'ODE solver error: {str(solver_error)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    except Exception as e:
        # Update solution with error if it was created
        if 'ode_solution' in locals():
            ode_solution.status = 'error'
            ode_solution.error_message = str(e)
            ode_solution.save()
            
        return Response({
            'status': 'error',
            'message': f'Error solving ODE: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)

def prepare_ode_problem(simulation):
    """Prepare ODE problem data for the solver module"""
    ode_data = simulation.get_ode_data()
    
    problem = {
        'ode_type': ode_data['ode_type'],
        'method': simulation.ode_method or 'rk4',
        'time_range': ode_data['ode_settings']['timeRange'],
        'points': ode_data['ode_settings']['points'],
        'tolerance': ode_data['ode_settings']['tolerance'],
        'max_step': ode_data['ode_settings'].get('max_step', 0.1),
        'min_step': ode_data['ode_settings'].get('min_step', 1e-4),
    }
    
    # Prepare based on ODE type
    if ode_data['ode_type'] == 'first_order':
        problem['equations'] = []
        for ode_func in simulation.functions.filter(function_type='first_order_ode'):
            problem['equations'].append({
                'expression': ode_func.expression or '',
                'variable': ode_func.variable_name or 'y',
                'initial_condition': ode_func.initial_conditions.get('y0', 1.0),
                'parameters': ode_func.parameters or {}
            })
    
    elif ode_data['ode_type'] == 'second_order':
        problem['equations'] = []
        for ode_func in simulation.functions.filter(function_type='second_order_ode'):
            problem['equations'].append({
                'expression': ode_func.expression or '',
                'variable': ode_func.variable_name or 'y',
                'initial_conditions': {
                    'y0': ode_func.initial_conditions.get('y0', 1.0),
                    'dy0': ode_func.initial_conditions.get('dy0', 0.0)
                },
                'parameters': ode_func.parameters or {}
            })
    
    elif ode_data['ode_type'] == 'system':
        system_odes = ode_data['system_odes']
        problem['equations'] = []
        for eq_func in simulation.functions.filter(function_type='system_ode'):
            problem['equations'].append({
                'expression': eq_func.expression or '',
                'variable': eq_func.variable_name or 'x',
                'parameters': eq_func.parameters or {}
            })
        problem['initial_conditions'] = system_odes.get('initialConditions', {})
        problem['physical_interpretation'] = system_odes.get('physicalInterpretation', 'none')
    
    return problem

@api_view(['GET'])
def get_ode_solutions(request, config_id):
    """Get all solutions for a specific ODE configuration"""
    simulation = get_object_or_404(SimulationConfiguration, pk=config_id, user=request.user)
    
    solutions = ODESolution.objects.filter(configuration=simulation).order_by('-computed_at')
    
    solutions_data = []
    for solution in solutions:
        solutions_data.append({
            'id': solution.id,
            'computed_at': solution.computed_at,
            'computation_time': solution.computation_time,
            'status': solution.status,
            'method_used': solution.method_used,
            'error_message': solution.error_message,
            'solution_data': solution.solution_data
        })
    
    return Response({
        'status': 'success',
        'data': {
            'configuration': SimulationConfigurationSerializer(simulation).data,
            'solutions': solutions_data
        }
    })

@api_view(['GET'])
def get_ode_solution(request, solution_id):
    """Get a specific ODE solution"""
    solution = get_object_or_404(ODESolution, pk=solution_id, configuration__user=request.user)
    
    return Response({
        'status': 'success',
        'data': {
            'id': solution.id,
            'computed_at': solution.computed_at,
            'computation_time': solution.computation_time,
            'status': solution.status,
            'method_used': solution.method_used,
            'error_message': solution.error_message,
            'solution_data': solution.solution_data,
            'configuration': SimulationConfigurationSerializer(solution.configuration).data
        }
    })

@api_view(['DELETE'])
def delete_ode_solution(request, solution_id):
    """Delete a specific ODE solution"""
    solution = get_object_or_404(ODESolution, pk=solution_id, configuration__user=request.user)
    solution.delete()
    
    return Response({
        'status': 'success',
        'message': 'ODE solution deleted successfully'
    })

@api_view(['GET'])
def get_ode_methods(request):
    """Get available ODE solving methods"""
    methods = [
        {
            'value': method[0],
            'label': method[1],
            'description': get_method_description(method[0])
        }
        for method in SimulationConfiguration.ODE_METHODS
    ]
    
    return Response({
        'status': 'success',
        'data': {
            'methods': methods,
            'solver_available': ODE_SOLVER_AVAILABLE
        }
    })

def get_method_description(method):
    """Get description for ODE solving methods"""
    descriptions = {
        'rk4': '4th order Runge-Kutta - Accurate and stable for most problems',
        'rk45': 'Adaptive Runge-Kutta-Fehlberg - Good for variable step sizes',
        'dopri5': 'Dormand-Prince 5th order - High accuracy with error control',
        'bdf': 'Backward Differentiation Formula - Good for stiff equations',
        'radau': 'Radau IIA implicit method - Excellent for stiff problems',
        'euler': 'Euler method - Simple but less accurate',
        'midpoint': 'Midpoint method - Better accuracy than Euler',
        'heun': 'Heun method - Improved Euler method',
        'rk23': '2nd/3rd order Runge-Kutta - Balanced accuracy and speed',
        'lsoda': 'LSODA adaptive solver - Automatically switches methods'
    }
    return descriptions.get(method, 'No description available')
import React, { useState, useMemo } from 'react';
import { evaluate, derivative, simplify } from 'mathjs';
import Plot from 'react-plotly.js';

const Calculus = () => {
  const [activeTab, setActiveTab] = useState('derivatives');
  const [functionInput, setFunctionInput] = useState('x^2');
  const [xRange, setXRange] = useState({ min: -5, max: 5 });
  const [pointOfInterest, setPointOfInterest] = useState(1);
  const [integralBounds, setIntegralBounds] = useState({ a: 0, b: 2 });
  const [limitPoint, setLimitPoint] = useState(0);

  // Generate data for plotting
  const plotData = useMemo(() => {
    const xValues = [];
    const yValues = [];
    const step = (xRange.max - xRange.min) / 200;

    for (let x = xRange.min; x <= xRange.max; x += step) {
      try {
        const y = evaluate(functionInput, { x });
        xValues.push(x);
        yValues.push(y);
      } catch (error) {
        // Skip invalid points
      }
    }

    return { x: xValues, y: yValues };
  }, [functionInput, xRange]);

  // Calculate derivative
  const derivativeData = useMemo(() => {
    try {
      const deriv = derivative(functionInput, 'x').toString();
      const simplifiedDeriv = simplify(deriv).toString();
      
      const xValues = [];
      const yValues = [];
      const step = (xRange.max - xRange.min) / 200;

      for (let x = xRange.min; x <= xRange.max; x += step) {
        try {
          const y = evaluate(deriv, { x });
          xValues.push(x);
          yValues.push(y);
        } catch (error) {
          // Skip invalid points
        }
      }

      return { derivative: simplifiedDeriv, x: xValues, y: yValues };
    } catch (error) {
      return { derivative: 'Error calculating derivative', x: [], y: [] };
    }
  }, [functionInput, xRange]);

  // Calculate tangent line at point of interest
  const tangentLineData = useMemo(() => {
    try {
      const f = (x) => evaluate(functionInput, { x });
      const deriv = derivative(functionInput, 'x').toString();
      const slope = evaluate(deriv, { x: pointOfInterest });
      const y0 = f(pointOfInterest);
      
      const tangentX = [pointOfInterest - 1, pointOfInterest + 1];
      const tangentY = tangentX.map(x => slope * (x - pointOfInterest) + y0);

      return { x: tangentX, y: tangentY, slope, y0 };
    } catch (error) {
      return { x: [], y: [], slope: 0, y0: 0 };
    }
  }, [functionInput, pointOfInterest]);

  // Helper function to find antiderivative for common functions
  const findAntiderivative = (func) => {
    try {
      // Handle common patterns for antiderivatives
      if (func === 'x') return '0.5*x^2';
      if (func === 'x^2') return '(1/3)*x^3';
      if (func === 'x^3') return '0.25*x^4';
      if (func === 'sin(x)') return '-cos(x)';
      if (func === 'cos(x)') return 'sin(x)';
      if (func === 'exp(x)') return 'exp(x)';
      if (func === 'e^x') return 'e^x';
      
      // Handle power functions: x^n
      const powerMatch = func.match(/x\^(\d+)/);
      if (powerMatch) {
        const n = parseInt(powerMatch[1]);
        return `(1/${n + 1})*x^${n + 1}`;
      }
      
      // Handle constants multiplied by functions
      const constantMatch = func.match(/(\d*\.?\d+)\*?(.*)/);
      if (constantMatch && constantMatch[2]) {
        const constant = constantMatch[1] || '1';
        const innerFunc = constantMatch[2];
        const innerAntiderivative = findAntiderivative(innerFunc);
        if (innerAntiderivative) {
          return `${constant}*(${innerAntiderivative})`;
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  };

  // Calculate integral area using improved numerical integration
  const integralData = useMemo(() => {
    try {
      const areaX = [];
      const areaY = [];
      // Use more points for better accuracy
      const step = (integralBounds.b - integralBounds.a) / 1000;
      
      for (let x = integralBounds.a; x <= integralBounds.b; x += step) {
        try {
          const y = evaluate(functionInput, { x });
          areaX.push(x);
          areaY.push(y);
        } catch (error) {
          // Skip invalid points
        }
      }

      // Try to find exact antiderivative first
      let integralValue;
      let exact = false;
      
      try {
        const antiderivative = findAntiderivative(functionInput);
        if (antiderivative) {
          const upper = evaluate(antiderivative, { x: integralBounds.b });
          const lower = evaluate(antiderivative, { x: integralBounds.a });
          integralValue = upper - lower;
          exact = true;
        } else {
          // Fallback to Simpson's rule for better numerical integration
          throw new Error('No antiderivative found');
        }
      } catch (error) {
        // Use Simpson's rule for numerical integration (more accurate than trapezoidal)
        exact = false;
        const n = areaX.length - 1;
        if (n < 2) {
          integralValue = 0;
        } else {
          let sum = areaY[0] + areaY[n];
          for (let i = 1; i < n; i += 2) {
            sum += 4 * areaY[i];
          }
          for (let i = 2; i < n - 1; i += 2) {
            sum += 2 * areaY[i];
          }
          integralValue = (sum * (integralBounds.b - integralBounds.a)) / (3 * n);
        }
      }

      return { 
        x: areaX, 
        y: areaY, 
        value: integralValue,
        exact: exact
      };
    } catch (error) {
      console.error('Integration error:', error);
      return { x: [], y: [], value: 0, exact: false };
    }
  }, [functionInput, integralBounds]);

  // Calculate limit
  const limitData = useMemo(() => {
    try {
      const f = (x) => evaluate(functionInput, { x });
      const approaches = [];
      const values = [];
      
      // Approach from left
      for (let x = limitPoint - 2; x < limitPoint; x += 0.1) {
        try {
          approaches.push(x);
          values.push(f(x));
        } catch (error) {
          // Skip invalid points
        }
      }
      
      // Approach from right
      for (let x = limitPoint + 0.1; x <= limitPoint + 2; x += 0.1) {
        try {
          approaches.push(x);
          values.push(f(x));
        } catch (error) {
          // Skip invalid points
        }
      }

      const leftLimit = f(limitPoint - 0.0001);
      const rightLimit = f(limitPoint + 0.0001);
      const limitExists = Math.abs(leftLimit - rightLimit) < 0.001;

      return { 
        approaches, 
        values, 
        leftLimit, 
        rightLimit, 
        limitExists,
        limitValue: limitExists ? (leftLimit + rightLimit) / 2 : undefined
      };
    } catch (error) {
      return { approaches: [], values: [], leftLimit: 0, rightLimit: 0, limitExists: false };
    }
  }, [functionInput, limitPoint]);

  const renderDerivativesTab = () => (
    <div className="calculus-tab">
      <div className="control-section">
        <h3>📈 Function & Derivative</h3>
        <div className="control-group">
          <label>Function f(x):</label>
          <input
            type="text"
            value={functionInput}
            onChange={(e) => setFunctionInput(e.target.value)}
            placeholder="e.g., x^2, sin(x), exp(x)"
          />
          <small>Use mathematical expressions with x as variable</small>
        </div>
        
        <div className="control-row">
          <div className="control-group">
            <label>Point of Interest (x):</label>
            <input
              type="number"
              value={pointOfInterest}
              onChange={(e) => setPointOfInterest(parseFloat(e.target.value))}
              step="0.1"
            />
          </div>
        </div>

        <div className="result-card">
          <h4>Calculated Results</h4>
          <p><strong>f(x) =</strong> {functionInput}</p>
          <p><strong>f'(x) =</strong> {derivativeData.derivative}</p>
          <p><strong>Slope at x={pointOfInterest}:</strong> {tangentLineData.slope?.toFixed(4)}</p>
        </div>
      </div>
    </div>
  );

  const renderIntegralsTab = () => (
    <div className="calculus-tab">
      <div className="control-section">
        <h3>📊 Definite Integral</h3>
        <div className="control-group">
          <label>Function f(x):</label>
          <input
            type="text"
            value={functionInput}
            onChange={(e) => setFunctionInput(e.target.value)}
            placeholder="e.g., x^2, sin(x), exp(x)"
          />
        </div>
        
        <div className="control-row">
          <div className="control-group">
            <label>Lower bound (a):</label>
            <input
              type="number"
              value={integralBounds.a}
              onChange={(e) => setIntegralBounds(prev => ({ ...prev, a: parseFloat(e.target.value) }))}
              step="0.1"
            />
          </div>
          <div className="control-group">
            <label>Upper bound (b):</label>
            <input
              type="number"
              value={integralBounds.b}
              onChange={(e) => setIntegralBounds(prev => ({ ...prev, b: parseFloat(e.target.value) }))}
              step="0.1"
            />
          </div>
        </div>

        <div className="result-card">
          <h4>Integral Result</h4>
          <p><strong>∫</strong> from {integralBounds.a} to {integralBounds.b} of {functionInput} dx</p>
          <p><strong>Area:</strong> {integralData.value?.toFixed(6)}</p>
          {integralData.exact ? (
            <p className="exact-indicator">✓ Calculated using exact integration</p>
          ) : (
            <p className="approximate-indicator">≈ Numerical approximation (Simpson's rule)</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderLimitsTab = () => (
    <div className="calculus-tab">
      <div className="control-section">
        <h3>🎯 Limit Analysis</h3>
        <div className="control-group">
          <label>Function f(x):</label>
          <input
            type="text"
            value={functionInput}
            onChange={(e) => setFunctionInput(e.target.value)}
            placeholder="e.g., sin(x)/x, (x^2-1)/(x-1)"
          />
          <small>Try functions with interesting limits</small>
        </div>
        
        <div className="control-group">
          <label>Limit Point (x →):</label>
          <input
            type="number"
            value={limitPoint}
            onChange={(e) => setLimitPoint(parseFloat(e.target.value))}
            step="0.1"
          />
        </div>

        <div className="result-card">
          <h4>Limit Analysis</h4>
          <p><strong>lim</strong> x→{limitPoint} of {functionInput}</p>
          <p><strong>Left Limit:</strong> {limitData.leftLimit?.toFixed(4)}</p>
          <p><strong>Right Limit:</strong> {limitData.rightLimit?.toFixed(4)}</p>
          <p><strong>Limit Exists:</strong> {limitData.limitExists ? 'Yes' : 'No'}</p>
          {limitData.limitExists && (
            <p><strong>Limit Value:</strong> {limitData.limitValue?.toFixed(4)}</p>
          )}
        </div>
      </div>
    </div>
  );

  const getPlotData = () => {
    const baseData = [
      {
        x: plotData.x,
        y: plotData.y,
        type: 'scatter',
        mode: 'lines',
        name: `f(x) = ${functionInput}`,
        line: { color: '#9333ea', width: 3 }
      }
    ];

    if (activeTab === 'derivatives') {
      baseData.push(
        {
          x: derivativeData.x,
          y: derivativeData.y,
          type: 'scatter',
          mode: 'lines',
          name: `f'(x) = ${derivativeData.derivative}`,
          line: { color: '#dc2626', width: 2, dash: 'dash' }
        },
        {
          x: tangentLineData.x,
          y: tangentLineData.y,
          type: 'scatter',
          mode: 'lines',
          name: `Tangent at x=${pointOfInterest}`,
          line: { color: '#059669', width: 2 }
        },
        {
          x: [pointOfInterest],
          y: [tangentLineData.y0],
          type: 'scatter',
          mode: 'markers',
          name: `Point (${pointOfInterest}, ${tangentLineData.y0?.toFixed(2)})`,
          marker: { color: '#ea580c', size: 10 }
        }
      );
    } else if (activeTab === 'integrals') {
      baseData.push({
        x: integralData.x,
        y: integralData.y,
        type: 'scatter',
        mode: 'lines',
        name: `Area under curve`,
        line: { color: '#9333ea', width: 2 },
        fill: 'tozeroy',
        fillcolor: 'rgba(147, 51, 234, 0.3)'
      });
    } else if (activeTab === 'limits') {
      baseData.push(
        {
          x: [limitPoint],
          y: [limitData.limitValue],
          type: 'scatter',
          mode: 'markers',
          name: `Limit at x=${limitPoint}`,
          marker: { 
            color: limitData.limitExists ? '#059669' : '#dc2626', 
            size: 12,
            symbol: limitData.limitExists ? 'circle' : 'x'
          }
        },
        {
          x: limitData.approaches,
          y: limitData.values,
          type: 'scatter',
          mode: 'markers',
          name: 'Approach',
          marker: { 
            color: '#ea580c', 
            size: 4,
            opacity: 0.6
          },
          showlegend: false
        }
      );
    }

    return baseData;
  };

  const getPlotLayout = () => {
    const baseLayout = {
      title: {
        text: getPlotTitle(),
        font: { color: '#e0e0e0' }
      },
      xaxis: { 
        title: { text: 'x', font: { color: '#e0e0e0' } }, 
        range: [xRange.min, xRange.max],
        gridcolor: '#333',
        zerolinecolor: '#666'
      },
      yaxis: { 
        title: { text: 'y', font: { color: '#e0e0e0' } },
        gridcolor: '#333',
        zerolinecolor: '#666'
      },
      plot_bgcolor: 'rgba(0,0,0,0)',
      paper_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#e0e0e0' },
      showlegend: true,
      hovermode: 'closest',
      legend: {
        font: { color: '#e0e0e0' },
        bgcolor: 'rgba(0,0,0,0.5)'
      }
    };

    if (activeTab === 'limits' && limitData.limitExists) {
      baseLayout.shapes = [
        {
          type: 'line',
          x0: limitPoint,
          x1: limitPoint,
          y0: Math.min(...plotData.y),
          y1: Math.max(...plotData.y),
          line: { color: '#dc2626', width: 1, dash: 'dot' }
        }
      ];
    }

    return baseLayout;
  };

  const getPlotTitle = () => {
    switch (activeTab) {
      case 'derivatives':
        return 'Function, Derivative, and Tangent Line';
      case 'integrals':
        return 'Definite Integral - Area Under Curve';
      case 'limits':
        return `Limit as x → ${limitPoint}`;
      default:
        return 'Calculus Visualization';
    }
  };

  return (
    <div className="calculus-page">
      <div className="calculus-content">
        {/* Controls Sidebar */}
        <aside className="controls-sidebar">
          <div className="control-section">
            <h3>∫ Calculus Type</h3>
            <div className="dimension-toggle">
              <button 
                className={`dimension-btn ${activeTab === 'derivatives' ? 'active' : ''}`}
                onClick={() => setActiveTab('derivatives')}
              >
                Derivatives
              </button>
              <button 
                className={`dimension-btn ${activeTab === 'integrals' ? 'active' : ''}`}
                onClick={() => setActiveTab('integrals')}
              >
                Integrals
              </button>
              <button 
                className={`dimension-btn ${activeTab === 'limits' ? 'active' : ''}`}
                onClick={() => setActiveTab('limits')}
              >
                Limits
              </button>
            </div>
          </div>

          {activeTab === 'derivatives' && renderDerivativesTab()}
          {activeTab === 'integrals' && renderIntegralsTab()}
          {activeTab === 'limits' && renderLimitsTab()}

          <div className="control-section">
            <h3>⚙️ Display Range</h3>
            <div className="control-row">
              <div className="control-group">
                <label>X Min:</label>
                <input
                  type="number"
                  value={xRange.min}
                  onChange={(e) => setXRange(prev => ({ ...prev, min: parseFloat(e.target.value) }))}
                  step="1"
                />
              </div>
              <div className="control-group">
                <label>X Max:</label>
                <input
                  type="number"
                  value={xRange.max}
                  onChange={(e) => setXRange(prev => ({ ...prev, max: parseFloat(e.target.value) }))}
                  step="1"
                />
              </div>
            </div>
          </div>

          <div className="control-section">
            <h3>📚 Quick Examples</h3>
            <div className="examples-grid">
              <button 
                className="example-btn"
                onClick={() => setFunctionInput('x^2')}
              >
                x²
              </button>
              <button 
                className="example-btn"
                onClick={() => setFunctionInput('sin(x)')}
              >
                sin(x)
              </button>
              <button 
                className="example-btn"
                onClick={() => setFunctionInput('exp(x)')}
              >
                eˣ
              </button>
              <button 
                className="example-btn"
                onClick={() => setFunctionInput('1/x')}
              >
                1/x
              </button>
            </div>
          </div>
        </aside>

        {/* Main Visualization Area */}
        <main className="visualization-area">
          <div className="plot-container">
            <Plot
              data={getPlotData()}
              layout={getPlotLayout()}
              style={{ width: '100%', height: '100%' }}
              config={{
                displayModeBar: true,
                displaylogo: false,
                modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
                responsive: true
              }}
            />
          </div>

          <div className="educational-section">
            <h3>💡 Calculus Concepts</h3>
            <div className="info-cards">
              <div className="info-card">
                <h4>Derivatives</h4>
                <ul>
                  <li>Rate of change at a point</li>
                  <li>Slope of tangent line</li>
                  <li>Instantaneous velocity</li>
                </ul>
              </div>
              <div className="info-card">
                <h4>Integrals</h4>
                <ul>
                  <li>Area under curve</li>
                  <li>Accumulated quantity</li>
                  <li>Antiderivative</li>
                </ul>
              </div>
              <div className="info-card">
                <h4>Limits</h4>
                <ul>
                  <li>Approaching behavior</li>
                  <li>Continuity analysis</li>
                  <li>Foundation of calculus</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Calculus;
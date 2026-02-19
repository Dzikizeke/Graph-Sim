import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Plot from 'react-plotly.js';

const Statistics = () => {
  const navigate = useNavigate();
  
  // State management
  const [activeChart, setActiveChart] = useState('histogram');
  const [dataset, setDataset] = useState([]);
  const [dataset2, setDataset2] = useState([]); // For scatter plots
  const [stats, setStats] = useState({});
  const [stats2, setStats2] = useState({});
  const [chartData, setChartData] = useState([]);
  const [inputData, setInputData] = useState('1,2,3,4,5,6,7,8,9,10');
  const [inputData2, setInputData2] = useState('1,2,3,4,5,6,7,8,9,10');

  // Predefined datasets
  const sampleDatasets = {
    normal: Array.from({ length: 1000 }, () => {
      const u1 = Math.random();
      const u2 = Math.random();
      return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }),
    uniform: Array.from({ length: 100 }, () => Math.random() * 10),
    exponential: Array.from({ length: 100 }, () => -Math.log(1 - Math.random()) * 2),
    linear: Array.from({ length: 50 }, (_, i) => i + Math.random() * 2),
  };

  // Calculate statistics
  const calculateStats = (data) => {
    if (!data.length) return {};
    
    const sorted = [...data].sort((a, b) => a - b);
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const median = sorted.length % 2 === 0 
      ? (sorted[sorted.length/2 - 1] + sorted[sorted.length/2]) / 2 
      : sorted[Math.floor(sorted.length/2)];
    const stdDev = Math.sqrt(data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length);
    const variance = stdDev * stdDev;
    
    return {
      count: data.length,
      mean: mean,
      median: median,
      stdDev: stdDev,
      variance: variance,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      range: sorted[sorted.length - 1] - sorted[0],
      q1: sorted[Math.floor(sorted.length * 0.25)],
      q3: sorted[Math.floor(sorted.length * 0.75)],
    };
  };

  // Parse input data
  const parseData = (input) => {
    return input
      .split(',')
      .map(val => parseFloat(val.trim()))
      .filter(val => !isNaN(val));
  };

  // Initialize with sample data
  useEffect(() => {
    const initialData = parseData(inputData);
    const initialData2 = parseData(inputData2);
    setDataset(initialData);
    setDataset2(initialData2);
    setStats(calculateStats(initialData));
    setStats2(calculateStats(initialData2));
  }, []);

  // Update chart when data or chart type changes
  useEffect(() => {
    generateChartData();
  }, [dataset, dataset2, activeChart]);

  const generateChartData = () => {
    let newData = [];

    switch (activeChart) {
      case 'histogram':
        newData = [{
          x: dataset,
          type: 'histogram',
          name: 'Distribution',
          marker: { color: '#4f46e5' },
          opacity: 0.7,
        }];
        break;

      case 'scatter':
        newData = [{
          x: dataset,
          y: dataset2,
          mode: 'markers',
          type: 'scatter',
          name: 'Data Points',
          marker: { 
            color: '#dc2626',
            size: 8,
            opacity: 0.6 
          },
        }];
        break;

      case 'box':
        newData = [{
          y: dataset,
          type: 'box',
          name: 'Data Distribution',
          marker: { color: '#059669' },
          boxpoints: 'all',
          jitter: 0.3,
          pointpos: -1.8,
        }];
        break;

      case 'violin':
        newData = [{
          y: dataset,
          type: 'violin',
          name: 'Density',
          marker: { color: '#7c3aed' },
          box: { visible: true },
          meanline: { visible: true },
        }];
        break;

      case 'probability':
        // Normal probability plot
        const sortedData = [...dataset].sort((a, b) => a - b);
        const theoreticalQuantiles = sortedData.map((_, i) => 
          Math.sqrt(2) * erfInv((2 * (i + 1) - 1) / (2 * sortedData.length) - 1)
        );
        
        newData = [{
          x: theoreticalQuantiles,
          y: sortedData,
          mode: 'markers',
          type: 'scatter',
          name: 'Probability Plot',
          marker: { color: '#ea580c' },
        }];
        break;

      default:
        newData = [];
    }

    setChartData(newData);
  };

  // Error function inverse for probability plots
  function erfInv(x) {
    const a = 0.147;
    const b = 2 / (Math.PI * a) + Math.log(1 - x * x) / 2;
    return Math.sign(x) * Math.sqrt(Math.sqrt(b * b - Math.log(1 - x * x) / a) - b);
  }

  // Handle data input
  const handleDataInput = () => {
    const newData = parseData(inputData);
    const newData2 = parseData(inputData2);
    setDataset(newData);
    setDataset2(newData2);
    setStats(calculateStats(newData));
    setStats2(calculateStats(newData2));
  };

  // Load sample dataset
  const loadSampleData = (type) => {
    const sampleData = sampleDatasets[type];
    setInputData(sampleData.map(val => val.toFixed(2)).join(', '));
    setDataset(sampleData);
    setStats(calculateStats(sampleData));
    
    // For scatter plots, load a correlated dataset
    if (type === 'normal') {
      const correlatedData = sampleData.map(val => val * 0.8 + Math.random());
      setInputData2(correlatedData.map(val => val.toFixed(2)).join(', '));
      setDataset2(correlatedData);
      setStats2(calculateStats(correlatedData));
    }
  };

  // Generate random data
  const generateRandomData = () => {
    const randomData = Array.from({ length: 100 }, () => 
      (Math.random() * 20 - 10).toFixed(2)
    );
    setInputData(randomData.join(', '));
    setDataset(randomData.map(Number));
    setStats(calculateStats(randomData.map(Number)));
  };

  // Calculate correlation for scatter plots
  const calculateCorrelation = () => {
    if (dataset.length !== dataset2.length) return 0;
    
    const mean1 = stats.mean;
    const mean2 = stats2.mean;
    
    const numerator = dataset.reduce((sum, val, i) => 
      sum + (val - mean1) * (dataset2[i] - mean2), 0
    );
    
    const denominator = Math.sqrt(
      dataset.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) *
      dataset2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0)
    );
    
    return denominator === 0 ? 0 : numerator / denominator;
  };

  return (
    <div className="statistics-page">
      {/* Header */}
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1>Statistical Analysis</h1>
        <p>Visualize and analyze datasets with various statistical charts</p>
      </header>

      <div className="stats-content">
        {/* Controls Sidebar */}
        <aside className="controls-sidebar">
          <div className="control-section">
            <h3>📁 Data Input</h3>
            
            <div className="data-input-group">
              <label>Dataset 1 (comma-separated):</label>
              <textarea
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                placeholder="Enter numbers separated by commas..."
                rows="3"
              />
            </div>

            {(activeChart === 'scatter' || activeChart === 'probability') && (
              <div className="data-input-group">
                <label>Dataset 2 (comma-separated):</label>
                <textarea
                  value={inputData2}
                  onChange={(e) => setInputData2(e.target.value)}
                  placeholder="Enter numbers separated by commas..."
                  rows="3"
                />
              </div>
            )}

            <button className="apply-btn" onClick={handleDataInput}>
              Apply Data
            </button>
          </div>

          <div className="control-section">
            <h3>🎯 Sample Datasets</h3>
            <div className="sample-buttons">
              <button onClick={() => loadSampleData('normal')}>Normal Distribution</button>
              <button onClick={() => loadSampleData('uniform')}>Uniform Distribution</button>
              <button onClick={() => loadSampleData('exponential')}>Exponential Distribution</button>
              <button onClick={() => loadSampleData('linear')}>Linear Data</button>
              <button onClick={generateRandomData}>Random Data</button>
            </div>
          </div>

          <div className="control-section">
            <h3>📊 Chart Types</h3>
            <div className="chart-buttons">
              <button 
                className={activeChart === 'histogram' ? 'active' : ''}
                onClick={() => setActiveChart('histogram')}
              >
                Histogram
              </button>
              <button 
                className={activeChart === 'scatter' ? 'active' : ''}
                onClick={() => setActiveChart('scatter')}
              >
                Scatter Plot
              </button>
              <button 
                className={activeChart === 'box' ? 'active' : ''}
                onClick={() => setActiveChart('box')}
              >
                Box Plot
              </button>
              <button 
                className={activeChart === 'violin' ? 'active' : ''}
                onClick={() => setActiveChart('violin')}
              >
                Violin Plot
              </button>
              <button 
                className={activeChart === 'probability' ? 'active' : ''}
                onClick={() => setActiveChart('probability')}
              >
                Probability Plot
              </button>
            </div>
          </div>

          {/* Statistics Display */}
          <div className="control-section">
            <h3>📈 Statistics</h3>
            <div className="stats-display">
              <div className="stat-item">
                <span className="stat-label">Count:</span>
                <span className="stat-value">{stats.count || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Mean:</span>
                <span className="stat-value">{stats.mean?.toFixed(4) || '0'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Median:</span>
                <span className="stat-value">{stats.median?.toFixed(4) || '0'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Std Dev:</span>
                <span className="stat-value">{stats.stdDev?.toFixed(4) || '0'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Variance:</span>
                <span className="stat-value">{stats.variance?.toFixed(4) || '0'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Min/Max:</span>
                <span className="stat-value">
                  {stats.min?.toFixed(2) || '0'} / {stats.max?.toFixed(2) || '0'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Range:</span>
                <span className="stat-value">{stats.range?.toFixed(4) || '0'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Q1/Q3:</span>
                <span className="stat-value">
                  {stats.q1?.toFixed(2) || '0'} / {stats.q3?.toFixed(2) || '0'}
                </span>
              </div>

              {/* Correlation for scatter plots */}
              {activeChart === 'scatter' && (
                <div className="stat-item highlight">
                  <span className="stat-label">Correlation:</span>
                  <span className="stat-value">
                    {calculateCorrelation().toFixed(4)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Visualization Area */}
        <main className="visualization-area">
          <div className="chart-header">
            <h2>
              {activeChart === 'histogram' && 'Histogram'}
              {activeChart === 'scatter' && 'Scatter Plot'}
              {activeChart === 'box' && 'Box Plot'}
              {activeChart === 'violin' && 'Violin Plot'}
              {activeChart === 'probability' && 'Normal Probability Plot'}
            </h2>
            <p>
              {activeChart === 'histogram' && 'Distribution of data values across bins'}
              {activeChart === 'scatter' && 'Relationship between two datasets'}
              {activeChart === 'box' && 'Five-number summary and outliers'}
              {activeChart === 'violin' && 'Density distribution and summary statistics'}
              {activeChart === 'probability' && 'Check for normal distribution'}
            </p>
          </div>

          <div className="plot-container">
            <Plot
              data={chartData}
              layout={{
                title: '',
                xaxis: {
                  title: activeChart === 'scatter' ? 'Dataset 1' : 
                         activeChart === 'probability' ? 'Theoretical Quantiles' : 'Values',
                  gridcolor: '#444',
                  zerolinecolor: '#666'
                },
                yaxis: {
                  title: activeChart === 'scatter' ? 'Dataset 2' : 
                         activeChart === 'probability' ? 'Ordered Values' : 'Frequency/Values',
                  gridcolor: '#444',
                  zerolinecolor: '#666'
                },
                plot_bgcolor: 'rgba(0,0,0,0)',
                paper_bgcolor: 'rgba(0,0,0,0)',
                font: { color: '#fff' },
                showlegend: true,
                legend: { x: 0, y: 1, bgcolor: 'rgba(255,255,255,0.1)' }
              }}
              config={{
                displayModeBar: true,
                displaylogo: false,
                modeBarButtonsToRemove: ['pan2d', 'lasso2d'],
                responsive: true
              }}
              style={{ width: '100%', height: '500px' }}
            />
          </div>

          {/* Data Summary */}
          <div className="data-summary">
            <h3>📋 Data Summary</h3>
            <div className="summary-grid">
              <div className="summary-card">
                <h4>Dataset Preview</h4>
                <div className="data-preview">
                  {dataset.slice(0, 10).map((val, i) => (
                    <span key={i} className="data-point">{val.toFixed(2)}</span>
                  ))}
                  {dataset.length > 10 && <span>... and {dataset.length - 10} more</span>}
                </div>
              </div>
              
              <div className="summary-card">
                <h4>Distribution Info</h4>
                <p>Skewness: {((stats.mean - stats.median) / stats.stdDev)?.toFixed(4) || '0'}</p>
                <p>Data points: {stats.count}</p>
                <p>Data range: {stats.range?.toFixed(2) || '0'}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Statistics;
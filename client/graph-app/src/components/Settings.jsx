import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const navigate = useNavigate();
    
    // Settings state
    const [settings, setSettings] = useState({
        // Appearance
        theme: 'dark',
        language: 'english',
        fontSize: 'medium',
        
        // Performance
        graphQuality: 'high',
        autoSave: true,
        cacheSize: 100,
        
        // Notifications
        emailNotifications: true,
        pushNotifications: false,
        updateAlerts: true,
        
        // Data & Privacy
        dataCollection: false,
        analytics: true,
        autoUpdate: true,
        
        // Account
        username: 'math_enthusiast',
        email: 'user@example.com'
    });

    const [activeTab, setActiveTab] = useState('appearance');

    const handleSettingChange = (category, key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleResetSettings = () => {
        if (window.confirm('Are you sure you want to reset all settings to default?')) {
            setSettings({
                theme: 'dark',
                language: 'english',
                fontSize: 'medium',
                graphQuality: 'high',
                autoSave: true,
                cacheSize: 100,
                emailNotifications: true,
                pushNotifications: false,
                updateAlerts: true,
                dataCollection: false,
                analytics: true,
                autoUpdate: true,
                username: 'math_enthusiast',
                email: 'user@example.com'
            });
        }
    };

    const handleExportData = () => {
        // In a real app, this would export user data
        const data = {
            settings: settings,
            simulations: [], // This would contain actual user data
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        // Create download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `math-studio-backup-${new Date().getTime()}.json`;
        link.click();
    };

    const tabs = [
        { id: 'appearance', name: 'Appearance', icon: '🎨' },
        { id: 'performance', name: 'Performance', icon: '⚡' },
        { id: 'notifications', name: 'Notifications', icon: '🔔' },
        { id: 'privacy', name: 'Privacy & Data', icon: '🔒' },
        { id: 'account', name: 'Account', icon: '👤' },
        { id: 'about', name: 'About', icon: 'ℹ️' }
    ];

    return (
        <div className="settings-page">
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate('/')}>
                    ← Back to Home
                </button>
                <h1>Settings</h1>
                <p>Customize your Math Visualization Studio experience</p>
            </header>

            <div className="settings-content">
                {/* Settings Sidebar */}
                <aside className="settings-sidebar">
                    <nav className="settings-nav">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <span className="tab-icon">{tab.icon}</span>
                                {tab.name}
                            </button>
                        ))}
                    </nav>

                    <div className="sidebar-actions">
                        <button className="action-btn secondary" onClick={handleResetSettings}>
                            🔄 Reset to Defaults
                        </button>
                        <button className="action-btn secondary" onClick={handleExportData}>
                            💾 Export Data
                        </button>
                    </div>
                </aside>

                {/* Settings Main Content */}
                <main className="settings-main">
                    {/* Appearance Settings */}
                    {activeTab === 'appearance' && (
                        <div className="settings-section">
                            <h2>🎨 Appearance</h2>
                            <div className="settings-grid">
                                <div className="setting-item">
                                    <label>Theme</label>
                                    <select 
                                        value={settings.theme}
                                        onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                                    >
                                        <option value="dark">Dark</option>
                                        <option value="light">Light</option>
                                        <option value="auto">Auto (System)</option>
                                    </select>
                                    <p className="setting-description">Choose your preferred color theme</p>
                                </div>

                                <div className="setting-item">
                                    <label>Language</label>
                                    <select 
                                        value={settings.language}
                                        onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
                                    >
                                        <option value="english">English</option>
                                        <option value="spanish">Spanish</option>
                                        <option value="french">French</option>
                                        <option value="german">German</option>
                                    </select>
                                    <p className="setting-description">Interface language</p>
                                </div>

                                <div className="setting-item">
                                    <label>Font Size</label>
                                    <select 
                                        value={settings.fontSize}
                                        onChange={(e) => handleSettingChange('appearance', 'fontSize', e.target.value)}
                                    >
                                        <option value="small">Small</option>
                                        <option value="medium">Medium</option>
                                        <option value="large">Large</option>
                                    </select>
                                    <p className="setting-description">Text size throughout the application</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Performance Settings */}
                    {activeTab === 'performance' && (
                        <div className="settings-section">
                            <h2>⚡ Performance</h2>
                            <div className="settings-grid">
                                <div className="setting-item">
                                    <label>Graph Quality</label>
                                    <select 
                                        value={settings.graphQuality}
                                        onChange={(e) => handleSettingChange('performance', 'graphQuality', e.target.value)}
                                    >
                                        <option value="low">Low (Fastest)</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High (Best Quality)</option>
                                    </select>
                                    <p className="setting-description">Balance between visual quality and performance</p>
                                </div>

                                <div className="setting-item">
                                    <div className="toggle-setting">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.autoSave}
                                                onChange={(e) => handleSettingChange('performance', 'autoSave', e.target.checked)}
                                            />
                                            Auto-save Simulations
                                        </label>
                                    </div>
                                    <p className="setting-description">Automatically save your work as you go</p>
                                </div>

                                <div className="setting-item">
                                    <label>Cache Size (MB)</label>
                                    <input
                                        type="range"
                                        min="50"
                                        max="500"
                                        value={settings.cacheSize}
                                        onChange={(e) => handleSettingChange('performance', 'cacheSize', parseInt(e.target.value))}
                                    />
                                    <span className="range-value">{settings.cacheSize} MB</span>
                                    <p className="setting-description">Amount of storage for cached computations</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications Settings */}
                    {activeTab === 'notifications' && (
                        <div className="settings-section">
                            <h2>🔔 Notifications</h2>
                            <div className="settings-grid">
                                <div className="setting-item">
                                    <div className="toggle-setting">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.emailNotifications}
                                                onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                                            />
                                            Email Notifications
                                        </label>
                                    </div>
                                    <p className="setting-description">Receive updates and tips via email</p>
                                </div>

                                <div className="setting-item">
                                    <div className="toggle-setting">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.pushNotifications}
                                                onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
                                            />
                                            Push Notifications
                                        </label>
                                    </div>
                                    <p className="setting-description">Browser notifications for important updates</p>
                                </div>

                                <div className="setting-item">
                                    <div className="toggle-setting">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.updateAlerts}
                                                onChange={(e) => handleSettingChange('notifications', 'updateAlerts', e.target.checked)}
                                            />
                                            Update Alerts
                                        </label>
                                    </div>
                                    <p className="setting-description">Get notified about new features and updates</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Privacy & Data Settings */}
                    {activeTab === 'privacy' && (
                        <div className="settings-section">
                            <h2>🔒 Privacy & Data</h2>
                            <div className="settings-grid">
                                <div className="setting-item">
                                    <div className="toggle-setting">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.dataCollection}
                                                onChange={(e) => handleSettingChange('privacy', 'dataCollection', e.target.checked)}
                                            />
                                            Usage Data Collection
                                        </label>
                                    </div>
                                    <p className="setting-description">Help improve the app by sharing anonymous usage data</p>
                                </div>

                                <div className="setting-item">
                                    <div className="toggle-setting">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.analytics}
                                                onChange={(e) => handleSettingChange('privacy', 'analytics', e.target.checked)}
                                            />
                                            Analytics
                                        </label>
                                    </div>
                                    <p className="setting-description">Allow analytics to understand feature usage</p>
                                </div>

                                <div className="setting-item">
                                    <div className="toggle-setting">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.autoUpdate}
                                                onChange={(e) => handleSettingChange('privacy', 'autoUpdate', e.target.checked)}
                                            />
                                            Automatic Updates
                                        </label>
                                    </div>
                                    <p className="setting-description">Automatically install updates when available</p>
                                </div>

                                <div className="setting-item full-width">
                                    <button className="danger-btn">
                                        🗑️ Delete All My Data
                                    </button>
                                    <p className="setting-description warning">
                                        This will permanently delete all your simulations and settings. This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Account Settings */}
                    {activeTab === 'account' && (
                        <div className="settings-section">
                            <h2>👤 Account</h2>
                            <div className="settings-grid">
                                <div className="setting-item">
                                    <label>Username</label>
                                    <input
                                        type="text"
                                        value={settings.username}
                                        onChange={(e) => handleSettingChange('account', 'username', e.target.value)}
                                    />
                                    <p className="setting-description">Your display name</p>
                                </div>

                                <div className="setting-item">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={settings.email}
                                        onChange={(e) => handleSettingChange('account', 'email', e.target.value)}
                                    />
                                    <p className="setting-description">Your email address for notifications</p>
                                </div>

                                <div className="setting-item">
                                    <button className="action-btn">
                                        ✏️ Change Password
                                    </button>
                                    <p className="setting-description">Update your account password</p>
                                </div>

                                <div className="setting-item">
                                    <button className="action-btn">
                                        📧 Email Preferences
                                    </button>
                                    <p className="setting-description">Manage what emails you receive</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* About Settings */}
                    {activeTab === 'about' && (
                        <div className="settings-section">
                            <h2>ℹ️ About</h2>
                            <div className="about-content">
                                <div className="app-info">
                                    <h3>Math Visualization Studio</h3>
                                    <p>Version 1.0.0</p>
                                    <p>Build: 2024.01.15</p>
                                </div>

                                <div className="about-features">
                                    <h4>Features</h4>
                                    <ul>
                                        <li>Interactive 2D/3D Function Plotting</li>
                                        <li>Trigonometric Function Visualization</li>
                                        <li>Statistical Analysis Tools</li>
                                        <li>ODE Solver with Multiple Methods</li>
                                        <li>Custom Mathematical Expressions</li>
                                        <li>Real-time Parameter Controls</li>
                                    </ul>
                                </div>

                                <div className="about-links">
                                    <h4>Links</h4>
                                    <div className="link-buttons">
                                        <button className="link-btn">📖 User Guide</button>
                                        <button className="link-btn">🐛 Report Bug</button>
                                        <button className="link-btn">💡 Feature Request</button>
                                        <button className="link-btn">📄 Privacy Policy</button>
                                        <button className="link-btn">📃 Terms of Service</button>
                                    </div>
                                </div>

                                <div className="about-credits">
                                    <h4>Credits</h4>
                                    <p>Built with React, Plotly.js, and Math.js</p>
                                    <p>Icons by Twemoji</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Save Button */}
                    <div className="settings-actions">
                        <button className="save-btn primary">
                            💾 Save Changes
                        </button>
                        <button className="cancel-btn" onClick={() => navigate('/')}>
                            Cancel
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Settings;
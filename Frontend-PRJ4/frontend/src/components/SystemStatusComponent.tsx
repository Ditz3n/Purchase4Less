import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface SystemStatus {
  backend: {
    status: 'online' | 'offline' | 'degraded';
    latency: number;
    lastChecked: Date;
    uptime: number;
  };
  database: {
    status: 'connected' | 'disconnected' | 'degraded';
    connectionCount: number;
    lastSync: Date;
    uptime: number;
  };
}

const SystemStatusComponent: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    backend: {
      status: 'offline',
      latency: 0,
      lastChecked: new Date(),
      uptime: 0
    },
    database: {
      status: 'disconnected',
      connectionCount: 0,
      lastSync: new Date(),
      uptime: 0
    }
  });

  const checkBackendStatus = async () => {
    try {
      const startTime = performance.now();
      const response = await fetch('http://localhost:5000/api/healthcheck/status');
      const endTime = performance.now();
      const data = await response.json();
      
      setSystemStatus(prev => ({
        ...prev,
        backend: {
          status: response.ok ? 'online' : 'degraded',
          latency: Math.round(endTime - startTime),
          lastChecked: new Date(),
          uptime: data.uptime || prev.backend.uptime
        }
      }));
    } catch (error) {
      setSystemStatus(prev => ({
        ...prev,
        backend: {
          ...prev.backend,
          status: 'offline',
          lastChecked: new Date()
        }
      }));
    }
  };

  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/healthcheck/database');
      const data = await response.json();
      
      setSystemStatus(prev => ({
        ...prev,
        database: {
          status: data.isConnected ? 'connected' : 'disconnected',
          connectionCount: data.connectionCount || 0,
          lastSync: new Date(data.lastSync) || new Date(),
          uptime: data.uptime || prev.database.uptime
        }
      }));
    } catch (error) {
      setSystemStatus(prev => ({
        ...prev,
        database: {
          ...prev.database,
          status: 'disconnected',
          lastSync: new Date()
        }
      }));
    }
  };

  useEffect(() => {
    // Initial check når komponenten monteres
    checkBackendStatus();
    checkDatabaseStatus();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'connected':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('da-DK', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(2)}%`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        System Status
      </h2>
      
      <div className="space-y-4">
        {/* Backend Status */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-300 font-medium">Backend Status</span>
            <div className="flex items-center space-x-2">
              {getStatusIcon(systemStatus.backend.status)}
              <span className={`text-sm ${
                systemStatus.backend.status === 'online' ? 'text-green-500' :
                systemStatus.backend.status === 'degraded' ? 'text-yellow-500' :
                'text-red-500'
              }`}>
                {systemStatus.backend.status.charAt(0).toUpperCase() + systemStatus.backend.status.slice(1)}
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Latency: {systemStatus.backend.latency}ms</p>
            <p>Uptime: {formatUptime(systemStatus.backend.uptime)}</p>
            <p>Sidst tjekket: {formatTime(systemStatus.backend.lastChecked)}</p>
          </div>
          <button
            onClick={checkBackendStatus}
            className="mt-2 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
          >
            Tjek backend
          </button>
        </div>

        {/* Database Status */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-300 font-medium">Database Status</span>
            <div className="flex items-center space-x-2">
              {getStatusIcon(systemStatus.database.status)}
              <span className={`text-sm ${
                systemStatus.database.status === 'connected' ? 'text-green-500' :
                systemStatus.database.status === 'degraded' ? 'text-yellow-500' :
                'text-red-500'
              }`}>
                {systemStatus.database.status.charAt(0).toUpperCase() + systemStatus.database.status.slice(1)}
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Aktive forbindelser: {systemStatus.database.connectionCount}</p>
            <p>Uptime: {formatUptime(systemStatus.database.uptime)}</p>
            <p>Sidst synkroniseret: {formatTime(systemStatus.database.lastSync)}</p>
          </div>
          <button
            onClick={checkDatabaseStatus}
            className="mt-2 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
          >
            Tjek database
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemStatusComponent;

import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Play, Pause, RefreshCw, Settings, Activity } from 'lucide-react';

export default function LiveDataDashboard() {
  const [data, setData] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const [apiUrl, setApiUrl] = useState('https://api.coindesk.com/v1/bpi/currentprice.json');
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [jsonPath, setJsonPath] = useState('bpi.USD.rate_float');
  const [maxDataPoints, setMaxDataPoints] = useState(20);

  // Función para extraer valor del JSON usando path notation
  const getValueFromPath = (obj, path) => {
    if (!path) return obj;
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  // Fetch data from API
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const json = await response.json();

      // Extraer valor usando el path configurado
      const value = getValueFromPath(json, jsonPath);

      const newDataPoint = {
        timestamp: new Date().toLocaleTimeString(),
        value: typeof value === 'number' ? value : parseFloat(value) || 0,
        fullData: json
      };

      setData(prevData => {
        const updated = [...prevData, newDataPoint];
        // Mantener solo los últimos N puntos
        return updated.slice(-maxDataPoints);
      });

      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    }
  }, [apiUrl, jsonPath, maxDataPoints]);

  // Auto-refresh cuando está en modo "live"
  useEffect(() => {
    let intervalId;

    if (isLive) {
      // Fetch inmediato
      fetchData();

      // Configurar intervalo
      intervalId = setInterval(() => {
        fetchData();
      }, refreshInterval);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLive, refreshInterval, fetchData]);

  const toggleLive = () => {
    setIsLive(!isLive);
  };

  const clearData = () => {
    setData([]);
    setError(null);
  };

  // Ejemplos de APIs públicas
  const apiExamples = [
    {
      name: 'Bitcoin Price (CoinDesk)',
      url: 'https://api.coindesk.com/v1/bpi/currentprice.json',
      path: 'bpi.USD.rate_float',
      description: 'Precio actual de Bitcoin en USD'
    },
    {
      name: 'Random User API',
      url: 'https://randomuser.me/api/',
      path: 'results[0].login.uuid',
      description: 'Datos aleatorios de usuarios (extrae UUID)'
    },
    {
      name: 'JSONPlaceholder - Posts',
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      path: 'id',
      description: 'API de prueba - ID del post'
    },
    {
      name: 'Open-Meteo Weather',
      url: 'https://api.open-meteo.com/v1/forecast?latitude=40.4168&longitude=-3.7038&current=temperature_2m',
      path: 'current.temperature_2m',
      description: 'Temperatura actual en Madrid'
    }
  ];

  const loadExample = (example) => {
    setApiUrl(example.url);
    setJsonPath(example.path);
    setIsConfigOpen(false);
    clearData();
  };

  const stats = data.length > 0 ? {
    latest: data[data.length - 1]?.value,
    min: Math.min(...data.map(d => d.value)),
    max: Math.max(...data.map(d => d.value)),
    avg: data.reduce((sum, d) => sum + d.value, 0) / data.length
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">📡 Live Data Dashboard</h1>
              <p className="text-gray-300">Conecta a cualquier API HTTP/JSON y visualiza datos en tiempo real</p>
            </div>
            <div className="flex items-center gap-2">
              <Activity className={`${isLive ? 'text-green-400 animate-pulse' : 'text-gray-400'}`} size={32} />
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
              <span>{isLive ? 'LIVE' : 'PAUSED'}</span>
            </div>
            <div>
              {data.length} puntos de datos
            </div>
            {lastUpdate && (
              <div>
                Última actualización: {lastUpdate.toLocaleTimeString()}
              </div>
            )}
            {error && (
              <div className="text-red-400">
                Error: {error}
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-2xl p-6 mb-6 border border-white/20">
          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={toggleLive}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition ${
                isLive
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isLive ? <Pause size={20} /> : <Play size={20} />}
              {isLive ? 'Pausar' : 'Iniciar'}
            </button>

            <button
              onClick={fetchData}
              disabled={isLive}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={20} />
              Actualizar una vez
            </button>

            <button
              onClick={clearData}
              className="flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-bold transition"
            >
              Limpiar datos
            </button>

            <button
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-bold transition"
            >
              <Settings size={20} />
              Configuración
            </button>

            <div className="flex items-center gap-2 text-white">
              <label className="text-sm">Intervalo:</label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white"
              >
                <option value={1000}>1 segundo</option>
                <option value={2000}>2 segundos</option>
                <option value={5000}>5 segundos</option>
                <option value={10000}>10 segundos</option>
                <option value={30000}>30 segundos</option>
                <option value={60000}>1 minuto</option>
              </select>
            </div>
          </div>

          {/* Configuration Panel */}
          {isConfigOpen && (
            <div className="mt-6 pt-6 border-t border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">⚙️ Configuración del Endpoint</h3>

              <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                  <label className="block text-white font-medium mb-2">URL del API:</label>
                  <input
                    type="text"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="https://api.example.com/data"
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Path del valor (notación punto):</label>
                  <input
                    type="text"
                    value={jsonPath}
                    onChange={(e) => setJsonPath(e.target.value)}
                    placeholder="data.value o response.results[0].price"
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400"
                  />
                  <p className="text-sm text-gray-300 mt-1">
                    Ejemplo: Para extraer el precio de {`{"data": {"price": 123}}`} usa "data.price"
                  </p>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Máximo de puntos a mostrar:</label>
                  <input
                    type="number"
                    value={maxDataPoints}
                    onChange={(e) => setMaxDataPoints(Number(e.target.value))}
                    min="5"
                    max="100"
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-white font-semibold mb-2">📋 Ejemplos de APIs públicas:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {apiExamples.map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => loadExample(example)}
                      className="text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition"
                    >
                      <div className="text-white font-semibold">{example.name}</div>
                      <div className="text-sm text-gray-300">{example.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <div className="text-gray-300 text-sm mb-1">Último valor</div>
              <div className="text-3xl font-bold text-white">{stats.latest.toFixed(2)}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <div className="text-gray-300 text-sm mb-1">Promedio</div>
              <div className="text-3xl font-bold text-blue-400">{stats.avg.toFixed(2)}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <div className="text-gray-300 text-sm mb-1">Mínimo</div>
              <div className="text-3xl font-bold text-green-400">{stats.min.toFixed(2)}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <div className="text-gray-300 text-sm mb-1">Máximo</div>
              <div className="text-3xl font-bold text-red-400">{stats.max.toFixed(2)}</div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">📈 Gráfico de Línea</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="timestamp" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">📊 Gráfico de Barras</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="timestamp" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Table */}
        {data.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg overflow-hidden border border-white/20">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">📋 Datos recientes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-white">Timestamp</th>
                    <th className="px-6 py-3 text-left text-white">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slice(-10).reverse().map((point, idx) => (
                    <tr key={idx} className="border-t border-white/10 hover:bg-white/5">
                      <td className="px-6 py-3 text-gray-300">{point.timestamp}</td>
                      <td className="px-6 py-3 text-white font-bold">{point.value.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
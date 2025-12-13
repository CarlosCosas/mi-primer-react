import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function FunctionVisualizer() {
  const [xMin, setXMin] = useState(0.1);
  const [xMax, setXMax] = useState(5);
  const [showDerivative, setShowDerivative] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const data = useMemo(() => {
    const points = [];
    const step = (xMax - xMin) / 200;

    for (let x = xMin; x <= xMax; x += step) {
      if (x > 0) {
        const fx = x * Math.log(x);
        const derivative = Math.log(x) + 1;

        points.push({
          x: parseFloat(x.toFixed(3)),
          fx: parseFloat(fx.toFixed(3)),
          derivative: parseFloat(derivative.toFixed(3))
        });
      }
    }

    return points;
  }, [xMin, xMax]);

  const zoomIn = () => {
    const center = (xMin + xMax) / 2;
    const range = (xMax - xMin) / 2;
    setXMin(Math.max(0.01, center - range / 2));
    setXMax(center + range / 2);
  };

  const zoomOut = () => {
    const center = (xMin + xMax) / 2;
    const range = (xMax - xMin) * 2;
    setXMin(Math.max(0.01, center - range / 2));
    setXMax(center + range / 2);
  };

  const resetView = () => {
    setXMin(0.1);
    setXMax(5);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border-2 border-gray-300 rounded shadow-lg">
          <p className="font-bold text-gray-800">x = {data.x}</p>
          <p className="text-blue-600">f(x) = {data.fx}</p>
          {showDerivative && (
            <p className="text-green-600">f'(x) = {data.derivative}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-xl p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Visualizador de f(x) = x·ln(x)</h1>
        <p className="text-gray-600 mb-6">Explora la función y su derivada interactivamente</p>

        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            <button
              onClick={zoomIn}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              🔍 Ampliar
            </button>
            <button
              onClick={zoomOut}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
            >
              🔍 Reducir
            </button>
            <button
              onClick={resetView}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            >
              ↺ Reiniciar
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="derivative"
              checked={showDerivative}
              onChange={(e) => setShowDerivative(e.target.checked)}
              className="w-5 h-5 cursor-pointer"
            />
            <label htmlFor="derivative" className="text-gray-700 font-medium cursor-pointer">
              Mostrar derivada f'(x) = ln(x) + 1
            </label>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              X mínimo: {xMin.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.01"
              max="2"
              step="0.01"
              value={xMin}
              onChange={(e) => setXMin(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              X máximo: {xMax.toFixed(2)}
            </label>
            <input
              type="range"
              min="2"
              max="20"
              step="0.1"
              value={xMax}
              onChange={(e) => setXMax(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="x"
                label={{ value: 'x', position: 'insideBottomRight', offset: -5 }}
              />
              <YAxis
                label={{ value: 'f(x)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="fx"
                stroke="#2563eb"
                strokeWidth={2}
                name="f(x) = x·ln(x)"
                dot={false}
              />
              {showDerivative && (
                <Line
                  type="monotone"
                  dataKey="derivative"
                  stroke="#16a34a"
                  strokeWidth={2}
                  name="f'(x) = ln(x) + 1"
                  dot={false}
                  strokeDasharray="5 5"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <h3 className="font-bold text-gray-800 mb-2">Información:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• La función f(x) = x·ln(x) está definida para x {'>'} 0</li>
            <li>• Tiene un mínimo en x = 1/e ≈ 0.368, donde f(1/e) ≈ -0.368</li>
            <li>• Su derivada es f'(x) = ln(x) + 1</li>
            <li>• Pasa el cursor sobre la gráfica para ver valores exactos</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

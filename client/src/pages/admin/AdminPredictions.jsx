import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'
import { fetchCurrentPredictions, fetchNextPredictions, checkHealth } from '@/api/predictionsAPI'
import { Brain, Clock, Activity, Target, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminPredictions() {
  const [current, setCurrent] = useState(null)
  const [next, setNext] = useState(null)
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)

      const h = await checkHealth()
      const c = await fetchCurrentPredictions()
      const n = await fetchNextPredictions()

      setHealth(h)
      setCurrent(c)
      setNext(n)

      setLoading(false)
    }

    load()
  }, [])

  const top3 = (current?.predictions ?? []).slice(0, 3)

  const chartData = (next?.predictions ?? [])
    .slice(0, 7)
    .map(p => ({
      name: p.dish,
      orders: p.predicted_orders
    }))

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-gray-500">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
        <p className="font-medium animate-pulse">Loading ML predictions...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-serif">Demand Predictions</h1>
          <p className="text-gray-500 mt-1 font-sans text-sm">ML-powered forecasts for next slot.</p>
        </div>

        <div className={`flex items-center space-x-2 px-4 py-2 rounded-full shadow-sm border ${health?.mode === 'live' ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
          <div className="relative flex items-center justify-center">
            <span className={`w-2.5 h-2.5 rounded-full ${health?.mode === 'live' ? 'bg-emerald-500' : 'bg-amber-500'} absolute animate-ping opacity-75`}></span>
            <span className={`w-2.5 h-2.5 rounded-full relative z-10 ${health?.mode === 'live' ? 'bg-emerald-600' : 'bg-amber-500'}`}></span>
          </div>
          <span className={`text-sm font-bold uppercase tracking-wider ${health?.mode === 'live' ? 'text-emerald-700' : 'text-amber-700'}`}>
            {health?.mode === 'live' ? 'Live Model' : 'Demo Mode'}
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm shadow-gray-100 hover:shadow-md transition">
          <CardContent className="p-5">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Slot</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{current?.slot ?? '--'}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm shadow-gray-100 hover:shadow-md transition">
          <CardContent className="p-5">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Orders</p>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {current?.predictions?.reduce((s, p) => s + p.predicted_orders, 0) ?? '--'}
            </p>
          </CardContent>
        </Card>

        {/* <Card className="border-none shadow-sm shadow-gray-100 hover:shadow-md transition">
          <CardContent className="p-5">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Next Slot</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{next?.slot ?? '--'}</p>
          </CardContent>
        </Card> */}

        <Card className="border-none shadow-sm shadow-gray-100 hover:shadow-md transition">
          <CardContent className="p-5">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-amber-500" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Next Orders</p>
            </div>
            <p className="text-3xl font-bold text-amber-600">
              {next?.predictions?.reduce((s, p) => s + p.predicted_orders, 0) ?? '--'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top dishes */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2 mb-4">
            <Brain className="w-5 h-5 text-purple-500" />
            <span>Top Forecasts (Current)</span>
          </h3>
          
          {top3.map((p, i) => (
            <Card key={p.dish} className="border-none shadow-sm shadow-purple-100/50 hover:-translate-y-1 transition-transform duration-300 overflow-hidden relative">
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${i === 0 ? 'bg-purple-500' : i === 1 ? 'bg-purple-400' : 'bg-purple-300'}`}></div>
              <CardContent className="p-5 pl-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${i === 0 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                    #{i + 1}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{p.dish}</p>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{p.confidence}% confidence</span>
                      {p.trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
                      {p.trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
                      {p.trend === 'stable' && <Minus className="w-3.5 h-3.5 text-gray-400" />}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-gray-900 tracking-tight">{p.predicted_orders}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Orders</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm shadow-blue-100/50">
          <CardHeader className="pb-2 border-b border-gray-50">
            <CardTitle className="text-lg font-bold text-gray-800 flex items-center space-x-2">
              <BarChart className="w-5 h-5 text-blue-500" />
              <span>Next Slot Demand ({next?.slot})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    angle={-25} 
                    textAnchor="end" 
                    interval={0}
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 600 }}
                    dx={-10}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: '#f8fafc' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100">
                            <p className="font-bold text-gray-900 mb-1">{payload[0].payload.name}</p>
                            <p className="text-blue-600 font-bold flex items-center space-x-1">
                              <span>{payload[0].value}</span>
                              <span className="text-xs text-gray-500 font-medium">predicted orders</span>
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="orders" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => {
                      const maxVal = Math.max(...chartData.map(d => d.orders))
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.orders === maxVal ? "#ef4444" : "#1a6b3a"} 
                        />
                      )
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-sm bg-red-500"></span>
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Highest Demand</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-sm bg-green-700"></span>
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Normal Demand</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

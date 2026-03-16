import React, { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Modal } from '../ui/Modal';
import { ConfirmModal } from '../ui/ConfirmModal';
import {
  CartIcon,
  CurrenciesIcon,
  PackageIcon,
  SettingsIcon,
  XIcon,
  PlusIcon,
  ViewIcon
} from '../ui/icons';
import DashboardService from '../../services/DashboardService';
import { AuthContext } from '../../services/Auth/AuthContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

// Icon mapping
const iconMap = {
  CartIcon: CartIcon,
  CurrenciesIcon: CurrenciesIcon,
  PackageIcon: PackageIcon,
};

// Color mapping
const colorMap = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  indigo: 'bg-indigo-500',
};

// Available widgets configuration
const availableWidgets = [
  { id: 'sales-today', type: 'STAT_CARD', title: 'Ventas de Hoy', dataSource: 'sales-today', icon: 'CartIcon', color: 'blue', description: 'Total de ventas del día actual' },
  { id: 'sales-month', type: 'STAT_CARD', title: 'Ventas del Mes', dataSource: 'sales-month', icon: 'CurrenciesIcon', color: 'green', description: 'Total de ventas del mes actual' },
  { id: 'total-products', type: 'STAT_CARD', title: 'Total Productos', dataSource: 'total-products', icon: 'PackageIcon', color: 'purple', description: 'Cantidad total de productos' },
  { id: 'low-stock', type: 'STAT_CARD', title: 'Stock Bajo', dataSource: 'low-stock', icon: 'PackageIcon', color: 'red', description: 'Productos con stock menor o igual a 10' },
  { id: 'sales-week-daily', type: 'LINE_CHART', title: 'Ventas Últimos 7 Días', dataSource: 'sales-week-daily', description: 'Gráfico de ventas diarias de la última semana' },
  { id: 'top-products', type: 'BAR_CHART', title: 'Top 5 Productos', dataSource: 'top-products', description: 'Los 5 productos más vendidos del último mes' },
];

// Stat Card Widget
const StatCardWidget = ({ widget, data }) => {
  const IconComponent = iconMap[widget.icon] || PackageIcon;
  const colorClass = colorMap[widget.color] || 'bg-gray-500';
  const value = data?.value !== undefined ? data.value : data?.count !== undefined ? data.count : 0;
  const isCurrency = widget.dataSource === 'sales-today' || widget.dataSource === 'sales-month';

  const formatValue = (val) => {
    if (isCurrency) {
      return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(val);
    }
    return new Intl.NumberFormat('es-PY').format(val);
  };

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{widget.title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatValue(value)}
            </p>
          </div>
          <div className={`${colorClass} p-3 rounded-lg`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Line Chart Widget
const LineChartWidget = ({ data }) => {
  const chartData = data?.data || [];

  const formattedData = chartData.map(item => ({
    name: new Date(item.date).toLocaleDateString('es-PY', { weekday: 'short' }),
    sales: Number(item.total) || 0,
    fullDate: new Date(item.date).toLocaleDateString('es-PY'),
  }));

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Ventas Últimos 7 Días</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => new Intl.NumberFormat('es-PY', { notation: 'compact' }).format(value)} />
            <Tooltip
              formatter={(value) => new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(value)}
              labelFormatter={(label, payload) => payload?.[0]?.payload?.fullDate || label}
            />
            <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Bar Chart Widget
const BarChartWidget = ({ data }) => {
  const chartData = data?.data || [];

  const formattedData = chartData.map(item => ({
    name: item.name?.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
    fullName: item.name,
    quantity: Number(item.quantity) || 0,
  }));

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Top 5 Productos</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value) => new Intl.NumberFormat('es-PY').format(value)}
              labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
            />
            <Bar dataKey="quantity" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Widget Renderer
const WidgetRenderer = ({ widget, data }) => {
  switch (widget.type) {
    case 'STAT_CARD':
      return <StatCardWidget widget={widget} data={data} />;
    case 'LINE_CHART':
      return <LineChartWidget data={data} />;
    case 'BAR_CHART':
      return <BarChartWidget data={data} />;
    default:
      return null;
  }
};

// Widget Configuration Modal
const WidgetConfigModal = ({ isOpen, onClose, currentWidgets, onSave, onReset }) => {
  const [selectedWidgets, setSelectedWidgets] = useState(currentWidgets.map(w => w.id));

  useEffect(() => {
    setSelectedWidgets(currentWidgets.map(w => w.id));
  }, [currentWidgets, isOpen]);

  const toggleWidget = (widgetId) => {
    setSelectedWidgets(prev =>
      prev.includes(widgetId)
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  const handleSave = () => {
    const newWidgets = availableWidgets
      .filter(w => selectedWidgets.includes(w.id))
      .map((w, index) => ({
        ...w,
        w: w.type === 'STAT_CARD' ? 1 : 2,
        h: w.type === 'STAT_CARD' ? 1 : 2,
        x: index % 4,
        y: Math.floor(index / 4),
      }));
    onSave(newWidgets);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Configurar Dashboard</h2>
        <p className="text-sm text-gray-600">
          Selecciona los widgets que deseas mostrar en tu dashboard:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {availableWidgets.map(widget => (
            <div
              key={widget.id}
              onClick={() => toggleWidget(widget.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedWidgets.includes(widget.id)
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${colorMap[widget.color] || 'bg-gray-500'}`}>
                  {React.createElement(iconMap[widget.icon] || PackageIcon, { className: 'w-4 h-4 text-white' })}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{widget.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{widget.description}</p>
                </div>
                <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                  selectedWidgets.includes(widget.id)
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'border-gray-300'
                }`}>
                  {selectedWidgets.includes(widget.id) && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between pt-4 border-t">
          <Button variant="secondary" onClick={onReset}>
            Restaurar Default
          </Button>
          <div className="space-x-2">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Guardar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [widgets, setWidgets] = useState([]);
  const [widgetData, setWidgetData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const canConfigure = user?.authorities?.includes('Dashboard.update');

  // Load dashboard configuration and data
  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      // Load config
      const configResponse = await DashboardService.getConfig();
      const config = configResponse.data;

      if (config?.configJson) {
        const parsedConfig = JSON.parse(config.configJson);
        setWidgets(parsedConfig.widgets || []);
      } else {
        // Default widgets
        setWidgets([
          { id: 'widget-1', type: 'STAT_CARD', title: 'Ventas de Hoy', dataSource: 'sales-today', w: 1, h: 1, x: 0, y: 0, icon: 'CartIcon', color: 'blue' },
          { id: 'widget-2', type: 'STAT_CARD', title: 'Ventas del Mes', dataSource: 'sales-month', w: 1, h: 1, x: 1, y: 0, icon: 'CurrenciesIcon', color: 'green' },
          { id: 'widget-3', type: 'STAT_CARD', title: 'Total Productos', dataSource: 'total-products', w: 1, h: 1, x: 2, y: 0, icon: 'PackageIcon', color: 'purple' },
          { id: 'widget-4', type: 'STAT_CARD', title: 'Stock Bajo', dataSource: 'low-stock', w: 1, h: 1, x: 3, y: 0, icon: 'PackageIcon', color: 'red' },
          { id: 'widget-5', type: 'LINE_CHART', title: 'Ventas Últimos 7 Días', dataSource: 'sales-week-daily', w: 2, h: 2, x: 0, y: 1 },
          { id: 'widget-6', type: 'BAR_CHART', title: 'Top 5 Productos', dataSource: 'top-products', w: 2, h: 2, x: 2, y: 1 },
        ]);
      }

      // Load data for all widgets
      await loadWidgetData();
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWidgetData = async () => {
    try {
      const [
        salesToday,
        salesMonth,
        totalProducts,
        lowStock,
        salesWeekDaily,
        topProducts,
      ] = await Promise.all([
        DashboardService.getSalesToday(),
        DashboardService.getSalesMonth(),
        DashboardService.getTotalProducts(),
        DashboardService.getLowStock(),
        DashboardService.getSalesWeekDaily(),
        DashboardService.getTopProducts(),
      ]);

      setWidgetData({
        'sales-today': salesToday.data,
        'sales-month': salesMonth.data,
        'total-products': totalProducts.data,
        'low-stock': lowStock.data,
        'sales-week-daily': salesWeekDaily.data,
        'top-products': topProducts.data,
      });
    } catch (error) {
      console.error('Error loading widget data:', error);
    }
  };

  const handleSaveConfig = async (newWidgets) => {
    try {
      const config = { widgets: newWidgets };
      await DashboardService.saveConfig(JSON.stringify(config));
      setWidgets(newWidgets);
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Error al guardar la configuración');
    }
  };

  const handleResetConfig = async () => {
    try {
      await DashboardService.resetConfig();
      setIsResetConfirmOpen(false);
      loadDashboard();
    } catch (error) {
      console.error('Error resetting config:', error);
      alert('Error al restaurar la configuración');
    }
  };

  // Group widgets by row for grid layout
  const getWidgetGridClass = (widget) => {
    if (widget.w === 2 && widget.h === 2) return 'col-span-1 md:col-span-2 row-span-2';
    if (widget.w === 2) return 'col-span-1 md:col-span-2';
    return 'col-span-1';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Resumen de tu punto de venta
          </p>
        </div>
        {canConfigure && (
          <Button
            variant="secondary"
            onClick={() => setIsConfigOpen(true)}
            className="flex items-center space-x-2"
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Configurar</span>
          </Button>
        )}
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-min">
        {widgets.map((widget) => (
          <div key={widget.id} className={getWidgetGridClass(widget)}>
            <WidgetRenderer
              widget={widget}
              data={widgetData[widget.dataSource]}
            />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {widgets.length === 0 && (
        <div className="text-center py-12">
          <PackageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No hay widgets configurados</h3>
          <p className="text-gray-500 mt-2">
            Haz clic en "Configurar" para agregar widgets a tu dashboard
          </p>
        </div>
      )}

      {/* Configuration Modal */}
      <WidgetConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        currentWidgets={widgets}
        onSave={handleSaveConfig}
        onReset={() => setIsResetConfirmOpen(true)}
      />

      {/* Reset Confirmation */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetConfig}
        title="Restaurar Configuración"
        message="¿Estás seguro de que deseas restaurar la configuración por defecto? Se perderán tus personalizaciones."
      />
    </div>
  );
};

export default Dashboard;

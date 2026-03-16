import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import Modal from '../ui/Modal';
import { ConfirmModal } from '../ui/ConfirmModal';
import {
  CartIcon,
  CurrenciesIcon,
  PackageIcon,
  SettingsIcon,
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

const iconMap = {
  CartIcon,
  CurrenciesIcon,
  PackageIcon,
};

const colorMap = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  indigo: 'bg-indigo-500',
};

const widgetCatalog = [
  {
    id: 'sales-today',
    type: 'STAT_CARD',
    title: 'Ventas de hoy',
    dataSource: 'sales-today',
    icon: 'CartIcon',
    color: 'blue',
    description: 'Total vendido en la fecha actual.',
    allowedSizes: ['compact', 'wide'],
    defaultSize: 'compact',
  },
  {
    id: 'sales-month',
    type: 'STAT_CARD',
    title: 'Ventas del mes',
    dataSource: 'sales-month',
    icon: 'CurrenciesIcon',
    color: 'green',
    description: 'Acumulado de ventas del mes actual.',
    allowedSizes: ['compact', 'wide'],
    defaultSize: 'compact',
  },
  {
    id: 'total-products',
    type: 'STAT_CARD',
    title: 'Productos activos',
    dataSource: 'total-products',
    icon: 'PackageIcon',
    color: 'purple',
    description: 'Cantidad de productos disponibles en catalogo.',
    allowedSizes: ['compact', 'wide'],
    defaultSize: 'compact',
  },
  {
    id: 'low-stock',
    type: 'STAT_CARD',
    title: 'Stock bajo',
    dataSource: 'low-stock',
    icon: 'PackageIcon',
    color: 'red',
    description: 'Productos con stock igual o menor al minimo actual.',
    allowedSizes: ['compact', 'wide'],
    defaultSize: 'compact',
  },
  {
    id: 'sales-week-daily',
    type: 'LINE_CHART',
    title: 'Ventas ultimos 7 dias',
    dataSource: 'sales-week-daily',
    description: 'Evolucion diaria de ventas de la ultima semana.',
    allowedSizes: ['wide', 'full'],
    defaultSize: 'wide',
  },
  {
    id: 'top-products',
    type: 'BAR_CHART',
    title: 'Top 5 productos',
    dataSource: 'top-products',
    description: 'Productos mas vendidos de los ultimos 30 dias.',
    allowedSizes: ['wide', 'full'],
    defaultSize: 'wide',
  },
];

const widgetCatalogById = widgetCatalog.reduce((acc, widget) => {
  acc[widget.id] = widget;
  return acc;
}, {});

const legacyWidgetMap = {
  'widget-1': 'sales-today',
  'widget-2': 'sales-month',
  'widget-3': 'total-products',
  'widget-4': 'low-stock',
  'widget-5': 'sales-week-daily',
  'widget-6': 'top-products',
};

const widgetLoaders = {
  'sales-today': () => DashboardService.getSalesToday(),
  'sales-month': () => DashboardService.getSalesMonth(),
  'total-products': () => DashboardService.getTotalProducts(),
  'low-stock': () => DashboardService.getLowStock(),
  'sales-week-daily': () => DashboardService.getSalesWeekDaily(),
  'top-products': () => DashboardService.getTopProducts(),
};

const sizeLabels = {
  compact: 'Compacto',
  wide: 'Ancho',
  full: 'Completo',
};

const getDefaultPreferences = () =>
  widgetCatalog.map((widget, index) => ({
    id: widget.id,
    visible: true,
    size: widget.defaultSize,
    order: index,
  }));

const buildOrderedPreferences = (items) =>
  items.map((item, index) => ({
    ...item,
    order: index,
  }));

const normalizePreference = (widget, index) => {
  const widgetId = legacyWidgetMap[widget?.id] || widget?.id || widget?.dataSource;
  const catalogWidget = widgetCatalogById[widgetId];

  if (!catalogWidget) {
    return null;
  }

  const requestedSize = widget?.size;
  const legacyWide = widget?.w === 2 || widget?.h === 2;
  const fallbackSize = legacyWide ? 'wide' : catalogWidget.defaultSize;
  const size = catalogWidget.allowedSizes.includes(requestedSize)
    ? requestedSize
    : catalogWidget.allowedSizes.includes(fallbackSize)
      ? fallbackSize
      : catalogWidget.defaultSize;

  return {
    id: catalogWidget.id,
    visible: widget?.visible !== false,
    size,
    order: Number.isInteger(widget?.order) ? widget.order : index,
  };
};

const normalizeConfig = (configJson) => {
  const defaults = getDefaultPreferences();
  const fallback = buildOrderedPreferences(defaults);

  if (!configJson) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(configJson);
    const rawWidgets = Array.isArray(parsed?.widgets) ? parsed.widgets : [];
    const normalizedSaved = rawWidgets
      .map((widget, index) => normalizePreference(widget, index))
      .filter(Boolean);

    const merged = widgetCatalog.map((catalogWidget, index) => {
      const saved = normalizedSaved.find((item) => item.id === catalogWidget.id);
      return saved || defaults[index];
    });

    return buildOrderedPreferences(
      merged.sort((a, b) => a.order - b.order)
    );
  } catch (error) {
    console.error('Error parsing dashboard config:', error);
    return fallback;
  }
};

const buildConfigPayload = (preferences) => JSON.stringify({
  version: 2,
  widgets: preferences.map((widget, index) => ({
    id: widget.id,
    visible: widget.visible,
    size: widget.size,
    order: index,
  })),
});

const getGridClassName = (size) => {
  switch (size) {
    case 'full':
      return 'col-span-1 md:col-span-2 lg:col-span-4';
    case 'wide':
      return 'col-span-1 md:col-span-2';
    default:
      return 'col-span-1';
  }
};

const StatCardWidget = ({ widget, data }) => {
  const IconComponent = iconMap[widget.icon] || PackageIcon;
  const colorClass = colorMap[widget.color] || 'bg-gray-500';
  const value = data?.value !== undefined ? data.value : data?.count !== undefined ? data.count : 0;
  const isCurrency = widget.dataSource === 'sales-today' || widget.dataSource === 'sales-month';

  const formatValue = (currentValue) => {
    if (isCurrency) {
      return new Intl.NumberFormat('es-PY', {
        style: 'currency',
        currency: 'PYG',
        maximumFractionDigits: 0,
      }).format(currentValue);
    }

    return new Intl.NumberFormat('es-PY').format(currentValue);
  };

  return (
    <Card className="h-full border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{widget.title}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{formatValue(value)}</p>
          </div>
          <div className={`${colorClass} rounded-xl p-3`}>
            <IconComponent className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const LineChartWidget = ({ widget, data }) => {
  const chartData = Array.isArray(data?.data) ? data.data : [];
  const formattedData = chartData.map((item) => ({
    name: new Date(item.date).toLocaleDateString('es-PY', { weekday: 'short' }),
    sales: Number(item.total) || 0,
    fullDate: new Date(item.date).toLocaleDateString('es-PY'),
  }));

  return (
    <Card className="h-full border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-slate-900">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={formattedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => new Intl.NumberFormat('es-PY', { notation: 'compact' }).format(value)} />
            <Tooltip
              formatter={(value) => new Intl.NumberFormat('es-PY', {
                style: 'currency',
                currency: 'PYG',
                maximumFractionDigits: 0,
              }).format(value)}
              labelFormatter={(label, payload) => payload?.[0]?.payload?.fullDate || label}
            />
            <Line type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const BarChartWidget = ({ widget, data }) => {
  const chartData = Array.isArray(data?.data) ? data.data : [];
  const formattedData = chartData.map((item) => ({
    name: item.name?.length > 18 ? `${item.name.slice(0, 18)}...` : item.name,
    fullName: item.name,
    quantity: Number(item.quantity) || 0,
  }));

  return (
    <Card className="h-full border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-slate-900">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={formattedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value) => new Intl.NumberFormat('es-PY').format(value)}
              labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
            />
            <Bar dataKey="quantity" fill="#7c3aed" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const WidgetRenderer = ({ widget, data }) => {
  switch (widget.type) {
    case 'STAT_CARD':
      return <StatCardWidget widget={widget} data={data} />;
    case 'LINE_CHART':
      return <LineChartWidget widget={widget} data={data} />;
    case 'BAR_CHART':
      return <BarChartWidget widget={widget} data={data} />;
    default:
      return null;
  }
};

const WidgetConfigModal = ({ isOpen, onClose, preferences, onSave, onReset, saving }) => {
  const [draft, setDraft] = useState(buildOrderedPreferences(preferences));

  useEffect(() => {
    setDraft(buildOrderedPreferences(preferences));
  }, [preferences, isOpen]);

  const orderedDraft = useMemo(
    () => [...draft].sort((a, b) => a.order - b.order),
    [draft]
  );

  const updateDraft = (updater) => {
    setDraft((current) => buildOrderedPreferences(updater([...current].sort((a, b) => a.order - b.order))));
  };

  const toggleVisibility = (widgetId) => {
    updateDraft((current) => current.map((item) => (
      item.id === widgetId ? { ...item, visible: !item.visible } : item
    )));
  };

  const moveWidget = (widgetId, direction) => {
    updateDraft((current) => {
      const index = current.findIndex((item) => item.id === widgetId);
      const targetIndex = index + direction;

      if (index < 0 || targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const changeSize = (widgetId, size) => {
    updateDraft((current) => current.map((item) => (
      item.id === widgetId ? { ...item, size } : item
    )));
  };

  const handleSave = () => {
    onSave(buildOrderedPreferences(orderedDraft));
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal onClose={onClose}>
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Configurar dashboard</h2>
          <p className="mt-1 text-sm text-slate-500">
            Activa widgets, cambia su tamano y define el orden en que queres verlos.
          </p>
        </div>

        <div className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
          {orderedDraft.map((item, index) => {
            const widget = widgetCatalogById[item.id];

            return (
              <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.visible}
                        onChange={() => toggleVisibility(item.id)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <h4 className="font-medium text-slate-900">{widget.title}</h4>
                        <p className="text-xs text-slate-500">{widget.description}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {widget.allowedSizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => changeSize(item.id, size)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                            item.size === size
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {sizeLabels[size]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      disabled={index === 0}
                      onClick={() => moveWidget(item.id, -1)}
                    >
                      Subir
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      disabled={index === orderedDraft.length - 1}
                      onClick={() => moveWidget(item.id, 1)}
                    >
                      Bajar
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between border-t border-slate-200 pt-4">
          <Button type="button" variant="secondary" onClick={onReset}>
            Restaurar default
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [widgetPreferences, setWidgetPreferences] = useState(getDefaultPreferences());
  const [widgetData, setWidgetData] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const canConfigure = user?.authorities?.includes('Dashboard.update');

  const activeWidgets = useMemo(
    () => widgetPreferences
      .filter((widget) => widget.visible)
      .sort((a, b) => a.order - b.order)
      .map((widget) => ({
        ...widgetCatalogById[widget.id],
        size: widget.size,
      })),
    [widgetPreferences]
  );

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const configResponse = await DashboardService.getConfig();
      const nextPreferences = normalizeConfig(configResponse.data?.configJson);
      setWidgetPreferences(nextPreferences);
      await loadWidgetData(nextPreferences);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      const fallbackPreferences = getDefaultPreferences();
      setWidgetPreferences(fallbackPreferences);
      await loadWidgetData(fallbackPreferences);
    } finally {
      setLoading(false);
    }
  };

  const loadWidgetData = async (preferences) => {
    const visibleWidgets = preferences
      .filter((widget) => widget.visible)
      .map((widget) => widgetCatalogById[widget.id])
      .filter(Boolean);

    if (visibleWidgets.length === 0) {
      setWidgetData({});
      return;
    }

    setRefreshing(true);

    try {
      const responses = await Promise.all(
        visibleWidgets.map(async (widget) => {
          const response = await widgetLoaders[widget.id]();
          return [widget.dataSource, response.data];
        })
      );

      setWidgetData(Object.fromEntries(responses));
    } catch (error) {
      console.error('Error loading widget data:', error);
      alert(error?.response?.data || 'Error al cargar los datos del dashboard');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSaveConfig = async (nextPreferences) => {
    try {
      setSavingConfig(true);
      await DashboardService.saveConfig(buildConfigPayload(nextPreferences));
      setWidgetPreferences(nextPreferences);
      await loadWidgetData(nextPreferences);
    } catch (error) {
      console.error('Error saving config:', error);
      alert(error?.response?.data || 'Error al guardar la configuracion');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleResetConfig = async () => {
    try {
      setSavingConfig(true);
      await DashboardService.resetConfig();
      setIsResetConfirmOpen(false);
      await loadDashboard();
    } catch (error) {
      console.error('Error resetting config:', error);
      alert(error?.response?.data || 'Error al restaurar la configuracion');
    } finally {
      setSavingConfig(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold">Tu panel del punto de venta</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-200">
              Cada usuario puede decidir que widgets mostrar y en que orden trabajar.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => loadWidgetData(widgetPreferences)} disabled={refreshing}>
              {refreshing ? 'Actualizando...' : 'Actualizar datos'}
            </Button>
            {canConfigure && (
              <Button
                type="button"
                onClick={() => setIsConfigOpen(true)}
                className="flex items-center gap-2"
              >
                <SettingsIcon className="h-4 w-4" />
                Configurar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Widgets activos</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{activeWidgets.length}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Widgets ocultos</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{widgetPreferences.length - activeWidgets.length}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm md:col-span-2">
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Vista actual</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {activeWidgets.length > 0
                ? activeWidgets.map((widget) => widget.title).join(' | ')
                : 'No hay widgets visibles'}
            </p>
          </CardContent>
        </Card>
      </div> */}

      {activeWidgets.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {activeWidgets.map((widget) => (
            <div key={widget.id} className={getGridClassName(widget.size)}>
              <WidgetRenderer widget={widget} data={widgetData[widget.dataSource]} />
            </div>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-slate-300 shadow-sm">
          <CardContent className="py-14 text-center">
            <PackageIcon className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-medium text-slate-900">No hay widgets visibles</h3>
            <p className="mt-2 text-sm text-slate-500">
              Abri la configuracion para activar los paneles que quieras mostrar.
            </p>
          </CardContent>
        </Card>
      )}

      <WidgetConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        preferences={widgetPreferences}
        onSave={handleSaveConfig}
        onReset={() => setIsResetConfirmOpen(true)}
        saving={savingConfig}
      />

      <ConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetConfig}
        title="Restaurar configuracion"
        message="Se va a volver al dashboard por defecto para este usuario."
      />
    </div>
  );
};

export default Dashboard;

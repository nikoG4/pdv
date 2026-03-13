import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import Select from 'react-select';
import AppConfigService from '../../services/AppConfigService';
import UserService from '../../services/UserService';

const Config = () => {
  const [userOptions, setUserOptions] = useState([]);
  const [printOnServer, setPrintOnServer] = useState(localStorage.getItem('printOnServer') === 'true');
  const [appName, setAppName] = useState(localStorage.getItem('appName') || 'Punto de Venta');
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(localStorage.getItem('logoUrl') || '');
  const [faviconPreview, setFaviconPreview] = useState(localStorage.getItem('faviconUrl') || '');
  const [selectedPosUsers, setSelectedPosUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const parseConfiguredUsers = (value) =>
    (value || '')
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);

  const getFullImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    return url;
  };

  useEffect(() => {
    localStorage.setItem('printOnServer', printOnServer.toString());
  }, [printOnServer]);

  useEffect(() => {
    loadUsers();
    loadConfig();
  }, []);

  useEffect(() => {
    const configuredUsers = parseConfiguredUsers(localStorage.getItem('salesPosDefaultUsers') || '');
    if (userOptions.length === 0) {
      return;
    }

    setSelectedPosUsers(
      userOptions.filter((option) => configuredUsers.includes(option.value))
    );
  }, [userOptions]);

  const loadUsers = async () => {
    try {
      const response = await UserService.getAllUsers({ page: 0, size: 200 });
      const options = (response.content || []).map((user) => ({
        value: user.username,
        label: `${user.username}${user.email ? ` - ${user.email}` : ''}`,
      }));
      setUserOptions(options);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  const loadConfig = async () => {
    try {
      const response = await AppConfigService.getCurrentConfig();
      const config = response.data;
      setAppName(config.appName || 'Punto de Venta');
      setLogoPreview(config.logoUrl || '');
      setFaviconPreview(config.faviconUrl || '');
      const configuredUsers = parseConfiguredUsers(config.posDefaultUsers || '');
      setSelectedPosUsers(
        configuredUsers.map((username) => ({
          value: username,
          label: username,
        }))
      );

      localStorage.setItem('appName', config.appName || 'Punto de Venta');
      localStorage.setItem('logoUrl', config.logoUrl || '');
      localStorage.setItem('faviconUrl', config.faviconUrl || '');
      localStorage.setItem('salesPosDefaultUsers', config.posDefaultUsers || '');

      document.title = config.appName || 'Punto de Venta';
      if (config.faviconUrl) {
        updateFavicon(config.faviconUrl);
      }
      window.dispatchEvent(new Event('app-config-changed'));
    } catch (error) {
      console.error('Error cargando configuracion:', error);
    }
  };

  const updateFavicon = (url) => {
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = getFullImageUrl(url);
  };

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFaviconChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    setFaviconFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFaviconPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('appName', appName || 'Punto de Venta');
      formData.append('posDefaultUsers', selectedPosUsers.map((user) => user.value).join('\n'));

      if (logoFile) {
        formData.append('logo', logoFile);
      }
      if (faviconFile) {
        formData.append('favicon', faviconFile);
      }

      await AppConfigService.saveCurrentConfig(formData);
      await loadConfig();

      setMessage('Configuracion guardada exitosamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`Error al guardar: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Configuracion de la Aplicacion</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(event) => { event.preventDefault(); handleSave(); }}>
            <div className="grid grid-cols-1 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="appName">Nombre de la Aplicacion</Label>
                <Input
                  id="appName"
                  value={appName}
                  onChange={(event) => setAppName(event.target.value)}
                  placeholder="Punto de Venta"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="posDefaultUsers">Usuarios que inician en modo POS</Label>
                <Select
                  inputId="posDefaultUsers"
                  isMulti
                  options={userOptions}
                  value={selectedPosUsers}
                  onChange={(options) => setSelectedPosUsers(options || [])}
                  placeholder="Selecciona uno o varios usuarios"
                  className="text-sm"
                  noOptionsMessage={() => 'No hay usuarios disponibles'}
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: '42px',
                      borderRadius: '0.5rem',
                      borderColor: '#d1d5db',
                      boxShadow: 'none',
                    }),
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Los usuarios seleccionados abriran el modulo Ventas directamente en modo POS.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="logo">Logo</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
                <p className="text-xs text-muted-foreground">Selecciona una imagen para el logo</p>
                {logoPreview && (
                  <div className="mt-2 rounded-lg border bg-gray-50 p-2">
                    <p className="mb-1 text-xs text-gray-500">Vista previa:</p>
                    <img src={getFullImageUrl(logoPreview)} alt="Logo preview" className="h-16 w-16 object-contain" />
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="favicon">Favicon</Label>
                <Input
                  id="favicon"
                  type="file"
                  accept="image/x-icon,image/png,image/svg+xml"
                  onChange={handleFaviconChange}
                />
                <p className="text-xs text-muted-foreground">Selecciona un archivo .ico, .png o .svg</p>
                {faviconPreview && (
                  <div className="mt-2 rounded-lg border bg-gray-50 p-2">
                    <p className="mb-1 text-xs text-gray-500">Vista previa:</p>
                    <img src={getFullImageUrl(faviconPreview)} alt="Favicon preview" className="h-8 w-8 object-contain" />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Configuracion'}
              </Button>
              {message && (
                <span className={`text-sm ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                  {message}
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuracion de Impresion</CardTitle>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <div className="mt-5 flex items-center">
                  <Checkbox
                    id="printOnServer"
                    name="printOnServer"
                    checked={printOnServer}
                    onChange={(event) => setPrintOnServer(event.target.checked)}
                  />
                  <Label htmlFor="printOnServer" className="ml-2">Imprimir en Servidor?</Label>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Config;

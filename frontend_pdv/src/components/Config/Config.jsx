import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import AppConfigService from '../../services/AppConfigService';
import axiosInstance from '../../services/axiosConfig';

const Config = () => {

    const [printOnServer, setPrintOnServer] = useState(localStorage.getItem('printOnServer') === 'true');
    const [appName, setAppName] = useState(localStorage.getItem('appName') || 'Punto de Venta');
    const [logoFile, setLogoFile] = useState(null);
    const [faviconFile, setFaviconFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(localStorage.getItem('logoUrl') || '');
    const [faviconPreview, setFaviconPreview] = useState(localStorage.getItem('faviconUrl') || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Funcion para construir URL completa
    const getFullImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
            return url;
        }
        const baseUrl = axiosInstance.defaults.baseURL || '';
        return `${baseUrl}${url}`;
    };

    useEffect(() => {
        localStorage.setItem('printOnServer', printOnServer.toString());
    }, [printOnServer]);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const response = await AppConfigService.getCurrentConfig();
            const config = response.data;
            setAppName(config.appName || 'Punto de Venta');
            setLogoPreview(config.logoUrl || '');
            setFaviconPreview(config.faviconUrl || '');
            // Guardar en localStorage para uso global
            localStorage.setItem('appName', config.appName || 'Punto de Venta');
            localStorage.setItem('logoUrl', config.logoUrl || '');
            localStorage.setItem('faviconUrl', config.faviconUrl || '');
            // Actualizar título del documento
            document.title = config.appName || 'Punto de Venta';
            // Actualizar favicon si existe
            if (config.faviconUrl) {
                updateFavicon(config.faviconUrl);
            }
        } catch (error) {
            console.error('Error cargando configuración:', error);
        }
    };

    const updateFavicon = (url) => {
        let link = document.querySelector("link[rel*='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = url;
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            // Crear preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFaviconChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFaviconFile(file);
            // Crear preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setFaviconPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage('');
        try {
            const formData = new FormData();
            formData.append('appName', appName || 'Punto de Venta');
            if (logoFile) {
                formData.append('logo', logoFile);
            }
            if (faviconFile) {
                formData.append('favicon', faviconFile);
            }

            await AppConfigService.saveCurrentConfig(formData);

            // Recargar configuración para obtener URLs actualizadas
            await loadConfig();

            setMessage('Configuración guardada exitosamente');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Error al guardar: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

  return (
    <div className="grid gap-4 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Configuración de la Aplicación</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 ">
              <div className="grid gap-2">
                <Label htmlFor="appName">Nombre de la Aplicación</Label>
                <Input
                  id="appName"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="Punto de Venta"
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">

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
                  <div className="mt-2 p-2 border rounded-lg bg-gray-50">
                    <p className="text-xs text-gray-500 mb-1">Vista previa:</p>
                    <img src={logoPreview} alt="Logo preview" className="w-16 h-16 object-contain" />
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
                  <div className="mt-2 p-2 border rounded-lg bg-gray-50">
                    <p className="text-xs text-gray-500 mb-1">Vista previa:</p>
                    <img src={faviconPreview} alt="Favicon preview" className="w-8 h-8 object-contain" />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Configuración'}
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
          <CardTitle>Configuración de Impresión</CardTitle>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <div className="flex items-center mt-5">
                  <Checkbox
                    id="printOnServer"
                    name="printOnServer"
                    checked={printOnServer}
                    onChange={(e) => setPrintOnServer(e.target.checked)}
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

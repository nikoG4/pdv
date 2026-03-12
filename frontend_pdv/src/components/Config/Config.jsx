import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';

const Config = () => {

    const [printOnServer, setPrintOnServer] = useState(localStorage.getItem('printOnServer') === 'true');

    useEffect(() => {
        localStorage.setItem('printOnServer', printOnServer.toString());
    }, [printOnServer]);

  return (
    <div className="grid gap-4 md:gap-8">
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

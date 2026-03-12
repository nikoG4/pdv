import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Datos falsos para el gráfico de ventas
const data = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 2000 },
  { name: 'Apr', sales: 2780 },
  { name: 'May', sales: 1890 },
  { name: 'Jun', sales: 2390 },
  { name: 'Jul', sales: 3490 },
];

const Dashboard = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>

      <Grid container spacing={3}>
        {/* Tarjeta 1: Total de Ventas */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ padding: 3, textAlign: 'center' }}>
            <Typography variant="h5">Total Ventas</Typography>
            <Typography variant="h6" color="primary">$25,000</Typography>
          </Paper>
        </Grid>

        {/* Tarjeta 2: Nuevos Clientes */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ padding: 3, textAlign: 'center' }}>
            <Typography variant="h5">Nuevos Clientes</Typography>
            <Typography variant="h6" color="primary">350</Typography>
          </Paper>
        </Grid>

        {/* Tarjeta 3: Productos en Stock */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ padding: 3, textAlign: 'center' }}>
            <Typography variant="h5">Productos en Stock</Typography>
            <Typography variant="h6" color="primary">1,250</Typography>
          </Paper>
        </Grid>

        {/* Tarjeta 4: Pedidos Pendientes */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ padding: 3, textAlign: 'center' }}>
            <Typography variant="h5">Pedidos Pendientes</Typography>
            <Typography variant="h6" color="primary">12</Typography>
          </Paper>
        </Grid>

        {/* Gráfico de Ventas */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 3 }}>
            <Typography variant="h5" gutterBottom>
              Ventas Mensuales
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

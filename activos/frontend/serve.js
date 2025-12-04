const express = require('express');
const path = require('path');

const app = express();
const PORT = 5173;

// Servir archivos estáticos del build
app.use(express.static(path.join(__dirname, 'dist')));

// Redirigir todas las rutas al index.html (para React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✓ Frontend servido en http://localhost:${PORT}`);
});

# Acceso desde Red Local

## Configuración Completada ✅

El portal ya está configurado para aceptar conexiones desde cualquier computadora en la red local `192.168.x.x`.

## Acceso desde Otra Computadora

### 1. Encuentra la IP de tu Mac

```bash
ipconfig getifaddr en0
# O si usas WiFi: ipconfig getifaddr en1
```

**IP actual detectada:** `192.168.0.149`

### 2. Desde otra computadora en la misma red

Abre tu navegador y ve a:

```
http://192.168.0.149:5174
```

### 3. Credenciales de acceso

- **Email:** admin@portal.com
- **Password:** admin123

## Puertos del Sistema

| Servicio         | Puerto | URL Local             | URL Red                   |
| ---------------- | ------ | --------------------- | ------------------------- |
| Gateway Backend  | 3000   | http://localhost:3000 | http://192.168.0.149:3000 |
| Gateway Frontend | 5174   | http://localhost:5174 | http://192.168.0.149:5174 |
| Activos Backend  | 3001   | http://localhost:3001 | http://192.168.0.149:3001 |
| Activos Frontend | 3101   | http://localhost:3101 | http://192.168.0.149:3101 |

## Cambios Realizados

### Backend (Gateway)

- ✅ CORS configurado para aceptar cualquier IP `192.168.x.x`
- ✅ Backend escuchando en `0.0.0.0` (todas las interfaces)
- ✅ Pattern regex para validar IPs de red local

### Frontend (Gateway)

- ✅ API URL dinámica basada en el hostname del navegador
- ✅ Detecta automáticamente si se accede desde localhost o desde la red

## Firewall (macOS)

Si tienes problemas de conexión, verifica el firewall:

1. **System Settings → Network → Firewall**
2. Asegúrate que Node.js tenga permisos para conexiones entrantes
3. O temporalmente desactiva el firewall para probar

## Verificar Conectividad

Desde otra computadora en la red:

```bash
# Verificar que el puerto está abierto
curl http://192.168.0.149:3000/api/auth/health

# O en Windows PowerShell:
Test-NetConnection -ComputerName 192.168.0.149 -Port 3000
```

## Troubleshooting

### Error de conexión

- Verifica que ambas computadoras estén en la misma red WiFi/Ethernet
- Verifica el firewall de macOS
- Confirma que los servicios estén corriendo: `ps aux | grep vite`

### CORS Error

- Los patterns ya están configurados para `192.168.x.x`
- Si usas otra red (ej: 10.0.x.x), actualiza el pattern en `gateway/backend/src/main.ts`

### API URL incorrecta

- El frontend detecta automáticamente el hostname
- Si falla, puedes setear manualmente: `VITE_API_URL=http://192.168.0.149:3000`

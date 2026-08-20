# Arquitectura técnica V1

La V1 usa una arquitectura liviana: Frontend HTML/CSS/JavaScript Vanilla → Google Apps Script → Google Sheets → Google Drive. No requiere backend tradicional ni base de datos propia.

## Google Sheets
Crear un Spreadsheet con las hojas `VIAJES`, `RESERVAS`, `CONSULTAS` y `CONFIGURACION`. Las columnas esperadas están en `docs/sheets-schema.csv`.

## Google Drive
Organizar los activos en `Sansot Viajes/Viajes/<Destino>` y `Sansot Viajes/General`. Google Sheets almacena URLs o IDs compartibles en `imagen_principal`, `galeria` y `logo`.

## Apps Script
Copiar `apps-script/Code.gs` en el editor de Google Apps Script vinculado al Spreadsheet y desplegarlo como Web App. Reemplazar `REEMPLAZAR_DEPLOYMENT_ID` en `src/js/config.js` o definir `window.SANSOT_API_BASE_URL` antes de cargar la app.

## Administración
`admin/index.html` consume los mismos servicios abstraídos en `src/js/api.js`. La autorización V1 se valida con Google Accounts en Apps Script mediante una lista de emails administradores.

## Pagos
La V1 no procesa pagos desde frontend. Las reservas quedan con `estado_pago = pendiente`, preparadas para una futura integración con Mercado Pago, Stripe u otro proveedor mediante una capa de servicio.

## Migración futura
Cuando aparezcan límites de Apps Script, necesidad de auditoría, roles, reportes o pagos complejos, reemplazar la implementación de `src/js/api.js` por llamadas a un backend con base de datos, almacenamiento de archivos, autenticación, logs y monitoreo.

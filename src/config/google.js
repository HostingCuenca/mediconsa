// src/config/google.js - Configuración de Google Sign-In
// El client_id es público (va en el HTML que ve el usuario). El client_secret NUNCA va aquí.
// Se puede sobreescribir con REACT_APP_GOOGLE_CLIENT_ID en .env (requiere reiniciar `npm start`).
export const GOOGLE_CLIENT_ID =
    process.env.REACT_APP_GOOGLE_CLIENT_ID ||
    '862339884406-1di3vjt38ebgok3s2r7de915ctoh8u7j.apps.googleusercontent.com'

export const GOOGLE_ENABLED = !!GOOGLE_CLIENT_ID

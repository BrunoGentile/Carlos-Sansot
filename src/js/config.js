const runtime = typeof window === 'undefined' ? {} : window;
export const API_BASE_URL = runtime.SANSOT_API_BASE_URL || 'https://script.google.com/macros/s/REEMPLAZAR_DEPLOYMENT_ID/exec';

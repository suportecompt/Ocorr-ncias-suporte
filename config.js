// config.js

const CONFIG = {
    // 1. SUPABASE CONFIGURATION
    supabase: {
        url: 'https://supabase1.myserver.pt',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNjEyMzQ1Njc4LCJleHAiOjI2MTIzNDU2Nzh9.szPPmYS9Pa9WENwHSgsrd7i_YaYLmmORiVqA9jguyGc',
        // URL limpia para la tabla de helpdesk
        tableUrl: 'https://supabase1.myserver.pt/rest/v1/helpdeskrequests'
    },

    // 2. JITSI CONFIGURATION
    jitsi: {
        domain: 'meet.jit.si',
        roomName: 'Oquest_Sala_Teste_01'
    }
};

// Mantenemos las constantes sueltas para no romper tus otros archivos (compatibilidad)
const SUPABASE_URL = CONFIG.supabase.url;
const SUPABASE_ANON_KEY = CONFIG.supabase.anonKey;
const DB_TABLE_URL = CONFIG.supabase.tableUrl;

const JITSI_DOMAIN = CONFIG.jitsi.domain;
const JITSI_ROOM_NAME = CONFIG.jitsi.roomName;
// config.js

const CONFIG = {
    // 1. SUPABASE CONFIGURATION
    supabase: {
        url: 'https://supabase1.myserver.pt',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNjEyMzQ1Njc4LCJleHAiOjI2MTIzNDU2Nzh9.szPPmYS9Pa9WENwHSgsrd7i_YaYLmmORiVqA9jguyGc',
        tableUrl: 'https://supabase1.myserver.pt/rest/v1/helpdeskrequests',
        // ESTO FALTABA: Nombre de la tabla para Jitsi
        jitsiTable: 'jitsi' 
    },

    // 2. JITSI CONFIGURATION
    jitsi: {
        domain: 'meet.jit.si',
        roomName: 'Oquest_Sala_Teste_01',
        
        // ESTO FALTABA: Ajustes por defecto para la llamada
        defaults: {
            displayName: 'convidado',
            startAudioMuted: 0,
            disableDeepLinking: true
        }
    }
};

// --- CONSTANTES DE COMPATIBILIDAD (Para tus otros scripts) ---
const SUPABASE_URL = CONFIG.supabase.url;
const SUPABASE_ANON_KEY = CONFIG.supabase.anonKey;
const DB_TABLE_URL = CONFIG.supabase.tableUrl;

const JITSI_DOMAIN = CONFIG.jitsi.domain;
const JITSI_ROOM_NAME = CONFIG.jitsi.roomName;

// --- CONSTANTES PARA VIDEOCHAMADA (Para check-live.js y jitsi.js) ---
const JITSI_TABLE = CONFIG.supabase.jitsiTable;
const JITSI_USER_NAME = CONFIG.jitsi.defaults.displayName;
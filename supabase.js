// supabase.js

// 1. CONFIGURACIÓN CENTRAL
const SUPABASE_URL = 'https://supabase1.myserver.pt';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNjEyMzQ1Njc4LCJleHAiOjI2MTIzNDU2Nzh9.szPPmYS9Pa9WENwHSgsrd7i_YaYLmmORiVqA9jguyGc';
const DB_TABLE_URL = `${SUPABASE_URL}/rest/v1/helpdeskrequests`;

// 2. INICIALIZAR CLIENTE OFICIAL (Solo lo usaremos para el Storage de archivos)
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 3. CREAR EL "AYUDANTE" GLOBAL PARA APP.JS
window.SupabaseHelper = {

    // Función A: Sube archivos al Storage usando la librería oficial
    subirArchivo: async function(nombreArchivo, blob) {
        console.log(`Subiendo arquivo ${nombreArchivo}...`);
        const { data, error } = await supabaseClient.storage
            .from('ocorrencias_media')
            .upload(nombreArchivo, blob);
        
        if (error) {
            throw new Error(`Erro no Storage ao subir ${nombreArchivo}: ${error.message}`);
        }
        return data;
    },

    // Función B: Guarda texto en la Base de Datos usando AJAX puro (fetch)
    guardarOcurrencia: async function(payload) {
        console.log("Guardando dados na tabela via AJAX...");
        
        const response = await fetch(DB_TABLE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                // AQUÍ ESTABA EL FALLO: Enviamos la key tal cual, sin "Bearer "
                'Authorization': SUPABASE_ANON_KEY, 
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            let errorMsg = `Erro HTTP ${response.status}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorData.hint || errorMsg;
            } catch(e) {
                // Si no puede leer el JSON del error, mantiene el HTTP status
            }
            throw new Error(`Erro na Base de Dados: ${errorMsg}`);
        }
        
        return true;
    }
};
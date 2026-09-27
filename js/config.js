// ================================================================
    // ПОЛНАЯ ЛОГИКА С СИСТЕМОЙ ОПЫТА
    // ================================================================

    const SUPABASE_URL = 'https://eixtvvioqolqeveellvn.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpeHR2dmlvcW9scWV2ZWVsbHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMzAzODksImV4cCI6MjA5NDkwNjM4OX0.MIfQwCRudKNMBirDvIluxxFoFZtYeCpHmxgY-cHHrL4';

    let supabaseClient = null;
    let _playerId = null;
    let _playerName = '';
    let _mbProfileLink = null;
    let _lastActive = new Date().toISOString();


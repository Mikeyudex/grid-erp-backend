import * as moment from "moment";

// Función para obtener la fecha actual en UTC
export const getCurrentUTCDate = (): Date => {
    return moment.utc().subtract(5, 'hours').toDate();
}

/**
 * Normaliza un valor de fecha (string o Date) a mediodía UTC (12:00:00.000Z).
 * Esto evita el problema de que las fechas almacenadas como medianoche UTC
 * se muestren como el día anterior en zonas horarias negativas (ej: UTC-5 Colombia).
 *
 * Para strings tipo "2026-07-01", se parsea como UTC explícitamente.
 * Para objetos Date, se extrae año/mes/día y se reconstruye en UTC.
 */
export const normalizeDateToNoonUTC = (date: string | Date): Date => {
    if (typeof date === 'string') {
        // Parsear string como UTC: "2026-07-01" -> 2026-07-01T12:00:00.000Z
        const parts = date.split('T')[0].split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // month is 0-indexed
        const day = parseInt(parts[2], 10);
        return new Date(Date.UTC(year, month, day, 12, 0, 0, 0));
    }
    // Para objetos Date, extraer UTC components
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0, 0));
}
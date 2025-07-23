import dayjs from 'dayjs';

/**
 * Safe date utilities to prevent dayjs-related errors
 */

/**
 * Safely create a dayjs object from various input types
 */
export const safeDayjs = (input) => {
    try {
        if (!input) return null;
        
        // If it's already a dayjs object, return it
        if (input && typeof input.format === 'function') {
            return input;
        }
        
        // If it's a string or Date object, create dayjs from it
        const result = dayjs(input);
        
        // Check if the result is valid
        if (!result.isValid()) {
            console.warn('Invalid date input:', input);
            return null;
        }
        
        return result;
    } catch (error) {
        console.error('Error creating dayjs object:', error, 'Input:', input);
        return null;
    }
};

/**
 * Safely format a date with fallback
 */
export const safeFormat = (input, format = 'DD/MM/YYYY') => {
    try {
        const date = safeDayjs(input);
        if (!date) return 'N/A';
        
        return date.format(format);
    } catch (error) {
        console.error('Error formatting date:', error, 'Input:', input);
        return 'N/A';
    }
};

/**
 * Safely check if a date is valid
 */
export const isValidDate = (input) => {
    try {
        const date = safeDayjs(input);
        return date && date.isValid();
    } catch (error) {
        console.error('Error validating date:', error, 'Input:', input);
        return false;
    }
};

/**
 * Safely compare dates
 */
export const safeDateCompare = (date1, date2) => {
    try {
        const d1 = safeDayjs(date1);
        const d2 = safeDayjs(date2);
        
        if (!d1 || !d2) return 0;
        
        if (d1.isBefore(d2)) return -1;
        if (d1.isAfter(d2)) return 1;
        return 0;
    } catch (error) {
        console.error('Error comparing dates:', error, 'Inputs:', date1, date2);
        return 0;
    }
};

/**
 * Safely get unix timestamp
 */
export const safeUnix = (input) => {
    try {
        const date = safeDayjs(input);
        return date ? date.unix() : 0;
    } catch (error) {
        console.error('Error getting unix timestamp:', error, 'Input:', input);
        return 0;
    }
};

/**
 * Debug date object to understand its structure
 */
export const debugDate = (input, label = 'Date') => {
    console.log(`=== ${label} Debug ===`);
    console.log('Input:', input);
    console.log('Type:', typeof input);
    console.log('Is Array:', Array.isArray(input));
    console.log('Constructor:', input?.constructor?.name);
    
    if (input && typeof input === 'object') {
        console.log('Keys:', Object.keys(input));
        console.log('Has isValid method:', typeof input.isValid === 'function');
        console.log('Has format method:', typeof input.format === 'function');
    }
    
    try {
        const dayJsObj = dayjs(input);
        console.log('Dayjs conversion successful:', dayJsObj.isValid());
        console.log('Formatted:', dayJsObj.format('YYYY-MM-DD'));
    } catch (error) {
        console.log('Dayjs conversion failed:', error.message);
    }
    
    console.log('==================');
};

/**
 * Wrap dayjs operations with error handling
 */
export const withDateErrorHandling = (operation, fallback = null) => {
    try {
        return operation();
    } catch (error) {
        console.error('Date operation failed:', error);
        return fallback;
    }
};
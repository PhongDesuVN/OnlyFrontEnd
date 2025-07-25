import { useState, useCallback } from 'react';
import { useNotification } from '../Components/NotificationSystem.jsx';

/**
 * Custom hook for handling errors in components
 */
export const useErrorHandler = () => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const notification = useNotification();

    /**
     * Clear current error
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    /**
     * Handle error with optional notification
     */
    const handleError = useCallback((error, context = {}, showNotification = true) => {
        const appError = error; // Assuming error is already transformed
        // logError(appError, context); // logError removed
        setError(appError);

        if (showNotification && notification) {
            notification.showError(appError.message);
        }

        return appError;
    }, [notification]);

    /**
     * Execute async operation with error handling
     */
    const executeWithErrorHandling = useCallback(async (
        operation, 
        options = {}
    ) => {
        const {
            showNotification = true,
            context = {},
            onSuccess,
            onError,
            loadingState = true
        } = options;

        try {
            if (loadingState) setIsLoading(true);
            clearError();

            const result = await operation();

            if (onSuccess) {
                onSuccess(result);
            }

            return result;
        } catch (error) {
            const appError = handleError(error, context, showNotification);
            
            if (onError) {
                onError(appError);
            }

            throw appError;
        } finally {
            if (loadingState) setIsLoading(false);
        }
    }, [handleError, clearError]);

    /**
     * Execute operation with retry mechanism
     */
    const executeWithRetry = useCallback(async (
        operation,
        options = {}
    ) => {
        const {
            maxRetries = 3,
            delay = 1000,
            showNotification = true,
            context = {},
            onSuccess,
            onError
        } = options;

        try {
            setIsLoading(true);
            clearError();

            // Assuming retryOperation is no longer available,
            // this part of the logic needs to be re-evaluated
            // or the retry mechanism needs to be removed.
            // For now, we'll just call the operation directly.
            const result = await operation();

            if (onSuccess) {
                onSuccess(result);
            }

            return result;
        } catch (error) {
            const appError = handleError(error, context, showNotification);
            
            if (onError) {
                onError(appError);
            }

            throw appError;
        } finally {
            setIsLoading(false);
        }
    }, [handleError, clearError]);

    return {
        error,
        isLoading,
        clearError,
        handleError,
        executeWithErrorHandling,
        executeWithRetry
    };
};

/**
 * Hook specifically for schedule-related error handling
 */
export const useScheduleErrorHandler = () => {
    const baseErrorHandler = useErrorHandler();
    const notification = useNotification();

    const handleScheduleError = useCallback((error, context = {}) => {
        const appError = error; // Assuming error is already transformed
        
        // Add schedule-specific context
        const scheduleContext = {
            ...context,
            module: 'schedule',
            timestamp: new Date().toISOString()
        };

        // logError(appError, scheduleContext); // logError removed

        // Show schedule-specific error messages
        let message = appError.message;
        switch (appError.code) {
            case 'SCHEDULE_NOT_FOUND':
                message = `Không tìm thấy lịch làm việc${context.operatorName ? ` cho ${context.operatorName}` : ''}.`;
                break;
            case 'SHIFT_CONFLICT':
                message = 'Ca làm việc bị trung lặp. Vui lòng chọn thời gian khác.';
                break;
            case 'INVALID_DATE_RANGE':
                message = 'Khoảng thời gian không hợp lệ. Vui lòng kiểm tra lại ngày bắt đầu và kết thúc.';
                break;
            case 'SHIFT_ASSIGNMENT_FAILED':
                message = 'Không thể phân công ca làm việc. Vui lòng kiểm tra lại thông tin và thử lại.';
                break;
            case 'TIME_OFF_REQUEST_FAILED':
                message = 'Không thể gửi yêu cầu nghỉ phép. Vui lòng thử lại sau.';
                break;
        }

        if (notification) {
            notification.showError(message, 'Lỗi lịch làm việc');
        }

        return { ...baseErrorHandler, handleScheduleError };
    }, [baseErrorHandler, notification]);

    return {
        ...baseErrorHandler,
        handleScheduleError
    };
};

/**
 * Hook for form validation errors
 */
export const useFormErrorHandler = () => {
    const [fieldErrors, setFieldErrors] = useState({});
    const [formError, setFormError] = useState(null);

    const setFieldError = useCallback((fieldName, error) => {
        setFieldErrors(prev => ({
            ...prev,
            [fieldName]: error
        }));
    }, []);

    const clearFieldError = useCallback((fieldName) => {
        setFieldErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    }, []);

    const clearAllFieldErrors = useCallback(() => {
        setFieldErrors({});
    }, []);

    const setFormErrorHandler = useCallback((error) => {
        const appError = error; // Assuming error is already transformed
        setFormError(appError);
    }, []);

    const clearFormError = useCallback(() => {
        setFormError(null);
    }, []);

    const hasErrors = Object.keys(fieldErrors).length > 0 || formError !== null;

    return {
        fieldErrors,
        formError,
        hasErrors,
        setFieldError,
        clearFieldError,
        clearAllFieldErrors,
        setFormError: setFormErrorHandler,
        clearFormError
    };
};
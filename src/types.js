const types = {
    log: 'info',
    info: 'info',
    error: 'error',
    debug: 'info',
    warn: 'warn'
};

const notificatorTypes = {
    log: 'success',
    info: 'success',
    error: 'error',
    debug: 'warn',
    warn: 'warn'
};

const getType = (type, forNotificator) => {
    if (forNotificator) {
        return notificatorTypes[type];
    }
    return types[type];
};

const CRITICAL = 'critical';

export { getType, CRITICAL };

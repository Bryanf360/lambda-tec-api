export const normalizeSearch = (queryParam: unknown): string => {
    if (typeof queryParam === 'string') {
        return queryParam.trim();
    }

    if (Array.isArray(queryParam) && typeof queryParam[0] === 'string') {
        return queryParam[0].trim();
    }

    return '';
};

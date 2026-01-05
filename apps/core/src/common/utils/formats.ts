export const makeStorageId = (): string => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    return uniqueSuffix;
}
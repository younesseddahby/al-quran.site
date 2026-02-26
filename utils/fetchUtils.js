
/**
 * Fetches a resource with automatic retries.
 * @param {string} url - The URL to fetch.
 * @param {Object} options - Fetch options.
 * @param {number} retries - Number of retries (default 3).
 * @param {number} backoff - Initial backoff delay in ms (default 1000).
 * @returns {Promise<Response>}
 */
export const fetchWithRetry = async (url, options = {}, retries = 3, backoff = 1000) => {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            if (retries > 0 && (response.status >= 500 || response.status === 429)) {
                await new Promise(resolve => setTimeout(resolve, backoff));
                return fetchWithRetry(url, options, retries - 1, backoff * 2);
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
    } catch (error) {
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, backoff));
            return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
        throw error;
    }
};

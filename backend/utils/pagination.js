/**
 * Pagination utility functions for backend API routes
 */

/**
 * Apply pagination to a Mongoose query
 * @param {Object} query - Mongoose query object
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @returns {Object} Modified query with skip and limit applied
 */
const paginate = (query, page = 1, limit = 20) => {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    return {
        query: query.skip(skip).limit(limitNum),
        skip,
        limit: limitNum,
        page: pageNum
    };
};

/**
 * Generate pagination metadata
 * @param {number} total - Total number of items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
const getPaginationMeta = (total, page, limit) => {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const totalPages = Math.ceil(total / limitNum);

    return {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
    };
};

/**
 * Create a paginated response object
 * @param {Array} data - Array of data items
 * @param {Object} paginationMeta - Pagination metadata
 * @returns {Object} Paginated response
 */
const createPaginatedResponse = (data, paginationMeta) => {
    return {
        data,
        pagination: paginationMeta
    };
};

module.exports = {
    paginate,
    getPaginationMeta,
    createPaginatedResponse
};

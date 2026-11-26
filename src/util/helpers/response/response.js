'use strict';

const success = (res, message, responseCode) => {
    res.status(responseCode).json({
        success: true,
        message,
        responseCode
    })
};

const data = (res, data, responseCode) => {
    res.status(responseCode).json({
        success: true,
        data,
        responseCode
    })
};

const token = (res, token, responseCode) => {
    res.status(responseCode).json({
        success: true,
        token,
        responseCode
    })
};

const failure = (res, error, responseCode) => {
    console.log(error);
    res.status(responseCode).json({
        success: false,
        message: error.message ? error.message : error,
        responseCode,
        // errors: (error.errors) ? error.errors.map(err => err.message) : undefined
    })
};

const pages = (res, item, page, total, responseCode, meta = {}) => {
    res.status(responseCode).json({
        success: true,
        data: item,
        responseCode,
        meta: {
            page: parseInt(page),
            count: parseInt(total),
            ...meta
        }
    })
}

const counts = (res, item, total, responseCode, meta = {}) => {
    res.status(responseCode).json({
        success: true,
        data: item,
        responseCode,
        meta: {
            count: parseInt(total),
            ...meta
        }
    })
}

const withNext = (res, item, responseCode, hasNext = false, hasPrev = false) => {
    res.status(responseCode).json({
        success: true,
        data: item,
        responseCode,
        meta: {
            hasNext,
            hasPrev
        }
    })
}

const additionalItemWithpages = (res, item, page, total, additionalItem, responseCode, meta = {}) => {
    res.status(responseCode).json({
        success: true,
        data: item,
        additionalItem,
        responseCode,
        meta: {
            page: parseInt(page),
            count: parseInt(total),
            ...meta
        }
    })
}

module.exports = {
    success,
    data,
    token,
    failure,
    pages,
    withNext,
    counts,
    additionalItemWithpages
};
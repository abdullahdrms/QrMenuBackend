'use strict';

/**
 * global-variable router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::global-variable.global-variable');

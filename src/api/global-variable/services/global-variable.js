'use strict';

/**
 * global-variable service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::global-variable.global-variable');

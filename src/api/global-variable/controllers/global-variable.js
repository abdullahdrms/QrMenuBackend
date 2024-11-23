'use strict';

/**
 * global-variable controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::global-variable.global-variable');

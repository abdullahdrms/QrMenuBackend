'use strict';

/**
 * product controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const utils = require('@strapi/utils');
const { ApplicationError, ValidationError, ForbiddenError } = utils.errors;

module.exports = createCoreController('api::product.product', ({ strapi }) => ({
    async create(ctx) {
        const body = ctx?.request?.body;
        const user = ctx.state.user
        const params = ctx?.request?.query

        if (body?.data?.slug) {
            throw new ValidationError(`Invalid key slug`);
        }

        if (!(body?.data?.category)) {
            throw new ValidationError(`Category is required`);
        }

        const category = await strapi.documents("api::category.category").findOne({
            documentId: body?.data?.category,
            populate: ['company.users_permissions_users', 'company.localizations', 'localizations']
        });

        if (category?.company?.users_permissions_users[0]?.documentId !== user?.documentId) {
            throw new ForbiddenError("You do not have permission")
        }

        const slug = await strapi.plugin("content-manager").service("uid").generateUIDField({
            contentTypeUID: "api::product.product",
            field: "slug",
            data: body?.data
        });


        ctx.request.body.data = {
            ...ctx.request.body.data,
            slug: slug
        }

        if (params?.multi === 'true') {
            // burada tek dil olan company ile test yapılacak.
            const languages = [...category.company.localizations.map((item) => item.locale)]

            const newDoc = await strapi.documents("api::product.product").create({
                data: {
                    ...body.data,
                    locale: category.company.locale,
                },
                status: 'published',
            })

            let newContents = []

            if (body?.data?.contents || body?.data?.contents.length !== 0) {
                body?.data?.contents.map((itm) => {
                    newContents.push({ name: `${itm.name} Lütfen Düzenleyin`, line: itm.line })
                })
            }

            languages.map(async (item) => {
                await strapi.documents("api::product.product").update({
                    documentId: newDoc?.documentId,
                    locale: item,
                    data: {
                        name: `${body.data.name} Lütfen Düzenleyin`,
                        shortDescription: `${body?.data?.shortDescription} ${body?.data?.shortDescription && 'Lütfen Düzenleyin'}`,
                        image: body?.data?.image,
                        slug: body?.data?.slug,
                        price: body?.data?.price,
                        category: body?.data?.category,
                        longDescription: `${body?.data?.longDescription} ${body?.data?.longDescription && 'Lütfen Düzenleyin'}`,
                        contents: newContents
                    },
                    status: 'published',
                });
            })
            return newDoc
        } else {
            const response = await super.create(ctx);
            return response;
        }
    },

    async update(ctx) {
        const body = ctx?.request?.body;
        const user = ctx.state.user

        if (body?.data?.slug) {
            throw new ValidationError(`Invalid key slug`);
        }

        if (body?.data?.category) {
            const category = await strapi.documents("api::category.category").findOne({
                documentId: body?.data?.category,
                populate: 'company.users_permissions_users'
            });

            if (category?.company?.users_permissions_users[0]?.documentId !== user?.documentId) {
                throw new ForbiddenError("You do not have permission")
            }
        }

        const response = await super.update(ctx);
        return response;
    },

    async delete(ctx) {
        const user = ctx.state.user
        const { id } = ctx?.params

        const data = await strapi.documents("api::product.product").findOne({
            documentId: id,
            populate: ['category.company.users_permissions_users', 'localizations']
        });

        if (data?.category?.company?.users_permissions_users[0]?.documentId !== user?.documentId) {
            throw new ForbiddenError("You do not have permission")
        }

        const languages = [data.locale, ...data.localizations.map((item) => item.locale)]

        languages.map(async (item) => {
            await strapi.documents('api::product.product').delete({
                documentId: data.documentId,
                locale: item
            })
        })

        return 'ok'
    },

    async find(ctx) {
        const user = ctx.state.user
        const params = ctx?.request?.query

        if (user?.role?.id !== 1) {
            if (!(params.category)) {
                throw new ApplicationError('Category required');
            }
            if (!(params.company)) {
                throw new ApplicationError('Company required');
            }

            ctx.query = {
                ...ctx.query,
                filters: {
                    ...ctx.query.filters,
                    category: {
                        slug: {
                            $eq: params?.category
                        },
                        company: {
                            slug: params?.company
                        }
                    }
                }
            }
        } else {
            const company = await strapi.documents("api::company.company").findMany({
                fields: ["id", "name"],
                status: 'published',
                filters: {
                    users_permissions_users: {
                        documentId: {
                            $eq: user?.documentId
                        }
                    }
                }
            });

            ctx.query = {
                ...ctx.query,
                filters: {
                    ...ctx.query.filters,
                    category: {
                        company: {
                            documentId: {
                                $eq: company[0]?.documentId
                            }
                        }

                    }
                }
            }
        }

        const response = await super.find(ctx);
        return response;
    },

    async findOne(ctx) {
        const user = ctx.state.user
        const params = ctx?.request?.query


        if (user?.role?.id === 1) {
            const response = await super.findOne(ctx);
            return response;
        } else {
            if (!(params.company)) {
                throw new ApplicationError('Company required');
            }

            ctx.query = {
                ...ctx.query,
                filters: {
                    ...ctx.query.filters,
                    category: {
                        company: {
                            slug: params?.company
                        }
                    }
                }
            }

            const response = await super.findOne(ctx);
            return response;
        }
    }
}));
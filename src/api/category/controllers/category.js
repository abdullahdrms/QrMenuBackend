'use strict';

/**
 * category controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const utils = require('@strapi/utils');
const { ApplicationError, ValidationError, ForbiddenError } = utils.errors;

module.exports = createCoreController('api::category.category', ({ strapi }) => ({

    async create(ctx) {
        const body = ctx?.request?.body;
        const user = ctx.state.user
        const params = ctx?.request?.query

        if (body?.data?.company || body?.data?.product || body?.data?.slug) {
            throw new ValidationError(`Invalid key ${body?.data?.company ? 'company' : ''} ${body?.data?.product ? 'product' : ''} ${body?.data?.slug ? 'slug' : ''}`);
        }

        const company = await strapi.documents("api::company.company").findMany({
            fields: ["id", "name", "locale"],
            populate: ["localizations"],
            status: 'published',
            filters: {
                users_permissions_users: {
                    documentId: {
                        $eq: user?.documentId
                    }
                }
            }
        });

        if (company.length === 0) {
            throw new ForbiddenError("You do not have permission")
        }

        const slug = await strapi.plugin("content-manager").service("uid").generateUIDField({
            contentTypeUID: "api::category.category",
            field: "slug",
            data: body?.data
        });

        ctx.request.body.data = {
            ...ctx.request.body.data,
            company: company[0].documentId,
            slug: slug
        }

        if (params?.multi === 'true') {
            // burada tek dil olan company ile test yapılacak.
            const languages = [...company[0].localizations.map((item) => item.locale)]

            const newDoc = await strapi.documents("api::category.category").create({
                data: {
                    ...body.data,
                    locale: company[0].locale,
                },
                status: 'published',
            })

            languages.map(async (item) => {
                await strapi.documents("api::category.category").update({
                    documentId: newDoc?.documentId,
                    locale: item,
                    data: {
                        name: `${body.data.name} Lütfen Düzenleyin`,
                        shortDescription: `${body?.data?.shortDescription} ${body?.data?.shortDescription && 'Lütfen Düzenleyin'}`,
                        image: body?.data?.image,
                        slug: body?.data?.slug,
                        company: body?.data?.company,
                        longDescription: `${body?.data?.longDescription} ${body?.data?.longDescription && 'Lütfen Düzenleyin'}`,
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
        const { id } = ctx?.params

        if (body?.data?.company || body?.data?.products || body?.data?.slug) {
            throw new ValidationError(`Invalid key ${body?.data?.company ? 'company' : ''} ${body?.data?.products ? 'products' : ''} ${body?.data?.slug ? 'slug' : ''}`);
        }

        const data = await strapi.documents("api::category.category").findOne({
            documentId: id,
            populate: 'company'
        });

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

        if (data?.company?.documentId !== company[0]?.documentId) {
            throw new ForbiddenError("You do not have permission")
        }

        const response = await super.update(ctx);
        return response;
    },

    async delete(ctx) {
        const user = ctx.state.user
        const { id } = ctx?.params

        const data = await strapi.documents("api::category.category").findOne({
            documentId: id,
            populate: ['localizations', 'company']
        });

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

        if (data?.company?.documentId !== company[0]?.documentId) {
            throw new ForbiddenError("You do not have permission")
        }

        const languages = [data.locale, ...data.localizations.map((item) => item.locale)]

        languages.map(async (item) => {
            await strapi.documents('api::category.category').delete({
                documentId: data.documentId,
                locale: item
            })
        })

        return 'ok'

        // const response = await super.delete(ctx);
        // return response;
    },

    async find(ctx) {
        const user = ctx.state.user
        const params = ctx?.request?.query

        if (user?.role?.id === 1) {
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
                    company: {
                        documentId: {
                            $eq: company[0]?.documentId
                        }
                    }
                }
            }
        } else {
            ctx.query = {
                ...ctx.query,
                filters: {
                    ...ctx.query.filters,
                    company: {
                        slug: {
                            $eq: params?.company
                        }
                    },
                    products: {
                        $notNull: true
                    }
                }
            }
        }

        if (!(params.company) && user?.role?.id !== 1) {
            throw new ApplicationError('Company required');
        }


        const response = await super.find(ctx);
        return response;
    }
}));
import authRoute from './authRoute'
import type { Routes } from '@/@types/routes'

export const protectedRoutes: Routes = {
    '/home': {
        key: 'home',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/services': {
        key: 'projects.services',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/roles-users': {
        key: 'admin.rolesUsers',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/collaborators': {
        key: 'p&c.contributors',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/certifications': {
        key: 'p&c.matrix',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/backoffice?section=certifications': {
        key: 'backOffice.certifications',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/backoffice?section=roles': {
        key: 'backOffice.roles',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/backoffice?section=clients': {
        key: 'backOffice.clients',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/backoffice?section=holidays': {
        key: 'backOffice.holidays',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/backoffice?section=chores': {
        key: 'backOffice.chores',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/backoffice?section=divisions': {
        key: 'backOffice.divisions',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/analytics/projects-panel': {
        key: 'resume.projects',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/analytics/hh-reports': {
        key: 'resume.reports',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
}

export const publicRoutes: Routes = {}

export const authRoutes = authRoute

/**
 * Bases de datos (Generación de leads)
 * Separar candidatos y clientes
 * Generación de leads
 *
 */

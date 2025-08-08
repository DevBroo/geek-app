import { Notification } from "../../models/notifications.model.js"

const notificationsResource = {
    resource: Notification,
                options: {
                    properties: {
                        title: { type: 'string' },
                        message: { type: 'text' },
                        createdAt: { isVisible: true },
                    },
                    listProperties: ['title', 'createdAt', 'type', 'isRead'],
                    showProperties: ['title', 'message', 'createdAt', 'type', 'isRead'],
                    editProperties: ['title', 'message'],
                    filterProperties: ['title', 'isRead', 'type', 'createdAt'],
                }
}

export { notificationsResource }
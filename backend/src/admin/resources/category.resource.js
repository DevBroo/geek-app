import { Category } from '../../models/category.model.js';

const categoryResource = {
    resource: Category,
                options: {
                    properties: {
                        categoryDescription: { type: 'textarea' },
                        categoryImage: {
                            // Similar to product images, handling image uploads might need custom logic
                            // or relying on AdminJS's default file upload features if configured.
                        },
                        attributes: {
                            // For nested arrays, AdminJS provides a default editor.
                            // For complex attribute management, you might want to consider custom components.
                        }
                    },
                    listProperties: ['_id', 'categoryName', 'parentCategory', 'categoryStatus', 'createdAt'],
                    showProperties: ['_id', 'categoryName', 'parentCategory', 'categoryDescription', 'categoryImage', 'categoryStatus', 'attributes', 'createdAt', 'updatedAt'],
                    editProperties: ['categoryName', 'parentCategory', 'categoryDescription', 'categoryImage', 'categoryStatus', 'attributes'],
                    filterProperties: ['categoryName', 'parentCategory', 'categoryStatus', 'createdAt'],
                }
}

export { categoryResource }
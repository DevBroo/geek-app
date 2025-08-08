import {ReviewsAndRatings} from '../../models/reviewsAndRatings.model.js';

const reviewsAndRatingsResource = {
     resource: ReviewsAndRatings,
                options: {
                    properties: {
                        rating: { type: 'number', min: 1, max: 5 },
                        review: { type: 'text' },
                        createdAt: { isVisible: true },
                        productId: { isVisible: true }, // Link to Product if Product resource is registered
                        userId: { isVisible: true }, // Link to User if User resource is registered
                    },
                    listProperties: ['rating'],
                    showProperties: ['rating', 'review', 'createdAt', 'userId', 'productId', 'numReviews'],
                    editProperties: ['rating', 'review', ],
                    filterProperties: ['rating'],
                }
}

export {reviewsAndRatingsResource}
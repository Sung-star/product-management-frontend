import api from './api';

export const reviewAdminAPI = {

  getAllReviews: () =>
    api.get('/reviews/admin'),

  approveReview: (id) =>
    api.patch(`/reviews/admin/${id}/verify`),

  deleteReview: (id) =>
    api.delete(`/reviews/admin/${id}`)
};



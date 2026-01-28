import api from './api';

export const reviewAPI = {

  createReview: (data) => {
    const user = JSON.parse(localStorage.getItem('user_auth'));

    return api.post('/reviews', {
      ...data,
      userId: user.id
    });
  },

  getReviewsByProduct: (productId) =>
    api.get(`/reviews/product/${productId}`),

  getAverageRating: (productId) =>
    api.get(`/reviews/product/${productId}/rating`)
};

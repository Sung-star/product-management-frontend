// utils/imageHelper.js

const BASE_URL = 'http://localhost:8080';

/**
 * Lấy ảnh chính của sản phẩm
 * @param {Object} product - Product object hoặc object có imageUrls
 * @param {string} fallback - URL fallback nếu không có ảnh
 * @returns {string} URL ảnh
 */
export const getProductMainImage = (product, fallback = null) => {
  const defaultFallback = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400';
  
  if (!product) {
    return fallback || defaultFallback;
  }

  // Nếu có imageUrls
  if (product.imageUrls) {
    let images = [];
    
    // Xử lý nếu là array
    if (Array.isArray(product.imageUrls)) {
      images = product.imageUrls;
    } 
    // Xử lý nếu là string (comma separated)
    else if (typeof product.imageUrls === 'string' && product.imageUrls.trim()) {
      images = product.imageUrls.split(',').map(url => url.trim()).filter(Boolean);
    }

    if (images.length > 0) {
      const firstImage = images[0];
      // Nếu đã có full URL
      if (firstImage.startsWith('http')) {
        return firstImage;
      }
      // Thêm BASE_URL nếu là relative path
      return `${BASE_URL}${firstImage.startsWith('/') ? '' : '/'}${firstImage}`;
    }
  }

  return fallback || defaultFallback;
};

/**
 * Lấy tất cả ảnh của sản phẩm với fallback
 * @param {Object} product - Product object
 * @returns {string[]} Mảng URLs ảnh
 */
export const getProductImagesWithFallback = (product) => {
  const defaultFallback = ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'];
  
  if (!product || !product.imageUrls) {
    return defaultFallback;
  }

  let images = [];

  // Xử lý nếu là array
  if (Array.isArray(product.imageUrls)) {
    images = product.imageUrls;
  } 
  // Xử lý nếu là string
  else if (typeof product.imageUrls === 'string' && product.imageUrls.trim()) {
    images = product.imageUrls.split(',').map(url => url.trim()).filter(Boolean);
  }

  if (images.length === 0) {
    return defaultFallback;
  }

  // Thêm BASE_URL cho relative paths
  return images.map(url => {
    if (url.startsWith('http')) {
      return url;
    }
    return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  });
};

/**
 * Lấy ảnh từ OrderItem - dùng cho trang đơn hàng
 * @param {Object} item - OrderItem object từ API
 * @returns {string} URL ảnh
 */
export const getOrderItemImage = (item) => {
  const defaultFallback = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=60';

  if (!item) {
    return defaultFallback;
  }

  // ✅ Ưu tiên 1: productImage từ OrderItemDto (backend đã xử lý)
  if (item.productImage) {
    const img = item.productImage.trim();
    if (img.startsWith('http')) {
      return img;
    }
    return `${BASE_URL}${img.startsWith('/') ? '' : '/'}${img}`;
  }

  // ✅ Ưu tiên 2: product object (nếu backend trả về)
  if (item.product) {
    return getProductMainImage(item.product, defaultFallback);
  }

  // ✅ Ưu tiên 3: imageUrls trực tiếp trong item
  if (item.imageUrls) {
    return getProductMainImage({ imageUrls: item.imageUrls }, defaultFallback);
  }

  return defaultFallback;
};

export default {
  getProductMainImage,
  getProductImagesWithFallback,
  getOrderItemImage
};
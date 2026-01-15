// src/utils/imageHelper.js

/**
 * Parse imageUrls từ product object thành mảng URLs đầy đủ
 * @param {Object} product - Product object
 * @returns {Array} - Mảng các URL ảnh đầy đủ
 */
export const getProductImageUrls = (product) => {
  if (!product) return [];
  
  // Nếu imageUrls là array
  if (Array.isArray(product.imageUrls)) {
    return product.imageUrls.map(url => 
      url.startsWith('http') ? url : `http://localhost:8080${url}`
    );
  }
  
  // Nếu imageUrls là string
  if (typeof product.imageUrls === 'string' && product.imageUrls.trim()) {
    return product.imageUrls
      .split(',')
      .map(url => url.trim())
      .filter(url => url.length > 0)
      .map(url => url.startsWith('http') ? url : `http://localhost:8080${url}`);
  }
  
  // Fallback - không có ảnh
  return [];
};

/**
 * Lấy ảnh đầu tiên của product
 * @param {Object} product - Product object
 * @param {String} fallbackUrl - URL ảnh mặc định
 * @returns {String} - URL ảnh
 */
export const getProductMainImage = (product, fallbackUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400') => {
  const images = getProductImageUrls(product);
  return images.length > 0 ? images[0] : fallbackUrl;
};

/**
 * Lấy fallback images dựa trên tên sản phẩm
 * @param {String} productName - Tên sản phẩm
 * @returns {Array} - Mảng URL ảnh fallback
 */
export const getFallbackImages = (productName) => {
  const name = productName?.toLowerCase() || '';
  
  const imageLibrary = {
    laptop: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
      'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800'
    ],
    phone: [
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
      'https://images.unsplash.com/photo-1592286927505-c7278dd0bbb7?w=800'
    ],
    headphone: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
      'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800'
    ],
    default: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800',
      'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800'
    ]
  };

  if (name.includes('laptop') || name.includes('macbook')) return imageLibrary.laptop;
  if (name.includes('phone') || name.includes('iphone') || name.includes('samsung')) return imageLibrary.phone;
  if (name.includes('headphone') || name.includes('tai nghe') || name.includes('airpod')) return imageLibrary.headphone;
  
  return imageLibrary.default;
};

/**
 * Lấy images với fallback
 * @param {Object} product - Product object
 * @returns {Array} - Mảng URL ảnh (có thể là thật hoặc fallback)
 */
export const getProductImagesWithFallback = (product) => {
  const images = getProductImageUrls(product);
  
  if (images.length > 0) {
    return images;
  }
  
  // Nếu không có ảnh thật, dùng fallback dựa trên tên sản phẩm
  return getFallbackImages(product?.name);
};
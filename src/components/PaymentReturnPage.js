import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderAPI } from '../services/api';
import '../styles/CheckoutPage.css';

const PaymentReturnPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState('');

    useEffect(() => {
        const processPayment = async () => {
            // Lấy toàn bộ params từ URL
            const params = Object.fromEntries([...searchParams]);

            if (!params.vnp_SecureHash) {
                setStatus('fail');
                setError('Dữ liệu trả về không hợp lệ');
                return;
            }

            try {
                console.log('🔄 Đang gửi yêu cầu xác thực tới Backend...');
                
                // GỌI API BACKEND ĐỂ XÁC THỰC VÀ UPDATE STATUS (AN TOÀN HƠN)
                await orderAPI.verifyVnpayPayment(params);

                console.log('✅ Xác thực thành công!');
                clearCart();
                setStatus('success');

            } catch (err) {
                console.error('❌ Lỗi xác thực thanh toán:', err);
                const serverMsg = err.response?.data?.message || err.response?.data;
                
                // Trường hợp VNPAY trả về lỗi (ví dụ hủy giao dịch)
                if (params.vnp_ResponseCode !== '00') {
                    setError('Giao dịch bị hủy hoặc thất bại tại cổng thanh toán.');
                } else {
                    setError(serverMsg || 'Lỗi xác thực chữ ký bảo mật từ hệ thống.');
                }
                setStatus('fail');
            }
        };

        // Chỉ chạy 1 lần khi component mount
        if (searchParams.get('vnp_ResponseCode')) {
             processPayment();
        }
    }, [searchParams, clearCart]);

    return (
        <div className="checkout-page" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <div className="success-container" style={{ maxWidth: '600px', width: '100%', padding: '40px' }}>
                
                {status === 'loading' && (
                    <div style={{ textAlign: 'center' }}>
                        <div className="spinner-loading" style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
                        <h2>Đang xác thực giao dịch...</h2>
                        <p>Vui lòng không tắt trình duyệt.</p>
                    </div>
                )}

                {status === 'success' && (
                    <>
                        <div style={{ fontSize: '80px', textAlign: 'center', marginBottom: '20px', color: '#22c55e' }}>✓</div>
                        <h1 style={{ textAlign: 'center', color: '#22c55e', marginBottom: '10px' }}>Thanh toán thành công!</h1>
                        <p style={{ textAlign: 'center', fontSize: '16px', color: '#666', marginBottom: '30px' }}>
                            Đơn hàng <b>#{searchParams.get('vnp_TxnRef')}</b> đã được thanh toán.
                        </p>
                        <div className="success-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button onClick={() => navigate('/orders')} className="btn-view-orders">Xem đơn hàng</button>
                            <button onClick={() => navigate('/')} className="btn-continue-shopping-success">Về trang chủ</button>
                        </div>
                    </>
                )}

                {status === 'fail' && (
                    <>
                        <div style={{ fontSize: '80px', textAlign: 'center', marginBottom: '20px', color: '#ef4444' }}>✕</div>
                        <h1 style={{ textAlign: 'center', color: '#ef4444', marginBottom: '10px' }}>Thanh toán thất bại</h1>
                        <p style={{ textAlign: 'center', fontSize: '16px', color: '#666', marginBottom: '10px' }}>
                            {error}
                        </p>
                        <div className="success-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button onClick={() => navigate('/checkout')} style={{ padding: '12px 24px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                Thử thanh toán lại
                            </button>
                            <button onClick={() => navigate('/')} style={{ padding: '12px 24px', background: 'white', color: '#666', border: '2px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}>
                                Về trang chủ
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
export default PaymentReturnPage;
import React, { useState, useRef, useEffect } from 'react';
import { productAPI } from '../services/api'; 
import '../styles/ChatBot.css';

// --- Icons SVG (Nhúng trực tiếp để không cần cài thêm thư viện) ---
const Icons = {
  Chat: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
  Close: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Send: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>,
  Trash: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Bot: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>,
  User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
};

const ChatBotAdvanced = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Xin chào! Tôi là AI Assistant. Tôi có thể giúp bạn tìm sản phẩm và tư vấn đặt hàng ngay bây giờ.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const messagesEndRef = useRef(null);

  const quickReplies = [
    "🔥 Sản phẩm bán chạy",
    "🎁 Khuyến mãi hôm nay",
    "📱 Tư vấn mua hàng",
    "🛡️ Chính sách đổi trả"
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productAPI.getAllProducts();
      setProducts(response.data);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const buildProductContext = () => {
    if (products.length === 0) return '';
    const productList = products
      .slice(0, 20) 
      .map(p => `- ${p.name} (${p.price?.toLocaleString('vi-VN')}đ) - ${p.categoryName || 'Khác'} - Còn ${p.quantity} sản phẩm`)
      .join('\n');
    return `THÔNG TIN SẢN PHẨM HIỆN CÓ:\n${productList}\nHãy dựa vào danh sách này để tư vấn cho khách hàng.`;
  };

  const sendMessage = async (messageText = null) => {
    const userMessage = messageText || input.trim();
    if (!userMessage) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const productContext = buildProductContext();
      const fullSystemPrompt = `Bạn là trợ lý mua sắm thông minh cho website bán hàng.\n\n${productContext}\n\nNHIỆM VỤ:\n- Tư vấn sản phẩm phù hợp từ danh sách trên\n- Trả lời ngắn gọn, thân thiện bằng tiếng Việt\n- Đưa ra gợi ý cụ thể về sản phẩm, giá cả\n- Nếu không có sản phẩm phù hợp, gợi ý sản phẩm tương tự\n\nCÂU HỎI CỦA KHÁCH: ${userMessage}`;

      // URL n8n của bạn
      const response = await fetch('http://localhost:5678/webhook/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullSystemPrompt })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.reply || 'Hệ thống đang bận, vui lòng thử lại sau.';
        setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
      } else {
        if (data && data.reply) {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: data.reply,
            products: extractProducts(data.reply)
          }]);
        }
      }

    } catch (error) {
      console.error('Chat API Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Mất kết nối đến máy chủ AI. Vui lòng kiểm tra lại.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const extractProducts = (text) => {
    if (!text) return [];
    return products
      .filter(p => text.toLowerCase().includes(p.name.toLowerCase()))
      .slice(0, 3);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: 'Xin chào! Tôi là AI Assistant. Tôi có thể giúp bạn tìm sản phẩm và tư vấn đặt hàng ngay bây giờ.'
    }]);
  };

  return (
    <div className="chatbot-wrapper">
      <button 
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="AI Assistant"
      >
        {isOpen ? <Icons.Close /> : <Icons.Chat />}
      </button>

      <div className={`chatbot-window ${isOpen ? 'active' : ''}`}>
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-brand">
            <div className="chatbot-logo">
              <Icons.Bot />
            </div>
            <div className="chatbot-info">
              <h4>Trợ lý AI</h4>
              <span className="status-dot"></span>
            </div>
          </div>
          <button className="chatbot-action-btn" onClick={clearChat} title="Làm mới cuộc trò chuyện">
            <Icons.Trash />
          </button>
        </div>

        {/* Messages Body */}
        <div className="chatbot-body">
          <div className="messages-list">
            {messages.map((msg, index) => (
              <div key={index} className={`message-row ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="message-avatar-small"><Icons.Bot /></div>
                )}
                
                <div className="message-content-wrapper">
                  <div className="message-bubble">
                    {msg.content}
                  </div>

                  {/* Product Cards Grid */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="products-grid">
                      {msg.products.map(product => (
                        <div key={product.id} className="mini-product-card" onClick={() => window.location.href = `/product/${product.id}`}>
                          <div className="mini-product-img">
                            <img 
                              src={product.imageUrls && product.imageUrls.length > 0 ? `${product.imageUrls[0]}` : '/placeholder.png'}
                              alt={product.name}
                              onError={(e) => {e.target.src = '/placeholder.png';}}
                            />
                          </div>
                          <div className="mini-product-info">
                            <h6>{product.name}</h6>
                            <p>{product.price?.toLocaleString('vi-VN')}đ</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="message-row assistant">
                <div className="message-avatar-small"><Icons.Bot /></div>
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick Replies (Nổi lên trên input nếu là tin nhắn đầu) */}
        {messages.length === 1 && (
          <div className="quick-replies-container">
            {quickReplies.map((reply, idx) => (
              <button key={idx} className="quick-chip" onClick={() => sendMessage(reply)}>
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* Footer / Input */}
        <div className="chatbot-footer">
          <div className="input-group">
            <textarea
              placeholder="Bạn cần tìm gì..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
              disabled={loading}
            />
            <button 
              className="send-btn" 
              onClick={() => sendMessage()} 
              disabled={loading || !input.trim()}
            >
              {loading ? <div className="spinner"></div> : <Icons.Send />}
            </button>
          </div>
          <div className="copyright">Powered by Gemini AI</div>
        </div>
      </div>
    </div>
  );
};

export default ChatBotAdvanced;
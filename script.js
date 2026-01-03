// ============================================
// CONFIGURAÇÃO DO POPUP DE PROMOÇÃO
// ============================================

// CONFIGURE AQUI: Ativar/Desativar o popup
const ENABLE_PROMO_POPUP = true; // Mude para false para desativar o popup

// CONFIGURE AQUI: ID do produto em destaque
// Escolha um ID válido da lista de produtos abaixo
const PROMO_PRODUCT_ID = "CAM-00015"; // Exemplo: "CAM-00011" (Papete Tira - Marrom)
// Outras opções: "CAM-00007", "CAM-00015", "CAM-00028", etc.

// ============================================
// NOTA: Os dados dos produtos agora estão no arquivo products.js
// ============================================

// Configurações iniciais
let currentCategory = 'all';
let currentSort = 'name';
let cart = []; // Array para armazenar os itens do carrinho

// Elementos do DOM
const productsContainer = document.getElementById('productsContainer');
const categoryFilter = document.getElementById('categoryFilter');
const sortFilter = document.getElementById('sortFilter');
const openCartBtn = document.getElementById('openCart');
const closeCartBtn = document.getElementById('closeCart');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');
const cartWhatsAppBtn = document.getElementById('cartWhatsAppBtn');
const backToTopBtn = document.getElementById('backToTop');

// Elementos do Popup de Promoção
const promoPopup = document.getElementById('promoPopup');
const closePromoPopup = document.getElementById('closePromoPopup');
const closePromoBtn = document.getElementById('closePromoBtn');
const promoWhatsAppBtn = document.getElementById('promoWhatsAppBtn');
const promoProductContainer = document.getElementById('promoProductContainer');

// Ícones para cada categoria
const categoryIcons = {
    'Shoes': 'fas fa-shoe-prints',
    'Bags': 'fas fa-shopping-bag',
    'Belts': 'fas fa-grip-lines',
    'Activewear': 'fas fa-tshirt',
    'Clothing': 'fas fa-tshirt'
};

// Nomes em português para as categorias
const categoryNames = {
    'Shoes': 'Calçados',
    'Bags': 'Bolsas',
    'Belts': 'Cintos',
    'Activewear': 'Roupas Esportivas',
    'Clothing': 'Roupas Casuais'
};

// ============================================
// FUNÇÕES DO POPUP DE PROMOÇÃO
// ============================================

// Função para mostrar/ocultar o popup
function showPromoPopup() {
    if (!ENABLE_PROMO_POPUP) return;
    
    // Verificar se o usuário já fechou o popup antes
    const popupClosed = localStorage.getItem('camarimPromoPopupClosed');
    if (popupClosed === 'true') return;
    
    // Mostrar popup após 1 segundo
    setTimeout(() => {
        promoPopup.classList.add('active');
        document.body.style.overflow = 'hidden'; // Previne scroll
    }, 1000);
}

function hidePromoPopup() {
    promoPopup.classList.remove('active');
    document.body.style.overflow = ''; // Restaura scroll
}

// Função para configurar o produto em destaque
function setupPromoProduct() {
    if (!ENABLE_PROMO_POPUP) return;
    
    // Encontrar o produto pelo ID configurado
    const promoProduct = productsData.products.find(p => p.id === PROMO_PRODUCT_ID);
    
    if (!promoProduct) {
        console.warn(`Produto promocional não encontrado: ${PROMO_PRODUCT_ID}`);
        return;
    }
    
    // Calcular preço com desconto
    const discountedPrice = calculateDiscountedPrice(promoProduct.sellingPrice, promoProduct.discount);
    const discountAmount = promoProduct.sellingPrice - discountedPrice;
    const imagePath = getProductImagePaths(promoProduct)[0];
    
    // Criar HTML do produto em destaque
    promoProductContainer.innerHTML = `
        <div class="promo-product-image">
            <img src="${imagePath}" alt="${promoProduct.name}" onerror="this.src='https://via.placeholder.com/120/f8f9fa/6c757d?text=Produto'">
        </div>
        <div class="promo-product-info">
            <div class="promo-product-name">${promoProduct.name}</div>
            <div class="promo-product-id">Código: ${promoProduct.id}</div>
            <div class="promo-pricing">
                <div class="promo-original-price">${formatPrice(promoProduct.sellingPrice)}</div>
                <div class="promo-discount-price">${formatPrice(discountedPrice)}</div>
            </div>
            <div class="promo-discount-badge">${promoProduct.discount}% OFF - Economize ${formatPrice(discountAmount)}</div>
            <div style="font-size: 0.9rem; color: #666;">
                <i class="fas fa-box"></i> Estoque: ${promoProduct.stock} unidades
            </div>
        </div>
    `;
    
    // Configurar botão do WhatsApp para o produto promocional
    promoWhatsAppBtn.addEventListener('click', function() {
        const phoneNumber = "5563992973240";
        const message = generateWhatsAppMessage(promoProduct, discountedPrice, promoProduct.discount);
        const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;
        window.open(whatsappURL, '_blank');
        hidePromoPopup();
    });
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

// Função para obter os caminhos das imagens baseado no ID do produto
function getProductImagePaths(product) {
    // Se o produto tiver array de imagens definido, use-as
    if (product.images && product.images.length > 0) {
        return product.images.map(img => `img/${img}`);
    }
    
    // Caso contrário, use o padrão antigo
    const numericId = product.id.replace('CAM-', '').replace(/^0+/, '');
    return [`img/${numericId}.webp`];
}

// Classe para gerenciar o carrossel de imagens
class Carousel {
    constructor(container, images, productId) {
        this.container = container;
        this.images = images;
        this.productId = productId;
        this.currentIndex = 0;
        this.init();
    }
    
    init() {
        this.createCarousel();
        this.setupEventListeners();
        this.updateIndicators();
    }
    
    createCarousel() {
        // Criar slide container
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        
        // Adicionar imagens ao slide
        this.images.forEach((imgSrc, index) => {
            const img = document.createElement('img');
            img.src = imgSrc;
            img.alt = `Produto ${this.productId} - Imagem ${index + 1}`;
            img.onerror = function() {
                this.onerror = null;
                this.src = `https://via.placeholder.com/280x200/f8f9fa/6c757d?text=Imagem+${index + 1}`;
            };
            slide.appendChild(img);
        });
        
        // Adicionar botões de navegação
        const prevBtn = document.createElement('button');
        prevBtn.className = 'carousel-btn prev';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'carousel-btn next';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        
        // Adicionar indicadores (se tiver mais de uma imagem)
        const indicators = document.createElement('div');
        indicators.className = 'carousel-indicators';
        
        if (this.images.length > 1) {
            for (let i = 0; i < this.images.length; i++) {
                const indicator = document.createElement('button');
                indicator.className = `carousel-indicator ${i === 0 ? 'active' : ''}`;
                indicator.setAttribute('data-index', i);
                indicators.appendChild(indicator);
            }
        }
        
        // Adicionar todos os elementos ao container
        this.container.appendChild(slide);
        this.container.appendChild(prevBtn);
        this.container.appendChild(nextBtn);
        if (this.images.length > 1) {
            this.container.appendChild(indicators);
        }
        
        // Guardar referências
        this.slide = slide;
        this.prevBtn = prevBtn;
        this.nextBtn = nextBtn;
        this.indicators = indicators;
    }
    
    setupEventListeners() {
        if (this.images.length <= 1) return;
        
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Event listeners para indicadores
        if (this.indicators) {
            this.indicators.querySelectorAll('.carousel-indicator').forEach(indicator => {
                indicator.addEventListener('click', (e) => {
                    const index = parseInt(e.target.getAttribute('data-index'));
                    this.goToSlide(index);
                });
            });
        }
    }
    
    prevSlide() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateSlide();
        this.updateIndicators();
    }
    
    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateSlide();
        this.updateIndicators();
    }
    
    goToSlide(index) {
        this.currentIndex = index;
        this.updateSlide();
        this.updateIndicators();
    }
    
    updateSlide() {
        const translateX = -this.currentIndex * 100;
        this.slide.style.transform = `translateX(${translateX}%)`;
    }
    
    updateIndicators() {
        if (!this.indicators) return;
        
        const indicators = this.indicators.querySelectorAll('.carousel-indicator');
        indicators.forEach((indicator, index) => {
            if (index === this.currentIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
}

// Função para atualizar a URL com a categoria atual
function updateURLWithCategory(category) {
    if (category === 'all') {
        // Se for "todas", usar URL limpa
        history.replaceState(null, null, window.location.pathname);
    } else {
        // Adicionar categoria ao hash da URL
        history.replaceState(null, null, `#${category}`);
    }
}

// Função para atualizar a página com base na URL
function updatePageFromURL() {
    const hash = window.location.hash.substring(1); // Remove o #
    const validCategories = ['Shoes', 'Bags', 'Belts', 'Activewear', 'Clothing', 'all'];
    
    if (hash && validCategories.includes(hash)) {
        // Se houver uma categoria válida no hash
        currentCategory = hash;
    } else {
        // Se não houver hash ou for inválido
        currentCategory = 'all';
    }
    
    // Atualizar os controles de filtro
    updateFilterControls();
    
    // Renderizar produtos
    renderProducts();
}

// Função para atualizar controles de filtro
function updateFilterControls() {
    // Atualizar select dropdown
    categoryFilter.value = currentCategory;
}

// ============================================
// FUNCIONALIDADE DO BOTÃO "VOLTAR AO TOPO"
// ============================================

// Função para mostrar/ocultar o botão baseado na posição de rolagem
function toggleBackToTopButton() {
    if (window.scrollY > 300) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
}

// Função para voltar ao topo suavemente
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ============================================
// FUNÇÕES DO CARRINHO
// ============================================

function openCart() {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
}

function closeCart() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('camarimCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
    }
}

function saveCartToStorage() {
    localStorage.setItem('camarimCart', JSON.stringify(cart));
}

function addToCart(product) {
    // Verificar se há estoque disponível
    const cartItem = cart.find(item => item.id === product.id);
    const currentQuantityInCart = cartItem ? cartItem.quantity : 0;
    
    if (currentQuantityInCart >= product.stock) {
        alert(`Desculpe, não há estoque suficiente para adicionar mais unidades de ${product.name}. Estoque disponível: ${product.stock}`);
        return;
    }
    
    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        const discountedPrice = calculateDiscountedPrice(product.sellingPrice, product.discount);
        cart.push({
            id: product.id,
            name: product.name,
            price: discountedPrice,
            originalPrice: product.sellingPrice,
            discount: product.discount,
            quantity: 1,
            stock: product.stock
        });
    }
    
    saveCartToStorage();
    updateCartDisplay();
    
    // Feedback visual
    const cartIcon = openCartBtn.querySelector('i');
    cartIcon.style.transform = 'scale(1.3)';
    setTimeout(() => {
        cartIcon.style.transform = 'scale(1)';
    }, 300);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    updateCartDisplay();
}

function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        // Verificar se a nova quantidade não excede o estoque
        if (newQuantity > item.stock) {
            alert(`Desculpe, não há estoque suficiente para ${item.name}. Estoque disponível: ${item.stock}`);
            return;
        }
        
        item.quantity = newQuantity;
        saveCartToStorage();
        updateCartDisplay();
    }
}

function calculateCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function updateCartDisplay() {
    // Atualizar contador do carrinho
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Atualizar lista de itens
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <p>Seu carrinho está vazio</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">Adicione produtos clicando no botão "Adicionar ao Carrinho"</p>
            </div>
        `;
    } else {
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${formatPrice(item.price)} cada</div>
                    <div style="font-size: 0.85rem; color: #666; margin-top: 3px;">
                        Estoque disponível: ${item.stock}
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn increase" data-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="remove-item" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            cartItems.appendChild(itemElement);
        });
        
        // Adicionar eventos aos botões de quantidade e remover
        cartItems.querySelectorAll('.quantity-btn.decrease').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                const item = cart.find(item => item.id === productId);
                if (item) {
                    updateQuantity(productId, item.quantity - 1);
                }
            });
        });
        
        cartItems.querySelectorAll('.quantity-btn.increase').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                const item = cart.find(item => item.id === productId);
                if (item) {
                    updateQuantity(productId, item.quantity + 1);
                }
            });
        });
        
        cartItems.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                removeFromCart(productId);
            });
        });
    }
    
    // Atualizar total
    const total = calculateCartTotal();
    cartTotal.textContent = formatPrice(total);
}

function sendCartToWhatsApp() {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio! Adicione produtos antes de finalizar a compra.');
        return;
    }
    
    const phoneNumber = "5563992973240"; // Número para substituir
    
    let message = `Olá! Gostaria de fazer um pedido com os seguintes produtos:\n\n`;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        message += `• ${item.name} (Código: ${item.id})\n`;
        message += `  Quantidade: ${item.quantity}\n`;
        message += `  Preço unitário: ${formatPrice(item.price)} (${item.discount}% de desconto)\n`;
        message += `  Subtotal: ${formatPrice(itemTotal)}\n\n`;
    });
    
    const total = calculateCartTotal();
    message += `Total da compra: ${formatPrice(total)}\n\n`;
    message += `Por favor, entre em contato para finalizar o pedido!`;
    
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
}

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

// Calcular preço com desconto
function calculateDiscountedPrice(originalPrice, discountPercent) {
    return originalPrice * (1 - discountPercent / 100);
}

// Formatar preço para exibição
function formatPrice(price) {
    return 'R$ ' + price.toFixed(2).replace('.', ',');
}

// Obter classe CSS para o status do estoque
function getStockClass(stock) {
    if (stock === 0) {
        return 'stock-info out-of-stock';
    } else if (stock <= 2) {
        return 'stock-info low-stock';
    } else {
        return 'stock-info in-stock';
    }
}

// Obter ícone para o status do estoque
function getStockIcon(stock) {
    if (stock === 0) {
        return 'fas fa-times-circle';
    } else if (stock <= 2) {
        return 'fas fa-exclamation-circle';
    } else {
        return 'fas fa-check-circle';
    }
}

// Obter texto para o status do estoque
function getStockText(stock) {
    if (stock === 0) {
        return 'Esgotado';
    } else if (stock <= 2) {
        return `${stock} uni.`;
    } else {
        return `${stock} uni.`;
    }
}

// Gerar mensagem para WhatsApp (produto individual)
function generateWhatsAppMessage(product, discountedPrice, discountPercent) {
    const message = `Olá! Tenho interesse no produto: ${product.name} (${product.id}).\n` +
                   `Preço original: ${formatPrice(product.sellingPrice)}\n` +
                   `Preço com desconto: ${formatPrice(discountedPrice)}\n` +
                   `Desconto aplicado: ${discountPercent}%\n` +
                   `Estoque disponível: ${product.stock} unidades\n` +
                   `Gostaria de mais informações ou fazer o pedido!`;
    
    return encodeURIComponent(message);
}

// Renderizar os produtos
function renderProducts() {
    // Limpar container
    productsContainer.innerHTML = '';
    
    // Filtrar produtos por categoria
    let filteredProducts = productsData.products;
    
    if (currentCategory !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.category === currentCategory);
    }
    
    // Ordenar produtos
    filteredProducts.sort((a, b) => {
        switch(currentSort) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'price-low':
                return a.sellingPrice - b.sellingPrice;
            case 'price-high':
                return b.sellingPrice - a.sellingPrice;
            case 'discount':
                return b.discount - a.discount;
            default:
                return 0;
        }
    });
    
    // Gerar HTML para cada produto
    filteredProducts.forEach(product => {
        const discountedPrice = calculateDiscountedPrice(product.sellingPrice, product.discount);
        const discountAmount = product.sellingPrice - discountedPrice;
        const stockClass = getStockClass(product.stock);
        const stockIcon = getStockIcon(product.stock);
        const stockText = getStockText(product.stock);
        const imagePaths = getProductImagePaths(product);
        
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.dataset.productId = product.id;
        
        productCard.innerHTML = `
            <div class="product-image-carousel" id="carousel-${product.id}">
                <!-- Carrossel será inserido aqui via JavaScript -->
            </div>
            <div class="category-badge">${categoryNames[product.category] || product.category}</div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-meta">
                    <div class="product-id">Código: ${product.id}</div>
                    <div class="${stockClass}">
                        <i class="${stockIcon}"></i>
                        <span>${stockText}</span>
                    </div>
                </div>
                <div class="pricing">
                    <div class="original-price">${formatPrice(product.sellingPrice)}</div>
                    <div class="discount-price">${formatPrice(discountedPrice)}</div>
                    
                    <div class="discount-badge">${product.discount}% OFF - Economize ${formatPrice(discountAmount)}</div>
                    
                    <div class="product-actions">
                        <button class="add-to-cart-btn" data-product-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus"></i> ${product.stock === 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
                        </button>
                        <button class="whatsapp-btn" data-product-id="${product.id}">
                            <i class="fab fa-whatsapp"></i> Comprar no WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Adicionar carrossel de imagens
        const carouselContainer = productCard.querySelector(`#carousel-${product.id}`);
        new Carousel(carouselContainer, imagePaths, product.id);
        
        // Adicionar evento ao botão "Adicionar ao Carrinho" (se não estiver esgotado)
        if (product.stock > 0) {
            const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
            addToCartBtn.addEventListener('click', function() {
                addToCart(product);
            });
        }
        
        // Adicionar evento ao botão do WhatsApp (produto individual)
        const whatsappBtn = productCard.querySelector('.whatsapp-btn');
        whatsappBtn.addEventListener('click', function() {
            const phoneNumber = "5563992973240"; // Número para substituir
            const message = generateWhatsAppMessage(product, discountedPrice, product.discount);
            const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;
            window.open(whatsappURL, '_blank');
        });
        
        productsContainer.appendChild(productCard);
    });
    
    // Se não houver produtos para a categoria selecionada
    if (filteredProducts.length === 0) {
        productsContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; background-color: white; border-radius: var(--border-radius); box-shadow: var(--shadow);">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--gray-color); margin-bottom: 20px;"></i>
                <h3 style="color: var(--secondary-color); margin-bottom: 10px;">Nenhum produto encontrado</h3>
                <p>Tente selecionar outra categoria ou alterar os filtros.</p>
            </div>
        `;
    }
}

// ============================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ============================================

function init() {
    // Configurar eventos
    categoryFilter.addEventListener('change', function() {
        currentCategory = this.value;
        updateURLWithCategory(currentCategory);
        updateFilterControls();
        renderProducts();
    });
    
    sortFilter.addEventListener('change', function() {
        currentSort = this.value;
        renderProducts();
    });
    
    // Eventos do carrinho
    openCartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
    cartWhatsAppBtn.addEventListener('click', sendCartToWhatsApp);
    
    // Carregar carrinho do localStorage
    loadCartFromStorage();
    
    // Configurar evento para quando a URL mudar
    window.addEventListener('hashchange', updatePageFromURL);
    
    // Configurar popup de promoção
    if (ENABLE_PROMO_POPUP) {
        setupPromoProduct();
        
        // Eventos do popup
        closePromoPopup.addEventListener('click', function() {
            hidePromoPopup();
            localStorage.setItem('camarimPromoPopupClosed', 'true');
        });
        
        closePromoBtn.addEventListener('click', function() {
            hidePromoPopup();
            localStorage.setItem('camarimPromoPopupClosed', 'true');
        });
        
        // Mostrar popup
        showPromoPopup();
    }
    
    // Eventos do botão "Voltar ao Topo"
    window.addEventListener('scroll', toggleBackToTopButton);
    backToTopBtn.addEventListener('click', scrollToTop);
    
    // Atualizar página com base na URL atual
    updatePageFromURL();
    
    // Inicializar estado do botão "Voltar ao Topo"
    toggleBackToTopButton();
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', init);

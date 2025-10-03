// Global variables
let supabaseClient;
let currentLanguage = 'en';
let restaurantData = {};
let categories = [];
let menuItems = [];
let filteredItems = [];
let selectedCategory = 'all';

// DOM elements
const elements = {
    coverImage: document.getElementById('cover-image'),
    logo: document.getElementById('logo'),
    restaurantName: document.getElementById('restaurant-name'),
    instagramLink: document.getElementById('instagram-link'),
    langToggle: document.getElementById('lang-toggle'),
    categoriesContainer: document.getElementById('categories-container'),
    menuItemsContainer: document.getElementById('menu-items'),
    itemModal: document.getElementById('item-modal'),
    modalItemImage: document.getElementById('modal-item-image'),
    modalItemName: document.getElementById('modal-item-name'),
    modalItemPrice: document.getElementById('modal-item-price'),
    modalItemCalories: document.getElementById('modal-item-calories'),
    modalItemAllergens: document.getElementById('modal-item-allergens'),
    modalItemIngredients: document.getElementById('modal-item-ingredients')
};

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Supabase
    supabaseClient = initializeSupabase();
    
    // Load restaurant data
    await loadRestaurantData();
    
    // Load categories and menu items
    await loadCategories();
    await loadMenuItems();
    
    // Setup event listeners
    setupEventListeners();
    
    // Render the initial menu
    renderMenu();
});

// Initialize Supabase client
function initializeSupabase() {
    // For production, use environment variables
    const supabaseUrl = 'https://djrkjnzbzxkwidzkvbig.supabase.co'; // Replace with actual URL
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcmtqbnpienhrd2lkemt2YmlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzOTU5NjYsImV4cCI6MjA3NDk3MTk2Nn0.CYDdz-EbFEDqQAFSc864YGxlxAn8hWIA8Rx0pltuJe4'; // Replace with actual key

    // Check if Supabase is available
    if (typeof window.supabase === 'undefined') {
        console.error('Supabase library not loaded');
        showNotification('Error loading application', 'error');
        return null;
    }
    
    return window.supabase.createClient(supabaseUrl, supabaseAnonKey);
}

// Load restaurant data
async function loadRestaurantData() {
    if (!supabaseClient) {
        console.error('Supabase client not initialized');
        return;
    }
    
    try {
        // Fetch restaurant data from Supabase
        const { data, error } = await supabaseClient
            .from('restaurants')
            .select('*')
            .single();
            
        if (error) {
            throw error;
        }
        
        restaurantData = data;
        
        // Update UI with restaurant data
        elements.coverImage.src = restaurantData.cover_image;
        elements.logo.src = restaurantData.logo_image;
        elements.restaurantName.textContent = restaurantData[`name_${currentLanguage}`];
        elements.instagramLink.href = restaurantData.instagram_url;
        
        // Set default language
        currentLanguage = restaurantData.lang_default;
        updateLanguageToggle();
    } catch (error) {
        console.error('Error loading restaurant data:', error);
        showNotification('Error loading restaurant data', 'error');
    }
}

// Load categories
async function loadCategories() {
    if (!supabaseClient) {
        console.error('Supabase client not initialized');
        return;
    }
    
    try {
        // Fetch categories from Supabase
        const { data, error } = await supabaseClient
            .from('categories')
            .select('*')
            .order('sort_order');
            
        if (error) {
            throw error;
        }
        
        categories = data;
    } catch (error) {
        console.error('Error loading categories:', error);
        showNotification('Error loading categories', 'error');
    }
}

// Load menu items
async function loadMenuItems() {
    if (!supabaseClient) {
        console.error('Supabase client not initialized');
        return;
    }
    
    try {
        // Fetch menu items from Supabase
        const { data, error } = await supabaseClient
            .from('items')
            .select('*')
            .eq('visible', true);
            
        if (error) {
            throw error;
        }
        
        menuItems = data;
        
        // Initialize filtered items
        filteredItems = [...menuItems];
    } catch (error) {
        console.error('Error loading menu items:', error);
        showNotification('Error loading menu items', 'error');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Language toggle
    elements.langToggle.addEventListener('click', toggleLanguage);
    
    // Modal close
    const closeBtn = document.querySelector('.close');
    closeBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === elements.itemModal) {
            closeModal();
        }
    });
}

// Toggle language
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'ar' : 'en';
    document.documentElement.setAttribute('dir', currentLanguage === 'ar' ? 'rtl' : 'ltr');
    updateLanguageToggle();
    renderMenu();
}

// Update language toggle button
function updateLanguageToggle() {
    elements.langToggle.textContent = currentLanguage === 'en' ? 'العربية' : 'English';
}

// Render category thumbnails
function renderCategoryThumbnails() {
    elements.categoriesContainer.innerHTML = '';
    
    // Add "All" thumbnail
    const allThumbnail = createCategoryThumbnail({
        id: 'all',
        name_en: 'All',
        name_ar: 'الكل',
        image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    });
    
    if (selectedCategory === 'all') {
        allThumbnail.classList.add('active');
    }
    
    elements.categoriesContainer.appendChild(allThumbnail);
    
    // Add category thumbnails
    categories.forEach(category => {
        const thumbnail = createCategoryThumbnail(category);
        
        if (selectedCategory === category.id) {
            thumbnail.classList.add('active');
        }
        
        elements.categoriesContainer.appendChild(thumbnail);
    });
}

// Create category thumbnail
function createCategoryThumbnail(category) {
    const thumbnail = document.createElement('div');
    thumbnail.className = 'category-thumbnail';
    thumbnail.dataset.categoryId = category.id;
    
    thumbnail.innerHTML = `
        <img src="${category.image_url}" alt="${category[`name_${currentLanguage}`]}" class="category-image">
        <div class="category-name">${category[`name_${currentLanguage}`]}</div>
    `;
    
    // Add click event
    thumbnail.addEventListener('click', () => selectCategory(category.id));
    
    return thumbnail;
}

// Select category
function selectCategory(categoryId) {
    selectedCategory = categoryId;
    
    // Update active thumbnail
    document.querySelectorAll('.category-thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
        if (thumb.dataset.categoryId === categoryId) {
            thumb.classList.add('active');
        }
    });
    
    // Filter items
    if (categoryId === 'all') {
        filteredItems = [...menuItems];
    } else {
        filteredItems = menuItems.filter(item => item.category_id === categoryId);
    }
    
    // Render items
    renderMenuItems();
}

// Render the entire menu
function renderMenu() {
    // Update restaurant name
    elements.restaurantName.textContent = restaurantData[`name_${currentLanguage}`];
    
    // Render category thumbnails
    renderCategoryThumbnails();
    
    // Render menu items
    renderMenuItems();
}

// Render menu items
function renderMenuItems() {
    elements.menuItemsContainer.innerHTML = '';
    
    if (filteredItems.length === 0) {
        elements.menuItemsContainer.innerHTML = `
            <div class="no-items">
                <p>${currentLanguage === 'en' ? 'No items found' : 'لم يتم العثور على عناصر'}</p>
            </div>
        `;
        return;
    }
    
    filteredItems.forEach(item => {
        const card = createMenuItemCard(item);
        elements.menuItemsContainer.appendChild(card);
    });
}

// Create menu item card
function createMenuItemCard(item) {
    const card = document.createElement('div');
    card.className = 'menu-item-card';
    card.dataset.itemId = item.id;
    
    // Format allergens
    const allergens = item.allergens ? item.allergens.split(',').map(a => a.trim()).join(', ') : '';
    
    card.innerHTML = `
        <img src="${item.image_url}" alt="${item[`name_${currentLanguage}`]}" class="menu-item-image">
        <div class="menu-item-content">
            <div class="menu-item-header">
                <h3 class="menu-item-name">${item[`name_${currentLanguage}`]}</h3>
                <div class="menu-item-price">${item.price} SAR</div>
            </div>
            <div class="menu-item-meta">
                <span class="menu-item-calories">
                    <i class="fas fa-fire"></i> ${item.calories} ${currentLanguage === 'en' ? 'cal' : 'سعرة'}
                </span>
                ${allergens ? `<span class="menu-item-allergens"><i class="fas fa-exclamation-triangle"></i> ${currentLanguage === 'en' ? 'Allergens' : 'مسببات الحساسية'}: ${allergens}</span>` : ''}
            </div>
            <p class="menu-item-ingredients">${item.ingredients}</p>
            <button class="view-details-btn">${currentLanguage === 'en' ? 'View Details' : 'عرض التفاصيل'}</button>
        </div>
    `;
    
    // Add click event to show item details
    card.addEventListener('click', () => showItemDetails(item));
    
    return card;
}

// Show item details in modal
function showItemDetails(item) {
    // Format allergens
    const allergens = item.allergens ? item.allergens.split(',').map(a => a.trim()).join(', ') : 
                     (currentLanguage === 'en' ? 'None' : 'لا يوجد');
    
    // Update modal content
    elements.modalItemImage.src = item.image_url;
    elements.modalItemImage.alt = item[`name_${currentLanguage}`];
    elements.modalItemName.textContent = item[`name_${currentLanguage}`];
    elements.modalItemPrice.textContent = `${item.price} SAR`;
    elements.modalItemCalories.innerHTML = `
        <i class="fas fa-fire"></i> 
        ${item.calories} ${currentLanguage === 'en' ? 'calories' : 'سعرة حرارية'}
    `;
    elements.modalItemAllergens.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i> 
        ${currentLanguage === 'en' ? 'Allergens' : 'مسببات الحساسية'}: ${allergens}
    `;
    elements.modalItemIngredients.innerHTML = `
        <i class="fas fa-list"></i> 
        ${currentLanguage === 'en' ? 'Ingredients' : 'المكونات'}: ${item.ingredients}
    `;
    
    // Show modal
    elements.itemModal.style.display = 'block';
}

// Close modal
function closeModal() {
    elements.itemModal.style.display = 'none';
}

// Show notification (for errors, etc.)
function showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification hidden';
        document.body.appendChild(notification);
        
        const content = document.createElement('div');
        content.className = 'notification-content';
        
        const messageEl = document.createElement('span');
        messageEl.id = 'notification-message';
        
        const closeBtn = document.createElement('button');
        closeBtn.id = 'notification-close';
        closeBtn.className = 'notification-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => {
            notification.classList.add('hidden');
        });
        
        content.appendChild(messageEl);
        content.appendChild(closeBtn);
        notification.appendChild(content);
    }
    
    // Update notification content
    const messageEl = document.getElementById('notification-message');
    messageEl.textContent = message;
    
    // Update notification style based on type
    notification.className = 'notification';
    if (type === 'error') {
        notification.style.backgroundColor = 'rgba(231, 76, 60, 0.9)';
    } else if (type === 'success') {
        notification.style.backgroundColor = 'rgba(39, 174, 96, 0.9)';
    } else {
        notification.style.backgroundColor = 'rgba(52, 152, 219, 0.9)';
    }
    
    // Show notification
    notification.classList.remove('hidden');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}
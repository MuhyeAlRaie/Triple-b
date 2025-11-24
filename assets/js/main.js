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
    modalItemIngredients: document.getElementById('modal-item-ingredients'),
    modalItemNutrition: document.getElementById('modal-item-nutrition'),
    modalNutritionTitle: document.getElementById('nutrition-title'),
nutritionGrid: document.getElementById('nutrition-grid'),
allergenText: document.getElementById('allergen-text'),

     vortishopText: document.getElementById('vortishop-text')
     

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
        updateAllergenText();
        

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
    updateVortishopText();
    updateAllergenText(); 
    renderMenu();
}

// Update language toggle button
function updateLanguageToggle() {
    elements.langToggle.textContent = currentLanguage === 'en' ? 'العربية' : 'English';
}

// Update Vortishop text based on language
function updateVortishopText() {
    if (currentLanguage === 'en') {
        elements.vortishopText.textContent = 'Powered by ';
    } else {
        elements.vortishopText.textContent = 'مدعوم من ';
    }
}

// Add this function to update allergen text based on language
function updateAllergenText() {
    if (currentLanguage === 'en') {
        elements.allergenText.innerHTML = `
            <strong>Allergen Warning:</strong> Prepared food may contain the following ingredients: dairy, eggs, wheat, peanuts, gluten, and soy. If you are allergic to any of these ingredients, please inform your waiter. Thank you. Adults need an average of 2000 calories, and individual needs may vary. Additional nutritional information is available upon request. Prices include VAT.
        `;
    } else {
        elements.allergenText.innerHTML = `
            <strong>تنبيه مسببات الحساسية:</strong> قد يحتوي الطعام المحضر على المكونات التالية: منتجات الالبان- البيض القمح- الفول السوداني- الجوز والصويا. اذا كنت تعاني من الحساسية من هذه المكونات يرجى تنبيه النادل الخاص بك. شكرا. يحتاج البالغون الى 2000 سعره حرارية في المتوسط ويحتاج الأطفال من هم في سن 4 - 13 من ( 1200 – 1500 )سعرة حرارية في المتوسط يوميا وقد تختلف الاحتياجات الفردية من شخص الى اخر. البيانات التغذوية الاضافية متاحة عند الطلب. الاسعار تشمل ضريبة القيمة المضافة.
        `;
    }
}


// Render category thumbnails
function renderCategoryThumbnails() {
    elements.categoriesContainer.innerHTML = '';
    
    // Add "All" thumbnail
    const allThumbnail = createCategoryThumbnail({
        id: 'all',
        name_en: 'All',
        name_ar: 'الكل',
        image_url: 'assets/images/all.png' // Placeholder image for "All"
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
    
    // Get ingredients based on current language
    const ingredients = currentLanguage === 'en' ? 
        (item.ingredients || '') : 
        (item.ingredients_ar || item.ingredients || '');
    
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
            <p class="menu-item-ingredients">${ingredients}</p>
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
    
    // Get ingredients based on current language
    const ingredients = currentLanguage === 'en' ? 
        (item.ingredients || 'None') : 
        (item.ingredients_ar || item.ingredients || 'لا يوجد');
    
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
        ${currentLanguage === 'en' ? 'Ingredients' : 'المكونات'}: ${ingredients}
    `;
    
    // Update nutrition title
    elements.modalNutritionTitle.textContent = currentLanguage === 'en' ? 'Nutrition Information' : 'معلومات غذائية';
    
    // Create nutrition data array
    const nutritionData = [
        { key: 'protein', unit: 'g', en: 'Protein', ar: 'بروتين' },
        { key: 'carbs', unit: 'g', en: 'Carbohydrates', ar: 'كربوهيدرات' },
        { key: 'fat', unit: 'g', en: 'Fat', ar: 'دهون' },
        { key: 'trans_fat', unit: 'g', en: 'Trans Fat', ar: 'دهون غير مشبعة' },
        { key: 'saturated_fat', unit: 'g', en: 'Saturated Fat', ar: 'دهون مشبعة' },
        { key: 'dietary_fiber', unit: 'g', en: 'Dietary Fiber', ar: 'ألياف غذائية' },
        { key: 'cholesterol', unit: 'mg', en: 'Cholesterol', ar: 'كوليسترول' },
        { key: 'added_sugars', unit: 'g', en: 'Added Sugars', ar: 'سكريات مضافة' },
        { key: 'total_sugars', unit: 'g', en: 'Total Sugars', ar: 'إجمالي السكريات' },
        { key: 'polyols', unit: 'g', en: 'Polyols', ar: 'بوليولات' },
        { key: 'sodium', unit: 'mg', en: 'Sodium', ar: 'صوديوم' },
        { key: 'salt', unit: 'g', en: 'Salt', ar: 'ملح' },
        { key: 'caffeine', unit: 'mg', en: 'Caffeine', ar: 'كافيين' }
    ];
    
    // Generate nutrition grid HTML
    let nutritionHTML = '';
    nutritionData.forEach(nutrient => {
        const value = item[nutrient.key] || 0;
        if (value > 0) { // Only show nutrients with values > 0
            nutritionHTML += `
                <div class="nutrition-item">
                    <div class="nutrition-name">${currentLanguage === 'en' ? nutrient.en : nutrient.ar}</div>
                    <div class="nutrition-value">${value}${nutrient.unit}</div>
                </div>
            `;
        }
    });
    
    // If no nutrition data, show a message
    if (nutritionHTML === '') {
        nutritionHTML = `<div class="no-nutrition-data">${currentLanguage === 'en' ? 'No nutrition information available' : 'لا توجد معلومات غذائية متاحة'}</div>`;
    }
    
    elements.nutritionGrid.innerHTML = nutritionHTML;
    
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
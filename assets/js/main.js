/* ============================================================
   TRiPLE-B — Static Menu App
   Renders categories + items from data.js (no backend needed).
   ------------------------------------------------------------
   Global data: RESTAURANT, CATEGORIES, ITEMS (see data.js)
   ============================================================ */

// Global state
let currentLanguage = RESTAURANT.lang_default || 'en';
let selectedCategory = 'all';
let filteredItems = [];

const currencyIcon = 'assets/images/currency-icon.png';

// DOM elements
const elements = {
    coverImage: document.getElementById('cover-image'),
    logo: document.getElementById('logo'),
    restaurantName: document.getElementById('restaurant-name'),
    instagramLink: document.getElementById('instagram-link'),
    googleReviewsLink: document.getElementById('google-reviews-link'),

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
    modalNutritionTitle: document.getElementById('nutrition-title'),
    nutritionGrid: document.getElementById('nutrition-grid'),
    allergenText: document.getElementById('allergen-text'),
    vortishopText: document.getElementById('vortishop-text')
};

// Bootstrap modal instance (created on init)
let bootstrapModal = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadRestaurantData();
    setupEventListeners();
    renderMenu();
});

// Apply restaurant data to the header
function loadRestaurantData() {
    elements.coverImage.src = RESTAURANT.cover_image;
    elements.logo.src = RESTAURANT.logo_image;
    elements.restaurantName.textContent = RESTAURANT[`name_${currentLanguage}`];
    elements.instagramLink.href = RESTAURANT.instagram_url || '#';
    elements.googleReviewsLink.href = RESTAURANT.google_reviews_url || '#';

    updateLanguageToggle();
    updateVortishopText();
    updateAllergenText();
}

// Setup event listeners
function setupEventListeners() {
    elements.langToggle.addEventListener('click', toggleLanguage);

    bootstrapModal = new bootstrap.Modal(elements.itemModal);

    // Sort items once: explicit "sort" field, fallback to category order then name
    ITEMS.sort((a, b) => {
        if (a.sort !== b.sort) return (a.sort || 999) - (b.sort || 999);
        return a.name_en.localeCompare(b.name_en);
    });

    filteredItems = [...ITEMS];
}

// Toggle language EN <-> AR
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'ar' : 'en';
    document.documentElement.setAttribute('dir', currentLanguage === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', currentLanguage);
    updateLanguageToggle();
    updateVortishopText();
    updateAllergenText();
    renderMenu();
}

// Update language toggle button text
function updateLanguageToggle() {
    elements.langToggle.textContent = currentLanguage === 'en' ? 'العربية' : 'English';
}

// Update footer branding text based on language
function updateVortishopText() {
    elements.vortishopText.textContent = currentLanguage === 'en' ? 'Powered by ' : 'مدعوم من ';
}

// Update allergen warning text based on language
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

// Render category thumbnails + menu items
function renderMenu() {
    elements.restaurantName.textContent = RESTAURANT[`name_${currentLanguage}`];
    renderCategoryThumbnails();
    renderMenuItems();
}

// Render category thumbnails
function renderCategoryThumbnails() {
    elements.categoriesContainer.innerHTML = '';

    // "All" pseudo-category (uses the same MENU icon as the original)
    const allThumbnail = createCategoryThumbnail({
        id: 'all',
        name_en: 'All',
        name_ar: 'الكل',
        image_url: 'assets/images/categories/cat-all.png'
    });
    if (selectedCategory === 'all') allThumbnail.classList.add('active');
    elements.categoriesContainer.appendChild(allThumbnail);

    const sortedCategories = [...CATEGORIES].sort((a, b) => a.sort_order - b.sort_order);
    sortedCategories.forEach(category => {
        const thumbnail = createCategoryThumbnail(category);
        if (selectedCategory === category.id) thumbnail.classList.add('active');
        elements.categoriesContainer.appendChild(thumbnail);
    });
}

// Create a single category thumbnail
function createCategoryThumbnail(category) {
    const thumbnail = document.createElement('div');
    thumbnail.className = 'category-thumbnail';
    thumbnail.dataset.categoryId = category.id;
    thumbnail.setAttribute('role', 'button');
    thumbnail.setAttribute('tabindex', '0');

    thumbnail.innerHTML = `
        <img src="${category.image_url}" alt="${category[`name_${currentLanguage}`]}" class="category-image">
        <div class="category-name">${category[`name_${currentLanguage}`]}</div>
    `;

    thumbnail.addEventListener('click', () => selectCategory(category.id));
    thumbnail.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') selectCategory(category.id);
    });

    return thumbnail;
}

// Select a category and filter items
function selectCategory(categoryId) {
    selectedCategory = categoryId;

    document.querySelectorAll('.category-thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
        if (thumb.dataset.categoryId === categoryId) thumb.classList.add('active');
    });

    filteredItems = categoryId === 'all'
        ? [...ITEMS]
        : ITEMS.filter(item => item.category_id === categoryId);

    renderMenuItems();
}

// Render the menu item cards
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
        elements.menuItemsContainer.appendChild(createMenuItemCard(item));
    });
}

// Create a menu item card
function createMenuItemCard(item) {
    const card = document.createElement('div');
    card.className = 'menu-item-card';
    card.dataset.itemId = item.id;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    const allergens = getAllergenDisplayNames(item);
    const allergenText = allergens.length > 0 ? allergens.join(', ') : '';

    const ingredients = currentLanguage === 'en'
        ? (item.ingredients || '')
        : (item.ingredients_ar || item.ingredients || '');

    card.innerHTML = `
        <img src="${item.image_url}" alt="${item[`name_${currentLanguage}`]}" class="menu-item-image" loading="lazy">
        <div class="menu-item-content">
            <div class="menu-item-header">
                <h3 class="menu-item-name">${item[`name_${currentLanguage}`]}</h3>
                <div class="menu-item-price">${formatPrice(item.price)}</div>
            </div>
            <div class="menu-item-meta">
                <span class="menu-item-calories">
                    <i class="fas fa-fire"></i> ${item.calories} ${currentLanguage === 'en' ? 'cal' : 'سعرة'}
                </span>
                ${allergenText ? `<span class="menu-item-allergens"><i class="fas fa-exclamation-triangle"></i> ${currentLanguage === 'en' ? 'Allergens' : 'مسببات الحساسية'}: ${allergenText}</span>` : ''}
            </div>
            <p class="menu-item-ingredients">${ingredients}</p>
            <button class="view-details-btn" type="button">${currentLanguage === 'en' ? 'View Details' : 'عرض التفاصيل'}</button>
        </div>
    `;

    card.addEventListener('click', () => showItemDetails(item));
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') showItemDetails(item);
    });

    return card;
}

// Allergen display names in the current language
function getAllergenDisplayNames(item) {
    const allergens = [];
    if (item.allergen_gluten)  allergens.push(currentLanguage === 'en' ? 'Gluten' : 'جلوتين');
    if (item.allergen_dairy)   allergens.push(currentLanguage === 'en' ? 'Dairy' : 'منتجات الألبان');
    if (item.allergen_eggs)    allergens.push(currentLanguage === 'en' ? 'Eggs' : 'بيض');
    if (item.allergen_mustard) allergens.push(currentLanguage === 'en' ? 'Mustard' : 'خردل');
    if (item.allergen_sesame)  allergens.push(currentLanguage === 'en' ? 'Sesame seeds' : 'بذور السمسم');
    if (item.allergen_soybean) allergens.push(currentLanguage === 'en' ? 'Soybean' : 'فول الصويا');
    if (item.allergen_fish)    allergens.push(currentLanguage === 'en' ? 'Fish' : 'سمك');
    return allergens;
}

// Show item details inside the modal
function showItemDetails(item) {
    const allergens = getAllergenDisplayNames(item);
    const allergenLabel = allergens.length > 0
        ? allergens.join(', ')
        : (currentLanguage === 'en' ? 'None' : 'لا يوجد');

    const ingredients = currentLanguage === 'en'
        ? (item.ingredients || 'None')
        : (item.ingredients_ar || item.ingredients || 'لا يوجد');

    const activityMinutes = item.activity_brisk_walking_minutes || 0;

    elements.modalItemImage.src = item.image_url;
    elements.modalItemImage.alt = item[`name_${currentLanguage}`];
    elements.modalItemName.textContent = item[`name_${currentLanguage}`];
    elements.modalItemPrice.innerHTML = formatPrice(item.price);
    elements.modalItemCalories.innerHTML = `
        <i class="fas fa-fire"></i>
        ${item.calories} ${currentLanguage === 'en' ? 'calories' : 'سعرة حرارية'}
    `;
    elements.modalItemAllergens.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        ${currentLanguage === 'en' ? 'Allergens' : 'مسببات الحساسية'}: ${allergenLabel}
    `;
    elements.modalItemIngredients.innerHTML = `
        <i class="fas fa-list"></i>
        ${currentLanguage === 'en' ? 'Ingredients' : 'المكونات'}: ${ingredients}
    `;

    elements.modalNutritionTitle.textContent = currentLanguage === 'en'
        ? 'Nutrition Information'
        : 'معلومات غذائية';

    // Remove previously injected activity block
    const existingActivity = document.querySelector('.item-activity');
    if (existingActivity) existingActivity.remove();

    const nutritionData = [
        { key: 'protein',        unit: 'g',  en: 'Protein',         ar: 'بروتين' },
        { key: 'carbs',          unit: 'g',  en: 'Carbohydrates',   ar: 'كربوهيدرات' },
        { key: 'fat',            unit: 'g',  en: 'Fat',             ar: 'دهون' },
        { key: 'trans_fat',      unit: 'g',  en: 'Trans Fat',       ar: 'دهون غير مشبعة' },
        { key: 'saturated_fat',  unit: 'g',  en: 'Saturated Fat',   ar: 'دهون مشبعة' },
        { key: 'dietary_fiber',  unit: 'g',  en: 'Dietary Fiber',   ar: 'ألياف غذائية' },
        { key: 'cholesterol',    unit: 'mg', en: 'Cholesterol',     ar: 'كوليسترول' },
        { key: 'added_sugars',   unit: 'g',  en: 'Added Sugars',    ar: 'سكريات مضافة' },
        { key: 'total_sugars',   unit: 'g',  en: 'Total Sugars',    ar: 'إجمالي السكريات' },
        { key: 'polyols',        unit: 'g',  en: 'Polyols',         ar: 'بوليولات' },
        { key: 'sodium',         unit: 'mg', en: 'Sodium',          ar: 'صوديوم' },
        { key: 'salt',           unit: 'g',  en: 'Salt',            ar: 'ملح' },
        { key: 'caffeine',       unit: 'mg', en: 'Caffeine',        ar: 'كافيين' }
    ];

    let nutritionHTML = '';
    nutritionData.forEach(nutrient => {
        const value = item[nutrient.key] || 0;
        if (value > 0) {
            nutritionHTML += `
                <div class="nutrition-item">
                    <div class="nutrition-name">${currentLanguage === 'en' ? nutrient.en : nutrient.ar}</div>
                    <div class="nutrition-value">${value}${nutrient.unit}</div>
                </div>
            `;
        }
    });

    if (nutritionHTML === '') {
        nutritionHTML = `<div class="no-nutrition-data">${currentLanguage === 'en' ? 'No nutrition information available' : 'لا توجد معلومات غذائية متاحة'}</div>`;
    }

    elements.nutritionGrid.innerHTML = nutritionHTML;

    // Activity information (brisk walking)
    if (activityMinutes > 0) {
        const activityHTML = `
            <div class="item-activity">
                <i class="fas fa-walking"></i>
                <div class="activity-details">
                    <div class="activity-name">${currentLanguage === 'en' ? 'Activity' : 'النشاط'}</div>
                    <div class="activity-time">
                        ${currentLanguage === 'en' ? 'Brisk Walking' : 'المشي السريع'}: ${activityMinutes} ${currentLanguage === 'en' ? 'minutes' : 'دقيقة'}
                    </div>
                </div>
            </div>
        `;
        const nutritionContainer = document.querySelector('.item-nutrition-container');
        if (nutritionContainer) {
            nutritionContainer.insertAdjacentHTML('afterend', activityHTML);
        } else {
            document.querySelector('#item-modal .modal-body').insertAdjacentHTML('beforeend', activityHTML);
        }
    }

    bootstrapModal.show();
}

// Format price with the currency icon
function formatPrice(price) {
    return `${price} <img src="${currencyIcon}" alt="SAR" class="currency-icon">`;
}

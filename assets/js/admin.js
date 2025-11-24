// Global variables
let supabaseClient;
let currentUser = null;
let restaurantData = {};
let categories = [];
let menuItems = [];

// DOM elements
const elements = {
    // Auth
    loginScreen: document.getElementById('login-screen'),
    dashboard: document.getElementById('dashboard'),
    emailInput: document.getElementById('email'),
    passwordInput: document.getElementById('password'),
    loginBtn: document.getElementById('login-btn'),
    loginMessage: document.getElementById('login-message'),
    logoutBtn: document.getElementById('logout-btn'),
    
    // Tabs
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // Restaurant
    restaurantForm: document.getElementById('restaurant-form'),
    restaurantNameEn: document.getElementById('restaurant-name-en'),
    restaurantNameAr: document.getElementById('restaurant-name-ar'),
    instagramUrl: document.getElementById('instagram-url'),
    logoUpload: document.getElementById('logo-upload'),
    logoPreview: document.getElementById('logo-preview'),
    coverUpload: document.getElementById('cover-upload'),
    coverPreview: document.getElementById('cover-preview'),
    defaultLang: document.getElementById('default-lang'),
    restaurantMessage: document.getElementById('restaurant-message'),
    
    // Categories
    addCategoryBtn: document.getElementById('add-category-btn'),
    categoriesList: document.getElementById('categories-list'),
    categoryModal: document.getElementById('category-modal'),
    categoryModalTitle: document.getElementById('category-modal-title'),
    categoryForm: document.getElementById('category-form'),
    categoryId: document.getElementById('category-id'),
    categoryNameEn: document.getElementById('category-name-en'),
    categoryNameAr: document.getElementById('category-name-ar'),
    categoryImage: document.getElementById('category-image'),
    categoryImagePreview: document.getElementById('category-image-preview'),
    categorySortOrder: document.getElementById('category-sort-order'),
    categoryMessage: document.getElementById('category-message'),
    
    // Menu Items
    addItemBtn: document.getElementById('add-item-btn'),
    itemCategoryFilter: document.getElementById('item-category-filter'),
    menuItemsList: document.getElementById('menu-items-list'),
    itemModal: document.getElementById('item-modal'),
    itemModalTitle: document.getElementById('item-modal-title'),
    itemForm: document.getElementById('item-form'),
    itemId: document.getElementById('item-id'),
    itemCategory: document.getElementById('item-category'),
    itemNameEn: document.getElementById('item-name-en'),
    itemNameAr: document.getElementById('item-name-ar'),
    itemPrice: document.getElementById('item-price'),
    itemCalories: document.getElementById('item-calories'),
    // itemAllergens: document.getElementById('item-allergens'),
    itemIngredients: document.getElementById('item-ingredients'),
    itemIngredientsAr: document.getElementById('item-ingredients-ar'), // Add this line
    itemImage: document.getElementById('item-image'),
    itemImagePreview: document.getElementById('item-image-preview'),
    itemVisible: document.getElementById('item-visible'),
    itemMessage: document.getElementById('item-message'),
    itemProtein: document.getElementById('item-protein'),
itemCarbs: document.getElementById('item-carbs'),
itemFat: document.getElementById('item-fat'),
temTransFat: document.getElementById('item-trans-fat'),
itemSaturatedFat: document.getElementById('item-saturated-fat'),
itemDietaryFiber: document.getElementById('item-dietary-fiber'),
itemCholesterol: document.getElementById('item-cholesterol'),
itemAddedSugars: document.getElementById('item-added-sugars'),
itemTotalSugars: document.getElementById('item-total-sugars'),
itemPolyols: document.getElementById('item-polyols'),
itemSodium: document.getElementById('item-sodium'),
itemSalt: document.getElementById('item-salt'),
itemCaffeine: document.getElementById('item-caffeine'),
allergenGluten: document.getElementById('allergen-gluten'),
allergenDairy: document.getElementById('allergen-dairy'),
allergenEggs: document.getElementById('allergen-eggs'),
allergenMustard: document.getElementById('allergen-mustard'),
allergenSesame: document.getElementById('allergen-sesame'),

    
    // Notification
    notification: document.getElementById('notification'),
    notificationMessage: document.getElementById('notification-message'),
    notificationClose: document.getElementById('notification-close')
};

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Supabase
    supabaseClient = initializeSupabase();
    
    if (!supabaseClient) {
        showNotification('Error initializing application', 'error');
        return;
    }
    
    // Check for existing session
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
        currentUser = session.user;
        showDashboard();
    } else {
        showLoginScreen();
    }
    
    // Setup event listeners
    setupEventListeners();
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

// Setup event listeners
function setupEventListeners() {
    // Auth
    elements.loginBtn.addEventListener('click', handleLogin);
    elements.logoutBtn.addEventListener('click', handleLogout);
    
    // Tabs
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Restaurant
    elements.restaurantForm.addEventListener('submit', handleRestaurantSubmit);
    elements.logoUpload.addEventListener('change', (e) => previewImage(e, elements.logoPreview));
    elements.coverUpload.addEventListener('change', (e) => previewImage(e, elements.coverPreview));
    
    // Categories
    elements.addCategoryBtn.addEventListener('click', () => openCategoryModal());
    elements.categoryForm.addEventListener('submit', handleCategorySubmit);
    elements.categoryImage.addEventListener('change', (e) => previewImage(e, elements.categoryImagePreview));
    
    // Menu Items
    elements.addItemBtn.addEventListener('click', () => openItemModal());
    elements.itemCategoryFilter.addEventListener('change', filterMenuItems);
    elements.itemForm.addEventListener('submit', handleItemSubmit);
    elements.itemImage.addEventListener('change', (e) => previewImage(e, elements.itemImagePreview));
    
    // Modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });
    
    // Notification
    elements.notificationClose.addEventListener('click', () => {
        elements.notification.classList.add('hidden');
    });
}

// Show login screen
function showLoginScreen() {
    elements.loginScreen.classList.remove('hidden');
    elements.dashboard.classList.add('hidden');
}

// Show dashboard
async function showDashboard() {
    elements.loginScreen.classList.add('hidden');
    elements.dashboard.classList.remove('hidden');
    
    // Load data
    await loadRestaurantData();
    await loadCategories();
    await loadMenuItems();
    
    // Render data
    renderRestaurantData();
    renderCategories();
    renderMenuItems();
    populateItemCategoryFilter();
    populateItemCategorySelect();
}

// Handle login
async function handleLogin() {
    if (!supabaseClient) {
        showNotification('Supabase client not initialized', 'error');
        return;
    }
    
    const email = elements.emailInput.value.trim();
    const password = elements.passwordInput.value.trim();
    
    if (!email || !password) {
        showLoginMessage('Please enter both email and password', 'error');
        return;
    }
    
    try {
        elements.loginBtn.innerHTML = '<span class="loading"></span>';
        elements.loginBtn.disabled = true;
        
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            throw error;
        }
        
        currentUser = data.user;
        showDashboard();
        showNotification('Login successful', 'success');
    } catch (error) {
        console.error('Login error:', error);
        showLoginMessage('Invalid email or password', 'error');
    } finally {
        elements.loginBtn.innerHTML = 'Login';
        elements.loginBtn.disabled = false;
    }
}

// Handle logout
async function handleLogout() {
    if (!supabaseClient) {
        showNotification('Supabase client not initialized', 'error');
        return;
    }
    
    try {
        await supabaseClient.auth.signOut();
        currentUser = null;
        showLoginScreen();
        showNotification('Logged out successfully', 'success');
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Error logging out', 'error');
    }
}

// Show login message
function showLoginMessage(message, type) {
    elements.loginMessage.textContent = message;
    elements.loginMessage.className = `message ${type}`;
}

// Switch tab
function switchTab(tabName) {
    // Update tab buttons
    elements.tabBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update tab contents
    elements.tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${tabName}-tab`) {
            content.classList.add('active');
        }
    });
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
    } catch (error) {
        console.error('Error loading restaurant data:', error);
        showNotification('Error loading restaurant data', 'error');
    }
}

// Render restaurant data
function renderRestaurantData() {
    elements.restaurantNameEn.value = restaurantData.name_en || '';
    elements.restaurantNameAr.value = restaurantData.name_ar || '';
    elements.instagramUrl.value = restaurantData.instagram_url || '';
    elements.defaultLang.value = restaurantData.lang_default || 'en';
    
    // Show logo and cover previews
    if (restaurantData.logo_image) {
        elements.logoPreview.innerHTML = `<img src="${restaurantData.logo_image}" alt="Logo Preview">`;
    }
    
    if (restaurantData.cover_image) {
        elements.coverPreview.innerHTML = `<img src="${restaurantData.cover_image}" alt="Cover Preview">`;
    }
}

// Handle restaurant form submit
async function handleRestaurantSubmit(e) {
    e.preventDefault();
    
    if (!supabaseClient) {
        showNotification('Supabase client not initialized', 'error');
        return;
    }
    
    try {
        elements.restaurantForm.querySelector('button[type="submit"]').innerHTML = '<span class="loading"></span>';
        elements.restaurantForm.querySelector('button[type="submit"]').disabled = true;
        
        // Upload logo if changed
        let logoUrl = restaurantData.logo_image;
        if (elements.logoUpload.files.length > 0) {
            logoUrl = await uploadImage(elements.logoUpload.files[0]);
        }
        
        // Upload cover if changed
        let coverUrl = restaurantData.cover_image;
        if (elements.coverUpload.files.length > 0) {
            coverUrl = await uploadImage(elements.coverUpload.files[0]);
        }
        
        // Update restaurant data
        const updatedData = {
            name_en: elements.restaurantNameEn.value,
            name_ar: elements.restaurantNameAr.value,
            instagram_url: elements.instagramUrl.value,
            logo_image: logoUrl,
            cover_image: coverUrl,
            lang_default: elements.defaultLang.value
        };
        
        // Update in Supabase
        const { data, error } = await supabaseClient
            .from('restaurants')
            .update(updatedData)
            .eq('id', restaurantData.id);
            
        if (error) {
            throw error;
        }
        
        // Update local data
        restaurantData = { ...restaurantData, ...updatedData };
        
        // Show success message
        showFormMessage(elements.restaurantMessage, 'Restaurant settings updated successfully', 'success');
        showNotification('Restaurant settings updated successfully', 'success');
    } catch (error) {
        console.error('Error updating restaurant data:', error);
        showFormMessage(elements.restaurantMessage, 'Error updating restaurant settings', 'error');
        showNotification('Error updating restaurant settings', 'error');
    } finally {
        elements.restaurantForm.querySelector('button[type="submit"]').innerHTML = 'Save Changes';
        elements.restaurantForm.querySelector('button[type="submit"]').disabled = false;
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

// Render categories
function renderCategories() {
    elements.categoriesList.innerHTML = '';
    
    if (categories.length === 0) {
        elements.categoriesList.innerHTML = `
            <div class="no-items">
                <p>No categories found</p>
            </div>
        `;
        return;
    }
    
    categories.forEach(category => {
        const item = document.createElement('div');
        item.className = 'admin-list-item';
        item.innerHTML = `
            <div class="admin-list-item-info">
                <div class="admin-list-item-name">${category.name_en} / ${category.name_ar}</div>
                <div class="admin-list-item-meta">Sort Order: ${category.sort_order}</div>
            </div>
            <div class="admin-list-item-actions">
                <button class="btn-icon edit" data-id="${category.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete" data-id="${category.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners
        item.querySelector('.edit').addEventListener('click', () => editCategory(category.id));
        item.querySelector('.delete').addEventListener('click', () => deleteCategory(category.id));
        
        elements.categoriesList.appendChild(item);
    });
}

// Open category modal
function openCategoryModal(categoryId = null) {
    // Reset form
    elements.categoryForm.reset();
    elements.categoryMessage.textContent = '';
    elements.categoryMessage.className = 'message';
    elements.categoryImagePreview.innerHTML = '';
    
    if (categoryId) {
        // Edit mode
        const category = categories.find(c => c.id === categoryId);
        if (category) {
            elements.categoryModalTitle.textContent = 'Edit Category';
            elements.categoryId.value = category.id;
            elements.categoryNameEn.value = category.name_en;
            elements.categoryNameAr.value = category.name_ar;
            elements.categorySortOrder.value = category.sort_order;
            
            // Show image preview
            if (category.image_url) {
                elements.categoryImagePreview.innerHTML = `<img src="${category.image_url}" alt="Category Image Preview">`;
            }
        }
    } else {
        // Add mode
        elements.categoryModalTitle.textContent = 'Add Category';
        elements.categoryId.value = '';
    }
    
    // Show modal
    elements.categoryModal.style.display = 'block';
}

// Edit category
function editCategory(categoryId) {
    openCategoryModal(categoryId);
}

// Handle category form submit
async function handleCategorySubmit(e) {
    e.preventDefault();
    
    if (!supabaseClient) {
        showNotification('Supabase client not initialized', 'error');
        return;
    }
    
    const categoryId = elements.categoryId.value;
    const categoryData = {
        restaurant_id: restaurantData.id,
        name_en: elements.categoryNameEn.value,
        name_ar: elements.categoryNameAr.value,
        sort_order: parseInt(elements.categorySortOrder.value) || 0
    };
    
    try {
        elements.categoryForm.querySelector('button[type="submit"]').innerHTML = '<span class="loading"></span>';
        elements.categoryForm.querySelector('button[type="submit"]').disabled = true;
        
        // Upload image if changed
        if (elements.categoryImage.files.length > 0) {
            categoryData.image_url = await uploadImage(elements.categoryImage.files[0]);
        } else if (!categoryId) {
            // New category must have an image
            throw new Error('Please upload an image for the category');
        }
        
        if (categoryId) {
            // Update existing category
            const { data, error } = await supabaseClient
                .from('categories')
                .update(categoryData)
                .eq('id', categoryId);
                
            if (error) {
                throw error;
            }
            
            showFormMessage(elements.categoryMessage, 'Category updated successfully', 'success');
            showNotification('Category updated successfully', 'success');
        } else {
            // Add new category
            const { data, error } = await supabaseClient
                .from('categories')
                .insert([categoryData]);
                
            if (error) {
                throw error;
            }
            
            showFormMessage(elements.categoryMessage, 'Category added successfully', 'success');
            showNotification('Category added successfully', 'success');
        }
        
        // Reload categories
        await loadCategories();
        
        // Re-render categories
        renderCategories();
        
        // Update category selects in menu items
        populateItemCategoryFilter();
        populateItemCategorySelect();
        
        // Close modal
        elements.categoryModal.style.display = 'none';
    } catch (error) {
        console.error('Error saving category:', error);
        showFormMessage(elements.categoryMessage, `Error saving category: ${error.message}`, 'error');
        showNotification(`Error saving category: ${error.message}`, 'error');
    } finally {
        elements.categoryForm.querySelector('button[type="submit"]').innerHTML = 'Save Category';
        elements.categoryForm.querySelector('button[type="submit"]').disabled = false;
    }
}

// Delete category
async function deleteCategory(categoryId) {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
        return;
    }
    
    if (!supabaseClient) {
        showNotification('Supabase client not initialized', 'error');
        return;
    }
    
    try {
        // Delete from Supabase
        const { data, error } = await supabaseClient
            .from('categories')
            .delete()
            .eq('id', categoryId);
            
        if (error) {
            throw error;
        }
        
        // Reload categories
        await loadCategories();
        
        // Re-render categories
        renderCategories();
        
        // Update category selects in menu items
        populateItemCategoryFilter();
        populateItemCategorySelect();
        
        showNotification('Category deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting category:', error);
        showNotification('Error deleting category', 'error');
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
            .select('*');
            
        if (error) {
            throw error;
        }
        
        menuItems = data;
    } catch (error) {
        console.error('Error loading menu items:', error);
        showNotification('Error loading menu items', 'error');
    }
}

// Render menu items
function renderMenuItems(filterCategoryId = 'all') {
    elements.menuItemsList.innerHTML = '';
    
    // Filter items by category if specified
    let itemsToRender = menuItems;
    if (filterCategoryId !== 'all') {
        itemsToRender = menuItems.filter(item => item.category_id === filterCategoryId);
    }
    
    if (itemsToRender.length === 0) {
        elements.menuItemsList.innerHTML = `
            <div class="no-items">
                <p>No menu items found</p>
            </div>
        `;
        return;
    }
    
    itemsToRender.forEach(item => {
        const category = categories.find(c => c.id === item.category_id);
        const categoryName = category ? category.name_en : 'Unknown';
        
        const listItem = document.createElement('div');
        listItem.className = 'admin-list-item';
        listItem.innerHTML = `
            <div class="admin-list-item-info">
                <div class="admin-list-item-name">${item.name_en} / ${item.name_ar}</div>
                <div class="admin-list-item-meta">
                    ${categoryName} • ${item.price} SAR • ${item.calories} cal • ${item.visible ? 'Visible' : 'Hidden'}
                </div>
            </div>
            <div class="admin-list-item-actions">
                <button class="btn-icon edit" data-id="${item.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners
        const editBtn = listItem.querySelector('.edit');
        const deleteBtn = listItem.querySelector('.delete');
        
        editBtn.addEventListener('click', () => {
            const itemId = editBtn.getAttribute('data-id');
            openItemModal(itemId);
        });
        
        deleteBtn.addEventListener('click', () => {
            const itemId = deleteBtn.getAttribute('data-id');
            deleteMenuItem(itemId);
        });
        
        elements.menuItemsList.appendChild(listItem);
    });
}


// Filter menu items
function filterMenuItems() {
    const categoryId = elements.itemCategoryFilter.value;
    renderMenuItems(categoryId);
}

// Populate item category filter
function populateItemCategoryFilter() {
    elements.itemCategoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name_en;
        elements.itemCategoryFilter.appendChild(option);
    });
}

// Populate item category select
function populateItemCategorySelect() {
    elements.itemCategory.innerHTML = '';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name_en;
        elements.itemCategory.appendChild(option);
    });
}

// Open item modal
// Open item modal
function openItemModal(itemId = null) {
    // Reset form
    elements.itemForm.reset();
    elements.itemMessage.textContent = '';
    elements.itemMessage.className = 'message';
    elements.itemImagePreview.innerHTML = '';
    
    // Reset nutrition fields to default values
    const nutritionFields = [
        'itemProtein', 'itemCarbs', 'itemFat', 'itemTransFat', 'itemSaturatedFat',
        'itemDietaryFiber', 'itemCholesterol', 'itemAddedSugars', 'itemTotalSugars',
        'itemPolyols', 'itemSodium', 'itemSalt', 'itemCaffeine'
    ];
    
    nutritionFields.forEach(field => {
        if (elements[field]) {
            elements[field].value = 0;
        }
    });
    
    // Reset allergen checkboxes
    const allergenFields = [
        'allergenGluten', 'allergenDairy', 'allergenEggs', 
        'allergenMustard', 'allergenSesame'
    ];
    
    allergenFields.forEach(field => {
        if (elements[field]) {
            elements[field].checked = false;
        }
    });
    
    if (itemId) {
        // Edit mode
        const item = menuItems.find(i => i.id === itemId);
        if (item) {
            elements.itemModalTitle.textContent = 'Edit Menu Item';
            elements.itemId.value = item.id;
            elements.itemCategory.value = item.category_id;
            elements.itemNameEn.value = item.name_en;
            elements.itemNameAr.value = item.name_ar;
            elements.itemPrice.value = item.price;
            elements.itemCalories.value = item.calories;
            // elements.itemAllergens.value = item.allergens || '';
            elements.itemIngredients.value = item.ingredients || '';
            elements.itemIngredientsAr.value = item.ingredients_ar || '';
            elements.itemVisible.checked = item.visible;
            
            // Set nutrition fields if they exist
            if (elements.itemProtein) elements.itemProtein.value = item.protein || 0;
            if (elements.itemCarbs) elements.itemCarbs.value = item.carbs || 0;
            if (elements.itemFat) elements.itemFat.value = item.fat || 0;
            if (elements.itemTransFat) elements.itemTransFat.value = item.trans_fat || 0;
            if (elements.itemSaturatedFat) elements.itemSaturatedFat.value = item.saturated_fat || 0;
            if (elements.itemDietaryFiber) elements.itemDietaryFiber.value = item.dietary_fiber || 0;
            if (elements.itemCholesterol) elements.itemCholesterol.value = item.cholesterol || 0;
            if (elements.itemAddedSugars) elements.itemAddedSugars.value = item.added_sugars || 0;
            if (elements.itemTotalSugars) elements.itemTotalSugars.value = item.total_sugars || 0;
            if (elements.itemPolyols) elements.itemPolyols.value = item.polyols || 0;
            if (elements.itemSodium) elements.itemSodium.value = item.sodium || 0;
            if (elements.itemSalt) elements.itemSalt.value = item.salt || 0;
            if (elements.itemCaffeine) elements.itemCaffeine.value = item.caffeine || 0;
            
            // Set allergen checkboxes
            if (elements.allergenGluten) elements.allergenGluten.checked = item.allergen_gluten || false;
            if (elements.allergenDairy) elements.allergenDairy.checked = item.allergen_dairy || false;
            if (elements.allergenEggs) elements.allergenEggs.checked = item.allergen_eggs || false;
            if (elements.allergenMustard) elements.allergenMustard.checked = item.allergen_mustard || false;
            if (elements.allergenSesame) elements.allergenSesame.checked = item.allergen_sesame || false;
            
            // Show image preview
            if (item.image_url) {
                elements.itemImagePreview.innerHTML = `<img src="${item.image_url}" alt="Item Image Preview">`;
            }
        }
    } else {
        // Add mode
        elements.itemModalTitle.textContent = 'Add Menu Item';
        elements.itemId.value = '';
    }
    
    // Show modal
    elements.itemModal.style.display = 'block';
}

// Update handleItemSubmit function
async function handleItemSubmit(e) {
    e.preventDefault();
    
    if (!supabaseClient) {
        showNotification('Supabase client not initialized', 'error');
        return;
    }
    
    const itemId = elements.itemId.value;
    const itemData = {
        category_id: elements.itemCategory.value,
        name_en: elements.itemNameEn.value,
        name_ar: elements.itemNameAr.value,
        price: parseFloat(elements.itemPrice.value),
        calories: parseInt(elements.itemCalories.value) || 0,
        // allergens: elements.itemAllergens.value || '',
        ingredients: elements.itemIngredients.value || '',
        ingredients_ar: elements.itemIngredientsAr.value || '',
        protein: elements.itemProtein ? parseInt(elements.itemProtein.value) || 0 : 0,
        carbs: elements.itemCarbs ? parseInt(elements.itemCarbs.value) || 0 : 0,
        fat: elements.itemFat ? parseInt(elements.itemFat.value) || 0 : 0,
        trans_fat: elements.itemTransFat ? parseInt(elements.itemTransFat.value) || 0 : 0,
        saturated_fat: elements.itemSaturatedFat ? parseInt(elements.itemSaturatedFat.value) || 0 : 0,
        dietary_fiber: elements.itemDietaryFiber ? parseInt(elements.itemDietaryFiber.value) || 0 : 0,
        cholesterol: elements.itemCholesterol ? parseInt(elements.itemCholesterol.value) || 0 : 0,
        added_sugars: elements.itemAddedSugars ? parseInt(elements.itemAddedSugars.value) || 0 : 0,
        total_sugars: elements.itemTotalSugars ? parseInt(elements.itemTotalSugars.value) || 0 : 0,
        polyols: elements.itemPolyols ? parseInt(elements.itemPolyols.value) || 0 : 0,
        sodium: elements.itemSodium ? parseInt(elements.itemSodium.value) || 0 : 0,
        salt: elements.itemSalt ? parseInt(elements.itemSalt.value) || 0 : 0,
        caffeine: elements.itemCaffeine ? parseInt(elements.itemCaffeine.value) || 0 : 0,
        allergen_gluten: elements.allergenGluten ? elements.allergenGluten.checked : false,
        allergen_dairy: elements.allergenDairy ? elements.allergenDairy.checked : false,
        allergen_eggs: elements.allergenEggs ? elements.allergenEggs.checked : false,
        allergen_mustard: elements.allergenMustard ? elements.allergenMustard.checked : false,
        allergen_sesame: elements.allergenSesame ? elements.allergenSesame.checked : false,
        visible: elements.itemVisible.checked
    };
    
    try {
        elements.itemForm.querySelector('button[type="submit"]').innerHTML = '<span class="loading"></span>';
        elements.itemForm.querySelector('button[type="submit"]').disabled = true;
        
        // Upload image if changed
        if (elements.itemImage.files.length > 0) {
            itemData.image_url = await uploadImage(elements.itemImage.files[0]);
        } else if (!itemId) {
            // New item must have an image
            throw new Error('Please upload an image for the menu item');
        }
        
        if (itemId) {
            // Update existing item
            const { data, error } = await supabaseClient
                .from('items')
                .update(itemData)
                .eq('id', itemId);
                
            if (error) {
                throw error;
            }
            
            showFormMessage(elements.itemMessage, 'Menu item updated successfully', 'success');
            showNotification('Menu item updated successfully', 'success');
        } else {
            // Add new item
            const { data, error } = await supabaseClient
                .from('items')
                .insert([itemData]);
                
            if (error) {
                throw error;
            }
            
            showFormMessage(elements.itemMessage, 'Menu item added successfully', 'success');
            showNotification('Menu item added successfully', 'success');
        }
        
        // Reload menu items
        await loadMenuItems();
        
        // Re-render menu items
        renderMenuItems(elements.itemCategoryFilter.value);
        
        // Close modal
        elements.itemModal.style.display = 'none';
    } catch (error) {
        console.error('Error saving menu item:', error);
        showFormMessage(elements.itemMessage, `Error saving menu item: ${error.message}`, 'error');
        showNotification(`Error saving menu item: ${error.message}`, 'error');
    } finally {
        elements.itemForm.querySelector('button[type="submit"]').innerHTML = 'Save Item';
        elements.itemForm.querySelector('button[type="submit"]').disabled = false;
    }
}

// Delete menu item
async function deleteMenuItem(itemId) {
    if (!confirm('Are you sure you want to delete this menu item? This action cannot be undone.')) {
        return;
    }
    
    if (!supabaseClient) {
        showNotification('Supabase client not initialized', 'error');
        return;
    }
    
    try {
        // Delete from Supabase
        const { data, error } = await supabaseClient
            .from('items')
            .delete()
            .eq('id', itemId);
            
        if (error) {
            throw error;
        }
        
        // Reload menu items
        await loadMenuItems();
        
        // Re-render menu items
        renderMenuItems(elements.itemCategoryFilter.value);
        
        showNotification('Menu item deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting menu item:', error);
        showNotification('Error deleting menu item', 'error');
    }
}

// Preview image
function previewImage(event, previewContainer) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewContainer.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        }
        reader.readAsDataURL(file);
    }
}

// Upload image to Cloudinary
async function uploadImage(file) {
    // For production, replace with your actual Cloudinary credentials
    const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/djuelps5b/image/upload';
    const UPLOAD_PRESET = 'qr-menu';
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    
    try {
        const response = await fetch(CLOUDINARY_URL, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }
        
        return data.secure_url;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload image');
    }
}

// Show form message
function showFormMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
}

// Show notification
function showNotification(message, type = 'info') {
    elements.notificationMessage.textContent = message;
    elements.notification.className = 'notification';
    
    // Update notification style based on type
    if (type === 'error') {
        elements.notification.style.backgroundColor = 'rgba(231, 76, 60, 0.9)';
    } else if (type === 'success') {
        elements.notification.style.backgroundColor = 'rgba(39, 174, 96, 0.9)';
    } else {
        elements.notification.style.backgroundColor = 'rgba(52, 152, 219, 0.9)';
    }
    
    // Show notification
    elements.notification.classList.remove('hidden');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        elements.notification.classList.add('hidden');
    }, 3000);
}
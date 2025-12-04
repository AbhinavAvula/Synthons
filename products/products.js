//Sanitization function to prevent XSS
function sanitizeHTML(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

//Validate and sanitize URL parameters
function getValidURLParam(paramName, maxLength = 100) {
  const urlParams = new URLSearchParams(window.location.search);
  const param = urlParams.get(paramName);
  if (!param) return null;
  
  // Trim and limit length
  return sanitizeHTML(param.trim().substring(0, maxLength));
}

// Read URL parameters safely
const selectedCategoryFromURL = getValidURLParam('category', 50);
const searchFromURL = getValidURLParam('search', 100);

// products.js
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const tableBody = document.querySelector('#productsTable tbody');
let products = [];

// 1. Fetch and load CSV data
fetch('../products/products.csv')
  .then(response => response.text())
  .then(data => {
    const rows = data.trim().split('\n');
    const headers = rows.shift().split(',');

    products = rows.map(row => {
      const values = row.split(',');
      return {
        //Sanitize all product data
        name: sanitizeHTML(values[0] || ''),
        category: sanitizeHTML(values[1] || ''),
        description: sanitizeHTML(values[2] || ''),
        price: sanitizeHTML(values[3] || '')
      };
    });

    populateTable(products);
    populateCategoryFilter(products);

    if (searchFromURL) {
      searchInput.value = searchFromURL;
      filterProducts();
    }
  })
  .catch(error => {
    console.error('Error loading products:', error);
    tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Unable to load products. Please try again later.</td></tr>';
  });

// 2. Populate Table
function populateTable(list) {
  tableBody.innerHTML = '';

  //Handle empty results
  if (list.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No products found.</td></tr>';
    return;
  }

  list.forEach(item => {
    const tr = document.createElement('tr');

   //Use textContent instead of innerHTML for security
    const nameTd = document.createElement('td');
    nameTd.textContent = item.name;
    
    const categoryTd = document.createElement('td');
    categoryTd.textContent = item.category;
    
    const descriptionTd = document.createElement('td');
    descriptionTd.textContent = item.description;
    
    const priceTd = document.createElement('td');
    priceTd.textContent = item.price;
    
    tr.appendChild(nameTd);
    tr.appendChild(categoryTd);
    tr.appendChild(descriptionTd);
    tr.appendChild(priceTd);
    
    tableBody.appendChild(tr);
  });
}


// 3. Populate Category Filter
function populateCategoryFilter(data) {
  const categories = [...new Set(data.map(item => item.category))];
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
  if (selectedCategoryFromURL) {
    categoryFilter.value = selectedCategoryFromURL;
    filterProducts(); // Automatically filter the table
  }
}

// 4. Search and Filter Logic
function filterProducts() {
  const searchValue = sanitizeHTML(searchInput.value).toLowerCase().trim();
  const selectedCategory = categoryFilter.value;

  const filtered = products.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchValue);
    const matchCategory = selectedCategory === '' || item.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  populateTable(filtered);
}

searchInput.addEventListener('input', filterProducts);
categoryFilter.addEventListener('change', filterProducts);

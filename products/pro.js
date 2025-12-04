// Read URL parameters
const urlParams = new URLSearchParams(window.location.search);
const selectedCategoryFromURL = urlParams.get('category');
const searchFromURL = urlParams.get('search');

// products.js
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const tableBody = document.querySelector('#productsTable tbody');
let products = [];

// 1. Fetch and load Excel data
fetch('../products/pro.xlsx')
  .then(response => response.arrayBuffer())
  .then(data => {
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

    // Expected columns: ProductName, CAS No., Category, Purity
    products = jsonData.map(row => ({
        name: row['ProductName'] || '',
        cas: row['CAS No.'] || '',
        category: row['Category'] || '',
        purity: formatPurity(row['Purity'])
    }));

    // Helper function to convert decimals (like 0.97) into percentages (97%)
    function formatPurity(value) {
        if (typeof value === 'number') {
            return (value * 100).toFixed(0) + '%';
        }
        // If it's already a string with %, return as is
        if (typeof value === 'string' && value.includes('%')) {
            return value.trim();
        }
        return value || '';
    }

    populateTable(products);
    populateCategoryFilter(products);

    if (searchFromURL) {
      searchInput.value = searchFromURL;
      filterProducts();
    }
  })
  .catch(error => console.error('Error loading Excel file:', error));

// 2. Populate Table
function populateTable(list) {
  tableBody.innerHTML = '';
  list.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.cas}</td>
      <td>${item.category}</td>
      <td>${item.purity}</td>
    `;
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
    filterProducts();
  }
}

// 4. Search and Filter Logic
function filterProducts() {
  const searchValue = searchInput.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;

  const filtered = products.filter(item => {
    // Ensure both name and CAS are treated as strings
    const name = (item.name || '').toLowerCase();
    const cas = String(item.cas || '').toLowerCase();

    const matchSearch =
      name.includes(searchValue) || cas.includes(searchValue);

    const matchCategory =
      selectedCategory === '' || item.category === selectedCategory;

    return matchSearch && matchCategory;
  });

  populateTable(filtered);
}
searchInput.addEventListener('input', filterProducts);
categoryFilter.addEventListener('change', filterProducts);

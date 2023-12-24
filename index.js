const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

const apiUrl = 'https://s3.amazonaws.com/open-to-cors/assignment.json';

async function fetchData() {
  try {
    const response = await axios.get(apiUrl);
    const productsObject = response.data.products;
    const products = Object.values(productsObject);

    const sortedProducts = products.sort((a, b) => b.popularity - a.popularity);

    return sortedProducts;
  } catch (error) {
    console.error('Error fetching data:', error.message);
    throw error;
  }
}

app.get('/', async (req, res) => {
  try {
    const html = `
      <html>
        <head>
          <title>Product List</title>
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 20px;
              background-color: black;
              color: white;
              display: flex;
              flex-direction: column;
              align-items: center;
            }

            h1 {
              color: #17a2b8;
            }

            .button-container {
              margin-top: 20px;
              display: flex;
              gap: 20px;
            }

            .toggle-button {
              background-color: #17a2b8;
              color: white;
              border: none;
              padding: 10px 20px;
              cursor: pointer;
              font-size: 16px;
            }

            ul {
              list-style-type: none;
              padding: 0;
              margin: 0;
            }

            li {
              margin: 5px 0;
              cursor: pointer;
              position: relative;
              transition: background-color 0.3s;
            }

            li:hover {
              background-color: #343a40; 
            }

            .product-details {
              display: none;
              position: absolute;
              top: 0;
              left: 100%;
              background-color: #343a40;
              border: 1px solid #495057;
              padding: 10px;
              z-index: 1;
              width: 250px;
              transition: opacity 0.3s ease-in-out;
            }

            li:hover .product-details {
              display: block;
              opacity: 1;
            }

            @keyframes fadeInRight {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }

            .product-table {
              display: none;
              width: 70%;
              border-collapse: collapse;
              margin-top: 20px;
              border: 1px solid #ddd;
              background-color: #343a40;
              animation: fadeIn 1s ease-out forwards;
            }

            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }

            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }

            th {
              background-color: #495057;
            }

            tr:nth-child(even) {
              background-color: #495057;
            }

            tr:hover {
              background-color: #343a40;
            }

            .sub-data {
              display: none;
              position: absolute;
              top: 0;
              left: 100%;
              background-color: #343a40;
              border: 1px solid #495057;
              padding: 10px;
              z-index: 1;
              width: 250px;
              opacity: 0;
              transition: opacity 0.3s ease-in-out;
            }

            li:hover .sub-data {
              display: block;
              opacity: 1;
            }
          </style>
        </head>
        <body>
          <h1>Product List</h1>
          <div class="button-container">
            <button class="toggle-button" onclick="showTable()">Show Table</button>
            <button class="toggle-button" onclick="location.href = './index';">Show Product Names</button>
          </div>
          <ul id="productList"></ul>
          <table class="product-table" id="dataTable">
            <thead>
              <tr>
                <th>Title</th>
                <th>Subcategory</th>
                <th>Price</th>
                <th>Popularity</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
          <script>
            async function fetchData() {
              try {
                const response = await fetch('${apiUrl}');
                const data = await response.json();
                const productsObject = data.products;
                const products = Object.values(productsObject);
                return products.sort((a, b) => b.popularity - a.popularity);
              } catch (error) {
                console.error('Error fetching data:', error.message);
                throw error;
              }
            }

            async function showTable() {
              const productList = document.getElementById('productList');
              const table = document.getElementById('dataTable');
              const tbody = table.querySelector('tbody');

              // Clear existing content
              productList.innerHTML = '';
              tbody.innerHTML = '';
              const sortedProducts = await fetchData();

              sortedProducts.forEach(product => {
                // Create list item with hover details
                const li = document.createElement('li');
                li.innerText = product.title;
                li.onmouseenter = () => showProductDetails(li, product.title, product.price, product.popularity, product.subcategory);
                li.onmouseleave = () => hideProductDetails(li);

                productList.appendChild(li);

                const tr = document.createElement('tr');
                const tdTitle = document.createElement('td');
                const tdSubcategory = document.createElement('td');
                const tdPrice = document.createElement('td');
                const tdPopularity = document.createElement('td');

                // Populate table cells
                tdTitle.innerText = product.title;
                tdSubcategory.innerText = product.subcategory;
                tdPrice.innerText = '$' + product.price;
                tdPopularity.innerText = product.popularity;

                // Append cells to the table row
                tr.appendChild(tdTitle);
                tr.appendChild(tdSubcategory);
                tr.appendChild(tdPrice);
                tr.appendChild(tdPopularity);

                tbody.appendChild(tr);
              });

              // Show the table and hide other elements
              table.style.display = 'table';
              productList.style.display = 'none';
            }

            function showProductDetails(element, title, price, popularity, subcategory) {
              const productDetails = element.querySelector('.product-details');
              productDetails.style.display = 'block';

              const details = document.createElement('div');
              details.innerHTML = '<div>Title: ' + title + '</div>' +
                '<div>Price: $' + price + '</div>' +
                '<div>Popularity: ' + popularity + '</div>' +
                '<div>Subcategory: ' + subcategory + '</div>';

              // Show sub data on hover
              element.addEventListener('mouseover', function () {
                const subData = element.querySelector('.sub-data');
                subData.style.display = 'block';
              });

              element.addEventListener('mouseout', function () {
                const subData = element.querySelector('.sub-data');
                subData.style.display = 'none';
              });
            }

            function hideProductDetails(element) {
              const productDetails = element.querySelector('.product-details');
              productDetails.style.display = 'none';
            }
          </script>
        </body>
      </html>
    `;

    res.send(html);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});






app.get('/index', async (req, res) => {
  try {
    const sortedProducts = await fetchData();

    const html = `
      <html>
        <head>
          <title>Product List</title>
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 20px;
              background-color: black;
              color: white;
              display: flex;
              align-items: center;
            }

            .button-container {
              margin-top: 20px;
              display: flex;
              gap: 20px;
            }

            .toggle-button {
              background-color: #17a2b8;
              color: white;
              border: none;
              padding: 10px 20px;
              cursor: pointer;
              font-size: 16px;
            }

            h1 {
              color: #17a2b8;
              
            }

            ul {
              list-style-type: none;
              padding-top: 5px;
            }

            li {
              margin: 5px 0;
              cursor: pointer;
              position: relative;
              transition: background-color 0.3s;
            }

            li:hover {
              background-color: #343a40;
            }

            .product-details {
              display: none;
              position: absolute;
              top: 0;
              left: 100%;
              background-color: #343a40;
              border: 1px solid #495057;
              padding: 10px;
              z-index: 1;
              width: 250px;
              transition: opacity 0.3s ease-in-out;
            }

            li:hover .product-details {
              display: block;
              opacity: 1;
            }

            .product-table {
              width: 70%;
              border-collapse: collapse;
              margin-right: 20px;
              border: 1px solid #ddd;
              background-color: #343a40;
              opacity: 0;
              animation: fadeIn 1s ease-out forwards;
            }

            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }

            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }

            th {
              background-color: #495057; 
            }

            tr:nth-child(even) {
              background-color: #495057; 
            }

            tr:hover {
              background-color: #343a40;
            }

            .additional-details {
              width: 30%;
              background-color: #343a40;
              padding: 10px;
              opacity: 0;
              animation: fadeInRight 1s ease-out forwards;
            }

            @keyframes fadeInRight {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
          </style>
        </head>
        <body>
        <div style="align-items: center;">
          <h1>Product List</h1>
          <h5>Hover on product to see more details</h5>
          <div class="button-container">
            <button class="toggle-button" onclick="location.href = './';">Back</button>
          </div>
          <ul id="productList">
            ${sortedProducts.map(product => `<li onmouseenter="showProductDetails(this, '${product.title}', '${product.price}', '${product.popularity}', '${product.subcategory}')" onmouseleave="hideProductDetails(this)">
                                              ${product.title}
                                              <div class="product-details">
                                                <div>Price: $${product.price}</div>
                                                <div>Popularity: ${product.popularity}</div>
                                                <div>Subcategory: ${product.subcategory}</div>
                                              </div>
                                            </li>`).join('')}
          </ul>
        </div>
        </body>
        <script>
          function showProductDetails(element, title, price, popularity, subcategory) {
            const productDetails = element.querySelector('.product-details');
            productDetails.style.display = 'block';

            // Display details in the additional-details div
            const additionalDetails = document.querySelector('.additional-details');
            details.innerHTML = '<div>Title: ' + title + '</div>' +
  '<div>Price: $' + price + '</div>' +
  '<div>Popularity: ' + popularity + '</div>' +
  '<div>Subcategory: ' + subcategory + '</div>';

          }

          function hideProductDetails(element) {
            const productDetails = element.querySelector('.product-details');
            productDetails.style.display = 'none';

            // Clear the additional-details div when not hovering
            const additionalDetails = document.querySelector('.additional-details');
            additionalDetails.innerHTML = 'Hover over a product to view details';
          }
        </script>
      </html>
    `;

    res.send(html);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import {
  checkAdminAuth,
  handleAdminLogout,
  handleProfileClick,
} from "./authentication.js";
import { auth, db } from "./firebase-config.js";

// Initialize admin authentication only if not on index page
if (!window.location.pathname.includes("index.html")) {
  checkAdminAuth().catch((error) => {
    console.error("Admin authentication failed:", error);
  });

  // Initialize admin UI handlers
  handleAdminLogout();
  handleProfileClick();
}

// Check authentication state only if not on index page
if (!window.location.pathname.includes("index.html")) {
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      // Redirect to index page if not logged in
      window.location.href = "/index.html";
      return;
    }

    try {
      // Get user details from Firestore
      const userDoc = await getDoc(doc(db, "Users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Check if user belongs to edushop
        if (userData.appID !== "edushop") {
          alert("Unauthorized access");
          window.location.href = "/index.html";
          return;
        }

        // Update user details in the UI
        const userNameElements = document.querySelectorAll(
          "#userName, .d-none.d-lg-inline-flex"
        );
        userNameElements.forEach((element) => {
          if (element) element.textContent = userData.fullName;
        });
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      alert("Error loading user details");
    }
  });
}
if (!window.location.pathname.includes("index.html")) {
  document.getElementById("logoutbtn").addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await auth.signOut();
      window.location.href = "/index.html";
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Error signing out");
    }
  });
}
// Handle logout
if (!window.location.pathname.includes("index.html")) {
  // Handle profile click
  document
    .querySelector('a[href="#"][class="dropdown-item"]')
    .addEventListener("click", (e) => {
      e.preventDefault();
      // Add your profile page navigation logic here
      // window.location.href = "/profile.html";
    });

  (function ($) {
    "use strict";
    if (window.location.pathname == "/addnew.html") {
      const toolbarOptions = [
        ["bold", "italic", "underline", "strike"], // toggled buttons
        ["blockquote", "code-block"],
        ["link", "image", "video", "formula"],

        [{ header: 1 }, { header: 2 }], // custom button values
        [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
        [{ script: "sub" }, { script: "super" }], // superscript/subscript
        [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
        [{ direction: "rtl" }], // text direction

        [{ size: ["small", false, "large", "huge"] }], // custom dropdown
        [{ header: [1, 2, 3, 4, 5, 6, false] }],

        [{ color: [] }, { background: [] }], // dropdown with defaults from theme
        [{ font: [] }],
        [{ align: [] }],

        ["clean"], // remove formatting button
      ];
      const quill = new Quill("#editor", {
        modules: {
          toolbar: toolbarOptions,
        },
        placeholder: "A short description of the product...",
        theme: "snow", // or 'bubble'
      });
      const quill2 = new Quill("#editor2", {
        modules: {
          toolbar: toolbarOptions,
        },
        placeholder: "A long description of the product...",
        theme: "snow",
      });
      document
        .getElementById("featuredImageUploadBtn")
        .addEventListener("change", function (event) {
          const file = event.target.files[0];
          const preview = document.querySelector(".featured-preview");

          if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
              preview.innerHTML = `
                        <img src="${e.target.result}" alt="Featured Preview">
                        <button class="remove-image" onclick="removeFeaturedImage()">&times;</button>
                    `;
            };
            reader.readAsDataURL(file);
          }
        });

      // Other Images Preview
      let otherImagesCount = 0;
      document
        .getElementById("otherImagesUploadBtn")
        .addEventListener("change", function (event) {
          const files = event.target.files;
          const container = document.querySelector(".other-images-container");

          if (otherImagesCount >= 3) {
            alert("Maximum 3 images allowed");
            return;
          }

          for (let file of files) {
            if (otherImagesCount >= 3) break;

            const reader = new FileReader();
            reader.onload = function (e) {
              const previewDiv = document.createElement("div");
              previewDiv.className = "other-image-preview";
              previewDiv.innerHTML = `
                        <img src="${e.target.result}" alt="Other Preview">
                        <button class="remove-image" onclick="removeOtherImage(this)">&times;</button>
                    `;
              container.appendChild(previewDiv);
              otherImagesCount++;
            };
            reader.readAsDataURL(file);
          }
        });

      function removeFeaturedImage() {
        document.querySelector(".featured-preview").innerHTML = "";
        document.getElementById("featuredImageUploadBtn").value = "";
      }

      function removeOtherImage(button) {
        button.parentElement.remove();
        otherImagesCount--;
      }

      // Generate product code
      async function generateProductCode() {
        try {
          const productsRef = collection(db, "products");
          const q = query(productsRef, orderBy("createdAt", "desc"), limit(1));
          const querySnapshot = await getDocs(q);

          let lastCode = "KH31-0000";
          if (!querySnapshot.empty) {
            const lastProduct = querySnapshot.docs[0].data();
            lastCode = lastProduct.productCode || "KH31-0000";
          }

          const num = parseInt(lastCode.split("-")[1]) + 1;
          const newCode = `KH31-${num.toString().padStart(4, "0")}`;
          document.getElementById("productCode").value = newCode;
          return newCode;
        } catch (error) {
          console.error("Error generating product code:", error);
          return null;
        }
      }

      // Initialize product code on page load
      generateProductCode();

      // Handle product creation
      document
        .getElementById("saveProductBtn")
        .addEventListener("click", async () => {
          try {
            // Get form values
            const productData = {
              name: document.getElementById("productName").value,
              category: document.getElementById("productCategory").value,
              brandName: document.getElementById("brandName").value || null,
              productCode: document.getElementById("productCode").value,
              price: parseFloat(document.getElementById("price").value),
              salePrice: document.getElementById("salePrice").value
                ? parseFloat(document.getElementById("salePrice").value)
                : null,
              stock: parseInt(document.getElementById("stock").value) || 0,
              isActive: document.getElementById("isActive").checked,
              isFeatured: document.getElementById("isFeatured").checked,
              color: document.getElementById("color").value,
              washable: document.getElementById("washable").value,
              sellingQty:
                parseInt(document.getElementById("sellingQty").value) || 1,
              type: document.getElementById("type").value,
              nextDayDelivery: document.getElementById("nextDayDelivery").value,
              weight:
                parseFloat(document.getElementById("weight").value) || null,
              shortDescription: quill.root.innerHTML,
              longDescription: quill2.root.innerHTML,
              createdAt: new Date(),
              updatedAt: new Date(),
              otherImages: [], // Will be populated with image URLs
            };

            // Validate required fields
            if (
              !productData.name ||
              !productData.category ||
              !productData.price
            ) {
              alert("Please fill in all required fields");
              return;
            }

            // Handle featured image
            const featuredImageType = document.querySelector(
              'input[name="featuredImageType"]:checked'
            ).id;
            let featuredImageUrl = null;

            if (featuredImageType === "featuredUpload") {
              const file = document.getElementById("featuredImageUploadBtn")
                .files[0];
              if (file) {
                // TODO: Implement file upload to storage and get URL
                // For now, we'll use a placeholder
                featuredImageUrl = "placeholder_url";
              }
            } else {
              featuredImageUrl =
                document.getElementById("featuredImageUrl").value;
            }

            if (!featuredImageUrl) {
              alert("Please add a featured image");
              return;
            }

            productData.featuredImage = featuredImageUrl;

            // Handle other images
            const otherImagesType = document.querySelector(
              'input[name="otherImagesType"]:checked'
            ).id;
            if (otherImagesType === "otherUpload") {
              const files = document.getElementById(
                "otherImagesUploadBtn"
              ).files;
              if (files.length > 0) {
                // TODO: Implement file upload to storage and get URLs
                // For now, we'll use placeholders
                productData.otherImages = Array.from(files).map(
                  () => "placeholder_url"
                );
              }
            } else {
              const urls = [
                document.getElementById("otherImageUrl1").value,
                document.getElementById("otherImageUrl2").value,
                document.getElementById("otherImageUrl3").value,
              ].filter((url) => url.trim() !== "");
              productData.otherImages = urls;
            }

            // Save to Firestore
            const docRef = doc(collection(db, "products"));
            await setDoc(docRef, productData);

            alert("Product added successfully!");
            window.location.href = "/allproducts.html";
          } catch (error) {
            console.error("Error adding product:", error);
            alert("Error adding product. Please try again.");
          }
        });
    }

    // Spinner
    var spinner = function () {
      setTimeout(function () {
        if ($("#spinner").length > 0) {
          $("#spinner").removeClass("show");
        }
      }, 1);
    };
    spinner();

    // Back to top button
    $(window).scroll(function () {
      if ($(this).scrollTop() > 300) {
        $(".back-to-top").fadeIn("slow");
      } else {
        $(".back-to-top").fadeOut("slow");
      }
    });
    $(".back-to-top").click(function () {
      $("html, body").animate({ scrollTop: 0 }, 1500, "easeInOutExpo");
      return false;
    });

    // Sidebar Toggler
    $(".sidebar-toggler").click(function () {
      $(".sidebar, .content").toggleClass("open");
      return false;
    });

    // Progress Bar
    $(".pg-bar").waypoint(
      function () {
        $(".progress .progress-bar").each(function () {
          $(this).css("width", $(this).attr("aria-valuenow") + "%");
        });
      },
      { offset: "80%" }
    );

    // Calender
    $("#calender").datetimepicker({
      inline: true,
      format: "L",
    });

    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
      autoplay: true,
      smartSpeed: 1000,
      items: 1,
      dots: true,
      loop: true,
      nav: false,
    });

    // All Products Page Logic
    if (window.location.pathname == "/allproducts.html") {
      const productsTable = document.querySelector("table tbody");
      const checkAllCheckbox = document.getElementById("checkall");
      let currentPage = 1;
      const itemsPerPage = 10;
      let allProducts = [];

      // Function to format price
      function formatPrice(price) {
        return `GHS ${price.toFixed(2)}`;
      }

      // Function to create product row
      function createProductRow(product) {
        return `
        <tr>
          <th scope="row">
            <input class="form-check-input product-checkbox" type="checkbox" value="${
              product.id
            }">
          </th>
          <td>
            <img src="${product.featuredImage || "/assets/media/no-image.png"}" 
                 alt="${product.name}" 
                 width="50" 
                 height="50"
                 onerror="this.src='/assets/media/no-image.png'">
          </td>
          <td>${product.name}</td>
          <td>${product.category}</td>
          <td>${product.brandName || "-"}</td>
          <td>${formatPrice(product.price)}</td>
          <td>${product.salePrice ? formatPrice(product.salePrice) : "-"}</td>
          <td>
            <button onclick="openEditModal('${
              product.id
            }')" class="btn btn-sm btn-primary">Edit</button>
            <button onclick="confirmDelete('${
              product.id
            }')" class="btn btn-sm btn-danger">Delete</button>
          </td>
        </tr>
      `;
      }

      // Function to open edit modal
      window.openEditModal = async function (productId) {
        try {
          const productDoc = await getDoc(doc(db, "products", productId));
          if (productDoc.exists()) {
            const product = productDoc.data();

            // Populate modal fields
            document.getElementById("editProductId").value = productId;
            document.getElementById("editProductName").value = product.name;
            document.getElementById("editProductCategory").value =
              product.category;
            document.getElementById("editProductBrand").value =
              product.brandName || "";
            document.getElementById("editProductPrice").value = product.price;
            document.getElementById("editProductSalePrice").value =
              product.salePrice || "";
            document.getElementById("editProductStock").value =
              product.stock || "";
            document.getElementById("editProductFeatured").checked =
              product.isFeatured || false;

            // Show modal
            const editModal = new bootstrap.Modal(
              document.getElementById("editProductModal")
            );
            editModal.show();
          }
        } catch (error) {
          console.error("Error fetching product details:", error);
          alert("Error loading product details");
        }
      };

      // Function to confirm delete
      window.confirmDelete = function (productId) {
        if (confirm("Are you sure you want to delete this product?")) {
          deleteProduct(productId);
        }
      };

      // Function to delete product
      async function deleteProduct(productId) {
        try {
          await deleteDoc(doc(db, "products", productId));
          allProducts = allProducts.filter(
            (product) => product.id !== productId
          );
          displayProducts(allProducts);
          alert("Product deleted successfully");
        } catch (error) {
          console.error("Error deleting product:", error);
          alert("Error deleting product. Please try again.");
        }
      }

      // Function to update pagination
      function updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const pagination = document.querySelector(".pagination");

        let paginationHTML = `
        <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
          <a class="page-link" href="#" onclick="changePage(${
            currentPage - 1
          })" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
      `;

        for (let i = 1; i <= totalPages; i++) {
          paginationHTML += `
          <li class="page-item ${currentPage === i ? "active" : ""}">
            <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
          </li>
        `;
        }

        paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
          <a class="page-link" href="#" onclick="changePage(${
            currentPage + 1
          })" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>
      `;

        pagination.innerHTML = paginationHTML;
      }

      // Function to display products
      function displayProducts(products) {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedProducts = products.slice(startIndex, endIndex);

        productsTable.innerHTML = paginatedProducts
          .map((product) => createProductRow(product))
          .join("");
        updatePagination(products.length);
      }

      // Function to fetch products
      async function fetchProducts() {
        try {
          const productsRef = collection(db, "products");
          const q = query(productsRef, orderBy("createdAt", "desc"));
          const querySnapshot = await getDocs(q);

          allProducts = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          displayProducts(allProducts);
        } catch (error) {
          console.error("Error fetching products:", error);
          alert("Error loading products. Please try again.");
        }
      }

      // Function to change page
      window.changePage = function (page) {
        if (page < 1 || page > Math.ceil(allProducts.length / itemsPerPage))
          return;
        currentPage = page;
        displayProducts(allProducts);
      };

      // Handle check all checkbox
      checkAllCheckbox.addEventListener("change", function () {
        const checkboxes = document.querySelectorAll(".product-checkbox");
        checkboxes.forEach((checkbox) => (checkbox.checked = this.checked));
      });

      // Handle search
      const searchInput = document.querySelector('input[type="search"]');
      searchInput.addEventListener("input", function (e) {
        const searchTerm = e.target.value.toLowerCase();
        const filteredProducts = allProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            (product.brandName &&
              product.brandName.toLowerCase().includes(searchTerm))
        );
        currentPage = 1;
        displayProducts(filteredProducts);
      });

      // Handle edit form submission
      document
        .getElementById("editProductForm")
        .addEventListener("submit", async (e) => {
          e.preventDefault();

          const productId = document.getElementById("editProductId").value;
          const productData = {
            name: document.getElementById("editProductName").value,
            category: document.getElementById("editProductCategory").value,
            brandName: document.getElementById("editProductBrand").value,
            price: parseFloat(
              document.getElementById("editProductPrice").value
            ),
            salePrice:
              parseFloat(
                document.getElementById("editProductSalePrice").value
              ) || null,
            stock:
              parseInt(document.getElementById("editProductStock").value) || 0,
            isFeatured: document.getElementById("editProductFeatured").checked,
            updatedAt: new Date(),
          };

          try {
            await setDoc(doc(db, "products", productId), productData, {
              merge: true,
            });

            // Update local data
            const index = allProducts.findIndex((p) => p.id === productId);
            if (index !== -1) {
              allProducts[index] = { ...allProducts[index], ...productData };
              displayProducts(allProducts);
            }

            // Hide modal
            const editModal = bootstrap.Modal.getInstance(
              document.getElementById("editProductModal")
            );
            editModal.hide();

            alert("Product updated successfully");
          } catch (error) {
            console.error("Error updating product:", error);
            alert("Error updating product. Please try again.");
          }
        });

      // Initial fetch
      fetchProducts();
    }
  })(jQuery);
}

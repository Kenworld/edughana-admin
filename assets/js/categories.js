import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

function showSpinner() {
  $("#spinner").show();
}
function hideSpinner() {
  $("#spinner").hide();
}

function createSubCategoryInput(value = "") {
  return `<div class="input-group mb-2 subcategory-input-group">
        <input type="text" class="form-control subCategoryName" value="${$(
          "<div>"
        )
          .text(value)
          .html()}" required>
        <div class="input-group-append">
            <button class="btn btn-danger removeSubCategoryBtn" type="button">&times;</button>
        </div>
    </div>`;
}

$(document).ready(function () {
  const categoriesCol = collection(db, "categories");

  // Helper to render a row
  function renderRow(id, category, subCategories) {
    let subCatDisplay = "-";
    if (Array.isArray(subCategories) && subCategories.length > 0) {
      subCatDisplay = subCategories
        .map((sc) => $("<div>").text(sc).html())
        .join(", ");
    }
    return `<tr data-id="${id}">
            <td>${$("<div>").text(category).html()}</td>
            <td>${subCatDisplay}</td>
            <td>
                <button class="btn btn-sm btn-warning mr-2 edit-btn">Edit</button>
                <button class="btn btn-sm btn-danger delete-btn">Delete</button>
            </td>
        </tr>`;
  }

  // Fetch and display categories
  async function loadCategories() {
    showSpinner();
    $("#categoriesTableBody").empty();
    const querySnapshot = await getDocs(categoriesCol);
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      $("#categoriesTableBody").append(
        renderRow(docSnap.id, data.category, data.subCategories)
      );
    });
    hideSpinner();
  }

  loadCategories();

  // Show modal on button click
  $("#addNewCategoryBtn").on("click", function () {
    $("#addCategoryForm")[0].reset();
    $("#subCategoryGroup").hide();
    $("#subCategoriesList").empty();
    $("#addCategoryModal").data("edit-id", null); // Not editing
    $("#addCategoryModal").modal("show");
  });

  // Toggle sub-category input
  $("#hasSubCategory").on("change", function () {
    if ($(this).is(":checked")) {
      $("#subCategoryGroup").show();
      if ($("#subCategoriesList").children().length === 0) {
        $("#subCategoriesList").append(createSubCategoryInput());
      }
      // Make all subCategoryName required
      $("#subCategoriesList .subCategoryName").attr("required", true);
    } else {
      $("#subCategoryGroup").hide();
      $("#subCategoriesList").empty();
    }
  });

  // Add subcategory input
  $("#addSubCategoryBtn").on("click", function () {
    $("#subCategoriesList").append(createSubCategoryInput());
    $("#subCategoriesList .subCategoryName").attr("required", true);
  });

  // Remove subcategory input
  $("#subCategoriesList").on("click", ".removeSubCategoryBtn", function () {
    $(this).closest(".subcategory-input-group").remove();
    // If none left, add one empty input
    if ($("#subCategoriesList").children().length === 0) {
      $("#subCategoriesList").append(createSubCategoryInput());
    }
  });

  // Handle form submission (add or edit)
  $("#addCategoryForm").on("submit", async function (e) {
    e.preventDefault();
    const category = $("#categoryName").val();
    const hasSub = $("#hasSubCategory").is(":checked");
    let subCategories = [];
    if (hasSub) {
      subCategories = [];
      $("#subCategoriesList .subCategoryName").each(function () {
        const val = $(this).val().trim();
        if (val) subCategories.push(val);
      });
    }
    const editId = $("#addCategoryModal").data("edit-id");
    if (editId) {
      // Edit existing
      await updateDoc(doc(db, "categories", editId), {
        category,
        subCategories: hasSub ? subCategories : [],
      });
    } else {
      // Add new
      await addDoc(categoriesCol, {
        category,
        subCategories: hasSub ? subCategories : [],
      });
    }
    $("#addCategoryModal").modal("hide");
    loadCategories();
  });

  // Delete row
  $("#categoriesTableBody").on("click", ".delete-btn", async function () {
    const row = $(this).closest("tr");
    const id = row.data("id");
    if (confirm("Delete this category?")) {
      await deleteDoc(doc(db, "categories", id));
      loadCategories();
    }
  });

  // Edit row
  $("#categoriesTableBody").on("click", ".edit-btn", function () {
    const row = $(this).closest("tr");
    const id = row.data("id");
    const category = row.find("td:eq(0)").text();
    const subCategoryText = row.find("td:eq(1)").text();
    $("#categoryName").val(category);
    if (subCategoryText !== "-") {
      $("#hasSubCategory").prop("checked", true);
      $("#subCategoryGroup").show();
      $("#subCategoriesList").empty();
      // Split by comma and trim
      const subCategories = subCategoryText.split(",").map((s) => s.trim());
      subCategories.forEach((sc) => {
        $("#subCategoriesList").append(createSubCategoryInput(sc));
      });
      $("#subCategoriesList .subCategoryName").attr("required", true);
    } else {
      $("#hasSubCategory").prop("checked", false);
      $("#subCategoryGroup").hide();
      $("#subCategoriesList").empty();
    }
    $("#addCategoryModal").data("edit-id", id);
    $("#addCategoryModal").modal("show");
  });
});

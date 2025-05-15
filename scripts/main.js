import { loadQrArray } from "./common.js";

// Declarations --------------------------------------------------------------------------------------------------------------------

const qrContainer = document.querySelector("#qr-container");
const template = document.querySelector("#qr-template");

const importButton = document.querySelector("#import");
const exportButton = document.querySelector("#export");
const clearButton = document.querySelector("#clear");

const qrFilter = document.querySelector("#filter")
const qrSort = document.querySelector("#sort");

let savedFilter;
let savedSort;

// Save filter and sort values to local storage
if (localStorage.getItem("filter")) {
  savedFilter = localStorage.getItem("filter");
} else {
  savedFilter = "none";
  localStorage.setItem("filter", savedFilter);
}
if (localStorage.getItem("sort")) {
  savedSort = localStorage.getItem("sort");
} else {
  savedSort = "latest";
  localStorage.setItem("sort", savedSort);
}

// Make the option selected based off of saved filter and sort values
document.addEventListener("DOMContentLoaded", () => {
  const filterOption = document.querySelector(`[value="${savedFilter}"]`);
  if (filterOption) filterOption.selected = true;
  const sortOption = document.querySelector(`[value="${savedSort}"]`);
  if (sortOption) sortOption.selected = true;
})

// Functions --------------------------------------------------------------------------------------------------------------------

function displayQR(qrData)
{
	if (template != null) {
		let qrElement = template.content.cloneNode(true);

		let qrImage = qrElement.querySelector(".qr-image");
		let qrTitle = qrElement.querySelector(".qr-title");
		let qrDate = qrElement.querySelector(".qr-date");
		let qrTags = qrElement.querySelector(".qr-tags");
		let qrDescription = qrElement.querySelector(".qr-description");

		qrImage.src = qrData.qrFile; // Assuming qrFile contains the base64 or path to the image
    qrImage.alt =  `${qrData.qrTitle} QR Code`;
		qrTitle.innerHTML = qrData.qrTitle;
		qrDate.innerHTML = qrData.qrDate;
		qrDescription.innerHTML = qrData.qrDescription;

		qrTags.innerHTML = ""; // Clear existing tags
    qrContainer.appendChild(qrElement);
    if (qrData.qrTags !== null && qrData.qrTags.length !== 0) {
      // To ensure tags stop growing vertically when they reach a certain height
      const maxHeight = 71;
      let tagColorCount = 0;
      
      for (let i = 0; i < qrData.qrTags.length; i++) {
        let tag = qrData.qrTags[i];
        let tagElement = document.createElement("li");
        tagElement.className = `bg-[${qrData.qrTagColors[tagColorCount]}] px-1 rounded-md truncate ... qr-tag-${i}`;
        tagElement.textContent = `#${tag}`;
        
        qrTags.appendChild(tagElement);
        document.body.offsetHeight;
        
        // Remove if last appended child exceeded max height
        if (qrTags.offsetHeight > maxHeight) {
          console.log(`Buffered height limit reached ${qrTags.offsetHeight}px`);
          qrTags.removeChild(tagElement);
          break;
        }
        tagColorCount++;
      }
    }
	}
}

function updateDisplayQR(qrArrayTemp, filterType = "", sortType = "")
{
	// Clear the existing QR codes (clear all children in qrContainer except new)
	while (qrContainer.children.length > 1) {
		qrContainer.removeChild(qrContainer.lastElementChild);
	}

	if (qrArrayTemp === null || qrArrayTemp === undefined || qrArrayTemp.length === 0)
	{
		console.log("qrArray is null or empty");
		return;
	}

	// filter the array
	qrArrayTemp = filterQR(qrArrayTemp, filterType);

	// sort the array
	qrArrayTemp = sortQR(qrArrayTemp, sortType);

	// Loop through the array of QR codes and display each one
	qrArrayTemp.forEach(qrData => {
		displayQR(qrData);
	});

	addQREventListeners(qrArrayTemp); // re add event listeners to the new sorted elements
}

// returns true if filtered, false otherwise
function filterQR(qrArray, filterTag = "")
{
	// console.log("called filterQR()");
	let filtered = [...qrArray]; // creates a shallow copy of the array
	// console.log("filterTag: " + filterTag);

	if (filterTag === null || filterTag === undefined || filterTag === "")
	{
		// console.log("filterTag is null or empty");
		return filtered;
	}

	if (filterTag === "none")
	{
    localStorage.setItem("filter", filterTag);
		return filtered;
	}

  localStorage.setItem("filter", filterTag);
	filtered = filtered.filter(qrData => qrData.qrTags.includes(filterTag.substring(1)));
	return filtered;
}

// returns a sorted version of qrArray with the desired sortType. DOES NOT modify qrArray
function sortQR(qrArray, sortType)
{
	let sorted = [...qrArray]; // creates a shallow copy of the array
  localStorage.setItem("sort", sortType);
	switch (sortType)
	{
		case "latest":
			sorted.sort((a, b) => {
				return new Date(b.qrDate) - new Date(a.qrDate);
			});
			break;
		case "oldest":
			sorted.sort((a, b) => {
				return new Date(a.qrDate) - new Date(b.qrDate);
			});
			break;
		case "alphabetical":
			sorted.sort((a, b) => {
				return a.qrTitle.localeCompare(b.qrTitle);
			});
			break;
	}

	return sorted;
}

function addQREventListeners(qrArray)
{
	// Add click event listeners to each QR code element
	let qrElementArray = document.querySelectorAll(".qr-item");
	qrElementArray.forEach((element, index) => {
		element.addEventListener("click", () => {
			// link is to the edit page with the qrID as a hash
			window.location.href = `pages/edit.html#${qrArray[index].qrID}`;
		});
	});
}

function addSortingFilterEventListeners()
{
		// Filter
		qrFilter.addEventListener("change", () => {
			let filterValue = qrFilter.options[qrFilter.selectedIndex].value;
			let sortValue = qrSort.options[qrSort.selectedIndex].value; // should not be changing here
			updateDisplayQR([...qrArrayMain], filterValue, sortValue);
		});

		// Sorting
		qrSort.addEventListener("change", () => {
			let filterValue = qrFilter.options[qrFilter.selectedIndex].value; // should not be changing here
			let sortValue = qrSort.options[qrSort.selectedIndex].value;
			updateDisplayQR([...qrArrayMain], filterValue, sortValue);
		});
}

function addImportExportEventListeners()
{
	importButton.addEventListener("click", () => {
		if (confirm("Are you sure you want to import data?\nThis will overwrite your current data."))
		{
			const fileInput = document.createElement("input");
			fileInput.type = "file";
			fileInput.accept = ".json";

			fileInput.addEventListener("change", (event) => {
				const file = event.target.files[0];
				if (file)
				{
					const reader = new FileReader();
					reader.onload = (e) => {
						const contents = e.target.result;
						try
						{
							const qrArrayImported = JSON.parse(contents);

							localStorage.removeItem("qrArray");
							localStorage.setItem("qrArray", JSON.stringify(qrArrayImported));

							window.location.reload();
						}
						catch (error)
						{
							alert("Error parsing JSON file. Please ensure it is a valid QR data file.");
						}
					};
					reader.readAsText(file);
				}
			});
			fileInput.click();
		}
	});

	exportButton.addEventListener("click", () => {
		if (confirm("Are you sure you want to export data?\nThis will download your current data as a json file."))
		{
			let qrArrayString = JSON.stringify(qrArrayMain);
			const blob = new Blob([qrArrayString], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "qr_data.json";
			a.click();
			URL.revokeObjectURL(url);
		}
	});
}

function addClearEventListeners()
{
	clearButton.addEventListener("click", () => {
		if (confirm("Are you sure you want to clear all data?\nThis action cannot be undone."))
		{
			localStorage.removeItem("qrArray");
			window.location.reload();
		}
	});
}

function initialize(qrArray)
{
	let qrArrayDisplay = [...qrArrayMain];

	// set the default filter and sort;
	qrFilter.options.selectedIndex = 0;
	qrSort.options.selectedIndex = 0;

	// populate filter list with all tags
	let tagsToAdd = [];
	qrArray.forEach(qrData => {
		qrData.qrTags.forEach(tag => {
			if (!tagsToAdd.includes(tag)) { // don't add duplicates, doesn't consider colors
				tagsToAdd.push(tag);
			}
		});
	});
	// console.log(tagsToAdd);
	if (tagsToAdd.length !== 0)
	{
		tagsToAdd.forEach(tag => {
			let option = document.createElement("option");
			option.value = `#${tag}`;
			option.textContent = `#${tag}`;
			qrFilter.appendChild(option);
		});
	}

	updateDisplayQR(qrArrayDisplay, savedFilter, savedSort);
}

// Running --------------------------------------------------------------------------------------------------------------------
let qrArrayMain = loadQrArray();

addQREventListeners(qrArrayMain);
addSortingFilterEventListeners();

addImportExportEventListeners();
addClearEventListeners();

initialize(qrArrayMain);

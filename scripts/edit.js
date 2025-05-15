import { loadQrArray, saveQrArray, getQR, queryAPI, convertImageToBase64, convertBase64ToImage } from "./common.js";

// Declarations --------------------------------------------------------------------------------------------------------------------

// boolean to determine if we are editing an existing QR code or creating a new one
const edit = (window.location.hash.substring(1) !== "new");
const preview = document.querySelector("#qrPreview");

// only for editing, becomes true if the user makes a change that requires a new QR code (changing url)
let needsRegeneration = false;

// counter for tag amount, allows limiting max tags
let tagCount = 0;
const maxTags = 5;

let qrArray = loadQrArray();

// these arrays store the tags and colors that are read from storage
let tagsArray = [];
let tagColorsArray = [];

// these arrays store the tags and colors that have just been added
let tagsArrayTemp = [];
let tagColorsArrayTemp = [];

let qrData = null;

// getting the field elements
const qrLink = document.querySelector("#url-link");
const qrTitle = document.querySelector("#title-text");
const qrTags = document.querySelector("#tags");
const qrTagColor = document.querySelector("#tag-color");
const qrDescription = document.querySelector("#description");
const qrDate = document.querySelector("#creation-date");

const tagList = document.querySelector("#tag-list");

const qrAddTag = document.querySelector("#add-tag");
const saveButton = document.querySelector("#save");
const deleteButton = document.querySelector("#delete");
const downloadButton = document.querySelector("#download");

// Functions --------------------------------------------------------------------------------------------------------------------

function createNewQR(title, tags = [], tagColors = [], description, url)
{
	let newQR = {
		qrID: `${Date.now()}`,
		// qrFile: `some base64 encoding of the qr code image`,
		// qrFile: `http://127.0.0.1:5500/images/QR_Code_example.png`, // TODO: PLACEHOLDER copies the example image;
		qrFile: null,
		qrTitle: title,
		qrDate: new Date(Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), // TODO: may want to be able to manually override date
		qrTags: tags,
		qrTagColors: tagColors,
		qrDescription: description,
		qrURL: url,
	}

	return newQR;
}

function updateTags()
{
	// clear the tag list
	tagList.innerHTML = "";

	tagsArray.forEach((tag, index) =>
		{
			let tagItem = document.createElement("li");

			// add event listeners
			tagItem.addEventListener("click", () =>
			{
				tagList.removeChild(tagItem);
				tagsArray.splice(index, 1);
				tagColorsArray.splice(index, 1);

				tagCount--;

				updateTags();
			});

			// add properties and append to DOM
			tagItem.classList.add("px-1", "rounded-md", `bg-[${tagColorsArray[index]}]`);
			tagItem.style.backgroundColor = tagColorsArray[index];
			tagItem.style.color = "white";
			tagItem.innerText = `#${tag}`;
			tagItem.id = `tag-item-${index}`;
			tagList.appendChild(tagItem);
		});

		// use the temp arrays to add the newly created unsaved tags to the DOM
		tagsArrayTemp.forEach((tag, index) =>
		{
			let tagItem = document.createElement("li");

			// add event listeners
			tagItem.addEventListener("click", () =>
				{
					tagList.removeChild(tagItem);
					tagsArrayTemp.splice(index, 1);
					tagColorsArrayTemp.splice(index, 1);

					tagCount--;

					updateTags();
				});

			// add properties and append to DOM
			tagItem.classList.add("px-1", "rounded-md", `bg-[${tagColorsArrayTemp[index]}]`);
			tagItem.style.backgroundColor = tagColorsArrayTemp[index];
			tagItem.style.color = "white";
			tagItem.innerText = `#${tag}`;
			tagItem.id = "tag-item";
			tagList.appendChild(tagItem);
		});
}

function initialize()
{
	if (edit)
	{
		let qrID = window.location.hash.substring(1);
		qrData = getQR(qrArray, qrID);

		qrLink.value = qrData.qrURL;
		qrTitle.value = qrData.qrTitle;

		// set the tagCount to the amount of tags already present
		tagCount = qrData.qrTags.length;

		// add the tags from the data into the arrays, once
		qrData.qrTags.forEach((tag, index) =>
		{
			tagsArray.push(tag);
			tagColorsArray.push(qrData.qrTagColors[index]);
		});

		updateTags();

		qrDescription.value = qrData.qrDescription;
		qrDate.value = qrData.qrDate;

		// set the preview image
		let newPreview = convertBase64ToImage(qrData.qrFile, `${qrData.qrTitleValue} QR Code with link ${qrData.qrLinkValue}`);
		preview.src = newPreview.src;
		preview.alt = newPreview.alt;
	}
	else
	{
		deleteButton.parentElement.style.display = "none";
    downloadButton.parentElement.style.display = "none";
    qrDate.value = new Date(Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
	}
}

// Running --------------------------------------------------------------------------------------------------------------------
initialize();
console.log(qrData || "new QR code");

// Event Listeners ------------------------------------------------------------------------------------------------------------

qrAddTag.addEventListener("click", () =>
{
	let tagValue = qrTags.value;
	let tagColorValue = qrTagColor.options[qrTagColor.selectedIndex].getAttribute("data-hex");

	if (tagCount >= maxTags)
	{
		alert(`You can only add ${maxTags} tags`);
	}
	else if (tagValue !== "" && tagColorValue !== "")
	{
		qrTags.value = "";

    // add new tags to the temp arrays in alphabetical order
    let index = 0;
    while (index < tagsArrayTemp.length && tagsArrayTemp[index].localeCompare(tagValue) < 0) {
      index++;
    }
    tagsArrayTemp.splice(index, 0, tagValue);
    tagColorsArrayTemp.splice(index, 0, tagColorValue);

		tagCount++;

		updateTags(); // update display
	}
	else
	{
		alert("Please enter a tag and select a color");
	}
});

saveButton.addEventListener("click", (event) =>
{
	event.preventDefault();

	let qrLinkValue = qrLink.value;
	let qrTitleValue = qrTitle.value;

	let qrDescriptionValue = qrDescription.value;

	let dateValue = qrDate.value;

	// input validation: URL and Title are required to save.
	if (qrLinkValue === "" || qrTitleValue === "")
	{
		if (qrLinkValue === "")
		{
			let urlInput = document.querySelector("#url-link");
			urlInput.classList.remove("ring-1");
			urlInput.classList.remove("ring-black/5");
			urlInput.classList.remove("hover:ring-black/10");
			urlInput.classList.remove("focus:ring-black/10");

			urlInput.classList.add("ring-2");
			urlInput.classList.add("ring-red-500");
			urlInput.classList.add("hover:ring-red-500");
			urlInput.classList.add("focus:ring-red-500");
			urlInput.classList.add("hover:shadow-red-500/50");
			urlInput.classList.add("placeholder-red-500/80");

		}
		else
		{
			let urlInput = document.querySelector("#url-link");
			urlInput.classList.add("ring-1");
			urlInput.classList.add("ring-black/5");
			urlInput.classList.add("hover:ring-black/10");
			urlInput.classList.add("focus:ring-black/10");

			urlInput.classList.remove("ring-2");
			urlInput.classList.remove("ring-red-500");
			urlInput.classList.remove("hover:ring-red-500");
			urlInput.classList.remove("focus:ring-red-500");
			urlInput.classList.remove("hover:shadow-red-500/50");
			urlInput.classList.remove("placeholder-red-500/80");
		}

		if (qrTitleValue === "")
			{
				let textInput = document.querySelector("#title-text");
				textInput.classList.remove("ring-1");
				textInput.classList.remove("ring-black/5");
				textInput.classList.remove("hover:ring-black/10");
				textInput.classList.remove("focus:ring-black/10");

				textInput.classList.add("ring-2");
				textInput.classList.add("ring-red-500");
				textInput.classList.add("hover:ring-red-500");
				textInput.classList.add("focus:ring-red-500");
				textInput.classList.add("hover:shadow-red-500/50");
				textInput.classList.add("placeholder-red-500/80");

			}
		else
		{
			let textInput = document.querySelector("#title-text");
			textInput.classList.add("ring-1");
			textInput.classList.add("ring-black/5");
			textInput.classList.add("hover:ring-black/10");
			textInput.classList.add("focus:ring-black/10");

			textInput.classList.remove("ring-2");
			textInput.classList.remove("ring-red-500");
			textInput.classList.remove("hover:ring-red-500");
			textInput.classList.remove("focus:ring-red-500");
			textInput.classList.remove("hover:shadow-red-500/50");
			textInput.classList.remove("placeholder-red-500/80");
		}
		// alert("Please enter a title and link");
		return;
	}

	if (!edit) // if new
	{
		// append the values in the temp arrays to the main arrays, and save
		tagsArrayTemp.forEach((tag, index) =>
		{
			tagsArray.push(tag);
			tagColorsArray.push(tagColorsArrayTemp[index]);
		});

		// create the new QR
		let newQR = createNewQR(qrTitleValue, tagsArray, tagColorsArray, qrDescriptionValue, qrLinkValue);

		/*
		add the qr File to the qr object (api call and base64 conversion)
		and save it to the qr array and local storage after the promise resolves
		*/
		queryAPI(newQR.qrURL)
			.then((response) => {
				if (!response.ok)
				{
					console.error("api response error");
					throw new Error("API response error");
				}
				return response.blob();
			})
			.then((blob) =>
			{
				const img = document.createElement("img");
				img.src = URL.createObjectURL(blob);
        console.log(URL.createObjectURL(blob));
				img.alt = `${qrTitleValue} QR Code with link ${qrLinkValue}`;

				// convert the image to base64
				convertImageToBase64(img).then((base64Value) =>
				{
					newQR.qrFile = base64Value;

					// console.log(newQR);

					// save the qr code to local storage
					qrArray.push(newQR);
					saveQrArray(qrArray);

					window.location.href = "../index.html";
				});
			})
			.catch((error) => {
				console.error("Error caught during QR code creation", error);
				alert(`Error: ${error.message}`);
			});
	}
	else // if editing
	{
		let qrID = window.location.hash.substring(1);
		getQR(qrArray, qrID).qrTitle = qrTitleValue;
		getQR(qrArray, qrID).qrDescription = qrDescriptionValue;
		getQR(qrArray, qrID).qrURL = qrLinkValue;

		// append the values in the temp arrays to the main arrays, and save
		tagsArrayTemp.forEach((tag, index) =>
		{
			tagsArray.push(tag);
			tagColorsArray.push(tagColorsArrayTemp[index]);
		});

		getQR(qrArray, qrID).qrTags = tagsArray;
		getQR(qrArray, qrID).qrTagColors = tagColorsArray;

		/*
		IF REGENERATION NEEDED
		add the qr File to the qr object (api call and base64 conversion)
		and save it to the qr array and local storage after the promise resolves
		*/
		if (needsRegeneration)
		{
			queryAPI(qrLinkValue)
			.then((response) => {
				if (!response.ok)
				{
					console.error("api response error");
					throw new Error("API response error");
				}
				return response.blob();
			})
			.then((blob) =>
			{
				const img = document.createElement("img");
				img.src = URL.createObjectURL(blob);
				img.alt = `${qrTitleValue} QR Code with link ${qrLinkValue}`;

				// convert the image to base64
				convertImageToBase64(img).then((base64Value) =>
				{
					// newQR.qrFile = base64Value;
					getQR(qrArray, qrID).qrFile = base64Value;

					// console.log(newQR);

					// save the qr code to local storage
					saveQrArray(qrArray);

					window.location.href = "../index.html";
				});
			})
			.catch((error) => {
				console.error("Error caught during QR code creation", error);
				alert(`Error: ${error.message}`);
			});
		}
		else // if regeneration not needed (changes don't include a new URL)
		{
			saveQrArray(qrArray);
			window.location.href = "../index.html";
		}
	}
});

if (edit)
{
	deleteButton.addEventListener("click", () =>
	{
		let qrID = window.location.hash.substring(1);
		qrArray = qrArray.filter((qr) => qr.qrID !== qrID); // delete the qr code from the array with matching id
		saveQrArray(qrArray);

		window.location.href = "../index.html";
	});

  downloadButton.addEventListener("click", () => {
    downloadButton.download = qrTitle.value + "_QR.png";
    downloadButton.href = document.querySelector("#qrPreview").src;
    console.log(downloadButton.href);
    console.log(downloadButton.download);
  });

	qrLink.addEventListener("input", () =>
	{
		if (qrLink.value !== qrData.qrURL)
		{
			needsRegeneration = true;
			saveButton.innerText = "Save and Regenerate";
		}
		else
		{
			needsRegeneration = false;
			saveButton.innerText = "Save";
		}
	});
}

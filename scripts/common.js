export function loadQrArray()
{
	let qrArrayUnparsed = localStorage.getItem("qrArray");
	let qrArrayParsed = [];

	// check if there was any data in local storage
	if (qrArrayUnparsed != null)
	{
		qrArrayParsed = JSON.parse(qrArrayUnparsed);
	}
	return qrArrayParsed;
}

export function saveQrArray(qrArray)
{
	let qrArrayString = JSON.stringify(qrArray);
	localStorage.setItem("qrArray", qrArrayString);

	// console.log("attempted to save");
}

// gets the qr data to edit by searching through the array for the correct qrID
export function getQR(qrArray = [], qrID)
{
	let qrData = null;

	// to find the qr with matching id
	qrArray.forEach((qr) =>
	{
		// if qrData unset and the qrID matches the one we are looking for
		if (qrData === null && qr.qrID === qrID)
		{
			qrData = qr;
		}
	});

		return qrData;
}

// only for report.html
export function queryAPISample()
{
	fetch("https://api.qrserver.com/v1/create-qr-code/?data=HelloWorld&size=200x200")
		.then(response => {
			if (!response.ok) {
				console.error("api response error")
			}
			return response.blob();
		})
		.then(blob => {
			const img = document.createElement("img");
			img.src = URL.createObjectURL(blob);
			img.alt = "Sample QR Code";

			let location = document.querySelector("#demo");

			location.appendChild(img);
		})
}

export function queryAPI(link)
{
	let urlProxy = new URL("https://corsproxy.io/?url=")
	let width = "200";
	let size = "200";
	let url = new URL(`${urlProxy}https://api.qrserver.com/v1/create-qr-code/?data=${link}&size=${width}x${size}`);
	return fetch(url);
}

export function convertImageToBase64(image)
{
	return new Promise((resolve, reject) => {
		try {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");

			const img = new Image();

			img.onload = () => {
				canvas.width = img.width;
				canvas.height = img.height;

				ctx.drawImage(img, 0, 0);
				resolve(canvas.toDataURL("image/png"));
			};

			img.onerror = (error) => reject(error);
			img.src = image.src || image;
		} catch (error) {
			reject(error);
		}
	});
}

export function convertBase64ToImage(base64String, altText)
{
	const img = new Image();
	img.src = base64String;
	img.alt = altText || "Alt text not provided";
	return img;
}

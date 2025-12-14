import { auth, db } from './firebase-config.js';
import { 
	collection, 
	addDoc, 
	query, 
	where, 
	getDocs, 
	doc, 
	deleteDoc, 
	updateDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Save QR array - uses Firestore for logged-in users, localStorage for guests
export async function saveQrArray(qrArray) {
	const user = auth.currentUser;
	
	console.log('saveQrArray called, user:', user ? user.email : 'not logged in');
	console.log('qrArray to save:', qrArray);
	
	if (user) {
		// User is logged in - save to Firestore
		try {
			const userQrsRef = collection(db, 'users', user.uid, 'qrcodes');
			
			// Delete all old QRs first
			const oldQRs = await getDocs(userQrsRef);
			console.log('Found', oldQRs.docs.length, 'existing QRs to delete');
			
			for (const qrDoc of oldQRs.docs) {
				await deleteDoc(doc(db, 'users', user.uid, 'qrcodes', qrDoc.id));
			}
			
			// Add all new QRs
			console.log('Adding', qrArray.length, 'new QRs to Firestore');
			for (const qr of qrArray) {
				const docRef = await addDoc(userQrsRef, qr);
				console.log('Added QR with ID:', docRef.id);
			}
			
			console.log('✅ QR codes saved to Firestore successfully');
		} catch (error) {
			console.error('❌ Error saving to Firestore:', error);
			console.log('Falling back to localStorage');
			// Fallback to localStorage
			const qrArrayString = JSON.stringify(qrArray);
			localStorage.setItem("qrArray", qrArrayString);
		}
	} else {
		// Guest - use localStorage only
		console.log('User not logged in, saving to localStorage');
		const qrArrayString = JSON.stringify(qrArray);
		localStorage.setItem("qrArray", qrArrayString);
	}
}

// Load QR array - loads from Firestore for logged-in users, localStorage for guests
export async function loadQrArray() {
	// Wait for Firebase Auth to restore user session
	const user = await new Promise((resolve) => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			unsubscribe();
			resolve(user);
		});
	});
	
	console.log('loadQrArray called, user:', user ? user.email : 'not logged in');
	
	if (user) {
		// User is logged in - load from Firestore
		try {
			const userQrsRef = collection(db, 'users', user.uid, 'qrcodes');
			const snapshot = await getDocs(userQrsRef);
			const qrArray = [];
			
			console.log('Firestore query returned', snapshot.docs.length, 'documents');
			
			snapshot.forEach(doc => {
				console.log('Loading QR:', doc.data().qrTitle);
				qrArray.push(doc.data());
			});
			
			console.log('✅ QR codes loaded from Firestore, total:', qrArray.length);
			return qrArray;
		} catch (error) {
			console.error('❌ Error loading from Firestore:', error);
			console.log('Falling back to localStorage');
			// Fallback to localStorage
			const qrArrayUnparsed = localStorage.getItem("qrArray");
			return qrArrayUnparsed ? JSON.parse(qrArrayUnparsed) : [];
		}
	} else {
		// Guest - use localStorage only
		console.log('User not logged in, loading from localStorage');
		const qrArrayUnparsed = localStorage.getItem("qrArray");
		let qrArrayParsed = [];

		// check if there was any data in local storage
		if (qrArrayUnparsed != null) {
			qrArrayParsed = JSON.parse(qrArrayUnparsed);
		}
		console.log('✅ Loaded', qrArrayParsed.length, 'QRs from localStorage');
		return qrArrayParsed;
	}
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

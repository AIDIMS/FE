import { init as csRenderInit, imageLoader, getWebWorkerManager } from '@cornerstonejs/core';
import { init as csToolsInit } from '@cornerstonejs/tools';
import * as cornerstone from '@cornerstonejs/core';
import * as cornerstoneDicomImageLoader from '@cornerstonejs/dicom-image-loader';
import dicomParser from 'dicom-parser';

let isInitialized = false;

export default async function initCornerstone() {
	if (isInitialized) {
		return;
	}

	await csRenderInit();
	await csToolsInit();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const imageLoaderAny = cornerstoneDicomImageLoader as any;
	const loader = imageLoaderAny.default || imageLoaderAny;

	if (!loader.external) {
		loader.external = {};
	}
	loader.external.cornerstone = cornerstone;
	loader.external.dicomParser = dicomParser;

	if (typeof loader.configure === 'function') {
		try {
			 
			loader.configure({
				// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
				beforeSend: (_xhr: any) => {
					// Empty callback - xhr parameter required by API but not used
				},
			});
		} catch {
			// Silent fail
		}
	}

	if (typeof loader.init === 'function') {
		try {
			loader.init();
		} catch {
			// Silent fail
		}
	}

	const config = {
		maxWebWorkers: navigator.hardwareConcurrency || 4,
		startWebWorkersOnDemand: true,
		taskConfiguration: {
			decodeTask: {
				initializeCodecsOnStartup: false,
				usePDFJS: false,
				strict: false,
			},
		},
		webWorkerPath: '/cornerstone-workers/cornerstoneWADOImageLoader.min.js',
		codecsPath: '/cornerstone-workers/',
	};

	const webWorkerManager = getWebWorkerManager();

	if (webWorkerManager && typeof webWorkerManager.initialize === 'function') {
		try {
			webWorkerManager.initialize(config);
		} catch {
			// Silent fail
		}
	}

	if (loader.wadouri) {
		if (loader.wadouri.loadImage) {
			imageLoader.registerImageLoader('wadouri', loader.wadouri.loadImage);
		}

		if (loader.wadouri.loadImage) {
			imageLoader.registerImageLoader('dicomfile', loader.wadouri.loadImage);
		}

		if (typeof loader.wadouri.registerImageLoader === 'function') {
			try {
				loader.wadouri.registerImageLoader();
			} catch {
				// Silent fail
			}
		}
	}

	isInitialized = true;
}

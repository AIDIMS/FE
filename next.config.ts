import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
	transpilePackages: [
		'@cornerstonejs/core',
		'@cornerstonejs/tools',
		'@cornerstonejs/dicom-image-loader',
		'@cornerstonejs/codec-openjph',
		'@cornerstonejs/codec-openjpeg',
		'@cornerstonejs/codec-charls',
		'@cornerstonejs/codec-libjpeg-turbo-8bit',
		'dicom-parser',
		'@icr/polyseg-wasm',
	],

	// Empty turbopack config to silence warning
	turbopack: {},

	webpack: (config, { isServer }) => {
		// Only apply client-side configurations
		if (!isServer) {
			// Copy cornerstone workers
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const CopyWebpackPlugin = require('copy-webpack-plugin');
			const loaderDistPath = path.join(
				process.cwd(),
				'node_modules',
				'@cornerstonejs',
				'dicom-image-loader',
				'dist'
			);

			config.plugins.push(
				new CopyWebpackPlugin({
					patterns: [
						{
							from: loaderDistPath,
							to: path.join(process.cwd(), 'public', 'cornerstone-workers'),
							globOptions: {
								ignore: ['**/*.map', '**/*.d.ts', '**/esm/**', '**/cjs/**'],
							},
							force: true,
							noErrorOnMissing: true,
						},
					],
				})
			);

			// Fallback for Node.js modules
			config.resolve.fallback = {
				...config.resolve.fallback,
				fs: false,
				path: false,
				crypto: false,
				stream: false,
			};
		}

		// Enable WebAssembly
		config.experiments = {
			...config.experiments,
			asyncWebAssembly: true,
			layers: true,
		};

		// WASM module rules
		config.module.rules.push({
			test: /\.wasm$/,
			type: 'asset/resource',
		});

		return config;
	},
};

export default nextConfig;

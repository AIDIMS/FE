import type { NextConfig } from 'next';
import path from 'path';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const nextConfig: NextConfig = {
	transpilePackages: [
		'@cornerstonejs/core',
		'@cornerstonejs/tools',
		'@cornerstonejs/dicom-image-loader',
		'@cornerstonejs/codec-openjph',
		'dicom-parser',
		'@icr/polyseg-wasm',
	],

	webpack: (config, { isServer }) => {
		if (!isServer) {
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
							to: path.join(__dirname, 'public', 'cornerstone-workers'),
							globOptions: {
								ignore: ['**/*.map', '**/*.d.ts', '**/esm/**', '**/cjs/**'],
							},
							force: true,
							noErrorOnMissing: true,
						},
					],
				})
			);
		}

		config.experiments = {
			...config.experiments,
			asyncWebAssembly: true,
			layers: true,
		};

		config.resolve.fallback = {
			...config.resolve.fallback,
			fs: false,
			path: false,
			crypto: false,
			stream: false,
		};

		config.module.rules.push({
			test: /\.wasm$/,
			type: 'asset/resource',
		});

		return config;
	},
};

export default nextConfig;

import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import {signatureEditorPlugin} from './scripts/signature-editor-plugin';
import {illustrationAssetsPlugin} from './scripts/illustration-assets-plugin';
// Relative asset paths work on both username.github.io and /repository/ Pages sites.
export default defineConfig({ plugins: [preact(),signatureEditorPlugin(),illustrationAssetsPlugin()], base: './' });

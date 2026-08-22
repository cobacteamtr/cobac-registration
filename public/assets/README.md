# Project Assets

This folder records uploaded project assets that benyaptim should preserve during export/import.

Runtime upload storage is intentionally not enabled automatically. The canonical production setup must create and approve the `project-assets` bucket, RLS/storage policies, retention, deletion, and export behavior before user uploads are enabled.

| File | Kind | Usage | Storage path | Size bytes |
|---|---|---|---|---|
| logo_red-8e829149.svg | image | inline_media | e4fd9ed8-8951-47a3-88d2-7b4c831498dc/0807cae9-e663-4709-9c77-93104d205835/450db4aa-b1ee-4a0b-bc4e-08bd5ab5cb10-logo_red-8e829149.svg | 10823 |

Allowed upload classes:

- Images: PNG, JPG, WEBP, GIF, SVG up to 10MB.
- PDFs: PDF up to 20MB.
- Videos: MP4, WEBM, MOV up to 100MB.

Required launch checks before enabling uploads:

- Owner can upload, read, replace, and delete only their own project assets.
- Admin export includes asset metadata and approved downloadable objects.
- User deletion removes or anonymizes project asset metadata and storage objects.
- Hero background usage never loads private URLs in public published pages.

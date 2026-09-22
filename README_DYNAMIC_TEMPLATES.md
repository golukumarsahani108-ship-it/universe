# MY LITTLE UNIVERSE — Dynamic Website Templates

This version adds automatic creator editing for Admin-uploaded HTML/CSS/JS templates.

## What it does
- Admin uploads a ZIP containing `index.html`, `style.css`, `script.js` and optional assets.
- The server scans `index.html` and detects text, images, audio, video and secret/password inputs.
- Common page markers are detected: `data-page`, `data-screen`, `.page`, `.screen`, `.slide`, `.step`, `section`, `article`.
- Creator editor is page-by-page and only shows detected editable fields for that page.
- Number of photo/music controls follows the actual detected elements.
- Creator can upload replacement photos and music.
- Admin can add, edit and delete the creator-facing editor note.
- Existing built-in Birthday 01 and Birthday 02 flows remain separate.

## Required Supabase migration
Run `supabase/website_templates_editor.sql` once. It adds `website_templates.editor_note`.

## Dependencies
Run `npm install` after extracting the project. `package.json` includes `unzipper` and its types.

## ZIP format
The required files must be at the ZIP root:

```
index.html
style.css
script.js
assets/...
```

Do not put `index.html` inside another folder.


## Automatic content detection v3

The template pipeline now scans three layers automatically when an admin uploads a ZIP:

- `index.html`: page/screen structure, text, `<img>`, `<audio>`, `<source>`, `<video>`, and password/secret/code inputs.
- `style.css`: local `background-image: url(...)` rules on simple `#id` / `.class` selectors become photo upload fields (useful for image cards built with `<div>` backgrounds).
- `script.js`: common data objects used by interactive templates are detected automatically. The Birthday Box pattern is supported for `SECRET_CODE`, `fragmentData` (memory/question/secret/sound/message) and `archiveMessages`. Their fields are assigned to the matching page and are updated live through the editor bridge.

The creator editor remains page-by-page. Pages without detected editable content are shown as Original/skip. Existing built-in Birthday designs are unchanged.

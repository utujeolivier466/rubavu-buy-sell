# TODO: Replace Sold Text Labels with sold-icon.png

## Steps

- [x] Step 0: Analyze codebase and create plan
- [x] Step 1: Create TODO.md tracking file
- [x] Step 2: Edit **FeaturedProperties.tsx** - Replace "Sold" text badge with sold-icon.png overlay
- [x] Step 3: Edit **PropertyDetailPage.tsx** - Replace "Sold" text badge with sold-icon.png overlay
- [ ] Step 4: Edit **Propertiespage.tsx** - Add sold-icon.png overlay for future-proofing
- [ ] Step 5: Final verification

---

# TODO: Request a Property — Header, Footer, Routes & Admin Dashboard

## Steps

- [x] Step 0: Analyze codebase and create plan
- [x] Step 1: Edit **Header.tsx** - Add "Request a Property" nav link (desktop + mobile) pointing to `/request-property`
- [x] Step 2: Edit **Footer.tsx** - Add "Request a Property" link under Services
- [x] Step 3: Edit **App.tsx** - Import `RequestPropertyPage` and `AdminPropertyRequests`, add public route `/request-property` and admin route `property-requests`
- [x] Step 4: Confirm **Requestpropertypage.tsx** uses `./Seohead` import (already fixed)
- [x] Step 5: Edit **Adminlayout.tsx** - Add "Property Requests" nav link under Blog / Learning Center
- [x] Step 6: Attempted production build — failed on **pre-existing** `vite:html-inline-proxy` issue (Windows path case `Downloads` vs `downloads` in `index.html` inline `<style>`), unrelated to these changes


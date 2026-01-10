# 📰 MNI Portal Berita

Ini adalah aplikasi web modular yang dibangun dengan **React**, **TypeScript**, dan **React Router v7**.  
Struktur folder menggunakan pendekatan feature-based sehingga mudah diskalakan, serta sudah mendukung **lokalisasi**, **middleware**, dan **reusable components**.

---

## 🚀 Getting Started

### 📦 Installation

```bash
npm install
# or
yarn install


🧪 Run the App

npm run dev
# or
yarn dev

🔨 Build for Production

npm run build
# or
yarn build
```

### 🌐 Tech Stack

    ⚛️ React

    🔀 React Router v7

    🧠 TypeScript

    🌍 i18n (English & Indonesian support)

    🧪 Testing support (Jest / Vitest - optional)

    🧩 Modular architecture

### 🗂️ Project Structure

````bash
mni-portal-berita/
├── .react-router/              # Optional: Router configs/meta
├── app/
│   ├── components/             # Global/shared UI components
│   ├── features/               # Feature-based modules
│   │   ├── berita/             # Modul berita/artikel
│   │   │   ├── __tests__/      # Unit/integration tests
│   │   │   ├── components/     # Komponen khusus berita
│   │   │   ├── models/         # Domain models (types/interfaces)
│   │   │   ├── services/       # API/data logic berita
│   │   ├── home/               # Modul halaman utama
│   │   │   ├── __tests__/
│   │   │   ├── components/
│   │   │   ├── models/
│   │   │   ├── services/
│   ├── lib/
│   │   └── utils.ts            # Global utility functions
│   ├── locales/                # i18n folder
│   │   ├── en/                 # English translations
│   │   ├── id/                 # Indonesian translations
│   ├── middleware/             # Custom middleware (auth, logging, dll.)
│   ├── routes/                 # React Router v7 route files
│   └── root.tsx                # App entry
│   └── routes.tsx              # Setup routes


### 🧭 Routing

This project uses React Router v7 manually defined in the routes/ folder and linked to components from features.

```bash
Example:

// routes/event.tsx
import { EventPage } from "~/features/events/components/EventPage";
````

### 🌍 Localization

    All translation files are under /locales

    Supports English (en) and Indonesian (id)

    Translation files are separated by:

        index.ts

        error.ts

        translation.ts

🧪 Testing

Tests are colocated in **tests** folders inside each feature module:

```bash
features/
└── events/
    └── __tests__/
```

Supports tools like Jest, Vitest, or your preferred test runner.

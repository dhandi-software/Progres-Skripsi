import {
    type RouteConfig,
    index,
    route,
    prefix,
    layout,
} from "@react-router/dev/routes";

export default [
    route("login", "routes/login/login.tsx"),

    layout("routes/landing/landing-layout.tsx", [
        route("/", "routes/landing/Home.tsx"),
        // route("index", "routes/landing/index.tsx"),
        route("guide", "routes/landing/Guide.tsx"),
        route("requirements", "routes/landing/Requirements.tsx"),
        route("format", "routes/landing/Format.tsx"),
        route("faq", "routes/landing/FAQ.tsx"),
        route("article/:slug", "routes/landing/article.tsx"),
        route("search", "routes/search.tsx"),
    ]),

    // Mahasiswa
    layout("routes/mahasiswa/layout.tsx", [
        ...prefix("mahasiswa", [
            index("routes/mahasiswa/dashboard.tsx"),
            route("download", "routes/mahasiswa/download.tsx"),
            route("pengajuan", "routes/mahasiswa/pengajuan.tsx"),
            route("bimbingan", "routes/mahasiswa/bimbingan.tsx"),
            route("chat", "routes/mahasiswa/chat.tsx"),
            route("acara", "routes/mahasiswa/acara.tsx"),
            route("sidang", "routes/mahasiswa/sidang.tsx"),
            route("penilaian", "routes/mahasiswa/penilaian.tsx"),
            route("profilemahasiswa", "routes/mahasiswa/profilemahasiswa.tsx"),
        ]),
    ]),

    // Dosen
    layout("routes/dosen/layout.tsx", [
        ...prefix("dosen", [
            index("routes/dosen/dashboard.tsx"),
            route("download", "routes/dosen/download.tsx"),
            route("peninjauan", "routes/dosen/peninjauan.tsx"),
            route("peninjauan/:id", "routes/dosen/pengajuan.$id.tsx"),
            route("bimbingan", "routes/dosen/bimbingan.tsx"),
            route("chat", "routes/dosen/chat.tsx"),
            route("acara", "routes/dosen/acara.tsx"),
            route("acara/create", "routes/dosen/acara.create.tsx"),
            route("acara/edit/:id", "routes/dosen/acara.edit.$id.tsx"),
            route("sidang", "routes/dosen/sidang.tsx"),
            route("penilaian", "routes/dosen/penilaian.tsx"),
            route("laporan", "routes/dosen/laporan.tsx"),
            route("prodi/sidang", "routes/dosen/prodi.sidang.tsx"),
            route("prodi/bimbingan", "routes/dosen/prodi.bimbingan.tsx"),
            route("profile", "routes/dosen/profile.tsx"),
        ]),
    ]),
    // Admin
    // Admin
    layout("routes/admin/layout.tsx", [
        ...prefix("admin", [
            index("routes/admin/dashboard.tsx"),
            route("users", "routes/admin/users.tsx"),
            route("create-account", "routes/admin/create-account.tsx"),
            route("edit-account/:id", "routes/admin/edit-account.$id.tsx"),
        ]),
    ]),
] satisfies RouteConfig;

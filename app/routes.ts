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
    // Writer
    // layout("routes/writer/writer-layout.tsx", [
    //     ...prefix("writer", [
    //         index("routes/writer/dashboard.tsx"),
    //         route("draft", "routes/writer/draft.tsx"),
    //         route("upload", "routes/writer/Writter.tsx"),
    //         route("video", "routes/writer/video.tsx"),
    //         route("media", "routes/writer/media.tsx"),
    //         route("edit-profile", "routes/writer/edit-profile.tsx"),
    //     ]),
    // ]),
    // Editor
    // layout("routes/Editor/editor-layout.tsx", [
    //     ...prefix("editor", [
    //         index("routes/Editor/pending.tsx"),
    //         route("media", "routes/Editor/media.tsx"),
    //         route("edit-article/:articleId", "routes/Editor/edit-article.$articleId.tsx"),
    //         route("edit-profile", "routes/Editor/edit-profile.tsx"),
    //     ]),
    // ]),

    // Mahasiswa
    layout("routes/mahasiswa/layout.tsx", [
        ...prefix("mahasiswa", [
            index("routes/mahasiswa/dashboard.tsx"),
            route("download", "routes/mahasiswa/download.tsx"),
            route("pengajuan", "routes/mahasiswa/pengajuan.tsx"),
            route("bimbingan", "routes/mahasiswa/bimbingan.tsx"),
            route("chat", "routes/mahasiswa/chat.tsx"),
            route("acara", "routes/mahasiswa/acara.tsx"),
            route("penilaian", "routes/mahasiswa/penilaian.tsx"),
        ]),
    ]),

    // Dosen
    layout("routes/dosen/layout.tsx", [
        ...prefix("dosen", [
            index("routes/dosen/dashboard.tsx"),
            route("download", "routes/dosen/download.tsx"),
            route("pengajuan", "routes/dosen/pengajuan.tsx"),
            route("bimbingan", "routes/dosen/bimbingan.tsx"),
            route("chat", "routes/dosen/chat.tsx"),
            route("acara", "routes/dosen/acara.tsx"),
            route("penilaian", "routes/dosen/penilaian.tsx"),
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
            // route("manage-account", "routes/admin/manage-account.tsx"),
            // route("upload", "routes/admin/Writter.tsx"),
            // route("advertisement", "routes/admin/advertisement.tsx"),
            // route("account-detail/:id", "routes/admin/account-detail.$id.tsx"),
            // route("log", "routes/admin/log-activity.tsx"),
            // route("create", "routes/admin/create.tsx"),
            // route("article", "routes/admin/articles.tsx"),
            // route("media", "routes/admin/media.tsx"),
            // route("edit/:id", "routes/admin/edit.$id.tsx"),
            // route("draft", "routes/admin/draft.tsx"),
        ]),
    ]),
] satisfies RouteConfig;

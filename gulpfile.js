// gulp読み込み
var gulp = require("gulp");

// browser-syncのプラグインの読み込み
var browserSync = require("browser-sync");

// タスクの設定
gulp.task("browserSyncTask", function () {
    browserSync({
        server: {
            baseDir: "src" // ルートとなるディレクトリを指定
        }
    });

    // srcフォルダ以下のファイルを監視
    gulp.watch("src/**/**.js", function() {
        browserSync.reload();   // ファイルに変更があれば同期しているブラウザをリロード
    });
});

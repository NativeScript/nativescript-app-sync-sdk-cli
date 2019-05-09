"use strict";

var gulp = require("gulp");
var plugins = require("gulp-load-plugins")();

gulp.task("tsd", function(done) {
    plugins.tsd({
        command: "reinstall",
        config: "tsd.json"
    }, done);
});

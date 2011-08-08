/*
Presents - A web library to show video/slides presentations

Copyright (C) 2011 Federico Fissore

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
(function() {
  var Html5Video, Presentz, Video, Vimeo;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Video = (function() {
    function Video(playState, pauseState, finishState, presentz) {
      this.playState = playState;
      this.pauseState = pauseState;
      this.finishState = finishState;
      this.presentz = presentz;
    }
    Video.prototype.handleEvent = function(id, event) {
      if (event === this.playState) {
        this.presentz.startTimeChecker();
      } else if (event === this.pauseState || event === this.finishState) {
        this.presentz.stopTimeChecker();
      }
      if (event === this.finishState && this.presentz.currentChapterIndex < (this.presentz.howManyChapters - 1)) {
        return this.presentz.changeChapter(chapter + 1, true);
      }
    };
    return Video;
  })();
  Html5Video = (function() {
    __extends(Html5Video, Video);
    function Html5Video(presentz) {
      Html5Video.__super__.constructor.call(this, "play", "pause", "ended", presentz);
    }
    Html5Video.prototype.changeVideo = function(videoData, play) {
      var video, videoHtml;
      if ($("#videoContainer").children().length === 0) {
        videoHtml = "<video controls preload='none' src='" + videoData.url + "' width='100%' heigth='100%'></video>";
        $("#videoContainer").append(videoHtml);
        video = $("#videoContainer > video")[0];
        video.addEventListener("play", this.handleEvent, false);
        video.addEventListener("pause", this.handleEvent, false);
        return video.addEventListener("ended", this.handleEvent, false);
      } else {
        video = $("#videoContainer > video")[0];
        return video.setAttribute("src", videoData.url);
      }
    };
    Html5Video.prototype.handleEvent = function(event) {
      return Html5Video.__super__.handleEvent.call(this, event.type);
    };
    return Html5Video;
  })();
  Presentz = (function() {
    function Presentz() {
      this.videoPlugins = [new Vimeo];
      this.defaultVideoPlugin = new Html5Video(this);
    }
    Presentz.prototype.registerVideoPlugin = function(plugin) {
      return this.videoPlugins.push(plugin);
    };
    Presentz.prototype.init = function(presentation) {
      var agenda, chapter, chapterIndex, plugin, videoPlugins, widths, _i, _len, _ref, _ref2;
      this.presentation = presentation;
      this.howManyChapters = this.presentation.chapters.length;
      this.currentChapterIndex = 0;
      _ref = this.presentation.chapters;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        chapter = _ref[_i];
        this.totalDuration += parseInt(chapter.duration);
      }
      widths = this.computeBarWidths(100, true);
      agenda = '';
      for (chapterIndex = 0, _ref2 = this.presentation.chapters.length - 1; 0 <= _ref2 ? chapterIndex <= _ref2 : chapterIndex >= _ref2; 0 <= _ref2 ? chapterIndex++ : chapterIndex--) {
        agenda += "<div title='" + this.presentation.chapters[chapterIndex].title + "' style='width: " + widths[chapterIndex] + "%' onclick='changeChapter(" + chapterIndex + ", true);'>&nbsp;</div>";
      }
      $("#agendaContainer").html(agenda);
      $("#agendaContainer div[title]").tooltip({
        effect: "fade",
        opacity: 0.7
      });
      videoPlugins = (function() {
        var _j, _len2, _ref3, _results;
        _ref3 = this.videoPlugins;
        _results = [];
        for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
          plugin = _ref3[_j];
          if (plugin.handle(this.presentation)) {
            _results.push(plugin);
          }
        }
        return _results;
      }).call(this);
      if (videoPlugins.length > 0) {
        return this.videoPlugin = videoPlugins[0];
      } else {
        return this.videoPlugin = this.defaultVideoPlugin;
      }
    };
    Presentz.prototype.computeBarWidths = function(max) {
      var chapter, chapterIndex, maxIndex, sumOfWidths, width, widths, _i, _j, _len, _len2, _ref, _ref2;
      chapterIndex = 0;
      widths = [];
      sumOfWidths = 0;
      chapterIndex = 0;
      _ref = this.presentation.chapters;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        chapter = _ref[_i];
        width = chapter.durationmax / this.totalDuration;
        if (width === 0) {
          width = 1;
        }
        widths[chapterIndex] = width;
        sumOfWidths += width;
        chapterIndex++;
      }
      maxIndex = 0;
      if (sumOfWidths > (max - 1)) {
        chapterIndex = 0;
        _ref2 = this.presentation.chapters;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          chapter = _ref2[_j];
          if (widths[chapterIndex] > widths[maxIndex]) {
            maxIndex = chapterIndex;
          }
          chapterIndex++;
        }
      }
      widths[maxIndex] = widths[maxIndex] - (sumOfWidths - (max - 1));
      return widths;
    };
    Presentz.prototype.changeChapter = function(chapterIndex, play) {
      var currentMedia;
      this.currentChapterIndex = chapterIndex;
      currentMedia = this.presentation.chapters[this.currentChapterIndex].media;
      this.changeSlide(currentMedia.slides[0].slide);
      return this.videoPlugin.changeVideo(currentMedia.video, play);
    };
    Presentz.prototype.changeSlide = function(slideData) {
      $("#slideContainer").empty();
      return $("#slideContainer").append("<img width='100%' heigth='100%' src='" + slideData.url + "'>");
    };
    Presentz.prototype.startTimeChecker = function() {
      clearInterval(this.interval);
      this.intervalSet = true;
      return this.interval = setInterval(update_properties, 1000);
    };
    Presentz.prototype.stopTimeChecker = function() {
      clearInterval(this.interval);
      return this.intervalSet = false;
    };
    return Presentz;
  })();
  window.Presentz = Presentz;
  Vimeo = (function() {
    __extends(Vimeo, Video);
    function Vimeo() {
      Vimeo.__super__.constructor.call(this, "play", "pause", "finish");
      this.wouldPlay = false;
    }
    Vimeo.prototype.handle = function(presentation) {
      return presentation.chapters[0].media.video.url.toLowerCase().indexOf("http://vimeo.com") !== -1;
    };
    Vimeo.prototype.changeVideo = function(videoData, play) {
      var atts, movieUrl, params, wouldPlay;
      movieUrl = "http://vimeo.com/moogaloop.swf?clip_id=" + (videoData.url.substr(videoData.url.lastIndexOf("/") + 1));
      $("#videoContainer").empty();
      $("#videoContainer").append("<div id='vimeoContainer'></div>");
      params = {
        allowscriptaccess: "always",
        flashvars: "api=1&player_id=vimeoplayer&api_ready=video.onPlayerReady&js_ready=video.onPlayerReady"
      };
      atts = {
        id: "vimeoplayer"
      };
      swfobject.embedSWF(movieUrl, "vimeoContainer", "425", "356", "8", null, null, params, atts);
      return wouldPlay = play;
    };
    Vimeo.prototype.onPlayerReady = function(id) {
      var video, wouldPlay;
      video = document.getElementById(id);
      video.api_addEventListener("play", "video.handleVideoEvent");
      video.api_addEventListener("pause", "video.handleVideoEvent");
      video.api_addEventListener("finish", "video.handleVideoEvent");
      if (wouldPlay) {
        wouldPlay = false;
        if (!intervalSet) {
          startTimeChecker();
        }
        return video.api_play();
      }
    };
    return Vimeo;
  })();
}).call(this);
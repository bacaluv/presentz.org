class SlideShare

  constructor: (@presentzSlideShare) ->
    @slideshare_infos = {}
    @slideshare_url_to_doc_ids = {}

  handle: (url) ->
    @presentzSlideShare.handle({ url: url })

  thumb_type_of: (url) ->
    "swf"

  to_doc_id: (url) ->
    @presentzSlideShare.slideId({url: url})

  to_slide_number: (url) ->
    parseInt(@presentzSlideShare.slideNumber({url: url}))

  make_url = (doc_id, slide_number) ->
    "http://www.slideshare.net/#{doc_id}##{slide_number}"

  slide_info: (slide, callback) ->
    doc_id = @to_doc_id slide.url

    pack_response = (doc_id, slide, callback) =>
      number = @to_slide_number slide.url
      slides = @slideshare_infos[doc_id].Show.Slide
      return callback("Invalid slide number #{number}") if number > slides.length

      slide_thumb = slides[number - 1].Src
      callback undefined, slide,
        public_url: slide.public_url
        number: number
        slide_thumb: slide_thumb

    if @slideshare_infos[doc_id]?
      pack_response doc_id, slide, callback
    else
      $.get "/m/api/slideshare/#{doc_id}", (ss) =>
        @slideshare_infos[doc_id] = ss
        pack_response doc_id, slide, callback

  url_from_public_url: (slide, callback) ->
    slide_number = @to_slide_number slide.url
    public_url = slide.public_url

    if @slideshare_url_to_doc_ids[public_url]?
      callback make_url(@slideshare_url_to_doc_ids[public_url], slide_number)
      return

    $.get "/m/api/slideshare/url_to_doc_id", { url: public_url }, (ss) =>
      doc_id = ss.Slideshow.PPTLocation
      @slideshare_url_to_doc_ids[slide.public_url] = doc_id
      callback make_url(doc_id, slide_number)

  change_slide_number: (old_url, slide_number) ->
    old_url.substring(0, old_url.lastIndexOf("#") + 1).concat(slide_number)

class DummySlideBackend

  handle: (url) -> true

  thumb_type_of: (url) ->
    return "swf" if url.indexOf(".swf") isnt -1
    "img"

  slide_info: (slide, callback) ->
    callback undefined, slide,
      public_url: slide.url
      slide_thumb: slide.url

  url_from_public_url: (slide, callback) ->
    callback slide.public_url

@presentzorg.slide_backends = {}
@presentzorg.slide_backends.SlideShare = SlideShare
@presentzorg.slide_backends.DummySlideBackend = DummySlideBackend
$(function() {
  window.json = {};
  function loadCampusData(campus) {
    /* campus is one of NB NK CM */
    function loadUrl(url, campus, level) {
      var yurl = 'https://query.yahooapis.com/v1/public/yql';

      $.ajax({
        'url': yurl,
        'data': {
          'q': 'SELECT * FROM json WHERE url="'+url+'"',
          'format': 'json',
          'jsonCompat': 'new',
        },
        'dataType': 'jsonp',
        'success': function(response) {
          if(!window.json[campus]) {
            window.json[campus] = response.query.results.json;
          } else {
            $.extend(true, window.json[campus], response.query.results.json);
          }
        },
      });

    }
    var base_url = 'https://rumobile.rutgers.edu/1/indexes/92013';

    // if we haven't already loaded the data.
    if(!window.json[campus] || !window.json[campus]['U'])
      loadUrl(base_url + '_' + campus + '_U.json', campus, 'U')
    if(!window.json[campus] || !window.json[campus]['G'])
      loadUrl(base_url + '_' + campus + '_G.json', campus, 'G')
  }

  function selectCampus(campus) {
    window.localStorage.setItem('campus', campus);
    $('.campus').removeClass('active');
    $('button.campus[value="'+campus+'"]').addClass('active');
    $('#scheduler').show();    
    loadCampusData(campus)
  }

  if(window.localStorage.getItem('campus')) {
    selectCampus(window.localStorage.getItem('campus'));
  }

  $('.campus').click(function() {
    selectCampus($(this).val());
  });

  $('.search-bar').autocomplete({
    'source': function(request, response) {
      var term = request.term;
      
      var courses = window.json[window.localStorage.getItem('campus')];

      var results = autocomplete(courses, term);
      console.log(results)

      response(_.map(results, function (item) {
        if(item.course) {
          item.value = courses['ids'][item.subj]['courses'][item.course]
        } else {
          item.value = courses['ids'][item.subj]['name'];
        }
        return item;
      }));
    },

    'select': function(event, ui) {
      params = {}
      if(ui.item.course) {
        //redirect to course page.
        params.subj = ui.item.subj;
        params.course = ui.item.course;
      } else {
        //redirect to department page.
        params.subj = ui.item.subj;
      }
      params.campus = window.localStorage.getItem('campus');
      window.location.href = '/list?' + $.param(params);
    }
  }).data('ui-autocomplete')._renderItem = function(ul, item) {
    var li = $('<li class="result"></li>');
    li.append('<p class="result-title">' + item.value + ' Herping</p>')
    li.append('<p class="result-type"> Department </p>')
    li.append('<p class="result-code"> 198:111:01 </p>')
    li.appendTo(ul);
    return ul;
  };
});

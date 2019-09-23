  CRM.$(function ($) {
    // The "source" is the DOM selector that triggers the lookup (ex: postcode field)
    if (!CRM.regionlookup.source) {
      return;
    }

    cj.fn.crmRegionLookup = function (source, country, num) {
      return this.each(function () {
        $this = cj(this);

        if ($this.hasClass('crm-regionlookup-processed')) {
          return;
        }

        $this.addClass('crm-regionlookup-processed');

        $this.focusout(function () {
          crmFetchData(source, country, num);
        });
      });
    };

    // Generate regular expression to search for source field
    var rlsource_regex = CRM.regionlookup.source;
    var rlsource_arr;

    // Separate class and type of object from its id
    var rlsource_id = CRM.regionlookup.source.split("#");
    if (rlsource_id.length == 2) {
      // Get the start and end of the object id
      rlsource_arr = rlsource_id[1].split("&");
      if (rlsource_arr.length == 2) {
        rlsource_regex = rlsource_id[0] + "[id^=" + rlsource_arr[0] + "][id$=" + rlsource_arr[1] + "]";
      }
    }
    else {
      // Get the start and end of the object id
      rlsource_arr = CRM.regionlookup.source.split("&");
      if (rlsource_arr.length == 2) {
        rlsource_regex = "[id^=" + rlsource_arr[0] + "][id$=" + rlsource_arr[1] + "]";
      }
    }

    // Search for objects that meet the regular expression
    $(rlsource_regex).each(function(index) {
      var rlsource_num = "1";

      // Get address index
      if (rlsource_arr.length == 2) {
        rlsource_num = $(this).attr("id").replace(rlsource_arr[0],"").replace(rlsource_arr[1],"");
      }

      // Replace multi-address wildcard
      var rlsource = CRM.regionlookup.source.replace(/&/,rlsource_num);
      var rlsource_country = CRM.regionlookup.source_country.replace(/&/,rlsource_num);

      // Always enable on the main element
      cj(rlsource).crmRegionLookup($(rlsource),rlsource_country,rlsource_num);

    });

    // After ajax calls, check to see if there are new elements to handle.
    $(document).ajaxComplete(function (event, request, settings) {
      // Search for objects that meet the regular expression
      $(rlsource_regex).each(function(index) {
        var rlsource_num = "1";

        // Get address index
        if (rlsource_arr.length == 2) {
          rlsource_num = $(this).attr("id").replace(rlsource_arr[0],"").replace(rlsource_arr[1],"");
        }

        // Replace multi-address wildcard
        var rlsource = CRM.regionlookup.source.replace(/&/,rlsource_num);
        var rlsource_country = CRM.regionlookup.source_country.replace(/&/,rlsource_num);

        cj(rlsource).crmRegionLookup($(rlsource),rlsource_country,rlsource_num);

      });
    });

    function crmFetchData(selector, country, num) {

      if (!selector.val()) {
        return;
      }

      country_selected = cj(country + ' option:checked').val();

      var excluded_fields = ['source', 'source_country'];

      if (country_selected != '') {
        var query = CRM.url('civicrm/regionlookup/postcode/') + country_selected + '/' + selector.val() + '.json';
      } else {
        var query = CRM.url('civicrm/regionlookup/postcode/') + 'all/' + selector.val() + '.json';
      }

      $.getJSON(query, function (data) {
        if (data) {
          // If one or less results found, act normally
          if (data.length <= 1) {
            $.each(data, function (key, val) {
              $.each(val, function (keyint, valint) {
                if ((keyint != 'source' && CRM.regionlookup[keyint]) && (keyint != 'source_country' && CRM.regionlookup[keyint])) {
                  // Replace & for address counter
                  $(CRM.regionlookup[keyint].replace(/&/,num)).val(valint).change();
                }
              });
            });
          } else {
            cities = CRM.regionlookup.tr_multiple_records_title;
            cities += '<ul>';
            // More than one data is found
            $.each(data, function (key, val) {
              city_onclick = '';
              $.each(val, function (keyint, valint) {
                if (keyint != 'source' && keyint != 'source_country') {
                  // Prepare city picker
                  if (keyint === 'city') {
                    city_keyint = keyint;
                    city_key = key;
                    city_valint = valint;
                  }

                  // When selecting a city, you can also change fields
                  if (valint && CRM.regionlookup[keyint]) {
                    city_onclick += 'cj(\'' + CRM.regionlookup[keyint].replace(/&/,num) + '\').val(\'' + valint + '\').change();';
                  }
                }
              });
              // Prepare city picker
              var link_constructor = '<a href="#" title=' + city_keyint + ' onclick="' + city_onclick + 'return false;">' + city_valint + '</a>';
              cities += '<li class="suggested-' + city_key + '">' + CRM.regionlookup.tr_city + ': ' + link_constructor + '</li>';
            });
            cities += '</ul>';
            cities += CRM.regionlookup.tr_city_selector;
            // Show a warning in the form of a dialogue
            CRM.$('<div class="multicities_selector"></div>').dialog({
              modal: true,
              width: 500,
              height: 400,
              title: CRM.regionlookup.tr_multiple_results,
              open: function () {
                $(this).html(cities);
              },
              buttons: {
                "Ok": {
                  click: function () {
                    $(this).dialog("close");
                  },
                  text: 'Ok',
                  class: 'regionlookup_confirm_button'
                }
              }
            });

          }
        }

        // Call a custom callback function, if any.
        // FIXME: this sounds really wrong.
        // Should be an anon function in the $(foo).crmRegionLookup() call?
        // FIXME: do not rely on $this being passed as an argument. Need to find a cleaner way.
        if (CRM.regionlookup.callback) {
          eval(CRM.regionlookup.callback + '(data, $this)');
        }
      });
    }


  });

/*!
 * 
    SimplePage.js 

    -   A simple pagination plugin for paging data fetched via Ajax. No more, no less.
    -   Easy configuration, takes all the hardwork of building the 
        control/widget for you =)
    -   Bootstrap 3.0 support, depends on it for the controls
    -   Supports sorting
    -   Supports filters
    -   Supports search
    -   Display pager on top or bottom or both!
    -   Display a preloader image
    -   You control the formatting of the result via Handlebars.js templating!
        This means that you won't be mashing strings to format
        you result. Now you can do a grid based layout or if you
        prefer, a table/list format.

 *
 * Copyright 2013 Junel L. Mujar
 * Licensed under the Apache License v2.0
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

(function($){
    "use strict";
    $.fn.simplePage = function (options) {

        // Private vars for sorting & searching
        // Start: -----------------------------
        var settings, search_term, sort_icon, sort_by, sort_direction, preloader, default_direction, pager_container, pager_control, data_control, filter_ctrl, sort_ctrl, info_control, s;
        // ------------------------------- :End

        // Private vars for string templates
        // that will be used to build our control
        // Start: --------------------------------------------------------------------------
        preloader          =   '<div class="sp-preloader"></div>';

        default_direction  =   'DESC';

        pager_container    =   '<div class="row sp-container">' +
                                        '<div class="col-lg-6 col-md-5 col-sm-5">' +
                                            '<div class="sp-pager-container">_pager_ctrl_</div>' +
                                        '</div>' +
                                        '<div class="col-lg-6 col-md-7 col-sm-7">' +
                                            '<form role="form" class="sp-search form-inline pull-right hidden-xs">' +
                                                '_filter_ctrl_' +
                                                '_sort_ctrl_' +
                                                '<div class="form-group">' +
                                                    '<input type="text" class="form-control sp-keyword" placeholder="Search..." />' +
                                                '</div> ' +
                                                '<input type="submit" name="submit" value="Go" class="btn btn-default sp-keyword-submit">' +
                                            '</form>' +
                                        '</div>' +
                                    '</div>';

        pager_control      =   '<div class="sp-pager btn-group">'+
                                        '<a href="#" class="btn btn-default first">First</a> '+
                                        '<a href="#" class="btn btn-default prev">Prev</a>'+
                                        '<a href="#" class="sp-current-page btn btn-default disabled"><span></span></a>'+
                                        '<a href="#" class="btn btn-default next">Next</a> '+
                                        '<a href="#" class="btn btn-default last">Last</a>'+ 
                                    '</div>';
        
        data_control       =   '<div class="row sp-data"></div>';
        info_control       =   '<div class="sp-info"><div class="col-lg-12">Result returned _total_ items.</div></div>';

        sort_direction     = default_direction;
        // -------------------------------------------------------------------------- :End

        // Establish our default settings
        // Start: -----------------------------
        settings = $.extend({
            source        : '',
            template      : '',
            template_data : '',
            sort_fields   : null,
            filter_fields : null,
            current_page  : 1,
            per_page      : 10,
            total_items   : 100,
            pager_top     : true,
            pager_bottom  : false,
            custom_sort   : true,
            preloader     : false,
            callback      : null
        }, options);
        // ------------------------------- :End

        // Clear container
        $(this).empty();

        // We have filters!! Let's populate it!
        // Depends on Booststrap button group control
        // Note: Depends on a defined JSON format
        if (settings.filter_fields) {
            filter_ctrl =  '<div class="btn-group sp-filter _filter_position_">' +
                                    '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">' +
                                        'Filter <i class="caret"></i>' +
                                    '</button>' +
                                    '<ul class="dropdown-menu sp-filter-control" role="menu"  style="width: 200px;">_filter_items_</ul>' +
                                '</div> ';
            s = '';
            /*jslint unparam: true*/
            $.each(settings.filter_fields, function (index, item) { 
                $.each(item,  function (filter_index, filter_item) {
                    s += '<li class="dropdown-header sp-dropdown-header">' + filter_index + '</li>';
                    $.each(filter_item, function (a, b) {
                        s += '<li><a href="#" data-index="' + a +'" data-text="' + b + '">'+ b +'</a></li>';
                    });
                });
            });            
            /*jslint unparam: false*/
            filter_ctrl     = filter_ctrl.replace('_filter_items_', s);
            pager_container = pager_container.replace("_filter_ctrl_", filter_ctrl);
        } else {
            pager_container = pager_container.replace("_filter_ctrl_", "");
        }

        // Sort control pre-population
        // Depends on Booststrap button group control
        // Note: Depends on a defined JSON format
        if (settings.sort_fields) {
            sort_ctrl =    '<div class="btn-group sp-sort _sort_position_">' +
                                    '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">' +
                                        'Sort <i class="caret"></i>' +
                                    '</button>' +
                                    '<ul class="dropdown-menu sp-sort-control" role="menu" style="width: 200px;">_sort_items_</ul>' +
                                '</div> ';
               
            s = ''; 
            /*jslint unparam: true*/
            $.each(settings.sort_fields, function (index, item) { 
                s += '<li><a href="#" data-sort-field="' + index +'" data-text="' + item + '">'+ item +'</a></li>';
            });
            /*jslint unparam: false*/
            sort_ctrl = sort_ctrl.replace('_sort_items_', s);
            pager_container = pager_container.replace("_sort_ctrl_", sort_ctrl);
        } else {    
            pager_container = pager_container.replace("_sort_ctrl_", "");
        }

        // Let's build the whole control
        // Pager is visible on top; append pager container
        if (settings.pager_top) {
            pager_container = pager_container.replace("_drop_direction_", "");
            pager_container = pager_container.replace("_pager_ctrl_", pager_control);
            $(this).append(pager_container);
        }
    
        
        // Append the container that will contain the data;
        if (settings.template_data !== '') {
            $(this).append(settings.template_data);
        } else {
            $(this).append(data_control);
        }

        // Pager is visible on the bottom; append pager container
        if (settings.pager_bottom) {
            pager_container = pager_container.replace("_sort_position_", "dropup");
            pager_container = pager_container.replace("_filter_position_", "dropup");
            pager_container = pager_container.replace("_pager_ctrl_", pager_control);
            $(this).append(pager_container);
        }


        // Remove disabled style
        function clear_styles (parent) 
        {
            $(parent).children().each(function () 
            {
                $(this).removeClass("current disabled");
            });
        }

        // Compute pages 
        function compute_pages (total_items, per_page) 
        {
            return Math.ceil(total_items / per_page);
        }

        // Private Functions
        function set_active (parent, control) 
        {
            clear_styles(parent);
            $(parent + " > " + control).addClass("current disabled");
        }

        // Update current page
        function update_page (current_page) 
        {
            $(settings.control_class + " .sp-current-page > span").html(current_page + ' of ' + settings.total_pages);
        }

        // Fetch JSON data
        function fetch (current_page, keyword, sort, direction) {

            $(settings.control_class + " .sp-current-page > span").html('Loading...');
            if (settings.preloader === true) {
                $(".sp-data").html(preloader);
            }

            $.ajax({

                url: settings.source,
                type: "POST",
                dataType: "json",
                data: { page: current_page, 
                        pages: settings.per_page, 
                        keyword: keyword, 
                        sortby: sort,
                        direction: direction }

            }).done(function ( o ) {
                
                var html, source, template;
                
                source   = $(settings.template).html();
                template = Handlebars.compile(source);
                html     = template(o.result);
                
                if (o.total > 0) 
                {

                    settings.total_pages = compute_pages(o.total, settings.per_page);

                    update_page(current_page);
                    sort_by        = o.sort_by;
                    sort_direction = o.sort_direction;
                    
                    $('.sp-sort').show();
                    $('.sp-pager').show();
                    $('.sp-container').show();

                    if (settings.total_pages === 1) {
                        set_active(settings.control_class, ".first, .prev, .last, .next");
                    }

                } 
                else 
                {
                    o.result = null;
                    $(settings.control_class + " .sp-current-page > span").html('0 Found');

                    if (o.mode == 'list') 
                    {
                        $('.sp-container').hide();
                    } 
                    else 
                    {
                        $('.sp-sort').hide();
                        $('.sp-pager').hide();
                    }
                    set_active(settings.control_class, ".first, .prev, .last, .next");
                }

                $('.sp-data').hide();
                $('.sp-data').html(template({ "data" : o.result }));
                $('.sp-data').show();

                if (settings.custom_sort) {

                    $('.sp-custom-sort-control').click(function (e) {
                        e.preventDefault();

                        var selected_item;
                        selected_item = $(this).attr("data-sort-field");

                        if (selected_item) {
                            if (selected_item === sort_by) {
                                switch (sort_direction) {
                                    case "DESC":
                                        sort_icon      = '<i class="icon-caret-up pull-right"></i>';
                                        sort_direction = 'ASC';
                                    break;
                                    case "ASC":
                                        sort_icon      = '<i class="icon-caret-down pull-right"></i>';
                                        sort_direction = 'DESC';
                                    break;
                                }
                            } else {
                                sort_icon      = '<i class="icon-caret-down pull-right"></i>';
                                sort_direction = default_direction;
                            }
                            fetch(settings.current_page, search_term, selected_item, sort_direction);
                            sort_by = selected_item;
                        }                    
                    });

                    var current_sort_header = $('.sp-custom-sort-control[data-sort-field='+sort_by+']');
                    current_sort_header.html(current_sort_header.html() + sort_icon);

                    if (settings.sort_fields) {
                        // Remove current marker
                        $('.sp-sort-control > li a').each(function() {
                            $(this).html($(this).attr('data-text'));
                        })
                        
                        // Set asc/desc marker based on the active item
                        var current_sort_item = $('.sp-sort-control > li a[data-sort-field='+sort_by+']');
                        current_sort_item.html(current_sort_item.attr('data-text') + sort_icon);                    
                    }
                }

                // make sure the callback is a function
                if (typeof settings.callback === 'function')  
                { 
                    settings.callback.call(this); // brings the scope to the callback
                }

            }); 

        }

        // Bind to click event on the sorting control
        // Update direction and indicate active sorting item
        if (settings.sort_fields) 
        {
            $('.sp-sort-control > li a').bind("click", function (e) {
                e.preventDefault();
                
                var selected_item;

                selected_item = $(this).attr("data-sort-field");

                if (selected_item) {

                    if (selected_item === sort_by) {
                        switch (sort_direction) {
                            case "DESC":
                                sort_icon      = '<i class="icon-caret-up pull-right"></i>';
                                sort_direction = 'ASC';
                            break;
                            case "ASC":
                                sort_icon      = '<i class="icon-caret-down pull-right"></i>';
                                sort_direction = 'DESC';
                            break;
                        }
                    } else {
                        sort_icon      = '<i class="icon-caret-down pull-right"></i>';
                        sort_direction = default_direction;
                    }                    
                    fetch(settings.current_page, search_term, selected_item, sort_direction);
                    sort_by = selected_item;
                }
                
                // Clean-up text
                $('.sp-sort-control > li a').each(function () {
                    $(this).parent().removeClass('active-dark');
                    $(this).html($(this).attr('data-text'));
                });

                // Apply active key style and direction
                $(this).parent().addClass('active-dark');
                $(this).html($(this).attr('data-text') + sort_icon);

            });
        }

        // Bind to click event on the sorting control
        // Update direction and indicate active sorting item
        if (settings.filter_fields) 
        {
            $('.sp-filter-control > li a').bind("click", function (e) {
                e.preventDefault();
            });
        }    
        // Settings get/set
        settings.control_class = '.sp-pager';

        // First Page
        $(settings.control_class + " > .first").bind("click", function (e) 
        {
            e.preventDefault();
            settings.current_page = 1;
            set_active(settings.control_class, ".first, .prev");
            fetch(settings.current_page, search_term);
        });
        
        // Last Page
        $(settings.control_class + " > .last").bind("click", function (e) 
        {
            e.preventDefault();
            settings.current_page = settings.total_pages;
            set_active(settings.control_class, ".last, .next");
            fetch(settings.current_page, search_term);
        });

        // Next Page
        $(settings.control_class + " > .next").bind("click", function (e) 
        {
            e.preventDefault();
            if (settings.current_page < (settings.total_pages - 1)) {
                settings.current_page++;
                clear_styles(settings.control_class);
            } else {
                settings.current_page = settings.total_pages;
                set_active(settings.control_class, ".last, .next");
            }            
            fetch(settings.current_page, search_term);
        });

        // Prev Page        
        $(settings.control_class + " > .prev").bind("click", function (e) 
        {
            e.preventDefault();
            if ((settings.current_page - 1) > 1) 
            {
                settings.current_page--;
                clear_styles(settings.control_class);
            } else 
            {
                settings.current_page = 1;
                set_active(settings.control_class, ".prev, .first");
            }       
            fetch(settings.current_page, search_term);
        });



        // Search control
        $(".sp-container .sp-keyword-submit").bind("click", function (e) {
            e.preventDefault();

            // Get keyword or term
            search_term           = $(".sp-keyword").val();
            
            // Reset to page 1; just case we're on a different page
            // and search request is made. If not will result in
            // an empty result
            settings.current_page = 1;
            set_active(settings.control_class, ".first, .prev");

            // Perform search
            fetch(settings.current_page, search_term);                
        });

        // Init
        return this.each( function () {
            if (settings.current_page === 1) 
            {
                fetch(settings.current_page);
                set_active(settings.control_class, ".first, .prev");
                $('.sp-sort').hide();
                $('.sp-pager').hide();                
            }
        });

    };

}(jQuery));
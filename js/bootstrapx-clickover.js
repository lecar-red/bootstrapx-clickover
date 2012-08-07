/* ==========================================================
 * bootstrapx-clickover.js
 * https://github.com/lecar-red/bootstrapx-clickover
 * ==========================================================
 *
 * Based on work from Twitter Bootstrap and 
 * from Popover library http://twitter.github.com/bootstrap/javascript.html#popover
 * from the great guys at Twitter.
 *
 * ========================================================== */
!function($) {
  "use strict"

  /* class definition */
  var Clickover = function ( element, options ) {
    // local init
    this.cinit('clickover', element, options );
  }

  Clickover.prototype = $.extend({}, $.fn.popover.Constructor.prototype, {

    constructor: Clickover

    , cinit: function( type, element, options ) {
      this.attr = {};

      // setup event ns space to safely remove the click hanlder
      this.attr.me = +(new Date); // IE 8 doesn't like Date.now();
      this.attr.click_event_ns = "click." + this.attr.me;

      if (!options) options = {};

      options.trigger = 'manual';

      // call parent
      this.init( type, element, options );

      // setup our own handlers
      this.$element.on( 'click', this.options.selector, $.proxy(this.clickery, this) );

      // soon add click hanlder to body to close this element
      // will need custom handler inside here
    }
    , clickery: function(e) {
      // clickery isn't only run by event handlers can be called by timeout or manually
      // only run our click handler and  
      // need to stop progration or body click handler would fire right away
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      // set popover's dim's
      this.options.width  && this.tip().find('.popover-inner').width(  this.options.width  );
      this.options.height && this.tip().find('.popover-inner').height( this.options.height );

      // set popover's tip 'id' for greater control of rendering or css rules
      this.options.tip_id     && this.tip().attr('id', this.options.tip_id );

      // add a custom class
      this.options.class_name && this.tip().addClass(this.options.class_name);

	  // we could override this to provide show and hide hooks 
      this.toggle();

      // if shown add global click closer
      if ( this.isShown() ) {
        // close on global request
        this.options.global_close &&
          $('body').one( this.attr.click_event_ns, $.proxy(this.clickery, this));
          
        this.options.esc_close && $(document).bind('keyup.clickery',function(e){ // keyup with eventnamespace
	   (e.keyCode == 27)?that.clickery():return;
        });

        // help us track elements w/ open clickovers using html5
        this.$element.attr('data-clickover-open', 1);

		// make sure to not close when clicked inside tip unless
		// its the button
        //
        // TODO: make this be smarter, it needs to check for e.target 
        // and then stop propgration but other elements can receive click event
        // (elements on top of clickover should receive click events)
        // 
        this.tip().on('click', function(e) { e.stopPropagation(); });

        // if element has close button then make that work, like to
        // add option close_selector
        this.tip().on('click', '[data-dismiss="clickover"]', $.proxy(this.clickery, this));

        // trigger timeout hide
        if ( this.options.auto_close && this.options.auto_close > 0 ) {
          this.attr.tid = 
            setTimeout( $.proxy(this.clickery, this), this.options.auto_close );  
        }

        // provide callback hooks for post shown event
        typeof this.options.onShown == 'function' && this.options.onShown.call(this);
        this.$element.trigger('shown');
      }
      else {
        this.$element.removeAttr('data-clickover-open');
	this.options.esc_close && $(document).unbind('keyup.clickery');
        $('body').off( this.attr.click_event_ns ); 

        if ( typeof this.attr.tid == "number" ) {
          clearTimeout(this.attr.tid);
          delete this.attr.tid;
        }

		// provide some callback hooks
        typeof this.options.onHidden == 'function' && this.options.onHidden.call(this);
        this.$element.trigger('hidden');
      }
    }
    , isShown: function() {
      return this.tip().hasClass('in');
    }
    , debughide: function() {
      var dt = new Date().toString();

      console.log(dt + ": clickover hide");
      this.hide();
    }
  })

  /* plugin definition */
  /* stolen from bootstrap tooltip.js */
  $.fn.clickover = function( option ) {
    return this.each(function() {
      var $this = $(this)
        , data = $this.data('clickover')
        , options = typeof option == 'object' && option

      if (!data) $this.data('clickover', (data = new Clickover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.clickover.Constructor = Clickover

  // these defaults are passed directly to parent classes
  $.fn.clickover.defaults = $.extend({}, $.fn.popover.defaults, {
    trigger: 'manual',
    auto_close:   0, /* ms to auto close clickover, 0 means none */
    global_close: 1, /* allow close when clicked away from clickover */
    esc_close:1, /* allow close when pressed esc */
    onShown:  null,  /* function to be run once clickover has been shown */
    onHidden: null,  /* function to be run once clickover has been hidden */
    width:  null, /* number is px (don't add px), null or 0 - don't set anything */
    height: null, /* number is px (don't add px), null or 0 - don't set anything */
    tip_id: null,  /* id of popover container */
    class_name: 'clickover' /* default class name in addition to other classes */
  })

}( window.jQuery );


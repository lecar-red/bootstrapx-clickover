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
      // only run our click handler
      e.preventDefault();

      // need to stop progration or body click handler would fire right away
      e.stopPropagation();
   
	  // we could override this to provide show and hide hooks 
      this.toggle();

      // if shown add global click closer
      if ( this.isShown() ) {
        this.options.global_close &&
          $('body').one( this.attr.click_event_ns, $.proxy(this.hide, this));

		// make sure to not close when clicked inside tip unless
		// its the button
		this.tip().on('click', function(e) { e.stopPropagation(); });

        // if element has close button then make that work, like to
        // add option close_selector
        this.tip().on('click', '[data-dismiss="clickover"]', $.proxy(this.hide, this));

        // trigger timeout hide
        if ( this.options.auto_close && this.options.auto_close > 0 ) {
          this.attr.tid = 
            setTimeout( $.proxy(this.hide, this), this.options.auto_close );  
        }

		// provide callback hooks for post shown event
		typeof this.options.onShown == 'function' && this.options.onShown.call(this);
		this.$element.trigger('shown');
      }
      else {
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
    onShown:  null,
    onHidden: null
  })

}( window.jQuery );


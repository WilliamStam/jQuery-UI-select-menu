/*
 * jQuery UI Selectmenu 0.0.4 (2011-02-10)
 *
 * Copyright (c) 2011 AWStam
 * 
 * Licensed under the MIT:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * http://sugaslide.github.com/jQuery-UI-select-menu/
 *
 * Depends:
 *    jquery.ui.core.js
 *    jquery.ui.widget.js
 *    jquery.ui.position.js
 */

;
(function($){
	$.widget("ui.selectmenu",{
		// ----- Widget options and defaults -----
		options: {
			speed: 400,
			maxHeight: 300,
			direction: "auto", // up, down, auto
			width:"",
			before: function(){},
			after: function(){},
			change: function(){}
		},
		// ----- create the instance -----
		_create: function(){
			var self=this,
				o=self.options,
				el=self.element;

			var zindex=(el.css("zindex") )?el.css("zindex"):0

			this.before();	// run this function before anything else happens

			// ----- define the templates to be used for the various parts -----
			this.tmplOptgroup='<li class="group"><div class="ui-widget-header">%label%</div><ul>%data%</ul></li>';
			this.tmplOptions='<li data-value="%value%" class="%class%">%label%</li>';
			// ----- define the templates to be used for the various parts -----

			var icon="ui-icon-triangle-1-s", // the icon to be used on the button
				listdata=el.children().map(
					function(){ // the lists data. the stuff that goes inside the ul tags
						var $this=$(this);
						if($this.is('optgroup')){
							var data=$this.children().map(
								function(){
									return self._buildMenu($(this));
								}).get().join("\n");
							return self.tmplOptgroup.replace("%label%",$this.attr("label")).replace("%data%",data);
						} else{

							return self._buildMenu($this);

						}

					}).get().join("");

			this.settings=o;

			this.select=el;

			var makewidth=(o.width)?o.width:el.outerWidth()+30;

			// ----- the button and its events -----
			this.btn=$('<button type="button">loading...</button>').text($("option:selected",el).text()).addClass("ui-selectmenu-btn").css({
				width: makewidth
			}).button({
			              icons: {
				              secondary: icon
			              }
			          }).click(function(e){
				self._showMenu();
				return false;
			});
			// ----- the button and its events -----

			// ----- defining the variables for positioning of the menu -----
			var collision=(!o.direction||o.direction!='auto')?"none":""; // if direction isnt set in the options the list uses collision flip

			// ----- building the main list. adding the positioning variables as data to be used a little later	------
			this.list=$('<ul/>',{
				'id': el.attr("id")+'-list',
				'class': "ui-selectmenu-list shadow border ui-corner-all ui-widget-content"
			}).data({
			            "direction": o.direction?o.direction:"",
			            "speed":o.speed,
			            "collision":collision,
			            "zindex": zindex,
			            "element":this.element

			        }).append(listdata).css({
			                                    width: this.btn.outerWidth(),
			                                    "max-height":o.maxHeight,
			                                    zindex: this.btn.css("zindex")+1
			                                });
			// ----- building the main list. adding the positioning variables as data to be used a little later	------

			// ----- wrap the whole thing inside a div. apply any styles the select would of had.. and start adding the elements to the dom -----
			this.selectarea=$('<span />').addClass("ui-widget ui-selectmenu-area ").append(this.btn).append(this.list).insertAfter(el).attr("style",el.attr("style"));
			// ----- wrap the whole thing inside a div. apply any styles the select would of had.. and start adding the elements to the dom -----

			this.element.hide(); // hide the select menu

			this.position(); // position the list onto the button

			// ----- when a li is clicked to run the function -----
			$("li:not(.group)",this.list).click(
				function(){
					self._selectOption(this);
				}).bind("mouseenter",
				function(){
					$(this).addClass("ui-state-hover");
				}).bind("mouseleave",function(){
				$(this).removeClass("ui-state-hover");
			});
			// ----- when a li is clicked to run the function -----

			this.after(); // run after the menu has been created

		},
		before: function(){ // function to run before the whole lot starts taking shape
			this.options.before.call(this.element);
		},
		after: function(){ // the function to be run afterwards
			this.options.after.call(this.element);
		},
		change: function(){ // the function to be run when a li is changed
			this.options.change.call(this.element);
		},
		position: function(){ // the position function lines up the list to the button. its seperate so as to alow for a $("select").selectmenu("position") to re position the list
			this.list.css({ // .position doesnt work on hidden elements
				display: "block",
				visibility:"hidden"
			}).position({
			                of: this.btn,
			                my: "left top",
			                at: "left bottom",
			                offset: "0",
			                collision : this.list.data("collision")
			            }).css({ // now we hiding them again since they in position
			                       display: "none",
			                       visibility:"visible"
			                       //zindex:this.list.data("zindex")+1
			                   });

		},
		destroy: function(){   // havent gotten round to this yet..
			this.element.show();
			this.remove();
		},
		_buildMenu: function(elem){  // this function builds the menu.. turns the options to li's
			var selected="", recordclass=elem.attr("class");

			if(elem.attr("selected")){
				recordclass="ui-state-active "+recordclass;
			}

			var optionItem=this.tmplOptions.replace("%value%",elem.val()).replace("%class%",recordclass).replace("%label%",elem.text());

			return optionItem;

		},
		_showMenu: function(){ // function when the menu should be shown
			$(".ui-selectmenu-list").not(this.list).fadeOut(this.settings.speed);
			if(this.list.is(":visible")){
				this._close();
				this.active=false;
			} else{

				this.list.fadeIn(this.settings.speed);
				var self=this, cur, newselect;

				if(!this.documentClickEvent){ // when you click out of the menu it must get hidden again
					this.documentClickEvent=function(e){
						if(e){
							self._close();
						}
					};
					$(document).click(this.documentClickEvent);
				}

				this.keyboardNavigation=function(e){ // basic keyboard navigation for the menus
					if(e){

						switch(e.which){
							case 40: // down
								cur=self.list.find(".ui-state-active");
								newselect=cur.nextAll("li:visible").eq(0);
								newselect=(newselect.length)?newselect:cur.closest("ul").closest("li.group").next("li.group").find("ul li:visible:first").eq(0);
								self._softselectOption(newselect);
								e.preventDefault();
								break;
							case 38: // Up
								cur=self.list.find(".ui-state-active");
								newselect=cur.prevAll("li:visible").eq(0);
								newselect=(newselect.length)?newselect:cur.closest("ul").closest("li.group").prev("li.group").find("ul li:visible:last").eq(0);
								self._softselectOption(newselect);
								e.preventDefault();
								break;
							case 13: // Enter
								cur=self.list.find(".ui-state-active");
								self._selectOption(cur);
								e.preventDefault();
								break;
							case 32: // space
								cur=self.list.find(".ui-state-active");
								self._selectOption(cur);
								e.preventDefault();
								break;
							case 27: // Escape
								self._close();
								break;
						}
					}
				};
				$(document).keydown(this.keyboardNavigation);

			}
		},
		_softselectOption: function(t){ // select an item without actualy running the main function on select.. usefull for the keyboard navigation thing
			var $curOption=$(t);
			if($curOption.length){
				this.btn.find(".ui-button-text").html($curOption.text());
				this.select.val($curOption.data("value"));

				$(".ui-state-active",this.list).removeClass("ui-state-active");
				$curOption.addClass("ui-state-active");

				this.element.trigger("change");
			}
		},
		_selectOption: function(t){ // what happens when the li is clicked
			this._softselectOption(t);
			this._close();
			this.change();

		},
		_close: function(){ // clean it all up
			this.list.stop(true,true).fadeOut(this.settings.speed);
			$(document).unbind("click",this.documentClickEvent);
			this.documentClickEvent=null;
			$(document).unbind("keydown",this.keyboardNavigation);
		}


	});
})(jQuery);
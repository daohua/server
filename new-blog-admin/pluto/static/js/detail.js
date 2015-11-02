//comment.js 评论模块
var comments = {
	init : function(g_id){
		this._lock = false;
		this.offset = 0;
		this.count = 20;
		this.has_more = false;
		this.group_id =0;
		this.header_offset = 0;
		this.inited = false;
		this.failed = false;
		this.failRetried = false;
		this.all_comments_load = false;

		this.load_btn_selector = ".comment-load-btn";
		
		var $comment_box = $(".comment-box");
		this.comment_form = $comment_box.find("#comment-form");
		this.comment_textarea = $comment_box.find("#comment-area");
		this.comment_submit = $comment_box.find("#make-comment");
		this.comment_platform = $comment_box.find("input[name='platform']");
		this.comment_box = $comment_box;

		var $comments = $(".comments");
		this.reload_all_btn = $comments.find(this.load_btn_selector+"[data-type=all]");
		this.comments = $comments;

		this.scroll_loading = this.reload_all_btn.length;
		this.scroll_loading && this.getAllComments();

		this.initEvents();
	},

	lock : function(){
		this._lock = true;
	},
	
	unlock : function(){
		this._lock = false;
	},
		
	enableEditing : function(){
		this.comment_submit.removeAttr("disabled")
	},

	disableEditing : function(){
		this.comment_submit.attr("disabled","disabled")
	},

	toggleTextarea : function(show){
		this.comment_box[show?"addClass":"removeClass"]("expand");
	},

	recomment : function(str){
		this.comment_textarea.val(str);
		this.comment_box.show();
		this.enableEditing();
		textareaSetCursorPosition("comment-area", 0);
		window.scrollTo(0,this.comment_textarea.offset().top);
	},

	initEvents : function(){
		var _this = this;
		this.comment_textarea.on("focus",function(){
			_this.toggleTextarea(true);
		}).on("input",function(){
			var $this = $(this);
			$this.val()?_this.enableEditing(): _this.disableEditing()
		});


		this.comment_submit.on("click",function(){
			var txt = _this.comment_textarea.val().trim();
			if(!txt) return false;			
			if(! user.isLogin()) gaevent('event','comment','comment_login');
			user.loginRequired(function(){
				_this.postComments();
			});
			return false;
		});

		this.comments.on("click",this.load_btn_selector,function(){
			var btn = $(this);
			var type = btn.attr("data-type");
			_this.unlock();
			_this.failRetried = true;
			if(type == "all"){
				_this.getAllComments();
			}else{
				_this.getComments(type,btn);
			}
			return false;
		});

		$(window).on("scrollBottom",function(){
			if(_this.all_comments_load && _this.has_more ){
				console.log("load_new_comments_"+group_id);
				_this.getComments("new",$(_this.load_btn_selector+"[data-type=new]"));
			};
		});
	},
	

	getAllComments : function(){
		var _this = this;
		if(_this._lock || (this.failed && !this.failRetried)) return;
		_this.lock();
		_this.failRetried = false;
		$.get("/api/article/"+group_id+"/pagecomments/", {"count":20, "offset": 0, "type": "all"})
		 .done(function(d){
			 _this.comments.html(d);
			 _this.new_comment_list = _this.comments.find(".new-comments .comment-list");
			 _this.hot_comment_list = _this.comments.find(".hot-comments .comment-list");
			 _this.all_comments_load = true;
		  })
		 .fail(function(){
			 _this.reload_all_btn.show().text(NETWORKTIPS.COMMENTRETRY);
			 _this.failed = true;
		 })
		 .always(function(){
			 _this.unlock();
		 })
	},
	
	
	getComments : function(type,btn){
		if(this._lock || (this.failed && !this.failRetried)) return;
		this.lock();
		btn.text(NETWORKTIPS.LOADING);
		var con = this[type+"_comment_list"];
		var offset = parseInt(con.attr("offset") || 0);
		
		var _this = this;
		
		$.get("/api/article/"+group_id+"/pagecomments/", {"count":_this.count, "offset": offset, "type": "new"})
		 .done(function(d){
			con
			.append(d)
			.attr({
				"offset" : offset+_this.count,
				"has_more" : has_more
			});
			
			btn.text(btn.attr("orig-text"));
			
			has_more = parseInt(has_more);
						
			if(!has_more){btn.hide()};
			if(type == "new") _this.has_more = has_more;
		  })
		 .fail(function(){
			btn.text(NETWORKTIPS.RETRY);
		 	_this.failed = true;
		 	_this.failRetried = false;
		  })
		 .always(function(){
		 	_this.unlock();
		 });
		return this;
	},

	postComments : function(){
		var _this= this;
		
		this.disableEditing();

		var pf = this.comment_platform.val(),
			st = this.comment_textarea.val().trim(),
			url = this.comment_form.attr("action");

		$.post(url,{
			group_id : group_id,
			status   : st,
			platform : pf
		})
		.done(function(d){
			 if(d.created){
			 	_this.toggleTextarea(false);
				_this.new_comment_list.prepend(d.tpl);
				_this.comments.show();
				_this.comment_submit.blur();
				_this.comment_textarea.val("");
				gaqpush('comment','comment_success');
				global_tip("发表成功");
			 }else{
				 if(d.message == 'error') global_tip(d.reason);
				 _this.enableEditing()
			 };	
		})
		.fail(function(){
			 global_tip(NETWORKTIPS.SENDINGERROR);
			 _this.enableEditing()
		});
		this.comment_textarea.attr({"selectionstart":0,"selectionend":0});
		return this;
	}
};

var commentAction = {
	popinit   : false,
	popshown  : false,
	popbox	  : null,	
	popdata   : null,
	message   : '',
	
 	showpopbox : function(z){
		var $con = $(z).parents(".comment_content"),
			o = this.getState(z);
			
		this.popdata = o;
		this.popbox = $(".popup");
		
		this.popbox
		.attr("class","popup fadeUp "+this.popdata.pos)
		.appendTo('body')
		.css("top", o.top+"px")
		.find("[action='digg']").html(o.digg_text+"["+o.digg_count+"]").end()
		.find("[action='bury']").html(o.bury_text+"["+o.bury_count+"]").end()
		.show();
		
		this.popshown = true;
		
		document.addEventListener("touchstart",function(e){
			if(e.target.getAttribute("action") == null){
				commentAction.popbox.hide();
				commentAction.popshown = false;
			}
		},false);
		
		if(! this.popinit) this.initPopAction(this.popbox);
	},
	
	getState : function(z){
		var obj = z.parentNode.parentNode;
		var span = obj.querySelector(".action_pane .digg");
		var name = obj.querySelector(".name a").title;
		var content = obj.querySelector(".content a");
		var content_string = content.innerHTML;	
		var comment_id = span.getAttribute("comment_id");
		var digg_count = span.innerHTML;
		var bury_count = span.getAttribute("bury_count");
		var stat = span.className.replace("btn digg","").trim()||"none";
		var digg_text = stat == 'digged'?'已顶':'顶';
		var bury_text = stat == 'buryed'?'已踩':'踩';
		var disable_action = (stat == 'digged' || stat == 'buryed');
		
		var top = obj.getBoundingClientRect().top;
		var position = top > 0 ? "up" : "down";
		position == "down" ? top += $(obj).height()+15 : "";
		
		return {
			'commentid'		:	comment_id,
			'groupid'		:   group_id,
			'state'			:	stat,
			'top'			:	top,
			'digg_text'		:   digg_text,
			'bury_text'		:	bury_text,
			'digg_count'	:	digg_count,
			'bury_count'	:	bury_count,
			'disable_action':	disable_action,
			'name'			:	name,
			'content'		:	content_string,
			'obj'			:	span,
			'pos'			:   position
		}
	},

	act : function(){
		var _this = this;
		var r = this.popdata;
		var $popup = this.popbox;
		if (user._user_cache['auth_token'] == '') {
			global_tip('请您先登录');
			return false;
		};
		if(r.type !== 'recomment' && r.state !== 'none'){
			if(r.state == 'digged') global_tip("您已经顶过");
			if(r.state == 'buryed') global_tip("您已经踩过");
		}else{
			if(r.type == 'recomment'){
				comments.recomment(" //@"+this.popdata.name+":"+this.popdata.content);
			}else{
				var message = _this.post(user._user_cache['auth_token'])
				if (message == 'redigg') {
					global_tip('您已经顶过');
					return false;
				};
				gaevent("event","actions","comment_"+r.type);
				if(r.type == 'digg'){
					var dc = parseInt(r.digg_count)+1;
					$(r.obj).addClass("digged").text(dc);
					if(_this.popshown) $popup.find("[action='digg']").html(r.digg_text+"["+dc+"]");
				};
				if(r.type == 'bury'){				
					var bc = parseInt(r.bury_count)+1;
					$(r.obj).addClass("buryed").attr('bury_count',bc);
					if(_this.popshown) $popup.find("[action='bury']").html(r.bury_text+"["+bc+"]");				
				};
			};
		};
		if(this.popshown){		
			setTimeout(function(){
				$popup.hide();
				commentAction.popshown = false;
			},400)
		};
		return false;
	},
	
	digg : function(z){
		var r = this.getState(z);
		r.type = 'digg';
		this.popdata = r;
		return this.act();
	},
	bury : function(z){
		var r = this.getState(z);
		r.type = 'bury';
		this.popdata = r;
		return this.act();
	},
	recomment : function(z){
		var r = this.getState(z);
		r.type = 'digg';
		this.popdata = r;
		return this.act();
	},
	initPopAction : function($box){
		var _this = this;
		$box.find("a[action]").click(function(){
			_this.popdata.type = $(this).attr("action");
			_this.act();
			return false;
		});
		this.popinit = true;
	},
	post : function(token){
		var r = this.popdata;
		var result = '';
		if(r.type == 'digg'){
			$.ajax({
				type:"POST",
				async: false,
				url:"/api/article/comment/action/", 
				data:{'comment_id':r.commentid, 'action':r.type}, 
				headers:{'Authorization':'Token '+token},
				success: function(d){
					result = d['message']
				}
			})
		};
		return result;
	}
};
// if(r.type == 'digg' || r.type == 'bury'){
// 			$.post('/comment/action/',{	
// 				'group_id' 	: r.groupid,
// 				'comment_id': r.commentid,
// 				'action'	: r.type	
// 			})
// 		};
//顶踩收藏评论
(function($) {

    function getActionUrl(action_type, group_id){
        return "/group/article/" + group_id + "/"+action_type+"/";
    };

	function checkStates($this){
		var $control = $this.parent();
		var ret = {};
		if($control.find(".digged").length) ret.digged = true;
		if($control.find(".buryed").length) ret.buryed = true;
		if($control.find(".faved").length) ret.faved = true;
		if($control.find(".commented").length) ret.commented = true;
		return ret;			
	};
	
    function updateStates($this,action_type){
		var str = $this.text(), n = parseInt(str);
		if(action_type == "unrepin"){
			n = n - 1;
			$this[0].className = $this[0].className.replace("ed","");
			$this.attr("action-type","repin");
		}else{
			n = n + 1;
			$this[0].className += "ed";
			if(action_type == "repin"){
				$this.attr("action-type","unrepin");
			}
		}
		$this.text(str.replace(/\d+/g,n)).siblings().attr("disabled","disabled");
    };		
	
	function doPost(action_url, group_id, type){
		if(actionLock[group_id]) return;
		actionLock[group_id] = true;
		 $.ajax({
            url: action_url,
            type: 'post',
            success: function(d){
				console.log(d);
				if(d.message == 'success'){
					actionLock[group_id] = false;
				} else {
					gaevent("event","actions",type+"_error");
					alert('有错误发生，稍后重试');
					actionLock[group_id] = false;
				};
				
		   },
		   error : function(){
				actionLock[group_id] = false;
		   }
		 })
	};


	var action_type ="", actionLock = {};
	
    $.fn.initActionButtons = function(detail) {

        this.on('click', 'a[action-type]', function(e) {
			
			var $this = $(this);
						
			var state = checkStates($this);
			
			action_type = $this.attr("action-type");
			
			var action_url = getActionUrl(action_type, group_id);
			if(!action_url){return;}				
            
			gaevent("event","actions",action_type);
			
			//顶踩操作
			if(action_type == 'digg' || action_type =='bury'){
				if(state.digged|| state.buryed){  
					return false; 
				}else{
					updateStates($this,action_type);
					user.isLogin() && doPost(action_url,group_id,action_type);
				}
			};
			
			return false;	
        })
    };
})(jQuery);

function textareaSetCursorPosition(targetId, pos){ 
	var ctrl = document.getElementById(targetId);
	ctrl.focus(); 
	ctrl.setSelectionRange(pos,pos); 
};

function textareaSaveCursorPosition(textarea) {
	var rangeData = {text: "", start: 0, end: 0 };
	textarea.focus();
	rangeData.start= textarea.selectionStart;
	rangeData.end = textarea.selectionEnd;
	rangeData.text = (rangeData.start != rangeData.end) ? textarea.value.substring(rangeData.start, rangeData.end): "";
	textarea.setAttribute("selectionStart",rangeData.start);
	textarea.setAttribute("selectionEnd",rangeData.end);
};


function initAppBanner(){
    var appBannerShown = $.cookie("appBannerShown");
    if(appBannerShown) return;

    var $appBanner = $(".app-banner"),
        $appDownloadBtn = $appBanner.find(".download"),
        $appOpenBtn = $appBanner.find(".open").attr("href",native_link),
        $appBannerCloseBtn = $appBanner.find(".close");
    
    $("body").addClass("has_top_banner");
    gaevent("banner", "top_banner", $appBanner.attr("event")+"_show");
    
    $appBannerCloseBtn.on("click",function(){
        $("body").removeClass("has_top_banner");
        gaevent("banner", "top_banner", "top_banner_close");
        $.cookie("appBannerShown", true,{expires: 1000*60*60*24*7,path:'/'});
        return false
    });

    if(isappinstalled) {
    	addLaunchAppTip('[data-type=app_open]');

		if(tt_from == 'sina' || tt_from == 'singlemessage'){
			gaevent('event','jump','try');
			setTimeout(function(){
				gaevent('event','jump','fail');
			},2000);
		};
	};
};

function addLaunchAppTip(btn){
	$(btn).on('click',function(e){
		$("body").addClass("has_app_download_tip");
		e.preventDefault();
		//gaevent("banner", "top_banner", "show_launch_mask");
		//return false
	});
	
	$(".app_download_tip").on("click",function(){
		$("body").removeClass("has_app_download_tip");
		return false;
	});
};


function initFixedBtn(){
	var commentShow = false, 
		originClass = "fixed-btn-switcher",
		switcherCommentClass = "fixed-btn-switcher-comment",
		switcherTopClass = "fixed-btn-switcher-top",
		commentOffset = 0,
		$switcherSpliter = $("#comment-spliter"),
		$fixedBtnSwitcher = $("."+originClass),
		$fixedBtnGroup = $(".fixed-btn-group"),
		hasBtn = $fixedBtnSwitcher.length;

	function fixedBtnSwitch(){
		var commentOffset = parseInt($switcherSpliter.offset().top)-innerHeight;

		if(!commentShow && scrollY >= commentOffset){
			$fixedBtnSwitcher.attr("class",originClass+" "+switcherTopClass);
			commentShow = true;
		}else if(commentShow && scrollY < commentOffset){
			$fixedBtnSwitcher.attr("class",originClass+" "+switcherCommentClass);
			commentShow = false;
		};		
	};

	$fixedBtnSwitcher.on("click", function(e){
		animateScrollTo(commentShow ? {} : {'obj': $switcherSpliter});
		gaevent('event', commentShow?'go_top':'go_comment','click');
		return false
	});

	if(hasBtn) $(window).on("scrollEnd",fixedBtnSwitch);

/*
	if(tt_from){
		$fixedBtnGroup.addClass("headroom");

		$(window).on("scroll",function(){
			$fixedBtnGroup.addClass("headroom-pinned")
		}).on("scrollEnd",function(){
			$fixedBtnGroup.removeClass("headroom-pinned")
		});

		$(".fixed-btn-article").click(function(){
			animateScrollTo()
		});
		$(".fixed-btn-comment").click(function(){
			var offset = $(".has_top_banner").length? $(".app-banner").height() : 0;
			animateScrollTo({
				obj : $("#comment-spliter"),
				offset : -offset
			})
		});
		$(".fixed-btn-relate").click(function(){
			var offset = $(".has_top_banner").length? $(".app-banner").height() : 0;
			animateScrollTo({
				obj : $("#relate-news"),
				offset : -offset
			})
		})

	}
*/
};

function initDetailFlow(){
    var relateFlow = new Flow({
        list_content    : '#relate-news .list_content',
        list_bottom     : '#relate-news .list_bottom',
        url             : '/group/article/'+group_id+'/related/',     //ajax_url
        param           : {
            'offset'      : 0,
            'count'       : 10,
            'format'      : 'html',
            'tt_from'     : tt_from,
            'app'		  : installedapp
        },
        after_flow      : function(type,data){
            $(".time").timeago();
            $(".relate-news .article_link").each(function(){
            	var $this = $(this),
            		is_download_link = $this.parent().attr("group_id") == "3586284716";
                $this.attr({
                    "ga_event" : "relate_news",
                    "ga_label" : is_download_link ? "click_download" : "click_section",
                    "ga_category" : "event"
                })
            })
        }
    });
};
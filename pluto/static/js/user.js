//用户相关模块
user = {
    _user_cache 	: {},
	_info_tpl 		: '',
	_sns_share_div 	: "#platform_div",
	_anonymous_enabled : false,
	_modal_shown 	: false,
	_callback 		: null,
	_connect_iframe	: null,
	
	isLogin : function(){
        return (this._user_cache && this._user_cache['user_id'])||this._anonymous_enabled;
    },

    refreshUserInfo : function(){
        //load user info ajax
		var _this = this,  user_info_url = "/user/info/";
        $.get(user_info_url)
		 .done(function(d){
			_this._user_cache = d;
            _this.renderUserInfo();			
            if(user.isLogin() && _this._callback){
				setTimeout(_this._callback(d), 0);
				_this._callback = null;
				gaevent("event","login","login_success");
            }
        });
    },

	refreshPageLogin : function(){
		this.loginRequired(function(){
			location.reload();
		})
	},
	
	loginRequired : function(callback){
        if (!this.isLogin()){
			this._callback = callback;
            this.openLoginPanel();
        }else{
            callback();
        }
    },
	
	
	openLoginPanel : function(callback){
        this.showLoginModal();
    },
	
	showLoginModal : function(){
		this._login_modal.jqmShow();
		this._modal_shown = true;
		gaevent("event","login","login_show");	
	},
	
	hideLoginModal : function(){
		this._login_modal.jqmHide();
		this._modal_shown = false;
	},
	
	connected : function(){
		this._connect_iframe.hide();
		this.refreshUserInfo();
	},
	
    doConnect : function(platformId){
		var _this = this, url = "/auth/connect/?type=l_toutiao&platform="+platformId;
		this._connect_iframe.empty().show().on("click",".jqmClose",function(){ _this._connect_iframe.hide()});
		
		this._connect_iframe.html('<iframe src="'+url+'"  frameborder="0" scrolling="no" width="100%" height="100%" onTouchmove="return false"></iframe> <div class="jqmClose closeBtn"></div>');
    },
	
	logout : function(){
		$(".bg_avatar").removeAttr("style");
		$("#logout,#quit").hide();
		$("#favorite").hide();
		$("#login,.login_tip").show();
		this._connect_iframe.html('<iframe src="/auth/logout/" frameborder="0" scrolling="no" width="0" height="0"></iframe>');
		setTimeout(function(){ location.reload() },400)
	},
	
	init : function(obj){
		var _this = this;
		if(obj){ for(k in obj) user[k] = obj[k] };
		if(obj.user_id) user._user_cache.user_id = parseInt(obj.user_id);
		if(obj.anonymous) user._anonymous_enabled = obj.anonymous;
		$("body")
		.on("click","[data-toggle=sns_login]",function(){
			var btn = this;
			if(_this._modal_shown){
				_this.hideLoginModal();		
				setTimeout(function(){			
					_this.doConnect(btn.getAttribute("name"),_this.callback);
				},500)
			}else{
				_this.doConnect(this.getAttribute("name"),_this.callback);
			}
			return false;
		})
		.on("click","[data-toggle=sns_platform]",function(){
			var n = this.className;
			this.className = n=="selected"?"":"selected";
			_this.initShare(_this._sns_share_div);			
		})
		.on("click","[data-toggle=sns_logout]",function(){
			user.logout();
			return false;
		});
		_this.initShare(_this._sns_share_div);
		_this._connect_iframe = $("#connect_window").height(innerHeight+50).on("touchmove",function(){ return false}).jqm();
		_this._login_modal = $('#modal_login').jqm();
	},
	
	//分享到各个平台
	initShare :  function(con,val){
		var $con = $(con);
		if($con.length == 0) return;
		var shareinput = $("input[name=platform]",$con);
		if(val){
			shareinput.val(val.join(','));
			$(".disabled",$con).each(function(){
				var n = $(this).attr("name");
				if($.inArray(n,val)>-1){
					$(this)
					.removeClass("disabled")
					.addClass("selected")
					.attr("data-toggle","sns_platform")
				}
			});
		}else{
			var ret = [];
			$(".selected",$con).each(function(){
				ret.push(this.getAttribute("name"));
			});
			$("#platform").val(ret.join(","));
		}
	},
	
	destroyShare : function(con){
		var $con = $(con);
		if($con.length == 0) return;
		$("input[name=platform]",$con).val("");
		$("[data-toggle]",$con)
		.removeClass("selected")
		.addClass("disabled")
		.attr("data-toggle","sns_login");
	},

	renderUserInfo : function(){
		var u = this._user_cache;
		if(u.user_id){
			$("img[data-context=user-pic]").attr("src",u.avatar_url);
			$(".bg_avatar").css({
				"background":"url("+u.avatar_url+") #fff no-repeat center center",
				"background-size":"29px"
			});
			$("[data-context=user-name]").text(u.name);
			$("a[data-context=user-publish]").attr("href","/user/"+u.user_id+"/publish/");
			$("a[data-context=user-favorites]").attr("href","/user/"+u.user_id+"/favorites/");
			$("a[data-context=user-comment]").attr("href","/user/"+u.user_id+"/comment/");
			$("a[data-context=user-message]").attr("href","/user/"+u.user_id+"/message/");
			$("#logout,#quit").show();
			$("#login,.login_tip").hide();			
			$("#favorite").show().find("a").attr("href","/user/"+u.user_id+"/pin/");
			this.initShare(this._sns_share_div,u.platform);
		};
	},
	
	renderLogout :  function(){
		$("#logout,#quit").hide();
		$("#login,.login_tip").show();
		$("#favorite").hide();
		$("img[data-context=user-pic]").attr("src","http://mat1.gtimg.com/www/mb/images/head_50.jpg");
		this.destroyShare(this._sns_share_div);
	},
	
	getMessageCount : function(){
		if(this.isLogin()){
			var url = "/user/"+this._user_cache['user_id']+"/user_message_count/";
			var con = $(".message_count");
			$.get(url)
			 .done(function(d){
				 if(d.message_count){
					 con.text(d.message_count).show();
				 }else{
					 con.hide();
				 }
			 })
		};
		return this
	}
};

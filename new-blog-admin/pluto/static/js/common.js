/*** Timeago is a jQuery plugin that makes it easy to support automatically***/
(function(factory){if(typeof define==="function"&&define.amd){define(["jquery"],factory)}else{factory(jQuery)}}(function($){$.timeago=function(timestamp){if(timestamp instanceof Date){return inWords(timestamp)}else{if(typeof timestamp==="string"){return inWords($.timeago.parse(timestamp))}else{if(typeof timestamp==="number"){return inWords(new Date(timestamp))}else{return inWords($.timeago.datetime(timestamp))}}}};var $t=$.timeago;$.extend($.timeago,{settings:{refreshMillis:60000,allowFuture:false,localeTitle:false,cutoff:0,strings:{prefixAgo:null,prefixFromNow:null,suffixAgo:"前",suffixFromNow:"刚刚",seconds:"刚刚",minute:"1分钟",minutes:"%d分钟",hour:"1小时",hours:"%d小时",day:"1天",days:"%d天",month:"1个月",months:"%d个月",year:"1年",years:"%d年",wordSeparator:"",numbers:[]}},inWords:function(distanceMillis){var $l=this.settings.strings;var prefix=$l.prefixAgo;var suffix=$l.suffixAgo;if(this.settings.allowFuture){if(distanceMillis<0){prefix=$l.prefixFromNow;suffix=$l.suffixFromNow}}var seconds=Math.abs(distanceMillis)/1000;var minutes=seconds/60;var hours=minutes/60;var days=hours/24;var years=days/365;function substitute(stringOrFunction,number){var string=$.isFunction(stringOrFunction)?stringOrFunction(number,distanceMillis):stringOrFunction;var value=($l.numbers&&$l.numbers[number])||number;return string.replace(/%d/i,value)}function originDate(distanceMillis){var d=new Date(+new Date()-distanceMillis);var M=d.getMonth()+1,D=d.getDate(),H=d.getHours(),I=d.getMinutes();return(M<10?"0"+M:M)+"-"+(D<10?"0"+D:D)+" "+(H<10?"0"+H:H)+":"+(I<10?"0"+I:I)}var words=seconds<45&&substitute($l.seconds,Math.round(seconds))||seconds<90&&substitute($l.minute,1)||minutes<45&&substitute($l.minutes,Math.round(minutes))||minutes<90&&substitute($l.hour,1)||hours<23&&substitute($l.hours,Math.round(hours))||originDate(distanceMillis);var separator=$l.wordSeparator||"";if($l.wordSeparator===undefined){separator=" "}if(words=="刚刚"){return words}if(hours>=23){suffix=""}return $.trim([prefix,words,suffix].join(separator))},parse:function(iso8601){var s=$.trim(iso8601);s=s.replace(/\.\d+/,"");s=s.replace(/-/,"/").replace(/-/,"/");s=s.replace(/T/," ").replace(/Z/," UTC");s=s.replace(/([\+\-]\d\d)\:?(\d\d)/," $1$2");return new Date(s)},datetime:function(elem){var iso8601=$t.isTime(elem)?$(elem).attr("datetime"):$(elem).attr("title");return $t.parse(iso8601)},isTime:function(elem){return $(elem).get(0).tagName.toLowerCase()==="time"}});var functions={init:function(){var refresh_el=$.proxy(refresh,this);refresh_el();var $s=$t.settings;if($s.refreshMillis>0){setInterval(refresh_el,$s.refreshMillis)}},update:function(time){$(this).data("timeago",{datetime:$t.parse(time)});refresh.apply(this)},updateFromDOM:function(){$(this).data("timeago",{datetime:$t.parse($t.isTime(this)?$(this).attr("datetime"):$(this).attr("title"))});refresh.apply(this)}};$.fn.timeago=function(action,options){var fn=action?functions[action]:functions.init;if(!fn){throw new Error("Unknown function name '"+action+"' for timeago")}this.each(function(){fn.call(this,options)});return this};function refresh(){var data=prepareData(this);var $s=$t.settings;if(!isNaN(data.datetime)){if($s.cutoff==0||distance(data.datetime)<$s.cutoff){$(this).text(inWords(data.datetime))}}return this}function prepareData(element){element=$(element);if(!element.data("timeago")){element.data("timeago",{datetime:$t.datetime(element)});var text=$.trim(element.text());if($t.settings.localeTitle){element.attr("title",element.data("timeago").datetime.toLocaleString())}else{if(text.length>0&&!($t.isTime(element)&&element.attr("title"))){element.attr("title",text)}}}return element.data("timeago")}function inWords(date){return $t.inWords(distance(date))}function distance(date){return(new Date().getTime()-date.getTime())}}));

/** jqModal - Minimalist Modaling with jQuery  (http://dev.iceburg.net/jquery/jqModal/) **/
(function($){$.fn.jqm=function(o){var p={overlay:50,overlayClass:"jqmOverlay",closeClass:"jqmClose",trigger:".jqModal",transparent:false,ajax:false,ajaxText:"",target:false,modal:false,toTop:false,onShow:false,onHide:false,onLoad:false};return this.each(function(){if(this._jqm){return H[this._jqm].option=$.extend({},H[this._jqm].option,o)}s++;this._jqm=s;H[s]={option:$.extend(p,$.jqm.params,o),opened:false,win:$(this).addClass("jqmID"+s),index:s};if(p.trigger){$(this).jqmAddTrigger(p.trigger)}})};$.fn.jqmAddClose=function(e){return hs(this,e,"jqmHide")};$.fn.jqmAddTrigger=function(e){return hs(this,e,"jqmShow")};$.fn.jqmShow=function(t){return this.each(function(){t=t||window.event;$.jqm.open(this._jqm,t)})};$.fn.jqmHide=function(t){return this.each(function(){t=t||window.event;$.jqm.close(this._jqm,t)})};$.jqm={hash:{},open:function(s,t){var h=H[s],c=h.option,cc="."+c.closeClass,z=(parseInt(h.win.css("z-index"))),z=(z>0)?z:3000,o=$('<div onTouchmove="return false;" onTouchend=""></div>');if(c.transparent){o.css({background:"none"})}if(h.opened){return false}h.t=t;h.opened=true;if($(".jqmOverlay").length){h.overlay=o=$(".jqmOverlay").show()}else{h.overlay=o.addClass("jqmOverlay").appendTo("body")}if(c.modal){if(!A[0]){L("bind")}A.push(s)}else{if(c.overlay>0){h.win.jqmAddClose(o)}else{o=false}}if(c.ajax){var r=c.target||h.win,u=c.ajax,r=(typeof r=="string")?$(r,h.win):$(r),u=(u.substr(0,1)=="@")?$(t).attr(u.substring(1)):u;r.html(c.ajaxText).load(u,function(){if(c.onLoad){c.onLoad.call(this,h)}if(cc){h.win.jqmAddClose($(cc,h.win))}e(h)})}else{if(cc){h.win.jqmAddClose($(cc,h.win))}}if(c.toTop&&h.overlay){h.win.before('<span id="jqmP'+h.win[0]._jqm+'"></span>').insertAfter(h.overlay)}(c.onShow)?c.onShow(h):h.win.show();e(h);return false},close:function(s){var h=H[s];if(!h.opened){return false}h.opened=false;if(A[0]){A.pop();if(!A[0]){L("unbind")}}if(h.option.toTop&&h.overlay){$("#jqmP"+h.win[0]._jqm).after(h.win).remove()}if(h.option.onHide){h.option.onHide(h)}else{h.win.css({"-webkit-transform":"scale(.7)","-moz-transform":"scale(.7)","opacity":0});setTimeout(function(){h.win.hide().css({"-webkit-transform":"scale(1)","-moz-transform":"scale(1)","opacity":1});h.overlay&&h.overlay.hide()},305)}return false},params:{}};var s=0,H=$.jqm.hash,A=[],ie6=(navigator.userAgent.match(/msie 6/i)),i=$('<iframe src="javascript:false;document.write(\'\');" class="jqm"></iframe>').css("opacity",0),e=function(h){if(ie6){if(h.overlay){h.overlay.html('<p style="width:100%;height:100%"/>').prepend(i)}else{if(!$("iframe.jqm",h.win)[0]){h.win.prepend(i)}}}f(h)},f=function(h){try{$(":input:visible",h.win)[0].focus()}catch(_){}},L=function(t){$()[t]("keypress",m)[t]("keydown",m)[t]("mousedown",m)},m=function(e){var h=H[A[A.length-1]],r=(!$(e.target).parents(".jqmID"+h.index)[0]);if(r){f(h)}return !r},hs=function(w,t,c){return w.each(function(){var s=this._jqm;$(t).each(function(){if(!this[c]){this[c]=[];$(this).click(function(){for(var i in {jqmShow:1,jqmHide:1}){for(var s in this[i]){if(H[this[i][s]]){H[this[i][s]].win[i](this)}}}return false})}this[c].push(s)})})}})(jQuery);


//jquery cookie plugin
jQuery.cookie=function(name,value,options){if(typeof value!="undefined"){options=options||{};if(value===null){value="";options.expires=-1}var expires="";if(options.expires&&(typeof options.expires=="number"||options.expires.toUTCString)){var date;if(typeof options.expires=="number"){date=new Date();date.setTime(date.getTime()+(options.expires))}else{date=options.expires}expires="; expires="+date.toUTCString()}var path=options.path?"; path="+options.path:"";var domain=options.domain?"; domain="+options.domain:"";var secure=options.secure?"; secure":"";document.cookie=[name,"=",encodeURIComponent(value),expires,path,domain,secure].join("")}else{var cookieValue=null;if(document.cookie&&document.cookie!=""){var cookies=document.cookie.split(";");for(var i=0;i<cookies.length;i++){var cookie=jQuery.trim(cookies[i]);if(cookie.substring(0,name.length+1)==(name+"=")){cookieValue=decodeURIComponent(cookie.substring(name.length+1));break}}}return cookieValue}};


var localActions = {
	queueNames : "localActions,delayedActions",
	delayedInterval : null,
	queues : {},

	getStoredQueues : function(){
		var savedQueue = localStorage['queues'];
		if(savedQueue == "undefined" || savedQueue == undefined) savedQueue = {};
		if(typeof savedQueue == "string") savedQueue = JSON.parse(savedQueue);
		return savedQueue;
	},
	
	init : function(){
		this.Q = this.getStoredQueues();
		if(navigator.onLine){
			for(k in this.Q){
				var queue = this.Q[k];
				queue.length && this.clear(k)
			};
		};
	},

	add : function(key,obj){
		var queue = this.Q[key] || [];
		queue.push(obj);
		this.save(key,queue);

		var _this = this;

		if(key == "delayedActions" && !this.delayedInterval){
			this.delayedInterval = setInterval(function(){
				_this.clear(key);
				console.log("checkDelayedActions");
			},3000);
		}
	},

	save : function(key,queue){
		this.Q[key] = queue;
		localStorage['queues'] = JSON.stringify(this.Q);
	},

	clear : function(key){
		var queue = this.Q[key];
		while(queue.length){
			var t = queue.shift(),
				fnname = t['fnname'],
				params = t['params'],
				fn = this.callbacks[fnname];
			if(fn) fn(params);
		};
		this.save(key,queue);
		if(!queue.length && key == "delayedActions") {
			clearInterval(this.delayedInterval);
			this.delayedInterval = null;
		}
	},

	callbacks : {
		mediaLike  : function(params, success, fail){
			var url = "/pgc/"+params.type+"/",
				data = { "media_id" : params.media_id };

			if(is_api){
				url = "/api/2"+url;
				data = $.extend(data,common_params);
			};

			$.post(url,data)
			 .fail(ajaxNetworkErrorCallback)
			 .done(function(d){
			 	if(d.message == 'success'){ 
			 		if(success) success();
			 	}else{
			 		global_tip(NETWORKTIPS.SERVERERROR);
			 		if(fail) fail();
			 	}
			 })
		},

		repin : function(params){
			//params :  {type:repin/unrepin,id:xx}
			var url = "/group/article/"+params.id+"/"+params.type+"/",
				data = {}; 
			
			if(is_api){ 
				url = "/2/data/item_action/";
				data = $.extend({
					"group_id" : params.id,
					"action"   : params.type
				},common_params);
			};

			$.post(url,data)
			 .fail(ajaxNetworkErrorCallback)
			 .done(function(d){
			 	if(d.message !== 'success'){ global_tip(NETWORKTIPS.SERVERERROR) }
			 });
		},

		dislike : function(params){
			var url = "/api/dislike/",
				data = {'group_id': params.id,'action':'dislike'};
			
			if(is_api){
				url = "/2/data/item_action/";
				data = $.extend(data,common_params)
			};

			$.post(url,data)
			 .fail(ajaxNetworkErrorCallback)
			 .done(function(){ 	global_tip(NETWORKTIPS.RECOMMENDDISLIKE) })
		},

		actionLog : function(params){
			if(!params) return;
			params.tag = params.tag || "headline";
			var url = "/action_log/",
				data = {
					label : params.label,
					value : params.id,
					tag   : 'go_detail'
				};
			
			if(is_api){
				url = "/2/wap/action_log/";
				data = $.extend(data,common_params);
			};

			$.post(url,data)
			/*
			 .done(function(d){
			 	var s = [];
			 	for(k in d) s.push(k+":"+d[k]);
			 	alert(s.join(","))
			 });
			*/
		}
	},

	networkRequired : function(fnname, params){
		if(navigator.onLine){
			var fn = this.callbacks[fnname];
			if(fn) fn(params);
		}else{
			this.add("localActions",{
				"fnname" : fnname,
				"params" : params
			});
		}
	},

	execCommand : function(fnname, params, success, fail){
		var fn = this.callbacks[fnname];
		if(!fn) return;
		fn(params, success, fail);
	}
};

$(function(){
	localActions.init();
});

//$.request; $.hash
$.request=function(paras){var url=location.href; var paraString=url.substring(url.indexOf("?")+1,url.length).split("&"); var paraObj={}; for(i=0;j=paraString[i];i++){paraObj[j.substring(0,j.indexOf("=")).toLowerCase()]=j.substring(j.indexOf("=")+1,j.length) }; if(!paras) return paraObj; var returnValue=paraObj[paras.toLowerCase()]; return returnValue ? $.trim(returnValue) : ""};
$.hash=function(){var s=location.hash.substr(1),hashQuery={};if(s){var arr=s.split("&");for(var i=0;i<arr.length;i++){var t=arr[i].split("=");hashQuery[t[0]]=t[1]}}if(typeof arguments[0]=="string"){return hashQuery[arguments[0]]}if(typeof arguments[0]=="object"){for(var k in arguments[0]){hashQuery[k]=arguments[0][k]}var s2="";for(var k in hashQuery){s2+=k+"="+hashQuery[k]+"&"}location.href="#"+s2.substring(0,s2.length-1)}};
$.timestamp=function(){return +new Date()};


var is_toutiao =  location.host.indexOf("toutiao.com") >= 0,
	is_api = location.host.indexOf("snssdk.com") >= 0,
	ua = navigator.userAgent,

	NETWORKTIPS = {
		"RETRY"				:	"网络失败,点击重试",
		"COMMENTRETRY"		: 	"评论加载失败,点击重试",
		"NETWORKERROR"		: 	"网络失败",
		"LOADING"			: 	"加载中...",
		"WAITE"				:	"加载中,请稍后",
		"RECOMMENDING" 		:	"正在推荐...",
		"RECOMMENDCOUNT"	:	"为您推荐了#n#篇文章",
		"RECOMMENDEMPTY"	:	"暂无更新,请休息一会儿",
	  	"RECOMMENDDISLIKE"	:	"将减少类似推荐",
		"HASMORE"			:   "查看更多",
		"SENDING"			:	"正在提交",
		"SENDINGERROR"		:	"发表失败",
		"SENDINGSUCCESS"	:	"发表成功",
		"GEOLOCATIONERROR"	:	"获取地理位置失败",
		"NOSEARCHDATA"		:	"暂无搜索结果",
	  	"SERVERERROR"		:	"服务异常,轻稍后重试"
	};

$.browser = $.browser|| {};
$.browser.ios = /iPhone|iPod|iPad/i.test(ua);
$.browser.iphone = /iPhone/i.test(ua);
$.browser.ipad = /iPad/i.test(ua);
$.browser.android = /Android/i.test(ua);
$.browser.android4 = /Android\s4/i.test(ua);
$.browser.android2 = /Android\s2/i.test(ua);


var errorimglist = [];
function errorimg(){
  errorimglist.push(this.src);
  console.log("image error :"+this.src);
  this.style.opacity = "0";
  //this.src = this.src.replace("//p0","//p").replace("//i0","//i").replace("//v0","//v");
};

function loadimg(){
  //console.log("image load :"+this.src);
  this.style.opacity = "1";
};


function ajaxNetworkErrorCallback(){
	global_tip(NETWORKTIPS.NETWORKERROR);
};


//常用api请求
function actionLog(label,id){
	localActions.add("delayedActions",{
		"fnname" : "actionLog",
		"params" : {
			"label"  : label,
			"id"     : id
		}
	});
};


function mediaLike(btn){
	var $btn = $(btn),	
		media_id = $btn.attr("media-id"),
		$followers = $("[data-type=media-follower]").filter("[media-id="+media_id+"]"),
		media_like_stat = $btn.attr("data-action");

	function callback(){
		media_like_stat == "unlike" ? $btn.attr("data-action","like").text("订阅") : $btn.attr("data-action","unlike").text("已订阅");	
		if($followers.length){
			var count = parseInt($followers.text());
			$followers.text(media_like_stat == "unlike" ? count-1 : count+1)
		};
	};

	function doAction(){
		localActions.execCommand("mediaLike",{ 
			"media_id": media_id, 
			"type":media_like_stat
		}, callback);

		var action_label = media_like_stat == "like"?"subscribe":"unsubscribe";
		actionLog(action_label,media_id);
	};
	
	is_api? doAction() : user.loginRequired(doAction);
};


//工具
function initScrollEvents(){
	var scrollEndTimer,	offset = 100;
	function globalScroll(e){
		var theDocumentHeight = document.height || document.body.scrollHeight;
			
		if( scrollY >= theDocumentHeight - innerHeight - offset)  $(window).trigger("scrollBottom", e.type);
		if( e.type == 'scroll'){
			if(scrollEndTimer) clearTimeout(scrollEndTimer);
			scrollEndTimer = setTimeout(function(){ $(window).trigger("scrollEnd") },300);
		}
	};
	$(window).on("scroll load afterflow",globalScroll);
};

animateScrollTo = function(option){
	var top = 0;
	if(option){
		if(option.offset) 	top += option.offset;
		if(option.obj)		top += option.obj.offset().top;
	};
	setTimeout(function(){
		$("html, body").animate({ scrollTop: top }, 400);
	},0)		
	return this;
};

window.scrollTop = function(){
	window.scrollTo(0,0);
};

function debug(s){
	var $d = $("#debug");
	if(!$d.length){ 
		$("<div id='debug'/>").appendTo("body");
		$d = $("#debug");
	};
	$d.text(s);
};


function global_tip(str){
	var p = $("<div class='global_tip'/>").appendTo("body"),
	    h = document.querySelector("header"),
	    tip_top = 0;
	if(h) tip_top = Math.max(0, h.getBoundingClientRect().top +  h.getBoundingClientRect().height);
	p.show().text(str).css("top",tip_top);
	setTimeout(function(){
		p.fadeOut(function(){
			p.remove();
		});
	},2000)
};
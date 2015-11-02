var mid = {
	funny_gallery	:	1,
	joke_essay		:	5,
	saying_essay	:	9,
	criticism_essay	:	11,
	comic_gallery	:	12,
	gif_gallery		:	13,
	news_article	:	14,
	news_article_social : 20,
	joke_essay_social   : 21,
	saying_essay_social : 22,
	all_article     : 	23,
	joke_essay_pro	: 	24,
	explore_article :   25,
	joke_zone  		:   27
};


nativeLink = function(obj){
	var a = $.request("app") || obj.app,
		n,
		k = 1,
		s = "";

	if(navigator.userAgent.match(/android/gi)) k=3;

	//修复2^31错误
	if($.browser.ios){
		if(a.length && (a.indexOf("joke_essay") != -1)){
		}else{
			var largeNumber = Math.pow(2,31), theId = parseInt(obj.id);
			if(theId > largeNumber-1){
				obj.id = theId - largeNumber*2;
			};
		}
	};

	if(a.length){
		n = mid[a];
		if(n == 21 || n == 24) n= 5;
		if(n == 22 ) n= 9;
		if(n == 20 && k == 3 )  n = 14;
		if(n == 14 || n == 20 || n == 25 || n == 27 ) {
			if(typeof essay_from_jrtt !== 'undefined' && essay_from_jrtt){
				var fix = "essay_"
			}else{
				var fix = ""
			};
			s = fix+"detail?groupid="+obj.id;
		}
		if(n == 5){
            var page = obj.page;
            if(page == 'activity'){
                s = "activity?activity_id="+obj.id;
            }else{
                s = "comments?groupid="+obj.id;
            }
        }
		return "snssdk"+n+k+"://"+(obj.id?s:"");
	}else{
		return "";
	};
};


jumpToNativeapp = function(obj){
	var l = nativeLink(obj);
	if($.browser.ios){
		var currentUrl = location.href;
		if(l && document.referrer.indexOf(currentUrl) < 0){    //从微信等分享链接进这个页面,referrer为""
			location.href = l;
			setTimeout(function(){
				location.href = currentUrl;
			},400);
		}
	}else{
		$("body").append("<iframe id='app_iframe' src='"+l+"' style='display:none'></iframe>");
	}
};

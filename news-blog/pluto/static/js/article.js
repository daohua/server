var Article = {
  lazyLoad : function(selector){
    TTLazyLoad.init({offset: '0', selector : selector});
  },
  //对于 N*1 单列表格布局结构，替换表格机制
  removeSingleColumnTable:function($table){
	var $div = $('<div></div>');
	$table.find('tr').each(function(i, el) {
		var $child = $(el).children();
		if($child.length == 1){
			$('<p></p>').html($child.html()).appendTo($div);
	  	}else{
			$div = null;
			return false;
		}
	});
	if($div){
		var html = $div.html().replace(/<p><\/p>/ig,'').replace(/<p><p>/ig,'<p>').replace(/<\/p><\/p>/ig,'</p>');
		$table.after(html);
		$table.remove();
		return true;
	}
	return false;
  },

  //文章内容的一些过滤
  purify : function(con){
	var __This = this;
    var ts = +new Date();

    var $con = $(con),
        $p = $con.find("p");
		
    //$con.find("br").remove();

    $con.find("h1, h2, h3, h4, h5, h6").each(function(){
      $(this).wrapInner("<strong></strong>").find("strong").unwrap();
    });

    $con.find("img,strong").each(function(){
      var $img = $(this);
      $img.parents("p").length || $img.wrap("<p></p>");
    });

    $con.find("p img").each(function(){
      var $this = $(this);
      if(!this.getAttribute("src")) this.remove();
      if(this.nextSibling) $this.after("<br>");
      if(this.previousSibling) $this.before("<br>");
    });

    var allHtml  = $con.html();
    $con.html(allHtml.replace(/&nbsp;*/g,"").replace(/<br>/g,"</p><p>"));
    

    $con.find("table").each(function(){
      var $this = $(this);
      $this.parents("p").length || $this.wrap("<p></p>");
	  if(! __This.removeSingleColumnTable($this)){
    	if($this.text().length > 20){
    		$this.addClass("border");
    		$this.find("th,td").each(function(index, element){
          $(element).html($(element).text())
        });
    	}
	  }
    });

    
    //去除段首空格
    this.nodeTrim($con.find("strong,span,a,td,th"));
    this.nodeTrim($con.find("p,li"));

    $con.find("p:empty").remove();

    this.fold($con);
    this.addSearchLink($con);
    var te = +new Date();

    console.log("article purify time:%sms",te - ts);
	},
	
  fold :　function($con){
    var $p = $con.find("p"), 
        maxLenght = $con.attr("fold-length"), 
        minLength= $con.attr("min-article-length"),
        totaltext = 0;

    if(!maxLenght || $con.text().length < parseInt(minLength)) return;

    for(var i=0; i<$p.length; i++){
      var $curp = $p.eq(i);
      totaltext += $curp.text().length;
      if(totaltext >= parseInt(maxLenght)){
        $curp.nextAll().wrapAll('<div class="hide-elements"></div>');
        gaevent('event','article','fold');
        break;
      }
    };
    var hiddenParagraph = $(".hide-elements"), unfoldBtn = $(".unfold-btn"), unfoldField = $(".unfold-field");
    if(hiddenParagraph.length){
      unfoldField.show();
      unfoldBtn.show().click(function(){
        gaevent('event','article','open');
        hiddenParagraph.removeAttr("class");
        unfoldField.remove();
      })
    }
  },

  addSearchLink : function($con){
    $con.find(".text-link").each(function(){
      var $this = $(this), keyword = $this.text().trim(), is_label = $this.attr("is-label");
      if(!is_label) $this.attr("href","/search/?from=detail_page_keyword_click&keyword="+keyword).removeAttr("pro-href")
    });
  },

  nodeTrim : function($nodes){
    $nodes.each(function(){
      var t = $(this).html().trim();
      $(this).html(t);
    })
  }
};

function play(url) {
    var thissound=document.getElementById("sound");
    thissound.src = url;
    thissound.play();
}

function search() {
    var relativeDiv = document.getElementById("relative_div");
    relativeDiv.hidden = true;

    var searchTextField = document.getElementById("search_text");
    var _value = searchTextField.value;

    var searchTextDiv = document.getElementById("search_detail_div");

    var searchText = "search?key=" + _value;

    console.log(searchText);

    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            searchTextDiv.innerHTML = "The search of " + _value + " is finished."

            if (JSON.parse(req.responseText) === 0) {
                getVocabulary();
            } else {
                _id = _value + "-li";
                _element = document.getElementById(_id);
                _element.style.color = "blue";
                _element.style.fontStyle = "italic";
                location.hash = _id;
            }

            searchTextField.value = "";
        }
    }

    req.open("GET", searchText, true);
    req.send();

    searchTextDiv.innerHTML = "Searching for " + _value  + " ...";
}

function searchRelative(name) {
    console.log("search" + name);

    var searchTextField = document.getElementById("search_text");
    searchTextField.value = name;

    search();
}

function getRelative(_value) {
    console.log("Query relative.");
    var _query = "relative?key=" + _value; 
    var req = new XMLHttpRequest();
    
    var relativeDiv = document.getElementById("relative_div");

    req.onreadystatechange = function() {
	if (req.readyState == 4 && req.status == 200) {
	    var _list = JSON.parse(req.responseText).results;

	    var _length = _list.length;

	    var relativeList = "";

	    for (i=0; i< _length; i++) {
		var _row = _list[i].searchtext;
		relativeList += "<a name='relative' onclick='searchRelative(\"" + _row + "\")'>" + _row + "</a></br>";
	    }

	    relativeDiv.innerHTML = relativeList;
	    relativeDiv.hidden = false;
	}
    }

    req.open("GET", _query, true);
    req.send();
}

var index = -1;
var length = 0;

function query(event) {
    console.log(event);

    var searchTextField = document.getElementById("search_text");
    var _value = searchTextField.value;
    console.log(_value.length);

    switch(event.keyCode) {
    case 13: //Enter
	search();
	break;
    case 38: //KeyUp
	selectItem(searchTextField, function() {
	    if (index < 1) {//when the position is in bottom and top.
		index = length -1
	    } else {
		index -= 1;
	    }
	});
	break;
    case 40: //KeyDown
	selectItem(searchTextField, function() {
	    if (index == (length - 1)) {//when the position is in bottom.
		index = 0;
	    } else {
		index += 1;
	    }
	});
	break;
    default:
	if (_value.length > 1) {
	    getRelative(_value);
	}
	break;
    }
}

function selectItem(searchTextField, processIndex) {
    var _elements = document.getElementsByName("relative");
    length = _elements.length;

    var _pre, cur;

    if (index != -1) {
	_pre = _elements[index]
        _pre.style.color = "";
        _pre.style.fontStyle = "";
    }

    processIndex();

    _cur = _elements[index]
    _cur.style.color = "blue";
    _cur.style.fontStyle = "italic";

    searchTextField.value = _cur.innerHTML;

    console.log("index:" + index);
}

function getVocabularyDetail(name) {
    var vocabularyDetail = document.getElementById(name);
    
    if (vocabularyDetail.hidden) {
	vocabularyDetail.hidden = false;
    } else {
	vocabularyDetail.hidden = true;
    }
}

function getVocabulary() {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function()
    {
	if (req.readyState == 4 && req.status == 200)
	{
	    var vocabularyObj = JSON.parse(req.responseText);

	    var content = "<ol reversed>";

	    for (i=0;i<vocabularyObj.vocabulary.length-1;i++){
		var vocabulary = vocabularyObj.vocabulary[i];
		var name = decodeURIComponent(vocabulary.name);
		var pronunciation_uk = decodeURIComponent(vocabulary.pronunciation_uk);
		var sound_uk = decodeURIComponent(vocabulary.sound_uk);
		var pronunciation_us = decodeURIComponent(vocabulary.pronunciation_us);
		var sound_us = decodeURIComponent(vocabulary.sound_us);
		var definition = decodeURIComponent(vocabulary.definition);

		//process definition for format.
		definition = definition.replace(/\./g, ".<p>");

		content += "<li><a id='" + name + "-li' onmouseover=\"play('" + sound_uk + "')\" onclick=\"getVocabularyDetail('" + name  +  "')\">" + name + "</a>" + " [<a onclick=\"play('" + sound_uk  + "')\">BrE</a> /" + pronunciation_uk  + "/&nbsp<a onclick=\"play('" + sound_us + "')\">NAmE</a> /" + pronunciation_us  + "/]</li>";
		content += "<div id='" + name + "' style='border:1px solid #000' hidden='true'>" + definition  + "</div>"
	    }

	    content += "</ol>";

	    document.getElementById("vocabulary_list").innerHTML = content;
	}
    }
    req.open("GET","get",true);
    req.send();
}

function getArticle() {
    console.log("start getting article.");
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
	if (req.readyState == 4 && req.status == 200) {
	    var articleObj = JSON.parse(req.responseText);
	    console.log(articleObj);

	    var content = "<ol reversed>";

	    for (i=0;i<articleObj.article.length-1;i++){
		var article = articleObj.article[i];
		var name = decodeURIComponent(article.name);
		var path = decodeURIComponent(article.path);

		content += "<li><a id='" + name + "-li' onclick=\"showArticle('" + path  +  "')\">" + name + "</a></li>";
	    }

	    content += "</ol>";

	    document.getElementById("article_list").innerHTML = content;
	    console.log("getting article is end.");
	    
	    document.getElementById("file_name").value  = "";
	    document.getElementById("file_upload").value = "";
	}
    }
    req.open("GET","get-article",true);
    req.send();
}

function showArticle(path) {
    var _pdf = document.getElementById("pdf");
    _pdf.data = "file?" + path;
}

function uploadFile() {
    var fd = new FormData();
    
    fd.append("name", document.getElementById("file_name").value);
    fd.append("fileName", document.getElementById("file_upload").files[0]);

    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
	    //var center = document.getElementById("vocabulary_detail");
	    //center.innerHTML = req.responseText;
	    console.log("upload done!");
	    getArticle();
	}
    }

    req.open("POST","upload",true);
    req.send(fd);
}

function showArticleList() {
    var articleDiv = document.getElementById("article_div");
    var separatorA = document.getElementById("separator_a");
    var articleContent = document.getElementById("article_content");
    
    if (articleDiv.hidden) {
	articleDiv.hidden = false;
	separatorA.innerHTML = "<";
	articleContent.style.width = "45.6%";
    } else {
	articleDiv.hidden = true;
	separatorA.innerHTML = ">";
	articleContent.style.width = "63.6%";
    }
}

function init() {
    getVocabulary();
    getArticle();
}

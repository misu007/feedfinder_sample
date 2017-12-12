//
// -----------------------------------------------------------------------------------------
//
//  Event Listner
//
// -----------------------------------------------------------------------------------------
// 
$(function(){
    ga_set_user($('#gaUserId').val());    
    ga_action('/login', 'Login');
    
    $(window).scroll(function () {
        //Scroll button
        var topBtn = $('#page-top');    
        var countBox = $('#count-indicator');    
        //Scroll to top button
        if ($(this).scrollTop() > $(window).height()) {
            topBtn.fadeIn();
        } else {
            topBtn.fadeOut();
        }
        //Count box      
        if ($(this).scrollTop() > $(window).height()) {
            countBox.fadeIn();
        } else {
            countBox.fadeOut();
        }  
        //Number in count box
        var maxNum = 0;
        var total = 0;
        $("div.tab-content.tab-active ul.slds-feed__list li.slds-feed__item").each(function(i, val){
            if($(val).offset().top < ($(window).height() / 2) + $(window).scrollTop()){
                maxNum = i + 1;
            }
            total = i + 1;
        });
        if (current_active_feed_no != maxNum){
			current_active_feed_no = maxNum;
            $("div.tab-content.tab-active ul.slds-feed__list li.slds-feed__item").each(function(i, val){
              	  $(val).removeClass('feed-show-active');
            });
            $("div.tab-content.tab-active ul.slds-feed__list li.slds-feed__item:eq(" + (maxNum - 1) + ")").addClass('feed-show-active');
                                                                                       
        }
        $('#currentfeedcount').html(String(maxNum).replace(/(\d)(?=(\d\d\d)+$)/g, '$1,'));
        $('#feedscount2').html(String(total).replace(/(\d)(?=(\d\d\d)+$)/g, '$1,'));       
    });
    //When clicked brand image
    $(document).on('click', '.brand-image', function(){
        ga_action('/reload', 'Reload App');
        location.reload();
    });
    //When clicked menu "HOME"
    $(document).on('click', '#changetabbutton0', function(){
        selectedMenuId = 'home';
        changeMenuActive(this);
        changeTab(0);
        loadNews();
        ga_action('/home', 'Show Home');
    });
    //When clicked menu "Tag"
    $(document).on('click', '.my-tab-select', function(){
        var tid = $(this).data("tagid");
        selectedMenuId = tid;
        changeMenuActive(this);
        changeTab(2);
        selectedMyTag = tid;
        mystartLoading();
        updateFeedElementsOnTagSelected(tid);
        ga_action('/tag/feeds', 'Show list of Feeds in Tag');
    });
    //When submited word search
    $('#searchWordForm').on('submit', function(){
        selectedMenuId = 'wordsearch';
        deactiveAllMenu();
        changeTab(1);
        performSearchJS();
        ga_action('/search/feeds', 'Execute word search');
        return false;
    });  
    //When submited tag search
    $('#searchtagform').on('submit', function(){
        var word = $('#addtagsearchinput').val();
        if(word.length > 0){
            if($('#lookup-357 #taglookups li:first')[0]){
                $('#lookup-357 #taglookups li:first').click();
            } else if($('#lookup-357 #newtaglookup li:first')[0]){
                $('#lookup-357 #newtaglookup li:first').click();
            }           
        } else {
            $('#linkFeedToTagsBtn').click();
        }
        return false;
    });
    // When clicked "Add tag" button
    $(document).on('click','.addtaga',function(){
        openAddTagModal();
        targetFeedId = $(this).data('feedid');
        $('#addtagsearchinput').focus();
    });
    // When clicked "Release tag" button
    $(document).on('click','.releasetaga',function(){
        if(window.confirm('Are you sure??')){
            mystartLoading();
            var fid = $(this).data('feedid');
            var tid = $(this).data('tagid');
            af_releaseTag(fid, tid);
            ga_action('/feed/tag/remove', 'Remove tag from Feed');
        }
    });
    // When clicked "Del tag" button
    $(document).on('click','.deltaga',function(){
        if(window.confirm('Are you sure??')){
            mystartLoading();
            var tid = $(this).data('tagid');
            af_delTag(tid);
            ga_action('/tag/delete', 'Delete tag');
        }
    });
	// When clicked "right menu open"    
    $(document).on('click','#my-right-menu-tg, #my-right-menu a',function(){
        $("#my-right-menu").toggleClass("active");
    });
    // When selected "Tag" in Tag lookups on the add tag modal
    $(document).on('click','.addtaglookup',function(){
        selectTag($(this).data('id'), $(this).data('word'));
        initAddTagInput();
        onFocusAddTagInput();
    });
    //Whenever changed in the input field on the  add tag modal
    $('#addtagsearchinput').on('input propertychange paste', function(){
        addTagInputChange();
    });
    //When clicked create tag in Tag lookups on the add tag modal
    $('#newtaglookup').on('click', function(){
        selectTag('new', $('#addtagsearchinput').val());
        initAddTagInput();
        onFocusAddTagInput();
    });
    //When clicked fix adding tag to the feed 
    $('#linkFeedToTagsBtn').on('click', function(){
        linkFeedToTags();
        ga_action('/feed/tag/add', 'Add tags to Feed');
    });
    //When changed sort option
    $(document).on('change', '#sortselectbox, #ordercheckbox', function() {
        //var searchTab = $("#tab1").css('display');
        var doneLoading = $("#loadingmarker").hasClass("hidden");        
        if(doneLoading){
            hideFeedsArea();
            setTimeout(function(){
                doSort();
                doFilter();
                var sword = document.getElementById('searchWord').value;
                reRenderFeedElementsDiv('---', sword);
                showFeedsArea();
            }, 0);
        }
        ga_action('/feeds/sort', 'Sort feeds');
    });
    // Published By
    $(document).on('change', '#filter-published-by, #filter-published-to, #filter-date-from, #filter-date-to, #filterform input', function() {    
        $('#filterform').submit();
    });
    
	// When submited filter    
    $(document).on('click', '#filter-submit-button', function() {
        $('#filterform').submit();
    });    
    //When submited filter option
    $(document).on('submit', '#filterform', function() {
        //var searchTab = $("#tab1").css('display');
        var doneLoading = $("#loadingmarker").hasClass("hidden");        
        if(doneLoading){
            hideFeedsArea();
            sortFilterRender();
            showFeedsArea();
        }
        ga_action('/feeds/filter', 'Filter feeds');
        return false;
    });
    // When clicked "Reset filter"
    $(document).on('click','#reset-filter-button',function(){
        resetFilters();
        $("#filterform").submit();
        ga_action('/feeds/filter/reset', 'Reset Filter');
    });
    // When clicked "Reset sort"
    $(document).on('click','#reset-sort-button',function(){
        resetOptions();
        sortFilterRender();
        ga_action('/feeds/sort/reset', 'Reset Sort');
    });
	// When clicked logout button    
    $(document).on('click', '#logoutButton',function(){
        af_logout();
        ga_action('/logout', 'Log out');
    });
    // When clicked nothing
    $(document).click(function(e){
        if(!$.contains($('#my-right-menu-tg')[0], e.target)){
            if($('#my-right-menu').hasClass('active')){
                closeRightMenu();
            }
        }
        if (!$.contains($('.slds-modal__container')[0], e.target) && !$.contains($('.my-right-left')[0], e.target)){
            if($('#addtagmodal1').hasClass('slds-fade-in-open')){
                closeAddTagModal();
            }
        }
        if(!$.contains($('.my-right-left')[0], e.target)){
            closeTagDropdownMenu();
        }
    });
    
    // When focused on Filter form
    /*
    $(".filter-div").hover(
        function(e){
            var targetClass = $(this).data('tclass');
            $('.' + targetClass).each(function(i, elm){
                $(elm).addClass('mytarget-focus');
            });
        }, function(e){
            var targetClass = $(this).data('tclass');
            $('.' + targetClass).each(function(i, elm){
                $(elm).removeClass('mytarget-focus');
            });        
        });
    */
    // Initialize app 
    doInit();    
});

// 
// -----------------------------------------------------------------------------------------
//
//  Custom Functions
//
// -----------------------------------------------------------------------------------------
// 
// 
var doneError = false;

function checkError(){
    if(doneError == false){
        var errorMessage = $('#errorMessage').val();
        if (errorMessage && errorMessage.length > 0){
            alert(errorMessage);
            doneError = true;
        }
    }
}

function closeTagDropdownMenu(){
    $('.feed-finder .slds-dropdown-trigger').each(function(i, elm){
        if($(elm).hasClass('slds-is-open')){
            $(elm).removeClass("slds-is-open");
            $(elm).addClass("slds-is-close");
        }
    })
}

function closeRightMenu(){
    $("#my-right-menu").removeClass("active");
}

function completeLogout(){
    var status = $('#logoutMessage').val();
    if (status === 'complete'){
        deleteCookie();
        window.setTimeout(function(){
            changeToLogout();
        }, 200);
    } else {
        alert ('Error : ' + status);
    }
}
function deleteCookie(){
    var invalidDate = new Date();
    invalidDate.setTime(0);
    document.cookie = "apex__access_token=;path=/;secure=true;expires=" + invalidDate.toGMTString();
    document.cookie = "apex__id=;path=/;secure=true;expires=" + invalidDate.toGMTString();
    document.cookie = "apex__instance_url=;path=/;secure=true;expires=" + invalidDate.toGMTString();
}

function changeToLogout(){
    $('#feed-finder-container').html('<div class="logout-message"><p>Log out complete. Thank you.</p><br/><br/><a class="logout-link" href="javascript:location.reload();"><img src="' + logoImageURL + '"/><br/><span>Log in FeedFinder</span></a></div>');    
}

function sortFilterRender(){
    doSort();
    doFilter();
    var sword = document.getElementById('searchWord').value;
    var count = reRenderFeedElementsDiv('---', sword);
    countSet(count);
}

function remakeMenuActive(){
    $("#menuitem" + selectedMenuId).addClass("active");
}

function doInit(){
    loadNews();
    af_updateTagList();
    af_changeProfileMe();
    setInterval(checkError,3000);
}

function getQuery(hash) {
    hash = hash.substr(1);
    var params = hash.split('&');
    var result = new Object();
    for (var i = 0; i < params.length; i++) {
        var element = params[i].split('=');
        var paramName = decodeURIComponent(element[0]);
        var paramValue = decodeURIComponent(element[1]);
        result[paramName] = decodeURIComponent(paramValue);
    }
    return result;  
}

function resetOptions(){
    $("#sortselectbox").val('---');
    $("#ordercheckbox").prop('checked', false);    
}

function resetFilters(){
    $("#filterform input").each(function(){
        $(this).val('');
    });
    $('#filter-published-to').val('all');
    $('#filter-published-by').val('all');
}

function performSearchJS(){
    mystartLoading();
    $('#searchWord').blur();
    resetOptions();
    resetFilters();
    var search_word = document.getElementById('searchWord').value;
    performSearchAF(search_word);
}

function loadNews(){
    mystartLoading();
    af_getNews();
}

function mystartLoading(){
    $("#feedsarea").removeClass("hidden");
    $("#feedsarea").addClass("hidden");
    $("#loadingmarker").removeClass("hidden");
}
function myfinishLoading(){
    $("#feedsarea").removeClass("hidden");
    $("#loadingmarker").addClass("hidden");
}

function countSet(count){
    var otext = String(count).replace(/(\d)(?=(\d\d\d)+$)/g, '$1,');
    $("#feedscount").html(otext);
}

function doFilter(){
    var dateFrom = $("#filter-date-from").val();
    var dateTo = $("#filter-date-to").val();
    var postPerson = $("#filter-published-by").val();
    var groupName = $("#filter-published-to").val();
    var feedIncludeWord = $("#filter-feed-word-include").val();
    var feedExcludeWord = $("#filter-feed-word-exclude").val();
    var groupIncludeName = $("#filter-group-name-include").val();
    var groupExcludeName = $("#filter-group-name-exclude").val();
    var jsont = $("#pocessedjson").val();
    var jsono = JSON.parse(jsont);
    var elements = $("#tab2").css('display') == 'block' ? jsono.results : jsono.elements;

    var newElements = [];
    for(var i in elements){
        var elm = $("#tab2").css('display') == 'block' ? elements[i].result : elements[i];
        //var createdDate = elm.relativeCreatedDate;
        var createdDate = elm.createdDate;
        var hantei = 0;
        if(postPerson != 'all' && postPerson.length > 0){
            if(elm.actor == null || elm.actor.displayName == null || elm.actor.displayName != postPerson){
                hantei += 1;
            }
        }
        if(groupName != 'all' && groupName.length > 0){
            if(elm.parent == null || elm.parent.name == null || elm.parent.name != groupName){
                hantei += 1;
            }
        }
        if(feedIncludeWord && feedIncludeWord.length > 0){
            if(elm.body == null || elm.body.text == null || elm.body.text.indexOf(feedIncludeWord) == -1){
                hantei += 1;
            }
        }
        if(feedExcludeWord && feedExcludeWord.length > 0){
            if(elm.body == null || elm.body.text == null || elm.body.text.indexOf(feedExcludeWord) != -1){
                hantei += 1;
            }
        }
        if(dateFrom && dateFrom.length > 0){
            var date1 = moment(createdDate, 'YYYY-MM-DDTHH:mm:ssZ');
            var date2 = moment(dateFrom);
            if(!(date1.isSameOrAfter(date2))){
                hantei += 1;
            }
        }
        if(dateTo && dateTo.length > 0){
            var date1 = moment(createdDate, 'YYYY-MM-DDTHH:mm:ssZ');
            var date2 = moment(dateTo).endOf('day');
            if(!(date1.isSameOrBefore(date2))){
                hantei += 1;
            }
        }
        if (hantei === 0){
            newElements.push(elm);
        }        
    }
    jsono.elements = newElements;
    var newjsont = JSON.stringify(jsono);
    $("#pocessedjson").val(newjsont);  
}

function setFilterOptions(elements, type){
    var orgPublishedBy = $('#filter-published-by').val() || '';
    var orgPublishedTo = $('#filter-published-to').val() || '';
    var tgroup = {};
    var tactor = {};
    if (orgPublishedTo != null && orgPublishedTo != 'all' && orgPublishedTo.length > 0){
        tgroup[orgPublishedTo] = 0;
    }
    if (orgPublishedBy != null && orgPublishedBy != 'all' && orgPublishedBy.length > 0){
        tactor[orgPublishedBy] = 0;
    }
    var maxDate = moment('1980-01-01');
    var minDate = moment();
    for(var i in elements){
        var elm = 
            type == 'tag' ? elements[i].result: elements[i];
        var createdDate = elm.createdDate;
        var actorName = elm.actor.displayName;
        var groupName = elm.parent.name;  
        if (tgroup.hasOwnProperty(groupName)){
            tgroup[groupName] ++;
        } else {
            tgroup[groupName] = 1;
        }
        if (tactor.hasOwnProperty(actorName)){
            tactor[actorName] ++;
        } else {
            tactor[actorName] = 1;
        }
        var thisDate = moment(createdDate, 'YYYY-MM-DDTHH:mm:ssZ');
        if (thisDate && thisDate.isBefore(minDate)){
            minDate = thisDate;
        }
        if (thisDate && thisDate.isAfter(maxDate)){
            maxDate = thisDate;
        }
    }
    
    $("#filter-published-by").empty();
    $("#filter-published-by").append($("<option>").val('all').text('-- ALL --'));
    for(var key in tactor){
        if (tactor.hasOwnProperty(key)) {
            $("#filter-published-by").append($("<option>").val(key).text(key + ' (' + tactor[key] + ')'));
        }
    }
    if (orgPublishedBy && orgPublishedBy.length > 0){ 
        $('#filter-published-by').val(orgPublishedBy);
    }


    $("#filter-published-to").empty();
    $("#filter-published-to").append($("<option>").val('all').text('-- ALL --'));
    for(var key in tgroup){
        if (tgroup.hasOwnProperty(key)) {
            $("#filter-published-to").append($("<option>").val(key).text(key + ' (' + tgroup[key] + ')'));
        }
    }
    if (orgPublishedTo && orgPublishedTo.length > 0){ 
    	$('#filter-published-to').val(orgPublishedTo);
    }

   	if ($('#filter-date-from').val().length == 0 && $('#filter-date-to').val().length == 0){
        $('#filter-date-from').val(minDate.format('YYYY-MM-DD'));
        $('#filter-date-to').val(maxDate.format('YYYY-MM-DD'));        
    }
    /*
    */
}

function doSort(){
    var sortType = $("#sortselectbox").val();
    var reverse = $("#ordercheckbox").prop('checked');
    
    if(sortType.match(/sort/)){
        
        var jsont = $("#myid").val();
        var jsono = JSON.parse(jsont);
        var results = $("#tab2").css('display') == 'block' ? jsono.results : jsono.elements;
        
        var value1 = reverse ? -1 : 1;
        var value2 = reverse ? 1 : -1;
        
        results.sort(function(a, b){
            if($("#tab2").css('display') == 'block'){
                a = a.result;
                b = b.result;
            }
            var aactor = a.actor ? a.actor.displayName : '';
            var bactor = b.actor ? b.actor.displayName : '';
            var aGroup = a.parent ? a.parent.name : '';
            var bGroup = b.parent ? b.parent.name : '';
            var alikeCount = a.capabilities.chatterLikes ? a.capabilities.chatterLikes.page.total : 0;
            var blikeCount = b.capabilities.chatterLikes ? b.capabilities.chatterLikes.page.total : 0;
            var aCommentCount = a.capabilities.comments ? a.capabilities.comments.page.total : 0;
            var bCommentCount = b.capabilities.comments ? b.capabilities.comments.page.total : 0;
            if(sortType.match(/person/)){
                return (aactor > bactor ? value1 : value2);
            } else if(sortType.match(/group/)){
                return (aGroup > bGroup ? value1 : value2);
            } else if (sortType.match(/like/)){
                return (alikeCount < blikeCount ? value1 : value2);
            } else if (sortType.match(/comment/)){
                return (aCommentCount < bCommentCount ? value1 : value2);
            } else if (sortType.match(/create/)){
                //var date1 = moment(a.relativeCreatedDate, 'YYYY/MM/DD(HH:mm)');
                //var date2 = moment(b.relativeCreatedDate, 'YYYY/MM/DD(HH:mm)');
                var date1 = moment(a.createdDate, 'YYYY-MM-DDTHH:mm:ssZ');
                var date2 = moment(b.createdDate, 'YYYY-MM-DDTHH:mm:ssZ');
                return (date1.isSameOrAfter(date2) ? value1 : value2);
            } else {
                return 1;
            }
        });        
        
        jsono.elements = results;
        var newjsont = JSON.stringify(jsono);
        $("#pocessedjson").val(newjsont);
        
    } else {
        copyJson();
    }
    
    
}
function copyJson(){
    var jsont = $("#myid").val();
    $("#pocessedjson").val(jsont);
}

function completeProfile(){
    var profileImgJson = $('#profileImg').val();
    var profileImgUrl = JSON.parse(profileImgJson)['thumbnail'];
    $('#myProfileImg').attr('src', profileImgUrl);
}

function completeNews(){
    copyJson();
    reRenderFeedElementsDiv('feedsUlNews');
    myfinishLoading();
}
function completeDoSearch(){
    doSort();
    var sword = $('searchWord').val() + ' ' + $('#filter-feed-word-include').val();
    var count = reRenderFeedElementsDiv('---', sword);
    countSet(count);
    myfinishLoading();
}
function completeTagSearch(){
    try{
        copyJson();
        reRenderFeedElementsDivWithTag('feedsUlTag');
    } catch(e){
        console.log(e);
    }
    myfinishLoading();
}
function afterReleaseTags(){
    af_updateTagList();
    updateFeedElementsOnTagSelected(selectedMyTag);
}

function afterDelTag(){
    af_updateTagList();
    $("#feedsUl").html('');
    $("#changetabbutton0").click();
    myfinishLoading();
}

function hideFeedsArea(){
    $('#feedsarea .tab-content.tab-active .slds-feed__list').hide();
}
function showFeedsArea(){
    $('#feedsarea .tab-content.tab-active .slds-feed__list').fadeIn();
}

function changeMenuActive(targetElm){
    deactiveAllMenu();
    $(targetElm).find('.slds-tree__item').addClass("active");    
}

function deactiveAllMenu(){
    $("#menu-list-ul .myitem .slds-tree__item").each(function(i, elm){
        $(elm).removeClass("active");
    });
}

function changeTab(ti){
    var tabs = 4;
    for (var i=0; i < (tabs + 1); i++){
        $("#tab" + i).hide();
        $("#otab" + i).hide();
        $("#tab" + i).removeClass("tab-active");
    }
    if(ti == 0){
        $("#otab0").show();
    }
    $("#tab" + ti).show();
    $("#otab1").show();
    
    $("#tab" + ti).addClass("tab-active");  
    $( 'html, body' ).prop( { scrollTop: 0 } );
    resetOptions();
    resetFilters()
}
function toggleDropdown(target){
    if($(target).hasClass("slds-is-open")){
        $(target).removeClass("slds-is-open");
        $(target).addClass("slds-is-close");
    } else if ($(target).hasClass("slds-is-close")){
        $(target).removeClass("slds-is-close");
        $(target).addClass("slds-is-open");
    }                    
}



function openModal(target){
    $('#' + target + 'modal1').removeClass("slds-fade-in-close");
    $('#' + target + 'modal1').addClass("slds-fade-in-open");
    $('#' + target + 'modal2').removeClass("slds-backdrop--close");
    $('#' + target + 'modal2').addClass("slds-backdrop--open");
    
    current_scrollY = $( window ).scrollTop();
    $( '#rightcontent' ).css( {
        position: 'fixed',
        width: '100%',
        top: -1 * current_scrollY + 35
    } );
}
function closeModal(target){
    $('#' + target + 'modal1').removeClass("slds-fade-in-open");
    $('#' + target + 'modal1').addClass("slds-fade-in-close");
    $('#' + target + 'modal2').removeClass("slds-backdrop--open");
    $('#' + target + 'modal2').addClass("slds-backdrop--close");
    $( '#rightcontent' ).attr( { style: '' } );
    $( 'html, body' ).prop( { scrollTop: current_scrollY } );
}




function openAddTagModal(){
    selectedTags = new Array();
    updateSelectedTags();
    $('#addtagsearchinput').val('');
    $('#addtagmodal1').removeClass("slds-fade-in-close");
    $('#addtagmodal1').addClass("slds-fade-in-open");
    $('#addtagmodal2').removeClass("slds-backdrop--close");
    $('#addtagmodal2').addClass("slds-backdrop--open");
    
    current_scrollY = $( window ).scrollTop();
    $( '#rightcontent' ).css( {
        position: 'fixed',
        width: '100%',
        top: -1 * current_scrollY + 35
    } );
}
function closeAddTagModal(){
    $('#addtagmodal1').removeClass("slds-fade-in-open");
    $('#addtagmodal1').addClass("slds-fade-in-close");
    $('#addtagmodal2').removeClass("slds-backdrop--open");
    $('#addtagmodal2').addClass("slds-backdrop--close");
    $('#addtagsearchinput').val('');
    $('#addtagsearchlookup').removeClass("slds-is-open");
    $('#addtagsearchlookup').addClass("slds-is-close");
    $( '#rightcontent' ).attr( { style: '' } );
    $( 'html, body' ).prop( { scrollTop: current_scrollY } );
}

function addTagInputChange(){
    var word = $('#addtagsearchinput').val();
    if(word.length > 0){
        if($('#addtagsearchlookup').hasClass("slds-is-close")){
            $('#addtagsearchlookup').removeClass("slds-is-close");        
            $('#addtagsearchlookup').addClass("slds-is-open");
        }
        $('#addtagnewword').html(word);
        changeTagLookUps(word);
    } else {
        if($('#addtagsearchlookup').hasClass("slds-is-open")){
            $('#addtagsearchlookup').removeClass("slds-is-open");
            $('#addtagsearchlookup').addClass("slds-is-close");
        }
    }
}

function initAddTagInput(){
    $('#addtagsearchinput').val('');
    if($('#addtagsearchlookup').hasClass("slds-is-open")){
        $('#addtagsearchlookup').removeClass("slds-is-open");
        $('#addtagsearchlookup').addClass("slds-is-close");
    }    
}
function onFocusAddTagInput(){
    $('#addtagsearchinput').focus();
}


function changeTagLookUps(word){
    $('#taglookups').html('');
    
    for (var key in tags){
        if(tags[key].indexOf(word) != -1){
            var nn = 0;
            for (var key2 in selectedTags){
                if(selectedTags[key2].id == key){
                    nn += 1;
                }
            }
            if(nn == 0){
                $('#taglookups').append('<li role="presentation" class="addtaglookup" data-id="' + key + '" data-word="' + tags[key] + '">' +
                                        '<span class="slds-lookup__item-action slds-media slds-media--center" role="option">' +
                                        '<i class="fa fa-tag fa-fw fa-2x" aria-hidden="true"></i>' +
                                        '<div class="slds-media__body">' +
                                        '<div class="slds-lookup__result-text">' + tags[key] + '</div>' +
                                        '<span class="slds-lookup__result-meta slds-text-body--small">Tag</span>' +
                                        '</div></span></li>');
            }
        }
    }
}
function selectTag(id, word){
    var tagObject = new Object();
    tagObject['id'] = id;
    tagObject['word'] = word;
    selectedTags.push(tagObject);
    updateSelectedTags();
}

function updateSelectedTags(){
    $('#selectedtags').html('');
    for (var key in selectedTags){
        $('#selectedtags').append('<span class="slds-badge" data-id="' + selectedTags[key].id + '">' + selectedTags[key].word + '</span>');
    }
}

function linkFeedToTags(){
    var selectedCount = Object.keys(selectedTags).length;
    if (selectedCount > 0 && window.confirm('Are you sure to add tags to this feed?')){    
        af_tagFeedItem(targetFeedId, JSON.stringify(selectedTags));
        if (debugMode === 'ON'){
            console.log(targetFeedId + ' : ' + JSON.stringify(selectedTags));
        }
        closeAddTagModal();
        initSelectedTag();
    } else {
        alert('Please select more than one tag.');
    }
    
}


function initSelectedTag(){
    selectedTags = [];
    $('#selectedtags').html('');    
}


function reRenderFeedElementsDiv(divId){
    var highlightWord = $('#searchWord').val() + ' ' + $('#filter-feed-word-include').val();
    var targetDiv = $('#feedsarea .tab-content.tab-active .slds-feed__list');
    targetDiv.html('');
    var orgURL = $("#orgurl").val();
    var jsont = $("#pocessedjson").val();
    if (debugMode === 'ON'){
        console.log(jsont);
    }
    var count = 0;
    try {
        var jo = JSON.parse(jsont);
        if('elements' in jo){
            var elms = jo.elements;
            setFilterOptions(elms);
            var registeredTags = JSON.parse($('#tagListJSON').val());
            for (var i in elms){
                try {
                    var liDom = createLiDOM(elms[i], orgURL, registeredTags);
                    if(highlightWord && highlightWord.length > 0){
                        var wos = highlightWord.split(/\s/);
                        for (var ii = 0; ii < wos.length; ii ++){
                            liDom = _highlight(liDom, wos[ii]);
                        }                        
                    }
                    targetDiv.append(liDom);
                    count += 1;
                } catch (e){
                    console.log(e);
                }
            }    
        }
    } catch(e) {
        
    }
    return count;
}

function reRenderFeedElementsDivWithTag(divId){
    var tagId = selectedMyTag;
    var tagName =  tags[tagId];
    var targetDiv = $('#feedsarea .tab-content.tab-active .slds-feed__list');
    targetDiv.html('');
    var orgURL = $("#orgurl").val();
    var jsont = $("#pocessedjson").val();
    console.log(jsont);
    if (debugMode === 'ON'){
        console.log(jsont);
    }
    try {
        var jo = JSON.parse(jsont);
        if('results' in jo){
            var elms = jo.results; 
            setFilterOptions(elms, 'tag');
            var registeredTags = JSON.parse($('#tagListJSON').val());
            for (var i in elms){
                try {
                    var liDom = createLiDOM(elms[i].result, orgURL, registeredTags, tagId, tagName);                
                    targetDiv.append(liDom);
                } catch (e){
                    console.log(e);
                }
            }    
        }
    } catch(e){
        console.log('error:' + e);
    }
    var delTagDom = 
        '<li style="background-color:rgba(255,255,255,.5);padding: 10px;">' +
        '<section class="slds-clearfix">' +
        '<div class="slds-float--right">' +
        '<a href="#" class="slds-text-body--small slds-text-color--error deltaga" data-tagid="' + tagId +'"><i class="fa fa-trash" aria-hidden="true"></i> delete "' + tagName + '"</a>' +
        '</div>' +
        '</section>' +
        '</li>';
    targetDiv.append(delTagDom);
}

function createLiDOM(elm, orgURL, registeredTags, tagId, tagName){
    var bodyText = createBodyDOM(elm.body.messageSegments, orgURL);
    
    var liDom = 
        '<li class="slds-feed__item">' +
        '<div class="slds-media slds-comment slds-hint-parent">' +
        '<div class="slds-media__figure">' +
        '<div class="slds-avatar slds-avatar--circle slds-avatar--medium">' +
        '<a href="' + orgURL + '/' + elm.actor.id + '" target="_blank" title="' + elm.actor.displayName + '">' +
        '<img src="' + elm.actor.photo.smallPhotoUrl + '"/>' +
        '</a>' +
        '</div>' +
        '</div>' +
        '<div class="slds-media__body">' +
        '<div class="slds-grid slds-grid--align-spread slds-has-flexi-truncate">' +
        '<p class="slds-truncate">' +
        '<a href="' + orgURL + '/' + elm.parent.id + '" class="mytarget-group-name" target="_blank" title="' + (elm.parent.description ? elm.parent.description : '') + '">' + elm.parent.name + '</a> - ' +
        '<a href="' + orgURL + '/' + elm.actor.id + '" class="mytarget-post-person">' + elm.actor.displayName + '</a>' +                                                            
        '</p>';
    
    if(tagId && tagName){   
        /*        
        liDom += 
            '<div class="slds-dropdown-trigger slds-dropdown-trigger--click slds-is-close" aria-expanded="true" onclick="toggleDropdown(this);">' +
            '<button class="slds-button slds-button--icon-border-filled slds-button--icon-x-small slds-shrink-none" aria-haspopup="true">' +
            '<i class="fa fa-angle-down" aria-hidden="true"></i>' +
            '<span class="slds-assistive-text">Show More</span>' +
            '</button>' +                
            '<div class="slds-dropdown slds-dropdown--right">' +
            '<ul class="dropdown__list" role="menu">' +
            '<li class="slds-dropdown__item">' +
            '<a href="#" class="addtaga" data-feedid="' + elm.id + '">' +
            '<span class="slds-truncate">Add Tag</span>' +
            '</a>' +
            '</li>' +
            '<li class="slds-dropdown__item">' +
            '<a href="#" class="releasetaga" data-feedid="' + elm.id + '" data-tagid="' + tagId + '">' +
            '<span class="slds-truncate">Release this feed out of "' + tagName + '"</span>' +
            '</a>' +
            '</li>' +
            '</ul>' +
            '</div>' +
            '</div>';
*/        
        liDom += 
            '<div class="slds-dropdown-trigger slds-dropdown-trigger--click slds-is-close" aria-expanded="true" onclick="toggleDropdown(this);">' +
            '<a class=" slds-shrink-none" aria-haspopup="true">' +
            '<i class="fa fa-tag fa-active"  style="font-size:1.5em;" aria-hidden="true"></i>' +
            '<span class="slds-assistive-text">Show More</span>' +
            '</a>' +                
            '<div class="slds-dropdown slds-dropdown--right">' +
            '<ul class="dropdown__list" role="menu">' +
            '<li class="slds-dropdown__item">' +
            '<a href="#" class="addtaga" data-feedid="' + elm.id + '">' +
            '<span class="slds-truncate">Add tags</span>' +
            '</a>' +
            '</li>' +
            '<li class="slds-dropdown__item">' +
            '<a href="#" class="releasetaga" data-feedid="' + elm.id + '" data-tagid="' + tagId + '">' +
            '<span class="slds-truncate">Untag "' + tagName + '"</span>' +
            '</a>' +
            '</li>' +
            '</ul>' +
            '</div>' +
            '</div>';
    } else {
        var tagType = registeredTags.hasOwnProperty(elm.id)? 'fa-active':  'fa-notactive';
        liDom +=    
            '<a href="#" class="addtaga" data-feedid="' + elm.id + '"><i aria-hidden="true" class="fa fa-tag ' + tagType + '" style="font-size:1.5em;"></i></a>';
        
    }
    
    liDom += 
        '</div>' +
        '<p class="slds-text-body--small"><a href="' + orgURL + '/' + elm.id + '" target="_blank" class="mytarget-post-date">' + elm.relativeCreatedDate + '</a></p>' +
        ' <div class="slds-post__content slds-text-longform mytarget-feed-text">' ;
    
    if (elm.capabilities.questionAndAnswers){
        liDom += elm.capabilities.questionAndAnswers.questionTitle;
    }
    liDom +=
        bodyText + ' </div>';
    
    // Topic
    liDom += createTopicDOM(elm, orgURL);
    
    // Link           
    liDom += createLinkDOM(elm);
    
    // Attach Files
    liDom += createAttachDOM(elm, orgURL);
    
    // Poll
    liDom += createPollDOM(elm, orgURL);
    
    liDom +=  
        '<ul class="slds-list--horizontal slds-has-dividers--right slds-text-body--small" style="margin-top: 12px;">' +
        '<li class="slds-list__item">';
    
    liDom += 
        elm.capabilities.chatterLikes.page.total > 0 ? 
        '<span class="my-icon-container my-icon-like" style="">' +
        '<img src="' + likeIconURL + '"/></span><span style="">' + elm.capabilities.chatterLikes.page.total + ' likes</span>':
    '';
    
    liDom +=  
        '</li>' +
        '</ul>' +
        
        '</div>' +
        '</div>';
    
    // Comments
    liDom += createCommentsDOM(elm, orgURL);
    
    liDom +=  
        '</li>';
    
    return liDom;
}

function createBodyDOM(messageSegments, orgURL){
    var ret = '';
    if(messageSegments){
        var segs = messageSegments;
        for (var i in segs){
            var seg = segs[i];
            if(seg.type == 'MarkupBegin'){
                ret += '<' + seg.htmlTag + '>';
            } else if (seg.type == 'MarkupEnd'){
                ret += '</' + seg.htmlTag + '>';                
            } else if (seg.type == 'EntityLink'){
                
            } else if (seg.type == 'Hashtag'){
                ret += '<a href="' + seg.url + '" target="_blank">' + seg.text + '</a>';                
            } else if (seg.type == 'Link'){
                ret += '<a href="' + seg.url + '" target="_blank">' + seg.text + '</a>';                   
            } else if (seg.type == 'Mention'){
                ret += '<a href="' + orgURL + '/' + seg.record.id + '" target="_blank">' + seg.text + '</a>';                
            } else if (seg.type == 'Text'){
                ret += seg.text;                
            } else if (seg.type == 'InlineImage'){
                //not complete
                //ret += '<img src="' + orgURL+ seg.thumbnails.previews[0].previewUrls[0].previewUrl + '"/>';                
            }
        }
    }
    ret = ret.replace(/\n/g, "<br/>");
    return ret;
}

function createAttachDOM(elm, orgURL){
    var ret = '';
    if (elm.capabilities.files){     
        var fileItem = elm.capabilities.files.items;
        for (var i in fileItem){
            try {
                var file = fileItem[i];
                /*
            ret +=  
                '<div class="slds-attachments">' +
                '<div class="slds-attachments__item slds-box slds-box--x-small slds-theme--shade">' +
                '<div class="slds-grid slds-grid--align-spread">' +
                '<div class="slds-media">' +
                '<div class="slds-media__body">' +
                '<a href="' + orgURL + '/' + file.id + '" target="_blank">' + file.title + '</a>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
                */
                if (file.thumb720By480RenditionStatus == 'Success'){
                    ret +=
                        '<div class="slds-my">' +
                        '<figure class="slds-image slds-image--card" style="margin: 0 auto;">' +
                        '<a href="' + orgURL + '/' + file.id + '" target="_blank" class="slds-image__crop slds-image__crop--16-by-9">' +
                        '<img src="' + contentUrl + 'versionId=' + file.versionId + '&contentId=' + file.id + '"/>' +
                        '</a>' +
                        '<figcaption class="slds-image__title slds-image__title--card">' +
                        '<span class="slds-icon_container slds-m-right--x-small" title="image">' +
                        '<span class="slds-assistive-text">image</span>' +
                        '</span>' +
                        '<span class="slds-image__text slds-truncate" title="Image Title">' + file.title + '</span>' +
                        '</figcaption>' +
                        '</figure>' +
                        '</div>';
                } else if (file.fileExtension.match(/ppt/)){
                    ret +=
                        '<figure class="slds-image slds-image--card">' +
                        '<a href="' + orgURL + '/' + file.id + '" target="_blank" class="slds-image__crop slds-image__crop--16-by-9">' +
                        '<img src="' + xlsIconUrl + '"/>' +
                        '</a>' +
                        '<figcaption class="slds-image__title slds-image__title--card">' +
                        '<span class="slds-icon_container slds-m-right--x-small" title="image">' +
                        '<span class="slds-assistive-text">image</span>' +
                        '</span>' +
                        '<span class="slds-image__text slds-truncate" title="Image Title">' + file.title + '</span>' +
                        '</figcaption>' +
                        '</figure>';                
                } else if (file.fileExtension.match(/xls/)){
                    ret +=
                        '<figure class="slds-image slds-image--card">' +
                        '<a href="' + orgURL + '/' + file.id + '" target="_blank" class="slds-image__crop slds-image__crop--16-by-9">' +
                        '<img src="' + xlsIconUrl + '"/>' +
                        '</a>' +
                        '<figcaption class="slds-image__title slds-image__title--card">' +
                        '<span class="slds-icon_container slds-m-right--x-small" title="image">' +
                        '<span class="slds-assistive-text">image</span>' +
                        '</span>' +
                        '<span class="slds-image__text slds-truncate" title="Image Title">' + file.title + '</span>' +
                        '</figcaption>' +
                        '</figure>';                
                } else if (file.fileExtension.match(/pdf/)){
                    ret +=
                        '<figure class="slds-image slds-image--card">' +
                        '<a href="' + orgURL + '/' + file.id + '" target="_blank" class="slds-image__crop slds-image__crop--16-by-9">' +
                        '<img src="' + pdfIconUrl + '"/>' +
                        '</a>' +
                        '<figcaption class="slds-image__title slds-image__title--card">' +
                        '<span class="slds-icon_container slds-m-right--x-small" title="image">' +
                        '<span class="slds-assistive-text">image</span>' +
                        '</span>' +
                        '<span class="slds-image__text slds-truncate" title="Image Title">' + file.title + '</span>' +
                        '</figcaption>' +
                        '</figure>';                
                } else {
                    ret +=  
                        '<div class="slds-attachments">' +
                        '<div class="slds-attachments__item slds-box slds-box--x-small slds-theme--shade">' +
                        '<div class="slds-grid slds-grid--align-spread">' +
                        '<div class="slds-media">' +
                        '<div class="slds-media__body">' +
                        '<a href="' + orgURL + '/' + file.id + '" target="_blank">' + file.title + '</a>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>';
                    
                }
            } catch(e) {
                ret +=  
                    '<div class="slds-attachments">' +
                    '<div class="slds-attachments__item slds-box slds-box--x-small slds-theme--shade">' +
                    '<div class="slds-grid slds-grid--align-spread">' +
                    '<div class="slds-media">' +
                    '<div class="slds-media__body">' +
                    '<a href="' + orgURL + '/' + file.id + '" target="_blank">' + file.title + '</a>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
            }
        }
    }   
    return ret;
}

function createLinkDOM(elm){
    var ret = '';
    if (elm.capabilities.link){
        ret +=  
            '<div class="slds-media slds-box slds-grow slds-text-link--reset">' +
            '<div class="slds-media__body">' +
            '<a href="' + elm.capabilities.link.url + '" target="_blank" >' +
            '<h3 class="slds-text-heading--x-small">' + elm.capabilities.link.urlName + '</h3>' +
            '</a>' +
            '<p class="slds-text-body--small">' + elm.capabilities.link.url + '</p>' +
            '</div>' +
            '</div>   ';
    }    
    return ret;
}


function createTopicDOM(elm, orgURL){
    var ret = '';
    if (elm.capabilities.topics.items && elm.capabilities.topics.items.length > 0){
        ret +=    
            '<div class="slds-tags slds-text-body--small slds-p-bottom--x-small">' +
            '<span>Topic:</span>' +
            '<ul class="slds-tags__list">';
        var topicItems = elm.capabilities.topics.items;
        for (var i in topicItems){
            var topic = topicItems[i];
            ret += 
                '<li class="slds-tags__item">' +
                '<a href="' + orgURL + '/_ui/core/chatter/topics/TopicPage?id=' + topic.id + '" target="_blank">' + topic.name + '</a>' +
                '</li>';
        }
        ret += 
            '</ul>' +
            '</div>';
    }
    return ret;
}


function createPollDOM(elm, orgURL){
    var ret = '';
    if (elm.capabilities.poll){
        ret +=  
            '<div class="slds-media slds-box slds-grow">' +
            '<div class="slds-media__body">' +
            ' <p class="slds-text-body--medium">Poll: </p>';
        
        var pollChoices = elm.capabilities.poll.choices;
        for (var i in pollChoices){
            var choice = pollChoices[i];
            ret +=
                '<p class="slds-text-body--small">' + choice.text + '</p>';
        }
        ret +=
            '</div>' +
            '</div>';
    }
    
    return ret;  
}
function createCommentsDOM(elm, orgURL){
    var ret = '';
    
    if (elm.capabilities.comments.page.total > 0){
        var commentItems = elm.capabilities.comments.page.items;        
        var moreCommentsCount = elm.capabilities.comments.page.total - commentItems.length;
        
        
        ret +=  
            '<ul class="slds-comment__replies">';
        
        if (moreCommentsCount > 0){
            ret +=
                '<li class="slds-comment__overflow">' +
                '<a href="' + orgURL + '/' + elm.id + '" target="_blank">Show more ' + moreCommentsCount + ' comments</a>' +
                '</li>';  
        }
        
        for (var i in commentItems){
            var comment = commentItems[i];
            var commentBody = createBodyDOM(comment.body.messageSegments, orgURL);
            
            ret +=
                '<li class="mycomment';
            
            if (i == 0){
                ret += ' noborder';
            }
            
            ret +=
                '">' +
                '<div class="slds-media slds-comment slds-hint-parent">' +
                '<div class="slds-media__figure">' +
                '<div class="slds-avatar slds-avatar--circle slds-avatar--small">' +
                '<a href="#" title="">' +
                '<img src="' + comment.user.photo.smallPhotoUrl + '"/> ' +
                '</a>' +
                '</div>' +
                '</div>' +
                '<div class="slds-media__body">' +
                '<div class="slds-grid slds-grid--align-spread slds-has-flexi-truncate">' +
                '<p class="slds-truncate">' +
                '<a href="' + orgURL + '/' + comment.user.id + '">' + comment.user.displayName + '</a> - ' +
                '<span class="slds-text-body--small">' + comment.relativeCreatedDate + '</span>' +
                '</p>' +
                '</div>' +
                '<div class="slds-comment__content slds-text-longform">' +
                '<p>' + commentBody + '</p>' +
                '</div>' +
                '<ul class="slds-list--horizontal slds-has-dividers--right slds-text-body--small">';
            
            if (comment.likes.total > 0){
                ret +=
                    '<li class="slds-list__item">' +
                    '<span class="my-icon-container my-icon-like" style="">' +
                    '<img src="' + likeIconURL + '"/></span><span style="">' + comment.likes.total + ' likes</span></li>';
            }
            
            ret +=
                '</ul>' +
                '</div>' +
                '</div>' +
                '</li>';
        }
        ret +=
            '</ul>';
    }
    return ret;  
}

function _highlight(otext, hlword){
    var cWord = hlword.replace(/\s+/, '0ab12space21ba0');
    var words = cWord.split('0ab12space21ba0');
    for (var key in words){
		otext = _highlightOne(otext, words[key]);
    }
    return otext;
}

function _highlightOne(otext, targetWord){
    return otext.replace(/<[^>]*?>|([^<]+)/g, function(s0, s1){
        return (s1 === undefined) ? s0: s1.replace(new RegExp(targetWord, "g" ), '<span class="myhighlight">' + targetWord + '</span>');
    });
}



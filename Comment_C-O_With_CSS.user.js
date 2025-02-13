// ==UserScript==
// @name        Comment C-O With CSS
// @namespace        http://tampermonkey.net/
// @version        1.9
// @description        コメント管理画面のリスト開閉機能
// @author        Ameba Blog User
// @match        https://blog.ameba.jp/ucs/comment/comment*
// @icon        https://www.google.com/s2/favicons?sz=64&domain=ameba.jp
// @noframes
// @run-at        document-start
// @grant        none
// @updateURL        https://github.com/personwritep/Comment_C-O_With_CSS/raw/main/Comment_C-O_With_CSS.user.js
// @downloadURL        https://github.com/personwritep/Comment_C-O_With_CSS/raw/main/Comment_C-O_With_CSS.user.js
// ==/UserScript==


let save_t;
let mode_key;
let emode_key;

let ua=0; // Chromeの場合のフラグ
let agent=window.navigator.userAgent.toLowerCase();
if(agent.indexOf('firefox') > -1){ ua=1; } // Firefoxの場合のフラグ


let path=document.location.pathname;
if(path.match(/commentlist/)){ // コメント管理画面で動作

    let retry=0;
    let interval=setInterval(wait_target, 1);
    function wait_target(){
        retry++;
        if(retry>100){ // リトライ制限 100回 0.1secまで
            clearInterval(interval); }
        let target=document.body; // 監視 target
        if(target){
            clearInterval(interval);
            environ();
            page_design(); }}


    function environ(){
        let style=
            '<style id="co_list">'+
            '.userList__item { position: relative; } '+
            '.userList__item:focus { outline: 2px solid #2196f3; } '+
            '.userList__text { display: none; max-height: 75vh; } '+
            '.userList__information { top: 42px; right: 330px; } '+
            '.userList__buttons { top: 38px; right: 76px; } '+
            '.co_view { width: 26px; height: 26px; margin-left: 16px; color: #888; '+
            'font: 16px/27px Meiryo; padding: 0; border: 1px solid #aaa; '+
            'border-radius: 4px; background: #fff; cursor: pointer; } '+
            '.co_view:active { box-shadow: 0 0 0 1px #fff, 0 0 0 3px #0091ff; } '+
            '.co_menu { '+
            'background: linear-gradient(#26c6da 0%, #009688 70%) !important; } '+
            '.co_menu:hover { '+
            'background: linear-gradient(#009688 0%, #26c6da 100%) !important; } '+
            '.co_menu svg { fill: #fff; } '+
            '.userList__menu:active , .commentReply__headerCancel:active { '+
            'box-shadow: 0 0 0 1px #fff, 0 0 0 3px #0091ff; } '+
            '.commentReply__headerCancel { cursor: pointer; } '+
            '.userList__tooltip { z-index: 1; top: -120px; right: 0 !important; } '+
            '.item_close { position: absolute; margin: 0 !important; } '+
            '#mold, #mnew { position: absolute; width: 29px; height: 29px; '+
            'cursor: pointer; font: normal 16px/28px Meiryo; '+
            'border: 1px solid #aaa; border-radius: 4px; background: #fff; } '+
            '#mold { right: 24.5rem; } #mnew { right: 10rem; } '+
            '#mold:active, #mnew:active, .navigation__filter:active, '+
            '.navigation__setting:active { box-shadow: 0 0 0 1px #fff, 0 0 0 3px #0091ff; } '+
            '#c_overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; '+
            'background: rgb(0, 28, 25, .8); display: none; } '+
            '.efmode { position: fixed; top: 60px; width: 706px; z-index: 1999; } '+
            '.efmode_w { position: fixed; top: 60px; width: 706px; z-index: 1999; '+
            'box-shadow: -1px -1px 0 0 #ddd, 0 0 0 1px #aaa; } '+
            '.userList__item, .userList__information { background: '+
            get_cookie('item_color_set') +
            ' !important; }</style>'+
            '<style id="co_list_dark">'+
            '#ucsMainLeft .userList__titleLink, #ucsMainLeft .userList__title, '+
            '.userList__nameLink, .userList__information { color: #fff !important; } '+
            '.userList__buttons .userList__buttonsItem.is-neutral { '+
            'color: #eee; border: 1px solid #eee; } '+
            '.commentReply__headerLabel { filter: invert(1) brightness(10); } '+
            '.c-formCaption, .c-formError { color: #eee; } '+
            '</style>';

        if(!document.querySelector('#co_list')){
            document.documentElement.insertAdjacentHTML('beforeend', style); }


        let text_color=get_cookie('item_text_color'); // リストの文字色反転
        let co_list_dark=document.querySelector('#co_list_dark');
        if(co_list_dark && text_color){
            if(text_color==0){
                co_list_dark.disabled=true; }}

    } // environ()



    function page_design(){
        let style=
            '<style id="co_list_add">'+
            ':focus { outline: none; } '+
            '#ucsContent { background: #fafafa; } '+
            '#ucsMain { display: flex; flex-direction: column; background: #fafafa; } '+
            '#ucsMainLeft { position: relative; width: 740px; margin: 15px auto 0; } '+
            '#ucsMainLeft .commentList { padding: 0 0 1rem; } '+
            '#ucsMainLeft h1 { margin: 0 -32px 20px; padding: 0 32px 6px; } '+
            '.tabs { overflow: hidden; } '+
            '.tabs__item { background: #fff; } '+
            '.tabs__link { font-size: 16px; font-weight: bold; padding: 3px 0 0; } '+
            '.commentList .tabs__item.is-active { background: #2196f3; } '+
            '.navigation { position: absolute; top: 32px; left: 360px; width: 360px; border: none; } '+
            '.navigation__filter { border: 1px solid #aaa; padding: 5.5px; border-radius: 4px; '+
            'background: #fff; cursor: pointer; } '+
            '.navigation__description { font-size: 18px; font-weight: bold; padding-top: 2px; } '+
            '.navigation__setting { border: 1px solid #aaa; padding: 4px 10px; border-radius: 4px; '+
            'background: #fff; } '+
            '.navigation__settingText { font-size: 16px; padding: 3px 0 0; } '+
            '.commentList__inner { margin: 1.5rem 0 0; } '+
            '.userList__item { padding: 6px 16px 2px; border: 1px solid #d4d5d6 !important; '+
            'background: #d8e1e5; } '+
            '.userList__item + .userList__item { padding: 6px 16px 2px; margin-top: .5rem; } '+
            '.userList__item.is-open { padding: 12px 16px; margin: 1.5rem 0; } '+
            '#ucsMainLeft .userList__title { font-size: 16px; margin: 0; } '+
            '#ucsMainLeft .userList__titleCaption { font-size: 14px; font-weight: normal; '+
            'min-width: 7.2rem; } '+
            '.userList__title + .userList__inner { margin: 0; } '+
            '.userList__item.is-open .userList__inner { margin: 6px 0; } '+
            '.commentList .userList__thumbnail { width: 29px; height: 29px; border-radius: 4px; } '+
            '.userList__nameLink { vertical-align: -2px; color: #000; } '+
            '.userList__menu { margin: 2px 1rem 0 0; padding: 2px; border: 1px solid #aaa; '+
            'border-radius: 4px; background: #fff; } '+
            '.userList__menu svg { width: 20px; height: 20px; } '+
            '.userList__text { font-size: 1rem; margin: 0.3rem 1rem 0; padding: .5em 16px; '+
            'border: 1px solid #aaa; border-radius: 4px; background: #fefefe; '+
            'min-height: 2.7rem; height: 2.7rem; overflow-y: scroll; resize: vertical; } '+
            '.userList__information { top: 34px; font-size: 16px; margin: 0.7rem 1rem 0; '+
            'color: #000; background: #d8e1e5; } '+
            '.userList__buttons { top: 31px; right: 65px; margin: -1.5rem 2rem 0; } '+
            '.userList__buttonsItem { max-width: 132px; } '+
            '.userList__buttonsItem.is-neutral { color: #757575; border: 1px solid #999; } '+
            '.c-buttonContained.userList__buttonsItem.js-comment-delete { '+
            'padding: 1px 6px 0; margin: 0 0 0 50px !important; order: 1; } '+
            '.c-buttonContained.userList__buttonsItem.js-comment-delete:hover { '+
            'opacity: 1; color: #fff; background: red; border-color: #f44336; } '+
            '[data-section-id="comment_delete"] { color: red; background: #fff; '+
            'border-color: red; }'+
            '[data-section-id="comment_delete"]:hover { opacity: 1; color: #fff; '+
            'background: red; border-color: #f44336; } '+
            '[data-section-id="comment_delete"]:focus { '+
            'box-shadow: 0 0 0 2px #fff, 0 0 0 4px red; } '+
            '.c-buttonContained { font: bold 16px/25px Meiryo; padding: 1px 16px 0; '+
            'min-width: unset; width: auto; min-height: unset; height: 26px; border-radius: 4px; '+
            'border: 1px solid #eee; background: linear-gradient(#2196f3 0%, #1976D2 70%); } '+
            '.c-buttonContained:not([disabled]):hover { '+
            'background: linear-gradient(#1976D2 0%, #2196f3 100%); } '+
            '[data-section-id=\"comment_approve\"] { '+
            'background: linear-gradient(#b0bec5 0%, #607d8b 70%); } '+
            '.commentReply { margin: -1.6rem 1rem 0; } '+
            '.commentReply__header { margin-bottom: -5px; } '+
            '.commentReply__headerLabel { margin-left: 180px; color: #000; '+
            'text-shadow: 0 0 #000; } '+
            '.commentReply__headerCancel { height: 26px; width: 26px; margin-bottom: 4px; '+
            'border: 1px solid #aaa; border-radius: 4px; background: #fff; } '+
            '.commentReply__headerCancel::after { content: \"✖\"; display: block; '+
            'font: bold 18px/27px Meiryo; color: #888; } '+
            '.commentList .formGroup__textarea { font: normal 16px Meiryo; resize: vertical; '+
            'background: #fefefe; overflow-y: scroll; } '+
            '.commentList .formGroup__textarea:focus { box-shadow: none; '+
            'border-color: #2196f3; background: #fefefe; } '+
            '.c-formTextarea { border-radius: 4px; } '+
            '.c-formTextarea:focus { outline: none; } '+
            '.commentList .sendButton { width: 160px; margin: -1.1rem auto 0; } '+
            '.pagination { margin: 2rem 0 0; } '+
            '.pagination__link { background: #fff; } '+
            '.commentModalOverlay { background: none; } '+
            '.commentModal, .commentFilterModalMiddle { '+
            'box-shadow: 0 40px 100px 0 #00000050; } '+
            '.commentModalHeader__description { font-size: 16px; color: #000; } '+
            '.commentFilterModalMiddle { display: table; height: auto; width: 300px; '+
            'margin: -270px 0 0 -150px; padding: 2.5rem 0 .5rem; border-radius: 6px; } '+
            '.commentFilterModal__title { position: absolute; top: 15px; width: 150px; } '+
            '.commentFilterModal__body { display: flex; flex-direction: row; overflow-y: auto; '+
            'max-height: unset; height: auto; margin: 0; padding: 0.5rem 16px; } '+
            '.commentFilterModal__body .is-hidden { display: block !important; } '+
            '.filterList.js-filter-list-year { width: 110px; margin-right: 20px; '+
            'background: #f8fafa; } '+
            '.filterList.js-filter-list-month { width: 180px; } '+
            '.filterList, .filterList__item { border: none !important; } '+
            '.filterList__button, .filterList__link { font-size: 1rem; padding: 8px 0 6px 1rem; } '+
            '.filterList__arrow { right: 10px; } '+
            '.filterList__description.js-filter-no-entry { width: 0; visibility: hidden; } '+
            '.filterList__item.is-checked:after { opacity: 0; } '+
            '.userList__tooltip { right: 30px; border-radius: 6px; } '+
            '.userList__tooltipItem { padding: 10px 10px; } '+
            '.commentModal { border-radius: 6px; overflow: hidden; } '+
            '.filterList__button:hover, .filterList__link:hover, .filterList__link:visited, '+
            '.userList__tooltipItem:hover { color: #000; background: #e2eef0; } '+
            '.floatingNotification { font: bold 16px Meiryo; top: 60px; bottom: unset; '+
            'margin: 0 0 0 -180px; padding: 8px 20px 6px; background: #2196f3; '+
            'box-shadow: 0 10px 20px #0000003b; z-index: 1; } '+
            '#subContentsArea { margin-bottom: 6rem; } '+
            '.commentSettingsList__link, .commentSettingsList__link:visited { '+
            'padding: 0 2rem; color: #000; text-shadow: 0 0 1px #00000050; } '+
            '.commentSettingsList__link:hover { background: #e2eef0; } '+
            '#ucsMainRight { display: none; } '+
            '.userList__text::-webkit-scrollbar, '+
            '.commentList .formGroup__textarea::-webkit-scrollbar { width: 16px; } '+
            '.userList__text::-webkit-scrollbar-corner, '+
            '.commentList .formGroup__textarea::-webkit-scrollbar-corner { '+
            'background: #00aaffd6; } '+
            '.userList__text::-webkit-scrollbar-thumb, '+
            '.commentList .formGroup__textarea::-webkit-scrollbar-thumb { '+
            'background: #ccc; border: 2px solid #eee; } '+
            '.userList__text::-webkit-scrollbar-track, '+
            '.commentList .formGroup__textarea::-webkit-scrollbar-track { '+
            'background: #eee; }</style>';

        if(!document.querySelector('#co_list_add')){
            document.documentElement.insertAdjacentHTML('beforeend', style); }

    } // page_design()



    window.addEventListener('DOMContentLoaded', function(){

        set_items();
        set_mselector();
        set_commoverlay();
        list_mode();
        mode_set();
        color_toss_text();
        color_toss();


        function set_items(){
            let items=document.querySelectorAll('.userList__item');
            for(let k=0; k<items.length; k++){
                items[k].setAttribute('tabindex', '0');
                let information=items[k].querySelector('.userList__information');
                let buttons=items[k].querySelector('.userList__buttons');
                set_view(buttons);
                information.classList.add('item_close');
                buttons.classList.add('item_close'); }

            function set_view(elem){
                let view=document.createElement('button');
                view.setAttribute('type', 'button');
                view.setAttribute('class', 'co_view');
                view.textContent='▼';
                if(!elem.querySelector('.co_view')){
                    elem.appendChild(view); }}}



        function set_mselector(){
            let nav=document.querySelector('.navigation');
            let description=document.querySelector('.navigation__description');
            let mold=document.createElement('button');
            mold.setAttribute('type', 'button');
            mold.setAttribute('id', 'mold');
            mold.textContent='◁';

            if(!document.querySelector('#mold') && description){
                nav.insertBefore(mold, description); }

            let mnew=document.createElement('button');
            mnew.setAttribute('type', 'button');
            mnew.setAttribute('id', 'mnew');
            mnew.textContent='▷';

            if(!document.querySelector('#new') && description){
                nav.insertBefore(mnew, description.nextSibling); }}



        function set_commoverlay(){
            let commentlist=document.querySelector('.commentList');
            let c_overlay=document.createElement('div');
            c_overlay.setAttribute('id', 'c_overlay');
            if(!commentlist.querySelector('#c_overlay')){
                commentlist.appendChild(c_overlay); }}



        function list_mode(){
            let tab_item=document.querySelectorAll('.tabs .tabs__item');
            if(tab_item[0] && tab_item[0].classList.contains('is-active')){ // 公開済み画面
                let approved=get_cookie('approved');

                if(approved!=0){ // approved:　1:制限表示　2:全文表示
                    let items=document.querySelectorAll('.userList__item');
                    for(let k=0; k<items.length; k++){
                        let view_button=items[k].querySelector('.co_view');
                        let text=items[k].querySelector('.userList__text');
                        text.style.display='block';
                        height_g(text, approved);
                        view_button.textContent='▲'; }}
                document.cookie='approved='+approved+'; Max-Age=2592000'; }


            if(tab_item[1] && tab_item[1].classList.contains('is-active')){ // 承認待ち画面
                let pending=get_cookie('pending');
                if(pending!=0){ // pending:　1:制限表示　2:全文表示
                    let items=document.querySelectorAll('.userList__item');
                    for(let k=0; k<items.length; k++){
                        let view_button=items[k].querySelector('.co_view');
                        let text=items[k].querySelector('.userList__text');
                        text.style.display='block';
                        height_g(text, pending);
                        view_button.textContent='▲'; }}
                document.cookie='pending='+pending+'; Max-Age=2592000';

                let items=document.querySelectorAll('.userList__item');
                for(let k=0; k<items.length; k++){
                    let menu_button=items[k].querySelector('.userList__menu');
                    menu_button.classList.add('co_menu'); }}

        } // list_mode()



        function mode_set(){ // マーク保持時間・動作mode等をここで設定 🟩
            let save=get_cookie('save_time'); // マーク保持時間
            if(save==0){
                save_t=3600; }
            else if(save==1){
                save_t=21600; }
            else if(save==2){
                save_t=0; }
            document.cookie='save_time='+save+'; Max-Age=2592000';

            mode_key=get_cookie('mode_key'); // マークリセット仕様
            document.cookie='mode_key='+mode_key+'; Max-Age=2592000';

            emode_key=get_cookie('emode_key'); // 編集画面暗転表示
            document.cookie='emode_key='+emode_key+'; Max-Age=2592000'; }



        function color_toss_text(){
            let text_color=get_cookie('item_text_color'); // リストの文字色反転
            if(text_color==1){
                text_color=1; }
            else{
                text_color=0; }
            document.cookie='item_text_color='+text_color+'; Max-Age=2592000'; }



        function color_toss(){
            let item_color_set=get_cookie('item_color_set'); // リストの枠色
            if(item_color_set==0){
                item_color_set='#d8e1e5'; }
            document.cookie='item_color_set='+item_color_set+'; Max-Age=2592000'; }

    }); // window.addEventListener



    window.addEventListener('load', function(){

        open_read();
        open_edit();
        close();
        text_focus();
        menu_read();
        memo();
        read_memo();
        memo_app();
        read_memo_app();
        month_select();


        function open_read(){
            let items=document.querySelectorAll('.userList__item');
            for(let k=0; k<items.length; k++){
                let view_button=items[k].querySelector('.co_view');
                if(view_button){
                    view_button.addEventListener('click', function(){
                        toggle(items[k], view_button);
                        app_reset(items[k], 0); }); }} // 🟩

            function toggle(item, sw){
                let open_limit;
                let tab_item=document.querySelectorAll('.tabs .tabs__item');
                if(tab_item[0] && tab_item[0].classList.contains('is-active')){ // 公開済み画面
                    open_limit=get_cookie('approved'); }
                else if(tab_item[1] && tab_item[1].classList.contains('is-active')){ // 承認待ち画面
                    open_limit=get_cookie('pending'); }

                let text=item.querySelector('.userList__text');
                if(sw.textContent=='▼'){
                    text.style.display='block';
                    sw.textContent='▲';
                    height_g(text, open_limit); }
                else{
                    text.style.display='none';
                    sw.textContent='▼';
                    item.focus(); }}

        } // open_read()



        function menu_read(){
            let items=document.querySelectorAll('.userList__item');
            for(let k=0; k<items.length; k++){
                let menu_button=items[k].querySelector('.userList__menu');
                menu_button.addEventListener('click', function(event){
                    if(event.ctrlKey){
                        menu_button.click();
                        app_reset(items[k], 1); }
                    else{
                        app_reset(items[k], 0); }}); }} // 🟩



        function open_edit(){
            let items=document.querySelectorAll('.userList__item');
            for(let k=0; k<items.length; k++){
                let reply_button=items[k].querySelector('.js-comment-reply-button');
                if(reply_button){
                    reply_button.addEventListener('click', function(){
                        let text=items[k].querySelector('.userList__text');
                        let information=items[k].querySelector('.userList__information');
                        let buttons=items[k].querySelector('.userList__buttons');

                        text.style.display='block';
                        information.classList.remove('item_close');
                        buttons.classList.remove('item_close');
                        height_g(text, 1);
                        app_reset(items[k], 0); // 🟩

                        items[k].scrollIntoView({block: "center"});
                        items[k].setAttribute('tabindex', '');
                        edit_overlay(items[k], 0);

                    }); }}} // open_edit()



        function close(){
            let items=document.querySelectorAll('.userList__item');
            for(let k=0; k<items.length; k++){
                let reply_cancel=items[k].querySelector('.js-comment-reply-cancel');
                if(reply_cancel){
                    reply_cancel.addEventListener('click', function(){
                        let text=items[k].querySelector('.userList__text');
                        let information=items[k].querySelector('.userList__information');
                        let buttons=items[k].querySelector('.userList__buttons');
                        text.style.display='none';
                        information.classList.add('item_close');
                        buttons.classList.add('item_close');
                        let view_button=items[k].querySelector('.co_view');
                        if(view_button.textContent=='▲'){
                            view_button.textContent='▼'; }
                        items[k].setAttribute('tabindex', '0');
                        items[k].focus();
                        edit_overlay(items[k], 1);

                    }); }}} // close()



        function text_focus(){
            let items=document.querySelectorAll('.userList__item');
            for(let k=0; k<items.length; k++){
                let text=items[k].querySelector('.userList__text');
                let resizeObserver=new ResizeObserver(recover_scroll);
                resizeObserver.observe(text);

                function recover_scroll(){
                    let textarea=items[k].querySelector('.formGroup__textarea');
                    if(textarea){
                        textarea.blur(); }}}}



        function edit_overlay(elem, open_close){
            let c_overlay=document.querySelector('#c_overlay');
            if(emode_key==1){
                if(open_close==0){
                    elem.classList.add('efmode');
                    c_overlay.style.display='block';
                    items_blur(6);
                    lock(0); }
                if(open_close==1){
                    elem.classList.remove('efmode');
                    c_overlay.style.display='none';
                    items_blur(0);
                    lock(1); }}
            if(emode_key==2){
                if(open_close==0){
                    elem.classList.add('efmode_w');
                    c_overlay.style.display='block';
                    c_overlay.style.background='rgb(246, 252, 255, .7)';
                    items_blur(6);
                    lock(0); }
                if(open_close==1){
                    elem.classList.remove('efmode_w');
                    c_overlay.style.display='none';
                    items_blur(0);
                    lock(1); }}

            function lock(n){
                let w_html=document.querySelector('html');
                let backTop=document.querySelector('#backTop');
                let globalH=document.querySelector('#globalHeader');
                let ucsH=document.querySelector('#ucsHeader');
                let sidem=document.querySelector('.l-ucs-sidemenu-area');
                if(n==0){
                    w_html.style.overflowY='hidden';
                    backTop.style.visibility='hidden';
                    globalH.style.visibility='hidden';
                    ucsH.style.visibility='hidden';
                    sidem.style.visibility='hidden'; }
                if(n==1){
                    w_html.style.overflowY='scroll';
                    backTop.style.visibility='visible';
                    globalH.style.visibility='visible';
                    ucsH.style.visibility='visible';
                    sidem.style.visibility='visible'; }}

            function items_blur(n){
                let itemsn=document.querySelectorAll(
                    '.commentList>*:nth-child(-n+3), .userList__item:not(.is-open)');
                for(let k=0; k<itemsn.length; k++){
                    itemsn[k].style.filter='blur('+n+'px)'; }
                let pagin=document.querySelector('.pagination');
                pagin.style.filter='blur('+n+'px)'; }}



        function memo(){
            let items=document.querySelectorAll('.userList__item');
            for(let k=0; k<items.length; k++){
                let sendbutton=items[k].querySelector('.commentList .sendButton');
                if(sendbutton){
                    sendbutton.addEventListener('mousedown', function(event){
                        let textarea=items[k].querySelector('#form-reply');
                        textarea.value=textarea.value.trim(); // 文末の空白行を削除

                        let comm_id=sendbutton.getAttribute('data-comment-id');
                        document.cookie='comm_id='+comm_id+'; Max-Age=40';
                        app_reset(items[k], 1); // 🟩
                    }); }}}



        function read_memo(){
            let comm_id=get_cookie('comm_id');
            let items=document.querySelectorAll('.userList__item');
            for(let k=0; k<items.length; k++){
                let sendbutton=items[k].querySelector('.commentList .sendButton');
                if(sendbutton){
                    let id=sendbutton.getAttribute('data-comment-id');
                    if(id==comm_id){
                        items[k].focus(); }}}}



        function memo_app(){
            let app_button=document.querySelectorAll('[data-section-id="comment_approve"]');
            for(let k=0; k<app_button.length; k++){
                app_button[k].addEventListener('mousedown', function(){
                    let comm_id=app_button[k].getAttribute('data-comment-id');
                    let approve_id=get_cookie('new_comm_id');
                    cookie_write(approve_id, comm_id); }); }

            function cookie_write(value0, value1){
                if(value0==0){
                    document.cookie='new_comm_id='+value1+'; Max-Age='+save_t; }
                else{
                    let arr=value0.split('%');
                    arr.push(value1);
                    let approve_id_n=arr.join('%');
                    document.cookie='new_comm_id='+approve_id_n+'; Max-Age='+save_t; }}}



        function read_memo_app(){
            let approve_id=get_cookie('new_comm_id');
            let items=document.querySelectorAll('.userList__item');
            for(let k=0; k<items.length; k++){
                let sendbutton=items[k].querySelector('.commentList .sendButton');
                if(sendbutton && approve_id!=0){
                    let id=sendbutton.getAttribute('data-comment-id');
                    if(approve_id.indexOf(id)!=-1){
                        let view_button=items[k].querySelector('.userList__menu');
                        view_button.classList.add('co_menu'); }}}}



        function app_reset(item, mode){ // 🟩
            if(mode==mode_key){
                let approve_id=get_cookie('new_comm_id');
                let menu_button=item.querySelector('.userList__menu');
                let sendbutton=item.querySelector('.commentList .sendButton');
                if(sendbutton && approve_id!=0){
                    menu_button.classList.remove('co_menu');
                    let id=sendbutton.getAttribute('data-comment-id');
                    let arr=approve_id.split('%');
                    let arr_d=arr.filter(function(value){
                        return value!=id; });
                    let approve_id_d=arr_d.join('%');
                    document.cookie='new_comm_id='+approve_id_d+'; Max-Age='+save_t; }}}



        function month_select(){
            let mold=document.querySelector('#mold');
            let mnew=document.querySelector('#mnew');
            let description=document.querySelector('.navigation__description');
            let now=description.textContent.replace(/[^0-9]/g, '');
            let now_y=Number(now.slice(0, 4));
            let now_m=Number(now.slice(4, 6));
            let y_list_button=
                document.querySelector('.js-filter-list-year .filterList__item:last-child button');

            let start_y=2004; // 取得できなかった場合のデフォルト値
            if(y_list_button){
                start_y=Number(y_list_button.textContent.replace(/[^0-9]/g, '')); }
            if(now_y==start_y && now_m==1){
                mold.style.opacity='0.2';
                mold.style.pointerEvents='none'; }
            else{
                mold.style.opacity='1';
                mold.style.pointerEvents='auto'; }

            mold.onclick=function(){
                let back;
                if(now_m>1){
                    back=now_y*100+now_m-1; }
                else{
                    back=(now_y-1)*100+12; }
                location.href='https://blog.ameba.jp/ucs/comment/commentlist.do?'+
                    'comment_date='+back; }

            let today=new Date();
            let n_today=(today.getFullYear())*100+today.getMonth()+1;
            if(now_y*100+now_m==n_today){
                mnew.style.opacity='0.2';
                mnew.style.pointerEvents='none'; }
            else{
                mnew.style.opacity='1';
                mnew.style.pointerEvents='auto'; }

            mnew.onclick=function(){
                let next;
                if(now_m<12){
                    next=now_y*100+now_m+1; }
                else{
                    next=(now_y+1)*100+1; }
                location.href='https://blog.ameba.jp/ucs/comment/commentlist.do?'+
                    'comment_date='+next; }
        } // month_select()

    }); // window.addEventListener



    function height_g(elem, limit){
        let s_height=elem.scrollHeight;
        if(s_height<300){
            elem.style.height='auto'; }
        else{
            if(limit!=2){
                elem.style.height='300px'; }
            else if(limit==2){
                elem.style.height='auto'; }}}

} // コメント管理画面で動作



function get_cookie(name){
    let cookie_req=document.cookie.split('; ').find(row=>row.startsWith(name));
    if(cookie_req){
        if(cookie_req.split('=')[1]==null){
            return 0; }
        else{
            return cookie_req.split('=')[1]; }}
    if(!cookie_req){
        return 0; }}




if(path.match(/commentsettings/)){ // コメント設定画面で動作

    window.addEventListener('load', function(){

        page_design();

        function page_design(){
            let style=
                '<style id="co_list_add">'+
                '#ucsMain { display: flex; flex-direction: column; background: #fff; } '+
                '#ucsMainLeft { position: relative; width: 740px; margin: 15px auto 0; } '+
                '#ucsMainRight { display: none; }</style>';

            if(!document.querySelector('#co_list_add')){
                document.documentElement.insertAdjacentHTML('beforeend', style); }}



        let SettingsList=document.querySelector('.commentSettingsList');
        if(SettingsList){

            let list1=document.createElement('li');
            list1.setAttribute('id', 'list1');
            list1.classList.add('commentSettingsList__item');
            list1.innerHTML=
                '<div class="commentSettingsList__link" style="justify-content: normal">'+
                '公開済みリスト 初期表示のコメント内容：'+
                '<input name="appr" type="radio" id="approved0">非表示'+
                '<input name="appr" type="radio" id="approved1">制限表示'+
                '<input name="appr" type="radio" id="approved2">全文表示</div>';
            if(!SettingsList.querySelector('#list1')){
                SettingsList.appendChild(list1); }


            let list2=document.createElement('li');
            list2.setAttribute('id', 'list2');
            list2.classList.add('commentSettingsList__item');
            list2.innerHTML=
                '<div class="commentSettingsList__link"  style="justify-content: normal">'+
                '承認待ちリスト 初期表示のコメント内容：'+
                '<input name="pend" type="radio" id="pending0">非表示'+
                '<input name="pend" type="radio" id="pending1">制限表示'+
                '<input name="pend" type="radio" id="pending2">全文表示</div>';
            if(!SettingsList.querySelector('#list2')){
                SettingsList.appendChild(list2); }


            let list3=document.createElement('li');
            list3.setAttribute('id', 'list3');
            list3.classList.add('commentSettingsList__item');
            list3.innerHTML=
                '<div class="commentSettingsList__link"  style="justify-content: normal">'+
                '承認したコメントの緑マーク　保持時間：'+
                '<input name="save" type="radio" id="save0">1時間'+
                '<input name="save" type="radio" id="save1">6時間'+
                '<input name="save" type="radio" id="save2">マーク非表示</div>';
            if(!SettingsList.querySelector('#list3')){
                SettingsList.appendChild(list3); }


            let list4=document.createElement('li');
            list4.setAttribute('id', 'list4');
            list4.classList.add('commentSettingsList__item');
            list4.innerHTML=
                '<div class="commentSettingsList__link"  style="justify-content: normal">'+
                '承認したコメントの緑マーク　リセット仕様：'+
                '<input name="mode" type="radio" id="mode0">コメント参照時'+
                '<input name="mode" type="radio" id="mode1">返信の送信時</div>';
            if(!SettingsList.querySelector('#list4')){
                SettingsList.appendChild(list4); }


            let list5=document.createElement('li');
            list5.setAttribute('id', 'list5');
            list5.classList.add('commentSettingsList__item');
            list5.innerHTML=
                '<div class="commentSettingsList__link"  style="justify-content: normal">'+
                '返信コメント編集時　編集画面の背景表示：'+
                '<input name="emode" type="radio" id="emode0">なし'+
                '<input name="emode" type="radio" id="emode1">暗転'+
                '<input name="emode" type="radio" id="emode2">ホワイトアウト</div>';
            if(!SettingsList.querySelector('#list5')){
                SettingsList.appendChild(list5); }


            let list6=document.createElement('li');
            list6.setAttribute('id', 'list6');
            list6.classList.add('commentSettingsList__item');
            list6.innerHTML=
                '<div class="commentSettingsList__link"  style="justify-content: normal">'+
                'コメントリスト枠の文字色：'+
                '<input name="tx_color" type="radio" id="tx_color0">黒'+
                '<input name="tx_color" type="radio" id="tx_color1">白（枠背景色が暗い場合）</div>';
            if(!SettingsList.querySelector('#list6')){
                SettingsList.appendChild(list6); }


            let list7=document.createElement('li');
            list7.setAttribute('id', 'list7');
            list7.classList.add('commentSettingsList__item');

            let inner=
                '<div class="commentSettingsList__link"  style="justify-content: normal">'+
                'コメントリスト枠の配色：'+
                '<input type="color" id="item_color">'+
                '<span id="co_down">▼</span><span id="co_up">▲</span>'+
                '<span id="co_test">Comment C-O <b>枠色サンプル</b>　'+
                '<span id="co_ticon">…</span></span>'+
                '</div>'+
                '<style>'+
                '.commentSettingsList input { margin-left: 20px; margin-right: 6px; } '+
                '#list7 { user-select: none; } '+
                '#list7>div:hover { background: #fafafa !important; } '+
                '#item_color { height: 28px; width: 24px; margin-top: -3px; '+
                'border: none; background-color: transparent; cursor: pointer; } '+
                '#co_down, #co_up { display: inline-block; line-height: 18px; height: 16px; '+
                'padding: 1px; margin: -3px -5px 0 8px; '+
                'color: #999; border: 1px solid #aaa; border-radius: 2px; cursor: pointer; } '+
                '#co_down:hover, #co_up:hover { color: #000; } '+
                '#co_test { color: #333; padding: 4px 15px 2px; border: 1px solid #d4d5d6; '+
                'margin-left: 50px; } '+
                '#co_ticon { display: inline-block; font-weight: bold; padding: 0 2px; '+
                'height: 20px; border: 1px solid #aaa; border-radius: 4px; '+
                'color: #757575; background: #fff; } ';

            if(ua==1){
                inner +='#item_color { height: 20px; width: 20px; } '; }

            inner +='</style>';

            list7.innerHTML=inner;
            if(!SettingsList.querySelector('#list7')){
                SettingsList.appendChild(list7); }



            set_radio();

            function set_radio(){
                let approved=get_cookie('approved');
                let approved0=document.querySelector('#approved0');
                let approved1=document.querySelector('#approved1');
                let approved2=document.querySelector('#approved2');
                if(approved==0){ // approved: 0:コメント非表示 1:制限表示 2:全文表示
                    approved0.checked=true; }
                else if(approved==1){
                    approved1.checked=true; }
                else if(approved==2){
                    approved2.checked=true; }
                document.cookie='approved='+approved+'; Max-Age=2592000';

                let pending=get_cookie('pending');
                let pending0=document.querySelector('#pending0');
                let pending1=document.querySelector('#pending1');
                let pending2=document.querySelector('#pending2');
                if(pending==0){ // pending: 0:コメント非表示 1:制限表示 2:全文表示
                    pending0.checked=true; }
                else if(pending==1){
                    pending1.checked=true; }
                else if(pending==2){
                    pending2.checked=true; }
                document.cookie='pending='+pending+'; Max-Age=2592000';

                let save=get_cookie('save_time'); // save: 0:1時間 1:6時間 2:マーク非表示
                let save0=document.querySelector('#save0');
                let save1=document.querySelector('#save1');
                let save2=document.querySelector('#save2');
                if(save==0){
                    save0.checked=true; }
                else if(save==1){
                    save1.checked=true; }
                else if(save==2){
                    save2.checked=true; }
                document.cookie='save_time='+save+'; Max-Age=2592000';

                let mode=get_cookie('mode_key'); // mode: 0:コメント参照時 1:返信の送信時
                let mode0=document.querySelector('#mode0');
                let mode1=document.querySelector('#mode1');
                if(mode==0){
                    mode0.checked=true; }
                else if(mode==1){
                    mode1.checked=true; }
                document.cookie='mode_key='+mode+'; Max-Age=2592000';

                let emode=get_cookie('emode_key'); // emode: 0:なし 1:暗転 2:ホワイトアウト
                let emode0=document.querySelector('#emode0');
                let emode1=document.querySelector('#emode1');
                let emode2=document.querySelector('#emode2');
                if(emode==0){
                    emode0.checked=true; }
                else if(emode==1){
                    emode1.checked=true; }
                else if(emode==2){
                    emode2.checked=true; }
                document.cookie='emode_key='+emode+'; Max-Age=2592000';

                let text_color=get_cookie('item_text_color'); // text_color: 0:黒 1:白
                let tx_color0=document.querySelector('#tx_color0');
                let tx_color1=document.querySelector('#tx_color1');
                if(text_color==0){
                    tx_color0.checked=true; }
                else if(text_color==1){
                    tx_color1.checked=true; }
                document.cookie='item_text_color='+text_color+'; Max-Age=2592000';

            } // set_radio()



            radio_select();

            function radio_select(){
                let approved0=document.querySelector('#approved0');
                approved0.onchange=function(){
                    document.cookie='approved=0; Max-Age=2592000'; }

                let approved1=document.querySelector('#approved1');
                approved1.onchange=function(){
                    document.cookie='approved=1; Max-Age=2592000'; }

                let approved2=document.querySelector('#approved2');
                approved2.onchange=function(){
                    document.cookie='approved=2; Max-Age=2592000'; }

                let pending0=document.querySelector('#pending0');
                pending0.onchange=function(){
                    document.cookie='pending=0; Max-Age=2592000'; }

                let pending1=document.querySelector('#pending1');
                pending1.onchange=function(){
                    document.cookie='pending=1; Max-Age=2592000'; }

                let pending2=document.querySelector('#pending2');
                pending2.onchange=function(){
                    document.cookie='pending=2; Max-Age=2592000'; }

                let save0=document.querySelector('#save0');
                save0.onchange=function(){
                    document.cookie='save_time=0; Max-Age=2592000'; }

                let save1=document.querySelector('#save1');
                save1.onchange=function(){
                    document.cookie='save_time=1; Max-Age=2592000'; }

                let save2=document.querySelector('#save2');
                save2.onchange=function(){
                    document.cookie='save_time=2; Max-Age=2592000'; }

                let mode0=document.querySelector('#mode0');
                mode0.onchange=function(){
                    document.cookie='mode_key=0; Max-Age=2592000'; }

                let mode1=document.querySelector('#mode1');
                mode1.onchange=function(){
                    document.cookie='mode_key=1; Max-Age=2592000'; }

                let emode0=document.querySelector('#emode0');
                emode0.onchange=function(){
                    document.cookie='emode_key=0; Max-Age=2592000'; }

                let emode1=document.querySelector('#emode1');
                emode1.onchange=function(){
                    document.cookie='emode_key=1; Max-Age=2592000'; }

                let emode2=document.querySelector('#emode2');
                emode2.onchange=function(){
                    document.cookie='emode_key=2; Max-Age=2592000'; }

                let tx_color0=document.querySelector('#tx_color0');
                tx_color0.onchange=function(){
                    let co_test=document.querySelector('#co_test');
                    if(co_test){
                        co_test.style.color='#333'; }
                    document.cookie='item_text_color=0; Max-Age=2592000'; }

                let tx_color1=document.querySelector('#tx_color1');
                tx_color1.onchange=function(){
                    let co_test=document.querySelector('#co_test');
                    if(co_test){
                        co_test.style.color='#fff'; }
                    document.cookie='item_text_color=1; Max-Age=2592000'; }

            } // radio_select()



            list_color();

            function list_color(){

                let text_color=get_cookie('item_text_color'); // text_color: 0:黒 1:白
                let co_test=document.querySelector('#co_test');
                if(co_test && text_color){
                    if(text_color==0){
                        co_test.style.color='#333'; }
                    else{
                        co_test.style.color='#fff'; }}


                let item_color_set=get_cookie('item_color_set'); // リストの枠色
                if(item_color_set==0){
                    item_color_set='#d8e1e5'; }

                let item_color=document.querySelector('#item_color');
                item_color.value=item_color_set;
                test_disp(item_color_set);
                document.cookie='item_color_set='+item_color.value+'; Max-Age=2592000';

                item_color.onchange=function(){
                    test_disp(item_color.value);
                    document.cookie='item_color_set='+item_color.value+'; Max-Age=2592000'; }

                let co_down=document.querySelector('#co_down');
                let co_up=document.querySelector('#co_up');

                co_down.onclick=function(){
                    item_color.value=hex_darken(item_color.value);
                    test_disp(item_color.value);
                    document.cookie='item_color_set='+item_color.value+'; Max-Age=2592000'; }

                co_up.onclick=function(){
                    item_color.value=hex_lighten(item_color.value);
                    test_disp(item_color.value);
                    document.cookie='item_color_set='+item_color.value+'; Max-Age=2592000'; }

            } // list_color()


            function hex_darken(hex){ // 明度を段階的に下げる
                if(hex.slice(0, 1)=='#'){
                    hex=hex.slice(1); }
                if(hex.length==3){
                    hex=hex.slice(0,1) + hex.slice(0,1) + hex.slice(1,2) + hex.slice(1,2) +
                        hex.slice(2,3) + hex.slice(2,3); }
                let R=parseInt(hex.slice(0, 2), 16);
                let G=parseInt(hex.slice(2, 4), 16);
                let B=parseInt(hex.slice(4, 6), 16);
                return unequal_color(R, G, B, 0.95); } // 等倍による明度変更

            function unequal_color(R, G, B, A){ // RGBは整数 Aは小数が必須 ➔ 等価 6桁hexに変換
                return '#'
                    + tohex(downColor(R, A))
                    + tohex(downColor(G, A))
                    + tohex(downColor(B, A));
                function downColor(value, A){
                    let color_value=value*A;
                    return Math.floor(color_value); }
                function tohex(value){
                    return ('0'+ value.toString(16)).slice(-2); }}


            function hex_lighten(hex){ // 明度を段階的に上げる
                if(hex.slice(0, 1)=='#'){
                    hex=hex.slice(1); }
                if(hex.length==3){
                    hex=hex.slice(0,1) + hex.slice(0,1) + hex.slice(1,2) + hex.slice(1,2) +
                        hex.slice(2,3) + hex.slice(2,3); }
                // 透過度 0.9 とした色値に変更
                let R=parseInt(hex.slice(0, 2), 16);
                let G=parseInt(hex.slice(2, 4), 16);
                let B=parseInt(hex.slice(4, 6), 16);
                return equal_color(R, G, B, 0.9); } // 非透過色値に変更

            function equal_color(R, G, B, A){ // RGBは整数 Aは小数が必須 ➔ 等価 6桁hexに変換
                return '#'
                    + tohex(upColor(R, A))
                    + tohex(upColor(G, A))
                    + tohex(upColor(B, A));
                function upColor(value, A){
                    let color_value=value*A + 255*(1 - A);
                    return Math.floor(color_value); }
                function tohex(value){
                    return ('0'+ value.toString(16)).slice(-2); }}


            function test_disp(color){
                let test=document.querySelector('#co_test');
                if(test){
                    test.style.background=color; }}



            help();

            function help(){
                let cmm_set=document.querySelector('.commentSettings');
                if(cmm_set){
                    let help_description=
                        '<p id="CO_help" style="font-size: .875rem; padding: 20px 0;">'+
                        'Comment C-O の設定方法については '+
                        '<a href="https://ameblo.jp/personwritep/entry-12772207230.html" '+
                        'target="_blank"><b>操作マニュアル</b></a> を参照ください。</p>';

                    if(!document.querySelector('#CO_help')){
                        cmm_set.insertAdjacentHTML('beforeend', help_description); }}}

        }}); // window.addEventListener

} // コメント設定画面で動作

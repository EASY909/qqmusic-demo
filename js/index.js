let musicRender = (function () {
    let $headerBox = $(".headerBox"),
        $contentBox = $(".contentBox"),
        $footerBox = $(".footerBox"),
        $wrapper = $contentBox.find(".wrapper"),
        $lyricList = null,
        music = $("#music")[0],
        $playBtn = $headerBox.find(".playBtn"),
        $already = $footerBox.find(".already"),
        $duration = $footerBox.find(".duration"),
        $current = $footerBox.find(".current");


    //计算内容高度
    let computedContent = function computedContent() {
        let winH = document.documentElement.clientHeight,
            font = parseFloat(document.documentElement.style.fontSize);
        $contentBox.css({
            height: winH - $headerBox[0].offsetHeight - $footerBox[0].offsetHeight
                - 0.8 * font
        })
    }
    //获取歌词
    let queryLyric = function queryLyric() {
        return new Promise(resolve => {
            $.ajax({
                url: "json/lyric.json",
                dataType: "json",
                success: resolve
            });
        })
    }

    //绑定歌词

    let bindHTML = function bindHTML(lyricAry) {
        let str = ``;
        lyricAry.forEach(item => {
            let { minutes, seconds, content } = item;
            str += ` <p data-minutes="${minutes}" 
            data-seconds="${seconds}">${content}</p>`;
        })
        $wrapper.html(str);
        $lyricList = $wrapper.find("p");
    }

    //播放
    let $plan = $.Callbacks();
    let playRun = function playRun() {

        $footerBox.one("click", function () {
            music.play()
        })
        music.addEventListener("canplay", $plan.fire);
    }
    //暂停播放
    $plan.add(() => {
        $playBtn.css("display", "block").addClass("move");
        $playBtn.click(() => {
            if (music.paused) {//是否为暂停
                music.play();
                $playBtn.css("display", "block").addClass("move");
                return
            }

            music.pause();
            $playBtn.removeClass("move");
        })
    })

    //进度条
    let autoTimer = null;
    $plan.add(() => {
        let duration = music.duration;//总时间是秒

        $duration.html(computedTime(duration));
        autoTimer = setInterval(() => {

            let currentTime = music.currentTime;
            if (currentTime > duration) {
                clearInterval(autoTimer);
                $already.html(computedTime(duration));
                $current.css('width', "100%");
                music.pause();
                $playBtn.removeClass("move");
                return
            }

            $already.html(computedTime(currentTime))
            $current.css('width', currentTime / duration * 100 + "%");
            matchLyric(currentTime);
        }, 1000);
    })

    let computedTime = function computedTime(time) {
        let minutes = Math.floor(time / 60),
            seconds = Math.floor(time - minutes * 60);
        minutes < 10 ? minutes = "0" + minutes : null;
        seconds < 10 ? seconds = "0" + seconds : null;
        return `${minutes}:${seconds}`;
    }

    //歌词对应
    let translateY = 0;
    let matchLyric = function matchLyric(currentTime) {
        let [minutes, seconds] = computedTime(currentTime).split(":");
        let $cur = $lyricList.filter(`[data-minutes="${minutes}"]`).filter(`[data-seconds="${seconds}"]`)
        // let $cur = [...$lyricList].filter((item) => {


        //     let itemMinutes = item.getAttribute("data-minutes");
        //     let itemSeconds = item.getAttribute("data-seco nds");

        //     return itemMinutes === minutes && itemSeconds === seconds
        // })
        if ($cur.length === 0) return;
        if ($cur.hasClass('active')) return;
        let index = $cur.index();

        $($cur).addClass('active').siblings().removeClass("active");
        if (index >= 4) {
            let curH = $cur[0].offsetHeight;
            translateY -= curH;
            console.log(translateY);
            $wrapper.css('transform', `translateY(${translateY}px)`)
        }
    }
    return {
        init: function () {
            //计算内容高度
            computedContent();

            let promise = queryLyric();
            promise.then(res => {
                let { lyric1 = "" } = res
                lyricAry = [];
                lyric1.replace(/\[(\d+):(\d+)\.(?:\d+)\]([^\d^\[]+)/g, (...arg) => {
                    let [, minutes, seconds, content] = arg;
                    lyricAry.push({
                        minutes,
                        seconds,
                        content
                    });
                })
                return lyricAry
              
                // let { lyric = "" } = res
                // let obj = {
                //     32: " ",
                //     40: "(",
                //     41: ")",
                //     45: "-"
                // }
                // lyric = lyric.replace(/&#(\d+);/g, (...arg) => {
                //     let [item, num] = arg;
                //     item = obj[num] || item;
                //     return item;
                // })
                // return lyric
            }).then(bindHTML).then(playRun)
        }
    }
})()

musicRender.init();
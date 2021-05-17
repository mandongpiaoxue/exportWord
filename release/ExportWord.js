/**
 * exportWord - v0.1 (2021-05-17)
 * Copyright 2021 ManDongPiaoXue
*/

/**
 * @method exportWord
 * @param {Element} element 指定元素
 * @param {String} fileName 文檔名
*/
var exportWord = (element, fileName = '文檔') => {
    let static = {
        mhtml: {
            top: "Mime-Version: 1.0\nContent-Base: " + location.href + "\nContent-Type: Multipart/related; boundary=\"NEXT.ITEM-BOUNDARY\";type=\"text/html\"\n\n--NEXT.ITEM-BOUNDARY\nContent-Type: text/html; charset=\"utf-8\"\nContent-Location: " + location.href + "\n\n<!DOCTYPE html>\n<html>\n_html_</html>",
            head: "<head>\n<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">\n<style>\n_styles_\n<style>@page WordSection1{\tsize:595.3pt 841.9pt;\n\tmargin:36.0pt 36.0pt 36.0pt 36.0pt;\tmso-header-margin:42.55pt;\n\tmso-footer-margin:49.6pt;\n\tmso-paper-source:0;\n}div.WordSection1\n\t{page:WordSection1;}</style>\n</head>\n",
            body: "<body><div class=WordSection1>_body_</div></body>"
        }
    }
    let options = { maxWidth: 624 }
    // 複製並標記傳入的元素
    let markup = element.cloneNode(true)

    // 若是隱藏元素，則移出
    if (markup.hidden) markup.remove()

    // 將所有圖片進行base64編碼
    let images = Array()
    let img = markup.getElementsByTagName('img')
    for (let i = 0; i < img.length; i++) {
        // Calculate dimensions of output image
        let w = Math.min(img[i].width, options.maxWidth)
        let h = img[i].height * (w / img[i].width)
        // 創建canvas把image轉換成 data URL
        let canvas = document.createElement("canvas")
        canvas.width = w
        canvas.height = h
        // 把圖片劃入canvas
        let context = canvas.getContext('2d')
        context.drawImage(img[i], 0, 0, w, h)
        // 獲取圖片的 data URL 編碼
        let uri = canvas.toDataURL("image/png")
        img[i].width = w
        img[i].height = h
        // 將編碼的圖片存入數組
        images[i] = {
            type: uri.substring(uri.indexOf(":") + 1, uri.indexOf(";")),
            encoding: uri.substring(uri.indexOf(";") + 1, uri.indexOf(",")),
            location: img[i].src,
            data: uri.substring(uri.indexOf(",") + 1)
        }
    }

    // 把圖片數據存入mhtml文件底部
    let mhtmlBottom = "\n"
    for (let i = 0; i < images.length; i++) {
        mhtmlBottom += "--NEXT.ITEM-BOUNDARY\n"
        mhtmlBottom += "Content-Location: " + images[i].location + "\n"
        mhtmlBottom += "Content-Type: " + images[i].type + "\n"
        mhtmlBottom += "Content-Transfer-Encoding: " + images[i].encoding + "\n\n"
        mhtmlBottom += images[i].data + "\n\n"
    }
    mhtmlBottom += "--NEXT.ITEM-BOUNDARY--"

    // 加載樣式
    let styles = "body{color:#000;font-size:20px;}h1{text-align:center;}.sp {display: block;width: 30%; float:left;}.tit {display: block;margin: 20px 34% 0px;}";

    // 文件聚合
    let fileContent = static.mhtml.top.replace("_html_", static.mhtml.head.replace("_styles_", styles) + static.mhtml.body.replace("_body_", markup.innerHTML)) + mhtmlBottom

    // 創建文件內容的Blob數據
    let blob = new Blob([fileContent], {
        type: "application/msword;charset=utf-8"
    });

    // 執行下載
    let url = URL.createObjectURL(blob)
    let link = document.createElement('a')
    link.setAttribute("href", url)
    link.setAttribute("download", `${fileName}.doc`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
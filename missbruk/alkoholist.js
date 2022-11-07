let checkDone = (element) => {
    return element.processed == true;
}

let getData = (root) => {
    let vol_perc_element = root.childNodes[0].childNodes.length == 2 ?
       root.childNodes[0].childNodes[1] :
       root.childNodes[0].childNodes[0] 
    
    let volume = vol_perc_element.childNodes[1].textContent;
    let percentage = vol_perc_element.childNodes[2].textContent;
    let price = root.childNodes[1].textContent;
    let flak = root.parentNode.childNodes[0].textContent;
    
    volume = volume.slice(0, -3) // milliliter
    percentage = percentage.slice(0, -2).replace(",",".") / 100 // procent
    price = price.replace(/\ |\*|:-/g,"").replace(":",".") // kr
    let isFlak = flak.includes("Öl") || flak.includes("Cider") || flak.includes("Blanddryck")

    return [
        parseFloat(volume), 
        parseFloat(percentage), 
        parseFloat(price),
        isFlak
    ]
}

let flakPrisTemplate = 
    `<div>
        <div height=\"24\" class=\"css-3qi0zm e1fve3pg0\" style="background-color: {COLOR}; float:left">
            <p color=\"green500\" class=\"css-15hgqif e1fve3pg1\" style="color: {TCOLOR}">
                APK: {APK}
            </p>
        </div>
        <div height=\"24\" class=\"css-3qi0zm e1fve3pg0\" style="background-color: {COLOR}; float:right">
            <p color=\"green500\" class=\"css-15hgqif e1fve3pg1\" style="color: {TCOLOR}">
                FLAKPRIS: {FLAKPRIS}*
            </p>
        </div>
    </div>`;

let apkTemplate = 
    `<div >
        <div height=\"24\" class=\"css-3qi0zm e1fve3pg0\" style="background-color: {COLOR}; float:left">
            <p color=\"green500\" class=\"css-15hgqif e1fve3pg1\" style="color: {TCOLOR}">
                APK: {APK}
            </p>
        </div>
    </div>`;

let apkToColor = (apk) => {
    if (apk > 2) {
        return ["#ff8a3d", "#2d2926"];
    } else if (apk > 1) {
        return ["#5caa7f", "#ffffff"];
    } else {
        return ["cdead5", "#095741"];
    }
}

let calculate = (element) => {
    [volume, percentage, price, isFlak] = getData(element);
    console.log(volume, percentage, price);
    let apk = volume * percentage / price;
    let flakPris = price * 24;
    
    let template = document.createElement('template');
    [color, tcolor] = apkToColor(apk);
    let chosenTemplate = isFlak ? flakPrisTemplate : apkTemplate;

    template.innerHTML = chosenTemplate
        .replace("{APK}", apk.toFixed(3))
        .replace("{FLAKPRIS}", (flakPris.toFixed(1).replace(".",":")+"0").replace("00","-"))
        .replaceAll("{COLOR}", color)
        .replaceAll("{TCOLOR}", tcolor);

    let apkElement = template.content.firstChild;
    element.parentNode.insertBefore(
        apkElement, 
        element.parentNode.children[2]
        );
}


let itemClassName = null;

let getItemClassName = () => {
    console.log(document.querySelector("[display=grid]").querySelector("[id^=tile]"))

    let pre = document.querySelector("[display=grid]").querySelector("[id^=tile]").childNodes[0]

    if (pre.childNodes.length == 2) {
        pre = pre.childNodes[0]
    } else {
        pre = pre.childNodes[1]
    }

    return pre.childNodes[0].childNodes[1].childNodes[2].className;
}

let sortiment = () => {
    if (itemClassName == null) {
        itemClassName = getItemClassName();
    }
    let all = document.getElementsByClassName(itemClassName) 
    for(let element of all) {
        if (!checkDone(element)) {
            console.log(element);
            calculate(element)
            element.processed = true;
        }
    }
}

let produkt = () => {

}

let runner = () => {
    let location = window.location.href.match(/produkt|sortiment/)
    if (location != null) {
        location = location[0]
    }

    switch (location) {
        case "sortiment":
            sortiment();
            break;
        case "produkt":
            produkt();
            break;
    }
}

setInterval(runner,500)

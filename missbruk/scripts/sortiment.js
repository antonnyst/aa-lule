
let checkDone = (element) => {
    return element.processed == true;
}

let getData = (root) => {
    let vol_perc_element = root.childNodes[0];
    
    let volume = vol_perc_element.childNodes[1].textContent;
    let percentage = vol_perc_element.childNodes[2].textContent;
    let price = root.childNodes[2].textContent;
    let flak = root.parentNode.childNodes[0].textContent;
    
    if (volume.includes("fl à")) {
        let split = volume.slice(0, -3).split("fl à");
        volume = parseFloat(split[0]) * parseFloat(split[1]);
    } else if(volume.includes("flaskor a")){
        let split = volume.slice(0,-3).split("flaskor a");
        volume = parseFloat(split[0]) * parseFloat(split[1]);
    } else if(volume.includes("påsar à")){
        let split = volume.slice(0,-3).split("påsar à");
        volume = parseFloat(split[0]) * parseFloat(split[1]);
    } else if(volume.includes("burkar à")){
        let split = volume.slice(0,-2).split("burkar à");
        volume = parseFloat(split[0]) * parseFloat(split[1]);
    } else {
        volume = volume.replace(" ", "");
        volume = volume.slice(0, -2) // milliliter
    }

    let pant = price.includes("*");

    percentage = percentage.slice(0, -7).replace(",",".") / 100 // procent
    price = price.replace(/\ |\*|:-/g,"").replace(":",".") // kr
    let isFlak = flak.includes("Öl") || flak.includes("Cider") || flak.includes("Blanddryck")

    let flakInfo = "no"
    if (isFlak) {
        if (pant) {
            flakInfo = "flak"
        } else {
            flakInfo = "back"
        }
    }

    return [
        parseFloat(volume), 
        parseFloat(percentage), 
        parseFloat(price),
        flakInfo
    ]
}

let style = 
    `<style>
        .apk1 {
            display: flex;
            background-color: rgb(205, 234, 213);
            margin-top: 12px;
            height: 24px;
            -moz-box-align: center;
            align-items: center;
            -moz-box-pack: center;
            justify-content: center;
            padding-left: 8px;
            padding-right: 8px;
        }
        .apk2 {
            margin: 0px;
            font-family: RobotoCondensed-Bold;
            font-size: 12px;
            line-height: 1.6;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: rgb(9, 87, 65);
        }
        #apk {
            float: left;
        }
        #flak {
            float: right;
        }
        @media only screen and (max-width: 405px) {
            #flak { 
                float: left;
            }
        }
    </style>`;

let sortimentFlakTemplate = 
    `<div>
        <div id="apk" height=\"24\" class=\"apk1\" style="background-color: {COLOR}">
            <p color=\"green500\" class=\"apk2\" style="color: {TCOLOR}">
                APK: {APK}
            </p>
        </div>
        <div id="flak" height=\"24\" class=\"apk1\" style="background-color: {COLOR}">
            <p color=\"green500\" class=\"apk2\" style="color: {TCOLOR}">
                {FLAKPRIS}
            </p>
        </div>
    </div>`;

let sortimentTemplate = 
    `<div>
        <div height=\"24\" class=\"apk1\" style="background-color: {COLOR}; float:left">
            <p color=\"green500\" class=\"apk2\" style="color: {TCOLOR}">
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
    [volume, percentage, price, flakInfo] = getData(element);
    console.log(volume, percentage, price);
    let apk = volume * percentage / price;
    
    let isFlak = flakInfo !== "no";

    [color, tcolor] = apkToColor(apk);
    let chosenTemplate = isFlak && volume < 1000? sortimentFlakTemplate : sortimentTemplate;

    let flakString = ""
    if (isFlak) {
        if (flakInfo == "flak") {
            let flakPris = (Math.round(price * 24 * 100) / 100).toFixed(2);
            flakString = "FLAKPRIS: " + flakPris.replace(".",":");
            if (flakString.endsWith("00")) {
                flakString = flakString.substring(0,flakString.length-2) + "-";
            }
            flakString += "*";
        } else{
            let flakPris = (Math.round(price * 24 * 100) / 100).toFixed(2);
            flakString = "FLAKPRIS: " + flakPris.replace(".",":");
            if (flakString.endsWith("00")) {
                flakString = flakString.substring(0,flakString.length-2) + "-";
            }
        }
    }

    chosenTemplate = chosenTemplate
        .replace("{APK}", apk.toFixed(3))
        .replace("{FLAKPRIS}", flakString)
        .replaceAll("{COLOR}", color)
        .replaceAll("{TCOLOR}", tcolor);

    let newElement = new DOMParser().parseFromString(chosenTemplate, "text/html").firstChild;

    element.parentNode.insertBefore(
        newElement, 
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

let sortimentRunner = () => {
    let location = window.location.href.match(/produkt|sortiment/)
    if (location != null && location[0] == "sortiment") {
        sortiment();
    }
}

let styleElement = new DOMParser().parseFromString(style, "text/html").firstChild;

document.head.appendChild(styleElement);

setInterval(sortimentRunner, 500)

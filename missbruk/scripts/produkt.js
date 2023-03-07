let checkDoneProduktPage = (element) => {
    if (element.doneURI == null) {
        return "never";
    } else if (element.doneURI == window.location.href) {
        return "done";
    } else {
        return "changed"
    }
}

let getProduktData = (root) => {
    console.log(root);
    let vol_perc_element = root.childNodes[3].childNodes[0];
    let volume = "";
    let percentage = "";

    if (vol_perc_element.childNodes.length == 5) {
        // Regular
        volume = vol_perc_element.childNodes[2].textContent;
        percentage = vol_perc_element.childNodes[4].textContent;
    } else {
        // Dropdown
        let volume_element = vol_perc_element.childNodes[0];
        volume = volume_element.childNodes[0].textContent;
        percentage = vol_perc_element.childNodes[1].textContent;
    }
    
    let split = volume.split(" ");
    volume = parseFloat(split[split.length-2]);
    
    let price = root.childNodes[4].childNodes[0].textContent;
    let flak = root.childNodes[0].textContent;
  
    
    let pant = root.childNodes[4].childNodes[2].childNodes.length == 2;
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

let produktFlakTemplate = 
  `<div style="padding-bottom: 10px">
      <div id="apk" height=\"24\" class=\"apk1\" style="background-color: {COLOR}; height: 40px; padding-left: 12px; padding-right: 12px">
          <p color=\"green500\" class=\"apk2\" style="color: {TCOLOR}; font-size: 18px">
              APK: {APK}
          </p>
      </div>
      <div id="flak" height=\"24\" class=\"apk1\" style="background-color: {COLOR}; height: 40px; padding-left: 12px; padding-right: 12px">
          <p color=\"green500\" class=\"apk2\" style="color: {TCOLOR}; font-size: 18px">
              {FLAKPRIS}
          </p>
      </div>
  </div>`;

let produktTemplate = 
  `<div style="padding-bottom: 10px">
      <div id="apk" height=\"24\" class=\"apk1\" style="background-color: {COLOR}; height: 40px; padding-left: 12px; padding-right: 12px">
          <p color=\"green500\" class=\"apk2\" style="color: {TCOLOR}; font-size: 18px">
              APK: {APK}
          </p>
      </div>
  </div>`;

let apkToColorPP = (apk) => {
  if (apk > 2) {
      return ["#ff8a3d", "#2d2926"];
  } else if (apk > 1) {
      return ["#5caa7f", "#ffffff"];
  } else {
      return ["cdead5", "#095741"];
  }
}

let calculateProdukt = (element) => {
  [volume, percentage, price, flakInfo] = getProduktData(element);
  console.log(volume, percentage, price);
  let apk = volume * percentage / price;
  
  let isFlak = flakInfo !== "no";

  [color, tcolor] = apkToColor(apk);
  let chosenTemplate = isFlak && volume < 1000? produktFlakTemplate : produktTemplate;

  let flakString = ""
  if (isFlak) {
      if (flakInfo == "flak") {
          let flakPris = price * 24; 
          flakString = "FLAKPRIS: " + (flakPris.toFixed(1).replace(".",":")+"0").replace("00","-") + "*";
      } else{
          let flakPris = price * 15;
          flakString = "BACKPRIS: " + (flakPris.toFixed(1).replace(".",":")+"0").replace("00","-");
      }
  }

  chosenTemplate = chosenTemplate
      .replace("{APK}", apk.toFixed(3))
      .replace("{FLAKPRIS}", flakString)
      .replaceAll("{COLOR}", color)
      .replaceAll("{TCOLOR}", tcolor);

  let newElement = new DOMParser().parseFromString(chosenTemplate, "text/html").firstChild;
  console.log(newElement)
  element.insertBefore(
      newElement.childNodes[1].childNodes[0], 
      element.childNodes[4]
      );
}



let itemClassNamePP = null;

let getItemClassNamePP = () => {
  console.log(document.querySelector("[display=grid]").querySelector("[id^=tile]"))

  let pre = document.querySelector("[display=grid]").querySelector("[id^=tile]").childNodes[0]

  if (pre.childNodes.length == 2) {
      pre = pre.childNodes[0]
  } else {
      pre = pre.childNodes[1]
  }

  return pre.childNodes[0].childNodes[1].childNodes[2].className;
}

let getProduktElement = () => {
    let pre = document.getElementsByTagName("main")[0]
    .childNodes[1].childNodes[0].childNodes[1].childNodes[1]
    .childNodes[0];
    
    if (pre.childNodes.length >= 2) {
        pre = pre.childNodes[1];
    } else {
        pre = pre.childNodes[0];
    }

    return pre.childNodes[0];
}

let produkt = () => {
    let element = getProduktElement();

    let check = checkDoneProduktPage(element);
    console.log(check)
    switch (check) {
        case "changed":
            // Remove old apk div
            element.childNodes[4].remove();
        case "never": 
            console.log("Checking...")
            calculateProdukt(element);
            element.doneURI = window.location.href;
            break;
    }
}

let produktRunner = () => {
  let location = window.location.href.match(/produkt|sortiment/)
  if (location != null) {
    location = location[0]
  }
  if (location == "produkt") {
    console.log("hej");
    produkt();
  }
}

setInterval(produktRunner, 500)

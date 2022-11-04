
let checkDone = (element) => {
    return element.style.border == "5px solid red"
}

let getData = (root) => {
    let vol_perc_element = root.childNodes[0].childNodes.length == 2 ?
       root.childNodes[0].childNodes[1] :
       root.childNodes[0].childNodes[0] 
    
    let volume = vol_perc_element.childNodes[1].textContent;
    let percentage = vol_perc_element.childNodes[2].textContent;
    let price = root.childNodes[1].textContent;
    
    volume = volume.slice(0, -3) // milliliter
    percentage = percentage.slice(0, -2).replace(",",".") / 100 // procent
    price = price.replace(/\*|:-/g,"").replace(":",".") // kr

    return [
        parseFloat(volume), 
        parseFloat(percentage), 
        parseFloat(price)
    ]
}

let calculate = (element) => {
    [volume, percentage, price] = getData(element)
    
    let apk = volume * percentage / price
    
    let vol_perc_element = element.childNodes[0].childNodes.length == 2 ?
       element.childNodes[0].childNodes[1] :
       element.childNodes[0].childNodes[0] 

    vol_perc_element.childNodes[2].textContent += " APK: " + apk.toFixed(3)
}

let runner = () => {
    console.log("Running")
    let all = document.getElementsByClassName("css-1d9u16r e3whs8q0")
    for(let element of all) {
        if (!checkDone(element)) {
            console.log(element);
            calculate(element)
            element.style.border = "5px solid red";
        }
    }
}

setInterval(runner,1000)
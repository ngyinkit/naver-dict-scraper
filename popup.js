document.getElementById("export").addEventListener("click", trigger_scrape);

async function trigger_scrape() {
    document.getElementById("output").innerHTML = `<hr> <p style="font-size: larger">Exporting... please wait and don't touch your computer...</p>`;

    const tabId = await getTabId();
    let num_pages = await chrome.scripting.executeScript({
        target: {tabId: tabId},
        function: get_num_pages
    });
    num_pages = num_pages[0].result;
    let final_result = "";
    // scrape each page
    for (let i = 1; i <= num_pages; i++) {
        await new Promise(r => setTimeout(r, 600));
        let result = await chrome.scripting.executeScript({
            target: {tabId: tabId},
            function: scrape
        });
        final_result += result[0].result;
        chrome.scripting.executeScript({
            target: {tabId: tabId},
            function: clickNext,
            args: [i]
        });
    }
    document.getElementById("output").innerHTML = `<hr>
    <h3>Output:</h3>
    <button id="copy">Copy to clipboard</button> <span id="copied"></span> <br><br>
    <textarea disabled id="result" rows="20" cols="50">${final_result}</textarea>`;
    document.getElementById("copy").addEventListener("click", copy);
}

async function getTabId() {
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    return (tabs.length > 0) ? tabs[0].id : null;
}

async function get_num_pages() {
    return document.querySelector("#page_list").children.length;
}

async function scrape() {
    let result = "";
    let wordlist = document.getElementById("section_word_card").children;

    // for each word
    for (let j = 1; j < wordlist.length; j++) {
        let word = wordlist[j].querySelector(".cont_word").children;
        // add hangul to result
        let hangul = word[0].innerText;
        // replace any digits and its preceding space with nothing
        result += hangul.replace(/ \d/g, "");
        // add hanja if any
        if (word.length >1 && word[1].className == "title_origin"){
            let hanja = word[1].innerText;
            hanja = hanja.replace(/하다|되다/g, "");
            result += " (" + hanja + ")";
        }
        result += "%";

        let definitions = wordlist[j].querySelector(".list_mean").children;
        let defn_len = definitions.length;
        // get definitions
        for (let k = 0; k < defn_len; k++) {
            let defn = definitions[k].querySelector(".cont");
            // delete entire em element if exists
            if(defn.children.length > 0 && defn.children[0].tagName == "EM") {
                defn.removeChild(defn.children[0]);
            }
            // add definitions to result
            if (defn_len==1) {
                result += defn.innerText + "@";
            }
            else{
                let count = k+1;
                result += count + ". " + defn.innerText;
                if (count < defn_len) {
                    result += "\n";
                } else {
                    result += "@";
                }
            }
        }
    }
    return result;
}

async function clickNext(current_page) {
    document.querySelector("#page_list").children[current_page].click();
}

async function copy() {
    let elem = document.getElementById("result");
    elem.select();
    navigator.clipboard.writeText(elem.value);
    document.getElementById("copied").innerText = "Copied!";
}
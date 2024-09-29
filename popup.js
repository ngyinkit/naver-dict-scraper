document.getElementById("export").addEventListener("click", trigger_scrape);

async function trigger_scrape() {
    document.getElementById("output").innerHTML = `<hr> <p style="font-size: larger">Exporting... please wait and don't touch your computer...</p>`;

    const tabId = await getTabId();
    chrome.scripting.executeScript({
        target: {tabId: tabId},
        function: scrape
    }, (result) => {
        document.getElementById("output").innerHTML = `<hr>
        <h3>Output:</h3>
        <button id="copy">Copy to clipboard</button> <span id="copied"></span> <br><br>
        <textarea id="result" rows="20" cols="50"></textarea>`;
        document.getElementById("copy").addEventListener("click", copy);
        document.getElementById("result").innerHTML = result[0].result;
    });
}

async function getTabId() {
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    return (tabs.length > 0) ? tabs[0].id : null;
}

async function scrape() {
    let pages = document.querySelector(".page_num").children;
    let current_page = pages[0].innerText;
    let end_page = pages[2].innerText;
    let result = "";

    for (let i = current_page; i <= end_page; i++) {
        // wait a while for the page to load
        await new Promise(r => setTimeout(r, 600));
        let wordlist = document.getElementById("section_word_card").children;

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
            let defn_list = [];
            // get definitions
            for (let k = 0; k < definitions.length; k++) {
                let defn = definitions[k].querySelector(".cont");
                // delete entire em element if exists
                if(defn.children.length > 0 && defn.children[0].tagName == "EM") {
                    defn.removeChild(defn.children[0]);
                }
                defn_list.push(defn.innerText)
            }
            // add definitions to result
            if(defn_list.length == 1) {
                result += defn_list[0] + "@";
            } else {
                for (let m = 0; m < defn_list.length; m++) {
                    let count = m+1;
                    result += count + ". " + defn_list[m];
                    if (m < defn_list.length-1) {
                        result += "\n";
                    } else {
                        result += "@";
                    }
                }
            }
        }
        document.getElementById("page_area").children[0].children[1].click();
    }
    // remove last "@"
    result = result.substring(0, result.length-1);
    return result;
}

async function copy() {
    let elem = document.getElementById("result");
    elem.select();
    navigator.clipboard.writeText(elem.value);
    document.getElementById("copied").innerText = "Copied!";
}
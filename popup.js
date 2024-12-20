document.getElementById("export").addEventListener("click", trigger_scrape);
document.getElementById("export2").addEventListener("click", trigger_scrape2);

async function trigger_scrape() {
    document.getElementById("options").hidden = true;
    document.getElementById("output").innerHTML = `<p style="font-size: larger">Exporting... please wait and don't touch your computer...</p>`;

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
    document.getElementById("output").innerHTML = `<h3>Output:</h3>
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
                result += (k+1) + ". " + defn.innerText + "\n";
            }
        }
        result = result.replace(/\n$/,"@");
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

// functions for CSV export start here
async function trigger_scrape2() {
    document.getElementById("options").hidden = true;
    document.getElementById("output").innerHTML = `<hr> <p style="font-size: larger">Exporting... please wait and don't touch your computer...</p>`;

    const tabId = await getTabId();
    let num_pages = await chrome.scripting.executeScript({
        target: {tabId: tabId},
        function: get_num_pages
    });
    num_pages = num_pages[0].result;
    let final_result = "hangul,definition";
    options = ["hanja", "pronunciation", "kr_exp", "en_exp", "example"];
    chosen = {};
    for (option of options) {
        if (document.getElementById(option).checked) {
            chosen[option] = true;
            final_result += "," + option;
        }
        else{
            chosen[option] = false;
        }
    }
    // scrape each page
    for (let i = 1; i <= num_pages; i++) {
        await new Promise(r => setTimeout(r, 600));
        let result = await chrome.scripting.executeScript({
            target: {tabId: tabId},
            function: scrape_csv,
            args: [chosen]
        });
        final_result += result[0].result;
        chrome.scripting.executeScript({
            target: {tabId: tabId},
            function: clickNext,
            args: [i]
        });
    }
    document.getElementById("output").innerHTML = `<textarea hidden id="result">${final_result}</textarea>`;
    // download csv
    let link = document.createElement("a");
    let file = new Blob([final_result], {type: "text/csv"});
    link.href = URL.createObjectURL(file);
    link.download = "naver_wordbook.csv";
    link.click();
    URL.revokeObjectURL(link.href);
}

async function scrape_csv(options) {
    let result = "";
    let wordlist = document.getElementById("section_word_card").children;

    // for each word
    for (let j = 1; j < wordlist.length; j++) {
        let word = wordlist[j].querySelector(".cont_word").children;
        let word_length = word.length;

        // add hangul
        let hangul = word[0].innerText;
        // replace any digits and its preceding space with nothing
        result += "\n" + hangul.replace(/ \d/g, "") + ",";

        let definitions = wordlist[j].querySelector(".list_mean").children;
        let defn_len = definitions.length;
        result += `"`;
        // get definitions
        for (let k = 0; k < defn_len; k++) {
            let defn = definitions[k].querySelector(".cont");
            // delete entire em element if exists
            if(defn.children.length > 0 && defn.children[0].tagName == "EM") {
                defn.removeChild(defn.children[0]);
            }
            if (defn_len==1) {
                result += defn.innerText + "  ";
            }
            else{
                result += (k+1) + ". " + defn.innerText + "  ";
            }
        }
        result = result.slice(0, -2) + `"`;

        // add hanja if any and selected
        if (options["hanja"]){
            result += ",";
            if (word_length >1 && word[1].className == "title_origin"){
                let hanja = word[1].innerText;
                hanja = hanja.replace(/하다|되다/g, "");
                result += hanja;
            }
        }
        // add pronunciation if any and selected
        if (options["pronunciation"]){
            result += ",";
            if (word_length >1 && word[word_length-1].className == "pronounce"){
                let pronunciation = word[word_length-1].innerText
                result += pronunciation;
            }
        }
        // add kr explanation if any and selected
        if(options["kr_exp"]){
            try{
                result += `,"`;
                if(defn_len==1){
                    result += definitions[0].querySelector(".explanation").children[0].innerText;
                }
                else{
                    for (let k = 0; k < defn_len; k++) {
                        result += (k+1) + ". " + definitions[k].querySelector(".explanation").children[0].innerText + "  ";
                    }
                    result = result.slice(0, -2)
                }
                result += `"`;
            }
            catch{
                result = result.slice(0, -1)
            }
        }
        // add en explanation if any and selected
        if(options["en_exp"]){
            try{
                result += `,"`;
                if(defn_len==1){
                    result += definitions[0].querySelector(".explanation").children[1].innerText;
                }
                else{
                    for (let k = 0; k < defn_len; k++) {
                        result += (k+1) + ". " + definitions[k].querySelector(".explanation").children[1].innerText + "  ";
                    }
                    result = result.slice(0, -2)
                }
                result += `"`;
            }
            catch{
                result = result.slice(0, -1)
            }
        }
        // add example if any and selected
        if(options["example"]){
            try{
                result += `,"`;
                for (let k = 0; k < defn_len; k++) {
                    result += definitions[k].querySelector(".origin").innerText.trim() + "  ";
                }
                result = result.slice(0, -2) + `"`;
            }
            catch{
                result = result.slice(0, -1)
            }
        }
    }
    return result;
} 
//bing

const bingSearchBox = document.getElementById("sb_form_q");
bingSearchBox.onkeydown = (ev) => {
    if (ev.key === "Enter") {
        alert();        chrome.runtime.sendMessage({type: "bing", text: bingSearchBox.value});
        
    }
}
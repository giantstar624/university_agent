const id = setInterval(() => {
    if(document.getElementById("EndOfSurvey")) {
        chrome.runtime.sendMessage({type: "end"});
        clearInterval(id);
    }
}, 1000);
//google chrome

const googleSearchBoxes = document.querySelectorAll(".gLFyf");
googleSearchBoxes.forEach(box => {
    box.onkeydown = (ev) => {
        if (ev.key === "Enter") {
            chrome.runtime.sendMessage({type: "google", text: box.value});
        }
    }
})

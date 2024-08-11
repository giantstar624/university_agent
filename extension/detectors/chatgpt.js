//chatGPT

const gptSearchBox =  document.getElementById("prompt-textarea");
gptSearchBox.onkeydown = (ev) => {
    if (ev.key === "Enter") {
        chrome.runtime.sendMessage({type: "chatgpt", text: gptSearchBox.value});
    }
}
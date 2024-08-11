/*
{
    type: "google",
    text: "hi, there"
}
*/
chrome.runtime.onMessage.addListener(function (request) {
    const {type, text} = request;
    console.log(request);
    switch(type) {
        case "end":
            setTimeout(() => {
                fetch(`http://localhost:8001/logoff`);
            }, 1000 * 15);
        default:
            fetch(`http://localhost:8001/searchlog?type=${encodeURIComponent(type)}&text=${encodeURIComponent(text)}`);
    }
});
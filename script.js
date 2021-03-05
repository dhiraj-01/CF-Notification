async function Fetch(url) {
    return fetch(url).then(function (response) {
        return response.json();
    }).then(function (data) {
        return data;
    }).catch(function (err) {
        console.log('Fetch problem : ' + err.message);
    });
}

function speakText(msg) {
    let speech = new SpeechSynthesisUtterance();
    speech.text = msg;
    speech.lang = "en-US";
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
}

let msgEle = document.getElementById("msg");
let userEle = document.getElementById("user");

async function getUser()
{
    msgEle.innerText = "";
    let user = userEle.value;
    let userInfoApi = `https://codeforces.com/api/user.info?handles=${user}`;
    let userStatusApi = `https://codeforces.com/api/user.status?handle=${user}&from=1&count=1`;

    let data = await Fetch(userInfoApi);
    if(data.status === "FAILED") {
        msgEle.innerText = "Invalid Username";
        return;
    }

    let firstName = data.result[0].firstName || "sir";
    let prvSubmissionId = null;
    msgEle.innerHTML = `Waiting for <a href="https://codeforces.com/profile/${user}" target="_blank">your</a> submission ...`;

    setInterval(async () => {
        let data = await Fetch(userStatusApi);
        if(data.status == "OK") {
            data = data.result[0];
            if(data.verdict == "TESTING") return;
            if(data.id != prvSubmissionId) {
                if(prvSubmissionId) {
                    if(data.verdict == "OK") {
                        speakText(`well done ${firstName}, AC on problem ${data.problem.index}`);
                    }
                    else {
                        speakText(`hey ${firstName}, ${data.verdict.split("_").join(" ")} on test ${data.passedTestCount + 1}, problem ${data.problem.index}`);
                    }
                }
                prvSubmissionId = data.id;
            }
        }
    }, 5000);
}
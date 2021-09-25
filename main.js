/*
  Hacky project, no code quality here (:
*/
let currentMode = 'IDLE';

document.oncontextmenu = (evt) => {
    if (evt.target?.type === 'checkbox') {
        evt.preventDefault();
    }
};
window.onmousedown = (evt) => {
    currentMode = evt.button === 0 ? 'WRITE' : 'DELETE';
    if (evt.target?.type === 'checkbox') {
        handleCheckbox(evt.target);
    }
    modeSpan.innerHTML = currentMode;
};
window.onmouseup = () => {
    currentMode = 'IDLE';
    modeSpan.innerHTML = currentMode;
};


function onCodeChange() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const checkedVals = [...checkboxes].filter(cb => cb.checked).map(cb => cb.value)
    let str = checkedVals.map((dt, i) => new Array(+noOfCommitsInput.value).fill().map((_, j) => `git commit --allow-empty --date='${dt}' -m "${i}_${j}"`)).flat().join('\n') + '\n';
    commitsTA.value = str;
}

function handleCheckbox(cb) {
    switch (currentMode) {
        case 'WRITE':
            cb.checked = true;
            onCodeChange();
            break;
        case 'DELETE':
            cb.checked = false;
            onCodeChange();
            break;
        case 'IDLE':
        default:
            break;
    }
}

function main() {
    const daysInWeek = 7;
    const months = 12;
    const now = new Date();
    if (isNaN(now)) {
        throw 'invalid date';
    }
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    const maxNow = new Date(now);
    now.setMonth(now.getMonth() - months);
    const daysByWeek = [];
    let week = 0;
    while (1) {
        const days = [];
        const startDay = week == 0 ? now.getDay() : 0;
        for (let filler = 0; filler < startDay; filler++) {
            days.push(null);
        }
        let finish = false;
        for (let d = startDay; d < daysInWeek; d++) {
            if (now.getTime() > maxNow.getTime()) {
                days.push(null)
                finish = true;
            } else {
                const df = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}T00:00:00`;
                days.push(df);
            }
            now.setDate(now.getDate() + 1);
        }
        daysByWeek.push(days);
        ++week;
        if (finish) break;
    }
    let str = '<table>';
    for (let d = 0; d < daysInWeek; d++) {
        str += '<tr>';
        for (let w = 0; w < daysByWeek.length; w++) {
            if (daysByWeek[w][d]) {
                str += `<td><input onclick="event.preventDefault();" onmouseover="handleCheckbox(this)" type="checkbox" value="${daysByWeek[w][d]}"/></td>`
            } else {
                str += `<td><input type="checkbox" disabled/></td>`
            }
        }
        str += '</tr>';
    }
    str += '</table>';
    str += '<p>Mode: <span id="modeSpan"></span> (Left mouse button = write; Right mouse button = delete)</p>';
    str += '<p>Strength: <input oninput="onCodeChange()" id="noOfCommitsInput" style="width:50px" type="number" min="1" value="1"/> (number of commits per day)</p>';
    str += '<p>Paste into your git repo (output):</p><textarea id="commitsTA" readonly></textarea>';
    appContainer.innerHTML = str;
    modeSpan.innerHTML = currentMode;
}
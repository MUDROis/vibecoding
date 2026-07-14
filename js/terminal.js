// ===== Печатающийся терминал на главной =====
(function() {
    const terminalBody = document.querySelector('#heroTerminal .terminal-body');
    if (!terminalBody) return;

    const groups = [
        [
            { prompt: '$', cmd: 'git clone vibe-course', output: 'Cloning into \'vibe-course\'...' },
        ],
        [
            { prompt: '$', cmd: 'cd vibe-course' },
            { prompt: '$', cmd: 'code .' },
        ],
        [
            { prompt: '$', cmd: 'npm run dev', output: '✓ Compiled successfully in 2.3s' },
            { prompt: '', cmd: '', output: '→ Your site is running at http://localhost:3000', isLast: true },
        ],
    ];

    function typeLine(line) {
        const div = document.createElement('div');
        div.className = 'line';
        let html = '';
        if (line.prompt) {
            html += `<span class="prompt">${line.prompt}</span> `;
        }
        if (line.cmd) {
            html += `<span class="cmd">${line.cmd}</span>`;
        }
        div.innerHTML = html;
        terminalBody.appendChild(div);

        if (line.output) {
            const outDiv = document.createElement('div');
            outDiv.className = 'line';
            outDiv.innerHTML = `<span class="output">${line.output}</span>`;
            terminalBody.appendChild(outDiv);
        }

        if (line.isLast) {
            const cursorSpan = document.createElement('span');
            cursorSpan.className = 'cursor';
            terminalBody.appendChild(cursorSpan);
        }
    }

    function playGroup(groupIndex) {
        if (groupIndex >= groups.length) return;
        const group = groups[groupIndex];
        group.forEach(line => typeLine(line));
        setTimeout(() => playGroup(groupIndex + 1), 800);
    }

    setTimeout(() => playGroup(0), 1500);
})();

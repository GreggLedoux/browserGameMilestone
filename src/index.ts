const selectors: {
    boardContainer: HTMLElement | null;
    board: HTMLElement | null;
    moves: HTMLElement | null;
    timer: HTMLElement | null;
    start: HTMLButtonElement | null;
    win: HTMLElement | null;
} = {
    boardContainer: document.querySelector('.board-container'),
    board: document.querySelector('.board'),
    moves: document.querySelector('.moves'),
    timer: document.querySelector('.timer'),
    start: document.querySelector('button'),
    win: document.querySelector('.win')
};

const state: {
    gameStarted: boolean;
    flippedCards: number;
    totalFlips: number;
    totalTime: number;
    loop: NodeJS.Timeout | null;
} = {
    gameStarted: false,
    flippedCards: 0,
    totalFlips: 0,
    totalTime: 0,
    loop: null
};


const shuffle = <T>(array: T[]): T[] => {
    const clonedArray = [...array]

    for (let index = clonedArray.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index +1))
        const original = clonedArray[index]

        clonedArray[index] = clonedArray[randomIndex]
        clonedArray[randomIndex] = original
    }

    return clonedArray
}

const pickRandom = <T> (array: T[], items: number): T[] => {
    const clonedArray = [...array]
    const randomPicks = []

    for (let index = 0; index < items; index++) {
        const randomIndex = Math.floor(Math.random() * clonedArray.length)

        randomPicks.push(clonedArray[randomIndex])
        clonedArray.splice(randomIndex, 1)
    }

    return randomPicks
}

const generateGame = (): void => {
    const dimensions = parseInt(selectors.board.getAttribute('data-dimension')!);

    if (dimensions % 2 !== 0) {
        throw new Error('The dimension of the board must be an even number.')
    }

    const emojis = ['🐼', '🐸', '🐿️', '🐶', '🦝', '🐔', '🐟', '🦓', '🐞', '🐯', '🐇', '🐮']
    const picks = pickRandom(emojis, (dimensions * dimensions) / 2);
    const items = shuffle([...picks, ...picks]);
    const cards = `
        <div class="board" style="grid-template-columns: repeat(${dimensions}, auto)">
            ${items.map(item =>  `
                <div class="card">
                    <div class="card-front"></div>
                    <div class="card-back">${item}</div>
                    </div>
                `).join('')}
        </div>
    `; 

    const parser = new DOMParser();
    const parsedDocument = parser.parseFromString(cards, 'text/html');

    if (selectors.board) {
    selectors.board.replaceWith(parsedDocument.querySelector('.board')!);
    }
};

const startGame = (): void  => {
    state.gameStarted = true;
    selectors.start.classList.add('disabled');

    state.loop = setInterval(() => {
        state.totalTime++

        if (selectors.moves)  {
            selectors.moves.innerText = `${state.totalFlips} moves`;
        }

        if (selectors.timer) {
            selectors.timer.innerText = `time: ${state.totalTime} sec`;
        }
    }, 1000);
};

const flipBackCards = () => {
    document.querySelectorAll('.card:not(.matched)').forEach(card => {
        card.classList.remove('flipped')
    })

    state.flippedCards = 0
}

const flipCard = (card: HTMLElement): void => {
    state.flippedCards++
    state.totalFlips++

    if (!state.gameStarted) {
        startGame ()
    }

    if (state.flippedCards <= 2) {
        card.classList.add('flipped')
    }

    if (state.flippedCards === 2) {
        const flippedCards = document.querySelectorAll('.flipped:not(.matched)')

        if (flippedCards[0].innerText === flippedCards[1].innerText) {
            flippedCards[0].classList.add('matched')
            flippedCards[1].classList.add('matched')
        }

        setTimeout(() => {
            flipBackCards()
        }, 1000)
    }
   
  

    if (!document.querySelectorAll('.card:not(.flipped)').length) {
        setTimeout(() => {
            selectors.boardContainer.classList.add('flipped')
            selectors.win.innerHTML = `
            <span class="win-text">
            YouWon!<br />
            with <span class="highlight">${state.totalFlips}</span> moves<br />
            under <span class="highlight">${state.totalTime}</span> seconds
            </span>
            `
            
            clearInterval(state.loop)
        }, 1000)
    }
} 



const attachEventListeners = (): void => {
    document.addEventListener('click', event => {
        const eventTarget = event.target as HTMLElement;
        const eventParent = eventTarget.parentElement as HTMLElement;
        if (eventTarget.className.includes('card') && !eventParent.className.includes('flipped')) {
            flipCard(eventParent)
        } else if (eventTarget.nodeName === 'BUTTON' && !eventTarget.className.includes('disabled')) {
            startGame()
        }
    })
}

generateGame()
attachEventListeners()

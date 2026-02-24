
// @ts-ignore
import { io } from 'https://cdn.socket.io/4.7.2/socket.io.esm.min.js';
import { categorizeThought, colorMap, ThoughtCategory } from './nbc.js';

const socket = io('https://switchboard-production-04b2.up.railway.app');
const world = document.getElementById('world');

const adjectives = [
    // Organic/Biological
    "Fungal", "Mossy", "Rooted", "Floral", "Lichen", "Spore", "Mycelial", "Verdant",
    // Digital/Glitch
    "Static", "Binary", "Null", "Cached", "Encrypted", "Proxy", "Latent", "Bitwise",
    // Liminal/Vibe
    "Hollow", "Vivid", "Pale", "Sunken", "Echoing", "Silent", "Blurred", "Faded",
    // Tech-Obsidian
    "Carbon", "Basalt", "Quartz", "Glass", "Chrome", "Copper", "Silicon", "Cobalt"
];

const nouns = [
    // Nature
    "Sprout", "Bloom", "Grove", "Thicket", "Canopy", "Petal", "Willow", "Ivy",
    // Structure
    "Node", "Cell", "Vessel", "Bridge", "Tower", "Vault", "Harbor", "Gate",
    // Entity
    "Agent", "Drifter", "Ghost", "Watcher", "Signal", "Vector", "Pulse", "Wanderer",
    // The "Key" Theme
    "Socket", "Protocol", "Scan", "Cortex", "Archive", "Memory", "Frame", "Logic"
];

const generateName = () => {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(100000 + Math.random() * 899999); // 6-digit suffix
    return `${adj} ${noun} ${num}`;
};

const myPersona = generateName();
console.log(`Scanning as: ${myPersona}`);


function cast() {

    const text = (document.getElementById('myThought') as HTMLTextAreaElement).value;

    const category = categorizeThought(text) as ThoughtCategory;

    if (category === "trash") {
        alert("⚠️ Thought dissolved: Content flagged as noise/toxic.");
        return; // Kill the message
    }

    socket.emit('broadcast-thought', { thought: text, key: myPersona, color: colorMap[category] as string });
}

function displayNewThought(data: any) {
    const world = document.getElementById('world');
    if (!world) return;

    const field = document.getElementById('thought-field');
    const tile = document.createElement('div');
    tile.className = 'thought-tile';
    
    // Randomly place within the bounds of the #world div
    const x = Math.random() * (world.clientWidth - 150);
    const y = Math.random() * (world.clientHeight - 50);
    
    tile.style.left = `${x}px`;
    tile.style.top = `${y}px`;
    tile.style.color = data.color
    
    tile.innerHTML = `
        <div class="author-tag">${escapeHTML(data.key)}</div>
        <div class="thought-text">${escapeHTML(data.thought)}</div>
    `;
    
    field!.appendChild(tile);

    // Guerilla Feature: Thoughts dissolve after 60 seconds
    setTimeout(() => {
        tile.style.opacity = '0';
        tile.style.transition = 'opacity 2s';
        setTimeout(() => tile.remove(), 2000);
    }, 60000);
}

function escapeHTML(str: string): string {
    const p = document.createElement('p');
    p.textContent = str;
    return p.innerHTML;
}

displayNewThought({key: "Welcome Bot", thought: "Hello World! Welcome to the LOW-KEY World!", color: "black"})

socket.on('new-thought', (data: any) => {
    displayNewThought(data)
});

socket.on('error-msg', (msg: string) => {
    alert(msg)
});

socket.on('user-left', (id: string) => {
    const tile = document.getElementById(id);
    if (tile) tile.remove(); // The "Dissolve" effect
});

document.addEventListener('DOMContentLoaded', () => {
    const castBtn = document.getElementById('castBtn');
    const input = document.getElementById('myThought');

    if (castBtn) {
        castBtn.addEventListener('click', cast);
    }
    const userNameEl = document.getElementById('userName');

    if (userNameEl) {
        userNameEl.textContent = myPersona
    }
});
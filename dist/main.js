// @ts-ignore
import winkNaiveBayesTextClassifier from 'https://cdn.skypack.dev/wink-naive-bayes-text-classifier?dts';
// @ts-ignore
import { io } from 'https://cdn.socket.io/4.7.2/socket.io.esm.min.js';
const nbc = winkNaiveBayesTextClassifier();
// Define simple text prep (no separate NLP library needed for basics)
nbc.definePrepTasks([
    (text) => text.toLowerCase().split(/\W+/).filter(Boolean)
]);
nbc.defineConfig({ smoothingFactor: 0.5 });
// 1. Training - Feed it 5-10 examples per quadrant
nbc.learn("How do I find the library basement?", "informative");
nbc.learn("The exam is on Tuesday at 4pm", "informative");
nbc.learn("Does anyone know where building 4 is?", "informative");
nbc.learn("haha that is so funny lol", "playful");
nbc.learn("anyone want to grab coffee? :P", "playful");
nbc.learn("vibing in the lounge right now", "playful");
nbc.learn("I am so overwhelmed with this project", "distressed");
nbc.learn("I feel like I'm going to fail everything", "distressed");
nbc.learn("everything is falling apart honestly", "distressed");
nbc.learn("BUY CHEAP BITCOIN NOW !!!", "trash");
nbc.learn("you are a total idiot and i hate you", "trash");
nbc.learn("click this link for free prizes", "trash");
// Consolidate the training
nbc.consolidate();
// 2. The Categorizer Function
const categorizeThought = (text) => {
    const category = nbc.predict(text);
    console.log(`Categorised "${text}" as category: ${category}`);
    return category; // Returns the label: "informative", "playful", etc.
};
const socket = io('https://switchboard-production-04b2.up.railway.app');
const world = document.getElementById('world');
const adjectives = ["Crimson", "Vibrant", "Silent", "Hidden", "Neon", "Organic", "Solar", "Digital"];
const nouns = ["Player", "Echo", "Seeker", "Ghost", "Loom", "World", "Signal", "Key"];
const generateName = () => {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(100000 + Math.random() * 899999); // 6-digit suffix
    return `${adj} ${noun} ${num}`;
};
const myPersona = generateName();
console.log(`Scanning as: ${myPersona}`);
export const colorMap = {
    informative: "#3498db", // Blue
    playful: "#f1c40f", // Yellow
    distressed: "#e67e22", // Orange
    trash: "#95a5a6", // ??
    unknown: "black"
};
function cast() {
    const text = document.getElementById('myThought').value;
    const category = categorizeThought(text);
    if (category === "trash") {
        alert("⚠️ Thought dissolved: Content flagged as noise/toxic.");
        return; // Kill the message
    }
    socket.emit('broadcast-thought', { thought: text, key: myPersona, color: colorMap[category] });
}
function displayNewThought(data) {
    const field = document.getElementById('thought-field');
    const tile = document.createElement('div');
    tile.className = 'thought-tile';
    // Randomize position so they float around the screen
    const x = Math.random() * (window.innerWidth - 200);
    const y = Math.random() * (window.innerHeight - 300);
    tile.style.left = `${x}px`;
    tile.style.top = `${y}px`;
    tile.style.color = data.color;
    tile.innerHTML = `
        <div class="author-tag">${data.key}</div>
        <div class="thought-text">${data.thought}</div>
    `;
    field.appendChild(tile);
    // Guerilla Feature: Thoughts dissolve after 60 seconds
    setTimeout(() => {
        tile.style.opacity = '0';
        tile.style.transition = 'opacity 2s';
        setTimeout(() => tile.remove(), 2000);
    }, 60000);
}
displayNewThought({ key: "Welcome Bot", thought: "Hello World! Welcome to the LOW-KEY World!", color: "black" });
socket.on('new-thought', (data) => {
    displayNewThought(data);
});
socket.on('error-msg', (msg) => {
    alert(msg);
});
socket.on('user-left', (id) => {
    const tile = document.getElementById(id);
    if (tile)
        tile.remove(); // The "Dissolve" effect
});
document.addEventListener('DOMContentLoaded', () => {
    const castBtn = document.getElementById('castBtn');
    const input = document.getElementById('myThought');
    if (castBtn) {
        castBtn.addEventListener('click', cast);
    }
});

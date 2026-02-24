
// @ts-ignore
import winkNaiveBayesTextClassifier from 'https://cdn.skypack.dev/wink-naive-bayes-text-classifier?dts';

export const colorMap = {
    informative: "#3498db", // Blue
    playful: "#f1c40f", // Yellow
    distressed: "#e67e22", // Orange
    trash: "#95a5a6", // ??
    unknown: "black"
} as const;

// This creates the union type: "informative" | "playful" | "distressed" | "trash"
export type ThoughtCategory = keyof typeof colorMap;

const nbc = winkNaiveBayesTextClassifier();

// Define simple text prep (no separate NLP library needed for basics)
nbc.definePrepTasks([
    (text: string) => text.toLowerCase().split(/\W+/).filter(Boolean)
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
export const categorizeThought = (text: string) => {
    const category = nbc.predict(text)
    console.log(`Categorised "${text}" as category: ${category}`)
    return category; // Returns the label: "informative", "playful", etc.
};
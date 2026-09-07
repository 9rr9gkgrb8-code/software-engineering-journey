"use client";

/* Literal quotation marks are part of the Python code example shown to learners. */
/* eslint-disable react/no-unescaped-entities */

import { useEffect, useMemo, useState } from "react";
import { compileMissionResult } from "./world-engine.mjs";

type View = "launch" | "code" | "ai" | "blueprint" | "portfolio";
type Mission = { title: string; skill: string; concept: string; example: string; steps: string[]; prompt: string; answers: string[]; hint: string; why: string; xp: number };
type WorldState = "ready" | "success" | "retry";
type WorldCommand = { type: string; actor?: string; target?: string; value?: string };
type StoredProgress = { complete?: number[]; aiComplete?: number[]; role?: string; goal?: string; rules?: string; attempts?: Record<string, number> };

const missions: Mission[] = [
  { title: "Name Your Bot", skill: "Variables", concept: "A variable is a labeled container. The label lets your program remember and reuse a value.", example: 'pet_name = "Pixel"', steps: ["Choose a clear variable name", "Add one equals sign", "Put text inside quotation marks"], prompt: "Save the name Bolt in a variable called robot_name.", answers: ['robot_name = "bolt"', "robot_name = 'bolt'"], hint: "Text goes inside quotation marks.", why: "Variables give programs a place to remember information.", xp: 100 },
  { title: "Score Check", skill: "Decisions", concept: "An if statement asks a true-or-false question before choosing what happens next.", example: "if energy >= 5:", steps: ["Begin with if", "Write the condition", "Finish the line with a colon"], prompt: "Start an if statement that checks whether score is at least 10.", answers: ["if score >= 10:"], hint: "Use >= and finish with a colon.", why: "Decisions help a program choose what to do next.", xp: 120 },
  { title: "Three Cheers", skill: "Loops", concept: "A loop repeats an instruction. range(3) creates three turns: 0, 1 and 2.", example: "for turn in range(3):", steps: ["Begin with for", "Choose a counter name", "Use range and finish with a colon"], prompt: "Start a loop that repeats three times.", answers: ["for i in range(3):", "for _ in range(3):", "for turn in range(3):"], hint: "Try range(3) inside a for loop.", why: "Loops repeat useful work without copying code.", xp: 140 },
  { title: "Helpful Function", skill: "Functions", concept: "A function gives a reusable set of instructions a name so it can be called later.", example: "def open_gate():", steps: ["Begin with def", "Name the action", "Add parentheses and a colon"], prompt: "Define a function named say_hello with no inputs.", answers: ["def say_hello():"], hint: "Start with def, add (), and finish with a colon.", why: "Functions package an idea so you can reuse it.", xp: 160 },
  { title: "Snack Pack", skill: "Lists", concept: "A list stores several related values in order inside square brackets.", example: '["map", "torch", "key"]', steps: ["Name the list", "Add an equals sign", "Separate quoted items with commas"], prompt: "Create a list named snacks containing apple and popcorn.", answers: ['snacks = ["apple", "popcorn"]', "snacks = ['apple', 'popcorn']"], hint: "Use square brackets and quote both snacks.", why: "Lists keep related values together in order.", xp: 180 },
  { title: "Show the Result", skill: "Output", concept: "print() sends a message from the program to the person running it.", example: 'print("Gate unlocked!")', steps: ["Write print", "Add parentheses", "Put the message in quotation marks"], prompt: "Print the text Great job!", answers: ['print("great job!")', "print('great job!')"], hint: "Put the message inside print(...).", why: "Output lets a program communicate its result.", xp: 200 },
];

const aiLessons = [
  { icon: "01", title: "Give it a role", text: "Tell the assistant what kind of helper it should be and who it is helping.", question: "Which role is specific enough?", options: ["Be helpful", "Be a patient sixth-grade math coach"], answer: 1 },
  { icon: "02", title: "Add useful context", text: "Share the goal and learning level, but leave out names, school details, passwords and private information.", question: "Which detail is safe and useful?", options: ["I am learning fractions", "My full name and school are…"], answer: 0 },
  { icon: "03", title: "Set boundaries", text: "Say what the assistant may do, what it must not do and when it should ask an adult.", question: "Which rule protects learning?", options: ["Give me every answer", "Give one hint, then let me try"], answer: 1 },
  { icon: "04", title: "Test the answer", text: "AI can be confidently wrong. Check facts, run safe examples and ask whether the answer makes sense.", question: "What should happen before trusting an answer?", options: ["Check it with a trusted source", "Assume confident wording is correct"], answer: 0 },
];
const defaultFeedback = "Read the lesson, then try the quest. A hint is ready if you need it.";

export default function Home() {
  const [view, setView] = useState<View>("launch");
  const [mission, setMission] = useState(0);
  const [lessonOpen, setLessonOpen] = useState(true);
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState(defaultFeedback);
  const [complete, setComplete] = useState<number[]>([]);
  const [aiComplete, setAiComplete] = useState<number[]>([]);
  const [aiAnswers, setAiAnswers] = useState<Record<number, number>>({});
  const [aiFeedback, setAiFeedback] = useState<Record<number, string>>({});
  const [role, setRole] = useState("friendly study coach");
  const [goal, setGoal] = useState("help me understand a hard homework idea");
  const [rules, setRules] = useState("Give one hint at a time. Do not give the final answer.");
  const [saved, setSaved] = useState(false);
  const [attempts, setAttempts] = useState<Record<string, number>>({});
  const [sadConnected, setSadConnected] = useState(false);
  const [connectFeedback, setConnectFeedback] = useState("Built-in coaching works without a connection.");
  const [familyKey, setFamilyKey] = useState("");
  const [worldState, setWorldState] = useState<WorldState>("ready");
  const [worldCommands, setWorldCommands] = useState<readonly WorldCommand[]>([{ type: "reset" }]);
  const [runtimeConnected, setRuntimeConnected] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const value = JSON.parse(localStorage.getItem("forge-learning-v3") || localStorage.getItem("forge-learning-v2") || "{}") as StoredProgress;
        if (Array.isArray(value.complete)) setComplete(value.complete.filter((n) => Number.isInteger(n) && n >= 0 && n < missions.length));
        if (Array.isArray(value.aiComplete)) setAiComplete(value.aiComplete.filter((n) => Number.isInteger(n) && n >= 0 && n < aiLessons.length));
        if (typeof value.role === "string") setRole(value.role.slice(0, 80));
        if (typeof value.goal === "string") setGoal(value.goal.slice(0, 140));
        if (typeof value.rules === "string") setRules(value.rules.slice(0, 180));
        if (value.attempts && typeof value.attempts === "object") setAttempts(value.attempts);
        setFamilyKey(sessionStorage.getItem("forge-family-key") || "");
      } catch { setConnectFeedback("Saved progress was damaged, so Forge started a clean session."); }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem("forge-learning-v3", JSON.stringify({ complete, aiComplete, role, goal, rules, attempts })); }, [complete, aiComplete, role, goal, rules, attempts, hydrated]);

  const xp = useMemo(() => complete.reduce((sum, item) => sum + missions[item].xp, 0) + aiComplete.length * 75, [complete, aiComplete]);
  const blueprint = useMemo(() => `You are a ${role || "helpful coach"}.\n\nYour job: ${goal || "help me learn"}.\n\nRules: ${rules || "Explain your thinking and keep me safe."}\n\nBefore answering, ask what I have already tried. Use middle-school-friendly language. Never ask for private information. If the topic could be unsafe or serious, tell me to ask a trusted adult. Remind me to check important facts because AI can be wrong.`, [role, goal, rules]);

  const chooseMission = (index: number) => { setMission(index); setCode(""); setLessonOpen(true); setWorldState("ready"); setWorldCommands([{ type: "reset" }]); setRuntimeConnected(false); setFeedback(defaultFeedback); };
  const connectSad = async () => {
    const key = familyKey.trim();
    if (!key) { setSadConnected(false); setConnectFeedback("Enter the family access code first."); return; }
    sessionStorage.setItem("forge-family-key", key); setConnectFeedback("Checking the private SAD coach…");
    try { const response = await fetch("/api/sad", { headers: { "x-forge-family-key": key } }); const value = await response.json(); const connected = response.ok && value.connected === true; setSadConnected(connected); setConnectFeedback(connected ? "Private SAD coaching is ready." : "SAD is unavailable. Built-in coaching remains ready."); }
    catch { setSadConnected(false); setConnectFeedback("SAD is unavailable. Built-in coaching remains ready."); }
  };
  const checkCode = async () => {
    const clean = (value: string) => value.replace(/\s+/g, " ").trim().toLowerCase();
    if (!code.trim()) { setWorldState("retry"); setFeedback("Type your Python answer before running the mission."); return; }
    const attemptNumber = (attempts[mission] || 0) + 1; setAttempts((items) => ({ ...items, [mission]: attemptNumber }));
    let correct = missions[mission].answers.some((answer) => clean(code) === clean(answer));
    let commands = compileMissionResult({ missionId: missions[mission].skill.toLowerCase(), correct }) as readonly WorldCommand[];
    if (mission === 0 && familyKey.trim()) {
      try { const execution = await fetch("/api/forge/run", { method: "POST", headers: { "Content-Type": "application/json", "x-forge-family-key": familyKey.trim() }, body: JSON.stringify({ mission_id: "variables", source: code }) }); if (execution.ok) { const evidence = await execution.json(); correct = evidence.status === "passed"; commands = evidence.commands; setRuntimeConnected(true); } else setRuntimeConnected(false); }
      catch { setRuntimeConnected(false); }
    }
    setWorldCommands(commands);
    if (correct) { setWorldState("success"); setComplete((items) => items.includes(mission) ? items : [...items, mission]); setFeedback(`You forged it! +${missions[mission].xp} XP. ${missions[mission].why}`); }
    else { setWorldState("retry"); setFeedback(`Good attempt. Hint: ${missions[mission].hint}`); }
    if (!familyKey.trim()) return;
    try { const item = missions[mission]; const response = await fetch("/api/sad", { method: "POST", headers: { "Content-Type": "application/json", "x-forge-family-key": familyKey.trim() }, body: JSON.stringify({ mission_id: item.skill.toLowerCase(), lesson: item.why, prompt: item.prompt, student_answer: code, correct, attempt_number: attemptNumber, hint: item.hint }) }); if (response.ok) { const result = await response.json(); setSadConnected(true); setFeedback(result.feedback); } else setSadConnected(false); }
    catch { setSadConnected(false); }
  };
  const checkAiLesson = (index: number) => {
    const selected = aiAnswers[index];
    if (selected === undefined) { setAiFeedback((items) => ({ ...items, [index]: "Choose an answer first." })); return; }
    if (selected === aiLessons[index].answer) { setAiComplete((items) => items.includes(index) ? items : [...items, index]); setAiFeedback((items) => ({ ...items, [index]: "Correct. +75 XP" })); }
    else setAiFeedback((items) => ({ ...items, [index]: "Try again. Choose the option that protects learning and privacy." }));
  };
  const copyBlueprint = async () => {
    try { if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(blueprint); else { const area = document.createElement("textarea"); area.value = blueprint; area.style.position = "fixed"; area.style.opacity = "0"; document.body.appendChild(area); area.select(); if (!document.execCommand("copy")) throw new Error("copy failed"); area.remove(); } setSaved(true); window.setTimeout(() => setSaved(false), 1800); }
    catch { setSaved(false); }
  };
  const exportPortfolio = () => { const data = { product: "Forge", exported_at: new Date().toISOString(), xp, completed_quests: complete.map((i) => missions[i].title), completed_ai_lessons: aiComplete.map((i) => aiLessons[i].title), attempts, assistant_blueprint: blueprint }; const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })); const link = document.createElement("a"); link.href = url; link.download = "forge-portfolio.json"; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 0); };
  const resetProgress = () => { if (!confirm("Clear all Forge progress on this device?")) return; setComplete([]); setAiComplete([]); setAiAnswers({}); setAiFeedback({}); setAttempts({}); localStorage.removeItem("forge-learning-v2"); localStorage.removeItem("forge-learning-v3"); };

  return <main>
    <header className="topbar"><button className="brand" onClick={() => setView("launch")} aria-label="Forge home"><span>F</span> FORGE <small>BUILD YOUR BRAIN</small></button><nav aria-label="Main navigation"><button className={view === "code" ? "active" : ""} onClick={() => setView("code")}>Code lessons</button><button className={view === "ai" ? "active" : ""} onClick={() => setView("ai")}>AI lessons</button><button className={view === "blueprint" ? "active" : ""} onClick={() => setView("blueprint")}>Assistant builder</button><button className={view === "portfolio" ? "active" : ""} onClick={() => setView("portfolio")}>My progress</button></nav><div className="progress" aria-label={`${complete.length} of ${missions.length} code quests complete and ${xp} experience points`}><b>{xp}</b><span>XP</span></div></header>

    {view === "launch" && <section className="hero-shell"><div className="hero-copy"><p className="eyebrow">A CREATIVE TECH LAB FOR AGES 11–14</p><h1>Learn it.<br/><em>Code it. Change the world.</em></h1><p className="lead">Take short Python and AI lessons, complete interactive missions and build a private record of what you learn.</p><div className="actions"><button className="primary" onClick={() => { setView("code"); setLessonOpen(true); }}>Start lesson one →</button><button className="secondary" onClick={() => setView("blueprint")}>Build an AI helper</button></div><div className="family-access"><label>Family access code<input aria-describedby="connection-status" type="password" value={familyKey} onChange={(event) => setFamilyKey(event.target.value.slice(0, 128))} autoComplete="off" /></label><button className="secondary" onClick={connectSad}>{sadConnected ? "Reconnect SAD coach" : "Connect SAD coach"}</button></div><p id="connection-status" className="privacy-note" aria-live="polite">{connectFeedback}</p><p className="privacy-note">No account. No public chat. Progress stays on this device.</p></div><aside className="console-card"><div className="console-top"><span/><span/><span/><b>forge_lab.py</b></div><pre><code><i># You are the builder.</i>{"\n"}<strong>idea</strong> = <q>"homework coach"</q>{"\n"}<strong>rules</strong> = [<q>"give hints"</q>,{"\n"}         <q>"protect privacy"</q>]{"\n\n"}<strong>if</strong> answer_looks_wrong:{"\n"}    check_it_again()</code></pre><div className="console-status"><span>{sadConnected ? "SAD COACH CONNECTED" : "BUILT-IN COACH READY"}</span><b>SAFE MODE ON</b></div></aside><div className="path-grid"><button className="path coral" onClick={() => { setView("code"); setLessonOpen(true); }}><span>PATH 01</span><h2>Python missions</h2><p>Six guided lessons with examples, hints and working code checks.</p><b>Begin →</b></button><button className="path blue" onClick={() => setView("ai")}><span>PATH 02</span><h2>AI judgment</h2><p>Four lessons about roles, privacy, boundaries and verification.</p><b>Explore →</b></button><button className="path yellow" onClick={() => setView("blueprint")}><span>BUILD LAB</span><h2>Assistant blueprint</h2><p>Turn an idea into safe, testable instructions you control.</p><b>Design →</b></button></div></section>}

    {view === "code" && <section className="workspace"><p className="eyebrow">PATH 01 · PYTHON FOUNDATIONS</p><h1>Learn. Try. Forge.</h1><p className="lead">Each quest starts with a tiny lesson. Then you write the pattern and watch it change the world.</p><div className="tabs">{missions.map((item, i) => <button key={item.title} className={mission === i ? "selected" : ""} onClick={() => chooseMission(i)}><small>{complete.includes(i) ? "✓ COMPLETE" : `${item.skill} · ${item.xp} XP`}</small>{item.title}</button>)}</div><div className="lesson-panel"><div><p className="eyebrow">LESSON {mission + 1} OF {missions.length}</p><h2>{missions[mission].skill}</h2><p>{missions[mission].concept}</p></div>{lessonOpen ? <><div className="lesson-example"><small>EXAMPLE</small><code>{missions[mission].example}</code></div><ol>{missions[mission].steps.map((step) => <li key={step}>{step}</li>)}</ol><button className="primary" onClick={() => setLessonOpen(false)}>Start the practice →</button></> : <button className="secondary" onClick={() => setLessonOpen(true)}>Review lesson</button>}</div>{!lessonOpen && <div className="lab"><div className={`code-world ${worldState}`} aria-label="Interactive code world" aria-live="polite"><div className="world-sky"><span className="cloud one"/><span className="cloud two"/></div><div className="world-object crystal" aria-hidden="true">◆</div><div className="world-object gate" aria-hidden="true">▥</div><div className="companion" aria-hidden="true"><span className="ears">▲ ▲</span><b>F</b></div><div className="speech">{worldCommands.find((command) => command.type === "say")?.value || "Write code to wake the world."}</div><div className="world-ground"/><div className="world-status"><b>{worldState === "success" ? "WORLD UPDATED" : worldState === "retry" ? "TRY AGAIN" : "READY"}</b><span>{runtimeConnected ? "RUNTIME VERIFIED" : "VALIDATED COMMANDS"}</span></div></div><div className="brief"><span className="number">0{mission + 1}</span><p className="eyebrow">YOUR QUEST · {missions[mission].xp} XP</p><h2>{missions[mission].title}</h2><p>{missions[mission].prompt}</p><button className="hint-button" onClick={() => setFeedback(`Hint: ${missions[mission].hint}`)}>Show hint</button><div className="coach"><b>Coach feedback</b><p aria-live="polite">{feedback}</p></div></div><div className="editor"><div className="editor-top">mission.py <span>SAFE PRACTICE</span></div><textarea value={code} onChange={(event) => { setCode(event.target.value); if (worldState !== "ready") { setWorldState("ready"); setWorldCommands([{ type: "reset" }]); } }} aria-label="Python answer" spellCheck={false} placeholder="# Type your answer here"/><div className="editor-actions"><button className="primary" onClick={checkCode}>Run mission ▶</button><button className="reset-code" onClick={() => { setCode(""); setWorldState("ready"); setWorldCommands([{ type: "reset" }]); setFeedback("World reset. Try a fresh idea."); }}>Reset code</button></div></div></div>}<div className="lesson-nav"><button className="secondary" disabled={mission === 0} onClick={() => chooseMission(mission - 1)}>← Previous</button><button className="primary" disabled={mission === missions.length - 1} onClick={() => chooseMission(mission + 1)}>Next lesson →</button></div></section>}

    {view === "ai" && <section className="workspace"><p className="eyebrow">PATH 02 · AI JUDGMENT</p><h1>AI is a tool,<br/><em>not a truth machine.</em></h1><p className="lead">Learn one rule, make one decision and earn 75 XP for each completed check.</p><div className="lesson-grid">{aiLessons.map((item, index) => <article key={item.title} className={aiComplete.includes(index) ? "lesson-complete" : ""}><span>{aiComplete.includes(index) ? "✓" : item.icon}</span><h2>{item.title}</h2><p>{item.text}</p><fieldset><legend>{item.question}</legend>{item.options.map((option, optionIndex) => <label key={option}><input type="radio" name={`ai-${index}`} checked={aiAnswers[index] === optionIndex} onChange={() => setAiAnswers((items) => ({ ...items, [index]: optionIndex }))}/>{option}</label>)}</fieldset><button className="secondary" onClick={() => checkAiLesson(index)}>Check answer</button><p className="answer-feedback" aria-live="polite">{aiFeedback[index]}</p></article>)}</div><div className="reality-check"><b>THE FORGE CHECK</b><h2>Before you trust an AI answer…</h2><ul><li>Can you explain it in your own words?</li><li>Can you check it with a book, teacher, experiment or trusted source?</li><li>Did you keep personal information out of the conversation?</li><li>Would a trusted adult want to know about this topic?</li></ul><button className="primary" onClick={() => setView("blueprint")}>Build with these rules →</button></div></section>}

    {view === "blueprint" && <section className="workspace"><p className="eyebrow">BUILD LAB · ASSISTANT BLUEPRINT</p><h1>Write the rules.<br/><em>Stay in charge.</em></h1><p className="lead">Design instructions without sharing names, passwords, school details, health information or private stories.</p><div className="builder"><form onSubmit={(event) => event.preventDefault()}><label>1. What kind of helper is it?<input maxLength={80} value={role} onChange={(event) => setRole(event.target.value)} /></label><label>2. What should it help you do?<textarea maxLength={140} value={goal} onChange={(event) => setGoal(event.target.value)} /></label><label>3. What rules must it follow?<textarea maxLength={180} value={rules} onChange={(event) => setRules(event.target.value)} /></label><p className="form-tip">Try rules such as “give hints, not answers,” “say when you are unsure” and “ask an adult for serious topics.”</p></form><div className="blueprint"><div className="blueprint-top"><b>MY ASSISTANT BLUEPRINT</b><span>LOCAL ONLY</span></div><pre>{blueprint}</pre><button className="primary" onClick={copyBlueprint}>{saved ? "Copied!" : "Copy blueprint"}</button><small>Paste this only into a parent- or teacher-approved AI tool.</small></div></div></section>}

    {view === "portfolio" && <section className="workspace"><p className="eyebrow">MY LOCAL PROGRESS</p><h1>{xp} XP earned.</h1><p className="lead">This record lives only in this browser. Export a copy to show a parent or teacher.</p><div className="summary-cards"><div><b>{complete.length}/{missions.length}</b><span>Python quests</span></div><div><b>{aiComplete.length}/{aiLessons.length}</b><span>AI lessons</span></div><div><b>{Object.values(attempts).reduce((sum, value) => sum + value, 0)}</b><span>Code attempts</span></div></div><div className="lesson-grid">{missions.map((item, i) => <article key={item.title}><span>{complete.includes(i) ? "✓" : String(i + 1).padStart(2, "0")}</span><h2>{item.title}</h2><p>{complete.includes(i) ? `${item.skill} completed after ${attempts[i] || 1} check(s).` : `${item.skill} is ready when you are.`}</p><button className="secondary" onClick={() => { chooseMission(i); setView("code"); }}>{complete.includes(i) ? "Practice again" : "Start lesson"}</button></article>)}</div><div className="actions"><button className="primary" onClick={exportPortfolio}>Export my progress</button><button className="secondary" onClick={resetProgress}>Reset local progress</button></div></section>}
    <footer><b>FORGE</b><p>Made for curious builders. AI can make mistakes—check important answers with a trusted person or source.</p></footer>
  </main>;
}

"use client";

import { useEffect, useMemo, useState } from "react";

type View = "launch" | "code" | "ai" | "blueprint";
type Mission = { title: string; skill: string; prompt: string; answer: string; hint: string; why: string };

const missions: Mission[] = [
  { title: "Name Your Bot", skill: "Variables", prompt: "Save the name Pixel in a variable called bot_name.", answer: 'bot_name = "Pixel"', hint: "Text goes inside quotation marks.", why: "Variables give programs a place to remember information." },
  { title: "Mood Check", skill: "Decisions", prompt: "Start an if statement that checks whether energy is greater than 5.", answer: "if energy > 5:", hint: "Use > and finish with a colon.", why: "Decisions help a program choose what to do next." },
  { title: "Three Cheers", skill: "Loops", prompt: "Start a loop that repeats three times.", answer: "for i in range(3):", hint: "Try range(3) inside a for loop.", why: "Loops repeat useful work without copying code." },
  { title: "Helpful Function", skill: "Functions", prompt: "Define a function named give_hint with no inputs.", answer: "def give_hint():", hint: "Start with def, add (), and finish with a colon.", why: "Functions package an idea so you can reuse it." },
];

const aiLessons = [
  { icon: "01", title: "Give it a role", text: "Tell the assistant what kind of helper it should be and who it is helping." },
  { icon: "02", title: "Add useful context", text: "Share the goal and learning level, but leave out names, school details, passwords, and private information." },
  { icon: "03", title: "Set boundaries", text: "Say what the assistant may do, what it must not do, and when it should ask an adult." },
  { icon: "04", title: "Test the answer", text: "AI can be confidently wrong. Check facts, run safe examples, and ask: does this make sense?" },
];

export default function Home() {
  const [view, setView] = useState<View>("launch");
  const [mission, setMission] = useState(0);
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState("Try it yourself first. A hint is ready if you need it.");
  const [complete, setComplete] = useState<number[]>([]);
  const [role, setRole] = useState("friendly study coach");
  const [goal, setGoal] = useState("help me understand a hard homework idea");
  const [rules, setRules] = useState("Give one hint at a time. Do not give the final answer.");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const value = JSON.parse(localStorage.getItem("forge-learning-v2") || "{}");
      if (Array.isArray(value.complete)) setComplete(value.complete.filter((n: unknown) => Number.isInteger(n) && Number(n) < missions.length));
      if (typeof value.role === "string") setRole(value.role.slice(0, 80));
      if (typeof value.goal === "string") setGoal(value.goal.slice(0, 140));
      if (typeof value.rules === "string") setRules(value.rules.slice(0, 180));
    } catch { /* Damaged local progress starts fresh. */ }
  }, []);

  useEffect(() => {
    localStorage.setItem("forge-learning-v2", JSON.stringify({ complete, role, goal, rules }));
  }, [complete, role, goal, rules]);

  const blueprint = useMemo(() => `You are a ${role || "helpful coach"}.\n\nYour job: ${goal || "help me learn"}.\n\nRules: ${rules || "Explain your thinking and keep me safe."}\n\nBefore answering, ask what I have already tried. Use middle-school-friendly language. Never ask for private information. If the topic could be unsafe or serious, tell me to ask a trusted adult. Remind me to check important facts because AI can be wrong.`, [role, goal, rules]);

  const checkCode = () => {
    const clean = (value: string) => value.replace(/\s+/g, " ").trim().toLowerCase();
    if (clean(code) === clean(missions[mission].answer)) {
      setComplete((items) => items.includes(mission) ? items : [...items, mission]);
      setFeedback(`You forged it! ${missions[mission].why}`);
    } else setFeedback(`Good attempt. Hint: ${missions[mission].hint}`);
  };

  return <main>
    <header className="topbar">
      <button className="brand" onClick={() => setView("launch")}><span>F</span> FORGE <small>BUILD YOUR BRAIN</small></button>
      <nav aria-label="Main navigation">
        <button className={view === "code" ? "active" : ""} onClick={() => setView("code")}>Code quests</button>
        <button className={view === "ai" ? "active" : ""} onClick={() => setView("ai")}>AI basics</button>
        <button className={view === "blueprint" ? "active" : ""} onClick={() => setView("blueprint")}>Assistant builder</button>
      </nav>
      <div className="progress" aria-label={`${complete.length} of ${missions.length} code quests complete`}><b>{complete.length}/{missions.length}</b><span>quests</span></div>
    </header>

    {view === "launch" && <section className="hero-shell">
      <div className="hero-copy">
        <p className="eyebrow">A CREATIVE TECH LAB FOR AGES 11–14</p>
        <h1>Don’t just use tech.<br/><em>Teach it what to do.</em></h1>
        <p className="lead">Learn Python, understand how AI helpers work, and design an assistant that helps without taking over your thinking.</p>
        <div className="actions"><button className="primary" onClick={() => setView("code")}>Start a code quest →</button><button className="secondary" onClick={() => setView("blueprint")}>Build an AI helper</button></div>
        <p className="privacy-note">● No account. No public chat. Your progress stays on this device.</p>
      </div>
      <aside className="console-card">
        <div className="console-top"><span/><span/><span/><b>forge_lab.py</b></div>
        <pre><code><i># You are the builder.</i>{"\n"}<strong>idea</strong> = <q>"homework coach"</q>{"\n"}<strong>rules</strong> = [<q>"give hints"</q>,{"\n"}         <q>"protect privacy"</q>]{"\n\n"}<strong>if</strong> answer_looks_wrong:{"\n"}    check_it_again()</code></pre>
        <div className="console-status"><span>READY TO BUILD</span><b>● SAFE MODE ON</b></div>
      </aside>
      <div className="path-grid">
        <button className="path coral" onClick={() => setView("code")}><span>PATH 01</span><h2>Speak Python</h2><p>Four tiny quests. Real code. Helpful feedback.</p><b>Begin →</b></button>
        <button className="path blue" onClick={() => setView("ai")}><span>PATH 02</span><h2>Think like an AI designer</h2><p>Roles, context, boundaries, privacy, and testing.</p><b>Explore →</b></button>
        <button className="path yellow" onClick={() => setView("blueprint")}><span>BUILD LAB</span><h2>Blueprint your assistant</h2><p>Turn an idea into a safe, testable set of instructions.</p><b>Design →</b></button>
      </div>
    </section>}

    {view === "code" && <section className="workspace">
      <p className="eyebrow">PATH 01 · PYTHON FOUNDATIONS</p><h1>Small code. Big ideas.</h1>
      <p className="lead">Nothing runs here. Compare your answer safely, learn the pattern, then try it in a teacher-approved Python tool.</p>
      <div className="tabs">{missions.map((item, i) => <button key={item.title} className={mission === i ? "selected" : ""} onClick={() => { setMission(i); setCode(""); setFeedback("Try it yourself first. A hint is ready if you need it."); }}><small>{complete.includes(i) ? "✓ COMPLETE" : item.skill}</small>{item.title}</button>)}</div>
      <div className="lab"><div className="brief"><span className="number">0{mission + 1}</span><p className="eyebrow">YOUR QUEST</p><h2>{missions[mission].title}</h2><p>{missions[mission].prompt}</p><div className="coach"><b>Coach feedback</b><p aria-live="polite">{feedback}</p></div></div><div className="editor"><div className="editor-top">mission.py <span>SAFE PRACTICE</span></div><textarea value={code} onChange={e => setCode(e.target.value)} aria-label="Python answer" spellCheck={false} placeholder="# Type your answer here"/><button className="primary" onClick={checkCode}>Check my idea</button></div></div>
    </section>}

    {view === "ai" && <section className="workspace">
      <p className="eyebrow">PATH 02 · AI BASICS</p><h1>AI is a tool,<br/><em>not a truth machine.</em></h1><p className="lead">A useful assistant needs clear instructions—and a careful human who checks its work.</p>
      <div className="lesson-grid">{aiLessons.map(item => <article key={item.title}><span>{item.icon}</span><h2>{item.title}</h2><p>{item.text}</p></article>)}</div>
      <div className="reality-check"><b>THE FORGE CHECK</b><h2>Before you trust an AI answer…</h2><ul><li>Can you explain it in your own words?</li><li>Can you check it with a book, teacher, experiment, or trusted source?</li><li>Did you keep personal information out of the conversation?</li><li>Would a trusted adult want to know about this topic?</li></ul><button className="primary" onClick={() => setView("blueprint")}>Build with these rules →</button></div>
    </section>}

    {view === "blueprint" && <section className="workspace">
      <p className="eyebrow">BUILD LAB · ASSISTANT BLUEPRINT</p><h1>Write the rules.<br/><em>Stay in charge.</em></h1><p className="lead">You are designing instructions—not chatting with a live AI. Keep names, passwords, school details, health information, and private stories out.</p>
      <div className="builder"><form onSubmit={e => e.preventDefault()}><label>1. What kind of helper is it?<input maxLength={80} value={role} onChange={e => setRole(e.target.value)} /></label><label>2. What should it help you do?<textarea maxLength={140} value={goal} onChange={e => setGoal(e.target.value)} /></label><label>3. What rules must it follow?<textarea maxLength={180} value={rules} onChange={e => setRules(e.target.value)} /></label><p className="form-tip">Try rules like “give hints, not answers,” “say when you are unsure,” and “ask an adult for serious topics.”</p></form><div className="blueprint"><div className="blueprint-top"><b>MY ASSISTANT BLUEPRINT</b><span>LOCAL ONLY</span></div><pre>{blueprint}</pre><button className="primary" onClick={async () => { try { await navigator.clipboard.writeText(blueprint); setSaved(true); setTimeout(() => setSaved(false), 1800); } catch { setSaved(false); } }}>{saved ? "Copied!" : "Copy blueprint"}</button><small>Paste this only into a parent- or teacher-approved AI tool.</small></div></div>
    </section>}
    <footer><b>FORGE</b><p>Made for curious builders. AI can make mistakes—check important answers with a trusted person or source.</p></footer>
  </main>;
}

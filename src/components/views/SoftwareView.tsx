"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useUI } from "@/lib/ui";
import { GlassCard } from "@/components/ui/GlassCard";
import { CardHeader, IconCapsule } from "@/components/ui/CardHeader";
import { GlassInput } from "@/components/ui/Field";
import { StatTile } from "@/components/modules/StatTile";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/* ───────────────────────── Engineering Tracks & Curriculum ───────────────────────── */

interface Module {
  name: string;
  icon: string;
  sub: string; // core reference / textbook / toolchain
}

interface Track {
  id: string;
  label: string;
  tag: string;
  modules: Module[];
  highYield: string[];
}

const TRACKS: Track[] = [
  {
    id: "dsa",
    label: "DSA & Algorithmic Rigor",
    tag: "Core Foundations · LeetCode & Comp",
    modules: [
      { name: "Arrays & Dynamic Programming", icon: "Braces", sub: "Tabulation · Memoization · State Space" },
      { name: "Trees, Tries & Graphs", icon: "GitBranch", sub: "BFS / DFS · Dijkstra · A* · Topological Sort" },
      { name: "Heaps & Disjoint Sets", icon: "Boxes", sub: "Union-Find · Min/Max Heaps · Priority Queues" },
      { name: "Bitwise & Math Logic", icon: "Binary", sub: "XOR tricks · Modular Arithmetic · Primes" },
    ],
    highYield: [
      "Monotonic stack & sliding window optimums",
      "Dynamic programming over trees and subsets",
      "Dijkstra vs Bellman-Ford vs Floyd-Warshall",
      "Trie traversal & prefix autocomplete search",
      "KMP & Rabin-Karp string pattern matching",
      "Topological sort & Cycle detection (Kahn's)",
      "Bit manipulation tricks (Kernighan's, lowbit)",
    ],
  },
  {
    id: "systems",
    label: "Systems & Low-Level",
    tag: "OS · Memory · Concurrency · Network",
    modules: [
      { name: "Operating Systems & Kernels", icon: "Cpu", sub: "OSTEP · Virtual Memory · Page Tables · Syscalls" },
      { name: "Concurrency & Multi-threading", icon: "Activity", sub: "Mutexes · Semaphores · Atomics · Lock-Free" },
      { name: "Computer Networking", icon: "Network", sub: "TCP Handshake · UDP · HTTP/3 QUIC · TLS 1.3" },
      { name: "Computer Architecture", icon: "Server", sub: "CS:APP · L1/L2/L3 Caches · SIMD · Branch Pred" },
    ],
    highYield: [
      "Virtual memory, TLB hits & page fault lifecycle",
      "Race conditions, deadlock Coffman conditions & epoll",
      "TCP congestion control (CUBIC, BBR) & sliding window",
      "HTTP/2 multiplexing vs HTTP/3 QUIC stream HOL blocking",
      "Cache line false sharing & MESI cache coherence",
      "Zero-copy I/O (sendfile, io_uring) mechanics",
      "Database WAL (Write-Ahead Logging) & Crash Recovery",
    ],
  },
  {
    id: "sysdesign",
    label: "System Design & Distributed",
    tag: "Scalability · Reliability · Microservices",
    modules: [
      { name: "Storage & DB Engines", icon: "Database", sub: "B-Trees vs LSM-Trees · WAL · Sharding" },
      { name: "Distributed Consensus", icon: "Layers", sub: "Raft · Paxos · Leader Election · Quorum" },
      { name: "Message Queues & Streams", icon: "TrendingUp", sub: "Kafka · RabbitMQ · Partitioning · Compaction" },
      { name: "Caching & Edge Delivery", icon: "Zap", sub: "Redis Cluster · Cache-Aside · CDN Anycast" },
    ],
    highYield: [
      "CAP theorem & PACELC consistency tradeoffs",
      "Consistent hashing with virtual nodes & rebalancing",
      "LSM-tree compaction & Bloom filter query acceleration",
      "Distributed transactions: 2PC vs Saga pattern",
      "Rate limiting algorithms (Token bucket vs Leaky bucket)",
      "Idempotency keys & exactly-once event semantics",
      "Database replication lag & read-your-writes consistency",
    ],
  },
  {
    id: "cloud",
    label: "Cloud & DevOps Architecture",
    tag: "Kubernetes · Containers · Observability",
    modules: [
      { name: "Container Orchestration", icon: "Boxes", sub: "Kubernetes Pods · CNI · Ingress · Sidecars" },
      { name: "CI/CD & GitOps", icon: "GitBranch", sub: "GitHub Actions · ArgoCD · Canary Deployments" },
      { name: "Observability & Telemetry", icon: "LineChart", sub: "OpenTelemetry · Prometheus · Distributed Tracing" },
      { name: "Security & Cryptography", icon: "Lock", sub: "JWT · OAuth2 · mTLS · Zero Trust · KMS" },
    ],
    highYield: [
      "Kubernetes pod lifecycle & graceful drain eviction",
      "Blue/green vs canary deployment traffic splitting",
      "Distributed trace context propagation (W3C traceparent)",
      "Prometheus metrics types: Counter, Gauge, Histogram",
      "OAuth 2.0 PKCE flow & mTLS service mesh verification",
      "Infrastructure as Code drift detection & state locking",
    ],
  },
];

/* ───────────────────────── Reference Data (Big-O, Latency, Rules) ───────────────────────── */

const BIG_O_COMPLEXITIES: { algo: string; time: string; space: string }[] = [
  { algo: "Quicksort", time: "O(n log n)", space: "O(log n)" },
  { algo: "Mergesort", time: "O(n log n)", space: "O(n)" },
  { algo: "Hash Table Search", time: "O(1) avg", space: "O(n)" },
  { algo: "Binary Search Tree", time: "O(log n)", space: "O(n)" },
  { algo: "Dijkstra (Min-Heap)", time: "O((V+E) log V)", space: "O(V)" },
  { algo: "Topological Sort", time: "O(V + E)", space: "O(V)" },
  { algo: "Floyd-Warshall", time: "O(V³)", space: "O(V²)" },
  { algo: "KMP String Search", time: "O(N + M)", space: "O(M)" },
  { algo: "Trie Lookup", time: "O(key length)", space: "O(alphabet × len)" },
  { algo: "Disjoint Set (Union-Find)", time: "O(α(N)) amortized", space: "O(N)" },
];

const LATENCY_NUMBERS: { k: string; v: string }[] = [
  { k: "L1 cache reference", v: "0.5 ns" },
  { k: "Branch mispredict", v: "5 ns" },
  { k: "L2 cache reference", v: "7 ns" },
  { k: "Mutex lock/unlock", v: "25 ns" },
  { k: "Main memory (RAM)", v: "100 ns" },
  { k: "SSD random read", v: "16 µs" },
  { k: "Sequential 1MB memory read", v: "250 µs" },
  { k: "Datacenter roundtrip", v: "500 µs" },
  { k: "Disk seek (spinning)", v: "4 ms" },
  { k: "Packet: CA to Netherlands", v: "150 ms" },
];

const ENGINEERING_FORMULAS: { k: string; v: string }[] = [
  { k: "Little's Law", v: "L = λ × W (Concurrency = Throughput × Latency)" },
  { k: "Amdahl's Law", v: "Speedup = 1 / ((1 - P) + P/S)" },
  { k: "Bandwidth-Delay (BDP)", v: "Capacity = Bandwidth (bps) × RTT (sec)" },
  { k: "Availability (99.9%)", v: "Three 9s = 8h 45m downtime/year" },
  { k: "Availability (99.99%)", v: "Four 9s = 52.6m downtime/year" },
  { k: "Availability (99.999%)", v: "Five 9s = 5m 15s downtime/year" },
  { k: "Raft Quorum", v: "Q = ⌊N / 2⌋ + 1 (tolerates ⌊(N-1)/2⌋ faults)" },
  { k: "Bloom Filter False Positive", v: "p ≈ (1 - e^(-kn/m))^k" },
];

const DESIGN_HEURISTICS: { topic: string; m: string }[] = [
  { topic: "SOLID Architecture", m: "Single Responsibility · Open/Closed · Liskov Sub · Interface Seg · Dependency Inversion" },
  { topic: "CAP Theorem", m: "Consistency, Availability, Partition Tolerance — Pick 2 under network split" },
  { topic: "ACID vs BASE", m: "Atomicity, Consistency, Isolation, Durability vs Basically Available, Soft state, Eventual consistency" },
  { topic: "12-Factor App Core", m: "Codebase, Dependencies, Config in Env, Backing Services, Build-Release-Run, Stateless Processes" },
  { topic: "Cache Invalidation", m: "Cache-Aside, Read-Through, Write-Through, Write-Behind (Write-Back), Refresh-Ahead" },
  { topic: "Reliability Patterns", m: "Circuit Breaker, Bulkhead, Retry with Exponential Backoff + Full Jitter, Fallback" },
];

const DEV_RESOURCES: { label: string; url: string; icon: string }[] = [
  { label: "GitHub", url: "https://github.com", icon: "GitBranch" },
  { label: "Hacker News", url: "https://news.ycombinator.com", icon: "TrendingUp" },
  { label: "LeetCode", url: "https://leetcode.com", icon: "Code2" },
  { label: "roadmap.sh", url: "https://roadmap.sh", icon: "Layers" },
  { label: "MDN Web Docs", url: "https://developer.mozilla.org", icon: "BookOpen" },
  { label: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer", icon: "Server" },
  { label: "DevDocs", url: "https://devdocs.io", icon: "Terminal" },
  { label: "High Scalability", url: "http://highscalability.com", icon: "Database" },
  { label: "Papers We Love", url: "https://paperswelove.org", icon: "FileCode" },
  { label: "Rust Docs", url: "https://doc.rust-lang.org", icon: "Cpu" },
  { label: "Docker Hub", url: "https://hub.docker.com", icon: "Boxes" },
  { label: "RFC Editor", url: "https://www.rfc-editor.org", icon: "ExternalLink" },
];

/* ───────────────────────── Persistent Study Tracker ───────────────────────── */

type Status = 0 | 1 | 2; // to-do · learning · mastered
const PROG_KEY = "nucleus-software-progress-v1";

const STATUS_META = [
  { label: "To-do", icon: "Circle", cls: "border-ink/15 bg-white/40 text-faint" },
  { label: "Studying", icon: "BookOpen", cls: "border-ink/25 bg-white/75 text-strong" },
  { label: "Mastered", icon: "CheckCircle2", cls: "border-transparent bg-ink text-white" },
] as const;

function useProgress() {
  const [map, setMap] = useState<Record<string, Status>>({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROG_KEY);
      if (raw) setMap(JSON.parse(raw));
    } catch {
      /* ignore corrupt state */
    }
  }, []);
  const cycle = (name: string) =>
    setMap((m) => {
      const next = { ...m, [name]: (((m[name] ?? 0) + 1) % 3) as Status };
      try {
        localStorage.setItem(PROG_KEY, JSON.stringify(next));
      } catch {
        /* storage full / unavailable */
      }
      return next;
    });
  return { map, cycle };
}

/* ───────────────────────── View Component ───────────────────────── */

export function SoftwareView() {
  const askAssistant = useUI((s) => s.askAssistant);
  const { map, cycle } = useProgress();
  const [trackId, setTrackId] = useState("dsa");
  const [topic, setTopic] = useState("");

  const track = TRACKS.find((t) => t.id === trackId) || TRACKS[0];

  const allModules = useMemo(
    () => Array.from(new Set(TRACKS.flatMap((t) => t.modules.map((m) => m.name)))),
    [],
  );
  const confident = allModules.filter((n) => map[n] === 2).length;
  const learning = allModules.filter((n) => map[n] === 1).length;
  const todo = allModules.length - confident - learning;
  const pct = allModules.length ? Math.round((confident / allModules.length) * 100) : 0;

  const ask = (template: (t: string) => string) => {
    const t = topic.trim() || track.modules[0]?.name || "a systems engineering topic";
    askAssistant(template(t));
  };

  const TUTOR = [
    {
      label: "Explain Deeply",
      icon: "Sparkles",
      t: (t: string) =>
        `Explain "${t}" with engineering rigor: architectural trade-offs, internal mechanics, memory/concurrency behavior, and real-world production scale pitfalls.`,
    },
    {
      label: "Code & Complexity",
      icon: "Code2",
      t: (t: string) =>
        `Provide a high-performance, production-ready implementation of "${t}" with thorough step-by-step Big-O time and space complexity breakdown.`,
    },
    {
      label: "System Design",
      icon: "Server",
      t: (t: string) =>
        `Design a scalable distributed system around "${t}". Cover data flow, sharding strategy, replication, failure modes, bottleneck mitigation, and latency SLA.`,
    },
    {
      label: "Interview Drill",
      icon: "Terminal",
      t: (t: string) =>
        `Give me 3 rigorous staff-engineer interview questions on "${t}" covering edge cases, race conditions, and disaster recovery scenarios.`,
    },
  ];

  return (
    <div className="space-y-5">
      {/* progress stat tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile iconName="CheckCircle2" label="Mastered" value={confident} delay={0} />
        <StatTile iconName="BookOpen" label="In Progress" value={learning} delay={0.05} />
        <StatTile iconName="ListChecks" label="To Study" value={todo} delay={0.1} />
        <StatTile iconName="TrendingUp" label="Track Mastery" value={pct} suffix="%" delay={0.15} variant="charcoal" />
      </div>

      {/* curriculum + study tracker */}
      <GlassCard depth={2} delay={0.1}>
        <CardHeader
          iconName="Terminal"
          eyebrow="Computer Science & Systems Architecture"
          title="Engineering Tracks & Curriculum"
          right={<span className="hidden text-[11.5px] text-faint sm:block">Click any topic to cycle progress</span>}
        />

        {/* track tabs */}
        <div className="scroll-area -mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
          {TRACKS.map((t) => {
            const on = t.id === trackId;
            return (
              <button
                key={t.id}
                onClick={() => setTrackId(t.id)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition",
                  on ? "border-ink bg-ink text-white" : "border-ink/15 bg-white/40 text-muted hover:bg-white/70",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="mb-3 text-[12px] text-muted">{track.tag}</div>

        {/* modules */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-2">
          {track.modules.map((m) => {
            const status = map[m.name] ?? 0;
            const meta = STATUS_META[status];
            return (
              <button
                key={m.name}
                onClick={() => cycle(m.name)}
                title={`${m.name} — ${meta.label} (tap to change)`}
                className="group flex items-center gap-3 rounded-2xl border border-ink/10 bg-white/40 p-3 text-left transition hover:bg-white/70"
              >
                <IconCapsule name={m.icon} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-medium text-strong">{m.name}</div>
                  <div className="truncate text-[11.5px] text-muted">{m.sub}</div>
                </div>
                <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[10.5px] font-medium transition", meta.cls)}>
                  <Icon name={meta.icon} size={11} />
                  <span className="hidden sm:inline">{meta.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* AI tutor */}
        <GlassCard variant="charcoal" depth={2} delay={0.15}>
          <CardHeader iconName="Sparkles" eyebrow="Powered by Nucleus AI" title="Software Architecture & Coding Tutor" tone="dark" />
          <p className="-mt-1 mb-3 text-[12.5px] text-white/60">
            Type any algorithm, system design challenge, or library — opens instantly in the AI Assistant.
          </p>
          <GlassInput
            tone="dark"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask(TUTOR[0].t)}
            placeholder="e.g. Raft consensus, LSM trees, Red-Black Trees, Kafka partitions…"
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {TUTOR.map((a) => (
              <button
                key={a.label}
                onClick={() => ask(a.t)}
                className="focus-ring flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] font-medium text-white/85 transition hover:bg-white/15"
              >
                <Icon name={a.icon} size={15} /> {a.label}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* high-yield for selected track */}
        <GlassCard depth={2} delay={0.2}>
          <CardHeader
            iconName="Target"
            eyebrow="Must-Know Concepts"
            title={`High-Yield Focus · ${track.label}`}
            right={<span className="text-[12px] text-muted">{track.highYield.length} items</span>}
          />
          <ul className="space-y-2">
            {track.highYield.map((h, i) => (
              <motion.li
                key={h}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className="flex items-start gap-2.5 text-[13.5px] text-body"
              >
                <Icon name="ChevronRight" size={15} className="mt-0.5 shrink-0 text-faint" />
                <span>{h}</span>
              </motion.li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Big-O Complexity Matrix */}
        <GlassCard depth={2} delay={0.15}>
          <CardHeader iconName="Binary" eyebrow="Algorithmic Complexity" title="Big-O Complexity Cheat Sheet" />
          <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
            {BIG_O_COMPLEXITIES.map((l) => (
              <div key={l.algo} className="flex items-baseline justify-between gap-3 border-b border-ink/5 py-1.5">
                <span className="text-[12.5px] text-muted">{l.algo}</span>
                <span className="tabular shrink-0 font-mono text-[12px] font-medium text-strong">
                  {l.time} <span className="text-faint font-normal">| {l.space}</span>
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-faint">Standard time vs auxiliary space complexities for core computer science data structures.</p>
        </GlassCard>

        {/* Latency numbers + Engineering formulas */}
        <div className="space-y-5">
          <GlassCard depth={2} delay={0.2}>
            <CardHeader iconName="Clock" eyebrow="Latency Numbers" title="Numbers Every Programmer Should Know" />
            <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              {LATENCY_NUMBERS.map((v) => (
                <div key={v.k} className="flex items-baseline justify-between gap-3 border-b border-ink/5 py-1.5">
                  <span className="text-[12.5px] text-muted">{v.k}</span>
                  <span className="tabular shrink-0 font-mono text-[12px] font-medium text-strong">{v.v}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard depth={2} delay={0.25}>
            <CardHeader iconName="ClipboardList" eyebrow="Formulas & Rules" title="Systems & Capacity Formulas" />
            <div className="grid grid-cols-1 gap-x-6">
              {ENGINEERING_FORMULAS.map((f) => (
                <div key={f.k} className="flex items-baseline justify-between gap-3 border-b border-ink/5 py-1.5">
                  <span className="shrink-0 text-[12.5px] font-medium text-strong">{f.k}</span>
                  <span className="tabular text-right font-mono text-[11.5px] text-muted">{f.v}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 items-start">
        {/* Architecture & Design Heuristics */}
        <GlassCard depth={2} delay={0.15}>
          <CardHeader iconName="Layers" eyebrow="Architectural Heuristics" title="Core System Design Principles" />
          <div className="space-y-3">
            {DESIGN_HEURISTICS.map((m) => (
              <div key={m.topic} className="rounded-2xl border border-ink/10 bg-white/40 p-3">
                <div className="text-[11px] font-mono uppercase tracking-wide text-faint">{m.topic}</div>
                <div className="mt-0.5 text-[13px] font-medium text-strong">{m.m}</div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Developer Bookmarks */}
        <GlassCard depth={2} delay={0.2}>
          <CardHeader iconName="Code2" eyebrow="Engineering Ecosystem" title="Developer & CS Resources" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {DEV_RESOURCES.map((r) => (
              <a
                key={r.label}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring group flex items-center gap-2 rounded-2xl border border-ink/10 bg-white/40 px-3 py-2.5 text-[12.5px] font-medium text-strong transition hover:bg-white/70"
              >
                <Icon name={r.icon} size={15} className="shrink-0 text-muted" />
                <span className="truncate">{r.label}</span>
                <Icon name="ExternalLink" size={12} className="ml-auto shrink-0 text-faint opacity-0 transition group-hover:opacity-100" />
              </a>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

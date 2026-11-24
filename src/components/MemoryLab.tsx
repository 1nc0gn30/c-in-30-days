import { useState } from 'react';
import { Cpu, RotateCcw, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, Layers } from 'lucide-react';

interface MemorySlot {
  region: 'stack' | 'heap';
  address: string;
  label: string;
  type: string;
  value: string;
  pointsTo?: string;
  freed?: boolean;
  highlighted?: boolean;
}

interface LabStep {
  line: number;
  note: string;
  leakedBytes: number;
  slots: MemorySlot[];
}

interface LabScenario {
  id: string;
  title: string;
  tag: string;
  summary: string;
  code: string[];
  steps: LabStep[];
}

const SCENARIOS: LabScenario[] = [
  {
    id: 'deref',
    title: 'Pointer Dereferencing',
    tag: 'DAY 16 · STACK',
    summary: 'Observe how `&x` captures a stack address and `*p = 99` mutates `x` indirectly.',
    code: [
      'int x = 42;',
      'int *p = &x;',
      '*p = 99;',
      'p = NULL;',
    ],
    steps: [
      {
        line: 0,
        note: 'Allocates 4 bytes on the stack for `x` at 0x7ffd1004 and stores 42.',
        leakedBytes: 0,
        slots: [
          { region: 'stack', address: '0x7ffd1004', label: 'x', type: 'int (4B)', value: '42', highlighted: true },
        ],
      },
      {
        line: 1,
        note: 'Allocates an 8-byte pointer `p` on the stack holding the address of `x` (0x7ffd1004).',
        leakedBytes: 0,
        slots: [
          { region: 'stack', address: '0x7ffd1004', label: 'x', type: 'int (4B)', value: '42' },
          { region: 'stack', address: '0x7ffd0ff8', label: 'p', type: 'int * (8B)', value: '0x7ffd1004', pointsTo: 'x', highlighted: true },
        ],
      },
      {
        line: 2,
        note: 'Dereferencing `*p` follows 0x7ffd1004 and overwrites `x` in place from 42 to 99.',
        leakedBytes: 0,
        slots: [
          { region: 'stack', address: '0x7ffd1004', label: 'x', type: 'int (4B)', value: '99', highlighted: true },
          { region: 'stack', address: '0x7ffd0ff8', label: 'p', type: 'int * (8B)', value: '0x7ffd1004', pointsTo: 'x' },
        ],
      },
      {
        line: 3,
        note: 'Setting `p = NULL` clears the pointer safely without changing `x`.',
        leakedBytes: 0,
        slots: [
          { region: 'stack', address: '0x7ffd1004', label: 'x', type: 'int (4B)', value: '99' },
          { region: 'stack', address: '0x7ffd0ff8', label: 'p', type: 'int * (8B)', value: '0x0 (NULL)', highlighted: true },
        ],
      },
    ],
  },
  {
    id: 'stride',
    title: 'Pointer Arithmetic Stride',
    tag: 'DAY 17 · ARRAYS',
    summary: 'See why `p + 2` advances by `2 * sizeof(int) = 8 bytes`, landing cleanly on `arr[2]`.',
    code: [
      'int arr[3] = {10, 20, 30};',
      'int *p = arr;',
      'int *q = p + 2;',
      '*q = 99;',
    ],
    steps: [
      {
        line: 0,
        note: 'Three contiguous 4-byte ints laid out at 0x7ffd2000, +4, and +8.',
        leakedBytes: 0,
        slots: [
          { region: 'stack', address: '0x7ffd2000', label: 'arr[0]', type: 'int (4B)', value: '10', highlighted: true },
          { region: 'stack', address: '0x7ffd2004', label: 'arr[1]', type: 'int (4B)', value: '20', highlighted: true },
          { region: 'stack', address: '0x7ffd2008', label: 'arr[2]', type: 'int (4B)', value: '30', highlighted: true },
        ],
      },
      {
        line: 1,
        note: '`arr` decays to `&arr[0]` (0x7ffd2000) when assigned to `int *p`.',
        leakedBytes: 0,
        slots: [
          { region: 'stack', address: '0x7ffd2000', label: 'arr[0]', type: 'int (4B)', value: '10' },
          { region: 'stack', address: '0x7ffd2004', label: 'arr[1]', type: 'int (4B)', value: '20' },
          { region: 'stack', address: '0x7ffd2008', label: 'arr[2]', type: 'int (4B)', value: '30' },
          { region: 'stack', address: '0x7ffd1ff8', label: 'p', type: 'int * (8B)', value: '0x7ffd2000', pointsTo: 'arr[0]', highlighted: true },
        ],
      },
      {
        line: 2,
        note: '`p + 2` scales by sizeof(int) = 4: 0x7ffd2000 + 8 = 0x7ffd2008 (arr[2]).',
        leakedBytes: 0,
        slots: [
          { region: 'stack', address: '0x7ffd2000', label: 'arr[0]', type: 'int (4B)', value: '10' },
          { region: 'stack', address: '0x7ffd2004', label: 'arr[1]', type: 'int (4B)', value: '20' },
          { region: 'stack', address: '0x7ffd2008', label: 'arr[2]', type: 'int (4B)', value: '30' },
          { region: 'stack', address: '0x7ffd1ff8', label: 'p', type: 'int * (8B)', value: '0x7ffd2000', pointsTo: 'arr[0]' },
          { region: 'stack', address: '0x7ffd1ff0', label: 'q', type: 'int * (8B)', value: '0x7ffd2008', pointsTo: 'arr[2]', highlighted: true },
        ],
      },
      {
        line: 3,
        note: 'Writing `*q = 99` updates `arr[2]` directly via scaled pointer offset.',
        leakedBytes: 0,
        slots: [
          { region: 'stack', address: '0x7ffd2000', label: 'arr[0]', type: 'int (4B)', value: '10' },
          { region: 'stack', address: '0x7ffd2004', label: 'arr[1]', type: 'int (4B)', value: '20' },
          { region: 'stack', address: '0x7ffd2008', label: 'arr[2]', type: 'int (4B)', value: '99', highlighted: true },
          { region: 'stack', address: '0x7ffd1ff8', label: 'p', type: 'int * (8B)', value: '0x7ffd2000', pointsTo: 'arr[0]' },
          { region: 'stack', address: '0x7ffd1ff0', label: 'q', type: 'int * (8B)', value: '0x7ffd2008', pointsTo: 'arr[2]' },
        ],
      },
    ],
  },
  {
    id: 'heap',
    title: 'Heap Lifecycle & Leak Check',
    tag: 'DAY 19 · MALLOC / FREE',
    summary: 'Track a heap allocation from `malloc` through `free` and dangling-pointer neutralization.',
    code: [
      'int *buf = malloc(2 * sizeof(*buf));',
      'buf[0] = 7; buf[1] = 14;',
      'free(buf);',
      'buf = NULL;',
    ],
    steps: [
      {
        line: 0,
        note: '`malloc` reserves 8 bytes on the heap (0x55a01000). Until `free()` runs, 8 heap bytes are live.',
        leakedBytes: 8,
        slots: [
          { region: 'stack', address: '0x7ffd3000', label: 'buf', type: 'int * (8B)', value: '0x55a01000', pointsTo: 'heap[0..1]', highlighted: true },
          { region: 'heap', address: '0x55a01000', label: 'buf[0]', type: 'int (4B)', value: 'uninit', highlighted: true },
          { region: 'heap', address: '0x55a01004', label: 'buf[1]', type: 'int (4B)', value: 'uninit', highlighted: true },
        ],
      },
      {
        line: 1,
        note: 'Initializes both heap slots. Always initialize memory from `malloc` (or use `calloc`).',
        leakedBytes: 8,
        slots: [
          { region: 'stack', address: '0x7ffd3000', label: 'buf', type: 'int * (8B)', value: '0x55a01000', pointsTo: 'heap[0..1]' },
          { region: 'heap', address: '0x55a01000', label: 'buf[0]', type: 'int (4B)', value: '7', highlighted: true },
          { region: 'heap', address: '0x55a01004', label: 'buf[1]', type: 'int (4B)', value: '14', highlighted: true },
        ],
      },
      {
        line: 2,
        note: '`free(buf)` returns 8 bytes to the allocator. Note `buf` is now a dangling pointer until nulled!',
        leakedBytes: 0,
        slots: [
          { region: 'stack', address: '0x7ffd3000', label: 'buf', type: 'int * (dangling)', value: '0x55a01000', highlighted: true },
          { region: 'heap', address: '0x55a01000', label: 'buf[0]', type: 'freed', value: '—', freed: true },
          { region: 'heap', address: '0x55a01004', label: 'buf[1]', type: 'freed', value: '—', freed: true },
        ],
      },
      {
        line: 3,
        note: 'Assigning `buf = NULL` eliminates use-after-free and double-free hazards. 0 bytes leaked.',
        leakedBytes: 0,
        slots: [
          { region: 'stack', address: '0x7ffd3000', label: 'buf', type: 'int * (8B)', value: '0x0 (NULL)', highlighted: true },
          { region: 'heap', address: '0x55a01000', label: 'buf[0]', type: 'freed', value: '—', freed: true },
          { region: 'heap', address: '0x55a01004', label: 'buf[1]', type: 'freed', value: '—', freed: true },
        ],
      },
    ],
  },
];

function renderInlineCode(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, idx) =>
    part.startsWith('`') && part.endsWith('`') ? (
      <code
        key={idx}
        className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[0.9em]"
      >
        {part.slice(1, -1)}
      </code>
    ) : (
      <span key={idx}>{part}</span>
    )
  );
}

export function MemoryLab() {
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id);
  const [stepIndex, setStepIndex] = useState<number>(0);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[0];
  const currentStep = scenario.steps[stepIndex] || scenario.steps[0];
  const stackSlots = currentStep.slots.filter((s) => s.region === 'stack');
  const heapSlots = currentStep.slots.filter((s) => s.region === 'heap');

  const selectScenario = (id: string) => {
    setScenarioId(id);
    setStepIndex(0);
  };

  return (
    <section aria-label="Interactive C11 Memory and Pointer Lab" className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 flex items-center gap-2 mb-1.5">
              <Cpu className="w-4 h-4" /> Interactive Memory Lab
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Step Through Stack, Heap & Pointer Addresses
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Inspect exact byte offsets, pointer targets, and heap release state line-by-line in LP64 memory layout.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold border ${
                currentStep.leakedBytes > 0
                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {currentStep.leakedBytes > 0 ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  {currentStep.leakedBytes}B live on heap
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  0B leaked
                </>
              )}
            </span>
          </div>
        </div>

        {/* Scenario Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          {SCENARIOS.map((item) => {
            const active = item.id === scenario.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectScenario(item.id)}
                className={`text-left p-4 rounded-xl border transition-all min-h-[44px] ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-amber-400 hover:bg-white'
                }`}
              >
                <div className={`font-mono text-[11px] uppercase tracking-wider mb-1 ${active ? 'text-amber-400' : 'text-slate-500'}`}>
                  {item.tag}
                </div>
                <div className="font-semibold text-sm">{item.title}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Lab Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Code Trace + Stepper */}
        <div className="lg:col-span-5 bg-[#0B1120] text-slate-100 rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
            <span className="font-mono text-xs text-slate-400 uppercase tracking-wider">
              Trace · Step {stepIndex + 1} / {scenario.steps.length}
            </span>
            <button
              type="button"
              onClick={() => setStepIndex(0)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 min-h-[36px]"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          <div className="p-4 font-mono text-xs sm:text-sm space-y-1.5 flex-1">
            {scenario.code.map((lineText, idx) => {
              const isCurrent = idx === currentStep.line;
              const isExecuted = idx < currentStep.line;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setStepIndex(idx)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors min-h-[44px] ${
                    isCurrent
                      ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                      : isExecuted
                      ? 'text-slate-400 hover:bg-slate-800/60'
                      : 'text-slate-500 hover:bg-slate-800/60'
                  }`}
                >
                  <span className={`w-5 text-right select-none ${isCurrent ? 'text-amber-400 font-bold' : 'text-slate-600'}`}>
                    {idx + 1}
                  </span>
                  <code className="break-all">{lineText}</code>
                </button>
              );
            })}
          </div>

          <div className="px-5 py-4 bg-slate-900/90 border-t border-slate-800">
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-4">
              {renderInlineCode(currentStep.note)}
            </p>
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                disabled={stepIndex === 0}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-sm font-medium text-white min-h-[44px]"
              >
                <ChevronLeft className="w-4 h-4" /> Prev Step
              </button>
              <button
                type="button"
                onClick={() => setStepIndex((i) => Math.min(scenario.steps.length - 1, i + 1))}
                disabled={stepIndex === scenario.steps.length - 1}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-sm font-semibold text-white min-h-[44px]"
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Stack & Heap Frames */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600" /> Stack Frame (main)
              </h3>
              <span className="font-mono text-[11px] text-slate-400">High → Low Addresses</span>
            </div>
            <div className="space-y-2">
              {stackSlots.map((slot) => (
                <div
                  key={`${slot.address}-${slot.label}`}
                  className={`grid grid-cols-12 items-center gap-2 px-3.5 py-2.5 rounded-xl border font-mono text-xs transition-all ${
                    slot.highlighted
                      ? 'bg-amber-50 border-amber-300 text-slate-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="col-span-4 sm:col-span-3 text-slate-500 truncate">{slot.address}</span>
                  <span className="col-span-3 sm:col-span-3 font-bold text-slate-900 truncate">{slot.label}</span>
                  <span className="hidden sm:block sm:col-span-3 text-slate-500 truncate">{slot.type}</span>
                  <span className="col-span-5 sm:col-span-3 text-right font-semibold text-amber-800 truncate">
                    {slot.value}
                    {slot.pointsTo ? ` → ${slot.pointsTo}` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" /> Dynamic Heap (malloc / free)
              </h3>
              <span className="font-mono text-[11px] text-slate-400">Manual Ownership</span>
            </div>
            {heapSlots.length === 0 ? (
              <div className="px-4 py-6 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500 font-mono">
                No heap allocations active in this scenario.
              </div>
            ) : (
              <div className="space-y-2">
                {heapSlots.map((slot) => (
                  <div
                    key={`${slot.address}-${slot.label}`}
                    className={`grid grid-cols-12 items-center gap-2 px-3.5 py-2.5 rounded-xl border font-mono text-xs transition-all ${
                      slot.freed
                        ? 'bg-slate-100 border-slate-200 text-slate-400 line-through'
                        : slot.highlighted
                        ? 'bg-emerald-50 border-emerald-300 text-slate-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="col-span-4 sm:col-span-3 text-slate-500 truncate">{slot.address}</span>
                    <span className="col-span-3 sm:col-span-3 font-bold truncate">{slot.label}</span>
                    <span className="hidden sm:block sm:col-span-3 text-slate-500 truncate">{slot.type}</span>
                    <span className="col-span-5 sm:col-span-3 text-right font-semibold truncate">{slot.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
